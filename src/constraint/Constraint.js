var constraintIndex = new Indexer();

function Constraint(bodyA, bodyB, length, stiffness) {
  var self = this;
  this.index = constraintIndex.incrementIndex();
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.length = length;
  this.stiffness = stiffness;
}

Constraint.prototype.maintainConstraint = function() {};

Constraint.prototype.updateLink = function() {};
