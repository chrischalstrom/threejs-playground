// Container for my global vars,
// Depends on THREE.
Hack = {

  physics: {
    gravity: new THREE.Vector3(0, 0, -2),

    // Prototype is THREE.Mesh
    // @param canMove {bool} true if the object is mobile
    Mesh: function(geometry, material, canMove) {
      THREE.Mesh.call(this, geometry, material);

      this.canMove = canMove;

      this.velocity = new THREE.Vector3(0, 0, 0);
      this.acceleration = new THREE.Vector3(0, 0, 0);
    },

    simulate: function(delta, collideableMeshes) {
      for(var i = 0; i < collideableMeshes.length; i++){
        var thisMesh = collideableMeshes[i];

        if(thisMesh.canMove) {
          thisMesh.velocity.set(
            thisMesh.velocity.x + thisMesh.acceleration.x,
            thisMesh.velocity.y + thisMesh.acceleration.y,
            thisMesh.velocity.z + thisMesh.acceleration.z + Hack.physics.gravity.z
          );
        }

        var thisBbox = thisMesh.nextSimulationBbox(delta);
        var thisMeshIntersected = false;

        for(var j = i + 1; j < collideableMeshes.length; j++) {
          var thatMesh = collideableMeshes[j];
          var thatBbox = thatMesh.nextSimulationBbox(delta);

          if(thisBbox.isIntersectionBox(thatBbox) || Hack.geometry.boxesTouch(thisBbox, thatBbox)){
            thisMesh.velocity.z = 0;
            thisMesh.acceleration.z = 0;

            // TODO: Need a better way to get the bounding boxes.
            // THREE.Box3.setFromObject is expensive and it isn't working
            // right - it is adding a constant 1.8627 in the z plane to the mario
            // model.
            thisMesh.position.setZ(thisBbox.size().z/2.0 - 1.8627);
            thisMeshIntersected = true;
          }
        }

        if(!thisMeshIntersected && thisMesh.canMove) {
          thisMesh.translateX(delta * thisMesh.velocity.x);
          thisMesh.translateY(delta * thisMesh.velocity.y);
          thisMesh.translateZ(delta * thisMesh.velocity.z);
        }
      }
    }
  },

  geometry: {
    // @param thisBox, thatBox {THREE.Box3}
    // Ignoring y plane for now
    boxesTouch: function(thisBox, thatBox){
      var thisMin = thisBox.min;
      var thisMax = thisBox.max;
      var thatMin = thatBox.min;
      var thatMax = thatBox.max;

      // NOTE: Eventually should get which faces touched
      return (
        (Hack.util.floatEquals(thisMin.z, thatMax.z) && (thisMin.x < thatMax.x && thisMax.x > thatMin.x)) ||
        (Hack.util.floatEquals(thisMax.z, thatMin.z) && (thisMin.x < thatMax.x && thisMax.x > thatMin.x)) ||
        (Hack.util.floatEquals(thisMin.x, thatMax.x) && (thisMin.z < thatMax.z && thisMax.z > thatMin.z)) ||
        (Hack.util.floatEquals(thisMax.x, thatMin.x) && (thisMin.z < thatMax.z && thisMax.z > thatMin.z))
      );
    }
  },

  util: {
    floatEquals: function(float1, float2) {
      return Math.abs(float1 - float2) < 0.001;
    }
  }

};

Hack.physics.Mesh.prototype = new THREE.Mesh;
Hack.physics.Mesh.prototype.constructor = Hack.physics.Mesh;

// Taking the velocity into account, find the bounding box
// for this mesh at the next simulation iteration
Hack.physics.Mesh.prototype.nextSimulationBbox = function(delta) {
  var currentBbox = new THREE.Box3().setFromObject(this);
  var deltaVelocityVec3 = new THREE.Vector3().copy(this.velocity).multiplyScalar(delta);

  return currentBbox.set(
    currentBbox.min.add(deltaVelocityVec3),
    currentBbox.max.add(deltaVelocityVec3)
  );
}
