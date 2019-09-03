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
 * @return {Number}     The dot product of the two Vectors
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
 * Returns the perpendicular of the Vector which is (y, -x)
 *
 * @return {Vec2}     The perpendicular Vector
 */
Vec2.prototype.perp = function() {
  return Vec2(this.y, -this.x);
};

/**
 * Calculates the distance between a Vector and this Vector
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
 * Finds the midpoint between 2 Vectors
 *
 * @param  {Vec2} vec The other Vector
 * @return {Vec2}     The midpoint as a Vector
 */
Vec2.prototype.midpoint = function(vec) {
  return Vec2((this.x + vec.x) / 2, (this.y + vec.y) / 2);
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
  this.hasChanged = false;

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

  /**
   * Adds a Body or array of Bodies to the engine's array of Bodies
   * @param  {Body[]} bodies The Body or array of Bodies to be added to the engine
   */
  this.add = function(bodies) {
    if (Array.isArray(bodies)) {
      bodies.forEach(function(body) {
        if (body instanceof Body) {
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
  this.removeBodyByIndex = function(bodyIndex) {
    this.allBodies.splice(bodyIndex, 1);
  };

  this.removeBody = function(body) {
    var index = this.allBodies.indexOf(body);
    if (index != -1) {
      this.removeBodyByIndex(index);
    }
    this.hasChanged = true;
  };

  this.addConstraint = function(constraint) {
    this.allConstraints.push(constraint);
  };

  this.removeConstraint = function(bodyIndex) {
    this.allConstraints.splice(bodyIndex, 1);
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

    // Call all Custom Events in the Engine's Events object
    if (this.events.customEvents) {
      Object.values(this.events.customEvents).forEach(value => {
        value.call();
      });
    }
    // Call all Collision Events in the Engine's Events objects
    // CollisionInfo can be accessed within an Event function
    if (this.collisionInfo) {
      Object.values(this.events.collisionEvents).forEach(value => {
        value.call();
      });
    }
    // Update renderer with new position and redraw
    if (render) {
      render.update(this);
    }

    while (self.lagTime >= self.kMPF) {
      self.lagTime -= self.kMPF;

      // Maintain any contraints in the Engine's Constraints array
      this.physics.maintainConstraints(self);

      // Detect and resolve collisions between bodies.
      // collisionInfo is returned by the physics and
      // stored for use in events
      this.collisionInfo = this.physics.collision(this);
      this.update(render);
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

function PixiRender(width, height, theme, scale) {
  var self = this;

  //Set up PIXI Application
  this.app = new PIXI.Application({
    height: width,
    width: height,
    backgroundColor: 0xfcfccf,
    antialias: true
  });
  this.scale = scale;
  document.body.appendChild(this.app.view);
  this.app.stage.scale.x = this.app.stage.scale.y = scale;

  var renderBodies = {};
  this.bodyContainer = new PIXI.Container();

  this.lineContainer = new PIXI.Container();
  this.loader = new PIXI.Loader();

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
      this.loader.add("sheet", "imgs/spritesheet_metal.json").load(onAssetsLoaded);

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
        sprites.rectTexture = self.loader.resources["sheet"].textures["elementMetal011.png"];
        break;
      case "space":
        sprites.rectTexture = self.loader.resources["ship"].texture;
        sprites.circleTexture = self.loader.resources["asteroid1"].texture;
        break;
      case "pool":
        sprites.rectTexture = self.loader.resources["wood"].texture;
        break;
      default:
        break;
    }
  }

  this.app.stage.addChild(this.bodyContainer);
  this.app.stage.addChild(this.lineContainer);

  this.addRectangle = function(rect) {
    renderBodies[rect.bodyID] = new PIXI.Sprite(rect.render.texture || sprites.rectTexture);
    renderBodies[rect.bodyID].anchor.x = renderBodies[rect.bodyID].anchor.y = 0.5;
    this.bodyContainer.addChild(renderBodies[rect.bodyID]);
    renderBodies[rect.bodyID].renderUpdate = this.updateBody;
    return renderBodies[rect.bodyID];
  };

  this.addCircle = function(circ) {
    renderBodies[circ.bodyID] = new PIXI.Sprite(circ.render.texture || sprites.circleTexture);
    renderBodies[circ.bodyID].anchor.x = renderBodies[circ.bodyID].anchor.y = 0.5;
    renderBodies[circ.bodyID].height = renderBodies[circ.bodyID].width = circ.radius * 2;
    this.bodyContainer.addChild(renderBodies[circ.bodyID]);
    renderBodies[circ.bodyID].renderUpdate = this.updateBody;
    return renderBodies[circ.bodyID];
  };

  this.addPolygon = function(polygon) {
    var polygonGraphics = renderBodies[polygon.bodyID];
    if (!polygonGraphics) {
      renderBodies[polygon.bodyID] = new PIXI.Graphics();
      this.bodyContainer.addChild(renderBodies[polygon.bodyID]);
      polygonGraphics = renderBodies[polygon.bodyID];
    }

    renderBodies[polygon.bodyID].renderUpdate = this.updatePolygon;
    return renderBodies[polygon.bodyID];
  };

  this.addShape = function(body) {
    switch (body.type) {
      case "Rectangle":
        return this.addRectangle(body);
      case "Circle":
        return this.addCircle(body);
      case "Polygon":
        return this.addPolygon(body);
      default:
        break;
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

  this.drawLine = function(v1, v2) {
    var graphics = new PIXI.Graphics();
    graphics.clear();

    this.lineContainer.addChild(graphics);

    graphics.lineStyle(1 / scale, 0x000000, 1);
    graphics.moveTo(v1.x, v1.y);
    graphics.lineTo(v2.x, v2.y);
  };

  this.renderEdge = function(v1, v2) {};

  this.updateBody = function(body) {
    var renderBody = renderBodies[body.bodyID];
    renderBody.position.x = body.center.x;
    renderBody.position.y = body.center.y;
    renderBody.width = body.radius ? body.radius * 2 : body.width;
    renderBody.height = body.radius ? body.radius * 2 : body.height;
    renderBody.rotation = body.angle;
  };

  this.updatePolygon = function(polygon) {
    var polygonGraphics = renderBodies[polygon.bodyID];
    polygonGraphics.clear();
    polygonGraphics.lineStyle(1 / scale, polygon.lineColor || 0x03f8fc);
    polygonGraphics.lineColor;
    //polygonGraphics.beginFill(0x3500fa, 1);
    polygonGraphics.drawPolygon(polygon.vertexToPath());
    //polygonGraphics.endFill();

    var midpoint;
    for (let i = 0; i < polygon.vertex.length - 1; i++) {
      //render.drawLine(this.vertex[i], this.vertex[i + 1]);
      midpoint = polygon.vertex[i].midpoint(polygon.vertex[i + 1]);
      self.drawLine(midpoint, midpoint.add(polygon.faceNormal[i].scale(10 / scale)));
    }
    //render.drawLine(polygon.vertex[0], polygon.vertex[polygon.vertex.length - 1]);
    midpoint = polygon.vertex[0].midpoint(polygon.vertex[polygon.vertex.length - 1]);
    self.drawLine(midpoint, midpoint.add(polygon.faceNormal[polygon.faceNormal.length - 1].scale(10 / scale)));
  };

  this.clear = function() {
    renderBodies = {};
    this.bodyContainer.removeChildren();
    this.lineContainer.removeChildren();
  };

  this.update = function(engine) {
    //if (engine.hasChanged) {
    this.clear();
    engine.hasChanged = false;
    //}

    var bodies = engine.allBodies;
    var renderBody;

    for (let i = 0; i < bodies.length; i++) {
      //bodies[i].draw(this);
      renderBody = renderBodies[bodies[i].bodyID];
      if (!renderBody) {
        renderBody = this.addShape(bodies[i]);
      }
      renderBody.renderUpdate(bodies[i]);
      //this.updateBody(bodies[i]);
    }
  };
}

//  https://github.com/Apress/building-a-2d-physics-game-engine/blob/master/978-1-4842-2582-0_source%20code/Chapter3/Chapter3.1BroadPhaseMethod/public_html/EngineCore/Core.js
function Physics() {
  var positionalCorrectionFlag = false;
  // number of relaxtion iterations
  var relaxationCount = 40;
  // percentafe of separation to project objects
  var posCorrectionRate = 0.8;

  var collision = function(engine) {
    //  if (engine.movement === true) {
    var i, j, k;
    var collisionInfo = new CollisionInfo();
    for (k = 0; k < relaxationCount; k++) {
      for (i = 0; i < engine.allBodies.length; i++) {
        for (j = i + 1; j < engine.allBodies.length; j++) {
          if (engine.allBodies[i].boundTest(engine.allBodies[j])) {
            if (engine.allBodies[i].collisionTest(engine.allBodies[j], collisionInfo)) {
              if (collisionInfo.getNormal().dot(engine.allBodies[j].center.subtract(engine.allBodies[i].center)) < 0) {
                collisionInfo.changeDir();
              }
              if (engine.allBodies[i].isSensor === true || engine.allBodies[j].isSensor === true) {
                collisionInfo.bodyA = engine.allBodies[i];
                collisionInfo.bodyAIndex = i;
                collisionInfo.bodyB = engine.allBodies[j];
                collisionInfo.bodyBIndex = j;
                return collisionInfo;
              } else {
                render.drawLine(collisionInfo.start, collisionInfo.end);
                resolveCollision(engine.allBodies[i], engine.allBodies[j], collisionInfo);
              }
            }
          }
        }
      }
    }
    //  }
  };

  var maintainConstraints = function(engine) {
    if (engine.movement === true) {
      var collisionInfo = new CollisionInfo();
      for (let k = 0; k < relaxationCount; k++) {
        for (let i = 0; i < engine.allConstraints.length; i++) {
          if (engine.allConstraints[i].maintainConstraint(collisionInfo)) {
            // resolveCollision(
            //   engine.allConstraints[i].bodyA,
            //   engine.allConstraints[i].bodyB,
            //   collisionInfo
            // );
            //engine.allConstraints[i].updateLink();
          }
        }
      }
    }
  };

  var positionalCorrection = function(s1, s2, collisionInfo) {
    var s1InvMass = s1.invMass;
    var s2InvMass = s2.invMass;

    var num = (collisionInfo.getDepth() / (s1InvMass + s2InvMass)) * posCorrectionRate;
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
    var start = collisionInfo.start.scale(s2.invMass / (s1.invMass + s2.invMass));
    var end = collisionInfo.end.scale(s1.invMass / (s1.invMass + s2.invMass));
    var p = start.add(end);
    // r is vector from center of shape to collision point
    var r1 = p.subtract(s1.center);
    var r2 = p.subtract(s2.center);

    var v1 = s1.velocity.add(Vec2(-1 * s1.angularVelocity * r1.y, s1.angularVelocity * r1.x));
    var v2 = s2.velocity.add(Vec2(-1 * s2.angularVelocity * r2.y, s2.angularVelocity * r2.x));
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
    jN = jN / (s1.invMass + s2.invMass + R1crossN * R1crossN * s1.inertia + R2crossN * R2crossN * s2.inertia);
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

    var jT = -(1 + newRestitution) * relativeVelocity.dot(tangent) * newFriction;
    jT = jT / (s1.invMass + s2.invMass + R1crossT * R1crossT * s1.inertia + R2crossT * R2crossT * s2.inertia);

    // friction should be less than force in normal direction
    if (jT > jN) {
      jT = jN;
    }
    // impulse is from s1 to s2 (opposite direction of velocity)
    impulse = tangent.scale(jT);
    //console.log(impulse);
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
  Common.globalID = 0;

  Common.extend = function(Child, Parent) {
    var prototype = Object.create(Parent.prototype);
    prototype.constructor = Child;
    Child.prototype = prototype;
    return Child;
  };

  Common.incrementIndexer = function() {
    return (Common.globalID += 1);
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

var SupportStruct = function() {
  this.supportPoint = null;
  this.supportPointDist = 0;
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
  this.bodyID = Common.incrementIndexer();
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

  // create an object to store render info
  this.render = {};
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
    //TO DO: CHANGE BACK TO FALSE

    return true; //not overlapping
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

var Polygon = function(vertex, mass, friction, restitution, options) {
  var self = this;
  // vertex is an array of Vec2
  this.vertex = vertex.slice();
  // find the center of the polygon once vertices are set
  var centroid = this.findCentroid();
  Body.call(this, centroid.x, centroid.y, mass, friction, restitution, options);
  this.sortVertices();

  this.type = "Polygon";
  // get the edges of the polygon and store in an array of Vec2
  this.edges = this.calculateEdges();
  // calculate the normals for each edge and store in an array of Vec2
  this.faceNormal = this.calculateFaceNormals();
  //this.sortVertices();

  // update the polygon's inertia using the mass
  this.updateInertia();
};

Common.extend(Polygon, Body);

/**
 * Moves the Polygon by a given Vec2.  Use this to move Polygon instead of
 * directly assigning to its center.
 *
 * @param  {Vec2} v description
 * @return {Polygon}   Returns this Polygon
 */
Polygon.prototype.move = function(v) {
  // move each vertex by the vector passed in
  for (let i = 0; i < this.vertex.length; i++) {
    this.vertex[i] = this.vertex[i].add(v);
  }
  this.edges = this.calculateEdges();
  this.faceNormal = this.calculateFaceNormals();
  // move the center
  this.center = this.center.add(v);
  return this;
};

/**
 * Rotates the Polygon around its center.  Use this to rotate the Polygon
 * instead of directly assigning to its angle.
 *
 * @param  {number} angle description
 */
Polygon.prototype.rotate = function(angle) {
  //angle = angle;
  this.angle += angle;
  // rotate each vertex around the polygon's center
  for (let i = 0; i < this.vertex.length; i++) {
    this.vertex[i] = this.vertex[i].rotate(this.center, angle);
  }
  // new orientation requires edges and face normals to be calculated again.
  this.edges = this.calculateEdges();
  this.faceNormal = this.calculateFaceNormals();
  return this;
};

/**
 * Calculates the Polygon's edges from its vertex.
 * Called automatically by the constructor and Rotate method
 *
 * @return {Vec2[]}  An array containing the Edges
 */
Polygon.prototype.calculateEdges = function() {
  var tmpEdges = [];
  for (let i = 0; i < this.vertex.length - 1; i++) {
    tmpEdges[i] = this.vertex[i].subtract(this.vertex[i + 1]);
  }
  tmpEdges[tmpEdges.length] = this.vertex[this.vertex.length - 1].subtract(this.vertex[0]);
  return tmpEdges;
};

/**
 * Calculate the face normals of the Polygon.
 * A face normal is a unit vector that is perpendicular to
 * an edge.
 * Called automatically by the constructor and Rotate method
 *
 * @return {Vec2[]}  An array containing the face normals
 */
Polygon.prototype.calculateFaceNormals = function() {
  var tmpFNormals = [];

  for (let i = 0; i < this.edges.length; i++) {
    // perpendicular normals
    // tmpFNormals[i] = Vec2(this.edges[i].y, -this.edges[i].x);
    // tmpFNormals[i] = tmpFNormals[i].normalize();

    // parallel normals
    tmpFNormals[i] = this.edges[i].normalize();
  }
  return tmpFNormals;
};

/**
 * Returns an array unformatted array of the Polygon's vertex.
 * Useful for passing the vertex to other APIs
 *
 * @return {number[]}  The vertex points as an array
 */
Polygon.prototype.vertexToPath = function() {
  var vertexArray = [];
  for (let i = 0; i < this.vertex.length; i++) {
    vertexArray.push(this.vertex[i].x);
    vertexArray.push(this.vertex[i].y);
  }
  return vertexArray;
};

/**
 * Finds the center of the Polygon.
 * Called automatically in the constructor.
 *
 * @return {Vec2}  The centroid, or center, of the Polygon.
 */
Polygon.prototype.findCentroid = function() {
  // formula from https://en.wikipedia.org/wiki/Centroid#Of_a_polygon
  // with help from https://stackoverflow.com/questions/2792443/finding-the-centroid-of-a-polygon
  var signedArea = 0,
    a,
    v0,
    v1;
  var centroid = Vec2(0, 0);

  // calculate the signed area between vertex
  for (let i = 0; i < this.vertex.length - 1; i++) {
    // calculate the current and next vertex
    v0 = this.vertex[i];
    v1 = this.vertex[i + 1];

    // a = (xi * yi+1 - xi+1 * yi)
    a = v0.x * v1.y - v1.x * v0.y;
    signedArea += a;
    centroid.x += (v0.x + v1.x) * a;
    centroid.y += (v0.y + v1.y) * a;
  }

  // calulate the signed area between the last and first vertex
  v0 = this.vertex[this.vertex.length - 1];
  v1 = this.vertex[0];
  a = v0.x * v1.y - v1.x * v0.y;
  signedArea += a;
  centroid.x += (v0.x + v1.x) * a;
  centroid.y += (v0.y + v1.y) * a;

  // the centroid is the sum of a*(Xi+Xi+1) divided by signedArea * 6
  signedArea = signedArea / 2;
  centroid.x = centroid.x / (6 * signedArea);
  centroid.y = centroid.y / (6 * signedArea);

  return centroid;
};

Polygon.prototype.sortVertices = function() {
  var angleFromCenter;
  var center = this.center;
  //for (let i = 0; i < this.vertex.length - 1; i++) {
  // angleFromCenterV1 = this.center.angleFromVector(this.vertex[i]);
  // angleFromCenterV2 = this.center.angleFromVector(this.vertex[i]);

  this.vertex.sort(function(a, b) {
    return a.angleFromVector(center) - b.angleFromVector(center);
  });
  //  }
};

var centroidGraphic = new PIXI.Graphics();

Polygon.prototype.draw = function(render) {
  centroidGraphic.clear();
  render.app.stage.addChild(centroidGraphic);
  centroidGraphic.lineStyle(1 / render.scale);

  centroidGraphic.drawCircle(this.center.x, this.center.y, 10 / render.scale);

  //render.drawPolygon(this);
  // var midpoint;
  // for (let i = 0; i < this.vertex.length - 1; i++) {
  //   //render.drawLine(this.vertex[i], this.vertex[i + 1]);
  //   midpoint = this.vertex[i].midpoint(this.vertex[i + 1]);
  //   render.drawLine(midpoint, midpoint.add(this.faceNormal[i].scale(10)));
  // }
  // //render.drawLine(this.vertex[0], this.vertex[this.vertex.length - 1]);
  // midpoint = this.vertex[0].midpoint(this.vertex[this.vertex.length - 1]);
  // render.drawLine(midpoint, midpoint.add(this.faceNormal[2].scale(10)));
};

/**
 * Updates the inertia based on the Polygon's mass and area.
 * Should only be run in the constructor or when updateMass is called
 */
Polygon.prototype.updateInertia = function() {
  // inertia= mass*area
  //
  // find the area of the polygon
  // area = sum of (XnYn+1 - YnXn+1) / 2
  // where n is number of vertex
  if (this.invMass === 0) {
    this.inertia = 0;
  } else {
    var areaSum = 0;
    var area;
    for (let i = 0; i < this.vertex - 1; i++) {
      areaSum += this.vertex[i].x * this.vertex[i + 1].y - this.vertex[i].y * this.vertex[i + 1].x;
    }
    areaSum +=
      this.vertex[this.vertex.length - 1].x * this.vertex[0].y - this.vertex[this.vertex.length - 1].y * this.vertex[0].x;
    areaSum = Math.abs(areaSum);
    area = areaSum / 2;
    this.inertia = ((1 / this.invMass) * area) / 12;
    this.inertia = 1 / this.inertia;
  }
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
var Rectangle = function(x, y, width, height, mass, friction, restitution, options) {
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
 * Moves the Rectangle by a given Vec2. Use this to affect the Rectangle's positon instead of assigning to its center
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
 * Rotates the Rectangle around its center. Use this to affect the angle instead of assigning directly to the angle
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
 * Updates the inertia based on the Rectangle's mass.
 * Should only be run in the constructor or when updateMass is called
 */
Rectangle.prototype.updateInertia = function() {
  // Expect InvMass to already be inverted!
  if (this.invMass === 0) {
    this.inertia = 0;
  } else {
    // inertia=mass*width°2+height°2
    this.inertia = ((1 / this.invMass) * (this.width * this.width + this.height * this.height)) / 12;
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

Rectangle.prototype.findAxisLeastPenetration = function(otherRect, collisionInfo) {
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
    collisionInfo.setInfo(bestDistance, this.faceNormal[bestIndex], supportPoint.add(bestVec));
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
        var depthVec = collisionInfoR1.getNormal().scale(collisionInfoR1.getDepth());
        collisionInfo.setInfo(
          collisionInfoR1.getDepth(),
          collisionInfoR1.getNormal(),
          collisionInfoR1.start.subtract(depthVec)
        );
      } else {
        collisionInfo.setInfo(collisionInfoR2.getDepth(), collisionInfoR2.getNormal().scale(-1), collisionInfoR2.start);
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
    var v2 = this.vertex[(nearestEdge + 1) % 4].subtract(this.vertex[nearestEdge]);

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
      collisionInfo.setInfo(otherCir.radius - dis, normal, circ2Pos.add(radiusVec));
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
        collisionInfo.setInfo(otherCir.radius - dis, normal, circ2Pos.add(radiusVec));
      } else {
        // Not in Region R2
        // Step B3: R3
        // the center of circle is in face region of face[nearestEdge]
        if (bestDistance < otherCir.radius) {
          var radiusVec = this.faceNormal[nearestEdge].scale(otherCir.radius);
          collisionInfo.setInfo(otherCir.radius - bestDistance, this.faceNormal[nearestEdge], circ2Pos.subtract(radiusVec));
        } else {
          return false;
        }
      }
    }
  } else {
    // Step C: If center is inside
    var radiusVec = this.faceNormal[nearestEdge].scale(otherCir.radius);
    collisionInfo.setInfo(otherCir.radius - bestDistance, this.faceNormal[nearestEdge], circ2Pos.subtract(radiusVec));
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

// Geometric Tools For Computer Graphics pg 269
Polygon.prototype.collisionTest = function(otherShape, collisionInfo) {
  var status = false;
  if (otherShape.type === "Polygon") {
    status = this.collidedPolyPoly(this, otherShape, collisionInfo);
  }
  return status;
};

Polygon.prototype.findInterval = function(normal) {
  normal = normal.perp();
  var dotProduct = this.vertex[0].dot(normal);
  var current;

  var min, max;
  min = dotProduct;
  max = min;

  for (let i = 1; i < this.vertex.length; i++) {
    current = this.vertex[i].dot(normal);
    if (current > max) {
      max = current;
    }
    if (current < min) {
      min = current;
    }
  }

  return { min: min, max: max };
};

Polygon.prototype.polygonOverlaps = function(otherPoly) {
  var polyConfig1, polyConfig2, faceNormal, overlap;
  var dir;
  var minOverlap = 999999;
  var minNormal;

  var overlapInfo = {
    minNormal: null,
    minOverlap: 999999
  };

  for (let i = 0; i < this.faceNormal.length; i++) {
    faceNormal = this.faceNormal[i];
    polyConfig1 = this.findInterval(faceNormal);
    polyConfig2 = otherPoly.findInterval(faceNormal);
    overlap = Math.min(polyConfig1.max - polyConfig2.min, polyConfig2.max - polyConfig1.min);
    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      this.lineColor = null;
      return false;
    }
    if (overlap < overlapInfo.minOverlap) {
      overlapInfo.minOverlap = overlap;
      overlapInfo.minNormal = faceNormal.perp();
    }
  }

  for (let i = 0; i < otherPoly.faceNormal.length; i++) {
    faceNormal = otherPoly.faceNormal[i];
    polyConfig1 = this.findInterval(faceNormal);
    polyConfig2 = otherPoly.findInterval(faceNormal);
    overlap = Math.min(polyConfig1.max - polyConfig2.min, polyConfig2.max - polyConfig1.min);
    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      this.lineColor = null;
      return false;
    }
    if (overlap < overlapInfo.minOverlap) {
      overlapInfo.minOverlap = overlap;
      overlapInfo.minNormal = faceNormal.perp();
    }
  }

  return overlapInfo;
};

// The normalized axis multiplied with the shortest
// overlap will yield the penetration vector.
Polygon.prototype.collidedPolyPoly = function(polyA, polyB, collisionInfo) {
  var overlap1, overlap2, overlap;

  if (polyA.bodyID > polyB.bodyID) {
    var polyTmp = polyB;
    polyB = polyA;
    polyA = polyTmp;
  }

  overlap1 = polyA.polygonOverlaps(polyB);
  overlap2 = polyB.polygonOverlaps(polyA);

  if (!overlap1 || !overlap2) {
    return false;
  }
  if (overlap1.minOverlap < overlap2.minOverlap) {
    overlap = overlap1;
  } else {
    overlap = overlap2;
  }
  var penetrationVector = overlap.minNormal.perp().scale(overlap.minOverlap);

  this.dotTest = overlap.minNormal.dot(polyB.center.subtract(polyA.center));
  if (this.dotTest < 0) {
    overlap.minNormal = overlap.minNormal.scale(-1);
    penetrationVector = Vec2(0, 0);
  }

  var supportsA = polyA.findSupportPoints(overlap.minNormal.scale(-1), polyB);
  //console.log(overlap.minNormal);
  var supportsB = polyB.findSupportPoints(overlap.minNormal, polyA);
  //console.log(supportsB);

  var distance = overlap.minNormal.scale(-1).dot(supportsB[0]);
  //distance = distance / overlap.minNormal.scale(distance);
  var penetrationVector = overlap.minNormal.perp().scale(overlap.minOverlap);

  collisionInfo.setInfo(overlap.minOverlap, overlap.minNormal, supportsB[0]);

  return true;
};

Polygon.prototype.collidedPolyRect = function() {};

Polygon.prototype.collidedPolyCirc = function() {};

Polygon.prototype.findSupportPoints = function(dir) {
  //https://www.gamedev.net/forums/topic/453179-point-of-collision/
  var supports = [];
  var count = 0;
  var minDistance = 99999;
  var distance, vertex, index;
  for (let i = 0; i < this.vertex.length; i++) {
    vertex = this.vertex[i];
    distance = vertex.dot(dir);
    if (distance < minDistance) {
      minDistance = distance;
      supports[0] = vertex;
      index = i;
    }
  }
  var prevDistance, nextDistance;
  var nextIndex = index + 1 >= this.vertex.length ? 0 : index + 1;
  var prevIndex = index - 1 < 0 ? this.vertex.length - 1 : index - 1;
  vertex = this.vertex[prevIndex];
  prevDistance = vertex.dot(dir);
  vertex = this.vertex[nextIndex];
  nextDistance = vertex.dot(dir);
  //console.log("minDist:" + minDistance + " prevDistance: " + nextDistance);
  if (prevDistance === minDistance) {
    //console.log("edge");

    // support points are colinear, they form an edge
    supports[1] = this.vertex[prevIndex];
  } else if (nextDistance === minDistance) {
    //console.log("edge");
    // support points are colinear, they form an edge
    supports[1] = this.vertex[nextIndex];
  } else if (prevDistance < nextDistance) {
    supports[1] = this.vertex[prevIndex];
  } else {
    supports[1] = this.vertex[nextIndex];
  }

  //   else if (prevDistance === minDistance) {
  //     supports[1] = prevIndex;
  //     console.log("edge");
  //   } else {
  //     supports[1] = nextIndex;
  //   }
  return supports;
};

// Geometrics Tools for Computer Graphics pg.275
Polygon.prototype.notIntersecting = function(tMax, speed, interval1, interval2, tFirst, tLast) {
  var t;
  if (interval2.max < interval1.min) {
    // other shape initially on left of interval
    if (speed <= 0) return true; // objects are moving apart, no intersection
    t = (interval1.min - interval2.max) / speed;
    if (t > tFirst) tFirst = t;
    if (tFirst > tMax) return true;
    t = (interval1.max - interval2.min) / speed;
    if (t < tLast) tLast = t;
    if (tFirst > tLast) return true;
  } else if (interval1.max < interval2.min) {
    // other shape initially on right of interval
    if (speed >= 0) return true; // objects are moving apart, no intersection
    t = (interval1.max - interval2.min) / speed;
    if (t > tFirst) tFirst = t;
    if (tFirst > tMax) return true;
    t = (interval1.min - interval2.max) / speed;
    if (t < tLast) tLast = t;
    if (tFirst > tLast) return true;
  } else {
    // intervals are overlapping
    if (speed > 0) {
      t = (interval1.max - interval2.min) / speed;
      if (t < tLast) tLast = t;
      if (tFirst > tLast) return true;
    } else if (speed < 0) {
      t = (interval1.min - interval2.max) / speed;
      if (t < tLast) tLast = t;
      if (tFirst > tLast) return true;
    }
  }
  return false;
};

var constraintIndex = new Indexer();

function Constraint(bodyA, bodyB, length, stiffness) {
  var self = this;
  this.index = constraintIndex.incrementIndex();
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.restingAngleA = this.bodyA.angle;
  this.restingAngleB = this.bodyB.angle;
  this.length = length;
  this.stiffness = stiffness;
  this.minLength = 0.0000001;
}

Constraint.prototype.maintainConstraint = function() {};

Constraint.prototype.updateLink = function() {};

Constraint.prototype.initialiseConstraint = function() {};

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
  // find the length of the vector bettwee B and A
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
  this.bodyA.velocity = this.bodyA.velocity.add(
    impulse.scale(this.bodyA.invMass * this.stiffness)
  );
  this.bodyB.velocity = this.bodyB.velocity.subtract(
    impulse.scale(this.bodyB.invMass * this.stiffness)
  );
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

function NaiveDistance(bodyA, bodyB, length, stiffness) {
  Constraint.call(this, bodyA, bodyB, length, stiffness);
  this.minLength = 0.0000005; //From Matterjs - Contraints line 26

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
  var normal = vFromBtoA.normalize();

  var normalFrom2to1 = vFromBtoA.normalize();
  var radiusC2 = normalFrom2to1.scale(this.length);

  var status = false;
  if (distBA < this.minLength) {
    distBA = this.minLength;
  }

  if (distBA > this.length) {
    collisionInfo.setInfo(
      this.length - distBA,
      normal,
      this.bodyB.center.add(radiusC2)
    );

    status = true;
  } else if (distBA < this.length) {
    collisionInfo.setInfo(
      this.length - distBA,
      normal.scale(-1),
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
