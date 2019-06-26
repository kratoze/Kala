function Engine() {
  var self = this;
  this.gravity = Vec2(0, 10);
  this.movement = false;

  this.currentTime;
  this.elapsedTime;
  this.previousTime = performance.now();
  this.lagTime = 0;
  this.kFPS = 60;
  this.frameTime = 1 / this.kFPS;
  this.updateIntervalInSeconds = this.frameTime;
  this.kMPF = 1000 * this.frameTime; //Milliseconds per frame

  this.lastTimeCalled;
  this.fps;

  this.allBodies = [];
  this.physics = new Kala.Physics();

  this.add = function(bodies) {
    if (Array.isArray(bodies)) {
      bodies.forEach(function(body) {
        if (body instanceof Body) self.allBodies.push(body);
      });
      console.log("Array of Bodies added");
    } else if (bodies instanceof Body) {
      self.allBodies.push(bodies);
      console.log("Body added");
    } else {
      throw "Only objects of type Body can be added to the engine";
    }
  };

  this.update = function() {
    for (var i = 0; i < this.allBodies.length; i++) {
      //console.log(this.allBodies[i].center);
      this.allBodies[i].update(this);
    }
    //console.log("Looped");
  };

  this.runGameLoop = function(render, constraints) {
    requestAnimationFrame(function() {
      self.runGameLoop(render, constraints);
    });

    self.currentTime = performance.now();
    self.elapsedTime = self.currentTime - self.previousTime;
    self.previousTime = self.currentTime;
    self.lagTime += self.elapsedTime;
    if (render) {
      render.update(this);
    }

    while (self.lagTime >= self.kMPF) {
      self.lagTime -= self.kMPF;
      if (constraints) {
        constraints.maintainConstraint();
      }
      this.physics.collision(this);
      this.update();
    }
    //this.update();
  };

  this.initializeEngineCore = function(render, constraints) {
    self.runGameLoop(render, constraints);
  };
}
