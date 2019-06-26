function PixiRender() {
  this.app = new PIXI.Application({
    height: 500,
    width: 500,
    backgroundColor: 0xfcfccf,
    forceCanvas: true
  });
  this.app.stage.scale.x = this.app.stage.scale.y = 4;
  this.graphics = new PIXI.Graphics();

  // set the line style to have a width of 5 and set the color to red
  this.graphics.lineStyle(5, 0xb8b6ff);

  this.allRenderBodies = [];

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
      var r = new PIXI.Sprite.from("imgs/bluebox.png");
      r.anchor.x = r.anchor.y = 0.5;
      r.width = body.width;
      r.height = body.height;
      r.position.x = body.center.x;
      r.position.y = body.center.y;
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
        console.log("body added");
      }
    } else {
      this.addSprite(bodies);
    }
  };

  this.init = function() {
    document.body.appendChild(this.app.view);
    //this.app.stage.addChild(this.graphics);
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

/*Create function to add all engine bodies to PIXI world.
 * Refactor physics from book
 *
 */
