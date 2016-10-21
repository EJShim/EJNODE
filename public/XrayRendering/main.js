
//onload functions

Initialize();
Animate();

///////function definitions/////////

var m_scene, m_camera, m_renderer;

var m_controls;

var m_start = new Date();
var m_shaderMaterial;

var m_keyCode = -1;


var m_selectedMesh = null;
var m_bones = []
var detector


function Initialize()
{
  m_scene = new THREE.Scene();
  m_camera = new THREE.PerspectiveCamera( 45, $("#viewport").width()/$("#viewport").height(), 0.1, 100000 );
  m_renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true, antialias: true, alpha:true});
  m_renderer.shadowMap.enabled = true;
  m_renderer.shadowMap.type = THREE.BasicShadowMap;
  m_controls = new THREE.TrackballControls(m_camera);

  //init renderrer
  m_renderer.setClearColor(0xffffff, 0);
  m_renderer.setSize(window.innerWidth, window.innerHeight );
  document.getElementById("viewport").appendChild( m_renderer.domElement );


  //init controls
  m_controls.rotateSpeed = 4.0;
  m_controls.zoomSpeed = 1.2;
  m_controls.panSpeed = 0.8;
  m_controls.noZoom = false;
  m_controls.noPan = false;
  m_controls.staticMoving = true;
  m_controls.dynamicDampingFactor = 0.3;
  m_controls.keys = [ 65, 83, 68 ];
  // m_controls.target = new THREE.Vector3(0, 0, -700);
  m_controls.addEventListener( 'change', Render );


  //shader MeshLambertMaterial
  m_shaderMaterial = new THREE.ShaderMaterial({
    uniforms:{
      viewDir:{value: m_camera.position.sub(m_controls.target)},
      camPos:{value: m_camera.position}
    },
    vertexShader: $('#shader-vertex').text(),
    fragmentShader: $('#shader-fragment').text()
  });


  m_camera.position.y = -3000;



  DrawGeometry();

  Render();
}

function RadialFunction(X, Y)
{
  //Define X,Y,Z function Here
  var Z = 0;

  Z = 200 /  Math.sqrt( Math.pow( X-250 , 2) + Math.pow( Y-250  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-100 , 2) + Math.pow( Y-250  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-180 , 2) + Math.pow( Y-100  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-320 , 2) + Math.pow( Y-100  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-180 , 2) + Math.pow( Y-400  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-320 , 2) + Math.pow( Y-400  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-400 , 2) + Math.pow( Y-250  , 2)  );

  return Z;
}

function DrawGeometry()
{
  ImportMesh("../DATA/KY_17365005/KY_17365005_Femur_L_001.stl");
  ImportMesh("../DATA/KY_17365005/KY_17365005_Femur_R_001.stl");
  ImportMesh("../DATA/KY_17365005/KY_17365005_Tibia_L_001.stl");
  ImportMesh("../DATA/KY_17365005/KY_17365005_Tibia_R_001.stl");

  var target = new THREE.Vector3(0, 0, 0);
  var count = 0;
  m_scene.traverse (function (object)
  {
    if (object instanceof THREE.Mesh)
    {
      target.add(object.GetCenter())
      count++;
    }
  });
  target.divideScalar(count);

  //Add Point light
  var pointLight = new THREE.SpotLight( 0xffffff, 1, 10000 );
  pointLight.castShadow = true;
  pointLight.shadow.camera.far = 2000;
  pointLight.shadow.camera.fov = 26;
  pointLight.shadow.mapSize.width = 5000;
  pointLight.shadow.mapSize.height = 5000;

  var shadowCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
  shadowCameraHelper.material.linewidth = 5.0;
  m_scene.add(shadowCameraHelper);



  var lightGeometry = new THREE.SphereGeometry( 19, 12, 6 );
  var lightMaterial = new THREE.MeshBasicMaterial( { color: 'red' } );
  var lightSphere = new THREE.Mesh( lightGeometry, lightMaterial );
  pointLight.add( lightSphere );
  pointLight.position.y = -2000;
  pointLight.position.z = -750;
  m_scene.add(pointLight);

  //add detector Plane
  var geometry = new THREE.BoxGeometry( 500, 5, 900 );
  var material = new THREE.MeshPhongMaterial( { color:'white', shininess:0, specular:0x000000 } );
  detector = new THREE.Mesh( geometry, material );
  detector.position.z = -750;
  detector.receiveShadow = true;

  pointLight.target = detector;

  m_scene.add( detector );

  Render();
}

function ImportMesh(path)
{
  var loader = new THREE.STLLoader();

  loader.load( path, function ( geometry ) {
    LoadMesh(geometry);
  } );
}

function LoadMesh(geometry)
{

  var material = new THREE.MeshPhongMaterial( {color: 0xdeceaf,shininess: 100, specular: 0x222222} );
  var mesh = new THREE.Mesh(geometry, material);
  m_bones.push(mesh);

  mesh.castShadow = true;
  // mesh.receiveShadow = true;

  AddMesh(mesh);
}

function AddMesh(mesh)
{
  m_scene.add(mesh);

  ResetCamera();

  Render();
}

function ResetCamera()
{
  var target = new THREE.Vector3(0, 0, 0);
  var count = 0;
  m_scene.traverse (function (object)
  {
    if (object instanceof THREE.Mesh)
    {
      target.add(object.GetCenter())
      count++;
    }
  });
  target.divideScalar(count);
  m_controls.target = target;
  m_controls.update();
}

function Animate()
{
  requestAnimationFrame( Animate );

  m_shaderMaterial.uniforms.camPos.value = m_camera.position;
  if(m_selectedMesh == null){
    m_controls.update();
  }

  HandleKeyEvent();
  //RefreshThumbnail();
}

function RefreshThumbnail()
{
  //refresh thumbnail every 10 seconds
  var ctime = new Date();
  var elapsed = ctime - m_start;
  elapsed /= 1000;
  if(Math.round(elapsed) % 30 == 0 || Math.round(elapsed) == 10) SaveThumbnail();
}


function Render()
{
  //console.log(m_camera.position);
  //console.log(m_camera.rotation);
  m_renderer.render(m_scene, m_camera);
}

//Event Listners
//Windows Resize
$(window).resize(function(){
  m_renderer.setSize(window.innerWidth, window.innerHeight);
  m_camera.aspect = $("#viewport").width()/$("#viewport").height();
  m_camera.updateProjectionMatrix();
  m_controls.handleResize();
  Render();
});


THREE.Mesh.prototype.GetCenter = function()
{
  this.geometry.computeBoundingBox();
  var boundingBox = this.geometry.boundingBox;
  var position = new THREE.Vector3();
  position.subVectors( boundingBox.max, boundingBox.min );
  position.multiplyScalar( 0.5 );
  position.add( boundingBox.min );
  position.applyMatrix4( this.matrixWorld );

  return position;
}

function SelectObject(x, y)
{
  var camera = m_camera;
  var scene = m_scene;

  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2(x, y);

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(m_bones);
  if(intersects.length > 0){

    for(var i in intersects){
      m_selectedMesh = intersects[0].object;
      break;
    }
  }
}

function OnKeyboardDown(event)
{
  m_keyCode = event.keyCode;
}

function OnKeyboardUp()
{
  m_keyCode = -1;
}


function HandleKeyEvent()
{
  if(m_scene.children.length < 6){
    return;
  }

  var object = m_scene.children[5];
  var mat = object.matrix.clone();


  switch (m_keyCode) {
    case -1:
      return;
    break;
    case 87: // w
      mat.multiply(new THREE.Matrix4().makeTranslation(0, 0, 1));
      object.position.setFromMatrixPosition(mat);
    break;
    case 32: // Space key
      mat.multiply(new THREE.Matrix4().makeTranslation(0, 0, -1));
      object.position.setFromMatrixPosition(mat);
    break;
    case 67: // c
      mat.multiply(new THREE.Matrix4().makeTranslation(0, 1, 0));
      object.position.setFromMatrixPosition(mat);
    break;
    case 83: // S key
      mat.multiply(new THREE.Matrix4().makeTranslation(0, 0, -1));
      object.position.setFromMatrixPosition(mat);
    break;
    case 65: // A key
      mat.multiply(new THREE.Matrix4().makeTranslation(-1, 0, 0));
      object.position.setFromMatrixPosition(mat);
    break;
    case 68: // D Key
      mat.multiply(new THREE.Matrix4().makeTranslation(1, 0, 0));
      object.position.setFromMatrixPosition(mat);
    break;
    case 81: // Q
      mat.multiply(new THREE.Matrix4().makeRotationZ(0.01));
      object.rotation.setFromRotationMatrix(mat);

    break;
    case 69: // E Key
      mat.multiply(new THREE.Matrix4().makeRotationZ(-0.01));
      object.rotation.setFromRotationMatrix(mat);
    break;
    default:
    break;
  }

    Render();
}

m_prevPosition = new THREE.Vector2(0.0);


function onMouseDown(event){


  var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  //Check if Object is Selected;
  SelectObject(mouseX, mouseY);

  //Store Position;
  m_prevPosition.x = mouseX;
  m_prevPosition.y = mouseY;
}

function onMouseMove(event){
  if(m_selectedMesh == null) return;

  //Get Current position
  var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  var currentPosition = new THREE.Vector2(mouseX, mouseY);

  //alert(mouseX + "," + mouseY);

  var delta = currentPosition.clone().sub(m_prevPosition.clone());
  delta.multiplyScalar(1000);

  var mat = m_selectedMesh.matrix.clone();
  mat.multiply(new THREE.Matrix4().makeTranslation(delta.x, 0,  delta.y));
  m_selectedMesh.position.setFromMatrixPosition(mat);

  m_prevPosition = currentPosition;

  Render();
}

function onMouseUp(event)
{
  m_selectedMesh = null;
}


//Event Handlers
$("#viewport").mousedown(function(event){
  onMouseDown(event);
});

$("#viewport").mousemove(function(event){
  onMouseMove(event);
});

$("#viewport").mouseup(function(event){
  onMouseUp(event);
});



$(window).keydown(function(event){
  OnKeyboardDown(event);
});

$(window).keyup(function(event){
  OnKeyboardUp(event);
});
