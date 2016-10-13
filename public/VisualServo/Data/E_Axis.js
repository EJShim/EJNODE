function E_Axis()
{
  THREE.Mesh.call(this);
  this.geometry = new THREE.SphereGeometry( 1, 5, 5 );
  this.material = new THREE.MeshBasicMaterial({color: 0xffff00});

  xGeo = new THREE.Geometry();
  xGeo.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0));
  xMat = new THREE.LineBasicMaterial({color:0xff0000, linewidth:3});
  var xAxis  = new THREE.Line(xGeo, xMat);

  yGeo = new THREE.Geometry();
  yGeo.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10, 0));
  yMat = new THREE.LineBasicMaterial({color:0x00ff00, linewidth:3});
  var yAxis  = new THREE.Line(yGeo, yMat);

  zGeo = new THREE.Geometry();
  zGeo.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 10));
  zMat = new THREE.LineBasicMaterial({color:0x0000ff,  linewidth:3});
  var zAxis  = new THREE.Line(zGeo, zMat);

  this.add(xAxis);
  this.add(yAxis);
  this.add(zAxis);
}


E_Axis.prototype = Object.create(THREE.Mesh.prototype);
