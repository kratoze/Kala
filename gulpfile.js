var gulp = require("gulp");
var concat = require("gulp-concat");

var kalaFiles = [
  "./src/math/Vec2.js",
  "./src/core/Engine.js",
  "./src/core/PixiRender.js",
  "./src/core/Physics.js",
  "./src/core/Common.js",
  "./src/core/Indexer.js",
  "./src/core/Events.js",
  "./src/body/Body.js",
  "./src/body/CollisionInfo.js",
  "./src/body/Rectangle.js",
  "./src/body/Circle.js",
  "./src/body/RectangleCollision.js",
  "./src/body/CircleCollision.js",
  "./src/constraint/Constraint.js",
  "./src/constraint/DistanceConstraint.js",
  "./src/constraint/NaiveDistance.js",
  "./src/constraint/Spring.js",
  "./src/factory/Factory.js",
  "./src/index.js"
];

gulp.task("concatKala", function() {
  return gulp
    .src(kalaFiles)
    .pipe(concat("Kala.js"))
    .pipe(gulp.dest("./build/"));
});
