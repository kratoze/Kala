var Kala = {};

Kala = (function(window) {
  function defineKala() {
    if (typeof Kala === "undefined") {
      window.Kala = defineKala();
    }
  }
  /*
      @class Vec2
                    */
  function Vec2(x, y) {
    return new Vec2.init(x, y);
  }

  Vec2.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  Vec2.prototype.add = function(vec) {
    return new Vec2(vec.x + this.x, vec.y + this.y);
  };

  Vec2.prototype.subtract = function(vec) {
    return new Vec2(this.x - vec.x, this.y - vec.y);
  };

  Vec2.prototype.scale = function(n) {
    return new Vec2(this.x * n, this.y * n);
  };

  Vec2.prototype.dot = function(vec) {
    return this.x * vec.x + this.y * vec.y;
  };

  Vec2.prototype.cross = function(vec) {
    return this.x * vec.y - this.y * vec.x;
  };

  Vec2.prototype.rotate = function(center, angle) {
    var r = [];
    var x = this.x - center.x;
    var y = this.y - center.y;

    r[0] = x * Math.cos(angle) - y * Math.sin(angle);
    r[1] = x * Math.sin(angle) + y * Math.cos(angle);

    r[0] += center.x;
    r[1] += center.y;

    return new Vec2(r[0], r[1]);
  };

  Vec2.prototype.normalize = function() {
    var len = this.length();
    if (len > 0) {
      len = 1 / len;
    }
    return new Vec2(this.x * len, this.y * len);
  };

  Vec2.prototype.distance = function(vec) {
    var x = this.x - vec.x;
    var y = this.y - vec.y;
    return Math.sqrt(x * x + y * y);
  };

  Vec2.init = function(x, y) {
    var self = this;
    self.x = x;
    self.y = y;
  };

  Vec2.init.prototype = Vec2.prototype;
  /*
      @class Body
                    */
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

    this.velocity = new Vec2(0, 0);

    if (this.invMass !== 0) {
      this.invMass = 1 / this.invMass;
      this.acceleration = Kala.Engine.gravity;
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

  function Engine() {
    var self = this;
    self.allBodies = [];
    self.gravity = Vec2(0, 10);

    Engine.prototype.add = function(bodies) {
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
  }

  Kala.Vec2 = Vec2;
  Kala.Body = Body;
  Kala.Engine = Engine;

  return Kala;
})(window);
