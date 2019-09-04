function AABB(body) {
  return new AABB.init(body);
}

function Vec2(x, y) {
  return new Vec2.init(x, y);
}

AABB.init = function(x, y) {
  var self = this;
  self.x = x;
  self.y = y;
};

Body.prototype.AABBTest = function(otherShape) {
  // if(player1.x < player2.x + player2.width &&
  //   player1.x + player1.width > player2.x &&
  //   player1.y < player2.y + player2.height &&
  //   player1.y + player1.height > player2.y)
  var aabbA = this.AABB;
  var aabbB = otherShape.AABB;
  if (
    aabbA.minBounds.x < aabbB.maxBounds.x &&
    aabbA.maxBounds.x > aabbB.minBounds.x &&
    aabbA.minBounds.y < aabbB.maxBounds.y &&
    aabbA.maxBounds.y > aabbB.minBounds.y
  ) {
    // potential collision detected
    return true;
  }
  return false; // no collision
};

Body.prototype.calculateAABB = function() {
  // defined by sub class
};

Polygon.prototype.calculateAABB = function() {
  var minX = 999999;
  var maxX = -999999;
  var minY = 999999;
  var maxY = -999999;
  for (let i = 0; i < this.vertex.length; i++) {
    var vertex = this.vertex[i];
    if (vertex.x > maxX) {
      maxX = vertex.x;
    }
    if (vertex.x < minX) {
      minX = vertex.x;
    }
    if (vertex.y > maxY) {
      maxY = vertex.y;
    }
    if (vertex.y < minY) {
      minY = vertex.y;
    }
  }
  var AABB = { minBounds: Vec2(minX, minY), maxBounds: Vec2(maxX, maxY) };
  return AABB;
};
