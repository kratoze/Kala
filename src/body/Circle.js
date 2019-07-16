var Circle = function(x, y, radius, mass, friction, restitution, options) {
  Body.call(this, x, y, mass, friction, restitution, options);
  this.type = "Circle";
  this.radius = radius;
  this.boundRadius = radius;
  this.startPoint = Vec2(x, y - radius);
  this.updateInertia();
};

Common.extend(Circle, Body);

// Circle.prototype.draw = function(context) {
//   context.beginPath();
//   context.arc(
//     this.center.x,
//     this.center.y,
//     this.radius,
//     0,
//     Math.PI * 2,
//     true
//   );
//   context.moveTo(this.startPoint.x, this.startPoint.y);
//   context.lineTo(this.center.x, this.center.y);
//   context.closePath();
//   context.stroke();
// };

Circle.prototype.move = function(s) {
  this.startPoint = this.startPoint.add(s);
  this.center = this.center.add(s);
  return this;
};

Circle.prototype.rotate = function(angle) {
  this.angle += angle;
  this.startPoint = this.startPoint.rotate(this.center, angle);
  return this;
};

Circle.prototype.updateInertia = function() {
  if (this.invMass === 0) {
    this.interia = 0;
  } else {
    // this.invMass is inverted!
    // Intertia = mass * radius°2
    // 12 is a constant value that can be changed
    this.inertia = ((1 / this.invMass) * (this.radius * this.radius)) / 12;
  }
};
