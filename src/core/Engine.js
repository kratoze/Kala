function Engine() {
  //this.gravity = Vec2(0, 10);

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

  this.lastTimeCalled;
  this.fps;

  this.allBodies = [];
  this.allConstraints = [];
  this.physics = new Kala.Physics();

  this.add = function(bodies) {
    if (Array.isArray(bodies)) {
      bodies.forEach(function(body) {
        if (body instanceof Body) {
          //self.applyGravity(body);
          self.allBodies.push(body);
        }
      });
      console.log("Array of Bodies added : Engine");
    } else if (bodies instanceof Body) {
      //self.applyGravity(bodies);
      self.allBodies.push(bodies);
      console.log("Body added : Engine");
    } else {
      throw "Only objects of type Body can be added to the engine";
    }
  };

  this.addConstraint = function(constraint) {
    this.allConstraints.push(constraint);
  };
  this.update = function() {
    for (var i = 0; i < this.allBodies.length; i++) {
      //console.log(this.allBodies[i].center);
      this.allBodies[i].update(this);
    }
    //console.log("Looped");
  };
  //
  // this.applyGravity = function(body) {
  //   if (body.invMass !== 0) {
  //     body.acceleration = self.gravity;
  //   } else {
  //     body.acceleration = Vec2(0, 0);
  //   }
  // };

  this.runGameLoop = function(render) {
    requestAnimationFrame(function() {
      self.runGameLoop(render);
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
      if (this.allConstraints.length != 0) {
        this.physics.maintainConstraints(this);
      }
      this.physics.collision(this);
      this.update();
    }
    //this.update();
  };

  this.initializeEngineCore = function(render) {
    self.runGameLoop(render);
  };
}

Engine.gravity = Vec2(0, 10);
