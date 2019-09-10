/**
 * Events - Allows custom functions to be added to the Engine's main loop.
 * @memberof Core
 * @class
 */
function Events() {
  this.customEvents = {};
  this.collisionEvents = {};
}

/**
 * Runs the provided function during the Engine's main loop
 *
 * @param  {type} event description
 * @return {type}       description
 */
Events.prototype.addCustomEvent = function(event) {
  this.customEvents[event.name] = event;
};

/**
 * Runs the provided function during the Engine's main loop
 * The object "collisionInfo" can be accessed by an event function added here
 *
 * @param  {type} event description
 * @return {type}       description
 */
Events.prototype.addCollisionEvent = function(event) {
  this.collisionEvents[event.name] = event;
};
