define([
  '../physics'
], function(hackPhysics) {

  var enemy = {
    Mesh: function(geometry, material) {
      hackPhysics.Mesh.call(this, geometry, material, true);

      this.hitsWithFaces = { xmin: 1, xmax: 1, zmin: 1};
      this.hitByFaces = { zmax: 1 };
    }
  };

  enemy.Mesh.prototype = new hackPhysics.Mesh;
  enemy.Mesh.prototype.constructor = enemy.Mesh;

  enemy.Mesh.prototype.onHit = function() {
    console.log('enemy mesh was hit.');
  };

  return enemy;
});
