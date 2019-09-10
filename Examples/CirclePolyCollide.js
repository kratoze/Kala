var scale = 20;

var engine = new Engine();
var render = new PixiRender(500, 500, "stone", 20);
engine.gravity = Vec2(0, 10);
var width, height;
width = height = render.app.view.width / scale;

var triangleVertices = [Vec2(250 / scale, 350 / scale), Vec2(150 / scale, 350 / scale), Vec2(150 / scale, 250 / scale)];

var bounds = [
  new Rectangle(width / 2, 0, width, 2, 0, 1, 0.2),
  new Rectangle(width, height / 2, 2, height, 0, 1, 0.2),
  new Rectangle(width / 2, height, width, 2, 0, 1, 0.2),
  new Rectangle(0, height / 2, 2, height, 0, 1, 0.2)
];

triangleVertices.forEach(function(element, index, array) {
  array[index] = array[index].scale(2);
});

var triangle = new Polygon(triangleVertices, 1, 0.3, 0.2);
var circ = new Circle(7, 5, 1, 1, 0.2, 0.2);

triangle.move(Vec2(-10, -15));
render.loader.onComplete.add(() => {
  engine.add(bounds);
  engine.add(triangle);
  engine.add(circ);
  engine.initializeEngineCore(render);
  engine.movement = true;
});
