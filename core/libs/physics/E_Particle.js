function E_Particle(Mgr, radius){
  THREE.Mesh.call(this);

  if(radius == null) radius = 15;
  this.radius = radius;
  this.geometry = new THREE.SphereGeometry(radius, 32, 32);
  this.material = new THREE.MeshPhongMaterial({color: 0xffff00, shininess:80});


  this.Manager = Mgr;


  //Dynamics
  this.acceleration = new THREE.Vector3(0.0, 0.0, 0.0);
  this.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
  this.mass = radius * 10;

  this.elasticity = 0.1;

  //Informations
  this.lifeSpan = 30000000000000;
  this.startTime = new Date();

  //For Hair Simulation
  this.connectedObject = [];

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
  this.velocity.add(acc);
}

E_Particle.prototype.HairSimulation2 = function()
{
  var pN = this.connectedObject[0].position.clone();
  var cN = this.position.clone();
  var nN = this.connectedObject[1].position.clone();

  var cosTheta = pN.clone().sub(cN).normalize().dot( nN.clone().sub(cN).normalize() );
  var theta = Math.acos(cosTheta);
  var sinTheta = Math.sin(theta);

  //avoid Singularity
  if(sinTheta == 0) sineTheta = 0.01;

  var ThetaD = ( (pN.clone().sub(cN).normalize().multiplyScalar(cosTheta)).sub( nN.clone().sub( pN ).normalize() ) ).multiplyScalar(1/( sinTheta * ( pN.clone().sub(cN).length())));
  var force = ThetaD.multiplyScalar(-30)
  this.ApplyForce( force )
}

E_Particle.prototype.HairSimulation = function()
{
  var prevIdx = this.connectedObject[0].connectedObject.indexOf(this);
  var nextIdx = this.connectedObject[1].connectedObject.indexOf(this);

  var ppN = this.connectedObject[0].connectedObject[ !prevIdx^0 ].position.clone();
  var pN = this.connectedObject[0].position.clone();
  var cN = this.position.clone();
  var nN = this.connectedObject[1].position.clone();
  var nnN = this.connectedObject[1].connectedObject[ !nextIdx^0 ].position.clone();


  var Tc = this.GetTangent(pN, cN, nN);


  var TpP = this.GetTangentPrime(ppN, pN, cN);
  var TcP = this.GetTangentPrime(pN, cN, nN);
  var TnP = this.GetTangentPrime(cN, nN, nnN);


  var TSecondPrime = TcP.clone().sub(TpP).divideScalar( nN.clone().add(cN).sub(pN).sub(ppN).length() ).add( TnP.clone().sub(TcP).divideScalar( nnN.clone().add(nN).sub(cN).sub(pN) )).multiplyScalar(2);

  //Curvature
  var K = TcP.clone().length();
  //Torsion
  var Tor = Tc.clone().dot( TcP.clone().cross( TSecondPrime ) ) / Math.pow(K, 2);


}

E_Particle.prototype.GetTangent = function(prevNode, currentNode, nextNode)
{
  return nextNode.clone().sub(prevNode).divideScalar(nextNode.clone().sub(currentNode).length() + currentNode.clone().sub(prevNode).length() );
}

E_Particle.prototype.GetTangentPrime = function(Xp, Xc, Xn)
{
  return ( Xn.clone().sub(Xc).normalize().sub( Xc.clone().sub(Xp).normalize() )  ).multiplyScalar(2/( Xn.clone().sub(Xp).length() ));
}



E_Particle.prototype.Update = function()
{
  if(!this.visible) {
    this.Manager.particleList().remove(this);
    this.Manager.GetScene().remove(this);
    return;
  }

  if(this.m_bFixed) {
    this.material.color = new THREE.Color(0.2, 0.2, 0.2);
    return;
  }


  //Hair Simulation
  if(this.connectedObject.length == 2){
    this.HairSimulation2();
  }


  var timeStep = this.Manager.timeStep;
  //Set Velocity and Update Position
  this.velocity.add(this.acceleration.clone().multiplyScalar(timeStep));
  this.position.add(this.velocity.clone().multiplyScalar(timeStep) );

  //***FOR FUN***
  if(!this.m_colorFixed){
    var velcol = new THREE.Vector3(1.0).sub(this.velocity.clone()).normalize();
    //if(velcol.length < 1.0) velcol.normalize();
    this.material.color = new THREE.Color(velcol.x, velcol.y, velcol.z);
  }

  //Set Initial Acceleration
  this.acceleration = new THREE.Vector3(0, 0, 0);
  var gravity = this.Manager.GetGravity();
  if(gravity.length() > 0){
    this.ApplyForce(gravity.multiplyScalar(this.mass ));
  }

  this.m_bCollided = false;


  //Remove Particle When
  if(new Date() - this.startTime > this.lifeSpan || this.position.y < -10){
    this.Manager.GetScene().remove(this);
    this.Manager.ParticleSystem().remove(this);
  }
}



E_Particle.prototype.GetPosition = function()
{
  return this.position;
}

E_Particle.prototype.GetNextPosition = function()
{
  var tempVel = this.velocity.clone();
  tempVel.add( this.acceleration.clone().multiplyScalar(this.Manager.timeStep) );
  return this.position.clone().add(tempVel.clone().multiplyScalar(this.Manager.timeStep));
}

module.exports = E_Particle;
