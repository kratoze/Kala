var engine = new Kala.Engine();
var render = new Kala.Render();

//Game
var scale = 20;
var width = render.app.view.width / scale;
var height = render.app.view.height / scale;
Engine.gravity = Vec2(0, 0);
engine.movement = true;
var ground = new Kala.Rectangle(width / 2, height, width, 2, 0, 1, 1);

var playerShip = new Kala.Rectangle(width / 2, height / 2, 2, 2, 1, 1, 1);

render.loader.onComplete.add(() => {
  engine.add(playerShip);
  engine.add(ground);
  //Add bodies to renderer
  render.addSprite(playerShip);
  render.addSprite(ground);

  engine.initializeEngineCore(render);
});

var turnSpeed = 0.2;
var maxSpeed = 5;
var left = false;
// window.onkeydown = function(e) {
//   switch (e.keyCode) {
//     case 65:
//       engine.allBodies[0].rotate(-turnSpeed);
//       break;
//   }
// };

document.addEventListener("keydown", function(e) {
  //Player Controls

  if (e.keyCode == 65) {
    // A
    engine.allBodies[0].rotate(-turnSpeed);
  }

  if (e.keyCode == 68) {
    // D
    engine.allBodies[0].rotate(turnSpeed);
  }

  if (e.keyCode == 87) {
    // W
    var thrust = calculateShipDirection(engine.allBodies[0].angle);
    thrust = clampAcceleration(thrust.x, thrust.y, -5, 5);
    engine.allBodies[0].addAcceleration(thrust);

    //clampAcceleration(engine.allBodies[0].acceleration, -5, 5);

    // if (engine.allBodies[0].acceleration.x > 5) {
    //   engine.allBodies[0].acceleration.x = 5;
    // }
    // if (engine.allBodies[0].acceleration.y > 5) {
    //   engine.allBodies[0].acceleration.y = 5;
    // }
  }
});

function calculateShipDirection(angle) {
  return Vec2(10 * Math.cos(angle), 10 * Math.sin(angle));
}

function clampAcceleration(x, y, min, max) {
  var clampedX = Math.max(min, Math.min(x, max));
  var clampedY = Math.max(min, Math.min(y, max));
  return Vec2(clampedX, clampedY);
}
