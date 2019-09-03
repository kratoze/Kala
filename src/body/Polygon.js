var Polygon = function(vertex, mass, friction, restitution, options) {
  var self = this;
  // vertex is an array of Vec2
  this.vertex = vertex.slice();
  // find the center of the polygon once vertices are set
  var centroid = this.findCentroid();
  Body.call(this, centroid.x, centroid.y, mass, friction, restitution, options);
  this.sortVertices();

  this.type = "Polygon";
  // get the edges of the polygon and store in an array of Vec2
  this.edges = this.calculateEdges();
  // calculate the normals for each edge and store in an array of Vec2
  this.faceNormal = this.calculateFaceNormals();
  //this.sortVertices();

  // update the polygon's inertia using the mass
  this.updateInertia();
};

Common.extend(Polygon, Body);

/**
 * Moves the Polygon by a given Vec2.  Use this to move Polygon instead of
 * directly assigning to its center.
 *
 * @param  {Vec2} v description
 * @return {Polygon}   Returns this Polygon
 */
Polygon.prototype.move = function(v) {
  // move each vertex by the vector passed in
  for (let i = 0; i < this.vertex.length; i++) {
    this.vertex[i] = this.vertex[i].add(v);
  }
  this.edges = this.calculateEdges();
  this.faceNormal = this.calculateFaceNormals();
  // move the center
  this.center = this.center.add(v);
  return this;
};

/**
 * Rotates the Polygon around its center.  Use this to rotate the Polygon
 * instead of directly assigning to its angle.
 *
 * @param  {number} angle description
 */
Polygon.prototype.rotate = function(angle) {
  //angle = angle;
  this.angle += angle;
  // rotate each vertex around the polygon's center
  for (let i = 0; i < this.vertex.length; i++) {
    this.vertex[i] = this.vertex[i].rotate(this.center, angle);
  }
  // new orientation requires edges and face normals to be calculated again.
  this.edges = this.calculateEdges();
  this.faceNormal = this.calculateFaceNormals();
  return this;
};

/**
 * Calculates the Polygon's edges from its vertex.
 * Called automatically by the constructor and Rotate method
 *
 * @return {Vec2[]}  An array containing the Edges
 */
Polygon.prototype.calculateEdges = function() {
  var tmpEdges = [];
  for (let i = 0; i < this.vertex.length - 1; i++) {
    tmpEdges[i] = this.vertex[i].subtract(this.vertex[i + 1]);
  }
  tmpEdges[tmpEdges.length] = this.vertex[this.vertex.length - 1].subtract(this.vertex[0]);
  return tmpEdges;
};

/**
 * Calculate the face normals of the Polygon.
 * A face normal is a unit vector that is perpendicular to
 * an edge.
 * Called automatically by the constructor and Rotate method
 *
 * @return {Vec2[]}  An array containing the face normals
 */
Polygon.prototype.calculateFaceNormals = function() {
  var tmpFNormals = [];

  for (let i = 0; i < this.edges.length; i++) {
    // perpendicular normals
    // tmpFNormals[i] = Vec2(this.edges[i].y, -this.edges[i].x);
    // tmpFNormals[i] = tmpFNormals[i].normalize();

    // parallel normals
    tmpFNormals[i] = this.edges[i].normalize();
  }
  return tmpFNormals;
};

/**
 * Returns an array unformatted array of the Polygon's vertex.
 * Useful for passing the vertex to other APIs
 *
 * @return {number[]}  The vertex points as an array
 */
Polygon.prototype.vertexToPath = function() {
  var vertexArray = [];
  for (let i = 0; i < this.vertex.length; i++) {
    vertexArray.push(this.vertex[i].x);
    vertexArray.push(this.vertex[i].y);
  }
  return vertexArray;
};

/**
 * Finds the center of the Polygon.
 * Called automatically in the constructor.
 *
 * @return {Vec2}  The centroid, or center, of the Polygon.
 */
Polygon.prototype.findCentroid = function() {
  // formula from https://en.wikipedia.org/wiki/Centroid#Of_a_polygon
  // with help from https://stackoverflow.com/questions/2792443/finding-the-centroid-of-a-polygon
  var signedArea = 0,
    a,
    v0,
    v1;
  var centroid = Vec2(0, 0);

  // calculate the signed area between vertex
  for (let i = 0; i < this.vertex.length - 1; i++) {
    // calculate the current and next vertex
    v0 = this.vertex[i];
    v1 = this.vertex[i + 1];

    // a = (xi * yi+1 - xi+1 * yi)
    a = v0.x * v1.y - v1.x * v0.y;
    signedArea += a;
    centroid.x += (v0.x + v1.x) * a;
    centroid.y += (v0.y + v1.y) * a;
  }

  // calulate the signed area between the last and first vertex
  v0 = this.vertex[this.vertex.length - 1];
  v1 = this.vertex[0];
  a = v0.x * v1.y - v1.x * v0.y;
  signedArea += a;
  centroid.x += (v0.x + v1.x) * a;
  centroid.y += (v0.y + v1.y) * a;

  // the centroid is the sum of a*(Xi+Xi+1) divided by signedArea * 6
  signedArea = signedArea / 2;
  centroid.x = centroid.x / (6 * signedArea);
  centroid.y = centroid.y / (6 * signedArea);

  return centroid;
};

Polygon.prototype.sortVertices = function() {
  var angleFromCenter;
  var center = this.center;
  //for (let i = 0; i < this.vertex.length - 1; i++) {
  // angleFromCenterV1 = this.center.angleFromVector(this.vertex[i]);
  // angleFromCenterV2 = this.center.angleFromVector(this.vertex[i]);

  this.vertex.sort(function(a, b) {
    return a.angleFromVector(center) - b.angleFromVector(center);
  });
  //  }
};

var centroidGraphic = new PIXI.Graphics();

Polygon.prototype.draw = function(render) {
  centroidGraphic.clear();
  render.app.stage.addChild(centroidGraphic);
  centroidGraphic.lineStyle(1 / render.scale);

  centroidGraphic.drawCircle(this.center.x, this.center.y, 10 / render.scale);

  //render.drawPolygon(this);
  // var midpoint;
  // for (let i = 0; i < this.vertex.length - 1; i++) {
  //   //render.drawLine(this.vertex[i], this.vertex[i + 1]);
  //   midpoint = this.vertex[i].midpoint(this.vertex[i + 1]);
  //   render.drawLine(midpoint, midpoint.add(this.faceNormal[i].scale(10)));
  // }
  // //render.drawLine(this.vertex[0], this.vertex[this.vertex.length - 1]);
  // midpoint = this.vertex[0].midpoint(this.vertex[this.vertex.length - 1]);
  // render.drawLine(midpoint, midpoint.add(this.faceNormal[2].scale(10)));
};

/**
 * Updates the inertia based on the Polygon's mass and area.
 * Should only be run in the constructor or when updateMass is called
 */
Polygon.prototype.updateInertia = function() {
  // inertia= mass*area
  //
  // find the area of the polygon
  // area = sum of (XnYn+1 - YnXn+1) / 2
  // where n is number of vertex
  if (this.invMass === 0) {
    this.inertia = 0;
  } else {
    var areaSum = 0;
    var area;
    for (let i = 0; i < this.vertex - 1; i++) {
      areaSum += this.vertex[i].x * this.vertex[i + 1].y - this.vertex[i].y * this.vertex[i + 1].x;
    }
    areaSum +=
      this.vertex[this.vertex.length - 1].x * this.vertex[0].y - this.vertex[this.vertex.length - 1].y * this.vertex[0].x;
    areaSum = Math.abs(areaSum);
    area = areaSum / 2;
    this.inertia = ((1 / this.invMass) * area) / 12;
    this.inertia = 1 / this.inertia;
  }
};
