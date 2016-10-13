function E_Fabric(Mgr)
{
  THREE.Mesh.call(this);

  this.Manager = Mgr;

  this.width = 800;
  this.height = 200;
  this.xSeg = 120;
  this.ySeg = 10;

  this.geometry = new THREE.PlaneGeometry(this.width, this.height, this.xSeg, this.ySeg);
  this.material = new THREE.MeshPhongMaterial({color:0xaa0000});

  this.particles = [];
  this.springs = [];

  this.material.side = 2;
}

E_Fabric.prototype = Object.create(THREE.Mesh.prototype);

E_Fabric.prototype.SetGeometry = function(x, y, xSeg, ySeg)
{
  this.width = x;
  this.height = y;
  this.xSeg = xSeg;
  this.ySeg = ySeg;
  this.geometry = new THREE.PlaneGeometry(x, y, xSeg, ySeg);
}

E_Fabric.prototype.AddToRenderer = function(scene)
{
  //this.material.morphTargets = true;
  scene.add(this);
  //this.visible = false;
  for(var i in this.geometry.vertices){

    this.particles[i] = new E_ParticleSource(this.Manager);

    var i0 = i<= this.xSeg;
    var j0 = i % (this.xSeg+1) == 0;


    if(!j0){
      var spring = new E_SpringDamperSource(this.Manager);
      spring.AddMesh(this.particles[i]);
      spring.AddMesh(this.particles[i-1]);
      this.springs.push(spring);
    }

    if(i0){
      //this.particles[i].m_bFixed = true;
    }else{
      var spring = new E_SpringDamperSource(this.Manager);
      spring.AddMesh(this.particles[i]);
      spring.AddMesh(this.particles[i-this.xSeg-1]);
      this.springs.push(spring);
    }


    var realPos = this.geometry.vertices[i].clone();
    this.particles[i].m_colorFixed = true;
    this.particles[i].position.set(realPos.x, realPos.y, realPos.z);
    // scene.add(this.particles[i]);
  }
}

E_Fabric.prototype.Update = function()
{

  //Update Spring Damper
  for(var i in this.springs){
    this.springs[i].Update();
  }

  //Update Particles and Geometry
  for(var i in this.geometry.vertices){
    this.particles[i].Update();
    this.geometry.verticesNeedUpdate = true;

    var pos = this.particles[i].position.clone();
    this.geometry.vertices[i].set(pos.x, pos.y, pos.z);
  }

  this.geometry.computeFaceNormals();
   this.geometry.computeVertexNormals();
}

E_Fabric.prototype.GetParticle = function(index)
{
  return this.particles[index];
}

E_Fabric.prototype.FixPoint = function(x,y)
{
  //x, y are normalized point position of the geometry
  var xPos = Math.round((x*this.xSeg) + 1);
  var yPos = Math.round(y*this.ySeg);

  var index = yPos * (this.xSeg+1) + xPos;
  // console.log(index);
  // console.log(this.particles.length);
  //console.log(xPos + "," + yPos);
  //Set Index
  this.particles[index-1].m_bFixed = true;
}

E_Fabric.prototype.SetC = function(c)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].cValue = c;
  }
}

E_Fabric.prototype.SetK = function(k)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].kValue = k;
  }
}

E_Fabric.prototype.SetELength = function(eL)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].equilibriumLength = eL;
  }
}
