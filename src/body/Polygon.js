var Polygon = function(
  x,
  y,
  vertices,
  size,
  mass,
  friction,
  restitution,
  options
) {
  Body.call(this, x, y, mass, friction, restitution, options);
  this.type = "Polygon";
  // vertices is an array of Vec2
  this.vertices = vertices;
  this.edges = this.getEdges();
  this.faceNormals = this.getFaceNormals();
};

Common.extend(Polygon, Body);

Polygon.prototype.move = function(v) {
  for (let i = 0; i < this.vertices.length; i++) {
    this.vertices[i] = this.vertices[i].add(v);
  }
  this.edges = this.getEdges();
  this.faceNormals = this.getFaceNormals();
  //this.center.add(v)
  return this;
};

Polygon.prototype.rotate = function(angle) {
  this.angle += angle;
  for (let i = 0; i < this.vertices.length; i++) {
    this.vertices[i] = this.vertices[i].rotate(this.center, angle);
  }
  this.edges = this.getEdges();
  this.faceNormals = this.getFaceNormals();
};

Polygon.prototype.updateInertia = function() {};

Polygon.prototype.getEdges = function() {
  var tmpEdges = [];
  for (let i = 0; i < this.vertices.length - 1; i++) {
    tmpEdges[i] = this.vertices[i + 1].subtract(this.vertices[i]);
  }
  tmpEdges[tmpEdges.length] = this.vertices[0].subtract(
    this.vertices[this.vertices.length - 1]
  );
  return tmpEdges;
};

Polygon.prototype.getFaceNormals = function() {
  var tmpFNormals = [];

  for (let i = 0; i < this.edges.length; i++) {
    tmpFNormals[i] = Vec2(this.edges[i].y, -this.edges[i].x);
    tmpFNormals[i] = tmpFNormals[i].normalize();
  }
  return tmpFNormals;
};

Polygon.prototype.verticesToPath = function() {
  var vertexArray = [];
  for (let i = 0; i < this.vertices.length; i++) {
    vertexArray.push(this.vertices[i].x);
    vertexArray.push(this.vertices[i].y);
  }
  return vertexArray;
};

Polygon.prototype.findCentroid = function() {};

Polygon.prototype.draw = function(render) {
  //render.drawPolygon(this);
  //   var midpoint;
  //   for (let i = 0; i < this.vertices.length - 1; i++) {
  //     render.drawLine(this.vertices[i], this.vertices[i + 1]);
  //     midpoint = this.vertices[i].midpoint(this.vertices[i + 1]);
  //     render.drawLine(midpoint, midpoint.add(this.faceNormals[i].scale(10)));
  //   }
  //   render.drawLine(this.vertices[0], this.vertices[this.vertices.length - 1]);
  //   midpoint = this.vertices[0].midpoint(this.vertices[this.vertices.length - 1]);
  //   render.drawLine(midpoint, midpoint.add(this.faceNormals[2].scale(10)));
};
