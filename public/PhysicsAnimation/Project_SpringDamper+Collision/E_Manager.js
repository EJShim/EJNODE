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
  var Mgr = this;
  requestAnimationFrame(Mgr.Animate.bind(Mgr));

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
    if (object instanceof E_Particle || object instanceof E_Spring || object instanceof E_SpringDamper)
    {

      var normal = new THREE.Vector3(0, 0, 0);
      if(object.position.y < 15) normal.set(0, 1, 0);

      object.Update(normal);
    }
  });
}

E_Manager.prototype.InitObject = function()
{
  var scene = this.GetScene();
  var camera = this.GetCamera();

  camera.position.z = 1000;
  camera.position.y = 400;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var ambient = new THREE.AmbientLight(0xaaaaaa);
  var light = new THREE.PointLight(0xffffff, 1, 1000000);
  light.position.set(0, 500, 0);
  scene.add(light);
  scene.add(ambient);

  //ground
  var geom = new THREE.Geometry();
  var v1 = new THREE.Vector3(200, 0, 0);
  var v2 = new THREE.Vector3(-200, 0, 0);
  var v3 = new THREE.Vector3(0, 0, 200);
  geom.vertices.push(v1);
  geom.vertices.push(v2);
  geom.vertices.push(v3);
  geom.faces.push(new THREE.Face3(0, 1, 2));
  geom.computeFaceNormals();

  var material = new THREE.MeshBasicMaterial({color:0xff0000});
  var groundMesh = new THREE.Mesh(geom, material);

  scene.add(groundMesh);

  var prevMesh;
  for(var i=0 ; i<10 ; i++){
    var mesh = new E_Particle(this);
    mesh.position.y = 200;
    mesh.position.x += i*10 - 30;
    mesh.m_colorFixed = true;
    scene.add(mesh);

    if(i > 0){
      var spring = new E_SpringDamper(this);
      spring.AddMesh(prevMesh);
      spring.AddMesh(mesh);
      scene.add(spring);
    }
    prevMesh = mesh;
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


  var calculatedVelocity = elapsedPosition.multiplyScalar(1/elapsedTime);

  //this.m_selectedMesh.ApplyForce(calculatedVelocity);

  this.m_selectedMesh = -1;
  this.m_prevTime = 0;
  this.m_prevPosition.set(0, 0, 0);
}
