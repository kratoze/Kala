//create instances of Engine and Renderer
var engine = new Engine();
var render = new PixiRender(400, 900, "stone", 10);

//retrieve size and scale from renderer for convenience
var scale = render.scale;
var height = render.app.view.height / scale;
var width = render.app.view.width / scale;

//create circles
var circA = new Circle(150 / scale, 50 / scale, 3, 1, 0.2, 0.9);
var circB = new Circle(375 / scale, height / 2, 3, 1, 0.2, 0.9);
var circC = new Circle(600 / scale, height / 2, 3, 1, 0.2, 0.9);
var circD = new Circle(825 / scale, height / 2, 3, 0.2, 0.2, 0.9);

//create rectangles that will act as anchors
var rectA = new Rectangle(circA.center.x + 2, 4, 10, 10, 0, 0, 0);
var rectB = new Rectangle(circB.center.x, 4, 10, 10, 0, 0, 0);
var rectC = new Rectangle(circC.center.x, 4, 10, 10, 0, 0, 0);
var rectD = new Rectangle(circD.center.x, 4, 10, 10, 0, 0, 0);

var constraintA = new DistanceConstraint(circA, rectA, 15, 1);
var constraintB = new DistanceConstraint(circB, rectB, 15, 1);
var constraintC = new DistanceConstraint(circC, rectC, 15, 1);
var constraintD = new DistanceConstraint(circD, rectD, 15, 1);

//add bodies when sprite textures are loaded
render.loader.onComplete.add(() => {
  engine.add(circA);
  engine.add(circB);
  engine.add(circC);
  engine.add(circD);

  engine.add(rectA);
  engine.add(rectB);
  engine.add(rectC);
  engine.add(rectD);

  engine.addConstraint(constraintA);
  engine.addConstraint(constraintB);
  engine.addConstraint(constraintC);
  engine.addConstraint(constraintD);

  render.addSprite(circA);
  render.addSprite(circB);
  render.addSprite(circC);
  render.addSprite(circD);
  engine.movement = true;
  engine.initializeEngineCore(render);
});
