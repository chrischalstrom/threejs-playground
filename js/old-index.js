$(document).ready(function() { 

  var REFRESH_RATE = 15;
  var lastRenderTime;

  var gl;

  // Preload all shaders and store them in this obj
  var shaders = { fragment: {}, vertex: {} };
  var canvas = document.getElementById('glcanvas');

  // TODO: FAIL block of global vars
  var squareRotation = 0.0;
  var squareOffsets = { x: 0.0, y: 0.0, z: 2.0 };
  var squareVelocity = { x: 0.02, y: 0.03, z: 0.00 };

  var preloaderDeferred = $.Deferred();
  preloadAssets(preloaderDeferred, shaders);
  preloaderDeferred.then(run);

  function run(){
    console.log('run called');
    gl = initWebGL(canvas);

    if (gl) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
      gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
      gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
    }

    initShaders();
    initBuffers();
    setInterval(drawScene, REFRESH_RATE);
  }

  function preloadAssets(deferred, shaders){
    $.when(
      $.get('shaders/fragmentShader.glsl'),
      $.get('shaders/vertexShader.glsl')
    ).done(function(fragmentShader, vertexShader){
      shaders['fragment']['test'] = fragmentShader[0];
      shaders['vertex']['test'] = vertexShader[0];
      console.log(shaders);
      deferred.resolve();
    });
  }

  function initWebGL(canvas) {
    var gl = null;
    
    try {
      return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch(e) {
      alert('WebGL could not be initialized: ' + e);
      return null;
    }
  }

  function initShaders() {
    var fragmentShader = getShader(shaders['fragment']['test'], 'fragment');
    var vertexShader = getShader(shaders['vertex']['test'], 'vertex');

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(vertexColorAttribute);
  } 

  function getShader(shaderText, shaderType) {
    var shader;

    if (shaderType == "fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderType == "vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      alert('unknown shader type');
      return null;  // Unknown shader type
    }
    
    gl.shaderSource(shader, shaderText);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
      return null;
    }
    
    return shader;
  }

  function initBuffers() {
    squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    
    var vertices = [
      2.0, 0.0,  0.0,
      0.0, 0.0,  0.0,
      2.0, -2.0, 0.0,
      0.0, -2.0, 0.0
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var colors = [
      0.0,  0.0,  1.0,  1.0,
      0.0,  0.2,  0.8,  1.0,
      0.0,  0.4,  0.6,  1.0,
      0.0,  0.6,  0.4,  1.0
    ];
    
    squareVerticesColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  }

  function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);
    
    loadIdentity();
    mvTranslate([-0.0, 0.0, -6.0]);

    // ROTATION THING
    mvPushMatrix();
    mvRotate(squareRotation, [1, 0, 1]);
    mvTranslate([squareOffsets.x, squareOffsets.y, squareOffsets.z]);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    mvPopMatrix();

    // TODO add func to handle this
    // function render...
    var currentTime = (new Date).getTime();
    if(lastRenderTime){
      var delta = currentTime - lastRenderTime;

      //squareRotation += (30.0 * delta) / 1000.0;
      squareOffsets.x += squareVelocity.x * ((30 * delta) / 1000.0);
      squareOffsets.y += squareVelocity.y * ((30 * delta) / 1000.0);
      squareOffsets.z += squareVelocity.z * ((30 * delta) / 1000.0);

      console.log(squareOffsets);

      // bounce it
      if(Math.abs(squareOffsets.x) > Hack.fieldBoundary(squareOffsets.z, 45, 640/480, true)){
        squareVelocity.x = -squareVelocity.x;
      }
      if(Math.abs(squareOffsets.y) > Hack.fieldBoundary(squareOffsets.z, 45, 640/480, false)){
        squareVelocity.y = -squareVelocity.y;
      }
    }

    lastRenderTime = currentTime;
  }

  function loadIdentity() {
    mvMatrix = Matrix.I(4);
  }

  function multMatrix(m) {
    mvMatrix = mvMatrix.x(m);
  }

  function mvTranslate(v) {
    multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
  }

  function setMatrixUniforms() {
    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
  }

  var mvMatrixStack = [];

  function mvPushMatrix(m) {
    if (m) {
      mvMatrixStack.push(m.dup());
      mvMatrix = m.dup();
    } else {
      mvMatrixStack.push(mvMatrix.dup());
    }
  }

  function mvPopMatrix() {
    if (!mvMatrixStack.length) {
      throw("Can't pop from an empty matrix stack.");
    }

    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
  }

  function mvRotate(angle, v) {
    var inRadians = angle * Math.PI / 180.0;

    var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
  }

})
