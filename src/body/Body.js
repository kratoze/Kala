var bodyIndex = new Indexer();

/**
 * Body   A Rigid Body, inherited by Rectangle and Circle
 * @class
 * @param  {number} x                 The X coordinate of the center of the Body, converted to Vec2
 * @param  {number} y                 The Y coordinate of the center of the Body, converted to Vec2
 * @param  {number} mass="1"          The Body's mass
 * @param  {number} friction="0.8"    The friction coefficient, between 0 and 1 is best
 * @param  {number} restitution="0.2" The restitution coefficient, or bounciness, between 0 and 1 is best
 * @param  {object} [options]
 * @param  {boolean} [options.isSensor="false"] If set to true the Body will not resolve collisions
 * @param  {string} [options.name]    The name of the Body
 * @param  {boolean} [options.dampen] If set to true, the Body's velocity will be reduced each frame
 * @param  {number} [options.dampenValue="0.985"] The value that the Body's velocity is reduced by is dampening is true
 */
function Body(x, y, mass, friction, restitution, options) {
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

/**
 * Updates the position and angle of the Body
 * @param {Engine} engine engine the Body is contained within
 */
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

/**
 * Checks if another Body is within this Body's bounding radius as the first step of the Broad-Phase
 * @param  {Body} otherShape description
 * @return {boolean}         Returns true if another Body is within the Body's bound radius
 */
Body.prototype.boundTest = function(otherShape) {
  var vFrom1to2 = otherShape.center.subtract(this.center);
  var rSum = this.boundRadius + otherShape.boundRadius;
  var dist = vFrom1to2.length();
  if (dist > rSum) {
    return false; //not overlapping
  }
  return true;
};

/**
 * Updates the mass of the Body and updates its inertia
 * @param  {number} mass The amount added to the Body's mass
 */
Body.prototype.updateMass = function(massToAdd) {
  var mass;
  if (this.invMass !== 0) {
    mass = 1 / this.invMass;
  } else {
    mass = 0;
  }

  mass += massToAdd;
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

/**
 * Adds to the Body's acceleration
 * Shorthand for Body.acceleration = Body.acceleration.add(vec)
 * @param  {Vec2} vec The Vector that is added the the Body's acceleration
 */
Body.prototype.addAcceleration = function(vec) {
  this.acceleration = this.acceleration.add(vec);
};
/**
 * Subtracts from the Body's acceleration
 * Shorthand for Body.acceleration = Body.acceleration.subtract(vec)
 * @param  {Vec2} vec The Vector that is added the the Body's acceleration
 */
Body.prototype.subtractAcceleration = function(vec) {
  this.acceleration = this.acceleration.subtract(vec);
};

Body.prototype.updateInertia = function() {
  // subclass must deinfe this
  // must work with inverted InvMass
};
