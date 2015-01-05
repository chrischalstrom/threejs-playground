define([
  './player',
  './enemy',
  '../physics'
], function(player, enemy, hackPhysics) {
  return {
    // Create the right type of mesh based on the name of the texture
    createFromName: function(name, geometry, material) {
      switch(name) {
        case 'mario':
          return new player.Mesh(geometry, material);
        case 'goomba':
          return new enemy.Mesh(geometry, material);
        default:
          return new hackPhysics.Mesh(geometry, material, false);
      }
    }
  };
});
