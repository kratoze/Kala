// https://www.geekstrick.com/load-json-file-locally-using-pure-javascript/

function loadExamples(callback) {
  var obj = new XMLHttpRequest();
  obj.overrideMimeType("application/json");
  obj.open("GET", "/examplesdata.json/", true);
  obj.onreadystatechange = () => {
    if (obj.readyState === 4) {
      if (obj.status === 200) {
        callback(obj.responseText);
      } else {
        console.log("Error: " + obj.statusText);
      }
    }
  };
  obj.send(null);
}

var examples;

loadExamples(function(response) {
  examples = JSON.parse(response);
});

console.log(examples);
