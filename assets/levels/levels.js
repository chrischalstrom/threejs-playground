define([], function() {
  return {
    1: {
      meshes: [
        {
          asset: 'mario',
          instances: [{ position: new THREE.Vector3(0, 0, 100) }],
          type: 'player'
        },
        {
          asset: 'goomba',
          instances: [{ position: new THREE.Vector3(0, 150, 100) }],
          type: 'enemy'
        }
      ]
    }
  };
});
