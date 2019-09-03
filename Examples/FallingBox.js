var Engine = Kala.Engine,
  Rectangle = Kala.Rectangle,
  Render = Kala.Render;
Factory = Kala.Factory;

var engine = new Engine();
var render = new Render(500, 500, "stone", 20);

var factory = new Factory();

var scale = render.scale;
var width = render.app.view.width / scale;
var height = render.app.view.height / scale;

var bounds = [
  new Rectangle(width / 2, 0, width, 2, 0, 1, 0.2),
  new Rectangle(width, height / 2, 2, height, 0, 1, 0.2),
  new Rectangle(width / 2, height, width, 2, 0, 1, 0.2),
  new Rectangle(0, height / 2, 2, height, 0, 1, 0.2)
];

var rect = new Rectangle(12, 20, 5, 5, 0, 0.1, 0.2);
var rect2 = new Rectangle(12, 10, 5, 5, 1, 0.1, 0.2);
rect2.rotate(0.7);
render.loader.onComplete.add(() => {
  //  engine.add(bounds);
  engine.add(rect);
  engine.add(rect2);
  engine.initializeEngineCore(render);
  engine.movement = true;
});
