function DistanceConstraint(bodyA, bodyB, length, stiffness) {
  Constraint.call(this, bodyA, bodyB, length, stiffness);
  this.initialiseConstraint();
}

Common.extend(DistanceConstraint, Constraint);

//TODO: Angular response and error correction (baumgarte and/or slop).

/**
 * Applies impules the constrained bodies to satisfy contraint conditions.
 * This is called automatically for each contraint by the Physics class
 *
 * @param  {type} engine The engine the constraint belongs to, passed automatically
 */
DistanceConstraint.prototype.maintainConstraint = function(engine) {
  var impulse;
  // get the vector between the two bodies
  var distBA = this.bodyB.center.subtract(this.bodyA.center);
  // find the length of the vector between B and A
  var lengthBA = distBA.length();

  // find the difference between the length and the contraint length.
  // improvements taken from Advanced Character Physics by Thomas Jakobsen
  // where the difference is divided by the length to make the impulse less drastic
  var diff = (lengthBA - this.length) / lengthBA;

  if (lengthBA < this.minLength) {
    lengthBA = this.minLength;
  }
  // calculate the impulse, the difference (amount to correct)
  // scaled in the correct direction
  impulse = distBA.scale(0.5 * diff);
  // apply the impulses to the bodies
  this.bodyA.velocity = this.bodyA.velocity.add(impulse.scale(this.bodyA.invMass * this.stiffness * 0.895));
  this.bodyB.velocity = this.bodyB.velocity.subtract(impulse.scale(this.bodyB.invMass * this.stiffness * 0.895));
};

/**
 * Moves the constrained bodies so that they satisfy the constraint upon instantiation.
 * This is a naive "warm start" implementation without which, the corrective impulses
 * of a badly set up constraint would cause explosive jittering.
 * Called by the Constraint's constructor.
 */
DistanceConstraint.prototype.initialiseConstraint = function() {
  var distBA = this.bodyB.center.subtract(this.bodyA.center);
  var lengthBA = distBA.length();
  var relDist = lengthBA - this.length;

  var constraintNormal = distBA.scale(1 / lengthBA);

  if (relDist > 0 || relDist < 0) {
    if (this.bodyB.invMass == 0) {
      this.bodyA.move(constraintNormal.scale(relDist));
    } else if (this.bodyA.invMass == 0) {
      this.bodyB.move(constraintNormal.scale(relDist));
    } else {
      this.bodyA.move(constraintNormal.scale(relDist / 2));

      this.bodyB.move(constraintNormal.scale(-relDist / 2));
    }
  }
};
