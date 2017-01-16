var ViveController = require('three-vive-controller')(THREE)

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
  this.floor = 0;


  this.skull = null;

  this.controller1 = null;
  this.controller2 = null;

  this.room = null;
  this.pickMesh = null;

  this.Init();
  this.Animate();
}

E_Manager.prototype.Init = function()
{
  this.container = document.createElement( 'div' );
  document.body.appendChild( this.container );

  //Initialize Scene
  this.scene = new THREE.Scene();

  //Initialize Camera
  this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10 );
  this.scene.add( this.camera );

  var scaleFactor = 3;
  this.floor = -scaleFactor/2

  this.room = new THREE.Mesh(
    new THREE.BoxGeometry( scaleFactor, scaleFactor, scaleFactor, 8, 8, 8 ),
    new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true } )
  );
  this.room.position.y = scaleFactor/2 + 0.7;
  this.scene.add( this.room );

  this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

  this.light = new THREE.DirectionalLight( 0xffffff );
  this.scene.add( this.light );

  var geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );

  for(var i=0 ; i<20 ; i++){
    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

    object.position.set(Math.random() * scaleFactor + this.floor, this.floor, Math.random() * scaleFactor + this.floor);

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    object.scale.x = Math.random() + 0.5;
    object.scale.y = Math.random() + 0.5;
    object.scale.z = Math.random() + 0.5;

    this.room.add( object );
  }



  var that = this;


  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
  this.renderer.setClearColor( 0x000000 );
  this.renderer.setPixelRatio( window.devicePixelRatio );
  this.renderer.setSize( window.innerWidth, window.innerHeight );
  this.renderer.sortObjects = false;
  this.container.appendChild( this.renderer.domElement );

  this.controls = new THREE.VRControls( this.camera );
  this.controls.standing = true;

  // controllers

  this.controller1 = new THREE.ViveController( 0 , this.controls);
  //this.controller1.standingMatrix = this.controls.getStandingMatrix();
  this.scene.add( this.controller1 );
  this.controller1.on(this.controller1.TriggerClicked, () => {
    that.OnTriggerClicked(that.controller1);
  })

  this.controller2 = new THREE.ViveController( 1 , this.controls);
  this.controller2.on(this.controller2.TriggerClicked, () => {
    that.OnTriggerClicked(that.controller2);
  })
  this.scene.add( this.controller2 );


  var loader = new THREE.OBJLoader();
  //loader.setPath( 'models/' );

  var that = this;
  loader.load( 'models/vr_controller_vive_1_5.obj', function ( object ) {

    var loader = new THREE.TextureLoader();

    var controller = object.children[ 0 ];

    controller.material.map = loader.load( 'models/onepointfive_texture.png' );
    controller.material.specularMap = loader.load( 'models/onepointfive_spec.png' );

    that.controller1.add( object.clone() );
    that.controller2.add( object.clone() );

  } );


  var loader = new THREE.OBJLoader();
  //loader.setPath( 'models/' );

  loader.load( 'models/craniopagus_bone.obj', function ( object ) {

    var mesh = object.children[0];


    var geometry = mesh.geometry;
    geometry.computeBoundingBox();
    var centerX = 0.5 * ( geometry.boundingBox.max.x + geometry.boundingBox.min.x );
    var centerY = 0.5 * ( geometry.boundingBox.max.y + geometry.boundingBox.min.y );
    var centerZ = 0.5 * ( geometry.boundingBox.max.z + geometry.boundingBox.min.z );
    console.log(centerX, centerY, centerZ);
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation( -centerX, -centerY, -centerZ) );

    mesh.scale.x = 0.05;
    mesh.scale.y = 0.05;
    mesh.scale.z = 0.05;
    mesh.material = new THREE.MeshPhongMaterial({color:0xaaaaaa, side:THREE.DoubleSide});

    that.controller2.add(mesh);

    var sphereGeo = new THREE.SphereGeometry( 0.1, 32, 32 );
    var sphereMat = new THREE.MeshBasicMaterial( {color: 0xff0000, side:THREE.DoubleSide} );
    var sphere = new THREE.Mesh(sphereGeo, sphereMat );

    that.controller1.add(sphere);
    that.pickMesh = sphere;
  } );



  this.effect = new THREE.VREffect( this.renderer );

  if ( WEBVR.isAvailable() === true ) {

    document.body.appendChild( WEBVR.getButton( this.effect ) );

  }


  //SkyBox
  // var imagePrefix = "../images/ame_nebula/purplenebula_";
  // var directions  = ["bk", "dn", "ft", "lf", "rt", "up"];
  // var imageSuffix = ".jpg";

  var path = "../images/ame_nebula/purplenebula_";
  var format = '.jpg';
  var urls = [
      path + 'bk' + format, path + 'dn' + format,
      path + 'ft' + format, path + 'lf' + format,
      path + 'rt' + format, path + 'up' + format
    ];
  var textureCube = new THREE.CubeTextureLoader().load( urls );
  textureCube.format = THREE.RGBFormat;
  this.room.material.texture = textureCube;

  window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
}

E_Manager.prototype.Animate = function()
{
  this.effect.requestAnimationFrame( this.Animate.bind(this) );
  this.render();
}

E_Manager.prototype.UpdateController = function()
{
  this.controller1.update();
  this.controller2.update();
}

E_Manager.prototype.OnTriggerClicked = function( controller )
{
  if(controller.children.length > 1){
    controller.children[1].material.color = new THREE.Color(Math.random(), Math.random(), Math.random());
  }

  if(controller === this.controller1){
    if(controller.children.length > 1){
      controller.remove(this.pickMesh);
      this.scene.add(this.pickMesh);
    }else{
      this.scene.remove(this.pickMesh);
      controller.add(this.pickMesh);
    }
  }


}

E_Manager.prototype.render = function()
{
      var delta = this.clock.getDelta() * 60;


      this.UpdateController();


      this.controls.update();


      var pos = this.camera.position;
      this.light.position.set(pos.x, pos.y, pos.z);

      if(this.skull !== null)
      {
        this.skull.rotation.y += 0.01;
      }



      this.effect.render( this.scene, this.camera );
}

E_Manager.prototype.onWindowResize = function()
{

      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.effect.setSize( window.innerWidth, window.innerHeight );
}

module.exports = E_Manager;
