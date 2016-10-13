
//onload functions

Initialize();
Animate();

///////function definitions/////////

var m_scene, m_camera, m_renderer;
var m_pointLight;
var m_controls;

var m_start = new Date();
var m_shaderMaterial;



function Initialize()
{
  m_scene = new THREE.Scene();
  m_camera = new THREE.PerspectiveCamera( 45, $("#viewport").width()/$("#viewport").height(), 0.1, 100000 );
  m_renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
  m_controls = new THREE.TrackballControls(m_camera);

  //init renderrer
  m_renderer.setClearColor(0xffffff, 1);
  m_renderer.setSize($("#viewport").width(), $("#viewport").height() );
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



  // create a point light
  m_pointLight = new THREE.PointLight(0xFFFFFF);
  // add to the scene
  m_scene.add(m_pointLight);

  //shader MeshLambertMaterial
  m_shaderMaterial = new THREE.ShaderMaterial({
    uniforms:{
      camPos:{value:m_camera.position }
    },
    vertexShader: $('#shader-vertex').text(),
    fragmentShader: $('#shader-fragment').text()
  });

  m_camera.position.z = 1000;
  m_pointLight.position.z = 20;

  DrawGeometry();

  Render();
}



function RadialFunction(data, Xvalue, Yvalue)
{
  var result = 0;
   //
  //  if(data.Array[Yvalue].X-9360 == Xvalue){
  //    //console.log(data.Array[Yvalue].Z * 10);
  //    result = data.Array[Yvalue].Z * 10000;
  //  }

  for(var i in data.Array){
      result +=  data.Array[i].Z * 15 * Math.exp(  -(Math.pow(Xvalue - (data.Array[i].X-data.Array[0].X) , 2)+Math.pow(Yvalue - i,2)) /500 );
  }

  //console.log(result);

  return result;
}
function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  }
  rawFile.send(null);
}

function DrawGeometry()
{
  ///JSON Data Test
  readTextFile("data.json", function(text){
    data = JSON.parse(text);

    var xSeg = data.Array[ data.Array.length-1 ].X - data.Array[0].X;
    var ySeg = data.Array.length - 1;
    //var noiseGen = new SimplexNoise;
    var ground_geometry = new THREE.PlaneGeometry(xSeg, ySeg, xSeg, ySeg);

    ground_geometry.translate(xSeg/2, ySeg/2, 0);
    for ( var i = 0; i < ground_geometry.vertices.length; i++ ) {
      var vertex = ground_geometry.vertices[i];
      vertex.z = RadialFunction(data, vertex.x, vertex.y);
    }
    ground_geometry.computeFaceNormals();
    ground_geometry.computeVertexNormals();

    var ground = new THREE.Mesh(ground_geometry, m_shaderMaterial);
    ground.material.side = THREE.DoubleSide;
    m_scene.add( ground );

    //ground.position.set(xSeg/2, ySeg/2, 0);
    m_controls.target = new THREE.Vector3(500, 500, 0);
    m_controls.update();

    Render();
  });
}

function Animate()
{
  requestAnimationFrame( Animate );

  m_controls.update();

  //synchronize light position anc camera position;
  m_pointLight.position.x = m_camera.position.x;
  m_pointLight.position.y = m_camera.position.y;
  m_pointLight.position.z = m_camera.position.z;

  RefreshThumbnail();

}

function RefreshThumbnail()
{
  //refresh thumbnail every 10 seconds
  var ctime = new Date();
  var elapsed = ctime - m_start;
  elapsed /= 1000;
  if(Math.round(elapsed) % 30 == 0 || Math.round(elapsed) == 10){} //SaveThumbnail();
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
