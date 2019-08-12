function CollisionInfo() {
  this.bodyA;
  this.bodyB;
  this.bodyAIndex;
  this.bodyBIndex;
  this.depth = 0;
  this.normal = new Vec2(0, 0);
  this.start = new Vec2(0, 0);
  this.end = new Vec2(0, 0);
}

CollisionInfo.prototype.setNormal = function(s) {
  this.normal = s;
};

CollisionInfo.prototype.getDepth = function() {
  return this.depth;
};

CollisionInfo.prototype.setDepth = function(s) {
  this.depth = s;
};

CollisionInfo.prototype.getNormal = function() {
  return this.normal;
};

CollisionInfo.prototype.setInfo = function(d, n, s) {
  this.depth = d;
  this.normal = n;
  this.start = s;
  this.end = s.add(n.scale(d));
};

CollisionInfo.prototype.changeDir = function() {
  this.normal = this.normal.scale(-1);
  var n = this.start;
  this.start = this.end;
  this.end = n;
};
