function PolygonConfiguration() {
  this.min;
  this.max;
  this.minIndex;
  this.maxIndex;
  this.normal;
}

Polygon.prototype.collidedPolyPoly = function(polyA, polyB, collisionInfo) {
  var polyConfig1, polyConfig2, faceNormal, overlap1, overlap2, normalA, normalB;
  var dir;

  if (polyA.bodyID > polyB.bodyID) {
    var polyTmp = polyB;
    polyB = polyA;
    polyA = polyTmp;
  }

  // project each polygon's vertices onto the faces of polyA, find smalled overlap
  for (let i = 0; i < polyA.faceNormal.length; i++) {
    faceNormal = polyA.faceNormal[i];
    polyConfig1 = polyA.findInterval(faceNormal);
    polyConfig2 = polyB.findInterval(faceNormal);
    overlap1 = Math.min(polyConfig1.max - polyConfig2.min, polyConfig2.max - polyConfig1.min);
    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      polyA.lineColor = null;
      return false;
    }
  }

  // project each polygon's vertices onto the faces of polyB, find smalled overlap
  for (let i = 0; i < polyB.faceNormal.length; i++) {
    faceNormal = polyB.faceNormal[i];
    polyConfig1 = polyA.findInterval(faceNormal);
    polyConfig2 = polyB.findInterval(faceNormal);
    overlap2 = Math.min(polyConfig1.max - polyConfig2.min, polyConfig2.max - polyConfig1.min);

    if (polyConfig2.max < polyConfig1.min || polyConfig1.max < polyConfig2.min) {
      polyA.lineColor = null;
      return false;
    }
  }

  var minOverlap;

  // I know this is wrong
  if (overlap1 < overlap2) {
    minOverlap = overlap1;
    dir = polyConfig1.normal;
  } else {
    minOverlap = overlap2;
    dir = polyConfig2.normal;
  }

  var supportsA = polyA.findSupportPoints(dir, polyB);
  var supportsB = polyB.findSupportPoints(dir, polyA);

  console.log("Polygons are colliding");

  return true;
};

Polygon.prototype.findInterval = function(normal) {
  var polyConfig = new PolygonConfiguration();

  normal = normal.perp();
  var dotProduct = this.vertex[0].dot(normal);
  var current;

  var min, max;
  var index = 0;
  var minNormal = normal;
  min = dotProduct;
  max = min;

  for (let i = 1; i < this.vertex.length; i++) {
    current = this.vertex[i].dot(normal);
    if (current > max) {
      max = current;
    }
    if (current < min) {
      min = current;
      index = i;
      minNormal = normal;
    }
  }
  polyConfig.min = min;
  polyConfig.max = max;
  polyConfig.minIndex = index;
  polyConfig.normal = minNormal.perp();
  return polyConfig;
};

Polygon.prototype.findSupportPoints = function(dir, bodyB) {
  //https://www.gamedev.net/forums/topic/453179-point-of-collision/
  dir = dir.scale(-1);
  console.log(dir);
  var supports = [];
  var count = 0;
  var minDistance = 99999;
  var distance, vertex, index;
  for (let i = 0; i < this.vertex.length; i++) {
    vertex = this.vertex[i].subtract(bodyB.center);
    distance = vertex.dot(dir);
    if (distance < minDistance) {
      minDistance = distance;
      supports[0] = i;
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
  if (prevDistance < nextDistance) {
    supports[1] = prevIndex;
  } else {
    supports[1] = nextIndex;
  }
  return supports;
};
