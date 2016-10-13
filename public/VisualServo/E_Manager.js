function E_Manager()
{
  this.VIEW_CAM = 0;
  this.VIEW_SUB = 1;

  this.canvas = document.getElementById("canvas");

  var m_renderer = new THREE.WebGLRenderer({canvas:this.canvas, preserveDrawingBuffer: true, antialias: true});
  m_renderer.setScissorTest( true );

  var m_scene =  new THREE.Scene();

  var m_camera = []
  m_camera[this.VIEW_CAM] = new THREE.PerspectiveCamera( 45, $("#viewport1").width()/$("#viewport1").height(), 0.1, 100 );
  m_camera[this.VIEW_CAM].matrixAutoUpdate = false;
  m_camera[this.VIEW_CAM].userData.axis = new E_Axis();
  m_camera[this.VIEW_CAM].userData.axis.matrixAutoUpdate = false;
  m_camera[this.VIEW_CAM].userData.angularVelocity = new THREE.Euler();
  m_camera[this.VIEW_CAM].userData.translationalVelocity = new THREE.Vector3();
  console.log(m_camera[this.VIEW_CAM]);
  m_scene.add(m_camera[this.VIEW_CAM].userData.axis);
  this.cameraHelper = new THREE.CameraHelper(m_camera[this.VIEW_CAM]);
  //m_scene.add(this.cameraHelper);


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


  this.tempImage;


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
  requestAnimationFrame(this.Animate.bind(this));
}

E_Manager.prototype.Redraw = function()
{

  var Mgr = this;

  var renderer = this.GetRenderer();
  var scene = this.GetScene();
  var cameras = this.GetCamera();

  var color = [];
  color[0] = 0x1a0e02;
  color[1] = 0x001100;

  //Set Camera Position
  var camera1 = cameras[this.VIEW_CAM];
  var camera2 = cameras[this.VIEW_SUB];


  this.light.matrix.copy(camera1.matrixWorld.clone());

  imgMgr = this.ImageMgr();

  cameras.forEach(function(camera){

    var idx = cameras.indexOf(camera)
    var rect = Mgr.GetClientSize( idx );
    //console.log(rect.left + ", " + renderer.domElement.clientWidth);
    if ( rect.bottom < 0 || rect.top  > renderer.domElement.clientHeight+1 ||
      rect.right  < 0 || rect.left > renderer.domElement.clientWidth ) {
        return;  // it's off screen
    }

      // set the viewport
      var width  = Math.round(rect.right - rect.left);
      var height = Mgr.GetViewPort(idx).height();
      var left   = rect.left;
      var bottom = height - rect.bottom;


      renderer.setClearColor(color[idx]);

      if(idx == Mgr.VIEW_CAM){

        scene.remove(Mgr.cameraHelper);

        imgMgr.ClearCanvas();
        var img = imgMgr.RendererToImage(renderer,scene,camera, left, bottom, width, height);
         if(imgMgr.nFeatures < 4){
           img = imgMgr.FastCorners(img);
         }else{
           imgMgr.OpticalFlow(img);
        }
        //imgMgr.DrawInitPoints();

        camera.userData.axis.matrix.copy(camera.matrixWorld.clone());


      }else{
        scene.add(Mgr.cameraHelper);
      }

      renderer.setViewport( left, bottom, width, height );
      renderer.setScissor( left, bottom, width, height );
      renderer.render( scene, camera );

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
  this.tempImage.ImportImage("4dots.png", this);
  //this.tempImage.ImportImage("../cacheImage/Fabric.png", this);

  //Initialize Camera
  camera1.matrixWorld.multiply(new THREE.Matrix4().makeTranslation(0, 40, 70));
  camera1.matrixWorld.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/7));

  //camera2.position.y = 100;
  camera2.position.x = -150;
  camera2.position.z = 150;
  camera2.position.y = 65;
  camera2.lookAt(new THREE.Vector3(0, 45, 0));



  console.log(1 << 1);
  console.log(2 << 1);
  console.log(3 << 1);
  console.log(4 << 1);
}


E_Manager.prototype.SaveThumbnail = function()
{
  if(this.thumbnailSaved) return;
	//var testCanvas = m_renderer.domElement.toDataURL();
	var canvasData = this.GetRenderer().domElement.toDataURL();
	var postData = "canvasData="+canvasData;
	//var debugConsole= document.getElementById("debugConsole");
	//debugConsole.value=canvasData;

	//alert("canvasData ="+canvasData );
	var ajax = new XMLHttpRequest();
	ajax.open("POST",'../thumbnail.php',true);
	ajax.setRequestHeader('Content-Type', 'canvas/upload');
	//ajax.setRequestHeader('Content-TypeLength', postData.length);


	ajax.onreadystatechange=function()
	{
		if (ajax.readyState == 4)
		{
			//alert(ajax.responseText);
			// Write out the filename.
      //console.log(ajax.responseText);

		}
	}
	ajax.send(postData);
  this.thumbnailSaved = true;
}
