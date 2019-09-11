var HomeApp = function() {
  var width = window.innerWidth,
    height = 300 / 20,
    scale = 20;
  var myCanvas = document.createElement("canvas");
  var canvasContainer = document.getElementById("canvascontainer");

  canvasContainer.onselectstart = function() {
    return false;
  };

  canvasContainer.appendChild(myCanvas);

  var engine = new Kala.Engine();
  var render = new Kala.Render(0, 0, "stone", scale, myCanvas);

  render.app.renderer.backgroundColor = 0xdbadff;

  window.addEventListener("resize", resize);
  canvasContainer.addEventListener("mousedown", event => {
    createPolygon(event);
  });
  engine.events.addCustomEvent(spawnPolygon);

  function createPolygon(event) {
    engine.add(
      new RegularPoly(
        event.clientX / scale,
        (event.clientY - 40) / scale,
        Math.floor(Math.random() * 3) + 1,
        Math.floor(Math.random() * 7 + 3),
        1,
        0.2,
        0.3
      )
    );
    engine.allBodies[engine.allBodies.length - 1].rotate(Math.random());
  }

  function spawnPolygon() {
    engine.add(
      new RegularPoly(width / 2, 10, Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 7 + 3), 1, 0.2, 0.3)
    );
    if (engine.allBodies.length > 50) {
      engine.allBodies.removeBodyByIndex(0);
    }
  }

  function resize() {
    var prevWidth = width || 0;

    var parent = render.app.view.parentNode;

    render.app.renderer.resize(parent.clientWidth, 300);

    width = render.app.view.width / scale;

    bounds[1].move(Vec2(width - prevWidth, 0));
  }

  var bounds = [
    new Rectangle(width / 2, 0 - 1, width, 2, 0, 1, 0.2),
    new Rectangle(width + 1, height / 2, 2, height, 0, 1, 0.2),
    new Rectangle(width / 2, height + 1, width, 2, 0, 1, 0.2),
    new Rectangle(0 - 1, height / 2, 2, height, 0, 1, 0.2)
  ];

  render.loader.onComplete.add(() => {
    engine.add(bounds);
    engine.initializeEngineCore(render);
    engine.movement = true;
    resize();
  });
};
