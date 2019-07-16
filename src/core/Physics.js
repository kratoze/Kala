//  https://github.com/Apress/building-a-2d-physics-game-engine/blob/master/978-1-4842-2582-0_source%20code/Chapter3/Chapter3.1BroadPhaseMethod/public_html/EngineCore/Core.js

function Physics() {
  var positionalCorrectionFlag = true;
  // number of relaxtion iterations
  var relaxationCount = 15;
  // percentafe of separation to project objects
  var posCorrectionRate = 0.8;
  var drawCollisionInfo = function(collisionInfo, context) {
    context.beginPath();
    context.moveTo(collisionInfo.start.x, collisionInfo.start.y);
    context.lineTo(collisionInfo.end.x, collisionInfo.end.y);
    context.closePath();
    context.strokeStyle = "orange";
    context.stroke();
  };

  var collision = function(engine) {
    var i, j, k;
    var collisionInfo = new CollisionInfo();
    var collisionResponse = {};
    for (k = 0; k < relaxationCount; k++) {
      for (i = 0; i < engine.allBodies.length; i++) {
        for (j = i + 1; j < engine.allBodies.length; j++) {
          if (engine.allBodies[i].boundTest(engine.allBodies[j])) {
            if (
              engine.allBodies[i].collisionTest(
                engine.allBodies[j],
                collisionInfo
              )
            ) {
              if (
                collisionInfo
                  .getNormal()
                  .dot(
                    engine.allBodies[j].center.subtract(
                      engine.allBodies[i].center
                    )
                  ) < 0
              ) {
                collisionInfo.changeDir();
              }
              //draw the normal
              //drawCollisionInfo(collisionInfo, gEngine.Core.mContext);
              if (
                engine.allBodies[i].isSensor === true ||
                engine.allBodies[j].isSensor === true
              ) {
                collisionResponse = {
                  bodyA: engine.allBodies[i],
                  bodyB: engine.allBodies[j],
                  bodyAIndex: i,
                  bodyBIndex: j,
                  collisionInfo: collisionInfo,
                  hasCollided: true
                };
                return collisionResponse;
              } else {
                resolveCollision(
                  engine.allBodies[i],
                  engine.allBodies[j],
                  collisionInfo
                );
              }
            }
          }
        }
      }
    }
  };

  var maintainConstraints = function(engine) {
    var i;
    var collisionInfo = new CollisionInfo();
    for (i = 0; i < engine.allConstraints.length; i++) {
      if (engine.allConstraints[i].maintainConstraint(collisionInfo)) {
        resolveCollision(
          engine.allConstraints[i].bodyA,
          engine.allConstraints[i].bodyB,
          collisionInfo
        );
      }
    }
  };

  var positionalCorrection = function(s1, s2, collisionInfo) {
    var s1InvMass = s1.invMass;
    var s2InvMass = s2.invMass;

    var num =
      (collisionInfo.getDepth() / (s1InvMass + s2InvMass)) * posCorrectionRate;
    var correctAmount = collisionInfo.getNormal().scale(num);

    s1.move(correctAmount.scale(-s1InvMass));
    s2.move(correctAmount.scale(s2InvMass));
  };

  var resolveCollision = function(s1, s2, collisionInfo) {
    if (s1.invMass === 0 && s2.invMass === 0) {
      return;
    }
    if (positionalCorrectionFlag) {
      positionalCorrection(s1, s2, collisionInfo);
    }

    var n = collisionInfo.getNormal();
    // the direction of the collisionInfo is always from s1 to s2
    // but the Mass is inversed, so start scale with s2 and end
    // scale with s1
    var start = collisionInfo.start.scale(
      s2.invMass / (s1.invMass + s2.invMass)
    );
    var end = collisionInfo.end.scale(s1.invMass / (s1.invMass + s2.invMass));
    var p = start.add(end);
    // r is vector from center of shape to collision point
    var r1 = p.subtract(s1.center);
    var r2 = p.subtract(s2.center);

    var v1 = s1.velocity.add(
      Vec2(-1 * s1.angularVelocity * r1.y, s1.angularVelocity * r1.x)
    );
    var v2 = s2.velocity.add(
      Vec2(-1 * s2.angularVelocity * r2.y, s2.angularVelocity * r2.x)
    );
    var relativeVelocity = v2.subtract(v1);

    // Relative velocity in normal direction
    var rVelocityInNormal = relativeVelocity.dot(n);

    // if objects are moving apart ignore
    if (rVelocityInNormal > 0) {
      return;
    }

    // compute and apply response impulse for each object
    var newRestitution = Math.min(s1.restitution, s2.restitution);
    var newFriction = Math.min(s1.friction, s2.friction);
    // R cross N
    var R1crossN = r1.cross(n);
    var R2crossN = r2.cross(n);

    // Calc impulse scalar
    var jN = -(1 + newRestitution) * rVelocityInNormal;
    jN =
      jN /
      (s1.invMass +
        s2.invMass +
        R1crossN * R1crossN * s1.inertia +
        R2crossN * R2crossN * s2.inertia);
    // impulse is in direction of normal (from s1 to s2)
    var impulse = n.scale(jN);
    // impulse = F dt = m*∆v
    // ∆v = impulse / m
    s1.velocity = s1.velocity.subtract(impulse.scale(s1.invMass));
    s2.velocity = s2.velocity.add(impulse.scale(s2.invMass));

    s1.angularVelocity -= R1crossN * jN * s1.inertia;
    s2.angularVelocity += R2crossN * jN * s2.inertia;

    var tangent = relativeVelocity.subtract(n.scale(relativeVelocity.dot(n)));
    // relativeVelocity.dot(tangent) should be less than 0
    tangent = tangent.normalize().scale(-1);

    var R1crossT = r1.cross(tangent);
    var R2crossT = r2.cross(tangent);

    var jT =
      -(1 + newRestitution) * relativeVelocity.dot(tangent) * newFriction;
    jT =
      jT /
      (s1.invMass +
        s2.invMass +
        R1crossT * R1crossT * s1.inertia +
        R2crossT * R2crossT * s2.inertia);

    // friction should be less than force in normal direction
    if (jT > jN) {
      jT = jN;
    }
    // impulse is from s1 to s2 (opposite direction of velocity)
    impulse = tangent.scale(jT);

    s1.velocity = s1.velocity.subtract(impulse.scale(s1.invMass));
    s2.velocity = s2.velocity.add(impulse.scale(s2.invMass));
    s1.angularVelocity -= R1crossT * jT * s1.inertia;
    s2.angularVelocity += R2crossT * jT * s2.inertia;
  };

  var mPublic = {
    collision: collision,
    maintainConstraints: maintainConstraints,
    positionalCorrectionFlag: positionalCorrectionFlag
  };
  return mPublic;
}
