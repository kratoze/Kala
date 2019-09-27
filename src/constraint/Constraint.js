var constraintIndex = new Indexer();

function Constraint(bodyA, bodyB, length, stiffness) {
  var self = this;
  this.index = constraintIndex.incrementIndex();
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.restingAngleA = this.bodyA.angle;
  this.restingAngleB = this.bodyB.angle;
  this.length = length;
  this.stiffness = stiffness;
  this.minLength = 0.001;
}

Constraint.prototype.maintainConstraint = function() {};

Constraint.prototype.updateLink = function() {};

Constraint.prototype.initialiseConstraint = function() {};
