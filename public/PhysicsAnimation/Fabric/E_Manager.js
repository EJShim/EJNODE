function E_Manager()
{
  var canvas = document.getElementById("viewport");
  var m_scene = new THREE.Scene();
  var m_camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 100000 );
  var m_renderer = new THREE.WebGLRenderer({canvas:canvas, preserveDrawingBuffer: true, antialias: true});
  var m_interactor = new E_Interactor(this);

  var m_gravity = new THREE.Vector3(0.0, -980, 0.0);

  this.m_shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: $('#shader-vertex').text(),
    fragmentShader: $('#shader-fragment').text()
  });


  this.m_selectedMesh;
  this.m_prevTime = 0;
  this.m_prevPosition = new THREE.Vector3(0, 0, 0);

  this.starttime = new Date();
  this.light = new THREE.PointLight(0xffffff, 1, 1000000);
  this.light.position.set(0, 500, 0);
  this.thumbnailSaved = false;

  this.then = new Date();
  this.interval = 1000 / 30;

  this.GetScene = function()
  {
    return m_scene;
  }

  this.GetCamera = function()
  {
    return m_camera;
  }

  this.GetRenderer = function()
  {
    return m_renderer;
  }

  this.GetInteractor = function()
  {
    return m_interactor;
  }

  this.GetGravity = function()
  {
    return m_gravity;
  }
}

E_Manager.prototype.Initialize = function()
{
  var renderer = this.GetRenderer();
  //init renderrer
  renderer.setClearColor(0x000000, 1);
  renderer.setSize(window.innerWidth, window.innerHeight );

  //Initialize Object
  this.InitObject();
}

E_Manager.prototype.Animate = function()
{
  var cTime = new Date();
  var elapsedTime = (cTime-this.starttime)/1000;
  if(Math.abs(elapsedTime) > 10 && !this.thumbnailSaved) {
    this.SaveThumbnail();
    this.thumbnailSaved = true;
  }

  var Mgr = this;

  var now = new Date();
  this.delta = (now - this.then);

  if(this.delta > this.interval){
    var renderer = this.GetRenderer();
    var camera = this.GetCamera();
    var scene = this.GetScene();

    renderer.render(scene, camera);

    //Update Interactor
    var interactor = this.GetInteractor();
    interactor.Update();

    //Update Objects in Scene
    var count = 0;
    scene.traverse (function (object)
    {
      if (object instanceof E_Fabric)
      {
          object.Update();
      }
    });

    this.light.position.set(camera.position.x, camera.position.y, camera.position.z);
  }



  requestAnimationFrame(Mgr.Animate.bind(Mgr));
}

E_Manager.prototype.InitObject = function()
{
  var scene = this.GetScene();
  var camera = this.GetCamera();

  camera.position.z = 1000;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var ambient = new THREE.AmbientLight(0x000000);

  scene.add(this.light);
  scene.add(ambient);

  var fab = new E_Fabric(this);
  fab.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-500, 200, 0));
  //fab.material = this.m_shaderMaterial;
  fab.AddToRenderer(scene);


  var fab2 = new E_Fabric(this);
  fab2.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(500, 200, 0));
  fab2.material.color = new THREE.Color(0, 0, 0.4);
  //fab.material = this.m_shaderMaterial;
  fab2.AddToRenderer(scene);



  var scale = 120;
  for(var i=0 ; i<scale ; i++){
    fab.FixPoint(i/scale, 0);

    fab2.FixPoint(i/scale, 0);
    //fab2.FixPoint(i/scale, 1);
  }

}


E_Manager.prototype.SelectObject = function(x, y)
{
  var camera = this.GetCamera();
  var scene = this.GetScene();

  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2(x, y);

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);


  if(intersects.length > 0){
    for(var i in intersects){
      if(intersects[i].object instanceof E_Particle){
        this.m_selectedMesh = intersects[i].object;
        this.m_selectedMesh.velocity.set(0, 0, 0);

        this.m_prevTime = new Date();
        this.m_prevPosition = this.m_selectedMesh.position.clone();
        return true;
        //intersects[i].object.material.color.set(0xff0000);
        break;
      }else if(intersects[i].object instanceof E_Fabric){
        var faceIdx = intersects[i].face.a;
        this.m_prevTime = new Date();
        this.m_selectedMesh = intersects[i].object.particles[faceIdx];
        this.m_selectedMesh.velocity.set(0, 0, 0);
        this.m_prevPosition = intersects[i].object.particles[faceIdx].position.clone();
        return true;
      }
    }
  }
  return false;
}

E_Manager.prototype.OnMoveObject = function(x, y)
{

  //Save Time and Position
  this.m_prevTime = new Date();
  this.m_prevPosition = this.m_selectedMesh.position.clone()

  var camera = this.GetCamera();
  var scene = this.GetScene();
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2(x, y);
  raycaster.setFromCamera(mouse, camera);
  var distance = 1000;
  var newPosition = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(distance));
  this.m_selectedMesh.position.set(newPosition.x, newPosition.y, newPosition.z);
}

E_Manager.prototype.OnReleaseMouse = function()
{
  var currentTime = new Date();
  var currentPosition = this.m_selectedMesh.position.clone();

  var elapsedTime = (currentTime-this.m_prevTime);
  var elapsedPosition = currentPosition.sub(this.m_prevPosition);


  this.m_selectedMesh = -1;
  this.m_prevTime = 0;
  this.m_prevPosition.set(0, 0, 0);
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
}
