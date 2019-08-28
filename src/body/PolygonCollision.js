function polygonConfiguration() {
  this.min;
  this.max;
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

Polygon.prototype.computeInterval = function(polygon, normal, polyConfig, collisionInfo) {
  var min = 999999;
  var max = -99999;
  var current;
  var interval = { min: 0, max: 0 };
  var bestVec;
  var dotProduct = normal.dot(polygon.vertices[0]);

  for (let i = 0; i < polygon.vertices.length; i++) {
    current = polygon.vertices[i].dot(normal); //normal.dot(polygon.vertices[i]);
    if (current < min) {
      min = interval.min = current;
      polyConfig.min = current;
      polyConfig.minIndex = i;
      polyConfig.normal = normal;
    }
    if (current > max) {
      max = interval.max = current;
      polyConfig.max = current;
      polyConfig.maxIndex = i;
      polyConfig.normal = normal;
      bestVec = normal.scale(max);
      //collisionInfo.setInfo(max, normal, polygon.vertices[i].add(bestVec));
    }
  }
  return interval;
};
var tmpSupport = new SupportStruct();

Polygon.prototype.findSupportPoint = function(dir) {
  var vertex;
  var projection;

  tmpSupport.supportPointDist = -9999999;
  tmpSupport.supportPoint = null;

  for (let i = 0; i < this.vertices.length; i++) {
    vertex = this.vertices[i];
    projection = vertex.dot(dir);
    if (projection > tmpSupport.supportPointDist) {
      tmpSupport.supportPoint = vertex;
      tmpSupport.supportPointDist = projection;
    }
  }
};

Polygon.prototype.findAxisLeastPenetration = function(otherPolygon, collisionInfo) {
  var n;
  var supportPoint;
  var bestDistance = 999999;
  var bestIndex = null;

  var hasSupport = true;
  var i = 0;

  while (hasSupport && i < this.faceNormals.length) {
    n = this.faceNormals[i];

    var dir = n;
    var ptOnEdge = this.vertices[i];

    otherPolygon.findSupportPoint(dir, ptOnEdge);
    hasSupport = tmpSupport.supportPoint !== null;
    if (hasSupport && tmpSupport.supportPointDist < bestDistance) {
      bestDistance = tmpSupport.supportPointDist;
      bestIndex = i;
      supportPoint = tmpSupport.supportPoint;
    }
    i++;
  }
  if (hasSupport) {
    var bestVec = this.faceNormals[bestIndex].scale(bestDistance);
    collisionInfo.setInfo(bestDistance, this.faceNormals[bestIndex], supportPoint.add(bestVec));
  }
  return hasSupport;
};

var collisionInfoR1 = new CollisionInfo();
var collisionInfoR2 = new CollisionInfo();

Polygon.prototype.collidedPolyPoly = function(otherPolygon, collisionInfo) {
  var status1 = false;
  var status2 = false;

  var polyConfig1 = new polygonConfiguration();
  var polyConfig2 = new polygonConfiguration();

  var interval1, interval2, d;
  for (let i = 0; i < this.faceNormals.length; i++) {
    d = this.faceNormals[i];
    interval1 = this.computeInterval(this, d, polyConfig1, collisionInfoR1);
    interval2 = this.computeInterval(otherPolygon, d, polyConfig2, collisionInfoR2);
    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      this.lineColor = null;
      return false;
    }
  }

  for (let i = 0; i < otherPolygon.faceNormals.length; i++) {
    d = otherPolygon.faceNormals[i];
    interval1 = this.computeInterval(this, d, polyConfig1, collisionInfoR1);
    interval2 = this.computeInterval(otherPolygon, d, polyConfig2, collisionInfoR2);
    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      this.lineColor = null;
      return false;
    }
  }
  //this.lineColor = "0xfc030f";
  var depth1 = interval1.max - interval2.min;
  var depth2 = interval2.max - interval1.min;

  if (depth1 < depth2) {
    collisionInfo.setInfo(depth1, polyConfig1.normal, this.vertices[polyConfig1.minIndex]);
  } else {
    collisionInfo.setInfo(depth2, polyConfig1.normal, this.vertices[polyConfig1.minIndex]);
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
