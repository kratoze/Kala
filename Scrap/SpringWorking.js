function Spring(bodyA, bodyB, length, stiffness) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.length = length;
  this.stiffness = stiffness;
}

Spring.prototype.maintainSpring = function() {
  var dampingConstant = 0.2;
  var springForce = Vec2(0, 0);

  var distBA = this.bodyB.center.subtract(this.bodyA.center);
  var lengthBA = this.bodyB.center.subtract(this.bodyA.center).length();
  var vectorFromAtoB = distBA.scale(1 / lengthBA);

  var relDist = lengthBA - this.length;

  var relVelAlongDamper = this.bodyB.velocity.subtract(this.bodyA.velocity);

  var firstArg = vectorFromAtoB.scale(this.stiffness * relDist);

  var secondArg = vectorFromAtoB.scale(dampingConstant);

  springForce = firstArg.add(secondArg);

  console.log(springForce);
  this.bodyA.velocity = this.bodyA.velocity.add(
    springForce.scale(this.bodyA.invMass)
  );
  this.bodyB.velocity = this.bodyB.velocity.subtract(
    springForce.scale(this.bodyB.invMass)
  );
};

///SCRAPPP

function Spring(bodyA, bodyB, length, stiffness) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.length = length;
  this.stiffness = stiffness;
}

Spring.prototype.maintainSpring = function() {
  var dampingConstant = 0.2;
  var springForce = Vec2(0, 0);

  var distBA = this.bodyB.center.subtract(this.bodyA.center);
  var lengthBA = this.bodyB.center.subtract(this.bodyA.center).length();
  var vectorFromAtoB = distBA.scale(1 / lengthBA);

  var relDist = lengthBA - this.length;

  var relVelAlongDamper = this.bodyB.velocity.subtract(this.bodyA.velocity);

  var firstArg = this.stiffness * relDist;

  var secondArg = relVelAlongDamper.scale(dampingConstant);

  var nonVectorSpringForce = firstArg + secondArg;

  springForce = vectorFromAtoB.scale(nonVectorSpringForce);

  // firstArg.add(secondArg);

  console.log(firstArg);
  console.log(secondArg);

  this.bodyA.velocity = this.bodyA.velocity.add(
    springForce.scale(this.bodyA.invMass)
  );
  this.bodyB.velocity = this.bodyA.velocity.subtract(
    springForce.scale(this.bodyB.invMass)
  );
};

///working

function Spring(bodyA, bodyB, length, stiffness) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.length = length;
  this.stiffness = stiffness;
  this.dampingConstant = 0.25;
}

Spring.prototype.maintainSpring = function() {
  var distBA = this.bodyB.center.subtract(this.bodyA.center);
  var lengthBA = this.bodyB.center.subtract(this.bodyA.center).length();
  var vectorFromBtoA = distBA.scale(1 / lengthBA);
  var springForce;
  //vectorFromBtoA = vectorFromBtoA.normalize();
  var relDist = lengthBA - this.length;

  var relVelAlongDamper = this.bodyB.velocity
    .subtract(this.bodyA.velocity)
    .cross(vectorFromBtoA);

  var firstArg = this.stiffness * relDist;

  var secondArg = relVelAlongDamper * this.dampingConstant;

  springForce = vectorFromBtoA.scale(firstArg + secondArg);
  //springForce = springForce.scale(0.25);
  console.log(springForce);
  this.bodyA.velocity = this.bodyA.velocity.add(
    springForce.scale(this.bodyA.invMass)
  );
  this.bodyB.velocity = this.bodyB.velocity.subtract(
    springForce.scale(this.bodyB.invMass)
  );
};



///SCRAPPP

var relAngleA = this.bodyA.angle - this.restingAngle;

var relAngleB = this.bodyB.angle - this.restingAngle;

var angularImpulseA = -relAngleA * this.dampingConstant;
var angularImpulseB = -relAngleB * this.dampingConstant;

console.log(angularImpulseA);
this.bodyA.velocity = this.bodyA.velocity.add(
  springForce.scale(this.bodyA.invMass)
);
this.bodyB.velocity = this.bodyB.velocity.subtract(
  springForce.scale(this.bodyB.invMass)
);
this.bodyA.angularVelocity += angularImpulseA * this.bodyA.inertia;
this.bodyB.angularVelocity += angularImpulseB * this.bodyB.inertia;
};

//latest

function Spring(bodyA, bodyB, length, stiffness, options) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.length = length;
  this.stiffness = stiffness;

  this.restingAngleA = bodyA.angle;
  this.restingAngleB = bodyB.angle;
  this.restingPosition;

  if (options) {
    if (options.damping) {
      this.dampingConstant = options.dampingConstant;
    } else {
      this.dampingConstant = 0.0025;
    }
    if (options.fixed) {
      this.restingPositionA = this.bodyA.center;
      this.restingPositionB = this.bodyB.center;
      this.distBAFixed = this.restingPositionB.subtract(this.restingPositionA);
    } else {
      this.restingPositionA = null;
      this.restingPositionB = null;
      this.distBAFixed = null;
    }
  }
}

Spring.prototype.maintainSpring = function(engine) {
  console.log(this.distBAFixed ? "true but null" : "false but null");
  var distBA = this.bodyB.center.subtract(this.bodyA.center);
  var lengthBA = this.bodyB.center.subtract(this.bodyA.center).length();
  var vectorFromBtoA = distBA.scale(1 / lengthBA);
  var relDist = lengthBA - this.length;

  var reducedMass = 1 / (1 / this.bodyA.invMass + 1 / this.bodyB.invMass);
  vectorFromBtoA = Vec2(0, -1);
  var relVelAlongDamper = this.bodyB.velocity
    .subtract(this.bodyA.velocity)
    .dot(vectorFromBtoA);

  var firstArg = vectorFromBtoA.dot(
    Vec2(this.stiffness * relDist, this.stiffness * relDist)
  );

  var secondArg = relVelAlongDamper * this.dampingConstant;
  var springForce = vectorFromBtoA.scale(firstArg + secondArg);

  var reducedInertia =
    (this.bodyA.inertia * this.bodyB.inertia) /
    (this.bodyA.inertia + this.bodyB.inertia);

  var angleImpulseA =
    -(reducedInertia / engine.updateIntervalInSeconds) *
      (this.stiffness * this.restingAngleA * 20) -
    0.5 * this.bodyA.angle;

  var angleImpulseB =
    -(reducedInertia / engine.updateIntervalInSeconds) *
      (this.stiffness * this.restingAngleB * 20) -
    0.5 * this.bodyB.angle;

  this.bodyA.velocity = this.bodyA.velocity.add(
    springForce.scale(this.bodyA.invMass)
  );
  this.bodyB.velocity = this.bodyB.velocity.subtract(
    springForce.scale(this.bodyB.invMass)
  );
  console.log(springForce);
  this.bodyA.angularVelocity += angleImpulseA;
  this.bodyA.angularVelocity += angleImpulseB;
};


//latest working

function Spring(bodyA, bodyB, length, stiffness) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.length = length;
  this.stiffness = stiffness;

  this.dampingConstant = 0.0025;

  this.restingAngleA = bodyA.angle;
  this.restingAngleB = bodyB.angle;
}

Spring.prototype.maintainSpring = function(engine) {
  var distBA = this.bodyB.center.subtract(this.bodyA.center);
  var lengthBA = this.bodyB.center.subtract(this.bodyA.center).length();
  var vectorFromBtoA = distBA.scale(1 / lengthBA);
  var relDist = lengthBA - this.length;

  var reducedMass = 1 / (1 / this.bodyA.invMass + 1 / this.bodyB.invMass);
  vectorFromBtoA = Vec2(0, -1);
  var relVelAlongDamper = this.bodyB.velocity
    .subtract(this.bodyA.velocity)
    .dot(vectorFromBtoA);

  var firstArg = vectorFromBtoA.dot(
    Vec2(this.stiffness * relDist, this.stiffness * relDist)
  );

  var secondArg = relVelAlongDamper * this.dampingConstant;
  var springForce = vectorFromBtoA.scale(firstArg + secondArg);

  var reducedInertia =
    (this.bodyA.inertia * this.bodyB.inertia) /
    (this.bodyA.inertia + this.bodyB.inertia);

  var angleImpulseA =
    -(reducedInertia / engine.updateIntervalInSeconds) *
      (this.stiffness * this.restingAngleA * 20) -
    0.5 * this.bodyA.angle;

  var angleImpulseB =
    -(reducedInertia / engine.updateIntervalInSeconds) *
      (this.stiffness * this.restingAngleB * 20) -
    0.5 * this.bodyB.angle;

  this.bodyA.velocity = this.bodyA.velocity.add(
    springForce.scale(this.bodyA.invMass)
  );
  this.bodyB.velocity = this.bodyB.velocity.subtract(
    springForce.scale(this.bodyB.invMass)
  );
  console.log(springForce);
  this.bodyA.angularVelocity += angleImpulseA;
  this.bodyA.angularVelocity += angleImpulseB;
};


// latest with restingFixed
