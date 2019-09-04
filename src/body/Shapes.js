var RegularPoly = function(x, y, radius, sides, mass, friction, restitution, options) {
  var vertices = [];
  var center = Vec2(x, y);

  var vertex = Vec2(center.x - radius, center.y);
  var centralAngle = 360 / sides;
  centralAngle = centralAngle * (Math.PI / 180);
  //Side = 2 × Radius × sin(π/n)
  for (let i = 0; i < sides; i++) {
    vertices.push(vertex);
    vertex = vertex.rotate(center, centralAngle);
  }

  Polygon.call(this, vertices, mass, friction, restitution, options);
};

Common.extend(RegularPoly, Polygon);
