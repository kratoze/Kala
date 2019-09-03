if (polyConfig1.max - polyConfig2.min < polyConfig2.max - polyConfig1.min) {
  normalB = polyConfig1.normal;
  //console.log(normalB);
} else {
  normalB = polyConfig2.normal;
  //console.log(normalB);
}

if (polyConfig1.max - polyConfig2.min < polyConfig2.max - polyConfig1.min) {
  normalA = polyConfig1.normal;
  //console.log(normalA);
} else {
  normalA = polyConfig1.normal;
  //console.log(normalA);
}

var penetrationVector = polyConfig1.normal.scale(minOverlap);

polyA.lineColor = "0xfc030f";

collisionInfo.setInfo(minOverlap, polyConfig1.normal.scale(1), polyA.vertex[polyConfig1.minIndex].subtract(penetrationVector));
