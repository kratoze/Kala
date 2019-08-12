function Constraint(bodyA, bodyB, length) {
  this.cBodyA = bodyA;
  this.cBodyB = bodyB;
  this.cLength = length;
}

Constraint.prototype.applyImpulse = function(vec) {
  this.cBodyA.velocity = this.cBodyA.velocity.add(
    vec.scale(this.cBodyA.invMass)
  );
  this.cBodyB.velocity = this.cBodyB.velocity.subtract(
    vec.scale(this.cBodyB.invMass)
  );
};

Constraint.prototype.maintainConstraint = function(dt) {
  var axis = this.cBodyB.center.subtract(this.cBodyA.center);
  var currentDistance = axis.length();
  var unitAxis = axis.scale(1 / currentDistance);

  var relVel = this.cBodyB.velocity
    .subtract(this.cBodyA.velocity)
    .dot(unitAxis);

  var relDist = currentDistance - this.length;

  var remove = relVel + relDist / dt;
  var impulse = remove / (this.cBodyA.invMass + this.cBodyB.invMass);

  // calculate relative velocity in the axis, we want to remove this

  //const relDist:Number = currentDistance-m_distance;

  // calculate impulse to solve

  var I = unitAxis.scale(impulse);

  //this.applyImpulse(I);
};
