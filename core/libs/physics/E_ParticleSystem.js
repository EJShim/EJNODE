var E_Particle = require("./E_Particle.js");
var E_FinitePlane = require("./E_FinitePlane.js");

function E_ParticleSystem(Mgr)
{
  this.Manager = Mgr;

  this.particleList = [];
  this.planeList = [];
}

E_ParticleSystem.prototype.add = function( object )
{
  if(object instanceof E_Particle){
    this.particleList.push(object);
  }
  else if(object instanceof E_FinitePlane){
    this.planeList.push(object);
  }else{
    return;
  }
}

E_ParticleSystem.prototype.remove = function( object )
{
  if(object instanceof E_Particle){
    var idx = this.particleList.indexOf(object);
    this.particleList.splice(idx, 1);
  }else if(object instanceof E_FinitePlane){
    var idx = this.planeList.indexOf(object);
    this.planeList.splice(idx, 1);
  }
}


E_ParticleSystem.prototype.Update = function()
{
  for(var i = 0  ; i < this.particleList.length ; i++){
    for(var j in this.planeList){
      this.PlaneCollisionDetection(this.particleList[i], this.planeList[j]);
    }

    for(var k = i+1 ; k < this.particleList.length ; k++){
      this.ParticleCollisionDetection(this.particleList[i], this.particleList[k]);
    }
    this.particleList[i].Update();
  }
}

E_ParticleSystem.prototype.PlaneCollisionDetection = function(object, plane)
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

E_ParticleSystem.prototype.OnCollision = function(object, plane, colPoint)
{
  //Check if Local Collision Occurs
  var normal = plane.GetNormal();

  var Vn = normal.clone().multiplyScalar(object.velocity.clone().dot(normal));

  var Vt = object.velocity.clone().sub(Vn.clone());
  //console.log(Vn.length());

  var Vnp = Vn.clone().multiplyScalar(-1 * object.elasticity);
  if(Vnp.y < 2){
    Vnp.y = 0.0;
  }
  var V = Vnp.clone().add(Vt);

  object.position.set(colPoint.x, colPoint.y, colPoint.z);
  object.velocity.set(V.x, V.y, V.z);

  //plane.material.color = object.material.color;
}

E_ParticleSystem.prototype.ParticleCollisionDetection = function(objectA, objectB)
{
  if(!objectA instanceof E_Particle || !objectB instanceof E_Particle ) return;

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



module.exports = E_ParticleSystem;
