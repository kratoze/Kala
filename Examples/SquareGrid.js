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

var bounds = [
  new Rectangle(width / 2, 0, width, 2, 0, 1, 0.2),
  new Rectangle(width, height / 2, 2, height, 0, 1, 0.2),
  new Rectangle(width / 2, height, width, 2, 0, 1, 0.2),
  new Rectangle(0, height / 2, 2, height, 0, 1, 0.2)
];

var squareGrid = factory.createSquareGrid(10, 10, 2, 2, 5, 5, 0.2, 0.8, 0.00001);
//var rect = new Rectangle(10, 10, 2, 5, 0.5, 0.1, 0.2);
render.loader.onComplete.add(() => {
  engine.add(bounds);
  engine.add(squareGrid);
  //render.create(engine);
  engine.initializeEngineCore(render);
  engine.movement = true;
});
