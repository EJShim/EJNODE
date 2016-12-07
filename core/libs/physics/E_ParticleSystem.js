var E_Particle = require("./E_Particle.js");
var E_ParticleSource = require("./E_ParticleSource.js");
var E_FinitePlane = require("./E_FinitePlane.js");

var E_SpringDamper = require("./E_SpringDamper.js");
var E_SpringDamperSource = require("./E_SpringDamperSource.js");

var E_Fabric2 = require("./E_Fabric2.js");

//Matrix
var Sushi = require("../Matrix/sushi.js");

function E_ParticleSystem(Mgr)
{
  this.Manager = Mgr;
  this.m_bInitialized = false;

  this.particleList = [];
  this.SAPList = [[], [], []];
  this.collisionMap = [];

  this.planeList = [];
  this.springList = [];
  this.fabricList = [];


  //Matrix
  ///Mass Matrix
  this.M = null;

  ///K matrix
  this.K = null;

  ///C Matrix
  this.C = null;

  this.P = null;
  this.V = null;
  this.A = null;


  //K hat Inverse
  this.invK = null;
}

E_ParticleSystem.prototype.CompleteInitialize = function()
{
  this.m_bInitialized = true;
  this.UpdateConnectivityMatrix();
}

E_ParticleSystem.prototype.add = function( object )
{
  if(object instanceof E_Particle || object instanceof E_ParticleSource){
    if(object instanceof E_ParticleSource){
      object.parent = true;
    }
    this.particleList.push(object);

    for(var i in this.SAPList){
      this.SAPList[i].push(this.particleList.length);
      this.SAPList[i].push(-this.particleList.length);
    }

    this.Manager.SetLog("Number of Particles : " + this.particleList.length);
  }
  else if(object instanceof E_FinitePlane){
    this.planeList.push(object);
  }else if(object instanceof E_SpringDamper || object instanceof E_SpringDamperSource){
    this.springList.push(object);
  }else if(object instanceof E_Fabric2){

    this.fabricList.push(object);

  }else{
    return;
  }

  this.UpdateConnectivityMatrix();
}


E_ParticleSystem.prototype.remove = function( object )
{
  if(object instanceof E_Particle || object instanceof E_ParticleSource){
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
  }else if(object instanceof E_SpringDamper || object instanceof E_SpringDamperSource){
    var idx = this.springList.indexOf(object);
    this.springList.splice(idx, 1);
  }

  this.UpdateConnectivityMatrix();
}

E_ParticleSystem.prototype.UpdateConnectivityMatrix = function()
{
  if(!this.m_bInitialized) return;

  var len = this.particleList.length;
  if(len == 0) return;

  var kValue = 4;
  var cValue = 0.4;

  var conMatrix = [];
  var massMatrix = [];
  var kMatrix = [];
  var cMatrix = [];

  conMatrix.length = len * 3;
  massMatrix.length = len* 3;
  kMatrix.length = len * 3;
  cMatrix.length = len * 3;

  //Initialzie Matrix 3N x 3N
  for(var i=0 ; i<len*3 ; i++){
    conMatrix[i] = [];
    massMatrix[i] = [];
    kMatrix[i] = [];
    cMatrix[i] = [];

    for(var j=0 ; j<len*3 ; j++){
      conMatrix[i].push(0);
      massMatrix[i].push(0);
      kMatrix[i].push(0);
      cMatrix[i].push(0);
    }
  }

  for(var i=0 ; i<len ; i++){
    //Build Connectivity, Mass, K, C Matrix
    var particle = this.particleList[i];
    var numConObj = particle.connectedObject.length;

    if(numConObj != 0){
      for(var j=0 ; j<numConObj ; j++){
          var idx = this.particleList.indexOf(particle.connectedObject[j]);

          conMatrix[i][idx] = -1;
          conMatrix[i + len][ idx + len ] = -1;
          conMatrix[i + len*2][ idx + len*2 ] = -1;
      }
    }

    conMatrix[i][i] = numConObj;
    conMatrix[i + len][i + len] = numConObj;
    conMatrix[i + len*2][i + len*2] = numConObj;

    massMatrix[i][i] = this.particleList[i].mass;
    massMatrix[i + len][i + len] = this.particleList[i].mass;
    massMatrix[i + len*2][i + len*2] = this.particleList[i].mass;


    //Kvalue (temp)

    kMatrix[i][i] = kValue;
    kMatrix[i+len][i+len] = kValue;
    kMatrix[i+len*2][i+len*2] = kValue;

    //cValue (temp, damper)

    cMatrix[i][i] = cValue;
    cMatrix[i+len][i+len] = cValue;
    cMatrix[i+len*2][i+len*2] = cValue;
  }

  var connectivityMatrix = Sushi.Matrix.fromArray(conMatrix);
  var mMatrix = Sushi.Matrix.fromArray(massMatrix);
  var kMatrix = Sushi.Matrix.fromArray(kMatrix);
  var cMatrix = Sushi.Matrix.fromArray(cMatrix);

  this.M = Sushi.Matrix.fromArray( massMatrix );
  this.K = connectivityMatrix.clone().times(kValue);
  this.C = connectivityMatrix.clone().times(cValue);

  var timeStep = 1 / this.Manager.interval;
  var a0 = 1/(0.25 * Math.pow(timeStep, 2) );
  var a1 = 0.5/( 0.25 * timeStep );


  var KHat = this.K.clone().add( this.M.clone().times(a0) ).add(this.C.clone().times(a1));
  this.invK = KHat.clone().inverse();
}


E_ParticleSystem.prototype.UpdateCollisionMap = function()
{
  var length = this.particleList.length;

  for(var i=0 ; i<length ; i++){
    this.collisionMap.push(new Array());
    for(var j=0 ; j<length ; j++){
      this.collisionMap[i].push(0);
    }
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
  for(var k=0 ; k<2 ; k++){
    var list = this.SAPList[k];
    var activeList = [];

    for(var i in list){
      if(list[i] < 0){
        //Store Particle Index
        var particleIdx = Math.abs(list[i])-1;
        activeList.push(  particleIdx  );
      }else{
        if(activeList.length > 2){
          for(var j=1 ; j<activeList.length-1 ; j++){
            //if(this.collisionMap[ activeList[0] ][ activeList[j] ] == k){
              //if(k == 2){
                this.ParticleCollisionDetection( this.particleList[ activeList[ 0 ] ], this.particleList[ activeList[ j ] ]);
              //}else{
              //  this.collisionMap[ activeList[0] ][activeList[j]]++;
              //}
            //}
          }
        }
        activeList.shift();
      }
    }
  }
}

E_ParticleSystem.prototype.Update = function()
{
  if(!this.m_bInitialized) return;
  if(this.particleList.length < 1) return;
  // this.InsertionSort();
  // this.UpdateCollisionMap();
  // this.SAPCollision();

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

  //Implicit Method-SpringDamper
  this.ImplicitSpringDamperSystem();


  //Explicit Method-SpringDamper
  // for(var i=0 ; i<this.springList.length ; i++){
  //   this.springList[i].Update();
  // }
  //

  //Update fabricList
  var fablen = this.fabricList.length;
  if(fablen !== 0){
  for(var i=0 ; i<fablen ; i++){
      this.fabricList[i].Update();
  }
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
  if(!plane instanceof E_FinitePlane || !object instanceof E_Particle || !object instanceof E_ParticleSource){
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


  var Vnp = Vn.clone().multiplyScalar(-1 * object.elasticity);
  if(Vnp.y < 2){
    Vnp.y = 0.0;
  }
  var V = Vnp.clone().add(Vt);

  object.position.set(colPoint.x, colPoint.y, colPoint.z);
  object.velocity.set(V.x, V.y, V.z);

}

E_ParticleSystem.prototype.ParticleCollisionDetection = function(objectA, objectB)
{
  if(!objectA instanceof E_Particle || !objectB instanceof E_Particle || !objectA instanceof E_ParticleSource || !objectB instanceof E_ParticleSource ) return;

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

E_ParticleSystem.prototype.ImplicitSpringDamperSystem = function()
{
  if(this.invK == null) return;

  var len = this.particleList.length;

  //Build Position, Velocity, Acceleration Matrix

  //if(this.P == null || this.V == null || this.A == null){
  var arrayP = [];
  var arrayV = [];
  var arrayA = [];

  arrayP.push([]);
  arrayV.push([]);
  arrayA.push([]);

  for(var i=0 ; i<len ; i++){
    arrayP[0].push(this.particleList[i].position.x);
    arrayV[0].push(this.particleList[i].velocity.x);
    arrayA[0].push(this.particleList[i].acceleration.x);
  }

  for(var i=0 ; i<len ; i++){
    arrayP[0].push(this.particleList[i].position.y);
    arrayV[0].push(this.particleList[i].velocity.y);
    arrayA[0].push(this.particleList[i].acceleration.y);
  }

  for(var i=0 ; i<len ; i++){
    arrayP[0].push(this.particleList[i].position.z);
    arrayV[0].push(this.particleList[i].velocity.z);
    arrayA[0].push(this.particleList[i].acceleration.z);
  }

  this.P = Sushi.Matrix.fromArray(arrayP).t();
  this.V = Sushi.Matrix.fromArray(arrayV).t();
  this.A = Sushi.Matrix.fromArray(arrayA).t();

  //}



  var timeStep = 1 / this.Manager.interval;
  var a0 = 1/(0.25 * Math.pow(timeStep, 2) );
  var a1 = 0.5/( 0.25 * timeStep );
  var a2 = 1/(0.25 * timeStep);
  var a3 = 1/( 2* 0.25 ) - 1;
  var a4 = (0.5 / 0.25) - 1;
  var a5 = (timeStep / 2)*((0.5/0.25)-2 );
  var a6 = timeStep * (1 - 0.5);
  var a7 = 0.5 * timeStep;

  var eq1 = Sushi.Matrix.mul(this.M ,  this.P.clone().times(a0).add( this.V.clone().times(a2) ).add( this.A.clone().times(a3) ) );
  var eq2 = Sushi.Matrix.mul(this.C ,  this.P.clone().times(a1).add( this.V.clone().times(a4) ).add( this.A.clone().times(a5) ) );

  var RHat = eq1.add(eq2);

  //Update Position
  var updateP = Sushi.Matrix.mul(this.invK, RHat);

  //Update Acceleration
  var updateA =  updateP.clone().sub( this.P ).times(a0).sub( this.V.clone().times(a2) ).sub( this.A.clone().times(a3) );

  //Update Velocity
  var updateV = this.V.clone().add( this.A.clone().times(a6) ).add( updateA.clone().times(a7) );


  //Update Animation
  for(var i=0 ; i<len ; i++){
    var particle = this.particleList[i];

    if(!particle.m_bFixed){
      particle.position.set( updateP.get(i, 0),  updateP.get(i+len, 0),  updateP.get(i+len*2, 0) );
      particle.velocity.set( updateV.get(i, 0),  updateV.get(i+len, 0),  updateV.get(i+len*2, 0) );
      particle.acceleration.set( updateA.get(i, 0),  updateA.get(i+len, 0),  updateA.get(i+len*2, 0) );
    }

  }


  //Update Scene
  for(var i=0 ; i<this.springList.length ; i++){
    this.springList[i].UpdateConnectivity();

    if(this.springList[i] instanceof E_SpringDamper){
      this.springList[i].UpdateLineShape();
    }
  }
}





module.exports = E_ParticleSystem;
