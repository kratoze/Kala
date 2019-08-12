function NaiveDistance(bodyA, bodyB, length, stiffness) {
  Constraint.call(this, bodyA, bodyB, length, stiffness);
  this.minLength = 0.005; //From Matterjs - Contraints line 26

  var initialMiddlePoint = this.bodyA.center.add(this.bodyB.center);
  this.constraintLink = new Rectangle(
    initialMiddlePoint.x / 2,
    initialMiddlePoint.y / 2,
    this.bodyA.center.distance(this.bodyB.center),
    1,
    0,
    0.2,
    0,
    { name: "rod" }
  );
}

Common.extend(NaiveDistance, Constraint);

NaiveDistance.prototype.maintainConstraint = function(collisionInfo) {
  var aPos = this.bodyA.center;
  var bPos = this.bodyB.center;
  var vFromBtoA = bPos.subtract(aPos);
  var vFromAtoB = aPos.subtract(bPos);
  var distBA = vFromBtoA.length();
  var distAB = vFromAtoB.length();
  var normal = vFromAtoB.normalize();

  var normalFrom2to1 = vFromBtoA.normalize();
  var radiusC2 = normalFrom2to1.scale(this.length);

  var status = false;
  if (distBA < this.minLength) {
    distBA = this.minLength;
  }

  if (distBA > this.length) {
    collisionInfo.setInfo(
      this.length - distAB / distAB,
      normal.scale(this.bodyB.friction),
      this.bodyB.center.add(radiusC2)
    );

    status = true;
  } else if (distBA < this.length) {
    collisionInfo.setInfo(
      distAB - this.length / distAB,
      normal.scale(this.bodyB.friction),
      this.bodyB.center.add(radiusC2)
    );
    status = true;
  }

  return status;
};

NaiveDistance.prototype.updateLink = function() {
  this.middlePoint = this.bodyA.center.add(this.bodyB.center);

  this.constraintLink.center.x = this.middlePoint.x / 2;
  this.constraintLink.center.y = this.middlePoint.y / 2;
  this.constraintLink.width = this.bodyA.center.distance(this.bodyB.center);
  this.constraintLink.angle = this.bodyA.center.angleFromVector(
    this.bodyB.center
  );
};

NaiveDistance.prototype.updateConstraint = function() {
  this.maintainConstraint();
  this.updateLink();
};
