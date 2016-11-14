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
  mesh.name = name;

  //Add Mesh
  this.AddMesh(mesh);
}

E_MeshManager.prototype.AddMesh = function(mesh)
{
  var scene = this.Mgr.GetRenderer(0).scene;
  this.m_meshList.push(mesh);
  scene.add(mesh);

  this.Mgr.ResetTreeItems();

  this.Mgr.ResetCamera();
  this.Mgr.Redraw();
}

E_MeshManager.prototype.ShowHide = function(id, show)
{
  if(this.m_meshList.length < 1) return;
  var mesh = this.GetMesh(id);
  var scene = this.Mgr.GetRenderer(this.Mgr.VIEW_MAIN).scene;

  if(show){
    scene.add(mesh);
  }else{
    scene.remove(mesh);

    //Update Tree
  }

  this.Mgr.Redraw();
}

E_MeshManager.prototype.RemoveMesh = function(){

  if(this.m_selectedMeshIdx == -1) return;
  var id = this.m_selectedMeshIdx;
  //Hide Mesh
  this.ShowHide(id, false);

  //Remove From The Mesh List
  this.m_meshList.splice(id, 1);

  if(this.m_meshList.length == 0) this.m_selectedMeshIdx = -1;

  //Remove From Mesh Tree
  this.Mgr.ResetTreeItems();
}

E_MeshManager.prototype.SetSelectedMesh = function(id)
{
  this.m_selectedMeshIdx = id;
}

E_MeshManager.prototype.GetMesh = function(id){
  return this.m_meshList[id];
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
