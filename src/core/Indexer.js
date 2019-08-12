function Indexer() {
  this.bodyIndex = -1;
}

Indexer.prototype.incrementIndex = function() {
  return (this.bodyIndex += 1);
};
