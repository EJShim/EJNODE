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
    new THREE.MeshBasicMaterial( { color: 0x404040, wireframe: true } )
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


  //Load OBJLoader
  var loader = new THREE.OBJLoader();
  loader.setPath( 'models/' );

  var that = this;


  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
  this.renderer.setClearColor( 0x505f50 );
  this.renderer.setPixelRatio( window.devicePixelRatio );
  this.renderer.setSize( window.innerWidth, window.innerHeight );
  this.renderer.sortObjects = false;
  this.container.appendChild( this.renderer.domElement );

  this.controls = new THREE.VRControls( this.camera );
  this.controls.standing = true;

  // controllers

  this.controller1 = new THREE.ViveController( 0 );
  this.controller1.standingMatrix = this.controls.getStandingMatrix();
  this.scene.add( this.controller1 );

  this.controller2 = new THREE.ViveController( 1 );
  this.controller2.standingMatrix = this.controls.getStandingMatrix();
  this.scene.add( this.controller2 );

  var loader = new THREE.OBJLoader();
  loader.setPath( 'models/' );

  var that = this;
  loader.load( 'vr_controller_vive_1_5.obj', function ( object ) {

    var loader = new THREE.TextureLoader();
    loader.setPath( 'models/' );

    var controller = object.children[ 0 ];
    controller.material.map = loader.load( 'onepointfive_texture.png' );
    controller.material.specularMap = loader.load( 'onepointfive_spec.png' );

    that.controller1.add( object.clone() );
    //that.controller2.add( object.clone() );

  } );


  var loader = new THREE.OBJLoader();
  loader.setPath( 'models/' );

  loader.load( 'craniopagus_bone.obj', function ( object ) {
    console.log(object);

    object.scale.x = 0.1;
    object.scale.y = 0.1;
    object.scale.z = 0.1;
    //object.position.set(1, that.floor, 1);

    object.material = new THREE.MeshPhongMaterial({color:0xaaaaaa, side:THREE.DoubleSide});

    //that.skull = object;

    that.controller2.add(object);
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
      var delta = this.clock.getDelta() * 60;

      this.controller1.update();
      this.controller2.update();

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
