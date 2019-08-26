function polygonConfiguration() {
  this.min;
  this.max;
  this.minIndex;
  this.maxIndex;
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

Polygon.prototype.collidedPolyPoly = function(otherPolygon, collisionInfo) {
  var interval1, interval2, d;
  for (let i = 0; i < this.faceNormals.length; i++) {
    d = this.faceNormals[i];
    interval1 = this.computeInterval(this, d);
    interval2 = this.computeInterval(otherPolygon, d);
    if (interval2.max < interval1.min || interval1.max < interval2.min) {
      this.lineColor = null;
      return false;
    }
  }

  for (let i = 0; i < otherPolygon.faceNormals.length; i++) {
    d = otherPolygon.faceNormals[i];
    interval1 = this.computeInterval(this, d);
    interval2 = this.computeInterval(otherPolygon, d);
    if (interval2.max < interval1.min || interval1.max < interval2.min) {
      this.lineColor = null;
      return false;
    }
  }
  var depth;
  this.lineColor = "0xfc030f";
  if (interval1.min < interval2.min) {
    depth = interval2.min - interval1.max;
  } else {
    depth = interval1.min - interval2.max;
  }
  //console.log(interval1);
  console.log(d);
  collisionInfo.setInfo(0, d, interval1.start);

  return true;
};

Polygon.prototype.collidedPolyRect = function() {};

Polygon.prototype.collidedPolyCirc = function() {};

Polygon.prototype.computeInterval = function(polygon, normal) {
  var min = 999999;
  var max = -99999;
  var current;
  var interval = { min: 0, max: 0 };

  var dotProduct = normal.dot(polygon.vertices[0]);

  for (let i = 0; i < polygon.vertices.length; i++) {
    current = normal.dot(polygon.vertices[i]); //normal.dot(polygon.vertices[i]);
    //console.log(current);
    if (current < min) {
      min = interval.min = current;
      interval.start = polygon.vertices[i];
    }
    if (current > max) {
      //console.log(max);
      max = interval.max = current;
      interval.start = polygon.vertices[i];
    }
  }
  //console.log(interval);
  return interval;
};

// Geometrics Tools for Computer Graphics pg.275
Polygon.prototype.notIntersecting = function(
  tMax,
  speed,
  interval1,
  interval2,
  tFirst,
  tLast
) {
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
