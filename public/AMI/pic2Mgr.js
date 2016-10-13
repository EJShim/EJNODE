
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
  m_renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true, antialias: true});
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
      viewDir:{value: m_camera.position.sub(m_controls.target)},
      camPos:{value: m_camera.position}
    },
    vertexShader: $('#shader-vertex').text(),
    fragmentShader: $('#shader-fragment').text()
  });

  m_camera.position.z = 1000;
  m_pointLight.position.z = 20;

  DrawGeometry();

  Render();
}

function RadialFunction(X, Y)
{
  //Define X,Y,Z function Here
  var Z = 0;

  //  for(var i = 2; i < 6 ; i++){
  //    Z += i*15*Math.pow(  2, -(Math.pow(  i*i/10 *(X - 250), 2)+Math.pow( i*i/10*(Y - 250) ,2)) / 100 )
  //    +i*15*Math.pow(  2, -(Math.pow(  i*i/10 *(X - 100), 2)+Math.pow( i*i/10*(Y - 250) ,2)) / 100 )
  //    +i*15*Math.pow(  2, -(Math.pow(  i*i/10 *(X - 180), 2)+Math.pow( i*i/10*(Y - 100) ,2)) / 100 )
  //    +i*15*Math.pow(  2, -(Math.pow(  i*i/10 *(X - 320), 2)+Math.pow( i*i/10*(Y - 100) ,2)) / 100 )
  //    +i*15*Math.pow(  2, -(Math.pow(  i*i/10 *(X - 180), 2)+Math.pow( i*i/10*(Y - 400) ,2)) / 100 )
  //    +i*15*Math.pow(  2, -(Math.pow(  i*i/10 *(X - 320), 2)+Math.pow( i*i/10*(Y - 400) ,2)) / 100 )
  //    +i*15*Math.pow(  2, -(Math.pow(  i*i/10 *(X - 400), 2)+Math.pow( i*i/10*(Y - 250) ,2)) / 100 );
  //  }

  Z = 200 /  Math.sqrt( Math.pow( X-250 , 2) + Math.pow( Y-250  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-100 , 2) + Math.pow( Y-250  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-180 , 2) + Math.pow( Y-100  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-320 , 2) + Math.pow( Y-100  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-180 , 2) + Math.pow( Y-400  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-320 , 2) + Math.pow( Y-400  , 2)  )
  + 200 / Math.sqrt( Math.pow( X-400 , 2) + Math.pow( Y-250  , 2)  );

  // +250*Math.pow( 2, -(Math.pow(X - 100, 2)+Math.pow(Y - 250,2)) / 100 )
  // +250*Math.pow( 2, -(Math.pow(X - 200, 2)+Math.pow(Y - 100,2)) / 100 )
  // +250*Math.pow( 2, -(Math.pow(X - 300, 2)+Math.pow(Y - 100,2)) / 100 )
  // +250*Math.pow( 2, -(Math.pow(X - 200, 2)+Math.pow(Y - 400,2)) / 100 )
  // +250*Math.pow( 2, -(Math.pow(X - 300, 2)+Math.pow(Y - 400,2)) / 100 )
  // +250*Math.pow( 2, -(Math.pow(X - 400, 2)+Math.pow(Y - 250,2)) / 100 );

  // Z = 1000 / (Y-250);
  // if(Y < 250) Z *= -1;
  //
  // Z = 100/((X-250)*(Y-250));
  //
  // if( (X - 250)* (Y-250) < 0 ) Z *= -1;



  return Z;
}

function DrawGeometry()
{
  var geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );

  for(var i=-10 ; i<10 ; i++){

					var object = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: Math.abs(i)%2 * 0xff0000} ) );
          object.position.x = i*20;

          var object2 = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: Math.abs(i+1)%2 * 0xffffff } ) );
          object2.position.x = i*20;
          object2.position.z = 50;

					m_scene.add( object );
          m_scene.add( object2);
  }


  //ground.position.set(xSeg/2, ySeg/2, 0);
  //m_controls.target = new THREE.Vector3(500, 500, 0);
  m_controls.update();

  Render();
}

function Animate()
{


  requestAnimationFrame( Animate );

  m_shaderMaterial.uniforms.camPos.value = m_camera.position;
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
  if(Math.round(elapsed) % 30 == 0 || Math.round(elapsed) == 10) {}//SaveThumbnail();
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
