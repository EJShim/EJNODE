function E_Manager()
{
  var canvas = document.getElementById("viewport");
  var m_scene = new THREE.Scene();
  var m_camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 100000 );
  var m_renderer = new THREE.WebGLRenderer({canvas:canvas, preserveDrawingBuffer: true, antialias: true});
  var m_interactor = new E_Interactor(this);

  var m_gravity = new THREE.Vector3(0.0, -10, 0.0);

  this.thumbnailSaved = false;
  this.starttime = new Date();

  this.then = new Date();
  this.interval = 1000 / 30;
  this.temp = 0;

  this.groumdMesh;

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
  renderer.setClearColor(0xffffff, 1);
  renderer.setSize(window.innerWidth, window.innerHeight );

  //Initialize Object
  this.InitObject();
}

E_Manager.prototype.Animate = function()
{
  var elapsedTime = (new Date() - this.starttime)/1000;
  if(elapsedTime > 15 && !this.thumbnailSaved){
    this.SaveThumbnail();
    this.thumbnailSaved = true;
  }

  this.temp++;
  if(this.temp == 10){
    this.GenerateObject(this.frand(-2.0, 2.0), this.frand(2.0, 3.0), this.frand(-2.0, 2.0));
    this.temp = 0;
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

    var Mgr = this;
    //Update Objects in Scene
    var count = [];

    scene.traverse (function (object)
    {
      if (object instanceof E_Particle)
      {
        scene.traverse(function(object2){
          if(object2 instanceof E_FinitePlane){
            Mgr.PlaneCollisionDetection(object, object2);
          }//else continue;
          // if(object2 instanceof E_Particle && JSON.stringify( object ) != JSON.stringify( object2 ) && !object.m_bCollided){
          //   Mgr.ParticleCollisionDetection(object, object2);
          // }
        });
        object.Update();
        if(object.elapsedTime > 3){
          object.visible = false;
          count.push(object);
        }
      }

    });

    //Remove object in Scene
    for(var i in count){
      scene.remove(count[i]);
    }

  }

  requestAnimationFrame(Mgr.Animate.bind(Mgr));
}


E_Manager.prototype.InitObject = function()
{
  var scene = this.GetScene();
  var camera = this.GetCamera();

  camera.position.z = 3;
  camera.position.y = 5;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var pointLight = new THREE.PointLight({color:0xffffff});
  pointLight.position.set(0, 5, 0);
  var ambient = new THREE.AmbientLight({color:0x555555});

  scene.add(pointLight);
  scene.add(ambient);

  this.GenerateRandomTriangle();

}

E_Manager.prototype.GenerateRandomTriangle = function()
{
  var scene = this.GetScene();

  //ground
  var v1 = new THREE.Vector3(this.frand(-2.5, -1.0), this.frand(-0.2, 0.2), this.frand(-2.5, -1.0));
  var v2 = new THREE.Vector3(this.frand(1.0, 2.5), this.frand(-0.2, 0.2) , this.frand(-2.5, -1.0));
  var v3 = new THREE.Vector3(this.frand(-0.5, -0.5), this.frand(-0.2, 0.2, this.frand(1.0, 2.5)));

  this.groundMesh = new E_FinitePlane(v1, v2, v3);
  scene.add(this.groundMesh);

}

E_Manager.prototype.ResetGround = function()
{
  var v1 = new THREE.Vector3(this.frand(-2.5, -1.0), this.frand(-0.2, 0.2), this.frand(-2.5, -1.0));
  var v2 = new THREE.Vector3(this.frand(1.0, 2.5), this.frand(-0.2, 0.2) , this.frand(-2.5, -1.0));
  var v3 = new THREE.Vector3(this.frand(-0.5, -0.5), this.frand(-0.2, 0.2, this.frand(1.0, 2.5)));

  this.groundMesh.geometry.vertices[0].set(v1.x, v1.y, v1.z) ;
  this.groundMesh.geometry.vertices[1].set(v2.x, v2.y, v2.z);
  this.groundMesh.geometry.vertices[2].set(v3.x, v3.y, v3.z);
  this.groundMesh.geometry.verticesNeedUpdate = true;
}


E_Manager.prototype.GenerateObjectScreen = function(x, y)
{
  var camera = this.GetCamera();


  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2(x, y);

  raycaster.setFromCamera(mouse, camera);

  var distance = 5;
  var generatePosition = new THREE.Vector3();
  generatePosition.addVectors(raycaster.ray.origin.clone(), raycaster.ray.direction.clone().multiplyScalar(distance));

  this.GenerateObject(generatePosition.x, generatePosition.y, generatePosition.z);

}

E_Manager.prototype.GenerateObject = function(x, y, z)
{
  var scene = this.GetScene();

  var newMesh = new E_Particle(this, 0.1);
  newMesh.position.set(x, y, z);
  newMesh.material.color = new THREE.Color(Math.random() / 4, Math.random() / 4, Math.random() / 4);
  newMesh.m_colorFixed = true;

  newMesh.velocity.set( this.frand(-0.1, 0.1), this.frand(-0.1, 0.1), this.frand(-0.1, 0.1) );

  // var newMesh2 = new E_Particle(this, 0.1);
  //
  // newMesh2.position.set(x + Math.random()/4, y + Math.random()/4, z + Math.random()/4);
  // newMesh2.material.color = new THREE.Color(Math.random() / 3, Math.random() / 3, Math.random() / 3);
  // newMesh2.m_colorFixed = true;
  //
  // var spring = new E_SpringDamper(this);
  // spring.AddMesh(newMesh);
  // spring.AddMesh(newMesh2);
  // spring.equilibriumLength = 0.4;
  // spring.cValue = 30;
  //
  // newMesh.elasticity = 0.2;
  // newMesh2.elasticity = 0.8;

  scene.add(newMesh);
  // scene.add(newMesh2);
  // scene.add(spring);

  //Impulse
  //newMesh.ApplyImpulse(raycaster.ray.direction.clone().normalize().multiplyScalar(0));
}

E_Manager.prototype.PlaneCollisionDetection = function(object, plane)
{
  var colPoint = plane.IsCollisionOccured(object, false);
  if(!colPoint){
    //Intersection with next position - in case of fast movement of the particle
    colPoint = plane.IsCollisionOccured(object, true);
    if(!colPoint){
      return
    }else{
      this.OnCollision(object, plane, colPoint);
      return;
    }
  }else{
    this.OnCollision(object, plane, colPoint);
    return;
  }
}

E_Manager.prototype.OnCollision = function(object, plane, colPoint)
{
  //Check if Local Collision Occurs
  var normal = plane.GetNormal();

  var Vn = normal.clone().multiplyScalar(object.velocity.clone().dot(normal));
  var Vt = object.velocity.clone().sub(Vn.clone());
  var Vnp = Vn.clone().multiplyScalar(-1 * object.elasticity);
  var V = Vnp.clone().add(Vt);

  object.position.set(colPoint.x, colPoint.y, colPoint.z);
  object.velocity.set(V.x, V.y, V.z);

  plane.material.color = object.material.color;
}

E_Manager.prototype.ParticleCollisionDetection = function(objectA, objectB)
{
  var posA = objectA.GetNextPosition();
  var posB = objectB.GetNextPosition();

  var z = posB.clone().sub(posA).length() - (objectA.radius + objectB.radius);
  //If Collision
  if(z < 0){
    var n = posB.clone().sub(posA).multiplyScalar( posB.clone().sub(posA).length() );

    // var VaN = n.clone().multiplyScalar(objectA.velocity.clone().dot(n));
    // var VaT = objectA.velocity.clone().sub(VaN);
    // //Va = VaN + VaT
    //
    // var VbN = n.clone().multiplyScalar(objectB.velocity.clone().dot(n));
    // var VbT = objectB.velocity.clone().sub(VbN);

    var Uminus = (objectB.velocity.clone().sub(objectA.velocity).dot(n) );
    var e = (objectB.elasticity + objectA.elasticity);

    var j = (1 + e)*(objectA.mass*objectB.mass / (objectA.mass+objectB.mass) )
    var E = n.clone().multiplyScalar(j);


    objectB.ApplyImpulse(E)
    objectA.ApplyImpulse(E.multiplyScalar(-1));

    objectB.m_bCollided = true;
  }
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

E_Manager.prototype.frand = function(min, max)
{
  var range = max - min;
  var value = Math.random();

  value *= range;
  value += min;

  return value;
}
