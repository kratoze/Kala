var gulp = require("gulp");
var concat = require("gulp-concat");
var uglify = require("google-closure-compiler").gulp();

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
  "./src/body/Polygon.js",
  "./src/body/Rectangle.js",
  "./src/body/Circle.js",
  "./src/body/RectangleCollision.js",
  "./src/body/CircleCollision.js",
  "./src/body/PolygonCollision.js",
  "./src/constraint/Constraint.js",
  "./src/constraint/DistanceConstraint.js",
  "./src/constraint/NaiveDistance.js",
  "./src/constraint/Spring.js",
  "./src/factory/Factory.js",
  "./src/index.js"
];

gulp.task("concatKala", function() {
  concatFiles();
  return uglifyKala();
});

gulp.watch(kalaFiles, function() {
  return concatFiles();
});

function concatFiles() {
  return gulp
    .src(kalaFiles)
    .pipe(concat("Kala.js"))
    .pipe(gulp.dest("./build/"));
}

function uglifyKala() {
  return gulp
    .src("./build/Kala.js")
    .pipe(uglify({ warning_level: "QUIET", js_output_file: "Kala.min.js" }))
    .pipe(gulp.dest("./build/"));
}
