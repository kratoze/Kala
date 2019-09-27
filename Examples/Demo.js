var size = 1000;
var scale = 20;
var scaledSize = size / scale;

// Create insiance of the engine
var engine = new Engine();
// Create instance of the renderer, setting the screen size, theme and scale
var render = new PixiRender(size, size, "stone", 20);

var polygons = [];
// create a grid of polygons with nested for loop
for (let i = 0; i < 12; i += 4) {
  for (let j = 0; j < 12; j += 4) {
    polygons.push(
      new RegularPoly(
        i + 15,
        j + 15,
        3,
        6,
        Math.random(),
        Math.random(),
        Math.random()));
  }
}


render.loader.onComplete.add(() => {
  engine.add(new Rectangle(scaledSize / 2, scaledSize, scaledSize, 2, 0, 1, 0.2));
  engine.add(polygons);
  // start the engine, passing in the renderer
  engine.initializeEngineCore(render);
  engine.movement = true;

});
