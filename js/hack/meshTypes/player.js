define([
  '../physics'
], function(hackPhysics) {

  var player = {
    Mesh: function(geometry, material) {
      hackPhysics.Mesh.call(this, geometry, material, true);

      this.hitsWithFaces = { zmin: 1, zmax: 1 };
      this.hitByFaces = { xmin: 1, xmax: 1, zmax: 1 };
    }
  };

  player.Mesh.prototype = new hackPhysics.Mesh;
  player.Mesh.prototype.constructor = player.Mesh;

  player.Mesh.prototype.onHit = function() {
    console.log('player mesh was hit.');
  };

  return player;
});
