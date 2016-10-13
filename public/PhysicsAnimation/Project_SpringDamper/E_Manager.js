function E_Manager()
{
  var canvas = document.getElementById("viewport");
  var m_scene = new THREE.Scene();
  var m_camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 100000 );
  var m_renderer = new THREE.WebGLRenderer({canvas:canvas, preserveDrawingBuffer: true, antialias: true});
  var m_interactor = new E_Interactor(this);

  var m_gravity = new THREE.Vector3(0.0, -980, 0.0);


  this.m_selectedMesh;
  this.m_prevTime = 0;
  this.m_prevPosition = new THREE.Vector3(0, 0, 0);


  this.thumbnailSaved = false;
  this.starttime = new Date();

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
  var elapsedTime = (new Date() - this.starttime) / 1000;
  if(elapsedTime > 15 && !this.thumbnailSaved){
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
      if (object instanceof E_Particle || object instanceof E_SpringDamper)
      {
          object.Update();
      }
    });


    this.then = now - (this.delta % this.interval);
  }


  requestAnimationFrame(Mgr.Animate.bind(Mgr));


}

E_Manager.prototype.InitObject = function()
{
  var scene = this.GetScene();
  var camera = this.GetCamera();

  camera.position.z = 1000;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var ambient = new THREE.AmbientLight(0xaaaaaa);
  var light = new THREE.PointLight(0xffffff, 1, 1000000);
  light.position.set(0, 500, 0);
  scene.add(light);
  scene.add(ambient);

  var map = [[2, 1],
            [3, 1], [3,3],
            [4, 1], [4,3],
             [5,1], [5,2],
              [6,1], [6,2],
               [7,1], [7,2], [7, 3],
               [8,1], [8, 3], [8,6], [8,7],
               [9,1], [9,2], [9,3], [9,5], [9 ,7],
               [10, 1], [10, 3], [10,5], [10,7],
               [11, 6], [11, 7],
               [12, 2],
               [13, 2],
               [14, 2],
               [15, 2],
               [16,1], [16,2], [16, 3], [16, 4],
               [20,2], [20, 3], [20,4],
               [21, 2], [21, 4],
               [22,2], [22, 4],
               [23,2], [23, 3], [23,4],
                [25,1],[25,2] ,[25,3], [25,4], [25,5], [25,6], [25,7]];


  var arr = [];
  var IMAX = 30;
  var JMAX = 10;
  for(var i=0 ; i<IMAX+1 ; i++){
    arr[i] = [];
    for(var j=0 ; j<JMAX+1 ; j++){
      arr[i][j] = new E_Particle(this);
      // for(var k = 0 ; k < map.length ; k++){
      //   if(map[k][0] == i && map[k][1] == j)
      //   arr[i][j].m_colorFixed = true;
      // }
      scene.add(arr[i][j]);
      if(j > 0){
        var spring = new E_SpringDamper(this);
        spring.AddMesh(arr[i][j-1]);
        spring.AddMesh(arr[i][j]);
        scene.add(spring);
      }
      if(i > 0){
        var spring = new E_SpringDamper(this);
        spring.AddMesh(arr[i-1][j]);
        spring.AddMesh(arr[i][j]);
        scene.add(spring);
      }
      if(i > 0 && j > 0){
        var spring = new E_SpringDamper(this);
        spring.AddMesh(arr[i-1][j-1]);
        spring.AddMesh(arr[i][j]);
        scene.add(spring);
      }

      if(i > 0 && j < JMAX){
        var spring = new E_SpringDamper(this);
        spring.AddMesh(arr[i-1][j+1]);
        spring.AddMesh(arr[i][j]);
        scene.add(spring);

        if(i == 1 && j == 1){
          spring.UpdateImplicit();
        }
      }
    }
    arr[i][0].position.x += i*40 - 600;
    arr[i][JMAX].position.x += i*40 - 600;
    arr[i][0].position.y += 300;
    arr[i][JMAX].position.y -= 200;

    arr[i][0].m_bFixed = true;
    arr[i][JMAX].m_bFixed = true;

    // arr[0][j].m_bFixed = true;
    // arr[IMAX][j].m_bFixed = true;
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

        this.m_prevTime = new Date;
        this.m_prevPosition = this.m_selectedMesh.position.clone();
        return true;
        //intersects[i].object.material.color.set(0xff0000);
        break;
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
