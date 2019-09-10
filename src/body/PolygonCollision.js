// Geometric Tools For Computer Graphics pg 269

Polygon.prototype.collisionTest = function(otherShape, collisionInfo) {
  var status = false;
  if (otherShape.type === "Polygon") {
    status = this.collidedPolyPoly(this, otherShape, collisionInfo);
  } else if (otherShape.type === "Rectangle") {
    status = this.collidedPolyRect(this, otherShape, collisionInfo);
  } else if (otherShape.type === "Circle") {
    status = this.collidedPolyCirc(otherShape, collisionInfo);
  }

  return status;
};

Polygon.prototype.collidedPolyPoly = function(polyA, polyB, collisionInfo) {
  var overlap;
  if (polyA.bodyID > polyB.bodyID) {
    var polyTmp = polyB;
    polyB = polyA;
    polyA = polyTmp;
  }

  overlap = polyA.polygonOverlaps(polyB);

  if (!overlap) return false;

  var dotTest = overlap.minNormal.dot(polyB.center.subtract(polyA.center));
  if (dotTest < 0) {
    overlap.minNormal = overlap.minNormal.scale(-1);
  }

  var supportsB = polyB.findSupportPoint(overlap.minNormal);
  collisionInfo.setInfo(overlap.minOverlap, overlap.minNormal, supportsB[0]);

  return true;
};

/**
 * Detects collision between Polygon and Circle.
 * Currently the collision info set by this method is incorrect and needs to
 * consider the objects' relative positions.
 *
 * @param  {Circle} otherCirc     The Circle being tested against the Polygon
 * @param  {type}   collisionInfo The collision info
 * @return {bool}                 Return true is a collision has occured
 */
Polygon.prototype.collidedPolyCirc = function(otherCirc, collisionInfo) {
  var config1, config2, overlap;

  var overlapInfo = {
    minNormal: null,
    minOverlap: 999999
  };

  var closestVertex = this.findClosestVertex(otherCirc);

  var axis = closestVertex.subtract(otherCirc.center).normalize();
  config1 = this.findInterval(axis);
  config2 = otherCirc.findInterval(axis);
  overlap = Math.min(config1.max - config2.min, config2.max - config1.min);
  if (config2.max + otherCirc.radius < config1.min || config1.max < config2.min - otherCirc.radius) {
    return false;
  }
  if (overlap < overlapInfo.minOverlap) {
    overlapInfo.minOverlap = overlap + otherCirc.radius;
    overlapInfo.minNormal = axis.perp();
  }

  for (let i = 0; i < this.faceNormal.length; i++) {
    var faceNormal = this.faceNormal[i];
    config1 = this.findInterval(faceNormal);
    config2 = otherCirc.findInterval(faceNormal);
    overlap = Math.min(config1.max - config2.min, config2.max - config1.min);
    if (config2.max + otherCirc.radius < config1.min || config1.max < config2.min - otherCirc.radius) {
      return false;
    }
    if (overlap < overlapInfo.minOverlap) {
      overlapInfo.minOverlap = overlap + otherCirc.radius;
      overlapInfo.minNormal = faceNormal.perp();
    }
  }
  var depthVec = axis.scale(otherCirc.radius);
  collisionInfo.setInfo(overlapInfo.minOverlap, overlapInfo.minNormal.scale(-1), otherCirc.center.add(depthVec));

  return true;
};

Polygon.prototype.collidedPolyRect = function(polyA, rectB, collisionInfo) {
  var overlapInfo = {
    minNormal: null,
    minOverlap: 999999
  };

  if (!this.projectOntoAxes(polyA, rectB, overlapInfo) || !this.projectOntoAxes(rectB, polyA, overlapInfo)) {
    return false;
  }

  var dotTest = overlapInfo.minNormal.dot(rectB.center.subtract(polyA.center));
  if (dotTest < 0) {
    overlapInfo.minNormal = overlapInfo.minNormal.scale(-1);
  }

  var supportsA = polyA.findSupportPoint(overlapInfo.minNormal.scale(-1));
  var supportsB = rectB.findSupportPoint(overlapInfo.minNormal, supportsA[0]);
  var penetrationVector = overlapInfo.minNormal.scale(overlapInfo.minOverlap);

  collisionInfo.setInfo(overlapInfo.minOverlap, overlapInfo.minNormal, supportsA[0]);

  return true;
};

Polygon.prototype.polygonOverlaps = function(otherPoly) {
  var overlapInfo = {
    minNormal: null,
    minOverlap: 999999
  };

  if (!this.projectOntoAxes(this, otherPoly, overlapInfo) || !otherPoly.projectOntoAxes(this, otherPoly, overlapInfo)) {
    return false;
  }

  return overlapInfo;
};

Polygon.prototype.projectOntoAxes = function(polyA, polyB, overlapInfo) {
  var polyConfig1, polyConfig2, faceNormal, overlap;

  for (let i = 0; i < polyA.faceNormal.length; i++) {
    faceNormal = polyA.faceNormal[i];
    polyConfig1 = polyA.findInterval(faceNormal);
    polyConfig2 = polyB.findInterval(faceNormal);
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

  for (let i = 0; i < polyB.faceNormal.length; i++) {
    faceNormal = polyB.faceNormal[i];
    polyConfig1 = polyA.findInterval(faceNormal);
    polyConfig2 = polyB.findInterval(faceNormal);
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
  return true;
};

Polygon.prototype.findSupportPoint = function(dir) {
  //https://www.gamedev.net/forums/topic/453179-point-of-collision/
  var supports = [];
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

  if (prevDistance === minDistance) {
    // support points are colinear, they form an edge
    supports[1] = this.vertex[prevIndex];
  } else if (nextDistance === minDistance) {
    // support points are colinear, they form an edge
    supports[1] = this.vertex[nextIndex];
  } else if (prevDistance < nextDistance) {
    supports[1] = this.vertex[prevIndex];
  } else {
    supports[1] = this.vertex[nextIndex];
  }

  return supports;
};

Polygon.prototype.findClosestVertex = function(circ) {
  var vertex = this.vertex[0];

  var dist = vertex.subtract(circ.center).length();
  var minDist = dist;
  var closestVertex = vertex;
  for (let i = 1; i < this.vertex.length; i++) {
    vertex = this.vertex[i];

    dist = vertex.subtract(circ.center).length();

    if (dist < minDist) {
      minDist = dist;
      closestVertex = vertex;
    }
  }
  return closestVertex;
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
