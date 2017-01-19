 var E_Particle = require("./E_Particle.js");
var E_SpringDamper = require("./E_SpringDamper");

function E_DeformableMesh(Mgr, geometry)
{
  THREE.Mesh.call(this);

  this.Mgr = Mgr;

  this.geometry = geometry;
  this.geometry.mergeVertices();
  this.material = new THREE.MeshPhongMaterial({color:0x5a0000});

  this.particles = [];
  this.springs = [];
  this.castShadow = true;



  //Initialize
  this.Initialize();
}

E_DeformableMesh.prototype = Object.create(THREE.Mesh.prototype);

E_DeformableMesh.prototype.Initialize = function()
{


  var vertMap = [];

  var numVerts = this.geometry.vertices.length;
  var numFaces = this.geometry.faces.length;
  var mass = 1;


  for(var i=0 ; i<numVerts ; i++){
    var part = new E_Particle(this.Mgr, 0.45);
    part.mass = mass;
    var realPos = this.geometry.vertices[i].clone();
    part.position.set(realPos.x, realPos.y, realPos.z);
    part.m_colorFixed = true;
    part.material.color = new THREE.Color(0.5, 0.5, 0.1);
    this.particles.push(part);


    //Initialize Vertex Connection Map (for spring connection)
    vertMap[i] = [];
    for(var j=0 ; j<numVerts ; j++){
      vertMap[i].push(false);
    }
  }



  // Spring-Damper
  for(var i=0 ; i<numFaces ; i++){
    var face = this.geometry.faces[i];
    var spring;

    if( vertMap[ face.a ][ face.b ] === false ){
      spring = new E_SpringDamper(this.Mgr);
      spring.AddMesh( this.particles[ face.a ] );
      spring.AddMesh( this.particles[ face.b ] );
      vertMap[ face.a ][ face.b ] = true;
      vertMap[ face.b ][ face.a ] = true;
      this.springs.push(spring);
    }

    if( vertMap[ face.b ][ face.c ] === false ){
      spring = new E_SpringDamper(this.Mgr);
      spring.AddMesh( this.particles[ face.b ] );
      spring.AddMesh( this.particles[ face.c ] );
      vertMap[ face.b ][ face.c ] = true
      vertMap[ face.c ][ face.b ] = true
      this.springs.push(spring);
    }

    if( vertMap[ face.c ][ face.a ] === false ){
      spring = new E_SpringDamper(this.Mgr);
      spring.AddMesh( this.particles[ face.c ] );
      spring.AddMesh( this.particles[ face.a ] );
      vertMap[ face.c ][ face.a ] = true;
      vertMap[ face.a ][ face.c ] = true;
      this.springs.push(spring);
    }
  }

}

E_DeformableMesh.prototype.AddToRenderer = function(scene, system)
{
  var numVerts = this.particles.length;
  var numSprings = this.springs.length;

  for(var i=0 ; i<numVerts ; i++){
    if(this.particles[i].connectedObject.length !== 0){

      if(i == 0)
      scene.add(this.particles[i]);
      system.add(this.particles[i]);
    }
  }

  for(var i=0 ; i<numSprings ; i++){
    //scene.add(this.springs[i]);
    system.add(this.springs[i]);
  }

  scene.add(this);
  system.add(this);
}

E_DeformableMesh.prototype.MakeTranslation = function(x, y, z)
{
  var len = this.particles.length;

  for(var i=0 ; i<len ; i++){
    this.particles[i].position.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
  }
}


E_DeformableMesh.prototype.Update = function()
{
  //Update Geometry
  for(var i in this.geometry.vertices){
    this.geometry.verticesNeedUpdate = true;
    this.geometry.elementsNeedUpdate = true;
    this.geometry.normalsNeedUpdate = true;
    this.geometry.groupsNeedUpdate = true;
    this.geometry.lineDistancesNeedUpdate = true;

    var pos = this.particles[i].position.clone();
    this.geometry.vertices[i].set(pos.x, pos.y, pos.z);
  }

  this.geometry.computeFaceNormals();
  this.geometry.computeVertexNormals();
}

module.exports = E_DeformableMesh;
