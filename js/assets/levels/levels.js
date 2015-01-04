define([], function() {
  return {
    global: {
      meshes: [
        'mario',
        'goomba'
      ]
    },
    1: {
      meshInstances: {
        mario: [{ position: new THREE.Vector3(-100, 0, 100) }],
        goomba: [
          { position: new THREE.Vector3(150, 0, 100) },
          { position: new THREE.Vector3(300, 0, 100) }
        ]
      }
    }
  };
});
