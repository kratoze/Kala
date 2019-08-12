var engine = new Kala.Engine();
var render = new Kala.Render(1000, 1000, "space", 20);

//Game
var scale = render.scale;
var width = render.app.view.width / scale;
var height = render.app.view.height / scale;
engine.gravity = Vec2(0, 0);
engine.movement = true;

var playerShip = new Kala.Rectangle(width / 2, height / 2, 2, 2, 1, 1, 1, {
  isSensor: true,
  name: "player"
});
var playerLives = 3;
var deathAnimation;
var deathLoop = 0;
var isDying = false;
//render.loader.resources["explosion"].spritesheet.animations["explosion"]

render.loader.onComplete.add(() => {
  engine.add(playerShip);
  render.addSprite(playerShip);
  engine.initializeEngineCore(render);
  spawnAsteroids();
  deathAnimation = new PIXI.AnimatedSprite(
    render.loader.resources["explosion"].spritesheet.animations["explosion"]
  );
  render.app.stage.addChild(deathAnimation);
  deathAnimation.renderable = false;
  deathAnimation.animationSpeed = 0.1;
  deathAnimation.anchor.x = deathAnimation.anchor.y = 0.5;
  deathAnimation.width = deathAnimation.height = 4;
});

var directionX, directionY, bulletOffset, bullet, thrust;

var playerScore = 0;
var maxAsteroids = 6;
var turnSpeed = 5;
var maxSpeed = 15;
var bulletSpeed = 20;

var LEFT = false;
var RIGHT = false;
var UP = false;
var SPACE = false;
var isShooting = false;

function playerControlsEvent() {
  if (LEFT) {
    // A
    engine.allBodies[0].angularAcceleration = -turnSpeed;
  } else if (RIGHT) {
    // D
    engine.allBodies[0].angularAcceleration = turnSpeed;
  }
  if (UP) {
    // W

    thrust = Vec2(0, 0).vectorFromAngle(maxSpeed, engine.allBodies[0].angle);
    if (thrust.x > 10 || thrust.y > 10) {
      thrust.scale(0.5);
    }
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
  if (SPACE) {
    if (!isShooting) {
      isShooting = true;
      bulletOffset = Vec2(0, 0).vectorFromAngle(1, engine.allBodies[0].angle);
      bullet = new Kala.Rectangle(
        engine.allBodies[0].center.x + bulletOffset.x,
        engine.allBodies[0].center.y + bulletOffset.y,
        0.5,
        0.5,
        1,
        1,
        1,
        { isSensor: true, name: "bullet" }
      );
      bullet.velocity = Vec2(0, 0).vectorFromAngle(
        bulletSpeed,
        engine.allBodies[0].angle
      );
      engine.add(bullet);
      render.addSprite(bullet);
    }
  }
}

function wrapObjects() {
  for (let i = 0; i < engine.allBodies.length; i++) {
    if (engine.allBodies[i].hasHit) {
      engine.removeBody(i);
      render.removeSprite(i);
      break;
    }
    if (engine.allBodies[i].center.x > width) {
      if (engine.allBodies[i].name === "bullet") {
        engine.removeBody(i);
        render.removeSprite(i);
        break;
      }

      engine.allBodies[i].move(Vec2(-width, 0));
    } else if (engine.allBodies[i].center.x < 0) {
      if (engine.allBodies[i].name === "bullet") {
        engine.removeBody(i);
        render.removeSprite(i);

        break;
      }
      engine.allBodies[i].move(Vec2(width, 0));
    } else if (engine.allBodies[i].center.y > height) {
      if (engine.allBodies[i].name === "bullet") {
        engine.removeBody(i);
        render.removeSprite(i);
        break;
      }
      engine.allBodies[i].move(Vec2(0, -height));
    } else if (engine.allBodies[i].center.y < 0) {
      if (engine.allBodies[i].name === "bullet") {
        engine.removeBody(i);
        render.removeSprite(i);
        break;
      }
      engine.allBodies[i].move(Vec2(0, height));
    }
  }
}

function collisionEvents() {
  if (
    !isDying &&
    (engine.collisionInfo.bodyA.name === "player" ||
      engine.collisionInfo.bodyB.name === "player") &&
    (engine.collisionInfo.bodyA.name === "asteroid" ||
      engine.collisionInfo.bodyB.name === "asteroid")
  ) {
    console.log("game over");
    isDying = true;
    playerDeath();
  } else if (
    engine.collisionInfo.bodyA.name === "asteroid" &&
    engine.collisionInfo.bodyB.name === "bullet"
  ) {
    if (!engine.collisionInfo.bodyA.hasHit) {
      engine.collisionInfo.bodyA.hasHit = true;
      engine.removeBody(engine.collisionInfo.bodyAIndex);
      render.removeSprite(engine.collisionInfo.bodyAIndex);
      engine.collisionInfo.bodyB.center = Vec2(-10, 10);
      playerScore++;
      newAsteroid();
    }
  } else if (
    engine.collisionInfo.bodyB.name === "asteroid" &&
    engine.collisionInfo.bodyA.name === "bullet"
  ) {
    if (!engine.collisionInfo.bodyB.hasHit) {
      engine.collisionInfo.bodyB.hasHit = true;
      engine.removeBody(engine.collisionInfo.bodyBIndex);
      render.removeSprite(engine.collisionInfo.bodyBIndex);
      engine.collisionInfo.bodyA.center = Vec2(-10, 10);

      playerScore++;
      newAsteroid();
    }
  }
}

function updateUI() {
  document.getElementById("playerscore").innerHTML = playerScore;
  document.getElementById("playerlives").innerHTML = playerLives;
}

setInterval(function() {
  isShooting = false;
}, 200);

engine.events.addCustomEvent(playerControlsEvent);
engine.events.addCustomEvent(wrapObjects);
engine.events.addCollisionEvent(collisionEvents);
engine.events.addCustomEvent(updateUI);

function spawnAsteroids() {
  for (let i = 0; i <= maxAsteroids; i++) {
    engine.add(
      new Kala.Circle(Math.random() * 50, Math.random() * 50, 2, 2, 1, 1, {
        name: "asteroid",
        isSensor: false
      })
    );
    render.addSprite(engine.allBodies[engine.allBodies.length - 1]);
    engine.allBodies[engine.allBodies.length - 1].velocity = Vec2(
      Math.random() * Math.random() < 0.5 ? 10 : -10,
      Math.random() * Math.random() < 0.5 ? 10 : -10
    );
  }
}

function newAsteroid() {
  engine.add(
    new Kala.Circle(Math.random() * 500, Math.random() * 500, 2, 2, 1, 1, {
      name: "asteroid",
      isSensor: false
    })
  );
  render.addSprite(engine.allBodies[engine.allBodies.length - 1]);

  directionX = Math.random() < 0.5 ? 10 : -10;
  directionY = Math.random() < 0.5 ? 10 : -10;
  engine.allBodies[engine.allBodies.length - 1].hasHit = false;
  engine.allBodies[engine.allBodies.length - 1].velocity = Vec2(
    Math.random() * directionX,
    Math.random() * directionY
  );
}

function playerDeath() {
  playerLives--;
  deathAnimation.position.x = engine.allBodies[0].center.x;
  deathAnimation.position.y = engine.allBodies[0].center.y;
  deathAnimation.renderable = true;
  render.app.stage.getChildAt(0).getChildAt(0).renderable = false;
  deathAnimation.play();
  deathAnimation.onLoop = function() {
    deathLoop++;
    console.log(deathLoop);

    if (deathLoop >= 2) {
      deathAnimation.renderable = false;
      render.app.stage.getChildAt(0).getChildAt(0).renderable = true;
      engine.allBodies[0].velocity = Vec2(0, 0);
      engine.allBodies[0].move(
        Vec2(
          width / 2 - engine.allBodies[0].center.x,
          height / 2 - engine.allBodies[0].center.y
        )
      );
      deathAnimation.stop();
      isDying = false;
      deathLoop = 0;
    }
  };
}

function playerRestart() {}

document.addEventListener("keydown", function(e) {
  e.preventDefault();

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
  e.preventDefault();
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
