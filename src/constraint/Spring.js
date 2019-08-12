function Spring(bodyA, bodyB, length, stiffness, options) {
  Constraint.call(this, bodyA, bodyB, length, stiffness);
  this.restingAngleA = this.bodyA.angle;
  this.restingAngleB = this.bodyB.angle;
  this.centerA = this.bodyA.center;
  this.dampingConstant = 0.0025;
  if (options) {
    if (options.damping) {
      this.dampingConstant = options.dampingConstant;
    }
  }
}

Common.extend(Spring, Constraint);

Spring.prototype.maintainConstraint = function(engine) {
  var relVelAlongDamper, springForce, damperForce, springImpulse;
  var distBA = this.bodyB.center.subtract(this.bodyA.center);
  var lengthBA = distBA.length();
  var vectorFromBtoA = distBA.scale(1 / lengthBA);
  var relDist = lengthBA - this.length;

  var reducedMass = 1 / (1 / this.bodyA.invMass + 1 / this.bodyB.invMass);

  var reducedInertia, angleImpulseA, angleImpulseB;

  //Calculate positional impulses

  //Relative velocity along the damper
  relVelAlongDamper = this.bodyB.velocity
    .subtract(this.bodyA.velocity)
    .dot(vectorFromBtoA);

  //Relative velocity of bodies scaled in direction of B to A
  springForce = vectorFromBtoA.dot(
    Vec2(this.stiffness * relDist, this.stiffness * relDist)
  );

  //Apply damper to damper velocity
  damperForce = relVelAlongDamper * this.dampingConstant;

  //Spring force to be applied, scaled in direction of B to A
  springImpulse = vectorFromBtoA.scale(springForce + damperForce);

  //Calculate rotational impulses
  reducedInertia =
    (this.bodyA.inertia * this.bodyB.inertia) /
    (this.bodyA.inertia + this.bodyB.inertia);

  angleImpulseA =
    -(reducedInertia / engine.updateIntervalInSeconds) *
      (this.stiffness * this.restingAngleA * 20) -
    0.5 * this.bodyA.angle;

  angleImpulseB =
    -(reducedInertia / engine.updateIntervalInSeconds) *
      (this.stiffness * this.restingAngleB * 20) -
    0.5 * this.bodyB.angle;

  //Apply positional impulses
  this.bodyA.velocity = this.bodyA.velocity.add(
    springImpulse.scale(this.bodyA.invMass)
  );
  this.bodyB.velocity = this.bodyB.velocity.subtract(
    springImpulse.scale(this.bodyB.invMass)
  );

  //Apply rotational impulses
  this.bodyA.angularVelocity += angleImpulseA;
  this.bodyB.angularVelocity += angleImpulseB;

  this.bodyA.velocity.x += this.centerA.x - this.bodyA.center.x;
};
