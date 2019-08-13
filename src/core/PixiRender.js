//var renderIndex = new Indexer();

function PixiRender(width, height, theme, scale) {
  var self = this;
  //Set up PIXI

  this.app = new PIXI.Application({
    height: width,
    width: height,
    backgroundColor: 0xfcfccf,
    forceCanvas: true,
    antialias: true
  });

  this.scale = scale;

  document.body.appendChild(this.app.view);
  this.app.stage.scale.x = this.app.stage.scale.y = scale;
  this.bodyContainer = new PIXI.Container();
  var graphics = new PIXI.Graphics();
  this.loader = new PIXI.Loader();
  this.isLoaded = false;
  var theme = theme || "stone";
  var sprites = {};
  var rectPNG;
  var circlePNG;
  switch (theme) {
    case "space":
      rectPNG = "imgs/enemyBlue3.png";
      this.loader
        .add("ship", "imgs/AsteroidGame/enemyBlue3.png")
        .add("asteroid1", "imgs/AsteroidGame/meteorBrown_big1.png")
        .add("explosion", "imgs/AsteroidGame/ExplosionAnimation.json")
        .load(onAssetsLoaded);
      break;
    case "stone":
      rectPNG = "elementMetal011.png";
      this.loader
        .add("sheet", "imgs/spritesheet_metal.json")
        .load(onAssetsLoaded);

      break;
    case "pool":
      this.loader
        .add("wood", "imgs/PoolGameImgs/woodTexture.jpg")
        .add("whiteball", "imgs/PoolGameImgs/whiteball.png")
        .add("poolballs", "imgs/PoolGameImgs/redball.png")
        .add("pot", "imgs/PoolGameImgs/pot.png")
        .load(onAssetsLoaded);
      break;
    default:
      break;
  }

  function onAssetsLoaded() {
    sprites.circleTexture = PIXI.Sprite.from("imgs/circle.png").texture;
    switch (theme) {
      case "stone":
        sprites.rectTexture =
          self.loader.resources["sheet"].textures["elementMetal011.png"];
        break;
      case "space":
        sprites.rectTexture = self.loader.resources["ship"].texture;
        sprites.circleTexture = self.loader.resources["asteroid1"].texture;
        // sprites.explosionSheet = self.loader.resources["explosion"].sprites;
        // sprites.explosion = new PIXI.AnimatedSprite(
        //   sprites.explosionSheet.animations["explosion"]
        // );
        break;
      case "pool":
        sprites.rectTexture = self.loader.resources["wood"].texture;

        break;
      default:
        break;
    }
  }

  this.app.stage.addChild(this.bodyContainer);
  this.app.stage.addChild(graphics);

  this.loader.onComplete.add(() => {
    this.isLoaded = true;
  });

  this.addRect = function(rect) {
    var r1 = this.graphics.drawRect(0, 0, rect.width, rect.height);

    r1.pivot.set(r1.width / 2, r1.height / 2);
    r1.position.x = rect.center.x;
    r1.position.y = rect.center.y;
    var centerPoint = this.graphics.drawRect(r1.width / 2, r1.height / 2, 1, 1);
    this.allRenderBodies.push(r1);
    this.app.stage.addChild(r1);
    //rect.renderIndex = this.app.stage.getChildIndex(r1);
    this.app.stage.addChild(centerPoint);
  };

  this.addSprite = function(body) {
    if (body.type === "Rectangle") {
      var r = new PIXI.Sprite(sprites.rectTexture);
      r.anchor.x = r.anchor.y = 0.5;
      r.position.x = body.center.x;
      r.position.y = body.center.y;
      r.width = body.width;
      r.height = body.height;

      this.bodyContainer.addChild(r);
      //body.renderIndex = this.app.stage.getChildIndex(r);
    }
    if (body.type === "Circle") {
      //Add circle
      var c = new PIXI.Sprite(sprites.circleTexture);
      c.anchor.x = c.anchor.y = 0.5;
      c.height = c.width = body.radius * 2;
      c.position.x = body.center.x;
      c.position.y = body.center.y;
      this.bodyContainer.addChild(c);
      //body.renderIndex = this.app.stage.getChildIndex(c);
    }
  };

  this.addSprites = function(bodies) {
    if (Array.isArray(bodies)) {
      for (let i = 0; i < bodies.length; i++) {
        this.addSprite(bodies[i]);
      }
    } else {
      this.addSprite(bodies);
    }
  };

  this.removeSprite = function(index) {
    var tempSprite = this.bodyContainer.getChildAt(index);
    if (tempSprite != undefined) {
      this.bodyContainer.removeChild(tempSprite);
    }
  };

  this.drawLine = function(x1, y1, x2, y2) {
    graphics.clear();
    graphics.lineStyle(0.1, 0x000000, 1);

    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
  };
  this.update = function(engine) {
    var engineBodies = engine.allBodies;
    for (let i = 0; i < this.bodyContainer.children.length; i++) {
      var engineBody = engineBodies[i];
      var renderBody = this.bodyContainer.children[i];

      var engineBodyPos = {
        x: engineBody.center.x,
        y: engineBody.center.y,
        angle: engineBody.angle,
        width: engineBody.width,
        height: engineBody.height,
        radius: engineBody.radius * 2
      };
      renderBody.position.x = engineBodyPos.x;
      renderBody.position.y = engineBodyPos.y;
      renderBody.rotation = engineBodyPos.angle;
      renderBody.width = engineBody.radius
        ? engineBodyPos.radius
        : engineBodyPos.width;
      renderBody.height = engineBodyPos.radius
        ? engineBodyPos.radius
        : engineBodyPos.height;
    }

    engine.allConstraints.forEach(function(constraint) {
      self.drawLine(
        constraint.bodyA.center.x,
        constraint.bodyA.center.y,
        constraint.bodyB.center.x,
        constraint.bodyB.center.y
      );
    });
  };
}
