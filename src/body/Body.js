function Body(x, y, mass, friction, restitution) {
  this.center = Vec2(x, y);
  this.inertia = 0;
  if (mass !== undefined) {
    this.invMass = mass;
  } else {
    this.invMass = 1;
  }

  if (friction !== undefined) {
    this.friction = friction;
  } else {
    this.friction = 0.8;
  }
  if (restitution !== undefined) {
    this.restitution = restitution;
  } else {
    this.restitution = 0.2;
  }

  this.velocity = Vec2(0, 0);
  if (this.invMass !== 0) {
    this.invMass = 1 / this.invMass;
    this.acceleration = Engine.gravity;
  } else {
    this.acceleration = new Vec2(0, 0);
  }

  // angle
  this.angle = 0;
  // negative = clockwise
  // positive = counterclockwise
  this.angularVelocity = 0;
  this.angularAcceleration = 0;
  this.boundRadius = 0;
}

Body.prototype.update = function(engine) {
  if (engine.movement) {
    var dt = engine.updateIntervalInSeconds;
    // v += a*t
    // s += v*t
    this.velocity = this.velocity.add(this.acceleration.scale(dt));

    this.move(this.velocity.scale(dt));
    //position += timestep * (velocity + timestep * acceleration / 2);

    this.angularVelocity += this.angularAcceleration * dt;
    this.rotate(this.angularVelocity * dt);
  }
};

Body.prototype.boundTest = function(otherShape) {
  var vFrom1to2 = otherShape.center.subtract(this.center);
  var rSum = this.boundRadius + otherShape.boundRadius;
  var dist = vFrom1to2.length();
  if (dist > rSum) {
    return false; //not overlapping
  }
  return true;
};

Body.prototype.updateMass = function(delta) {
  var mass;
  if (this.invMass !== 0) {
    mass = 1 / this.invMass;
  } else {
    mass = 0;
  }

  mass += delta;
  if (mass <= 0) {
    this.invMass = 0;
    this.velocity = Vec2(0, 0);
    this.acceleration = Vec2(0, 0);
    this.angularVelocity = 0;
    this.angularAcceleration = 0;
  } else {
    this.invMass = 1 / mass;
    this.acceleration = Kala.Engine.gravity;
  }
  this.updateInertia();
};

Body.prototype.addAcceleration = function(vec) {
  this.acceleration = this.acceleration.add(vec);
};

Body.prototype.subtractAcceleration = function(vec) {
  this.acceleration = this.acceleration.subtract(vec);
};

Body.prototype.updateInertia = function() {
  // subclass must deinfe this
  // must work with inverted InvMass
};
