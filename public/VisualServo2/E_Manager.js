function E_Manager()
{
  this.VIEW_CAM = 0;
  this.VIEW_SUB = 1;

  this.canvas = document.getElementById("canvas");

  var m_renderer = new THREE.WebGLRenderer({canvas:this.canvas, preserveDrawingBuffer: true, antialias: true, alpha:true});
  m_renderer.setScissorTest( true );

  var m_scene =  new THREE.Scene();

  var m_camera = [];
  m_camera[this.VIEW_CAM] = new THREE.PerspectiveCamera( 45, $("#viewport1").width()/$("#viewport1").height(), 0.1, 1200 );
  m_camera[this.VIEW_CAM].userData.axis = new E_Axis();
  m_camera[this.VIEW_CAM].userData.axis.matrixAutoUpdate = false;


  m_scene.add(m_camera[this.VIEW_CAM].userData.axis);
  this.cameraHelper = new THREE.CameraHelper(m_camera[this.VIEW_CAM]);
  var dist = 90 / 1200;
  this.cameraHelper.geometry.scale(dist, dist, dist);


  m_camera[this.VIEW_SUB] = new THREE.PerspectiveCamera( 45, $("#viewport2").width()/$("#viewport2").height(), 0.1, 100000 );

  var m_interactor = new E_Interactor(this);
  var m_imageManager = new E_ImageManager(this);

  this.m_shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: $('#shader-vertex').text(),
    fragmentShader: $('#shader-fragment').text()
  });

  this.light = new THREE.PointLight(0xffffff, 1, 1000000);
  this.light.position.set(0, 500, 0);
  this.light.matrixAutoUpdate = false;

  this.startTime = new Date();
  this.thumbnailSaved = false;

  var m_tracker = new E_Tracker(this);

  this.tempImage;
  this.m_bCalibration = false;
  this.trackPoints = [];
  this.trackPosition = new THREE.Vector3();


  this.GetScene = function()
  {
    return m_scene;
  }

  this.GetCamera = function(idx)
  {
    if(idx == null) return m_camera;
    else return m_camera[idx];
  }

  this.GetRenderer = function()
  {
    return m_renderer;
  }

  this.GetInteractor = function()
  {
    return m_interactor;
  }

  this.GetViewPort = function(idx)
  {
    if(idx == null) return;

    if(idx == 0){
      return $("#viewport1");
    }else if(idx == 1){
      return $("#viewport2");
    }
  }

  this.ImageMgr = function()
  {
    return m_imageManager;
  }

  this.Tracker = function()
  {
    return m_tracker;
  }
}

E_Manager.prototype.Initialize = function()
{
  //Set 2D canvas Size
  var rect = this.GetClientSize( this.VIEW_CAM );
  var canvas = document.getElementById("canvas2D");
  canvas.width = rect.right - rect.left;
  canvas.height = $("#viewport1").height();
  this.ImageMgr().UpdateImagePyramid();

  //Set WebGl Renderer Size
  //this.GetRenderer().setPixelRatio(0.2);
  this.GetRenderer().setSize($("#viewport").width(), $("#viewport").height() );
  this.InitObject();
  this.Animate();
  this.Redraw();
}

E_Manager.prototype.Animate = function()
{
  var elapsedTime = (new Date() - this.startTime) / 1000;
  if(elapsedTime > 15){
    this.SaveThumbnail();
  }


  this.GetInteractor().Update();

  if(this.m_bCalibration){
    this.RunCalibration();
  }
  requestAnimationFrame(this.Animate.bind(this));
}

E_Manager.prototype.Redraw = function()
{

  var Mgr = this;

  var renderer = this.GetRenderer();
  var scene = this.GetScene();
  var cameras = this.GetCamera();

  var color = [];
  color[0] = 0x000015;
  color[1] = 0x001100;

  //Set Camera Position
  var camera1 = cameras[this.VIEW_CAM];
  var camera2 = cameras[this.VIEW_SUB];


  this.light.matrix.copy(camera1.matrixWorld.clone());

  imgMgr = this.ImageMgr();
  tracker = this.Tracker();

  cameras.forEach(function(camera){

    var idx = cameras.indexOf(camera)
    var rect = Mgr.GetClientSize( idx );

    if ( rect.bottom < 0 || rect.top  > renderer.domElement.clientHeight+1 ||
      rect.right  < 0 || rect.left > renderer.domElement.clientWidth ) {
        return;  // it's off screen
    }

      // set the viewport
      var width  = rect.right - rect.left;
      var height = Mgr.GetViewPort(idx).height();
      var left   = rect.left;
      var bottom = height - rect.bottom;

      renderer.setSize($("#viewport").width(), $("#viewport").height());
      renderer.setClearColor(color[idx], 0);
      renderer.setViewport( left, bottom, width, height );
      renderer.setScissor( left, bottom, width, height );
      renderer.render( scene, camera );

      if(idx == Mgr.VIEW_CAM){
        camera.userData.axis.matrix.copy(camera.matrixWorld.clone());
        scene.add(Mgr.cameraHelper);
        scene.add(camera.userData.axis);

        if(!Mgr.m_bCalibration){
          imgMgr.ClearCanvas();
        }else{
          var track = new E_Track();
          // track.position.set(camera.position.x, camera.position.y, camera.position.z);
          // scene.add(track);
          // Mgr.trackPoints.push(track);
          // Mgr.trackPosition.add(track.position);
        }

        //Fake Features
        imgMgr.RenderFakeFeatures(camera);

        ///Init features
        imgMgr.DrawInitPoints();

      }else{
        scene.remove(Mgr.cameraHelper);
        scene.remove(camera1.userData.axis);

        //Update Camera2
        //if(!Mgr.m_bCalibration){
          var lookAt =  camera1.position.clone().sub( new THREE.Vector3(0, 0, 0)).multiplyScalar(0.5);
          camera2.lookAt( lookAt );
          var vec1 = camera1.position.clone().sub(camera2.position);
          var vec2 = lookAt.clone().sub(camera2.position);
          var eFov = Math.acos(vec1.clone().normalize().dot(vec2.clone().normalize())) * 3 ;
          camera2.fov =   eFov * ( 180 / Math.PI);
          camera2.updateProjectionMatrix();
        //}

      }

    });
}

E_Manager.prototype.GetClientSize = function(index)
{
  var rect;

  if(index == this.VIEW_CAM){
    rect=document.getElementById("viewport1").getBoundingClientRect();
  }else{
    rect=document.getElementById("viewport2").getBoundingClientRect();
  }
  return rect
}


E_Manager.prototype.InitObject = function()
{
  var scene = this.GetScene();
  var ambient = new THREE.AmbientLight(0x000000);
  var camera1 = this.GetCamera(this.VIEW_CAM);
  var camera2 = this.GetCamera(this.VIEW_SUB);

  scene.add(this.light);
  scene.add(ambient);

  // // //Add Sample Objects
  // var scaleFactor = 40;
  // for(var i=0 ; i<40 ; i++){
  //   var geometry;
  //   var ran = Math.random() * 2;
  //   if(ran < 1) geometry = new THREE.SphereGeometry( ran * 3, 16, 16 );
  //   else geometry = new THREE.BoxGeometry( ran * 2, ran * 2, ran * 2 );
  //
  //   var material = new THREE.MeshPhongMaterial( );
  //   material.color = new THREE.Color(Math.random() , Math.random() , Math.random() / 4);
  //   var cube = new THREE.Mesh( geometry, material );
  //   cube.position.set(scaleFactor * Math.random() - scaleFactor/2, scaleFactor * Math.random(), scaleFactor * Math.random() - scaleFactor/2 );
  //   scene.add( cube );
  // }
  //Add Sample Image
  this.tempImage = new E_Image();
  this.tempImage.ImportImage("../VisualServo/four.png", this);
  //this.tempImage.ImportImage("../cacheImage/Fabric.png", this);

  //Initialize Camera
  // camera1.matrixWorld.multiply(new THREE.Matrix4().makeTranslation(0, 90, 0));
  // camera1.matrixWorld.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  //Before Registration
  camera1.position.setFromMatrixPosition(new THREE.Matrix4().makeTranslation(4, 50, 40));
  camera1.rotation.setFromRotationMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/3));

  //camera2.position.y = 100;
  camera2.position.x = -150;
  camera2.position.z = 150;
  camera2.position.y = 65;
  camera2.lookAt(new THREE.Vector3(0, 45, 0));
}

E_Manager.prototype.ToggleModeCalibration = function(bool)
{
  if(bool){
    this.Tracker().UpdateFeatureLable();
  }else{
    // var scene = this.GetScene();
    // for(var i in this.trackPoints){
    //   scene.remove(this.trackPoints[i]);
    //   this.trackPosition = new THREE.Vector3();
    // }
  }

  this.m_bCalibration = bool;
}

E_Manager.prototype.RunCalibration = function()
{
  this.ImageMgr().ClearCanvas();
  var camera = this.GetCamera(this.VIEW_CAM);
  var trans = camera.matrix.clone();
  var rot = camera.matrix.clone();
  var velocity = this.Tracker().CalculateVelocity();


  var scalefactor = 200000;
  rot.multiply(new THREE.Matrix4().makeRotationX(velocity.wx ));
  rot.multiply(new THREE.Matrix4().makeRotationY(velocity.wy ));
  rot.multiply(new THREE.Matrix4().makeRotationZ(velocity.wz ));
  camera.rotation.setFromRotationMatrix(rot);


  trans.multiply(new THREE.Matrix4().makeTranslation(velocity.vx, velocity.vy, velocity.vz ));
  camera.position.setFromMatrixPosition(trans);

  camera.userData.axis.matrix.copy(camera.matrix.clone());

  this.Redraw();
}

E_Manager.prototype.SaveThumbnail = function()
{
  if(this.thumbnailSaved) return;
	//var testCanvas = m_renderer.domElement.toDataURL();
	var canvasData = this.GetRenderer().domElement.toDataURL();
	var postData = "canvasData="+canvasData;


	//alert("canvasData ="+canvasData );
	var ajax = new XMLHttpRequest();
	ajax.open("POST",'../thumbnail.php',true);
	ajax.setRequestHeader('Content-Type', 'canvas/upload');
	//ajax.setRequestHeader('Content-TypeLength', postData.length);


	ajax.onreadystatechange=function()
	{
		if (ajax.readyState == 4)
		{

		}
	}
	ajax.send(postData);
  this.thumbnailSaved = true;
}
