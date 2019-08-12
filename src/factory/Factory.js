function Factory() {}

Factory.prototype.createSquareGrid = function(
  x,
  y,
  squaresWidth,
  squaresHeight,
  spacing,
  rows,
  mass,
  friction,
  restitution
) {
  var count = 0;
  var squareGrid = [];
  //numberOfSquares = numberOfSquares / numberOfSquares;
  for (let i = 0; i < rows * spacing; i += spacing) {
    for (let j = 0; j < rows * spacing; j += spacing) {
      squareGrid[count] = new Kala.Rectangle(
        i + x,
        j + y,
        squaresWidth,
        squaresHeight,
        mass,
        friction,
        restitution
      );
      count++;
    }
  }
  return squareGrid;
};

Factory.prototype.createCircleGrid = function(
  x,
  y,
  circleRadius,
  spacing,
  rows,
  mass,
  friction,
  restitution
) {
  var count = 0;
  var squareGrid = [];
  //numberOfSquares = numberOfSquares / numberOfSquares;
  for (let i = 0; i < rows * spacing; i += spacing) {
    for (let j = 0; j < rows * spacing; j += spacing) {
      squareGrid[count] = new Kala.Circle(
        i + x,
        j + y,
        circleRadius,
        mass,
        friction,
        restitution
      );
      count++;
    }
  }
  return squareGrid;
};
