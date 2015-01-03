define([
  './geometry'
], function(hackGeometry) {
  var hackPhysics = {
    gravity: new THREE.Vector3(0, 0, -30),

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
            thisMesh.velocity.x + delta * thisMesh.acceleration.x,
            thisMesh.velocity.y + delta * thisMesh.acceleration.y,
            thisMesh.velocity.z + delta * (thisMesh.acceleration.z + hackPhysics.gravity.z)
          );
        }

        var thisBbox = thisMesh.nextSimulationBbox(delta);
        var thisMeshIntersected = false;

        for(var j = i + 1; j < collideableMeshes.length; j++) {
          var thatMesh = collideableMeshes[j];
          var thatBbox = thatMesh.nextSimulationBbox(delta);

          if(thisBbox.isIntersectionBox(thatBbox) || hackGeometry.boxesTouch(thisBbox, thatBbox)){
            thisMesh.velocity.z = 0;
            thisMesh.acceleration.z = 0;
            thisMesh.position.setZ(0);
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

  };

  hackPhysics.Mesh.prototype = new THREE.Mesh;
  hackPhysics.Mesh.prototype.constructor = hackPhysics.Mesh;

  // Taking the velocity into account, find the bounding box
  // for this mesh at the next simulation iteration
  hackPhysics.Mesh.prototype.nextSimulationBbox = function(delta) {
    var currentBbox = new THREE.Box3().setFromObject(this);
    var deltaVelocityVec3 = new THREE.Vector3().copy(this.velocity).multiplyScalar(delta);

    return currentBbox.set(
      currentBbox.min.add(deltaVelocityVec3),
      currentBbox.max.add(deltaVelocityVec3)
    );
  }

  return hackPhysics;
});
