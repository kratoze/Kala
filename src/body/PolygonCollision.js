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

var collisionInfoR1 = new CollisionInfo();
var collisionInfoR2 = new CollisionInfo();

Polygon.prototype.collidedPolyPoly = function(otherPolygon, collisionInfo) {
  var polyConfig1 = new polygonConfiguration();
  var polyConfig2 = new polygonConfiguration();

  var interval1, interval2, d;
  for (let i = 0; i < this.faceNormals.length; i++) {
    d = this.faceNormals[i];
    interval1 = this.computeInterval(this, d, polyConfig1);
    interval2 = this.computeInterval(otherPolygon, d, polyConfig2);
    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      this.lineColor = null;
      return false;
    }
  }

  for (let i = 0; i < otherPolygon.faceNormals.length; i++) {
    d = otherPolygon.faceNormals[i];
    interval1 = this.computeInterval(this, d, polyConfig1);
    interval2 = this.computeInterval(otherPolygon, d, polyConfig2);
    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      this.lineColor = null;
      return false;
    }
  }
  this.lineColor = "0xfc030f";

  collisionInfo.setInfo(polyConfig1.min / polyConfig1.min, polyConfig1.normal, this.vertices[polyConfig1.maxIndex]);

  // console.log(polyConfig1.min - polyConfig1.min / polyConfig1.min);
  // collisionInfo.setInfo(
  //   this.vertices[polyConfig1.maxIndex].subtract(Vec2(0, 25)).dot(polyConfig1.normal),
  //   polyConfig1.normal,
  //   this.vertices[polyConfig1.maxIndex]
  // );

  //console.log("max: " + polyConfig1.max + " min: " + polyConfig2.min);
  return true;
};

Polygon.prototype.collidedPolyRect = function() {};

Polygon.prototype.collidedPolyCirc = function() {};

Polygon.prototype.computeInterval = function(polygon, normal, polyConfig) {
  var min = 999999;
  var max = -99999;
  var current;
  var interval = { min: 0, max: 0 };

  var dotProduct = normal.dot(polygon.vertices[0]);

  for (let i = 0; i < polygon.vertices.length; i++) {
    current = polygon.vertices[i].dot(normal); //normal.dot(polygon.vertices[i]);
    //console.log(current);
    if (current < min) {
      min = interval.min = current;
      polyConfig.min = current;
      polyConfig.minIndex = i;
      polyConfig.normal = normal;
      //console.log(normal);
    }
    if (current > max) {
      max = interval.max = current;
      polyConfig.max = current;
      polyConfig.maxIndex = i;
      //polyConfig.normal = normal;
    }
  }
  //console.log(interval);
  return interval;
};

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

//SHIT BELOW
var SupportStruct = function() {
  this.supportPoint = null;
  this.supportPointDist = 0;
};

var tmpSupport = new SupportStruct();

Polygon.prototype.findSupportPoint = function(dir, ptOnEdge) {
  var vToEdge;
  var projection;
  tmpSupport.supportPointDist = -9999999;
  tmpSupport.supportPoint = null;
  //check each vector of other object
  for (var i = 0; i < this.vertices.length; i++) {
    vToEdge = this.vertices[i].subtract(ptOnEdge);
    projection = vToEdge.dot(dir);
    //find the longest distance with certain edge
    //dir is -n direction so the distance should be positive
    if (projection > 0 && projection > tmpSupport.supportPointDist) {
      tmpSupport.supportPoint = this.vertices[i];
      tmpSupport.supportPointDist = projection;
    }
  }
};

// DOESNT WORK
Polygon.prototype.findAxisLeastPenetration = function(otherRect, collisionInfo) {
  var n;
  var supportPoint;
  var bestDistance = 999999;
  var bestIndex = null;

  var hasSupport = true;
  var i = 0;

  while (hasSupport && i < this.faceNormals.length) {
    //Retrieve a face from A
    n = this.faceNormals[i];
    // use -n as a direction and
    // the vertex on edge i as point on edge
    var dir = n.scale(-1);
    var ptOnEdge = this.vertices[i];
    // find the support on B
    // the point has longest distance with edge i
    otherRect.findSupportPoint(dir, ptOnEdge);
    hasSupport = tmpSupport.supportPoint !== null;

    //get the shortest support point depth
    if (hasSupport && tmpSupport.supportPointDist < bestDistance) {
      console.log("here");
      bestDistance = tmpSupport.supportPointDist;
      bestIndex = i;
      supportPoint = tmpSupport.supportPoint;
    }
    i = i + 1;
  }
  if (hasSupport) {
    //all four direction have support point
    var bestVec = this.faceNormals[bestIndex].scale(bestDistance);
    collisionInfo.setInfo(bestDistance, this.faceNormals[bestIndex], supportPoint.add(bestVec));
  }
  return hasSupport;
};
