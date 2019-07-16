function Events() {
  this.customEvents = {};
  this.collisionEvents = {};
}

Events.prototype.addCustomEvent = function(event) {
  this.customEvents[event.name] = event;
};

Events.prototype.addCollisionEvent = function(event) {
  this.collisionEvents[event.name] = event;
};
