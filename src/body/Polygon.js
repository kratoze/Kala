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
  this.vertices = vertices;
  var centroid = this.findCentroid();
  Body.call(this, centroid.x, centroid.y, mass, friction, restitution, options);
  this.type = "Polygon";
  // vertices is an array of Vec2
  this.edges = this.getEdges();
  this.faceNormals = this.getFaceNormals();

  this.updateInertia();
};

Common.extend(Polygon, Body);

Polygon.prototype.move = function(v) {
  for (let i = 0; i < this.vertices.length; i++) {
    this.vertices[i] = this.vertices[i].add(v);
  }
  this.edges = this.getEdges();
  this.faceNormals = this.getFaceNormals();
  this.center = this.center.add(v);
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

Polygon.prototype.findCentroid = function() {
  var signedArea = 0,
    a,
    v0,
    v1;
  var centroid = Vec2(0, 0);

  // calculate the signed area between vertices
  for (let i = 0; i < this.vertices.length - 1; i++) {
    v0 = this.vertices[i];
    v1 = this.vertices[i + 1];

    // a = (xi * yi+1 - xi+1 * yi)
    a = v0.x * v1.y - v1.x * v0.y;
    signedArea += a;
    centroid.x += (v0.x + v1.x) * a;
    centroid.y += (v0.y + v1.y) * a;
  }

  // calulate the signed area between the last and first vertices
  v0 = this.vertices[this.vertices.length - 1];
  v1 = this.vertices[0];
  a = v0.x * v1.y - v1.x * v0.y;
  signedArea += a;
  centroid.x += (v0.x + v1.x) * a;
  centroid.y += (v0.y + v1.y) * a;

  signedArea = signedArea / 2;
  centroid.x = centroid.x / (6 * signedArea);
  centroid.y = centroid.y / (6 * signedArea);

  return centroid;
};
var centroidGraphic = new PIXI.Graphics();

Polygon.prototype.draw = function(render) {
  centroidGraphic.clear();
  render.app.stage.addChild(centroidGraphic);
  centroidGraphic.lineStyle(1);

  centroidGraphic.drawCircle(this.center.x, this.center.y, 10);

  //render.drawPolygon(this);
  // var midpoint;
  // for (let i = 0; i < this.vertices.length - 1; i++) {
  //   //render.drawLine(this.vertices[i], this.vertices[i + 1]);
  //   midpoint = this.vertices[i].midpoint(this.vertices[i + 1]);
  //   render.drawLine(midpoint, midpoint.add(this.faceNormals[i].scale(10)));
  // }
  // //render.drawLine(this.vertices[0], this.vertices[this.vertices.length - 1]);
  // midpoint = this.vertices[0].midpoint(this.vertices[this.vertices.length - 1]);
  // render.drawLine(midpoint, midpoint.add(this.faceNormals[2].scale(10)));
};

Polygon.prototype.updateInertia = function() {
  // inertia= mass*area
  //
  // find the area of the polygon
  // area = sum of (XnYn+1 - YnXn+1) / 2
  // where n is number of vertices
  if (this.invMass === 0) {
    this.inertia = 0;
  } else {
    var areaSum = 0;
    var area;
    for (let i = 0; i < this.vertices - 1; i++) {
      areaSum +=
        this.vertices[i].x * this.vertices[i + 1].y -
        this.vertices[i].y * this.vertices[i + 1].x;
    }
    areaSum +=
      this.vertices[this.vertices.length - 1].x * this.vertices[0].y -
      this.vertices[this.vertices.length - 1].y * this.vertices[0].x;
    areaSum = Math.abs(areaSum);
    area = areaSum / 2;
    this.inertia = ((1 / this.invMass) * area) / 12;
    this.inertia = 1 / this.inertia;
  }
};
