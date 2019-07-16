var engine = new Kala.Engine();
var render = new Kala.Render();

//Game
var scale = 20;
var width = render.app.view.width / scale;
var height = render.app.view.height / scale;
Engine.gravity = Vec2(0, 0);
engine.movement = true;

var playerShip = new Kala.Rectangle(width / 2, height / 2, 2, 2, 1, 1, 1, {
  isSensor: false,
  name: "player"
});
var asteroid = new Kala.Circle(5, 5, 2, 2, 1, 1, { isSensor: true });
var asteroid2 = new Kala.Circle(14, 14, 2, 2, 1, 1, { isSensor: true });
asteroid.velocity = asteroid2.velocity = Vec2(
  Math.random() * 10,
  Math.random() * 10
);
render.loader.onComplete.add(() => {
  engine.add(playerShip);
  engine.add(asteroid);
  engine.add(asteroid2);
  render.addSprite(playerShip);
  render.addSprite(asteroid);
  render.addSprite(asteroid2);
  engine.initializeEngineCore(render);
});

var turnSpeed = 5;
var maxSpeed = 15;
var thrust;

var LEFT = false;
var RIGHT = false;
var UP = false;
var SPACE = false;
document.addEventListener("keydown", function(e) {
  //Player Controls
  if (e.keyCode == 65) {
    // A
    LEFT = true;
  } else if (e.keyCode == 68) {
    // D
    RIGHT = true;
  } else if (e.keyCode == 87) {
    // W
    UP = true;
  } else if (e.keyCode == 32) {
    SPACE = true;
  }
});

document.addEventListener("keyup", function(e) {
  if (e.keyCode == 65) {
    // A
    LEFT = false;
  } else if (e.keyCode == 68) {
    // D
    RIGHT = false;
  } else if (e.keyCode == 87) {
    // W
    UP = false;
  } else if (e.keyCode == 32) {
    SPACE = false;
  }
});

function playerControlsEvent() {
  if (LEFT) {
    // A
    engine.allBodies[0].angularAcceleration = -turnSpeed;
    console.log(engine.allBodies[0].angularAcceleration);
  } else if (RIGHT) {
    // D
    engine.allBodies[0].angularAcceleration = turnSpeed;
  } else if (UP) {
    // W
    console.log(engine.allBodies[0].acceleration);

    thrust = calculateShipDirection(engine.allBodies[0].angle);
    engine.allBodies[0].acceleration = thrust;
  }

  if (LEFT === false && RIGHT === false) {
    engine.allBodies[0].angularAcceleration = 0;
    engine.allBodies[0].angularVelocity = 0;
  }

  if (UP === false) {
    engine.allBodies[0].acceleration = engine.allBodies[0].acceleration.scale(
      0.25
    );
  }
  if (SPACE === true) {
    var bullet = new Kala.Rectangle(
      engine.allBodies[0].center.x,
      engine.allBodies[0].center.y,
      0.5,
      0.5,
      1,
      1,
      1,
      { isSensor: true, name: "bullet" }
    );
    bullet.velocity = calculateShipDirection(engine.allBodies[0].angle);
    engine.add(bullet);
    render.addSprite(bullet);
  }
}
function wrapPlayer() {
  if (engine.allBodies[0].center.x > width) {
    engine.allBodies[0].center.x = 0;
  } else if (engine.allBodies[0].center.x < 0) {
    engine.allBodies[0].center.x = width;
  }
  if (engine.allBodies[0].center.y > height) {
    engine.allBodies[0].center.y = 0;
  } else if (engine.allBodies[0].center.y < 0) {
    engine.allBodies[0].center.y = height;
  }
}

function wrapObjects() {
  for (let i = 0; i < engine.allBodies.length; i++) {
    if (engine.allBodies[i].name === "bullet") {
      break;
    } else if (engine.allBodies[i].center.x > width) {
      engine.allBodies[i].center.x = 0;
    } else if (engine.allBodies[i].center.x < 0) {
      engine.allBodies[i].center.x = width;
    } else if (engine.allBodies[i].center.y > height) {
      engine.allBodies[i].center.y = 0;
    } else if (engine.allBodies[i].center.y < 0) {
      engine.allBodies[i].center.y = height;
    }
  }
}
engine.events.addCollisionEvent(testCollideEvent);

engine.events.addCustomEvent(playerControlsEvent);
engine.events.addCustomEvent(wrapObjects);

function calculateShipDirection(angle) {
  return Vec2(maxSpeed * Math.cos(angle), maxSpeed * Math.sin(angle));
}

function clampVector(x, y, min, max) {
  var clampedX = Math.max(min, Math.min(x, max));
  var clampedY = Math.max(min, Math.min(y, max));
  return Vec2(clampedX, clampedY);
}

function clamp(num, min, max) {
  var clampedNum = Math.max(min, Math.min(num, max));
  return clampedNum;
}

function testCollideEvent() {
  if (
    engine.collisionResponse.bodyA.name === "player" ||
    engine.collisionResponse.bodyB.name === "player"
  ) {
    //console.log("Game Over");
  }

  if (
    (engine.collisionResponse.bodyA.type === "Circle" &&
      engine.collisionResponse.bodyB.name === "bullet") ||
    (engine.collisionResponse.bodyB.type === "Circle" &&
      engine.collisionResponse.bodyA.name === "bullet")
  ) {
    console.log("HIT");
    engine.removeBody(engine.collisionResponse.bodyAIndex);
    engine.removeBody(engine.collisionResponse.bodyBIndex);
    render.removeSprite(engine.collisionResponse.bodyAIndex);
    render.removeSprite(engine.collisionResponse.bodyAIndex);
  }
}
