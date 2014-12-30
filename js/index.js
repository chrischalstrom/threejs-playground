$(document).ready(function() { 

  var viewAngle = 45;
  var screenWidth = window.innerWidth;
  var screenHeight = window.innerHeight;
  var near = 0.1, far = 10000;

  var clock = new THREE.Clock();
  var stats = addStatsToDom();

  var keyboard = new THREEx.KeyboardState();

  var sceneObjs = setupScene(viewAngle, screenWidth, screenHeight, near, far);
  var worldObjs = createWorld(sceneObjs.scene);

  animate(sceneObjs, worldObjs, keyboard, clock, stats);

  function setupScene(viewAngle, width, height, near, far) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      viewAngle,
      width / height,
      near,
      far
    );

    scene.add(camera);
    camera.position.set(0, -300, 200);
    camera.lookAt(new THREE.Vector3(0, 1000, -200));
    Hack.camera = camera; // TODO remove debug assignment

    var renderer = Detector.webgl ?
      new THREE.WebGLRenderer({ antialias: true }) :
      new THREE.CanvasRenderer();
    renderer.setSize(width, height);
    renderer.shadowMapEnabled = true;

    $('#gamewindow').append(renderer.domElement);

    initEvents(renderer, camera);
    var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    return {
      scene: scene,
      camera: camera,
      renderer: renderer,
      orbitControls: orbitControls
    };
  }

  function initEvents(renderer, camera) {
    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });
  }

  // fps metrics
  function addStatsToDom() {
    var stats = new Stats();
    $(stats.domElement).css({
      position: 'absolute',
      bottom: '0px',
      'z-index': 100
    });

    $('#gamewindow').append(stats.domElement);
    return stats;
  }

  function createWorld(scene) {
    sceneLights().forEach(function(light) { scene.add(light); console.log(light); });

    var floorGeometry = new THREE.PlaneGeometry(1000, 1000);
    var floorMaterial = new THREE.MeshLambertMaterial({ color: 0xcccc00, side: THREE.DoubleSide });
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);

    var skyboxGeometry = new THREE.BoxGeometry(5000, 5000, 5000);
    var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaff, side: THREE.DoubleSide });
    var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skybox);

    var cubeGeometry = new THREE.BoxGeometry(50, 50, 50);
    var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.position.set(0, 50, 100);
    scene.add(cube);

    return {
      cube: cube
    };
  }

  function sceneLights() {
    lights = [];

    var spotlight = new THREE.SpotLight(0xff0000, 15, 2000);
    spotlight.position.set(150, 750, 750);
    spotlight.castShadow = true;
    var spotlightTarget = new THREE.Object3D();
    spotlightTarget.position.set(5, 5, 5);
    spotlight.target = spotlightTarget;
    lights.push(spotlight);

    var pointlight = new THREE.PointLight(0xffffff, 5, 0);
    pointlight.position.set(0, 250, 0);
    lights.push(pointlight);

    return lights;
  }

  function animate(sceneObjs, worldObjs, keyboard, clock, stats) {
    requestAnimationFrame(function() { animate(sceneObjs, worldObjs, keyboard, clock, stats) });
    render(sceneObjs);
    update(worldObjs, keyboard, clock, stats);
  }

  function render(sceneObjs) {
    sceneObjs.renderer.render(sceneObjs.scene, sceneObjs.camera);
  }

  // TODO needs arg to sceneObjs to move camera
  function update(worldObjs, keyboard, clock, stats) {
    var delta = clock.getDelta(); // seconds since last update
    var moveDistance = delta * 100;

    if(keyboard.pressed('right')) {
      worldObjs.cube.translateX(moveDistance);
    }
    else if(keyboard.pressed('left')) {
      worldObjs.cube.translateX(-moveDistance);
    }

    stats.update();
  }

})
