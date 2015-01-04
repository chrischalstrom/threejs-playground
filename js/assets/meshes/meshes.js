define([], function() {
  return {
    assetPath: function(name) {
      var basePath = 'js/assets/';
      return basePath + 'meshes/' + name + '.json';
    }
  };
});
