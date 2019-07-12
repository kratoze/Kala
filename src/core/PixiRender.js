function PixiRender() {
  var self = this;
  //Set up PIXI
  this.app = new PIXI.Application({
    height: 1000,
    width: 1000,
    backgroundColor: 0xfcfccf,
    forceCanvas: true,
    antialias: true
  });
  document.body.appendChild(this.app.view);
  this.app.stop();
  this.app.stage.scale.x = this.app.stage.scale.y = 20;

  this.allRenderBodies = [];
  this.loader = PIXI.Loader.shared;

  var sprites = {};

  //Load spritesheet
  this.isLoaded = false;

  this.loader.add("sheet", "imgs/spritesheet_metal.json").load(onAssetsLoaded);
  this.loader.onComplete.add(() => {
    this.app.start();
    this.isLoaded = true;
  });

  function onAssetsLoaded() {
    sprites.rectTexture =
      self.loader.resources["sheet"].textures["elementMetal011.png"];
    console.log("loaded");
  }
  this.addRect = function(rect) {
    var r1 = this.graphics.drawRect(0, 0, rect.width, rect.height);

    r1.pivot.set(r1.width / 2, r1.height / 2);
    r1.position.x = rect.center.x;
    r1.position.y = rect.center.y;
    var centerPoint = this.graphics.drawRect(r1.width / 2, r1.height / 2, 1, 1);
    this.allRenderBodies.push(r1);
    this.app.stage.addChild(r1);
    this.app.stage.addChild(centerPoint);
  };

  this.addSprite = function(body) {
    if (body.type === "Rectangle") {
      console.log("sprite rect");
      var r = new PIXI.Sprite(sprites.rectTexture);
      r.anchor.x = r.anchor.y = 0.5;
      r.position.x = body.center.x;
      r.position.y = body.center.y;
      r.width = body.width;
      r.height = body.height;

      this.allRenderBodies.push(r);
      this.app.stage.addChild(
        this.allRenderBodies[this.allRenderBodies.length - 1]
      );
    }
    if (body.type === "Circle") {
      //Add circle
      var c = new PIXI.Sprite.from("imgs/circle.png");
      c.anchor.x = c.anchor.y = 0.5;
      c.height = c.width = body.radius * 2;
      c.position.x = body.center.x;
      c.position.y = body.center.y;
      this.allRenderBodies.push(c);
      this.app.stage.addChild(
        this.allRenderBodies[this.allRenderBodies.length - 1]
      );
    }
  };

  this.addSprites = function(bodies) {
    if (Array.isArray(bodies)) {
      for (let i = 0; i < bodies.length; i++) {
        this.addSprites(bodies[i]);
        console.log("body added : Render");
      }
    } else {
      this.addSprite(bodies);
    }
  };

  this.update = function(engine) {
    var engineBodies = engine.allBodies;
    for (let i = 0; i < this.allRenderBodies.length; i++) {
      var engineBody = engineBodies[i];
      var renderBody = this.allRenderBodies[i];

      var engineBodyPos = {
        x: engineBody.center.x,
        y: engineBody.center.y,
        angle: engineBody.angle
      };
      renderBody.position.x = engineBodyPos.x;
      renderBody.position.y = engineBodyPos.y;
      renderBody.rotation = engineBody.angle;
    }
  };
}
