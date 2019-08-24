var engine = new Kala.Engine();
var render = new Kala.Render(1000, 1000, "pool", 20);
engine.gravity = Vec2(0, 0);
engine.movement = true;
var isBallClicked = false;
var relMousePosDown = Vec2(0, 0);
var relMousePosUp = Vec2(0, 0);
var relMousePosMove = Vec2(0, 0);
var scale = render.app.stage.scale.x;
var width = render.app.view.width / scale;
var height = render.app.view.height / scale;

var container = new PIXI.Container();
var line = new PIXI.Graphics();

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
        0.9,
        { name: "8ball", dampen: true }
      )
    );
  }
}

//Add bodies to engine and render arrays once assets are loaded
render.loader.onComplete.add(() => {
  render.app.renderer.backgroundColor = "0x9c0d03";
  whiteBall.render.texture = render.loader.resources["whiteball"].texture;

  for (let i = 0; i < pockets.length; i++) {
    pockets[i].render.texture = render.loader.resources["pot"].texture;
  }
  engine.add(table);
  engine.add(pockets);

  engine.add(whiteBall);

  engine.add(eightBalls);
  engine.initializeEngineCore(render);

  // for (let i = 4; i < 10; i++) {
  //   render.bodyContainer.children[i].texture =
  //     render.loader.resources["pot"].texture;
  // }
  //container.addChild();
  render.app.stage.addChild(line);
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

window.addEventListener("mouseup", function(e) {
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
    line.clear();
    isBallClicked = false;
  }
});

window.addEventListener("mousemove", function(e) {
  relMousePosMove = getRelMouseCoords(e);
});

function getRelMouseCoords(event) {
  return Vec2(event.clientX / 20 - 0.4, event.clientY / 20 - 0.4);
}

function potBall() {
  if (
    engine.collisionInfo.bodyA.name == "8ball" ||
    engine.collisionInfo.bodyB.name == "8ball"
  ) {
    if (engine.collisionInfo.bodyA.name === "8ball") {
      engine.removeBody(engine.collisionInfo.bodyA);
    } else {
      engine.removeBody(engine.collisionInfo.bodyB);
    }
  }
}

function drawCue(e) {
  if (isBallClicked) {
    line.clear();
    line.lineStyle(0.1, 0x000000, 1);

    line.moveTo(engine.allBodies[10].center.x, engine.allBodies[10].center.y);
    line.lineTo(relMousePosMove.x, relMousePosMove.y);
  }
}

engine.events.addCollisionEvent(potBall);
engine.events.addCustomEvent(drawCue);
