function E_ParticleSource(Mgr){


  this.Manager = Mgr;
  //Physics
  this.timeStep = 0; //Dt
  this.position = new THREE.Vector3(0.0, 0.0, 0.0);
  this.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
  this.acceleration = new THREE.Vector3();
  this.mass = 1;
  this.elasticity = 0.0;

  //Informations
  this.startTime = new Date();
  this.elapsedTime = 0;
  this.prevTime = 0;

  //Position Fix
  this.m_bFixed = false;
}

E_ParticleSource.prototype.ApplyForce = function(force)
{
  //a = f/m;
  if(this == this.Manager.m_selectedMesh) return;
  this.acceleration.add(force.divideScalar(this.mass));
}


E_ParticleSource.prototype.Update = function()
{
  if(this.prevTime == 0) this.prevTime = this.startTime;
  var currentTime = new Date();
  this.timeStep = (currentTime - this.prevTime) / 1000;
  if(this.timeStep > this.Manager.interval / 1000) this.timeStep = this.Manager.interval / 1000;
  this.elapsedTime = (currentTime - this.startTime) / 1000;
  if(this.m_bFixed) {
    return;
  }

  //Gravity
  var gravity = this.Manager.GetGravity();
  if(gravity.length() > 0){
    this.ApplyForce(gravity.multiplyScalar(this.mass));
  }

  //Set Velocity and Update Position
  this.velocity.add(this.acceleration.clone().multiplyScalar(this.timeStep));
  this.position.add(this.velocity.clone().multiplyScalar(this.timeStep) );
  this.prevTime = currentTime;
  this.acceleration = new THREE.Vector3();
}

E_ParticleSource.prototype.GetPosition = function()
{
  return this.position;
}

E_ParticleSource.prototype.GetNextPosition = function()
{
  return this.position.clone().add(this.velocity.clone().multiplyScalar(this.Manager.interval));
}

E_ParticleSource.prototype.ApplyCollision = function(normal)
{
  var Vn = normal.clone().multiplyScalar(this.velocity.clone().dot(normal));
  var Vt = this.velocity.clone().sub(Vn.clone());
  var Vnp = Vn.clone().multiplyScalar(-1 * this.elasticity);
  var V = Vnp.clone().add(Vt);
  this.velocity.set(V.x, V.y, V.z);
}
