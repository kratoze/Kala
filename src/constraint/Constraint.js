function Constraint(bodyA, bodyB, maxDist) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.maxDist = maxDist;
}

Constraint.prototype.maintainConstraint = function() {
  var aPos = this.bodyA.center;
  var bPos = this.bodyB.center;
  var rSum = this.bodyA.radius + this.bodyB.radius;
  var vFromAtoB = aPos.subtract(bPos);
  var dist = vFromAtoB.length();

  if (dist > this.maxDist) {
    this.bodyB.velocity = this.bodyB.velocity.subtract(this.bodyA.center);

    //this.bodyA.center.add(vFromAtoB, vFromAtoB);
  }
};
