var l_bullet = new Array();

function Bullet(bulletPosition){
  //init position
  this.body = new Physijs.SphereMesh(new THREE.SphereGeometry( 1, 16, 16 ), cannon_material, 10);
  this.body.position.set(bulletPosition.x, bulletPosition.y, bulletPosition.z);
  this.body.castShadow = true;
  this.t_start = clock.start();
}

Bullet.prototype.Generate = function(){
  this.shootingForce = 3000;
  scene.add(this.body);
  l_bullet.push(this);

  this.effect = this.body.position.clone().sub(camera.position).normalize().multiplyScalar(this.shootingForce);
  this.offset = this.body.position.clone().sub(camera.position);
  this.body.applyImpulse(this.effect, this.offset);   //apply impulse
  this.body.setCcdMotionThreshold(0.3);
};

Bullet.prototype.Render = function(){
  this.delta = clock.getElapsedTime();
    if(this.delta > 3){
      this.Remove();
  }
}

Bullet.prototype.Remove = function(){
    l_bullet.shift();
    scene.remove(this.body);
}


function setTargetPosition(event){ // mouse clicked
  var bulletPosition;
  var screenPoint = new THREE.Vector3(
    ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1,
    -( ( event.clientY / renderer.domElement.clientHeight ) * 2 - 1 ),
    1
    );

  screenPoint.unproject(camera);
  screenPoint.sub(camera.position).normalize();
  bulletPosition = camera.position.clone().add(screenPoint.multiplyScalar(0.1));

  var bullet = new Bullet(bulletPosition);
  bullet.Generate();
}
