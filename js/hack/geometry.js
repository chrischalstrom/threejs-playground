define([
  './util'
], function(hackUtil) {
  return {
    // @param thisBox, thatBox {THREE.Box3}
    // Ignoring y plane for now
    boxesTouch: function(thisBox, thatBox){
      var thisMin = thisBox.min;
      var thisMax = thisBox.max;
      var thatMin = thatBox.min;
      var thatMax = thatBox.max;

      // NOTE: Eventually should get which faces touched
      //return (
      var truthy = (
        (hackUtil.almostEquals(thisMin.z, thatMax.z) && (thisMin.x < thatMax.x && thisMax.x > thatMin.x)) ||
        (hackUtil.almostEquals(thisMax.z, thatMin.z) && (thisMin.x < thatMax.x && thisMax.x > thatMin.x)) ||
        (hackUtil.almostEquals(thisMin.x, thatMax.x) && (thisMin.z < thatMax.z && thisMax.z > thatMin.z)) ||
        (hackUtil.almostEquals(thisMax.x, thatMin.x) && (thisMin.z < thatMax.z && thisMax.z > thatMin.z))
      );

      return truthy;
    }
  };
});
