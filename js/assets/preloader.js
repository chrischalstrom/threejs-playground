define([
  'jquery',
  './levels/levels',
  './meshes/meshes'
], function($, levels, meshes) {

  var preload = function(preloaderDeferred, assetsToLoad) {
    var deferreds = [];
    var assets = { meshes: {} };

    console.log(assetsToLoad);

    assetsToLoad.meshes.forEach(function(meshKey) {
      var loader = new THREE.JSONLoader();
      var deferred = $.Deferred();
      deferreds.push(deferred);

      loader.load(meshes.assetPath(meshKey), function(geometry, materials) {
        assets.meshes[meshKey] = { geometry: geometry, materials: materials };
        deferred.resolve();
      });
    });

    $.when.apply(this, deferreds).done(function() {
      preloaderDeferred.resolve(assets);
    });
  }

  var assetsForLevel = function(level) {
    var assets = {};

    assets.meshes = levels.global.meshes.concat(levels[level].meshes || []);

    return assets;
  }

  return {
    preloadAssets: function(level, callback) {
      var preloaderDeferred = $.Deferred();
      var assets = preload(preloaderDeferred, assetsForLevel(level));

      preloaderDeferred.then(function(assets) { callback(assets) });
    }
  };
});
