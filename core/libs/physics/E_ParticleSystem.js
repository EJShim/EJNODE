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
    this.Manager.SetLog("Number of Particles : " + this.particleList.length);
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
    this.Manager.SetLog("Number of Particles : " + this.particleList.length);
  }else if(object instanceof E_FinitePlane){
    var idx = this.planeList.indexOf(object);
    this.planeList.splice(idx, 1);
  }
}


E_ParticleSystem.prototype.Update = function()
{

  for(var a = 0 ; a < 3 ; a++){
    for(var i = 0  ; i < this.particleList.length ; i++){
      if(a == 0){
        for(var j in this.planeList){
          this.PlaneCollisionDetection(this.particleList[i], this.planeList[j]);
        }
      }

      for(var k = i+1 ; k < this.particleList.length ; k++){
        this.ParticleCollisionDetection(this.particleList[i], this.particleList[k]);
      }
    }
  }

  for(var i=0 ; i<this.particleList.length ; i++){
    this.particleList[i].Update();
  }
}

E_ParticleSystem.prototype.PlaneCollisionDetection = function(object, plane)
{

  // if(!colPoint){
  //   //Intersection with next position - in case of fast movement of the particl
  var colPoint = this.IsPlaneObjectCollisionOccured(plane, object, true );
  if(!colPoint){
    var colPoint = this.IsPlaneObjectCollisionOccured(plane, object, false);
  }

  if(!colPoint){
    return
  }else{
    this.OnCollision(object, plane, colPoint);
  }

}

E_ParticleSystem.prototype.IsPlaneObjectCollisionOccured = function(plane, object, nextPosition)
{
  if(!plane instanceof E_FinitePlane || !object instanceof E_Particle){
    console.error("not proper type");
    return;
  }

  var p = plane.geometry.vertices[0];
  var q = plane.geometry.vertices[1];
  var r = plane.geometry.vertices[2];

  var n = plane.GetNormal();
  var chk = n.clone().dot(object.velocity.clone().normalize());
  if(chk < 0) n.multiplyScalar(-1);

  var nP, curP;


  if(nextPosition){
    nP = object.GetNextPosition().clone().add( n.clone().multiplyScalar(object.radius) ) ;
    curP = object.GetPosition().clone().add( n.clone().multiplyScalar(object.radius) ) ;
  }else{
    curP = object.GetPosition();
    nP = curP.clone().add( n.clone().multiplyScalar(object.radius) ) ;
  }

  var u = q.clone().sub(p);
  var v = r.clone().sub(p);

  var a = curP.clone().sub(nP);
  var b = curP.clone().sub(p);

  var Const = 1 / (u.clone().cross(v.clone()).dot(a));

  var s = Const * (a.clone().cross(b.clone()).dot(v));
  var t = Const * -1 * (a.clone().cross(b.clone()).dot(u));
  var l = Const * (u.clone().cross(v.clone()).dot(b));


  if(s >= 0 && t >= 0  && l >= 0 && l <= 1 && s+t <= 1) { //if collision occured
    // intersected point on the plane

    var v = nP.clone().sub(p);
    var dist = n.clone().dot(v);

    if(dist < 0) dist *= -1;
    else n.multiplyScalar(-1);

    var cP = plane.GetPlaneEquation(s, t);
    var length = nP.clone().sub(cP).length();
    return cP.add(n.clone().multiplyScalar( object.radius ) );
  }
  else return false;
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

  //penetration
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
    //this.Manager.SetLog( Math.abs(z) * 1000 / (objectA.radius + objectB.radius) );
    var Uminus = (objectB.velocity.clone().sub(objectA.velocity).dot(n) );
    var e = Math.abs(z) * 300 / (objectA.radius + objectB.radius);

    var j = (1+e)*(objectA.mass*objectB.mass / (objectA.mass+objectB.mass) )
    var E = n.clone().multiplyScalar(j);

    var velA = objectA.velocity.clone();
    var velB = objectB.velocity.clone();

    velA.sub(n.clone().multiplyScalar(j/objectA.mass));
    velB.add(n.clone().multiplyScalar(j/objectB.mass));

    objectA.velocity.set(velA.x, velA.y, velA.z);
    objectB.velocity.set(velB.x, velB.y, velB.z);


    //objectB.ApplyImpulse(E)
    //objectA.ApplyImpulse(E.multiplyScalar(-1));

    objectB.m_bCollided = true;
  }
}



module.exports = E_ParticleSystem;
