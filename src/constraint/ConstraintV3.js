function DistanceConstraint(bodyA, bodyB, length, stiffness) {
  Constraint.call(this, bodyA, bodyB, length, stiffness);
}

Common.extend(DistanceConstraint, Constraint);

DistanceConstraint.prototype.maintainConstraint = function() {
  // calculate the distance between the two bodies
  var distance = this.bodyB.center.subtract(this.bodyA.center);

  // step 1 determine the constrain equation
  var c = distance * distance - (this.length * this.length) / 2;

  // step 2 differentiate the constraint equation with repest to time
};

DistanceConstraint.prototype.initialiseConstraint = function() {};
