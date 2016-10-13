function E_Track()
{
  THREE.Mesh.call(this);
  this.geometry = new THREE.SphereGeometry( 0.2, 5, 5 );
  this.material = new THREE.MeshBasicMaterial({color: 0xff0000});
}


E_Track.prototype = Object.create(THREE.Mesh.prototype);
