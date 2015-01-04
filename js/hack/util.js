define([
], function() {
  return {
    // The bounding boxes used to calculate geometries can be
    // slightly imperfect, so we need a fuzzy equals method
    // for some calculations.
    almostEquals: function(float1, float2) {
      return Math.abs(float1 - float2) < 0.02;
    }
  };
});
