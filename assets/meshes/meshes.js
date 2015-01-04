define([], function() {
  var meshAsset = function(name) {
    var basePath = 'assets/';
    return basePath + 'meshes/' + name + '.json'
  };

  return {
    assetsToLoad: [
      meshAsset('mario'),
      meshAsset('goomba')
    ]
  };
});
