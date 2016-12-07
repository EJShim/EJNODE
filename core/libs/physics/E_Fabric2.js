var E_SpringDamperSource = require('./E_SpringDamperSource.js');
var E_ParticleSource = require('./E_ParticleSource.js');


function E_Fabric2(Mgr)
{
  THREE.Mesh.call(this);

  this.Manager = Mgr;

  this.width = 24;
  this.height = 20;

  this.resolution = 1.1;
  this.xSeg = Math.round(this.width*this.resolution)-1;
  this.ySeg = Math.round(this.height*this.resolution)-1;

  this.geometry = new THREE.PlaneGeometry(this.width, this.height, this.xSeg, this.ySeg);
  this.material = new THREE.MeshPhongMaterial({color:0xaa0000});

  this.particles = [];
  this.springs = [];

  this.material.side = 2;
}

E_Fabric2.prototype = Object.create(THREE.Mesh.prototype);

E_Fabric2.prototype.SetGeometry = function(x, y, xSeg, ySeg)
{
  this.width = x;
  this.height = y;
  this.xSeg = xSeg;
  this.ySeg = ySeg;
  this.geometry = new THREE.PlaneGeometry(x, y, xSeg, ySeg);
}

E_Fabric2.prototype.AddToRenderer = function(scene, system)
{

  for(var i in this.geometry.vertices){

    this.particles[i] = new E_ParticleSource(this.Manager, 0.45);
    this.particles[i].mass = 1;
    var realPos = this.geometry.vertices[i].clone();
    this.particles[i].m_colorFixed = true;
    this.particles[i].position.set(realPos.x, realPos.y, realPos.z);

    this.particles[i].parent = true;
    //this.particles[i].material.color = new THREE.Color(0.0, 0.1, 0.4);
    //scene.add(this.particles[i]);
    system.add(this.particles[i]);

    var i0 = i<= this.xSeg;
    var j0 = i % (this.xSeg+1) == 0;

    if(!j0){
      var spring = new E_SpringDamperSource(this.Manager);
      spring.AddMesh(this.particles[i]);
      spring.AddMesh(this.particles[i-1]);
      this.springs.push(spring);

      //scene.add(spring);
      system.add(spring);
    }

    if(i0){
      //this.particles[i].m_bFixed = true;
    }else{
      var spring = new E_SpringDamperSource(this.Manager);
      spring.AddMesh(this.particles[i]);
      spring.AddMesh(this.particles[i-this.xSeg-1]);
      this.springs.push(spring);

      //scene.add(spring);
      system.add(spring);
    }
  }

  //Add to System
  scene.add(this);
  system.add(this);
}

E_Fabric2.prototype.Update = function()
{
  //Update Particles and Geometry
  for(var i in this.geometry.vertices){
    this.geometry.verticesNeedUpdate = true;

    var pos = this.particles[i].position.clone();
    this.geometry.vertices[i].set(pos.x, pos.y, pos.z);
  }

  this.geometry.computeFaceNormals();
   this.geometry.computeVertexNormals();
}

E_Fabric2.prototype.GetParticle = function(index)
{
  return this.particles[index];
}

E_Fabric2.prototype.FixPoint = function(x,y)
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

E_Fabric2.prototype.SetC = function(c)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].cValue = c;
  }
}

E_Fabric2.prototype.SetK = function(k)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].kValue = k;
  }
}

E_Fabric2.prototype.SetELength = function(eL)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].equilibriumLength = eL;
  }
}

module.exports = E_Fabric2;
