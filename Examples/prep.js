var factory = new Factory();
var scale = 20;
var size = 1000;
var positionVar = 1000 / 20;

var polygons = [];
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) polygons.push(new RegularPoly(i + 10, j + 10, 3, 6, Math.random(), Math.random(), Math.random()));
}
var rectangle = new Rectangle(500, 500, 50, 50, 1, 0.2, 0.2);

render.loader.onComplete.add(() => {
  engine.add(polygons);
  engine.add(new Rectangle(positionVar / 2, positionVar, positionVar, 2, 0, 1, 0.2));
  engine.initializeEngineCore(render);
  engine.movement = true;
});
