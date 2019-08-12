function Constraint(bodyA, bodyB, length, stiffness) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.length = length;
  this.stiffness = stiffness;
  this.minLength = 0.000001; //From Matterjs - Contraints line 26
}

Constraint.prototype.maintainConstraint = function(collisionInfo) {
  var aPos = this.bodyA.center;
  var bPos = this.bodyB.center;
  var vFromBtoA = bPos.subtract(aPos);
  var vFromAtoB = aPos.subtract(bPos);
  var distBA = vFromBtoA.length();
  var distAB = vFromAtoB.length();
  var normal = vFromAtoB.normalize();
  var reverseNormal;

  var axis = this.bodyA.center.subtract(this.bodyB.center);
  var currentDistance = axis.length();
  var unitAxis = vFromBtoA.scale(1 / currentDistance);
  var normalFrom2to1 = vFromBtoA.normalize();
  var radiusC2 = normalFrom2to1.scale(this.length);

  var relVel = this.bodyB.velocity.subtract(this.bodyA.velocity).dot(unitAxis);

  var relDist = currentDistance - this.length;

  //this.bodyB.center = this.bodyA.center.scale(this.length);
  //this.bodyB.center = this.bodyB.center.scale(this.bodyB.center.normalize());
  if (normal.x > 0) {
    //Set normal to point right
    reverseNormal = Vec2(-normal.y, normal.x);
  } else {
    //Set normal to point left
    reverseNormal = Vec2(normal.y, -normal.x);
  }
  // console.log(
  //   "L: {" +
  //     reverseNormal.x +
  //     ", " +
  //     reverseNormal.y +
  //     "} \nR: " +
  //     reverseNormal.x +
  //     ", " +
  //     reverseNormal.y +
  //     "} \n N: " +
  //     normal.x +
  //     ", " +
  //     normal.y
  // );
  var start = normal.scale(this.length);
  var status = false;

  // if (distBA > Math.sqrt(rSum * rSum)) {
  //   console.log(Math.sqrt(rSum * rSum));
  //   return status;
  // }
  //this.bodyB.center = bPos.add(normal.scale(this.length));
  if (distBA < this.minLength) {
    distBA = this.minLength;
  }

  if (distBA > this.length) {
    collisionInfo.setInfo(
      this.length - distAB / distAB,
      normal,
      this.bodyB.center.add(radiusC2)
    );
    //console.log("contrsinings");
    //this.bodyA.center.add(vFromBtoA, vFromBtoA);
    status = true;
  } else if (distBA < this.length) {
    collisionInfo.setInfo(
      distAB - this.length / distAB,
      normal,
      this.bodyB.center.add(radiusC2)
    );
    //console.log("contrsinings");
    //this.bodyA.center.add(vFromBtoA, vFromBtoA);
    status = true;
  }
  // if (distAB > this.length) {
  //   collisionInfo.setInfo(
  //     this.length - distAB,
  //     normal.scale(-1),
  //
  //   );
  //   //collisionInfo.changeDir();
  //   console.log(this.bodyA.center.add(normal.scale(this.length)));
  // }

  // if (distBA > this.length) {
  //   collisionInfo.setInfo(
  //     -(this.length + this.bodyB.radius),
  //     reverseNormal
  //     this.bodyB.center.add(start)
  //   );
  //   status = true;
  // }
  return status;
};

//SQRT (X2 + Y2) - length
