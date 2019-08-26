var engine = new Engine();
var render = new PixiRender(500, 500, "stone", 20);
engine.gravity = Vec2(0, 10);
var scale = 20;
var width, height;
width = height = render.app.view.width;

//var ground = new Kala.Rectangle(0, height / 2, 2, height, 0, 1, 1);
//engine.add(ground);
var triangleVertices = [
  Vec2(250 / scale, 350 / scale),
  Vec2(150 / scale, 200 / scale),
  Vec2(100 / scale, 250 / scale)
];
var triangleVertices2 = [
  Vec2(250 / scale, 350 / scale),
  Vec2(150 / scale, 200 / scale),
  Vec2(100 / scale, 250 / scale)
];
var otherShapePoly = [
  Vec2(250 / scale, 350 / scale),
  Vec2(150 / scale, 200 / scale),
  Vec2(100 / scale, 250 / scale),
  Vec2(100 / scale, 350 / scale)
];

var squarePolygonPoints = [
  Vec2(50 / scale, 100 / scale),
  Vec2(150 / scale, 100 / scale),
  Vec2(150 / scale, 200 / scale),
  Vec2(50 / scale, 200 / scale)
];

var squarePolygonPoints2 = [
  Vec2(0 / scale, 100 / scale),
  Vec2(500 / scale, 100 / scale),
  Vec2(500 / scale, 200 / scale),
  Vec2(0 / scale, 200 / scale)
];
var triangle = new Polygon(250, 250, triangleVertices, 10, 0.2, 0.2, 0.2);
var triangle2 = new Polygon(250, 250, triangleVertices2, 10, 0, 1, 1);

var squarePolygon = new Polygon(250, 250, squarePolygonPoints, 1, 1, 1);
var squarePolygon2 = new Polygon(
  250,
  250,
  squarePolygonPoints2,
  1,
  0,
  0.2,
  0.2
);

triangle.move(Vec2(100 / scale, 0));
//triangle.velocity = Vec2(0, 20);
//triangle.velocity = Vec2(0, 200);
//triangle.rotate(0.9);
engine.add(triangle);
// engine.add(triangle2);
// engine.add(squarePolygon);
// engine.add(squarePolygon2);

squarePolygon2.move(Vec2(0, 400 / scale));

//squarePolygon2.rotate(0.7);
// engine.add(squarePolygon);
engine.add(squarePolygon2);

//squarePolygon2.velocity = Vec2(0, 20);
var radius = 2;
var angle = 0.1;
function spin() {
  var spin = Vec2(radius * Math.cos(angle), radius * Math.sin(angle));
  //engine.allBodies[0].move(spin);
  //polygon.move(spin);
  angle += 0.1;
}
//engine.events.addCustomEvent(spin);
//engine.movement = true;
//polygon.velocity = Vec2(10, 0);
render.loader.onComplete.add(() => {
  engine.initializeEngineCore(render);
});
