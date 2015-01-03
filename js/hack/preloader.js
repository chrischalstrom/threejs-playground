define([
  'jquery',
  './modelAssets'
], function($, modelAssets) {

  var _preloadAssets = function(preloaderDeferred, modelAssets) {
    var deferreds = [];
    var assets = {};

    modelAssets.forEach(function(modelAsset) {
      var loader = new THREE.JSONLoader();
      var deferred = $.Deferred();
      deferreds.push(deferred);

      loader.load(modelAsset, function(geometry, materials) {
        assets[modelAsset] = { geometry: geometry, materials: materials };
        deferred.resolve();
      });
    });

    $.when.apply(this, deferreds).done(function() {
      preloaderDeferred.resolve(assets);
    });
  }

  return {
    preloadAssets: function(callback) {
      var assetsToLoad = modelAssets.assetsToLoad;
      var preloaderDeferred = $.Deferred();
      var assets = _preloadAssets(preloaderDeferred, assetsToLoad);

      preloaderDeferred.then(function(assets) { callback(assets) });
    }
  };
});
