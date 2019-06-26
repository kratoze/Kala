var Common = {};

(function() {
  Common.extend = function(Child, Parent) {
    var prototype = Object.create(Parent.prototype);
    prototype.constructor = Child;
    Child.prototype = prototype;
    return Child;
  };
})();
