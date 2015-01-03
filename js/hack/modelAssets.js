define([], function() {
  var asset = function(name) {
    var basePath = 'assets';
    return basePath + '/' + name + '.json'
  };

  return {
    assetsToLoad: [
      asset('mario'),
      asset('goomba')
    ]
  };
});
