var Engine = Kala.Engine,
  Rectangle = Kala.Rectangle,
  Render = Kala.Render;
Factory = Kala.Factory;

var engine = new Engine();
var render = new Render(1000, 1000, "stone", 20);

var factory = new Factory();

var scale = render.scale;
var width = render.app.view.width / scale;
var height = render.app.view.height / scale;

var anchor = new Circle(width / 2, 5, 3, 0, 1, 1);
var circ1 = new Circle(width / 2 + 4, 12, 3, 1, 1, 1);
var circ2 = new Circle(width / 2 + 10, 25, 3, 1, 1, 1);
var circ3 = new Circle(width / 2 + 13, 36, 3, 1, 1, 1);
var link1 = new DistanceConstraint(anchor, circ1, 9, 0.1);
var link2 = new DistanceConstraint(circ1, circ2, 9, 0.1);
var link3 = new DistanceConstraint(circ2, circ3, 9, 0.1);

render.loader.onComplete.add(() => {
  engine.add(anchor);
  engine.add(circ1);
  engine.add(circ2);
  engine.add(circ3);
  engine.addConstraint(link1);
  engine.addConstraint(link2);
  engine.addConstraint(link3);

  engine.initializeEngineCore(render);
  engine.movement = true;
});
