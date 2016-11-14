function E_MeshManager(Mgr)
{
  this.Mgr = Mgr;

  this.m_meshList = [];
  this.m_selectedMeshIdx = -1;
}

E_MeshManager.prototype.ImportMesh = function(path, name)
{
  //Extract Geometry From the Path
  var that = this;
  var loader = new THREE.STLLoader();

  loader.load( path, function(geometry){
    that.LoadMesh(geometry, name);
  } );
}

E_MeshManager.prototype.LoadMesh = function(geometry, name)
{
  if(name == null) name = "mesh_unnamed";

  //var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  var material = new THREE.MeshPhongMaterial({color:0xff0000, shading:THREE.SmoothShading, shininess:30, specular:0xaaaaaa});
  material.side = THREE.DoubleSide;
  material.color = new THREE.Color(Math.random(), Math.random(), Math.random());

  var mesh = new THREE.Mesh(geometry, material);

  //Add Mesh
  this.AddMesh(mesh);

  //Add To Tree
  $$("ID_VIEW_TREE").add({value:name}, this.m_meshList.length, "ID_TREE_MESH");
}

E_MeshManager.prototype.AddMesh = function(mesh)
{
  var scene = this.Mgr.GetRenderer(0).scene;
  this.m_meshList.push(mesh);
  scene.add(mesh);



  this.Mgr.ResetCamera();
  this.Mgr.Redraw();
}

E_MeshManager.prototype.GetCenter = function(mesh)
{
  //Real Center Position of Mesh
  mesh.geometry.computeBoundingBox();
  var boundingBox = mesh.geometry.boundingBox;
  var position = new THREE.Vector3();

  position.subVectors( boundingBox.max, boundingBox.min );
  position.multiplyScalar( 0.5 );
  position.add( boundingBox.min );
  position.applyMatrix4( mesh.matrixWorld );

  return position;
}

module.exports = E_MeshManager;
