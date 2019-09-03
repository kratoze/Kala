// Geometric Tools For Computer Graphics pg 269
Polygon.prototype.collisionTest = function(otherShape, collisionInfo) {
  var status = false;
  if (otherShape.type === "Polygon") {
    status = this.collidedPolyPoly(this, otherShape, collisionInfo);
  }
  return status;
};

Polygon.prototype.findInterval = function(normal) {
  normal = normal.perp();
  var dotProduct = this.vertex[0].dot(normal);
  var current;

  var min, max;
  min = dotProduct;
  max = min;

  for (let i = 1; i < this.vertex.length; i++) {
    current = this.vertex[i].dot(normal);
    if (current > max) {
      max = current;
    }
    if (current < min) {
      min = current;
    }
  }

  return { min: min, max: max };
};

Polygon.prototype.polygonOverlaps = function(otherPoly) {
  var polyConfig1, polyConfig2, faceNormal, overlap;
  var dir;
  var minOverlap = 999999;
  var minNormal;

  var overlapInfo = {
    minNormal: null,
    minOverlap: 999999
  };

  for (let i = 0; i < this.faceNormal.length; i++) {
    faceNormal = this.faceNormal[i];
    polyConfig1 = this.findInterval(faceNormal);
    polyConfig2 = otherPoly.findInterval(faceNormal);
    overlap = Math.min(polyConfig1.max - polyConfig2.min, polyConfig2.max - polyConfig1.min);
    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      this.lineColor = null;
      return false;
    }
    if (overlap < overlapInfo.minOverlap) {
      overlapInfo.minOverlap = overlap;
      overlapInfo.minNormal = faceNormal.perp();
    }
  }

  for (let i = 0; i < otherPoly.faceNormal.length; i++) {
    faceNormal = otherPoly.faceNormal[i];
    polyConfig1 = this.findInterval(faceNormal);
    polyConfig2 = otherPoly.findInterval(faceNormal);
    overlap = Math.min(polyConfig1.max - polyConfig2.min, polyConfig2.max - polyConfig1.min);
    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      this.lineColor = null;
      return false;
    }
    if (overlap < overlapInfo.minOverlap) {
      overlapInfo.minOverlap = overlap;
      overlapInfo.minNormal = faceNormal.perp();
    }
  }

  return overlapInfo;
};

// The normalized axis multiplied with the shortest
// overlap will yield the penetration vector.
Polygon.prototype.collidedPolyPoly = function(polyA, polyB, collisionInfo) {
  var overlap1, overlap2, overlap;

  if (polyA.bodyID > polyB.bodyID) {
    var polyTmp = polyB;
    polyB = polyA;
    polyA = polyTmp;
  }

  overlap1 = polyA.polygonOverlaps(polyB);
  overlap2 = polyB.polygonOverlaps(polyA);

  if (!overlap1 || !overlap2) {
    return false;
  }
  if (overlap1.minOverlap < overlap2.minOverlap) {
    overlap = overlap1;
  } else {
    overlap = overlap2;
  }
  var penetrationVector = overlap.minNormal.perp().scale(overlap.minOverlap);

  this.dotTest = overlap.minNormal.dot(polyB.center.subtract(polyA.center));
  if (this.dotTest < 0) {
    overlap.minNormal = overlap.minNormal.scale(-1);
    penetrationVector = Vec2(0, 0);
  }

  var supportsA = polyA.findSupportPoints(overlap.minNormal.scale(-1), polyB);
  //console.log(overlap.minNormal);
  var supportsB = polyB.findSupportPoints(overlap.minNormal, polyA);
  //console.log(supportsB);

  var distance = overlap.minNormal.scale(-1).dot(supportsB[0]);
  //distance = distance / overlap.minNormal.scale(distance);
  var penetrationVector = overlap.minNormal.perp().scale(overlap.minOverlap);

  collisionInfo.setInfo(overlap.minOverlap, overlap.minNormal, supportsB[0]);

  return true;
};

Polygon.prototype.collidedPolyRect = function() {};

Polygon.prototype.collidedPolyCirc = function() {};

Polygon.prototype.findSupportPoints = function(dir) {
  //https://www.gamedev.net/forums/topic/453179-point-of-collision/
  var supports = [];
  var count = 0;
  var minDistance = 99999;
  var distance, vertex, index;
  for (let i = 0; i < this.vertex.length; i++) {
    vertex = this.vertex[i];
    distance = vertex.dot(dir);
    if (distance < minDistance) {
      minDistance = distance;
      supports[0] = vertex;
      index = i;
    }
  }
  var prevDistance, nextDistance;
  var nextIndex = index + 1 >= this.vertex.length ? 0 : index + 1;
  var prevIndex = index - 1 < 0 ? this.vertex.length - 1 : index - 1;
  vertex = this.vertex[prevIndex];
  prevDistance = vertex.dot(dir);
  vertex = this.vertex[nextIndex];
  nextDistance = vertex.dot(dir);
  //console.log("minDist:" + minDistance + " prevDistance: " + nextDistance);
  if (prevDistance === minDistance) {
    //console.log("edge");

    // support points are colinear, they form an edge
    supports[1] = this.vertex[prevIndex];
  } else if (nextDistance === minDistance) {
    //console.log("edge");
    // support points are colinear, they form an edge
    supports[1] = this.vertex[nextIndex];
  } else if (prevDistance < nextDistance) {
    supports[1] = this.vertex[prevIndex];
  } else {
    supports[1] = this.vertex[nextIndex];
  }

  //   else if (prevDistance === minDistance) {
  //     supports[1] = prevIndex;
  //     console.log("edge");
  //   } else {
  //     supports[1] = nextIndex;
  //   }
  return supports;
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
