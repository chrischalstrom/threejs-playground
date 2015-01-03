var Hack = {}; // TODO, remove this...Obj to hold stuff for debugging

require([
  'jquery',
  'hack/physics',
  'hack/preloader'
], function($, hackPhysics, hackPreloader) {

  $(document).ready(function() { 

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
      var world = { physicsMeshes: {} };

      sceneLights().forEach(function(light) { scene.add(light); console.log(light); });

      var floorGeometry = new THREE.PlaneGeometry(1000, 1000);
      var floorMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
      var floor = new hackPhysics.Mesh(floorGeometry, floorMaterial, false);
      floor.receiveShadow = true;
      scene.add(floor);

      // TODO, better way to add floor?
      world.physicsMeshes.floor = {};
      world.physicsMeshes.floor[floor.uuid] = floor;

      var skyboxGeometry = new THREE.BoxGeometry(5000, 5000, 5000);
      var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaff, side: THREE.DoubleSide });
      var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
      scene.add(skybox);

      $.each(assets, function(assetName, asset) {
        var mesh = addMeshToScene(scene, asset.geometry, asset.materials);

        assetName.match(/assets\/(.*)\.json/);
        var strippedAssetName = RegExp.$1;

        // Keep the ref to mario mesh to use elsewhere
        if(strippedAssetName == 'mario') Hack.mario = mesh;

        world.physicsMeshes[strippedAssetName] = world.physicsMeshes[strippedAssetName] || {};
        world.physicsMeshes[strippedAssetName][mesh.uuid] = mesh;
      });

      return world;
    }

    function sceneLights() {
      lights = [];

      var spotlight = new THREE.SpotLight(0xffcccc, 5);
      spotlight.position.set(200, -400, 400);
      spotlight.castShadow = true;
      spotlight.shadowDarkness = 0.95;
      var spotlightTarget = new THREE.Object3D();
      spotlightTarget.position.set(200, 100, 200);
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

    function addMeshToScene(scene, geometry, materials) {
      var material = new THREE.MeshFaceMaterial(materials);

      var mesh = new hackPhysics.Mesh(geometry, material, true);
      mesh.scale.set(5, 5, 5);
      mesh.castShadow = true;
      mesh.position.set(0, 0, 100);

      scene.add(mesh);

      return mesh;
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

      var mario = Hack.mario;

      if(keyboard.pressed('right')) {
        mirrorModelAroundX(mario, true);
        mario.translateX(moveDistance);
      }
      else if(keyboard.pressed('left')) {
        mirrorModelAroundX(mario, false);
        mario.translateX(-moveDistance);
      }
      if(keyboard.pressed('space')) {
        mario.velocity.set(
          mario.velocity.x,
          mario.velocity.y,
          100
        );
      }

      Hack.camera.position.set(
        mario.position.x - (mario.scale.x < 0 ? 60 : 0), -300, mario.position.z + 200
      );
      Hack.camera.lookAt(new THREE.Vector3(
        mario.position.x - (mario.scale.x < 0 ? 60 : 0), 300, mario.position.z - 200
      ));

      // Simulate physics on all physics meshes.
      hackPhysics.simulate(
        delta,
        $.map(worldObjs.physicsMeshes, function(meshStorageObj, meshStorageKey){
          return $.map(meshStorageObj, function(mesh, uuid){ return mesh; });
        })
      );
      stats.update();
    }

  });

});
