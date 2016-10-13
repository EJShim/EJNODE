
//onload functions

Initialize();
Animate();

///////function definitions/////////

var m_scene, m_camera, m_renderer;
var m_pointLight;
var m_controls;

function Initialize()
{
  m_scene = new THREE.Scene();
  m_camera = new THREE.PerspectiveCamera( 45, $("#viewport").width()/$("#viewport").height(), 0.1, 1000 );
  m_renderer = new THREE.WebGLRenderer();
  m_controls = new THREE.TrackballControls(m_camera);

  m_controls.rotateSpeed = 4.0;
	m_controls.zoomSpeed = 1.2;
	m_controls.panSpeed = 0.8;
	m_controls.noZoom = false;
	m_controls.noPan = false;
	m_controls.staticMoving = true;
	m_controls.dynamicDampingFactor = 0.3;
	m_controls.keys = [ 65, 83, 68 ];
	m_controls.addEventListener( 'change', Render );


  m_renderer.setSize($("#viewport").width(), $("#viewport").height() );
  document.getElementById("viewport").appendChild( m_renderer.domElement );

// create a point light
  m_pointLight = new THREE.PointLight(0xFFFFFF);
  // add to the scene
  m_scene.add(m_pointLight);

  //shader MeshLambertMaterial
  var shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: $('#shader-vertex').text(),
    fragmentShader: $('#shader-fragment').text()
  });

//test cube
  var cubeGeometry = new THREE.BoxGeometry( 4, 4, 4 );
  var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0x00ccf0 } );
  var cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  cube.position.x = 6;
  cube.position.y = 6;
  m_scene.add( cube );

  var cube2 = new THREE.Mesh( cubeGeometry, shaderMaterial);
  cube2.position.x = 6;
  cube2.position.y = -6;
  m_scene.add(cube2);


  //test sphere
  var sphereGeometry = new THREE.SphereGeometry(3, 64, 64); //raeius, segments, rings
  var sphereMaterial = new THREE.MeshPhongMaterial({color:0xffc0f0});
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.x = -6;
  sphere.position.y = 6;
  m_scene.add(sphere);

  //test sphere with shader MeshPhongMaterial
  var sphere2 = new THREE.Mesh(sphereGeometry, shaderMaterial);
  sphere2.position.x = -6;
  sphere2.position.y = -6;
  m_scene.add(sphere2);

  //test stl loader
  var loader = new THREE.STLLoader();
	loader.load( 'https://github.com/mrdoob/three.js/raw/master/examples/models/stl/binary/pr2_head_pan.stl', function ( geometry ) {
		var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111 } );
		var mesh = new THREE.Mesh( geometry, material );
		 mesh.position.set( 0, 0, 0 );
		mesh.scale.set( 20.0, 20.0, 20.0 );

		m_scene.add( mesh );
	} );


  loader.load( 'https://github.com/mrdoob/three.js/raw/master/examples/models/stl/binary/pr2_head_tilt.stl', function ( geometry ) {
    var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111 } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0, 0, 0 );
    mesh.scale.set( 20.0, 20.0, 20.0 );

    m_scene.add( mesh );
  } );


  m_camera.position.z = 20;
  m_pointLight.position.z = 20;

  m_renderer.setClearColor(0xffffff, 0);
  Render();
}

function Animate()
{
  requestAnimationFrame( Animate );
  m_controls.update();

  //synchronize light position anc camera position;
  m_pointLight.position.x = m_camera.position.x;
  m_pointLight.position.y = m_camera.position.y;
  m_pointLight.position.z = m_camera.position.z;
}

function Render()
{
  m_renderer.render(m_scene, m_camera);
}

//Event Listners
//Windows Resize
$(window).resize(function(){
  m_renderer.setSize($("#viewport").width(), $("#viewport").height());
  m_camera.aspect = $("#viewport").width()/$("#viewport").height();
  m_camera.updateProjectionMatrix();
  m_controls.handleResize();
  Render();
});
