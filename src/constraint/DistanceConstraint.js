function DistanceConstraint(bodyA, bodyB, length, stiffness) {
  Constraint.call(this, bodyA, bodyB, length, stiffness);
  this.minLength = 0.005;
  this.previousRelDist =
    this.bodyB.center.subtract(this.bodyA.center).length() - this.length;

  this.reducedMass = 1 / (1 / this.bodyA.invMass + 1 / this.bodyB.invMass);
  if (!this.bodyB.invMass === 0 || this.bodyA.invMass === 0) {
    console.log(this.bodyA.invMass);
    this.bodyA.invMass = this.reducedMass;
    this.bodyB.invMass = this.reducedMass;
  }

  this.initialiseConstraint();
}

Common.extend(DistanceConstraint, Constraint);

DistanceConstraint.prototype.maintainConstraint = function(engine) {
  var distBA = this.bodyB.center.subtract(this.bodyA.center);
  var lengthBA = distBA.length();
  var vectorFromBtoA = distBA.scale(1 / lengthBA);
  var relDist = lengthBA - this.length;

  var impulse;

  var biasFactor = 0.1;
  var slop = 0.8;
  var slopPenetration = Math.min(relDist + slop, 0);
  var baumgarte =
    -(biasFactor / engine.updateIntervalInSeconds) * slopPenetration;

  if (lengthBA < slop) {
    distBA = distBA - slop;
  }

  var constraintNormal = distBA.scale(1 / lengthBA);

  impulse = constraintNormal.scale(
    relDist + baumgarte * engine.updateIntervalInSeconds
  );

  this.previousRelDist = relDist;
  this.bodyA.velocity = this.bodyA.velocity.add(
    impulse.scale(this.bodyA.invMass * this.stiffness)
  );
  this.bodyB.velocity = this.bodyB.velocity.subtract(
    impulse.scale(this.bodyB.invMass * this.stiffness)
  );

  if (constraintNormal.y > 0) {
    //constraintNormal.scale(-1);
  } else if (true) {
  }

  var angularImpulseA =
    Vec2(0, 0).angleFromVector(constraintNormal) - this.bodyA.angle;
  var angularImpulseB =
    Vec2(0, 0).angleFromVector(constraintNormal) - this.bodyB.angle;
  // if (this.bodyA.angle < -Math.PI) {
  //   //angularImpulseA = Math.PI;
  //   //this.bodyA.rotate(Math.PI);
  // } else if (this.bodyA.angle > Math.PI) {
  //   //this.bodyA.rotate(-Math.PI);
  //   Vec2().length()
  // }

  //angularImpulseA = this.bodyB.center.cross(impulse) / 10;

  this.bodyA.angularVelocity += angularImpulseA * this.bodyA.inertia;
  this.bodyB.angularVelocity -= angularImpulseB * this.bodyB.inertia;
  if (this.bodyA.angle < -Math.PI) {
    //this.bodyA.rotate(Math.PI);
  } else if (this.bodyA.angle > Math.PI) {
    //this.bodyA.rotate(-Math.PI);
  }
};

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
