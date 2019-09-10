Circle.prototype.collisionTest = function(otherShape, collisionInfo) {
  var status = false;
  if (otherShape.type === "Circle") {
    status = this.collidedCircCirc(this, otherShape, collisionInfo);
  } else if (otherShape.type === "Rectangle") {
    status = otherShape.collidedRectCirc(this, collisionInfo);
  } else if (otherShape.type === "Polygon") {
    status = otherShape.collidedPolyCirc(this, collisionInfo);
  }
  return status;
};

Circle.prototype.collidedCircCirc = function(c1, c2, collisionInfo) {
  var vFrom1to2 = c2.center.subtract(c1.center);
  var rSum = c1.radius + c2.radius;
  var dist = vFrom1to2.length();
  if (dist > Math.sqrt(rSum * rSum)) {
    return false; //not overlapping
  }
  if (dist !== 0) {
    //overlapping but not in the same Position
    var normalFrom2to1 = vFrom1to2.scale(-1).normalize();
    var radiusC2 = normalFrom2to1.scale(c2.radius);
    collisionInfo.setInfo(rSum - dist, vFrom1to2.normalize(), c2.center.add(radiusC2));
  } else {
    //same position
    if (c1.radius > c2.radius) {
      collisionInfo.setInfo(rSum, new Vec2(0, -1), c1.center.add(Vec2(0, c1.radius)));
    } else {
      collisionInfo.setInfo(rSum, new Vec2(0, -1), c2.center.add(Vec2(0, c2.radius)));
    }
  }
  return true;
};

Circle.prototype.findInterval = function(normal) {
  normal = normal.perp();
  var dotProduct = this.center.dot(normal);
  var current;

  var min, max;
  min = dotProduct;
  max = min;

  // for (let i = 1; i < this.vertex.length; i++) {
  //   current = this.vertex[i].dot(normal);
  //   if (current > max) {
  //     max = current;
  //   }
  //   if (current < min) {
  //     min = current;
  //   }
  // }
  return { min: min, max: max };
};
