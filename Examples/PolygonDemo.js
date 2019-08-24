var engine = new Engine();
var render = new PixiRender(500, 500, "stone", 1);
engine.gravity = Vec2(0, 0);

var triangleVertices = [Vec2(250, 450), Vec2(450, 200), Vec2(50, 50)];

var polygon = new Polygon(250, 250, triangleVertices, 10, 1, 1, 1);
engine.add(polygon);
var radius = 2;
var angle = 0.1;
function spin() {
  var spin = Vec2(radius * Math.cos(angle), radius * Math.sin(angle));
  //engine.allBodies[0].move(spin);
  polygon.move(spin);
  angle += 0.1;
}
//engine.events.addCustomEvent(spin);
engine.movement = true;
polygon.velocity = Vec2(10, 0);
render.loader.onComplete.add(() => {
  engine.initializeEngineCore(render);
});
