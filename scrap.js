/* eslint-disable */

(function(window) {
  function defineNana() {
    var Nana = {};

    Nana.alert = function() {
      console.log("ANAA");
    };
    return Nana;
  }

  if (typeof Nana === "undefined") {
    window.Nana = defineNana();
  }
})(window);

var e1 = new Engine("1");
var e2 = new Engine("2");

engine.allBodies[0].velocity = Vec2(10, 10);
