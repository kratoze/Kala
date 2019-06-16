var Rectangle = function(x, y, width, height, mass, friction, restitution) {
  Body.call(this, x, y, mass, friction, restitution);
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

var prototype = Object.create(Body.prototype);
prototype.constructor = Rectangle;
Rectangle.prototype = prototype;

// Rectangle.prototype.draw = function(context) {
//   context.save();
//   context.translate(this.vertex[0].x, this.vertex[0].y);
//   context.rotate(this.angle);
//   context.strokeRect(0, 0, this.width, this.height);
//   context.restore();
// };

Rectangle.prototype.move = function(v) {
  var i;
  for (i = 0; i < this.vertex.length; i++) {
    this.vertex[i] = this.vertex[i].add(v);
  }
  this.center = this.center.add(v);
  return this;
};

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
