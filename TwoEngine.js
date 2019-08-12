var engineOne = new Kala.Engine();
var engineTwo = new Kala.Engine();

var renderOne = new Kala.Render(500, 500, "stone", 20);
var renderTwo = new Kala.Render(500, 500, "pool", 20);
engineOne.movement = true;

//engineTwo.movement = true;
var rectOne = new Kala.Rectangle(200 / 20, 10, 10, 1, 1, 1);
var rectTwo = new Kala.Circle(125 / 20, 125 / 20, 25 / 20, 0.5, 0.2, 0.2);

renderOne.loader.onComplete.add(() => {
  engineOne.add(rectOne);

  renderOne.addSprite(rectOne);
  engineOne.movement = false;
  engineOne.initializeEngineCore(renderOne);
});

renderTwo.loader.onComplete.add(() => {
  engineTwo.add(rectTwo);
  renderTwo.addSprite(rectTwo);
  engineTwo.initializeEngineCore(renderTwo);
});
