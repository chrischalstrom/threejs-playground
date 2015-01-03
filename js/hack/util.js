define([
], function() {
  return {
    floatEquals: function(float1, float2) {
      return Math.abs(float1 - float2) < 0.001;
    }
  };
});
