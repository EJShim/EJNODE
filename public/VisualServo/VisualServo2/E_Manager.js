function E_Manager()
{
  this.VIEW_CAM = 0;
  this.VIEW_SUB = 1;

  this.canvas = document.getElementById("canvas");

  var m_renderer = new THREE.WebGLRenderer({canvas:this.canvas, preserveDrawingBuffer: true, antialias: true});
  m_renderer.setScissorTest( true );

  this.viewports = [];
  this.viewports[this.VIEW_CAM] = $("#viewport1");
  this.viewports[this.VIEW_SUB] = $("#viewport2");

  var m_scenes =  []
  for(var i = this.VIEW_CAM ; i<this.VIEW_SUB+1 ; i++){
    m_scenes[i] = new THREE.Scene();
    m_scenes[i].camera = new THREE.PerspectiveCamera( 45, this.viewports[i].width()/this.viewports[i].height(), 0.1, 100 );
    m_scenes[i].camera.matrixAutoUpdate = false;
    m_scenes[i].camera.axis = new E_Axis();
    m_scenes[i].camera.axis.matrixAutoUpdate = false;
    m_scenes[i].add(m_scenes[i].camera);
  }
  this.cameraHelper = new THREE.CameraHelper(m_scenes[this.VIEW_CAM].camera);
//  m_scenes[this.VIEW_SUB].add(this.cameraHelper);


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


  this.GetScene = function(id)
  {
    if(id == null) return m_scenes;
    else return m_scenes[id];
  }

  this.GetRenderer = function()
  {
    return m_renderer;
  }

  this.GetInteractor = function()
  {
    return m_interactor;
  }

  this.ImageMgr = function()
  {
    return m_imageManager;
  }
}

E_Manager.prototype.Initialize = function()
{
  // //Set 2D canvas Size
  var canvas = document.getElementById("canvas2D");
  canvas.width = $("#viewport1").width();
  canvas.height = $("#viewport1").height();


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
  var scenes = this.GetScene();

  var color = [];
  color[0] = 0x1a0e02;
  color[1] = 0x001100;

  imgMgr = this.ImageMgr();

  scenes.forEach(function(scene){

    var idx = scenes.indexOf(scene)
    var rect = Mgr.GetClientSize( idx );
    var camera = scene.camera;

    if ( rect.bottom < 0 || rect.top  > renderer.domElement.clientHeight+1 ||
      rect.right  < 0 || rect.left > renderer.domElement.clientWidth ) {
        return;  // it's off screen
    }

      // set the viewport
      var width  = Math.round(rect.right - rect.left);
      var height = Mgr.viewports[idx].height();
      var left   = rect.left;
      var bottom = renderer.domElement.clientHeight - rect.bottom;

      renderer.setViewport( left, bottom, width, height );
      renderer.setScissor( left, bottom, width, height );
      renderer.setClearColor(color[idx]);


      if(idx == Mgr.VIEW_CAM){
        var size = renderer.getSize();
        // renderer.setSize(width, height);
        // renderer.render( scene, camera );

         var img = imgMgr.RendererToImage(renderer,scene,camera);
        img = imgMgr.Yape06(img);
        imgMgr.SetImageDataTo2DRenderer(img);

        camera.axis.matrix.copy(camera.matrixWorld.clone());
        Mgr.light.matrix.copy(camera.matrixWorld.clone());
      }

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
  var Mgr = this;
  var scenes = this.GetScene();
  var ambient = new THREE.AmbientLight(0x000000);

  var camera1 = scenes[this.VIEW_CAM].camera;
  var camera2 = scenes[this.VIEW_SUB].camera;

  scenes.forEach(function(scene){
    scene.add(Mgr.light);
    scene.add(ambient);
  });


  //Add Sample Image
  this.tempImage = new E_Image();
  this.tempImage.ImportImage("../four.png", this);

  //Initialize Camera
  camera1.matrixWorld.multiply(new THREE.Matrix4().makeTranslation(0, 100, 0));
  camera1.matrixWorld.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));

  //camera2.position.y = 100;
  camera2.position.x = -150;
  camera2.position.z = 150;
  camera2.position.y = 65;
  camera2.lookAt(new THREE.Vector3(0, 45, 0));
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
	ajax.open("POST",'../../thumbnail.php',true);
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
