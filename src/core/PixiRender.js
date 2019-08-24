//var renderIndex = new Indexer();

function PixiRender(width, height, theme, scale) {
  var self = this;

  //Set up PIXI Application
  this.app = new PIXI.Application({
    height: width,
    width: height,
    backgroundColor: 0xfcfccf,
    antialias: true
  });
  this.scale = scale;
  document.body.appendChild(this.app.view);
  this.app.stage.scale.x = this.app.stage.scale.y = scale;

  var renderBodies = {};
  this.bodyContainer = new PIXI.Container();

  this.lineContainer = new PIXI.Container();
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
  this.app.stage.addChild(this.lineContainer);

  this.loader.onComplete.add(() => {
    this.isLoaded = true;
  });

  this.addRectangle = function(rect) {};

  this.addSprite = function(body) {
    var renderBody = renderBodies[body.bodyID];
    if (!renderBody) {
      console.log("here");
      if (body.type === "Rectangle") {
        renderBodies[body.bodyID] = new PIXI.Sprite(
          body.render.texture || sprites.rectTexture
        );
        renderBodies[body.bodyID].anchor.x = renderBodies[
          body.bodyID
        ].anchor.y = 0.5;
        renderBody = renderBodies[body.bodyID];
        this.bodyContainer.addChild(renderBody);
      } else if (body.type === "Circle") {
        renderBodies[body.bodyID] = new PIXI.Sprite(
          body.render.texture || sprites.circleTexture
        );
        renderBody = renderBodies[body.bodyID];

        renderBody.anchor.x = renderBody.anchor.y = 0.5;
        renderBody.height = renderBody.width = body.radius * 2;
        this.bodyContainer.addChild(renderBody);
      }
    }
    renderBody.position.x = body.center.x;
    renderBody.position.y = body.center.y;
    renderBody.width = body.radius ? body.radius * 2 : body.width;
    renderBody.height = body.radius ? body.radius * 2 : body.height;
    renderBody.rotation = body.angle;
    //   r.position.x = body.center.x;
    //   r.position.y = body.center.y;
    //   r.width = body.width;
    //   r.height = body.height;
    //   r.rotation = body.angle;
    //   renderBodies[body.bodyID] = r;
    //   //body.renderIndex = this.app.stage.getChildIndex(r);
    // }
    //
    //
    //   c.position.x = body.center.x;
    //   c.position.y = body.center.y;
    //   c.rotation = body.angle;
    //   renderBodies[body.bodyID] = c;
    //   //body.renderIndex = this.app.stage.getChildIndex(c);
    // }
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

  this.drawLine = function(v1, v2) {
    var graphics = new PIXI.Graphics();

    this.lineContainer.addChild(graphics);

    graphics.clear();
    graphics.lineStyle(1, 0x000000, 1);
    graphics.moveTo(v1.x, v1.y);
    graphics.lineTo(v2.x, v2.y);
  };

  this.drawPolygon = function(polygon) {
    var polygonGraphics = renderBodies[polygon.bodyID];
    if (!polygonGraphics) {
      renderBodies[polygon.bodyID] = new PIXI.Graphics();
      this.bodyContainer.addChild(renderBodies[polygon.bodyID]);
      polygonGraphics = renderBodies[polygon.bodyID];
    }
    polygonGraphics.clear();
    polygonGraphics.lineStyle(1);
    //polygonGraphics.beginFill(0x3500fa, 1);

    polygonGraphics.drawPolygon(polygon.verticesToPath());
    //polygonGraphics.endFill();
  };

  this.renderEdge = function(v1, v2) {};

  this.create = function(engine) {
    if (engine.hasChanged) {
      this.clear();
      engine.hasChanged = false;
    }

    var bodies = engine.allBodies;

    for (let i = 0; i < bodies.length; i++) {
      if (bodies[i].type === "Rectangle" || bodies[i].type === "Circle") {
        this.addSprites(bodies[i]);
      } else if (bodies[i].type === "Polygon") {
        this.drawPolygon(bodies[i]);
      }
    }
  };

  this.clear = function() {
    renderBodies = {};
    this.bodyContainer.removeChildren();
    this.lineContainer.removeChildren();
    // for (let i = this.bodyContainer.children.length - 1; i >= 0; i--) {
    //   this.bodyContainer.removeChild(this.bodyContainer.children[i]);
    // }
    // for (let i = this.lineContainer.children.length - 1; i >= 0; i--) {
    //   this.lineContainer.removeChild(this.lineContainer.children[i]);
    // }
  };

  this.update = function(engine) {
    this.create(engine);
    //   var engineBodies = engine.allBodies;
    //   for (let i = 0; i < this.bodyContainer.children.length; i++) {
    //     var engineBody = engineBodies[i];
    //     var renderBody = renderBodies[engineBody.bodyID];
    //
    //     var engineBodyPos = {
    //       x: engineBody.center.x,
    //       y: engineBody.center.y,
    //       angle: engineBody.angle,
    //       width: engineBody.width,
    //       height: engineBody.height,
    //       radius: engineBody.radius * 2
    //     };
    //     renderBody.position.x = engineBodyPos.x;
    //     renderBody.position.y = engineBodyPos.y;
    //     renderBody.rotation = engineBodyPos.angle;
    //     renderBody.width = engineBody.radius
    //       ? engineBodyPos.radius
    //       : engineBodyPos.width;
    //     renderBody.height = engineBodyPos.radius
    //       ? engineBodyPos.radius
    //       : engineBodyPos.height;
    //   }
    //
    //   engine.allConstraints.forEach(function(constraint) {
    //     self.drawLine(
    //       constraint.bodyA.center.x,
    //       constraint.bodyA.center.y,
    //       constraint.bodyB.center.x,
    //       constraint.bodyB.center.y
    //     );
    //     self.constraintContainer.addChild(graphics);
    //   });
  };
}
