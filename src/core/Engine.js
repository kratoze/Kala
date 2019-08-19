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
  this.removeBody = function(bodyIndex) {
    this.allBodies.splice(bodyIndex, 1);
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
