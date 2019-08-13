/**
 * Vec2 - A 2D Vector. Does not reuquire the 'new' keyword when instantiating
 * @class
 * @param  {type} x The X value
 * @param  {type} y The Y value
 */
function Vec2(x, y) {
  return new Vec2.init(x, y);
}

Vec2.init = function(x, y) {
  var self = this;
  self.x = x;
  self.y = y;
};

Vec2.init.prototype = Vec2.prototype;

/**
 * Calculates the Vectors length
 *
 * @return {number}  The length of the Vector
 */
Vec2.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * Adds a Vector to this Vector
 *
 * @param  {Vec2} vec The Vector being added
 * @return {Vec2}     The sum of the Vectors
 */
Vec2.prototype.add = function(vec) {
  return Vec2(vec.x + this.x, vec.y + this.y);
};

/**
 * Subtracts a Vector from this Vector
 *
 * @param  {Vec2} vec The Vector being subtracted
 * @return {Vec2}     The result of the subtraction
 */
Vec2.prototype.subtract = function(vec) {
  return Vec2(this.x - vec.x, this.y - vec.y);
};

/**
 * Multiplies the Vector by a scalar
 *
 * @param  {number} n The number the Vector is multiplied by
 * @return {Vec2}   The product of the multiplication
 */
Vec2.prototype.scale = function(n) {
  return Vec2(this.x * n, this.y * n);
};

/**
 * Calculates the dot product of a Vector and this Vector
 *
 * @param  {Vec2} vec The other Vector
 * @return {Vec2}     The dot product of the two Vectors
 */
Vec2.prototype.dot = function(vec) {
  return this.x * vec.x + this.y * vec.y;
};

/**
 * Caclulates the cross product of a Vector and this Vector
 *
 * @param  {Vec2} vec The other Vector
 * @return {number}     The cross product as a scalar
 */
Vec2.prototype.cross = function(vec) {
  return this.x * vec.y - this.y * vec.x;
};

/**
 * Rotates the Vector by an angle around a given center, the center is a Vector
 *
 * @param  {Vec2} center The center of rotation
 * @param  {number} angle  The angle the Vector is to be rotated
 * @return {Vec2}        The rotated Vector
 */
Vec2.prototype.rotate = function(center, angle) {
  var r = [];
  var x = this.x - center.x;
  var y = this.y - center.y;

  r[0] = x * Math.cos(angle) - y * Math.sin(angle);
  r[1] = x * Math.sin(angle) + y * Math.cos(angle);

  r[0] += center.x;
  r[1] += center.y;

  return Vec2(r[0], r[1]);
};

/**
 * Converts the Vector to a normal Vector, useful for converting a Vector to a Unit Vector
 *
 * @return {Vec2}  The normalised Vector
 */
Vec2.prototype.normalize = function() {
  var len = this.length();
  if (len > 0) {
    len = 1 / len;
  }
  return Vec2(this.x * len, this.y * len);
};

/**
 * Caclulates the distance between a Vector and this Vector
 *
 * @param  {Vec2} vec The other Vector
 * @return {number}     The distance between the two Vectors as a scalar
 */
Vec2.prototype.distance = function(vec) {
  var x = this.x - vec.x;
  var y = this.y - vec.y;
  return Math.sqrt(x * x + y * y);
};

/**
 * Produces a Vector from an angle and a given length, useful for calculating the direction for a velocity vector
 *
 * @param  {number} length The length of the calculated Vector
 * @param  {type} angle  The angle the Vector will be facing
 * @return {Vec2}        The calculated Vector
 */
Vec2.prototype.vectorFromAngle = function(length, angle) {
  return Vec2(length * Math.cos(angle), length * Math.sin(angle));
};

/**
 * Calculates an angle from a given vector
 *
 * @param  {Vec2} vec The Vector from which the angle is calculated
 * @return {number}     The calculated angle
 */
Vec2.prototype.angleFromVector = function(vec) {
  return Math.atan2(this.y - vec.y, this.x - vec.x);
};

/**
 * Engine - The core engine where all Bodies and Constraints are managed. Contains the main engine loop.
 * @class
 */
function Engine() {
  var self = this;
  this.movement = false;

  this.currentTime;
  this.elapsedTime;
  this.previousTime = performance.now();
  this.lagTime = 0;
  this.kFPS = 60;
  this.frameTime = 1 / this.kFPS;
  this.updateIntervalInSeconds = this.frameTime;
  this.kMPF = 1000 * this.frameTime; //Milliseconds per frame

  this.allBodies = [];
  this.allConstraints = [];
  this.physics = new Kala.Physics();
  this.events = new Kala.Events();
  this.collisionResponse;

  this.gravity = Vec2(0, 10);

  var bodyIndex = new Indexer();

  /**
   * Adds a Body or array of Bodies to the engine's array of Bodies
   * @param  {Body[]} bodies The Body or array of Bodies to be added to the engine
   */
  this.add = function(bodies) {
    if (Array.isArray(bodies)) {
      bodies.forEach(function(body) {
        if (body instanceof Body) {
          //self.applyGravity(body);
          self.allBodies.push(body);
          self.applyGravity(self.allBodies[self.allBodies.length - 1]);
        }
      });
    } else if (bodies instanceof Body) {
      self.allBodies.push(bodies);
      this.applyGravity(self.allBodies[self.allBodies.length - 1]);
    } else {
      throw "Only objects of type Body can be added to the engine";
    }
  };

  /**
   * Removes a Body from the engines Body array by its index
   * @param  {number} bodyIndex The index of the Body to be removed
   */
  this.removeBody = function(bodyIndex) {
    this.allBodies.splice(bodyIndex, 1);
  };

  this.addConstraint = function(constraint) {
    this.allConstraints.push(constraint);
    //this.allBodies.push(constraint.constraintLink);
  };

  this.applyGravityAllBodies = function() {
    for (let i = 0; i < self.allBodies.length; i++) {
      this.applyGravity(self.allBodies[i]);
    }
  };

  /**
   * Applies the engine's gravity to a body
   * @param  {Body} body The Body gravity is applied to
   */
  this.applyGravity = function(body) {
    if (body.invMass !== 0) {
      body.acceleration = this.gravity;
    } else {
      body.acceleration = Vec2(0, 0);
    }
  };

  /**
   * Calls the update method on all the Bodies stored in the engine's array of Bodies
   */
  this.update = function() {
    for (var i = 0; i < this.allBodies.length; i++) {
      this.allBodies[i].update(this);
    }
  };

  /**
   * The central loop where collisions, contraints and events are resolves and updated
   * @param  {PixiRender} [render] Optional renderer to be updated with the loop
   */
  this.runGameLoop = function(render) {
    requestAnimationFrame(function() {
      self.runGameLoop(render);
    });

    self.currentTime = performance.now();
    self.elapsedTime = self.currentTime - self.previousTime;
    self.previousTime = self.currentTime;
    self.lagTime += self.elapsedTime;

    while (self.lagTime >= self.kMPF) {
      self.lagTime -= self.kMPF;
      this.collisionInfo = this.physics.collision(this);
      this.update();
    }
    if (this.allConstraints.length != 0) {
      this.physics.maintainConstraints(self);
    }
    if (this.events.customEvents) {
      Object.values(this.events.customEvents).forEach(value => {
        value.call();
      });
    }
    if (this.collisionInfo) {
      Object.values(this.events.collisionEvents).forEach(value => {
        value.call();
      });
    }
    if (render) {
      render.update(this);
    }
  };

  /**
   * Initialises the engine loop by calling runGameLoop
   * @param  {PixiRender} [render] Optional renderer to be updated with the loop
   */
  this.initializeEngineCore = function(render) {
    self.runGameLoop(render);
  };
}

//var renderIndex = new Indexer();

function PixiRender(width, height, theme, scale) {
  var self = this;
  //Set up PIXI

  this.app = new PIXI.Application({
    height: width,
    width: height,
    backgroundColor: 0xfcfccf,
    forceCanvas: true,
    antialias: true
  });

  this.scale = scale;

  document.body.appendChild(this.app.view);
  this.app.stage.scale.x = this.app.stage.scale.y = scale;
  this.bodyContainer = new PIXI.Container();
  var graphics = new PIXI.Graphics();
  this.loader = new PIXI.Loader();
  this.isLoaded = false;
  var theme = theme || "stone";
  var sprites = {};
  var rectPNG;
  var circlePNG;
  switch (theme) {
    case "space":
      rectPNG = "imgs/enemyBlue3.png";
      this.loader
        .add("ship", "imgs/AsteroidGame/enemyBlue3.png")
        .add("asteroid1", "imgs/AsteroidGame/meteorBrown_big1.png")
        .add("explosion", "imgs/AsteroidGame/ExplosionAnimation.json")
        .load(onAssetsLoaded);
      break;
    case "stone":
      rectPNG = "elementMetal011.png";
      this.loader
        .add("sheet", "imgs/spritesheet_metal.json")
        .load(onAssetsLoaded);

      break;
    case "pool":
      this.loader
        .add("wood", "imgs/PoolGameImgs/woodTexture.jpg")
        .add("whiteball", "imgs/PoolGameImgs/whiteball.png")
        .add("poolballs", "imgs/PoolGameImgs/redball.png")
        .add("pot", "imgs/PoolGameImgs/pot.png")
        .load(onAssetsLoaded);
      break;
    default:
      break;
  }

  function onAssetsLoaded() {
    sprites.circleTexture = PIXI.Sprite.from("imgs/circle.png").texture;
    switch (theme) {
      case "stone":
        sprites.rectTexture =
          self.loader.resources["sheet"].textures["elementMetal011.png"];
        break;
      case "space":
        sprites.rectTexture = self.loader.resources["ship"].texture;
        sprites.circleTexture = self.loader.resources["asteroid1"].texture;
        // sprites.explosionSheet = self.loader.resources["explosion"].sprites;
        // sprites.explosion = new PIXI.AnimatedSprite(
        //   sprites.explosionSheet.animations["explosion"]
        // );
        break;
      case "pool":
        sprites.rectTexture = self.loader.resources["wood"].texture;

        break;
      default:
        break;
    }
  }

  this.app.stage.addChild(this.bodyContainer);
  this.app.stage.addChild(graphics);

  this.loader.onComplete.add(() => {
    this.isLoaded = true;
  });

  this.addRect = function(rect) {
    var r1 = this.graphics.drawRect(0, 0, rect.width, rect.height);

    r1.pivot.set(r1.width / 2, r1.height / 2);
    r1.position.x = rect.center.x;
    r1.position.y = rect.center.y;
    var centerPoint = this.graphics.drawRect(r1.width / 2, r1.height / 2, 1, 1);
    this.allRenderBodies.push(r1);
    this.app.stage.addChild(r1);
    //rect.renderIndex = this.app.stage.getChildIndex(r1);
    this.app.stage.addChild(centerPoint);
  };

  this.addSprite = function(body) {
    if (body.type === "Rectangle") {
      var r = new PIXI.Sprite(sprites.rectTexture);
      r.anchor.x = r.anchor.y = 0.5;
      r.position.x = body.center.x;
      r.position.y = body.center.y;
      r.width = body.width;
      r.height = body.height;

      this.bodyContainer.addChild(r);
      //body.renderIndex = this.app.stage.getChildIndex(r);
    }
    if (body.type === "Circle") {
      //Add circle
      var c = new PIXI.Sprite(sprites.circleTexture);
      c.anchor.x = c.anchor.y = 0.5;
      c.height = c.width = body.radius * 2;
      c.position.x = body.center.x;
      c.position.y = body.center.y;
      this.bodyContainer.addChild(c);
      //body.renderIndex = this.app.stage.getChildIndex(c);
    }
  };

  this.addSprites = function(bodies) {
    if (Array.isArray(bodies)) {
      for (let i = 0; i < bodies.length; i++) {
        this.addSprite(bodies[i]);
      }
    } else {
      this.addSprite(bodies);
    }
  };

  this.removeSprite = function(index) {
    var tempSprite = this.bodyContainer.getChildAt(index);
    if (tempSprite != undefined) {
      this.bodyContainer.removeChild(tempSprite);
    }
  };

  this.drawLine = function(x1, y1, x2, y2) {
    graphics.clear();
    graphics.lineStyle(0.1, 0x000000, 1);

    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
  };
  this.update = function(engine) {
    var engineBodies = engine.allBodies;
    for (let i = 0; i < this.bodyContainer.children.length; i++) {
      var engineBody = engineBodies[i];
      var renderBody = this.bodyContainer.children[i];

      var engineBodyPos = {
        x: engineBody.center.x,
        y: engineBody.center.y,
        angle: engineBody.angle,
        width: engineBody.width,
        height: engineBody.height,
        radius: engineBody.radius * 2
      };
      renderBody.position.x = engineBodyPos.x;
      renderBody.position.y = engineBodyPos.y;
      renderBody.rotation = engineBodyPos.angle;
      renderBody.width = engineBody.radius
        ? engineBodyPos.radius
        : engineBodyPos.width;
      renderBody.height = engineBodyPos.radius
        ? engineBodyPos.radius
        : engineBodyPos.height;
    }

    engine.allConstraints.forEach(function(constraint) {
      self.drawLine(
        constraint.bodyA.center.x,
        constraint.bodyA.center.y,
        constraint.bodyB.center.x,
        constraint.bodyB.center.y
      );
    });
  };
}

//  https://github.com/Apress/building-a-2d-physics-game-engine/blob/master/978-1-4842-2582-0_source%20code/Chapter3/Chapter3.1BroadPhaseMethod/public_html/EngineCore/Core.js
function Physics() {
  var positionalCorrectionFlag = true;
  // number of relaxtion iterations
  var relaxationCount = 15;
  // percentafe of separation to project objects
  var posCorrectionRate = 0.8;

  var collision = function(engine) {
    var i, j, k;
    var collisionInfo = new CollisionInfo();
    var collisionResponse = {};
    for (k = 0; k < relaxationCount; k++) {
      for (i = 0; i < engine.allBodies.length; i++) {
        for (j = i + 1; j < engine.allBodies.length; j++) {
          if (engine.allBodies[i].boundTest(engine.allBodies[j])) {
            if (
              engine.allBodies[i].collisionTest(
                engine.allBodies[j],
                collisionInfo
              )
            ) {
              if (
                collisionInfo
                  .getNormal()
                  .dot(
                    engine.allBodies[j].center.subtract(
                      engine.allBodies[i].center
                    )
                  ) < 0
              ) {
                collisionInfo.changeDir();
              }
              if (
                engine.allBodies[i].isSensor === true ||
                engine.allBodies[j].isSensor === true
              ) {
                collisionInfo.bodyA = engine.allBodies[i];
                collisionInfo.bodyAIndex = i;
                collisionInfo.bodyB = engine.allBodies[j];
                collisionInfo.bodyBIndex = j;
                return collisionInfo;
              } else {
                resolveCollision(
                  engine.allBodies[i],
                  engine.allBodies[j],
                  collisionInfo
                );
              }
            }
          }
        }
      }
    }
  };

  var maintainConstraints = function(engine) {
    var i;
    var collisionInfo = new CollisionInfo();
    for (i = 0; i < engine.allConstraints.length; i++) {
      if (engine.allConstraints[i].maintainConstraint(engine, collisionInfo)) {
        resolveCollision(
          engine.allConstraints[i].bodyA,
          engine.allConstraints[i].bodyB,
          collisionInfo
        );
        //engine.allConstraints[i].updateLink();
      }
    }
  };

  var positionalCorrection = function(s1, s2, collisionInfo) {
    var s1InvMass = s1.invMass;
    var s2InvMass = s2.invMass;

    var num =
      (collisionInfo.getDepth() / (s1InvMass + s2InvMass)) * posCorrectionRate;
    var correctAmount = collisionInfo.getNormal().scale(num);

    s1.move(correctAmount.scale(-s1InvMass));
    s2.move(correctAmount.scale(s2InvMass));
  };

  var resolveCollision = function(s1, s2, collisionInfo) {
    if (s1.invMass === 0 && s2.invMass === 0) {
      return;
    }
    if (positionalCorrectionFlag) {
      positionalCorrection(s1, s2, collisionInfo);
    }

    var n = collisionInfo.getNormal();
    // the direction of the collisionInfo is always from s1 to s2
    // but the Mass is inversed, so start scale with s2 and end
    // scale with s1
    var start = collisionInfo.start.scale(
      s2.invMass / (s1.invMass + s2.invMass)
    );
    var end = collisionInfo.end.scale(s1.invMass / (s1.invMass + s2.invMass));
    var p = start.add(end);
    // r is vector from center of shape to collision point
    var r1 = p.subtract(s1.center);
    var r2 = p.subtract(s2.center);

    var v1 = s1.velocity.add(
      Vec2(-1 * s1.angularVelocity * r1.y, s1.angularVelocity * r1.x)
    );
    var v2 = s2.velocity.add(
      Vec2(-1 * s2.angularVelocity * r2.y, s2.angularVelocity * r2.x)
    );
    var relativeVelocity = v2.subtract(v1);

    // Relative velocity in normal direction
    var rVelocityInNormal = relativeVelocity.dot(n);

    // if objects are moving apart ignore
    if (rVelocityInNormal > 0) {
      return;
    }

    // compute and apply response impulse for each object
    var newRestitution = Math.min(s1.restitution, s2.restitution);
    var newFriction = Math.min(s1.friction, s2.friction);
    // R cross N
    var R1crossN = r1.cross(n);
    var R2crossN = r2.cross(n);

    // Calc impulse scalar
    var jN = -(1 + newRestitution) * rVelocityInNormal;
    jN =
      jN /
      (s1.invMass +
        s2.invMass +
        R1crossN * R1crossN * s1.inertia +
        R2crossN * R2crossN * s2.inertia);
    // impulse is in direction of normal (from s1 to s2)
    var impulse = n.scale(jN);
    // impulse = F dt = m*∆v
    // ∆v = impulse / m
    s1.velocity = s1.velocity.subtract(impulse.scale(s1.invMass));
    s2.velocity = s2.velocity.add(impulse.scale(s2.invMass));

    s1.angularVelocity -= R1crossN * jN * s1.inertia;
    s2.angularVelocity += R2crossN * jN * s2.inertia;

    var tangent = relativeVelocity.subtract(n.scale(relativeVelocity.dot(n)));
    // relativeVelocity.dot(tangent) should be less than 0
    tangent = tangent.normalize().scale(-1);

    var R1crossT = r1.cross(tangent);
    var R2crossT = r2.cross(tangent);

    var jT =
      -(1 + newRestitution) * relativeVelocity.dot(tangent) * newFriction;
    jT =
      jT /
      (s1.invMass +
        s2.invMass +
        R1crossT * R1crossT * s1.inertia +
        R2crossT * R2crossT * s2.inertia);

    // friction should be less than force in normal direction
    if (jT > jN) {
      jT = jN;
    }
    // impulse is from s1 to s2 (opposite direction of velocity)
    impulse = tangent.scale(jT);

    s1.velocity = s1.velocity.subtract(impulse.scale(s1.invMass));
    s2.velocity = s2.velocity.add(impulse.scale(s2.invMass));
    s1.angularVelocity -= R1crossT * jT * s1.inertia;
    s2.angularVelocity += R2crossT * jT * s2.inertia;
  };

  var mPublic = {
    collision: collision,
    maintainConstraints: maintainConstraints,
    positionalCorrectionFlag: positionalCorrectionFlag
  };
  return mPublic;
}

var Common = {};

(function() {
  Common.extend = function(Child, Parent) {
    var prototype = Object.create(Parent.prototype);
    prototype.constructor = Child;
    Child.prototype = prototype;
    return Child;
  };
})();

function Indexer() {
  this.bodyIndex = -1;
}

Indexer.prototype.incrementIndex = function() {
  return (this.bodyIndex += 1);
};

function Events() {
  this.customEvents = {};
  this.collisionEvents = {};
}

Events.prototype.addCustomEvent = function(event) {
  this.customEvents[event.name] = event;
};

Events.prototype.addCollisionEvent = function(event) {
  this.collisionEvents[event.name] = event;
};

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
 * @param  {number} delta The amount added to the Body's mass
 */
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

function CollisionInfo() {
  this.bodyA;
  this.bodyB;
  this.bodyAIndex;
  this.bodyBIndex;
  this.depth = 0;
  this.normal = new Vec2(0, 0);
  this.start = new Vec2(0, 0);
  this.end = new Vec2(0, 0);
}

CollisionInfo.prototype.setNormal = function(s) {
  this.normal = s;
};

CollisionInfo.prototype.getDepth = function() {
  return this.depth;
};

CollisionInfo.prototype.setDepth = function(s) {
  this.depth = s;
};

CollisionInfo.prototype.getNormal = function() {
  return this.normal;
};

CollisionInfo.prototype.setInfo = function(d, n, s) {
  this.depth = d;
  this.normal = n;
  this.start = s;
  this.end = s.add(n.scale(d));
};

CollisionInfo.prototype.changeDir = function() {
  this.normal = this.normal.scale(-1);
  var n = this.start;
  this.start = this.end;
  this.end = n;
};

/**
 * Rectangle - A rectangular Body
 * @class
 * @extends Body
 * @param  {number} x                 The X coordinate of the center of the Body, converted to Vec2
 * @param  {number} y                 The Y coordinate of the center of the Body, converted to Vec2
 * @param  {number} width             The width of the Rectangle
 * @param  {number} height            The height of the Rectangle
 * @param  {number} mass="1"          The Body's mass
 * @param  {number} friction="0.8"    The friction coefficient, between 0 and 1 is best
 * @param  {number} restitution="0.2" The restitution coefficient, or bounciness, between 0 and 1 is best
 * @param  {object} [options]
 * @param  {boolean} [options.isSensor="false"] If set to true the Body will not resolve collisions
 * @param  {string} [options.name]    The name of the Body
 * @param  {boolean} [options.dampen] If set to true, the Body's velocity will be reduced each frame
 * @param  {number} [options.dampenValue="0.985"] The value that the Body's velocity is reduced by is dampening is true
 */
var Rectangle = function(
  x,
  y,
  width,
  height,
  mass,
  friction,
  restitution,
  options
) {
  Body.call(this, x, y, mass, friction, restitution, options);
  this.type = "Rectangle";
  this.width = width;
  this.height = height;
  this.boundRadius = Math.sqrt(width * width + height * height) / 2;
  this.vertex = [];
  this.faceNormal = [];

  //0--TopLeft;1--TopRight;2--BottomRight;3--BottomLeft
  this.vertex[0] = new Vec2(x - width / 2, y - height / 2);
  this.vertex[1] = new Vec2(x + width / 2, y - height / 2);
  this.vertex[2] = new Vec2(x + width / 2, y + height / 2);
  this.vertex[3] = new Vec2(x - width / 2, y + height / 2);

  //0--Top;1--Right;2--Bottom;3--Left
  this.faceNormal[0] = this.vertex[1].subtract(this.vertex[2]);
  this.faceNormal[0] = this.faceNormal[0].normalize();
  this.faceNormal[1] = this.vertex[2].subtract(this.vertex[3]);
  this.faceNormal[1] = this.faceNormal[1].normalize();
  this.faceNormal[2] = this.vertex[3].subtract(this.vertex[0]);
  this.faceNormal[2] = this.faceNormal[2].normalize();
  this.faceNormal[3] = this.vertex[0].subtract(this.vertex[1]);
  this.faceNormal[3] = this.faceNormal[3].normalize();

  this.updateInertia();
};

Common.extend(Rectangle, Body);
/**
 * Moves the Rectangle. Use this to affect the Rectangle's positon instead of assigning to its center
 *
 * @param  {Vec2} vec The Vector that is added to the Circle
 * @return {Rectangle}   Returns this Rectangle for method chaining
 */
Rectangle.prototype.move = function(v) {
  var i;
  for (i = 0; i < this.vertex.length; i++) {
    this.vertex[i] = this.vertex[i].add(v);
  }
  this.center = this.center.add(v);
  return this;
};
/**
 * Rotates the Rectangle. Use this to affect the angle instead of assigning to its angle
 *
 * @param  {number} angle The angle the Circle will be rotated. + for counterclockwise - for clockwise
 * @return {Rectangle}   Returns this Rectangle for method chaining
 */
Rectangle.prototype.rotate = function(angle) {
  this.angle += angle;
  var i;
  for (i = 0; i < this.vertex.length; i++) {
    this.vertex[i] = this.vertex[i].rotate(this.center, angle);
  }
  this.faceNormal[0] = this.vertex[1].subtract(this.vertex[2]);
  this.faceNormal[0] = this.faceNormal[0].normalize();
  this.faceNormal[1] = this.vertex[2].subtract(this.vertex[3]);
  this.faceNormal[1] = this.faceNormal[1].normalize();
  this.faceNormal[2] = this.vertex[3].subtract(this.vertex[0]);
  this.faceNormal[2] = this.faceNormal[2].normalize();
  this.faceNormal[3] = this.vertex[0].subtract(this.vertex[1]);
  this.faceNormal[3] = this.faceNormal[3].normalize();
  return this;
};
/**
 * Updates the inertia based on the Circle's mass.
 * Should only be run in the constructor or when updateMass is called
 */
Rectangle.prototype.updateInertia = function() {
  // Expect InvMass to already be inverted!
  if (this.invMass === 0) {
    this.inertia = 0;
  } else {
    // inertia=mass*width°2+height°2
    this.inertia =
      ((1 / this.invMass) *
        (this.width * this.width + this.height * this.height)) /
      12;
    this.inertia = 1 / this.inertia;
  }
};

/**
 * Circle - A circular Body
 * @class
 * @extends Body
 * @param  {number} x                 The X coordinate of the center of the Body, converted to Vec2
 * @param  {number} y                 The Y coordinate of the center of the Body, converted to Vec2
 * @param  {number} radius            The circle's radius
 * @param  {number} mass="1"          The Body's mass
 * @param  {number} friction="0.8"    The friction coefficient, between 0 and 1 is best
 * @param  {number} restitution="0.2" The restitution coefficient, or bounciness, between 0 and 1 is best
 * @param  {object} [options]
 * @param  {boolean} [options.isSensor="false"] If set to true the Body will not resolve collisions
 * @param  {string} [options.name]    The name of the Body
 * @param  {boolean} [options.dampen] If set to true, the Body's velocity will be reduced each frame
 * @param  {number} [options.dampenValue="0.985"] The value that the Body's velocity is reduced by is dampening is true
 */
var Circle = function(x, y, radius, mass, friction, restitution, options) {
  Body.call(this, x, y, mass, friction, restitution, options);
  this.type = "Circle";
  this.radius = radius;
  this.boundRadius = radius;
  this.startPoint = Vec2(x, y - radius);
  this.updateInertia();
};

Common.extend(Circle, Body);

/**
 * Moves the Circle. Use this to affect the Circle's positon instead of assigning to its center
 *
 * @param  {Vec2} vec The Vector that is added to the Circle
 * @return {Circle}   Returns this Circle for method chaining
 */
Circle.prototype.move = function(vec) {
  this.startPoint = this.startPoint.add(vec);
  this.center = this.center.add(vec);
  return this;
};

/**
 * Rotates the Circle. Use this to affect the angle instead of assigning to its angle
 *
 * @param  {number} angle The angle the Circle will be rotated. + for counterclockwise - for clockwise
 * @return {Circle}       Returns this Circle for method chaining
 */
Circle.prototype.rotate = function(angle) {
  this.angle += angle;
  this.startPoint = this.startPoint.rotate(this.center, angle);
  return this;
};

/**
 * Updates the inertia based on the Circle's mass.
 * Should only be run in the constructor or when updateMass is called
 */
Circle.prototype.updateInertia = function() {
  if (this.invMass === 0) {
    this.interia = 0;
  } else {
    // this.invMass is inverted
    // Intertia = mass * radius°2
    // 12 is a constant value that can be changed
    this.inertia = ((1 / this.invMass) * (this.radius * this.radius)) / 12;
  }
};

Rectangle.prototype.collisionTest = function(otherShape, collisionInfo) {
  var status = false;
  if (otherShape.type === "Circle") {
    status = this.collidedRectCirc(otherShape, collisionInfo);
  } else {
    status = this.collidedRectRect(this, otherShape, collisionInfo);
  }
  return status;
};

var SupportStruct = function() {
  this.supportPoint = null;
  this.supportPointDist = 0;
};

var tmpSupport = new SupportStruct();

Rectangle.prototype.findSupportPoint = function(dir, ptOnEdge) {
  var vToEdge;
  var projection;
  tmpSupport.supportPointDist = -9999999;
  tmpSupport.supportPoint = null;
  //check each vector of other object
  for (var i = 0; i < this.vertex.length; i++) {
    vToEdge = this.vertex[i].subtract(ptOnEdge);
    projection = vToEdge.dot(dir);
    //find the longest distance with certain edge
    //dir is -n direction so the distance should be positive
    if (projection > 0 && projection > tmpSupport.supportPointDist) {
      tmpSupport.supportPoint = this.vertex[i];
      tmpSupport.supportPointDist = projection;
    }
  }
};

Rectangle.prototype.findAxisLeastPenetration = function(
  otherRect,
  collisionInfo
) {
  var n;
  var supportPoint;
  var bestDistance = 999999;
  var bestIndex = null;

  var hasSupport = true;
  var i = 0;

  while (hasSupport && i < this.faceNormal.length) {
    //Retrieve a face from A
    n = this.faceNormal[i];
    // use -n as a direction and
    // the vertex on edge i as point on edge
    var dir = n.scale(-1);
    var ptOnEdge = this.vertex[i];
    // find the support on B
    // the point has longest distance with edge i
    otherRect.findSupportPoint(dir, ptOnEdge);
    hasSupport = tmpSupport.supportPoint !== null;
    //get the shortest support point depth
    if (hasSupport && tmpSupport.supportPointDist < bestDistance) {
      bestDistance = tmpSupport.supportPointDist;
      bestIndex = i;
      supportPoint = tmpSupport.supportPoint;
    }
    i = i + 1;
  }
  if (hasSupport) {
    //all four direction have support point
    var bestVec = this.faceNormal[bestIndex].scale(bestDistance);
    collisionInfo.setInfo(
      bestDistance,
      this.faceNormal[bestIndex],
      supportPoint.add(bestVec)
    );
  }
  return hasSupport;
};

var collisionInfoR1 = new CollisionInfo();
var collisionInfoR2 = new CollisionInfo();

Rectangle.prototype.collidedRectRect = function(r1, r2, collisionInfo) {
  var status1 = false;
  var status2 = false;
  // find Axis of Separation for both Rectangle
  status1 = r1.findAxisLeastPenetration(r2, collisionInfoR1);
  if (status1) {
    status2 = r2.findAxisLeastPenetration(r1, collisionInfoR2);
    if (status2) {
      //  choose the shorter normal as the normal
      if (collisionInfoR1.getDepth() < collisionInfoR2.getDepth()) {
        var depthVec = collisionInfoR1
          .getNormal()
          .scale(collisionInfoR1.getDepth());
        collisionInfo.setInfo(
          collisionInfoR1.getDepth(),
          collisionInfoR1.getNormal(),
          collisionInfoR1.start.subtract(depthVec)
        );
      } else {
        collisionInfo.setInfo(
          collisionInfoR2.getDepth(),
          collisionInfoR2.getNormal().scale(-1),
          collisionInfoR2.start
        );
      }
    }
  }
  return status1 && status2;
};

Rectangle.prototype.collidedRectCirc = function(otherCir, collisionInfo) {
  // Step A: Compute the nearest edge
  var inside = true;
  var bestDistance = -99999;
  var nearestEdge = 0;
  var projection;
  var circ2Pos;

  var i, v;

  for (i = 0; i < 4; ++i) {
    circ2Pos = otherCir.center;
    v = circ2Pos.subtract(this.vertex[i]);
    projection = v.dot(this.faceNormal[i]);
    if (projection > 0) {
      // if the center of circle is outside of rectangle
      bestDistance = projection;
      nearestEdge = i;
      inside = false;
      break;
    }
    if (projection > bestDistance) {
      bestDistance = projection;
      nearestEdge = i;
    }
  }
  if (!inside) {
    // Step B1: If center is in region R1

    // v1 is from left vertex of face to center of Circle
    // v2 is from left vertex of face to right vertex of face
    var v1 = circ2Pos.subtract(this.vertex[nearestEdge]);
    var v2 = this.vertex[(nearestEdge + 1) % 4].subtract(
      this.vertex[nearestEdge]
    );

    var dot = v1.dot(v2);
    if (dot < 0) {
      // Region R1
      // the center of the circle is in corner region of vertex[nearestEdge]
      var dis = v1.length();
      if (dis > otherCir.radius) {
        return false;
      }
      var normal = v1.normalize();
      var radiusVec = normal.scale(-otherCir.radius);
      collisionInfo.setInfo(
        otherCir.radius - dis,
        normal,
        circ2Pos.add(radiusVec)
      );
    } else {
      // Not in region R1

      // Step B2: If center is in Region R2
      // the center of circle is in corner region of vertex[nearestEdge + 1]
      // v1 is from right vertec of face to center of Circle
      // v2 is from right vertex of face to left vertex of faceNormal
      var v1 = circ2Pos.subtract(this.vertex[(nearestEdge + 1) % 4]);
      var v2 = v2.scale(-1);

      var dot = v1.dot(v2);
      if (dot < 0) {
        // In Region R2
        var dis = v1.length();
        if (dis > otherCir.radius) {
          return false;
        }
        var normal = v1.normalize();
        var radiusVec = normal.scale(-otherCir.radius);
        collisionInfo.setInfo(
          otherCir.radius - dis,
          normal,
          circ2Pos.add(radiusVec)
        );
      } else {
        // Not in Region R2
        // Step B3: R3
        // the center of circle is in face region of face[nearestEdge]
        if (bestDistance < otherCir.radius) {
          var radiusVec = this.faceNormal[nearestEdge].scale(otherCir.radius);
          collisionInfo.setInfo(
            otherCir.radius - bestDistance,
            this.faceNormal[nearestEdge],
            circ2Pos.subtract(radiusVec)
          );
        } else {
          return false;
        }
      }
    }
  } else {
    // Step C: If center is inside
    var radiusVec = this.faceNormal[nearestEdge].scale(otherCir.radius);
    collisionInfo.setInfo(
      otherCir.radius - bestDistance,
      this.faceNormal[nearestEdge],
      circ2Pos.subtract(radiusVec)
    );
  }
  return true;
};

Circle.prototype.collisionTest = function(otherShape, collisionInfo) {
  var status = false;
  if (otherShape.type === "Circle") {
    status = this.collidedCircCirc(this, otherShape, collisionInfo);
  } else {
    status = otherShape.collidedRectCirc(this, collisionInfo);
  }
  return status;
};

Circle.prototype.collidedCircCirc = function(c1, c2, collisionInfo) {
  var vFrom1to2 = c2.center.subtract(c1.center);
  var rSum = c1.radius + c2.radius;
  var dist = vFrom1to2.length();
  if (dist > Math.sqrt(rSum * rSum)) {
    return false; //not overlapping
  }
  if (dist !== 0) {
    //overlapping but not in the same Position
    var normalFrom2to1 = vFrom1to2.scale(-1).normalize();
    var radiusC2 = normalFrom2to1.scale(c2.radius);
    collisionInfo.setInfo(
      rSum - dist,
      vFrom1to2.normalize(),
      c2.center.add(radiusC2)
    );
  } else {
    //same position
    if (c1.radius > c2.radius) {
      collisionInfo.setInfo(
        rSum,
        new Vec2(0, -1),
        c1.center.add(Vec2(0, c1.radius))
      );
    } else {
      collisionInfo.setInfo(
        rSum,
        new Vec2(0, -1),
        c2.center.add(Vec2(0, c2.radius))
      );
    }
  }
  return true;
};

var constraintIndex = new Indexer();

function Constraint(bodyA, bodyB, length, stiffness) {
  var self = this;
  this.index = constraintIndex.incrementIndex();
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.length = length;
  this.stiffness = stiffness;
}

Constraint.prototype.maintainConstraint = function() {};

Constraint.prototype.updateLink = function() {};

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

function NaiveDistance(bodyA, bodyB, length, stiffness) {
  Constraint.call(this, bodyA, bodyB, length, stiffness);
  this.minLength = 0.005; //From Matterjs - Contraints line 26

  var initialMiddlePoint = this.bodyA.center.add(this.bodyB.center);
  this.constraintLink = new Rectangle(
    initialMiddlePoint.x / 2,
    initialMiddlePoint.y / 2,
    this.bodyA.center.distance(this.bodyB.center),
    1,
    0,
    0.2,
    0,
    { name: "rod" }
  );
}

Common.extend(NaiveDistance, Constraint);

NaiveDistance.prototype.maintainConstraint = function(collisionInfo) {
  var aPos = this.bodyA.center;
  var bPos = this.bodyB.center;
  var vFromBtoA = bPos.subtract(aPos);
  var vFromAtoB = aPos.subtract(bPos);
  var distBA = vFromBtoA.length();
  var distAB = vFromAtoB.length();
  var normal = vFromAtoB.normalize();

  var normalFrom2to1 = vFromBtoA.normalize();
  var radiusC2 = normalFrom2to1.scale(this.length);

  var status = false;
  if (distBA < this.minLength) {
    distBA = this.minLength;
  }

  if (distBA > this.length) {
    collisionInfo.setInfo(
      this.length - distAB / distAB,
      normal.scale(this.bodyB.friction),
      this.bodyB.center.add(radiusC2)
    );

    status = true;
  } else if (distBA < this.length) {
    collisionInfo.setInfo(
      distAB - this.length / distAB,
      normal.scale(this.bodyB.friction),
      this.bodyB.center.add(radiusC2)
    );
    status = true;
  }

  return status;
};

NaiveDistance.prototype.updateLink = function() {
  this.middlePoint = this.bodyA.center.add(this.bodyB.center);

  this.constraintLink.center.x = this.middlePoint.x / 2;
  this.constraintLink.center.y = this.middlePoint.y / 2;
  this.constraintLink.width = this.bodyA.center.distance(this.bodyB.center);
  this.constraintLink.angle = this.bodyA.center.angleFromVector(
    this.bodyB.center
  );
};

NaiveDistance.prototype.updateConstraint = function() {
  this.maintainConstraint();
  this.updateLink();
};

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

function Factory() {}

Factory.prototype.createSquareGrid = function(
  x,
  y,
  squaresWidth,
  squaresHeight,
  spacing,
  rows,
  mass,
  friction,
  restitution
) {
  var count = 0;
  var squareGrid = [];
  //numberOfSquares = numberOfSquares / numberOfSquares;
  for (let i = 0; i < rows * spacing; i += spacing) {
    for (let j = 0; j < rows * spacing; j += spacing) {
      squareGrid[count] = new Kala.Rectangle(
        i + x,
        j + y,
        squaresWidth,
        squaresHeight,
        mass,
        friction,
        restitution
      );
      count++;
    }
  }
  return squareGrid;
};

Factory.prototype.createCircleGrid = function(
  x,
  y,
  circleRadius,
  spacing,
  rows,
  mass,
  friction,
  restitution
) {
  var count = 0;
  var squareGrid = [];
  //numberOfSquares = numberOfSquares / numberOfSquares;
  for (let i = 0; i < rows * spacing; i += spacing) {
    for (let j = 0; j < rows * spacing; j += spacing) {
      squareGrid[count] = new Kala.Circle(
        i + x,
        j + y,
        circleRadius,
        mass,
        friction,
        restitution
      );
      count++;
    }
  }
  return squareGrid;
};

var Kala = {};

Kala = (function() {
  Kala.Vec2 = Vec2;
  Kala.Indexer = Indexer;
  Kala.Engine = Engine;
  Kala.Physics = Physics;
  Kala.Body = Body;
  Kala.Rectangle = Rectangle;
  Kala.Circle = Circle;
  Kala.Render = PixiRender;
  Kala.Common = Common;
  Kala.Constraint = Constraint;
  Kala.DistanceConstraint = DistanceConstraint;
  Kala.NaiveDistance = NaiveDistance;
  Kala.Spring = Spring;
  Kala.Events = Events;
  Kala.Factory = Factory;

  return Kala;
})();
