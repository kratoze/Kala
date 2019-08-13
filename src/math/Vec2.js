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
 * @return {Vec2}     The dot product of the two Vectors
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
 * Caclulates the distance between a Vector and this Vector
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
