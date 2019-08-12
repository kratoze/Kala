var bodyIndex = new Indexer();

function Body(x, y, mass, friction, restitution, options) {
  this.renderIndex;
  this.bodyIndex = bodyIndex.incrementIndex();
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
    //this.acceleration = Engine.gravity;
  }
  this.acceleration = Vec2(0, 0);

  // angle
  this.angle = 0;
  // negative = clockwise
  // positive = counterclockwise
  this.angularVelocity = 0;
  this.angularAcceleration = 0;
  this.boundRadius = 0;
  this.isSensor = false;
  this.dampenValue = 0.985;
  if (options) {
    if (options.isSensor != undefined) {
      this.isSensor = options.isSensor;
    } else {
      this.isSensor = false;
    }
    if (options.name && typeof options.name === "string") {
      this.name = options.name;
    } else {
      this.name = "unnamed";
    }
    if (options.dampen && typeof options.dampen === "boolean") {
      this.dampen = options.dampen;
    } else {
      this.dampen = false;
    }
    if (options.dampenValue) {
      this.dampenValue = options.dampenValue;
    }
    if (options.bodyPositionalCorrection) {
      this.bodyPositionalCorrection = options.bodyPositionalCorrection;
    } else {
      this.bodyPositionalCorrection = true;
    }
  }
}

Body.prototype.update = function(engine) {
  if (engine.movement) {
    var dt = engine.updateIntervalInSeconds;
    // v += a*t
    // s += v*t
    this.velocity = this.velocity.add(this.acceleration.scale(dt));
    if (this.dampen) {
      this.velocity = this.velocity.scale(this.dampenValue);
      this.angularVelocity = this.angularVelocity * this.dampenValue;
    }
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
