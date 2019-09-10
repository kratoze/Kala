var fs = require("fs");
var examples = {};
examples = fs.readdir(__dirname, (err, files) => {
  if (err) throw err;
  var tmpExamples = {};
  files.forEach(file => {
    tmpExamples[file] = file;
  });
  console.log(tmpExamples);
  return tmpExamples;
});
