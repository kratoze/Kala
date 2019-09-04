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
  this.AABB = this.calculateAABB();
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
