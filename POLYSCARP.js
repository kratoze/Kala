function polygonConfiguration() {
  this.min;
  this.max;
  this.perpMin;
  this.perpMax;
  this.minIndex;
  this.maxIndex;
  this.normal;
  this.collisionType = [];
}
// Geometric Tools For Computer Graphics pg 269
Polygon.prototype.collisionTest = function(otherShape, collisionInfo) {
  var status = false;
  if (otherShape.type === "Polygon") {
    status = this.collidedPolyPoly(otherShape, collisionInfo);
  }
  return status;
};

var collisionInfoR1 = new CollisionInfo();
var collisionInfoR2 = new CollisionInfo();

Polygon.prototype.findInterval = function(polygon, normal, polyConfig, collisionInfo) {
  var dotProduct = polygon.vertex[0].dot(normal);
  var min, max;
  min = 999999;
  max = -99999;

  var current = 0;
  var interval = { min: dotProduct, max: dotProduct };
  var bestVec;
  // console.log(polygon.vertex[0]);
  // console.log(normal);
  for (let i = 1; i < polygon.vertex.length; i++) {
    current = polygon.vertex[i].dot(normal); //normal.dot(polygon.vertex[i]); //polygon.vertex[i].dot(normal);
    if (current < interval.min) {
      interval.min = current;
      polyConfig.min = current;
      polyConfig.minIndex = i;
      polyConfig.normal = normal;
      polyConfig.perpMin = normal.perp().dot(polygon.vertex[i]);
    } else if (current > interval.max) {
      interval.max = current;
      polyConfig.max = current;
      polyConfig.maxIndex = i;
      polyConfig.perpMax = normal.perp().dot(polygon.vertex[i]);
    }
    return interval;
  }
};

Polygon.prototype.collidedPolyPoly = function(otherPolygon, collisionInfo) {
  var polyConfig1 = new polygonConfiguration();
  var polyConfig2 = new polygonConfiguration();
  var interval1, interval2, d;
  for (let i = 0; i < this.faceNormal.length; i++) {
    d = this.faceNormal[i].perp();
    //d = Vec2(this.faceNormal[i].y, -otherPolygon.faceNormal[i].x);
    interval1 = this.findInterval(this, d, polyConfig1, collisionInfoR1);
    interval2 = this.findInterval(otherPolygon, d, polyConfig2, collisionInfoR2);
    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      this.lineColor = null;
      return false;
    }
  }

  for (let i = 0; i < otherPolygon.faceNormal.length; i++) {
    d = otherPolygon.faceNormal[i].perp();
    //d = Vec2(otherPolygon.faceNormal[i].y, -otherPolygon.faceNormal[i].x);

    interval1 = this.findInterval(this, d, polyConfig1, collisionInfoR1);
    interval2 = this.findInterval(otherPolygon, d, polyConfig2, collisionInfoR2);
    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      this.lineColor = null;
      return false;
    }
  }
  var depth1 = polyConfig1.perpMax - polyConfig2.perpMin;
  var depth2 = polyConfig2.perpMax - polyConfig1.perpMin;
  // var depth1 = interval1.max - interval2.min;
  // var depth2 = interval2.max - interval1.min;
  this.lineColor = "0xfc030f";
  if (depth1 > depth2) {
    //collisionInfo.setInfo(depth1, polyConfig1.normal, this.vertex[polyConfig1.minIndex]);
  } else {
    //collisionInfo.setInfo(depth2, polyConfig1.normal, this.vertex[polyConfig1.minIndex]);
  }
  return true;
};

Polygon.prototype.collidedPolyRect = function() {};

Polygon.prototype.collidedPolyCirc = function() {};

// Geometrics Tools for Computer Graphics pg.275
Polygon.prototype.notIntersecting = function(tMax, speed, interval1, interval2, tFirst, tLast) {
  var t;
  if (interval2.max < interval1.min) {
    // other shape initially on left of interval
    if (speed <= 0) return true; // objects are moving apart, no intersection
    t = (interval1.min - interval2.max) / speed;
    if (t > tFirst) tFirst = t;
    if (tFirst > tMax) return true;
    t = (interval1.max - interval2.min) / speed;
    if (t < tLast) tLast = t;
    if (tFirst > tLast) return true;
  } else if (interval1.max < interval2.min) {
    // other shape initially on right of interval
    if (speed >= 0) return true; // objects are moving apart, no intersection
    t = (interval1.max - interval2.min) / speed;
    if (t > tFirst) tFirst = t;
    if (tFirst > tMax) return true;
    t = (interval1.min - interval2.max) / speed;
    if (t < tLast) tLast = t;
    if (tFirst > tLast) return true;
  } else {
    // intervals are overlapping
    if (speed > 0) {
      t = (interval1.max - interval2.min) / speed;
      if (t < tLast) tLast = t;
      if (tFirst > tLast) return true;
    } else if (speed < 0) {
      t = (interval1.min - interval2.max) / speed;
      if (t < tLast) tLast = t;
      if (tFirst > tLast) return true;
    }
  }
  return false;
};

var tmpSupport = new SupportStruct();

Polygon.prototype.findSupportPoint = function(dir, ptOnEdge) {
  var vToEdge;
  var projection;
  tmpSupport.supportPointDist = -9999999;
  tmpSupport.supportPoint = null;
  //check each vector of other object
  for (var i = 0; i < this.vertex.length; i++) {
    vToEdge = this.vertex[i].subtract(ptOnEdge);
    projection = vToEdge.dot(dir);
    //find the longest distance with certain edge
    //dir is -n direction so the distance should be positive
    if (projection > 0 && projection > tmpSupport.supportPointDist) {
      tmpSupport.supportPoint = this.vertex[i];
      tmpSupport.supportPointDist = projection;
    }
  }
};

Polygon.prototype.findAxisLeastPenetration = function(otherRect, collisionInfo) {
  var n;
  var supportPoint;
  var bestDistance = 999999;
  var bestIndex = null;

  var hasSupport = true;
  var i = 0;

  while (hasSupport && i < this.faceNormal.length) {
    //Retrieve a face from A
    n = this.faceNormal[i];
    // use -n as a direction and
    // the vertex on edge i as point on edge
    var dir = n.scale(-1);
    var ptOnEdge = this.vertex[i];
    // find the support on B
    // the point has longest distance with edge i
    otherRect.findSupportPoint(dir, ptOnEdge);
    hasSupport = tmpSupport.supportPoint !== null;
    //get the shortest support point depth
    if (hasSupport && tmpSupport.supportPointDist < bestDistance) {
      bestDistance = tmpSupport.supportPointDist;
      bestIndex = i;
      supportPoint = tmpSupport.supportPoint;
    }
    i = i + 1;
  }
  if (hasSupport) {
    //all four direction have support point
    var bestVec = this.faceNormal[bestIndex].scale(bestDistance);
    collisionInfo.setInfo(bestDistance, this.faceNormal[bestIndex], supportPoint.add(bestVec));
  }
  return hasSupport;
};
