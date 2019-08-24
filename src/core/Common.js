var Common = {};

(function() {
  Common.globalID = 0;

  Common.extend = function(Child, Parent) {
    var prototype = Object.create(Parent.prototype);
    prototype.constructor = Child;
    Child.prototype = prototype;
    return Child;
  };

  Common.incrementIndexer = function() {
    return (Common.globalID += 1);
  };
})();
