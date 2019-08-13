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
