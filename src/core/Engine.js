function Engine(name) {
  var self = this;
  this.name = name;
  this.gravity = Vec2(0, 10);
  this.movement = false;

  this.currentTime;
  this.elapsedTime;
  this.previousTime;
  this.lagTime;

  this.kFPS = 60;
  this.frameTime = 1 / this.kFPS;
  this.updateIntervalInSeconds = this.frameTime;

  self.allBodies = [];
  this.gravity = Vec2(0, 10);

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
      console.log(this.allBodies[i].center);
      this.allBodies[i].update(this);
    }
    console.log("Looped");
  };

  this.runGameLoop = function() {
    requestAnimationFrame(function() {
      self.runGameLoop();
    });

    self.currentTime = Date.now();
    self.elapsedTime = self.currentTime - self.previousTime;
    self.previousTime = self.currentTime;
    self.lagTime += self.elapsedTime;
    while (self.lagTime >= self.kMPF) {
      self.lagTime -= self.kMPF;
    }
    this.update();
  };

  this.initializeEngineCore = function() {
    self.runGameLoop();
  };
}
