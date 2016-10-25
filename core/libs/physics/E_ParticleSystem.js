var E_Particle = require("./E_Particle.js");
var E_FinitePlane = require("./E_FinitePlane.js");
var E_SpringDamper = require("./E_SpringDamper.js");

function E_ParticleSystem(Mgr)
{
  this.Manager = Mgr;

  this.particleList = [];
  this.SAPList = [[], [], []];

  this.planeList = [];
  this.springList = [];
}

E_ParticleSystem.prototype.add = function( object )
{
  if(object instanceof E_Particle){
    this.particleList.push(object);

    for(var i in this.SAPList){
      this.SAPList[i].push(this.particleList.length);
      this.SAPList[i].push(-this.particleList.length);
    }

    this.Manager.SetLog("Number of Particles : " + this.particleList.length);
  }
  else if(object instanceof E_FinitePlane){
    this.planeList.push(object);
  }else if(object instanceof E_SpringDamper){
    this.springList.push(object);
  }else{
    return;
  }
}


E_ParticleSystem.prototype.remove = function( object )
{
  if(object instanceof E_Particle){
    var idx = this.particleList.indexOf(object);
    this.particleList.splice(idx, 1);

    for(var i in this.SAPList){
      var sapidx = this.SAPList[i].indexOf(idx+1);
      var sapidx2 = this.SAPList[i].indexOf(-idx-1);


      this.SAPList[i].splice(sapidx, 1);
      this.SAPList[i].splice(sapidx2, 1);

      for(var j in this.SAPList[i]){
        if(this.SAPList[i][j] > 0 && this.SAPList[i][j] > idx+1){
          this.SAPList[i][j] -= 1;
        }else if(this.SAPList[i][j] < 0 && this.SAPList[i][j] < -idx-1){
          this.SAPList[i][j] += 1;
        }
      }
    }
    this.Manager.SetLog("Number of Particles : " + this.particleList.length);
  }else if(object instanceof E_FinitePlane){
    var idx = this.planeList.indexOf(object);
    this.planeList.splice(idx, 1);
  }else if(object instanceof E_SpringDamper){
    var idx = this.springList.indexOf(object);
    this.springList.splice(idx, 1);
  }
}

E_ParticleSystem.prototype.GetSign = function(num){
  if(num >= 0) return 1;
  else return -1;
}

E_ParticleSystem.prototype.InsertionSort = function()
{
  var list = this.SAPList[0];
  var length = this.particleList.length * 2;

  for(var i=1 ; i<length ; i++){
    var temp = list[i];


    var t = this.particleList[ Math.abs(list[i])-1 ].position.x + this.GetSign(list[i]) * this.particleList[ Math.abs(list[i])-1 ].radius;
    var j = i-1;

    while(j>=0 && this.particleList[ Math.abs(list[j])-1 ].position.x + this.GetSign(list[j]) * this.particleList[ Math.abs(list[j])-1 ].radius > t){
      list[j+1] = list[j];
      j--;
    }

    list[j+1] = temp;
  }


  //Y axiss
  list = this.SAPList[1];

  for(var i=1 ; i<length ; i++){
    var temp = list[i];

    var t = this.particleList[ Math.abs(list[i])-1 ].position.y + this.GetSign(list[i]) * this.particleList[ Math.abs(list[i])-1 ].radius;
    var j = i-1;

    while(j>=0 && this.particleList[ Math.abs(list[j])-1 ].position.y + this.GetSign(list[j]) * this.particleList[ Math.abs(list[j])-1 ].radius > t){
      list[j+1] = list[j];
      j--;
    }

    list[j+1] = temp;
  }

  //Z axis
  list = this.SAPList[2];

  for(var i=1 ; i<length ; i++){
    var temp = list[i];

    var t = this.particleList[ Math.abs(list[i])-1 ].position.z + this.GetSign(list[i]) * this.particleList[ Math.abs(list[i])-1 ].radius;
    var j = i-1;

    while(j>=0 && this.particleList[ Math.abs(list[j])-1 ].position.z + this.GetSign(list[j]) * this.particleList[ Math.abs(list[j])-1 ].radius > t){
      list[j+1] = list[j];
      j--;
    }

    list[j+1] = temp;
  }
}

E_ParticleSystem.prototype.SAPCollision = function()
{
  //Sweep And Prune Algorithm
  for(var k=0 ; k<3 ; k++){
    var list = this.SAPList[k];
    var activeList = [];

    for(var i in list){
      if(list[i] < 0){
        activeList.push( this.particleList[ Math.abs(list[i])-1 ] );
      }else{
        if(activeList.length > 2){
          for(var j=1 ; j<activeList.length ; j++){
            this.ParticleCollisionDetection(activeList[ 0 ], activeList[ j ]);
          }
        }
        activeList.shift();
      }
    }


  }


  //console.log(list);

}

E_ParticleSystem.prototype.Update = function()
{
  if(this.particleList.length < 1) return;
  this.InsertionSort();
  this.SAPCollision();

  for(var i = 0  ; i < this.particleList.length ; i++){

      //Update Plane Collision
      for(var j in this.planeList){
        this.PlaneCollisionDetection(this.particleList[i], this.planeList[j]);
      }


    // for(var k = i+1 ; k < this.particleList.length ; k++){
    //   this.ParticleCollisionDetection(this.particleList[i], this.particleList[k]);
    // }
  }


  for(var i=0 ; i<this.particleList.length ; i++){
    this.particleList[i].Update();
  }

  for(var i=0 ; i<this.springList.length ; i++){
    this.springList[i].Update();
  }
}

E_ParticleSystem.prototype.SweepAndPrune = function()
{
  //Selection Sort X


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
    //Normal
    var n = posB.clone().sub(posA).normalize();
    var curVel = (objectB.velocity.clone().sub(objectA.velocity).dot(n) );


    //Elasticity
    var avgElasticity = (objectA.elasticity + objectB.elasticity) / 2;
    var e = avgElasticity;


    //use Z* 20 instead of curVel;

    //J-Impulse, E-force
    var j = (1+e)*(objectA.mass*objectB.mass) * z * 60/ (objectA.mass+objectB.mass);
    var E = n.clone().multiplyScalar( j );



    //Apply Impulse
    objectA.ApplyImpulse(E)
    objectB.ApplyImpulse(E.multiplyScalar(-1));

    objectB.m_bCollided = true;
  }
}



module.exports = E_ParticleSystem;
