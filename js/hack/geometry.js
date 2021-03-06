define([
  'jquery',
  './util'
], function($, hackUtil) {
  return {
    // @param thisBox, thatBox {THREE.Box3}
    // Ignoring y plane for now
    boxesTouch: function(thisBox, thatBox){
      var thisMin = thisBox.min;
      var thisMax = thisBox.max;
      var thatMin = thatBox.min;
      var thatMax = thatBox.max;

      // NOTE: Eventually should get which faces touched
      //return (
      var truthy = (
        (hackUtil.almostEquals(thisMin.z, thatMax.z) && (thisMin.x < thatMax.x && thisMax.x > thatMin.x)) ||
        (hackUtil.almostEquals(thisMax.z, thatMin.z) && (thisMin.x < thatMax.x && thisMax.x > thatMin.x)) ||
        (hackUtil.almostEquals(thisMin.x, thatMax.x) && (thisMin.z < thatMax.z && thisMax.z > thatMin.z)) ||
        (hackUtil.almostEquals(thisMax.x, thatMin.x) && (thisMin.z < thatMax.z && thisMax.z > thatMin.z))
      );

      return truthy;
    },

    // params (this|that)Mesh {hack/physics.Mesh}
    // Find which faces of thisMesh and thatMesh collided.
    // Ignores y plane
    collisionFaces: function(thisMesh, thatMesh) {
      // Can infer which faces collided by seeing which plane has
      // the greatest relative velocities between each mesh.
      var planeVelocityDiffs = {
        xmin: thatMesh.velocity.x - thisMesh.velocity.x,
        xmax: thisMesh.velocity.x - thatMesh.velocity.x,
        zmin: thatMesh.velocity.z - thisMesh.velocity.z,
        zmax: thisMesh.velocity.z - thatMesh.velocity.z
      };

      var result = { diff: 0 };
      $.each(planeVelocityDiffs, function(k, v) {
        if(v >= Math.abs(result.diff)){
          result.diff = Math.abs(v);
          result.thisFace = k;
          result.thatFace = k == 'xmin' ? 'xmax' :
            k == 'xmax' ? 'xmin' :
            k == 'zmin' ? 'zmax' :
            'zmin';
        }
      });

      console.log(result);

      return { thisMesh: result.thisFace, thatMesh: result.thatFace };
    }
  };
});
