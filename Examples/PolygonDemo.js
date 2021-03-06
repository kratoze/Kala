var scale = 50;
var scale2 = 20;

var engine = new Engine();
var render = new PixiRender(500, 500, "stone", 20);
engine.gravity = Vec2(0, 10);
var width, height;
width = height = render.app.view.width / scale2;

//var ground = new Kala.Rectangle(0, height / 2, 2, height, 0, 1, 1);
//engine.add(ground);

var bounds = [
  new Rectangle(width / 2, 0, width, 2, 0, 1, 0.2),
  new Rectangle(width, height / 2, 2, height, 0, 1, 0.2),
  new Rectangle(width / 2, height, width, 2, 0, 1, 0.2),
  new Rectangle(0, height / 2, 2, height, 0, 1, 0.2)
];
var triangleVertices = [Vec2(250 / scale2, 350 / scale2), Vec2(150 / scale2, 350 / scale2), Vec2(150 / scale2, 250 / scale2)];
var triangleVertices2 = [Vec2(250 / scale, 350 / scale), Vec2(150 / scale, 200 / scale), Vec2(100 / scale, 250 / scale)];
var otherShapePoly = [
  Vec2(250 / scale, 350 / scale),
  Vec2(150 / scale, 200 / scale),
  Vec2(100 / scale, 250 / scale),
  Vec2(100 / scale, 350 / scale)
];

var squarePolygonPoints = [
  Vec2(50 / scale, 100 / scale),
  Vec2(150 / scale, 100 / scale),

  Vec2(150 / scale, 200 / scale),
  Vec2(50 / scale, 200 / scale)
];
var squarePolygonPoints2 = [
  Vec2(0 / scale2, 100 / scale2),
  Vec2(500 / scale2, 100 / scale2),
  Vec2(500 / scale2, 200 / scale2),
  Vec2(0 / scale2, 200 / scale2)
];
var triangle2 = new Polygon(triangleVertices2, 0.5, 0.2, 0.2);

var squarePolygon = new Polygon(squarePolygonPoints, 0.2, 0.2, 0.1);
var squarePolygon2 = new Polygon(squarePolygonPoints2, 0, 0.2, 0.2);

// for (let i = 0; i < 6; i++) {
//   engine.add(new Polygon(squarePolygonPoints, 1, 1, 0.1));
//   engine.allBodies[engine.allBodies.length - 1].move(Vec2(i * 5 - 3, i));
// }
//triangle.move(Vec2(100 / scale, 0));
//triangle.velocity = Vec2(0, 20);
//triangle.velocity = Vec2(0, 200);
//triangle.rotate(0.9);
//engine.add(triangle2);
//engine.add(squarePolygon);
//engine.add(squarePolygon2);

//squarePolygon2.move(Vec2(0, 400 / 20));
//squarePolygon.move(Vec2(3, 4));
// squarePolygon.rotate(0.7);
//squarePolygon2.rotate(0.7);
var triangle = new Polygon(triangleVertices, 1, 0.3, 0.2);

triangle.move(Vec2(0, -5));
triangle.rotate(0.4);

//engine.add(squarePolygon);

squarePolygon2.move(Vec2(0, 400 / 20));
engine.add(squarePolygon2);

//squarePolygon2.velocity = Vec2(0, 20);
var squares = [];
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    // squares.push(new Polygon(squarePolygonPoints, 0.2, 0.3, 0.2));
    // squares[squares.length - 1].move(Vec2(i * 3 + 2, j * 3 + 10));
    // engine.add(new RegularPoly(150 / 20 + i, 100 / 20 + j, 1, 4, 1, 0.2, 0.2));
  }
}
// var hex = new RegularPoly(5, 5, 1, 6, 1, 1, 0.2);
// engine.add(hex);
// var anchorSquare = new Polygon(squarePolygonPoints, 0, 2, 0.2);
//triangle.move(Vec2(0, 0));
//engine.add(triangle);

// engine.add(anchorSquare);
// anchorSquare.move(Vec2(10, 0));

// for (let i = 0; i < 30; i++) {
//   engine.add(new RegularPoly(50 / 20 + i * 4, 250 / 20, 1, 3, 1, 0.2, 0.2));
// }
// var rod = new DistanceConstraint(anchorSquare, triangle, 15, 0.8);
// engine.addConstraint(rod);
var rect = new Rectangle(10, 20, 30, 3, 0, 0.2, 0.2);
render.loader.onComplete.add(() => {
  engine.initializeEngineCore(render);
  engine.add(triangle);
  engine.add(bounds);

  engine.add(squares);
  engine.movement = true;
});
document.addEventListener("keydown", function(e) {
  //Player Controls

  if (e.keyCode == 65) {
    hex.addAcceleration(Vec2(-50, 0));
  }

  if (e.keyCode == 68) {
    hex.addAcceleration(Vec2(50, 0));
  }

  if (e.keyCode == 87) {
    hex.addAcceleration(Vec2(0, -40));
    console.log("jump");
  }
  if (e.keyCode == 83) {
    hex.addAcceleration(Vec2(0, 40));
    console.log("jump");
  }
  if (e.keyCode == 32) {
    if (engine.movement) {
      engine.movement = false;
    } else {
      engine.movement = true;
    }
  }
});

document.addEventListener("keyup", function(e) {
  if (e.keyCode == 65) {
    hex.acceleration = Vec2(0, 10);
  }

  if (e.keyCode == 68) {
    hex.acceleration = Vec2(0, 10);
  }

  if (e.keyCode == 87) {
    hex.acceleration = Vec2(0, 10);
  }
});

var canvas = document.getElementsByTagName("canvas")[0];

canvas.addEventListener("mousedown", event => {
  createPolygon(event);
});

canvas.addEventListener("mouseup", event => {});

function createPolygon(event) {
  event.preventDefault();
  engine.add(
    new RegularPoly(
      Math.floor(event.clientX / 20),
      Math.floor(event.clientY / 20),
      Math.floor(Math.random() * 3) + 0.5,
      Math.floor(Math.random() * 7 + 3),
      1,
      0.2,
      0.3
    )
  );
}
engine.events.addCustomEvent(createPolygon(event));
