var VIEW_MAIN = 0;
var VIEW_2D_AXL = 1;

function E_Manager()
{
  var canvas = document.getElementById( "c" );

  var meshManager = new E_MeshManager(this);
  var volumeManager = new E_VolumeManager(this);

  var m_renderer = new THREE.WebGLRenderer({canvas:canvas, preserveDrawingBuffer: true, alpha:true});
  var m_scene = [];
  m_scene[VIEW_MAIN] = new THREE.Scene();
  m_scene[VIEW_2D_AXL] = new THREE.Scene();

  var m_camera = []
  m_camera[VIEW_MAIN] = new THREE.PerspectiveCamera( 45, $("#viewport").width()/$("#viewport").height(), 0.1, 10000000000 );
  m_camera[VIEW_2D_AXL] = new THREE.OrthographicCamera( $("#viewport2").width() / - 2, $("#viewport2").width() / 2, $("#viewport2").height() / 2, $("#viewport2").height() / - 2, - 300, 1000 );

  var m_control = new THREE.TrackballControls(m_camera[VIEW_MAIN], document.getElementById("viewport"));

  var m_shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: $('#shader-vertex').text(),
    fragmentShader: $('#shader-fragment').text()
  });

  var m_isDoublePassRendering = false;

  this.MeshManager = function(){
    return meshManager;
  }

  this.VolumeManager = function(){
    return volumeManager;
  }
  this.GetRenderer = function(){
    return m_renderer;
  }

  this.GetScene = function(index){
    if(index == null) return m_scene;
    else return m_scene[index];
  }

  this.GetCamera = function(index){
    return m_camera[index];
  }

  this.GetControl = function(){
    return m_control;
  }

  this.GetShaderMaterial = function(){
    return m_shaderMaterial;
  }

  this.SetDoublePass = function(bool){
    this.m_isDoublePassRendering = bool;
  }

  this.m_pointLight = new THREE.PointLight(0xFFFFFF);
}

E_Manager.prototype.Init = function()
{

  //init renderrer
  var renderer = this.GetRenderer();
  var scene = this.GetScene(VIEW_MAIN);
  var control = this.GetControl();

  var view1 = document.getElementById("viewport");
  var view2 = document.getElementById("viewport2");


  renderer.setClearColor(0x000000, 0);
  renderer.setSize(view1.clientWidth + view1.clientHeight, window.innerHeight);

  //init controls
  control.rotateSpeed = 4.0;
  control.zoomSpeed = 1.2;
  control.panSpeed = 0.8;
  control.noZoom = false;
  control.noPan = false;
  control.staticMoving = true;
  control.dynamicDampingFactor = 0.3;
  control.keys = [ 65, 83, 68 ];
  control.addEventListener( 'change', this.Redraw.bind(this) );

  // add to the scene
  scene.add(this.m_pointLight);

  this.Redraw();
  this.Animate();
}

E_Manager.prototype.Redraw = function()
{
  var renderer = this.GetRenderer();
  var scenes = this.GetScene();
  var camera = this.GetCamera(VIEW_MAIN);
  var that = this;

  var view1 = document.getElementById("viewport");
  var view2 = document.getElementById("viewport2");

  //renderer.setSize(view1.clientWidth + view1.clientHeight, window.innerHeight);

  // renderer.setClearColor( 0xffffff );
  // renderer.setScissorTest( false );
  // renderer.clear();
  // renderer.setClearColor( 0x000000 );
  renderer.setScissorTest( true );

  var color = [];
  color[0] = 0x1f0e02;
  color[1] = 0x001f00;

  var volMgr = this.VolumeManager();

  scenes.forEach(function(scene){
    var rect = that.GetClientSize( scenes.indexOf(scene) );

    if ( rect.bottom < 0 || rect.top  > renderer.domElement.clientHeight ||
      rect.right  < 0 || rect.left > renderer.domElement.clientWidth ) {
        return;  // it's off screen
      }
      // set the viewport
      var width  = rect.right - rect.left;
      var height = window.innerHeight;
      var left   = rect.left;
      var bottom = renderer.domElement.clientHeight - rect.bottom;


      renderer.setViewport( left, bottom, width, height );
      renderer.setScissor( left, bottom, width, height );
      renderer.setClearColor(color[scenes.indexOf(scene)], scenes.indexOf(scene));


      if(scenes.indexOf(scene) == VIEW_MAIN && volMgr.m_selectedVolumeIdx != -1 && that.m_isDoublePassRendering){
        var volume = volMgr.GetSelectedVolume();

        if(volume instanceof E_Volume2){
          var sceneRTT = volume.GetSceneRTT();
          var rtTexture = volume.GetRTTexture();

          //renderer.setRenderTarget(rtTexture);
          renderer.render(sceneRTT, that.GetCamera(scenes.indexOf(scene)), rtTexture, true);
        }
      }
      //renderer.setRenderTarget(null);
      renderer.render( scene, that.GetCamera( scenes.indexOf(scene) ) );
    });


  }

  E_Manager.prototype.Animate = function()
  {
    var control = this.GetControl();
    var camera = this.GetCamera(VIEW_MAIN);
    control.update();

    //synchronize light position anc camera position;
    this.m_pointLight.position.x = camera.position.x;
    this.m_pointLight.position.y = camera.position.y;
    this.m_pointLight.position.z = camera.position.z;

    requestAnimationFrame( this.Animate.bind(this) );
  }

  E_Manager.prototype.ResetCamera = function()
  {
    var scene = this.GetScene(VIEW_MAIN);
    var control = this.GetControl();

    var target = new THREE.Vector3(0, 0, 0);
    var count = 0;
    scene.traverse (function (object)
    {
      if (object instanceof THREE.Mesh || object instanceof E_VolumeData)
      {
        target.add(object.GetCenter())
        count++;
      }
    });
    target.divideScalar(count);
    control.target = target;
    control.update();

    //this.GetCamera(VIEW_2D_AXL).lookAt(target);

    this.Redraw();
  }

  E_Manager.prototype.Reset2DCamera = function(volume)
  {
    var camera = this.GetCamera(VIEW_2D_AXL);

    //caemra lookat target
    var target = volume.GetCenter();

    //camera up Vector3
    var upVec = volume.GetStackInformation().yCosine.clone();
    upVec.multiplyScalar(-1);

    //camera look Direction
    var camDir = volume.GetStackInformation().zCosine.clone();

    //calculate camera position
    var camPos = target.clone().add(camDir);

    camera.position.set(camPos.x, camPos.y, camPos.z);
    camera.up.set(upVec.x, upVec.y, upVec.z);
    camera.lookAt(target);


    this.Redraw();
  }

  E_Manager.prototype.GetClientSize = function(index)
  {
    var rect;

    if(index == VIEW_MAIN){
      rect=document.getElementById("viewport").getBoundingClientRect();
    }else{
      rect=document.getElementById("viewport2").getBoundingClientRect();
    }

    return rect
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


  function E_MeshManager(Mgr)
  {
    this.Manager = Mgr;
    this.m_meshList = [];
    this.m_selectedMeshIdx = -1;
  }

  E_MeshManager.prototype.ImportMesh = function(path, name)
  {
    var scene = this.Manager.GetScene(VIEW_MAIN);
    //var material = this.Manager.GetShaderMaterial();

    var that = this;
    var loader = new THREE.STLLoader();


    loader.load( path, function ( geometry ) {
      that.LoadMesh(geometry, name);
      //Mgr.ResetCamera();
    } );
  }

  E_MeshManager.prototype.LoadMesh = function(geometry, name)
  {
    if(name == null) name = "mesh_unnamed";

    var material = this.Manager.GetShaderMaterial();
    material.side = THREE.DoubleSide;
    material.transparent = true;
    material.depthTest = true;
    material.depthWrite = true;

    console.log(material.depthWrite);

    geometry.computeVertexNormals();
    //var material = new THREE.MeshPhongMaterial({color:0xff0000, shading:THREE.SmoothShading, shininess:30, specular:0xaaaaaa});
    var mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name;

    this.AddMesh(mesh);
  }

  E_MeshManager.prototype.AddMesh = function(mesh)
  {
    var scene = this.Manager.GetScene(VIEW_MAIN);
    this.m_meshList.push(mesh);

    scene.add(mesh);
    //update Mesh Tree
    this.UpdateMeshTree();

    this.Manager.ResetCamera();
    this.Manager.Redraw();

  }

  E_MeshManager.prototype.RemoveMesh = function(index)
  {
    var scene = this.Manager.GetScene(VIEW_MAIN);

    scene.remove( this.GetMesh(index) );
    delete this.GetMesh(index);
    this.m_meshList.splice(index, 1);

    if(this.m_meshList.length == 0) this.m_selectedMeshIdx = -1;

    this.UpdateMeshTree();
    this.Manager.Redraw();
  }

  E_MeshManager.prototype.UpdateMeshTree = function()
  {
    var text = "";

    for(var i in this.m_meshList){
      text += "<button class = 'list-group-item'>" + this.m_meshList[i].name + "</button>";
    }
    document.getElementById("meshTree").innerHTML = text;
  }

  E_MeshManager.prototype.GetMesh = function(index)
  {
    return this.m_meshList[index];
  }

  E_MeshManager.prototype.GetSelectedMesh = function()
  {
    if(this.m_selectedMeshIdx == -1) return;
    return this.GetMesh(this.m_selectedMeshIdx);
  }

  E_MeshManager.prototype.SetSelectedMesh =  function(index)
  {
    this.m_selectedMeshIdx = index;
  }

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


  function E_VolumeManager(Mgr)
  {
    this.Manager = Mgr;
    this.m_volumeList = [];
    this.m_selectedVolumeIdx = -1;

    this.m_selectedOpacityIndex = -1;

    var m_histogram = new E_Histogram();


    this.GetHistogram = function(){
      return m_histogram;
    }


  }


  E_VolumeManager.prototype.ImportVolume = function(buffer)
  {
    var temp = this;

    var loader = new E_DicomLoader();
    var files = buffer

    // load sequence for each file
    // 1- fetch
    // 2- parse
    // 3- add to array
    var seriesContainer = [];
    var loadSequence = [];
    files.forEach(function(url) {
      loadSequence.push(
        Promise.resolve()
        // fetch the file
        .then(function() {
          return loader.fetch(url);
        })
        .then(function(data) {
          return loader.parse(data);
        })
        .then(function(series) {
          seriesContainer.push(series);
        })
        .catch(function(error) {
          window.console.log('oops... something went wrong...');
          window.console.log(error);
        })
      );
    });

    // once all files have been loaded (fetch + parse + add to array)
    // merge them into series / stacks / frames
    Promise
    .all(loadSequence)
    .then(function() {
      loader.free();
      loader = null;

      // merge files into clean series/stack/frame structure
      var series = seriesContainer[0].mergeSeries(seriesContainer);
      var stack = series[0].stack[0];

      // be carefull that series and target stack exist!
      // var volume = new E_VolumeData(stack);
      // var sliceImage = new E_SliceImage(stack);

      var volume = new E_Volume2(stack);
      //volume2 for doublepass
      temp.AddVolume(volume);
      temp.Manager.SetDoublePass(true);

      //Update Histogram
      temp.Manager.SaveThumbnail();


    })
    .catch(function(error) {
      window.console.log('oops... something went wrong...');
      window.console.log(error);
    });
  }

  E_VolumeManager.prototype.AddVolume = function(volume)
  {
    // console.log(this.Manager.GetCamera(VIEW_MAIN));
    // this.Manager.GetCamera.position = new THREE.Vector3(190, 100, 100);
    var scene = this.Manager.GetScene(VIEW_MAIN);
    var scene2 = this.Manager.GetScene(VIEW_2D_AXL);
    //
    volume.AddToRenderer(scene);
    volume.AddSliceImageToRenderer(scene);
    volume.AddSliceImageTo2DRenderer(scene2);

    //add to volume list-group-itemthi
    this.m_volumeList.push(volume);
    this.SetSelectedVolume(this.m_volumeList.length-1);

    //update tree
    this.UpdateTree();

    // console.log(volume.GetStackInformation());
    // console.log(volume.GetVolumeData().uniforms.uLut.value  );

    this.Manager.ResetCamera();
    this.Manager.ResetCamera();
    this.Manager.Reset2DCamera(volume);
    this.Manager.Redraw();
  }

  E_VolumeManager.prototype.UpdateTree = function()
  {
    var text = "";

    for(var i in this.m_volumeList){
      text += "<button class='list-group-item'>" + "Temp Volume Name" + "</button>";
    }
    document.getElementById("volumeTree").innerHTML = text;
  }

  E_VolumeManager.prototype.RemoveVolume = function(index)
  {
    var scene = this.Manager.GetScene(VIEW_MAIN);
    this.GetVolume(index).RemoveFromRenderer(scene);
    // scene.remove( this.GetVolume(index) );
    // scene.remove( this.GetVolume(index).userData.sliceImage );

    this.m_volumeList.splice(index, 1);
    delete this.GetVolume(index);

    this.UpdateTree();
    this.Manager.Redraw();
  }

  E_VolumeManager.prototype.GetVolume = function(index)
  {
    return this.m_volumeList[index];
  }

  E_VolumeManager.prototype.GetSelectedVolume = function()
  {
    return this.GetVolume(this.m_selectedVolumeIdx);
  }

  E_VolumeManager.prototype.SetSelectedVolume = function(index)
  {
    this.m_selectedVolumeIdx = index;

    this.UpdateHistogram();
  }

  E_VolumeManager.prototype.MoveIndex = function(value)
  {
    if(this.m_selectedVolumeIdx == -1) return;

    this.GetSelectedVolume().MoveIndex(value);
    this.Manager.Redraw();

  }

  E_VolumeManager.prototype.UpdateLut = function()
  {
    if(this.m_selectedVolumeIdx == -1) return;

    console.log(document.getElementById("leftMenu").offsetWidth);
  }

  E_VolumeManager.prototype.OnClickedOpacity = function(x, y)
  {
    if(this.m_selectedVolumeIdx == -1) return false;
    var canvas = document.getElementById("histogram");

    x = x/canvas.width;
    y = 1.0 - y/canvas.height;

    var otf = this.GetSelectedVolume().GetLut()._opacity;


    for(var i=0 ; i<otf.length ; i++){
      if(Math.abs(otf[i][0]-x) < 0.1 && Math.abs(otf[i][1]-y) < 0.1){
        this.m_selectedOpacityIndex = i;
      }
    }

    if(this.m_selectedOpacityIndex == -1){
      this.GenerateOpacityPoint(x, y);
    }
  }

  E_VolumeManager.prototype.GenerateOpacityPoint = function(x, y)
  {
    var otf = this.GetSelectedVolume().GetLut()._opacity;

    for(var i=0 ; i<otf.length ; i++){
      if(x > otf[i][0] && x < otf[i+1][0]){
        otf.splice(i+1, 0, [x, y]);
        this.m_selectedOpacityIndex = i+1;
        break;
      }
    }

    //Update Volume
    this.GetSelectedVolume().UpdateLUT();
    this.UpdateHistogram();
    this.Manager.Redraw();

  }

  E_VolumeManager.prototype.OnMoveOpacity = function(x, y)
  {
    if(!this.m_selectedOpacityIndex == -1) return;

    var canvas = document.getElementById("histogram");
    var volume = this.GetSelectedVolume();
    var otf = volume.GetLut()._opacity;

    x = x/canvas.width;
    y = 1.0 - y/canvas.height;

    if(x < 0) x = 0;
    if(y < 0) y = 0;
    if(x > 1) x = 1;
    if(y > 1) y = 1;


    if(this.m_selectedOpacityIndex > 0){
      if(x < otf[this.m_selectedOpacityIndex-1][0]){
        x = otf[this.m_selectedOpacityIndex-1][0];
      }
    }else{
      x = 0;
    }

    if(this.m_selectedOpacityIndex < otf.length-1 ){
      if(x > otf[this.m_selectedOpacityIndex+1][0]) {
        x = otf[this.m_selectedOpacityIndex+1][0];
      }
    }else{
      x = 1;
    }


    //Set OTF
    otf[this.m_selectedOpacityIndex] = [x, y];

    //Update Volume
    volume.UpdateLUT();

    this.UpdateHistogram();
    this.Manager.Redraw();
  }

  E_VolumeManager.prototype.OnReleaseOpacity = function()
  {
    this.m_selectedOpacityIndex = -1;
  }

  E_VolumeManager.prototype.UpdateHistogram = function()
  {
    if(this.m_selectedVolumeIdx == -1) return;
    var lut = this.GetSelectedVolume().GetLut();

    this.GetHistogram().Update(lut)
  }
