Rectangle.prototype.collisionTest = function(otherShape, collisionInfo) {
  var status = false;
  if (otherShape.type === "Circle") {
    status = this.collidedRectCirc(otherShape, collisionInfo);
  } else {
    status = this.collidedRectRect(this, otherShape, collisionInfo);
  }
  return status;
};

var SupportStruct = function() {
  this.supportPoint = null;
  this.supportPointDist = 0;
};

var tmpSupport = new SupportStruct();

Rectangle.prototype.findSupportPoint = function(dir, ptOnEdge) {
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

Rectangle.prototype.findAxisLeastPenetration = function(
  otherRect,
  collisionInfo
) {
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
    collisionInfo.setInfo(
      bestDistance,
      this.faceNormal[bestIndex],
      supportPoint.add(bestVec)
    );
  }
  return hasSupport;
};

var collisionInfoR1 = new CollisionInfo();
var collisionInfoR2 = new CollisionInfo();

Rectangle.prototype.collidedRectRect = function(r1, r2, collisionInfo) {
  var status1 = false;
  var status2 = false;
  // find Axis of Separation for both Rectangle
  status1 = r1.findAxisLeastPenetration(r2, collisionInfoR1);
  if (status1) {
    status2 = r2.findAxisLeastPenetration(r1, collisionInfoR2);
    if (status2) {
      //  choose the shorter normal as the normal
      if (collisionInfoR1.getDepth() < collisionInfoR2.getDepth()) {
        var depthVec = collisionInfoR1
          .getNormal()
          .scale(collisionInfoR1.getDepth());
        collisionInfo.setInfo(
          collisionInfoR1.getDepth(),
          collisionInfoR1.getNormal(),
          collisionInfoR1.start.subtract(depthVec)
        );
      } else {
        collisionInfo.setInfo(
          collisionInfoR2.getDepth(),
          collisionInfoR2.getNormal().scale(-1),
          collisionInfoR2.start
        );
      }
    }
  }
  return status1 && status2;
};

Rectangle.prototype.collidedRectCirc = function(otherCir, collisionInfo) {
  // Step A: Compute the nearest edge
  var inside = true;
  var bestDistance = -99999;
  var nearestEdge = 0;
  var projection;
  var circ2Pos;

  var i, v;

  for (i = 0; i < 4; ++i) {
    circ2Pos = otherCir.center;
    v = circ2Pos.subtract(this.vertex[i]);
    projection = v.dot(this.faceNormal[i]);
    if (projection > 0) {
      // if the center of circle is outside of rectangle
      bestDistance = projection;
      nearestEdge = i;
      inside = false;
      break;
    }
    if (projection > bestDistance) {
      bestDistance = projection;
      nearestEdge = i;
    }
  }
  if (!inside) {
    // Step B1: If center is in region R1

    // v1 is from left vertex of face to center of Circle
    // v2 is from left vertex of face to right vertex of face
    var v1 = circ2Pos.subtract(this.vertex[nearestEdge]);
    var v2 = this.vertex[(nearestEdge + 1) % 4].subtract(
      this.vertex[nearestEdge]
    );

    var dot = v1.dot(v2);
    if (dot < 0) {
      // Region R1
      // the center of the circle is in corner region of vertex[nearestEdge]
      var dis = v1.length();
      if (dis > otherCir.radius) {
        return false;
      }
      var normal = v1.normalize();
      var radiusVec = normal.scale(-otherCir.radius);
      collisionInfo.setInfo(
        otherCir.radius - dis,
        normal,
        circ2Pos.add(radiusVec)
      );
    } else {
      // Not in region R1

      // Step B2: If center is in Region R2
      // the center of circle is in corner region of vertex[nearestEdge + 1]
      // v1 is from right vertec of face to center of Circle
      // v2 is from right vertex of face to left vertex of faceNormal
      var v1 = circ2Pos.subtract(this.vertex[(nearestEdge + 1) % 4]);
      var v2 = v2.scale(-1);

      var dot = v1.dot(v2);
      if (dot < 0) {
        // In Region R2
        var dis = v1.length();
        if (dis > otherCir.radius) {
          return false;
        }
        var normal = v1.normalize();
        var radiusVec = normal.scale(-otherCir.radius);
        collisionInfo.setInfo(
          otherCir.radius - dis,
          normal,
          circ2Pos.add(radiusVec)
        );
      } else {
        // Not in Region R2
        // Step B3: R3
        // the center of circle is in face region of face[nearestEdge]
        if (bestDistance < otherCir.radius) {
          var radiusVec = this.faceNormal[nearestEdge].scale(otherCir.radius);
          collisionInfo.setInfo(
            otherCir.radius - bestDistance,
            this.faceNormal[nearestEdge],
            circ2Pos.subtract(radiusVec)
          );
        } else {
          return false;
        }
      }
    }
  } else {
    // Step C: If center is inside
    var radiusVec = this.faceNormal[nearestEdge].scale(otherCir.radius);
    collisionInfo.setInfo(
      otherCir.radius - bestDistance,
      this.faceNormal[nearestEdge],
      circ2Pos.subtract(radiusVec)
    );
  }
  return true;
};
