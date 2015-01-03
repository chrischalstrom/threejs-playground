require([
  'jquery',
  'hack/physics',
  'hack/preloader'
], function($, hackPhysics, hackPreloader) {

  $(document).ready(function() { 

    var Hack = {}; // TODO, fix this.  Obj to hold stuff for debugging

    var viewAngle = 45;
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    var near = 0.1, far = 10000;

    var clock = new THREE.Clock();
    var stats = addStatsToDom();

    var keyboard = new THREEx.KeyboardState();

    hackPreloader.preloadAssets(function(assets) {
      var sceneObjs = setupScene(viewAngle, screenWidth, screenHeight, near, far);
      var worldObjs = createWorld(sceneObjs.scene, assets);

      animate(sceneObjs, worldObjs, keyboard, clock, stats);
    });

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

      return {
        scene: scene,
        camera: camera,
        renderer: renderer,
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

    function createWorld(scene, assets) {
      var models = {};

      sceneLights().forEach(function(light) { scene.add(light); console.log(light); });

      var floorGeometry = new THREE.PlaneGeometry(1000, 1000);
      var floorMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
      var floor = new hackPhysics.Mesh(floorGeometry, floorMaterial, false);
      Hack.floor = floor; // TODO, remove this
      floor.receiveShadow = true;
      scene.add(floor);

      var skyboxGeometry = new THREE.BoxGeometry(5000, 5000, 5000);
      var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaff, side: THREE.DoubleSide });
      var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
      scene.add(skybox);

      $.each(assets, function(assetName, asset) {
        var model = addModelToScene(scene, asset.geometry, asset.materials);

        assetName.match(/assets\/(.*)\.json/);
        var strippedAssetName = RegExp.$1;

        models[strippedAssetName] = model;
      });

      Hack.mario = models.mario;  // TODO, remove this

      return models;
    }

    function sceneLights() {
      lights = [];

      var spotlight = new THREE.SpotLight(0xffcccc, 5);
      spotlight.position.set(200, -400, 400);
      spotlight.castShadow = true;
      spotlight.shadowDarkness = 0.95;
      var spotlightTarget = new THREE.Object3D();
      spotlightTarget.position.set(200, 100, -100);
      spotlight.target = spotlightTarget;
      lights.push(spotlight);

      var directionalLight = new THREE.DirectionalLight(0xcccccc, 0.5);
      directionalLight.position.set(0, -200, 400);
      directionalLight.castShadow = true;
      lights.push(directionalLight);

      var ambientLight = new THREE.AmbientLight(0x404040);
      lights.push(ambientLight);

      return lights;
    }

    function addModelToScene(scene, geometry, materials) {
      var material = new THREE.MeshFaceMaterial(materials);

      var model = new hackPhysics.Mesh(geometry, material, true);
      model.scale.set(5, 5, 5);
      model.castShadow = true;
      model.position.set(0, 0, 100);

      scene.add(model);

      return model;
    }

    function mirrorModelAroundX(model, scaleShouldBePositive) {
      var scaleX = model.scale.x;

      if((scaleX < 0 && scaleShouldBePositive) || (scaleX > 0 && !scaleShouldBePositive)){
        // Get bounding box since mirroring model will flip
        // it around its left or right edge, causing it to move.
        // With the bbox, we can flip without moving the model.
        var bbox = new THREE.Box3().setFromObject(model);
        model.translateX((scaleX > 0 ? 1 : -1) * bbox.size().x);

        model.scale.setX(-model.scale.x);
      }
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
        mirrorModelAroundX(worldObjs.mario, true);
        worldObjs.mario.translateX(moveDistance);
      }
      else if(keyboard.pressed('left')) {
        mirrorModelAroundX(worldObjs.mario, false);
        worldObjs.mario.translateX(-moveDistance);
      }
      if(keyboard.pressed('space')) {
        worldObjs.mario.velocity.set(
          worldObjs.mario.velocity.x,
          worldObjs.mario.velocity.y,
          100
        );
      }

      Hack.camera.position.set(
        Hack.mario.position.x - (Hack.mario.scale.x < 0 ? 60 : 0), -300, Hack.mario.position.z + 200
      );
      Hack.camera.lookAt(new THREE.Vector3(
        Hack.mario.position.x - (Hack.mario.scale.x < 0 ? 60 : 0), 300, Hack.mario.position.z - 200
      ));

      hackPhysics.simulate(delta, [Hack.mario, Hack.floor]);
      stats.update();
    }

  });

});