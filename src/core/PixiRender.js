/**
 * PixiRender - Uses Pixi.js to render the Engine's bodies and constraints
 *  @memberof Core
 * @class
 * @param  {number} width  The width of the canvas
 * @param  {number} height The height of the canvas
 * @param  {String} theme="stone"  The theme of the render as a string: space, stone, pool
 * @param  {number} scale  The amount the renderer is scaled by
 */
function PixiRender(width, height, theme, scale, canvas) {
  var self = this;

  //Set up PIXI Application
  this.app = new PIXI.Application({
    height: width,
    width: height,
    view: canvas,
    backgroundColor: 0xd7b7a7,
    antialias: true
  });

  var colors = [0x0092da, 0xf764fa, 0x3f417f, 0xa45290];

  this.scale = scale;
  console.log(canvas);

  if (!canvas) {
    document.body.appendChild(this.app.view);
  }
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
      rectPNG = "../imgs/enemyBlue3.png";
      this.loader
        .add("ship", "../imgs/AsteroidGame/enemyBlue3.png")
        .add("asteroid1", "../imgs/AsteroidGame/meteorBrown_big1.png")
        .add("explosion", "../imgs/AsteroidGame/ExplosionAnimation.json")
        .load(onAssetsLoaded);
      break;
    case "stone":
      rectPNG = "elementMetal011.png";
      this.loader.add("sheet", "../imgs/spritesheet_metal.json").load(onAssetsLoaded);

      break;
    case "pool":
      this.loader
        .add("wood", "../imgs/PoolGameImgs/woodTexture.jpg")
        .add("whiteball", "../imgs/PoolGameImgs/whiteball.png")
        .add("poolballs", "../imgs/PoolGameImgs/redball.png")
        .add("pot", "../imgs/PoolGameImgs/pot.png")
        .load(onAssetsLoaded);
      break;
    default:
      break;
  }

  function onAssetsLoaded() {
    sprites.circleTexture = PIXI.Sprite.from("../imgs/circle.png").texture;
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

  /**
   * Adds a Rectangle to the renderer
   *
   * @param  {Rectangle} rect The Rectangle to be rendered
   * @return {Object}      The Body's renderer reference
   */
  this.addRectangle = function(rect) {
    renderBodies[rect.bodyID] = new PIXI.Sprite(rect.render.texture || sprites.rectTexture);
    renderBodies[rect.bodyID].anchor.x = renderBodies[rect.bodyID].anchor.y = 0.5;
    this.bodyContainer.addChild(renderBodies[rect.bodyID]);
    renderBodies[rect.bodyID].renderUpdate = this.updateBody;
    return renderBodies[rect.bodyID];
  };

  /**
   * Adds a Circle to the renderer
   *
   * @param  {Circle} circ The circle to be rendered
   * @return {Object}      The Body's renderer reference
   */
  this.addCircle = function(circ) {
    renderBodies[circ.bodyID] = new PIXI.Sprite(circ.render.texture || sprites.circleTexture);
    renderBodies[circ.bodyID].anchor.x = renderBodies[circ.bodyID].anchor.y = 0.5;
    renderBodies[circ.bodyID].height = renderBodies[circ.bodyID].width = circ.radius * 2;
    this.bodyContainer.addChild(renderBodies[circ.bodyID]);
    renderBodies[circ.bodyID].renderUpdate = this.updateBody;
    return renderBodies[circ.bodyID];
  };

  /**
   * Adds a Polygon to the renderer
   *
   * @param  {Polygon} polygon The Polygon to be rendered
   * @return {Object}      The Body's renderer reference
   */
  this.addPolygon = function(polygon) {
    var polygonGraphics = renderBodies[polygon.bodyID];
    if (!polygonGraphics) {
      renderBodies[polygon.bodyID] = new PIXI.Graphics();
      polygon.render.color = polygon.render.color ? polygon.render.color : colors[Math.floor(Math.random() * colors.length)];

      this.bodyContainer.addChild(renderBodies[polygon.bodyID]);
      polygonGraphics = renderBodies[polygon.bodyID];
    }

    renderBodies[polygon.bodyID].renderUpdate = this.updatePolygon;
    return renderBodies[polygon.bodyID];
  };

  /**
   * Adds a Body to the renderer - checks the Body's type then calls the appropriate "add" method
   *
   * @param  {Body} body The Body to be rendered
   */
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

  /**
   * Adds the provided Bodies to the renderer
   *
   * @param  {Array<Body>} bodies An array of Bodies to be added to the renderer
   */
  this.addSprites = function(bodies) {
    if (Array.isArray(bodies)) {
      for (let i = 0; i < bodies.length; i++) {
        this.addSprite(bodies[i]);
      }
    } else {
      this.addSprite(bodies);
    }
  };

  /**
   * Removes a Sprite by the index provided.
   * Passing in an Engine Body's "bodyID" will work to delete that Body from the renderer
   *
   *
   * @param  {number} index The index of the Body being deleted from the renderer
   */
  this.removeSprite = function(index) {
    var tempSprite = this.bodyContainer.getChildAt(index);
    if (tempSprite != undefined) {
      this.bodyContainer.removeChild(tempSprite);
    }
  };

  var graphics = new PIXI.Graphics();

  /**
   * Draws a black line between 2 Vectors
   *
   * @param  {Vec2} v1 The first Vector point
   * @param  {Vec2} v2 The second Vector point
   */
  this.drawLine = function(v1, v2) {
    graphics.clear();

    this.lineContainer.addChild(graphics);

    graphics.lineStyle(1 / scale, 0x000000, 1);
    graphics.moveTo(v1.x, v1.y);
    graphics.lineTo(v2.x, v2.y);
  };

  /**
   * Updates the position and rotation of a sprite
   * Used for Rectangle and Circle sprites
   *
   * @param  {Body} body The Body
   */
  this.updateBody = function(body) {
    var renderBody = renderBodies[body.bodyID];
    renderBody.position.x = body.center.x;
    renderBody.position.y = body.center.y;
    renderBody.width = body.radius ? body.radius * 2 : body.width;
    renderBody.height = body.radius ? body.radius * 2 : body.height;
    renderBody.rotation = body.angle;
  };

  /**
   * Updates the position and roatation of a Polygon
   * Used for Polygon sprites
   * @param  {Polygon} polygon The Polygon Body
   */
  this.updatePolygon = function(polygon) {
    var polygonGraphics = renderBodies[polygon.bodyID];
    polygonGraphics.clear();
    polygonGraphics.lineStyle(0 / scale, polygon.lineColor || 0x03f8fc);
    polygonGraphics.lineColor;
    polygonGraphics.beginFill(polygon.render.color, 1);
    polygonGraphics.drawPolygon(polygon.vertexToPath());
    polygonGraphics.endFill();
  };

  /**
   * Deletes everything held within the PIXI contatiners, removing all render bodies and lines
   */
  this.clear = function() {
    renderBodies = {};
    this.bodyContainer.removeChildren();
    this.lineContainer.removeChildren();
  };

  /**
   * Updates the positions and rotation of all renders bodies and constraint links
   *
   * @param  {Engine} engine The being rendered
   */
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
      renderBody = renderBodies[bodies[i].bodyID];
      if (!renderBody) {
        renderBody = this.addShape(bodies[i]);
      }
      renderBody.renderUpdate(bodies[i]);
    }
  };
}
