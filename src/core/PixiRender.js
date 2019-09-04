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
      this.loader.add("sheet", "imgs/spritesheet_metal.json").load(onAssetsLoaded);

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
        sprites.rectTexture = self.loader.resources["sheet"].textures["elementMetal011.png"];
        break;
      case "space":
        sprites.rectTexture = self.loader.resources["ship"].texture;
        sprites.circleTexture = self.loader.resources["asteroid1"].texture;
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

  this.addRectangle = function(rect) {
    renderBodies[rect.bodyID] = new PIXI.Sprite(rect.render.texture || sprites.rectTexture);
    renderBodies[rect.bodyID].anchor.x = renderBodies[rect.bodyID].anchor.y = 0.5;
    this.bodyContainer.addChild(renderBodies[rect.bodyID]);
    renderBodies[rect.bodyID].renderUpdate = this.updateBody;
    return renderBodies[rect.bodyID];
  };

  this.addCircle = function(circ) {
    renderBodies[circ.bodyID] = new PIXI.Sprite(circ.render.texture || sprites.circleTexture);
    renderBodies[circ.bodyID].anchor.x = renderBodies[circ.bodyID].anchor.y = 0.5;
    renderBodies[circ.bodyID].height = renderBodies[circ.bodyID].width = circ.radius * 2;
    this.bodyContainer.addChild(renderBodies[circ.bodyID]);
    renderBodies[circ.bodyID].renderUpdate = this.updateBody;
    return renderBodies[circ.bodyID];
  };

  this.addPolygon = function(polygon) {
    var polygonGraphics = renderBodies[polygon.bodyID];
    if (!polygonGraphics) {
      renderBodies[polygon.bodyID] = new PIXI.Graphics();
      this.bodyContainer.addChild(renderBodies[polygon.bodyID]);
      polygonGraphics = renderBodies[polygon.bodyID];
    }

    renderBodies[polygon.bodyID].renderUpdate = this.updatePolygon;
    return renderBodies[polygon.bodyID];
  };

  this.addShape = function(body) {
    switch (body.type) {
      case "Rectangle":
        return this.addRectangle(body);
      case "Circle":
        return this.addCircle(body);
      case "Polygon":
        return this.addPolygon(body);
      default:
        break;
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
  var graphics = new PIXI.Graphics();

  this.drawLine = function(v1, v2) {
    graphics.clear();

    this.lineContainer.addChild(graphics);

    graphics.lineStyle(1 / scale, 0x000000, 1);
    graphics.moveTo(v1.x, v1.y);
    graphics.lineTo(v2.x, v2.y);
  };

  this.renderEdge = function(v1, v2) {};

  this.updateBody = function(body) {
    var renderBody = renderBodies[body.bodyID];
    renderBody.position.x = body.center.x;
    renderBody.position.y = body.center.y;
    renderBody.width = body.radius ? body.radius * 2 : body.width;
    renderBody.height = body.radius ? body.radius * 2 : body.height;
    renderBody.rotation = body.angle;
  };

  this.updatePolygon = function(polygon) {
    var polygonGraphics = renderBodies[polygon.bodyID];
    polygonGraphics.clear();
    polygonGraphics.lineStyle(1 / scale, polygon.lineColor || 0x03f8fc);
    polygonGraphics.lineColor;
    //polygonGraphics.beginFill(0x3500fa, 1);
    polygonGraphics.drawPolygon(polygon.vertexToPath());
    //polygonGraphics.endFill();

    // var midpoint;
    // for (let i = 0; i < polygon.vertex.length - 1; i++) {
    //   //render.drawLine(this.vertex[i], this.vertex[i + 1]);
    //   midpoint = polygon.vertex[i].midpoint(polygon.vertex[i + 1]);
    //   self.drawLine(midpoint, midpoint.add(polygon.faceNormal[i].scale(10 / scale)));
    // }
    // //render.drawLine(polygon.vertex[0], polygon.vertex[polygon.vertex.length - 1]);
    // midpoint = polygon.vertex[0].midpoint(polygon.vertex[polygon.vertex.length - 1]);
    // self.drawLine(midpoint, midpoint.add(polygon.faceNormal[polygon.faceNormal.length - 1].scale(10 / scale)));
  };

  this.clear = function() {
    renderBodies = {};
    this.bodyContainer.removeChildren();
    this.lineContainer.removeChildren();
  };

  this.update = function(engine) {
    if (engine.hasChanged) {
      this.clear();
      engine.hasChanged = false;
    }

    var bodies = engine.allBodies;
    var renderBody;
    for (let i = 0; i < engine.allConstraints.length; i++) {
      this.drawLine(engine.allConstraints[i].bodyA.center, engine.allConstraints[i].bodyB.center);
    }
    for (let i = 0; i < bodies.length; i++) {
      //bodies[i].draw(this);
      renderBody = renderBodies[bodies[i].bodyID];
      if (!renderBody) {
        renderBody = this.addShape(bodies[i]);
      }
      renderBody.renderUpdate(bodies[i]);
      //this.updateBody(bodies[i]);
    }
  };
}
