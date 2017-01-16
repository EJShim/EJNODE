(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function E_Manager()
{
  if ( WEBVR.isAvailable() === false ) {

    document.body.appendChild( WEBVR.getMessage() );

  }

  this.clock = new THREE.Clock();

  this.container = null;
  this.camera = null;
  this.scene = null;
  this.renderer = null;
  this.effect = null;
  this.controls = null;

  this.controller1 = null;
  this.controller2 = null;

  this.room = null;

  this.Init();
  this.Animate();


  function onWindowResize() {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.effect.setSize( window.innerWidth, window.innerHeight );

  }
}

E_Manager.prototype.Init = function()
{
  this.container = document.createElement( 'div' );
  document.body.appendChild( this.container );

  var info = document.createElement( 'div' );
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - htc vive';

  this.container.appendChild( info );


  //Initialize Scene
  this.scene = new THREE.Scene();

  //Initialize Camera
  this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10 );
  this.scene.add( this.camera );

  this.room = new THREE.Mesh(
    new THREE.BoxGeometry( 6, 6, 6, 8, 8, 8 ),
    new THREE.MeshBasicMaterial( { color: 0x404040, wireframe: true } )
  );
  this.room.position.y = 3;
  this.scene.add( room );

  this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 ).normalize();
  this.scene.add( light );

  var geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );

  for ( var i = 0; i < 200; i ++ ) {

    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

    object.position.x = Math.random() * 4 - 2;
    object.position.y = Math.random() * 4 - 2;
    object.position.z = Math.random() * 4 - 2;

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    object.scale.x = Math.random() + 0.5;
    object.scale.y = Math.random() + 0.5;
    object.scale.z = Math.random() + 0.5;

    object.userData.velocity = new THREE.Vector3();
    object.userData.velocity.x = Math.random() * 0.01 - 0.005;
    object.userData.velocity.y = Math.random() * 0.01 - 0.005;
    object.userData.velocity.z = Math.random() * 0.01 - 0.005;

    this.room.add( object );

  }

  // var material = new THREE.MeshStandardMaterial();
  //
  // var loader = new THREE.OBJLoader();
  // loader.setPath( 'models/obj/cerberus/' );
  // loader.load( 'Cerberus.obj', function ( group ) {
  //
  //   // var material = new THREE.MeshBasicMaterial( { wireframe: true } );
  //
  //   var loader = new THREE.TextureLoader();
  //   loader.setPath( 'models/obj/cerberus/' );
  //
  //   material.roughness = 1;
  //   material.metalness = 1;
  //
  //   material.map = loader.load( 'Cerberus_A.jpg' );
  //   material.roughnessMap = loader.load( 'Cerberus_R.jpg' );
  //   material.metalnessMap = loader.load( 'Cerberus_M.jpg' );
  //   material.normalMap = loader.load( 'Cerberus_N.jpg' );
  //
  //   material.map.wrapS = THREE.RepeatWrapping;
  //   material.roughnessMap.wrapS = THREE.RepeatWrapping;
  //   material.metalnessMap.wrapS = THREE.RepeatWrapping;
  //   material.normalMap.wrapS = THREE.RepeatWrapping;
  //
  //   group.traverse( function ( child ) {
  //
  //     if ( child instanceof THREE.Mesh ) {
  //
  //       child.material = material;
  //
  //     }
  //
  //   } );
  //
  //   group.position.y = - 2;
  //   group.rotation.y = - Math.PI / 2;
  //   room.add( group );
  //
  // } );
  //
  // var loader = new THREE.CubeTextureLoader();
  // loader.setPath( 'textures/cube/pisa/' );
  // material.envMap = loader.load( [
  //   "px.png", "nx.png",
  //   "py.png", "ny.png",
  //   "pz.png", "nz.png"
  // ] );
  //
  // //

  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
  this.renderer.setClearColor( 0x505050 );
  this.renderer.setPixelRatio( window.devicePixelRatio );
  this.renderer.setSize( window.innerWidth, window.innerHeight );
  this.renderer.sortObjects = false;
  this.container.appendChild( this.renderer.domElement );

  this.controls = new THREE.VRControls( this.camera );
  this.controls.standing = true;

  // controllers

  this.controller1 = new THREE.ViveController( 0 );
  this.controller1.standingMatrix = controls.getStandingMatrix();
  this.scene.add( this.controller1 );

  this.controller2 = new THREE.ViveController( 1 );
  this.controller2.standingMatrix = controls.getStandingMatrix();
  this.scene.add( this.controller2 );

  var loader = new THREE.OBJLoader();
  loader.setPath( 'models/obj/vive-controller/' );
  loader.load( 'vr_controller_vive_1_5.obj', function ( object ) {

    var loader = new THREE.TextureLoader();
    loader.setPath( 'models/obj/vive-controller/' );

    var controller = object.children[ 0 ];
    controller.material.map = loader.load( 'onepointfive_texture.png' );
    controller.material.specularMap = loader.load( 'onepointfive_spec.png' );

    controller1.add( object.clone() );
    controller2.add( object.clone() );

  } );

  this.effect = new THREE.VREffect( this.renderer );

  if ( WEBVR.isAvailable() === true ) {

    document.body.appendChild( WEBVR.getButton( this.effect ) );

  }

  window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
}

E_Manager.prototype.Animate = function()
{
  this.effect.requestAnimationFrame( this.Animate.bind(this) );
  this.render();
}

E_Manager.prototype.render = function()
{
      var delta = clock.getDelta() * 60;

      this.controller1.update();
      this.controller2.update();

      this.controls.update();

      for ( var i = 0; i < this.room.children.length; i ++ ) {

        var cube = this.room.children[ i ];

        if ( cube.geometry instanceof THREE.BoxGeometry === false ) continue;

        // cube.position.add( cube.userData.velocity );

        if ( cube.position.x < - 3 || cube.position.x > 3 ) {

          cube.position.x = THREE.Math.clamp( cube.position.x, - 3, 3 );
          cube.userData.velocity.x = - cube.userData.velocity.x;

        }

        if ( cube.position.y < - 3 || cube.position.y > 3 ) {

          cube.position.y = THREE.Math.clamp( cube.position.y, - 3, 3 );
          cube.userData.velocity.y = - cube.userData.velocity.y;

        }

        if ( cube.position.z < - 3 || cube.position.z > 3 ) {

          cube.position.z = THREE.Math.clamp( cube.position.z, - 3, 3 );
          cube.userData.velocity.z = - cube.userData.velocity.z;

        }

        cube.rotation.x += 0.01 * delta;

      }

      this.effect.render( scene, camera );
}

module.exports = E_Manager;

},{}],2:[function(require,module,exports){
var E_Manager = require("./E_Manager.js");


var Manager = new E_Manager();

},{"./E_Manager.js":1}]},{},[2]);
