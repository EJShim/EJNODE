function E_Particle(Mgr, radius){
  THREE.Mesh.call(this);

  if(radius == null) radius = 15;
  this.radius = radius;
  this.geometry = new THREE.SphereGeometry(radius, 32, 32);
  this.material = new THREE.MeshPhongMaterial({color: 0xffff00});


  this.Manager = Mgr;
  //Physics
  this.timeStep = 0; //Dt

  //For forward and backward dynamics
  this.prevTime = 0;

  //Dynamics
  this.acceleration = new THREE.Vector3(0.0, 0.0, 0.0);
  this.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
  this.mass = 1;

  this.elasticity = 0.7;

  //Informations
  this.startTime = new Date();
  this.elapsedTime = 0;

  //Position Fix
  this.m_colorFixed = false;
  this.m_bFixed = false;

  this.m_bCollided = false;
}
E_Particle.prototype = Object.create(THREE.Mesh.prototype);

E_Particle.prototype.ApplyForce = function(force)
{
  //a = f/m;

  if(this == this.Manager.m_selectedMesh) return;
  //this.acceleration.add(force.divideScalar(this.mass));
  this.acceleration.add(force.divideScalar(this.mass) );
}

E_Particle.prototype.ApplyImpulse = function(force)
{
  //a = f/m;
  if(this == this.Manager.m_selectedMesh) return;
  //this.acceleration.add(force.divideScalar(this.mass));
  var acc = new THREE.Vector3(0, 0, 0);
  acc.add(force.divideScalar(this.mass));
  this.velocity.add(acc.clone().multiplyScalar(1));
}


E_Particle.prototype.Update = function()
{
  if(!this.visible) {
    this.Manager.GetScene().remove(this);
    return;
  }

  if(this.prevTime == 0) this.prevTime = this.startTime;
  var currentTime = new Date();
  this.timeStep = (currentTime - this.prevTime) / 1000;
  if(this.timeStep > this.Manager.interval / 1000) this.timeStep = this.Manager.interval / 1000;
  this.elapsedTime = (currentTime - this.startTime) / 1000;
  if(this.m_bFixed) {
    this.material.color = new THREE.Color(0.2, 0.2, 0.2);
    return;
  }


    //Gravity
    var gravity = this.Manager.GetGravity();
    if(gravity.length() > 0){
      this.ApplyForce(gravity.multiplyScalar(this.mass ));
    }


  //Set Velocity and Update Position
  this.velocity.add(this.acceleration.clone().multiplyScalar(this.timeStep));
  this.position.add(this.velocity.clone().multiplyScalar(this.timeStep) );

  //***FOR FUN***
  if(!this.m_colorFixed){
    var velcol = new THREE.Vector3(1.0).sub(this.velocity.clone()).normalize();
    //if(velcol.length < 1.0) velcol.normalize();
    this.material.color = new THREE.Color(velcol.x, velcol.y, velcol.z);
  }

  //Set Accleration 0 every iteration
  this.prevTime = currentTime;
  this.acceleration = new THREE.Vector3(0, 0, 0);
  this.m_bCollided = false;
}



E_Particle.prototype.GetPosition = function()
{
  return this.position;
}

E_Particle.prototype.GetNextPosition = function()
{
  var tempVel = this.velocity.clone();
  tempVel.add( this.acceleration.clone().multiplyScalar(this.Manager.interval/1000) );
  return this.position.clone().add(tempVel.clone().multiplyScalar(this.Manager.interval/1000));
}
