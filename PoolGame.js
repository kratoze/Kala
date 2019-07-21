var engine = new Kala.Engine();
var render = new Kala.Render("pool");
Kala.Engine.gravity = Vec2(0, 0);
engine.movement = true;
var isBallClicked = false;
var relMousePosDown = Vec2(0, 0);
var relMousePosUp = Vec2(0, 0);
var relMousePosMove = Vec2(0, 0);
var scale = render.app.stage.scale.x;
var width = render.app.view.width / scale;
var height = render.app.view.height / scale;
var table = [
  new Kala.Rectangle(width / 2, 0 - 5, width, 12, 0, 1, 1),
  new Kala.Rectangle(width, height / 2, 12, height + 10, 0, 1, 1),
  new Kala.Rectangle(width / 2, height + 5, width, 12, 0, 1, 1),
  new Kala.Rectangle(0, height / 2, 12, height, 0, 1, 1)
];
var pockets = [
  new Kala.Circle(7.1, 2.1, 1.01, 0, 0, 0, {
    name: "pTopLeft",
    isSensor: true
  }),
  new Kala.Circle(42.9, 2.1, 1.01, 0, 0, 0, {
    name: "pTopRight",
    isSensor: true
  }),
  new Kala.Circle(7.1, 25, 1.01, 0, 0, 0, {
    name: "pMiddleLeft",
    isSensor: true
  }),
  new Kala.Circle(42.9, 25, 1.01, 0, 0, 0, {
    name: "pMiddleRight",
    isSensor: true
  }),
  new Kala.Circle(7.1, 47.75, 1.01, 0, 0, 0, {
    name: "pBottomRight",
    isSensor: true
  }),
  new Kala.Circle(42.9, 47.75, 1.01, 0, 0, 0, {
    name: "pBottomRight",
    isSensor: true
  })
];
var whiteBall = new Kala.Circle(width / 2, 5, 1, 1, 0.2, 0.9, {
  name: "whiteball",
  dampen: true
});
//whiteBall.velocity = Vec2(0, 150);
var eightBalls = [];
var offSetY = 0;
var offSetX = 0;
for (let row = 1; row < 6; row++) {
  offSetY += 1.998;
  for (let column = 0; column < row; column++) {
    offSetX += column / 50;

    eightBalls.push(
      new Kala.Circle(
        width / 2 + offSetX,
        height / 2 + offSetY,
        1,
        0.9,
        0.2,
        0.8,
        { name: "8ball", dampen: true }
      )
    );
  }
}
render.loader.onComplete.add(() => {
  engine.add(table);
  engine.add(pockets);

  engine.add(whiteBall);

  engine.add(eightBalls);
  render.addSprites(table);
  render.addSprites(pockets);
  render.addSprite(whiteBall);
  render.addSprites(eightBalls);
  engine.initializeEngineCore(render);
  render.app.renderer.backgroundColor = "0x9c0d03";
  render.allRenderBodies[10].texture =
    render.loader.resources["whiteball"].texture;

  for (let i = 4; i < 10; i++) {
    render.allRenderBodies[i].texture = render.loader.resources["pot"].texture;
  }
});
var canvas = document.getElementsByTagName("canvas")[0];

canvas.addEventListener("mousedown", function(e) {
  relMousePosDown = getRelMouseCoords(e);
  if (
    relMousePosDown.x <= engine.allBodies[10].center.x + 5 &&
    relMousePosDown.x >= engine.allBodies[10].center.x - 5 &&
    relMousePosDown.y <= engine.allBodies[10].center.y + 5 &&
    relMousePosDown.y >= engine.allBodies[10].center.y - 5
  ) {
    isBallClicked = true;
  }
});

canvas.addEventListener("mouseup", function(e) {
  relMousePosUp = getRelMouseCoords(e);
  if (isBallClicked) {
    var angle = Math.atan2(
      engine.allBodies[10].center.y - relMousePosUp.y,
      engine.allBodies[10].center.x - relMousePosUp.x
    );
    engine.allBodies[10].velocity = Vec2(0, 0).vectorFromAngle(
      engine.allBodies[10].center.distance(relMousePosUp) * 10,
      angle
    );
    isBallClicked = false;
  }
});

canvas.addEventListener("mousemove", function(e) {
  relMousePosMove = getRelMouseCoords(e);
});

function getRelMouseCoords(event) {
  return Vec2(event.clientX / 20 - 0.4, event.clientY / 20 - 0.4);
}

function potBall() {
  if (
    engine.collisionResponse.bodyA.name == "8ball" ||
    engine.collisionResponse.bodyB.name == "8ball"
  ) {
    if (engine.collisionResponse.bodyA.name === "8ball") {
      engine.removeBody(engine.collisionResponse.bodyAIndex);
      render.removeSprite(engine.collisionResponse.bodyAIndex);
    } else {
      engine.removeBody(engine.collisionResponse.bodyBIndex);
      render.removeSprite(engine.collisionResponse.bodyBIndex);
    }
  }
}

function drawCue(e) {
  var container = new PIXI.Container();
  var line = new PIXI.Graphics();

  container.addChild(line);
  render.app.stage.addChild(container);

  line.lineStyle(1, 0x000000, 4);

  if (isBallClicked) {
    // line.position.x = engine.allBodies[10].center.x;
    // line.position.y = engine.allBodies[10].center.y;

    line.moveTo(engine.allBodies[10].center.x, engine.allBodies[10].center.y);
    line.lineTo(relMousePosMove.x, relMousePosMove.y);
    line.clear();
  }
}

engine.events.addCollisionEvent(potBall);
engine.events.addCustomEvent(drawCue);
