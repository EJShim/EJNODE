
//Main.js : For Initialize and Event Handling
var Mgr = new E_Manager();
Mgr.Init();

//Event Handling
//Window Resize

var $contextMenu = $("#contextMenu");

document.getElementById('meshButton').onclick = function() {
  document.getElementById('upload-mesh').click();
}

document.getElementById('dicomButton').onclick = function() {
  document.getElementById('upload-dicom').click();
}

$(window).resize(function(){
  Mgr.GetRenderer().setSize(window.innerWidth, window.innerHeight);
  Mgr.GetCamera(VIEW_MAIN).aspect = $("#viewport").width()/$("#viewport").height();

  console.log($("#viewport").width() + ", "+ $("#viewport").height());
  Mgr.GetCamera(VIEW_MAIN).updateProjectionMatrix();
  Mgr.GetControl().handleResize();

  Mgr.GetCamera(VIEW_2D_AXL).left = $("#viewport2").width() / -2;
  Mgr.GetCamera(VIEW_2D_AXL).right =  $("#viewport2").width() / 2;
  Mgr.GetCamera(VIEW_2D_AXL).top = $("#viewport2").height() / 2;
  Mgr.GetCamera(VIEW_2D_AXL).bottom = $("#viewport2").height() / -2;
  Mgr.GetCamera(VIEW_2D_AXL).updateProjectionMatrix();
  Mgr.Redraw();

  //Change Histogram setSize
  Mgr.VolumeManager().UpdateHistogram();
});

//import Mesh
document.getElementById("upload-mesh").addEventListener("change", function (ev) {
  for(var i=0 ; i<ev.target.files.length ; i++){
    var tmppath = URL.createObjectURL(ev.target.files[i]);
    var name = ev.target.files[i].name;
    Mgr.MeshManager().ImportMesh(tmppath, name);
  }
}, false);

document.getElementById("upload-dicom").addEventListener("change", function(ev){
  var buffer = [];
  for(var i=0 ; i<ev.target.files.length ; i++){
    var tmppath = URL.createObjectURL(ev.target.files[i]);
    buffer.push(tmppath);
  }
  Mgr.VolumeManager().ImportVolume(buffer);
});


//control Tree
$(document).on('click', function(){
  $contextMenu.hide();
});

$(document).on('click', '#meshTree button', function(){
  $("#meshTree").focus();
  Mgr.MeshManager().SetSelectedMesh( $(this).index() );
});

$(document).on('contextmenu', '#meshTree button', function(){
  $("#meshTree").focus();
  Mgr.MeshManager().SetSelectedMesh( $(this).index() );
});

$(document).on('dblclick', '#meshTree button', function(){
  var bool = $(this).hasClass('active');
  if(bool){
    $(this).removeClass('active');
    Mgr.GetScene(VIEW_MAIN).add(Mgr.MeshManager().GetSelectedMesh());
  }
  else{
    $(this).addClass('active');
    Mgr.GetScene(VIEW_MAIN).remove(Mgr.MeshManager().GetSelectedMesh());
  }
  Mgr.ResetCamera();
  Mgr.Redraw();
});


$(document).on('click', '#volumeTree button', function(){
  $("#volumeTree").focus();
  Mgr.VolumeManager().SetSelectedVolume( $(this).index() );
  Mgr.VolumeManager().UpdateLut();
});

$(document).on('contextmenu', '#volumeTree button', function(){
  $("#meshTree").focus();
  Mgr.VolumeManager().SetSelectedVolume( $(this).index() );
});

$(document).on('dblclick', '#volumeTree button', function(){
  var bool = $(this).hasClass('active');
  if(bool){
    $(this).removeClass('active');
    Mgr.VolumeManager().GetSelectedVolume().AddToRenderer( Mgr.GetScene(VIEW_MAIN) );
  }
  else{
    $(this).addClass('active');
    Mgr.VolumeManager().GetSelectedVolume().RemoveFromRenderer( Mgr.GetScene(VIEW_MAIN) );
  }
  Mgr.ResetCamera();
  Mgr.Redraw();
});



//Mouse Interaction
$(document).on('click', '#viewport', function(){
  $("#viewport").focus();
});
$(document).on('click', '#viewport2', function(){
  $("#viewport2").focus();
});

// $(document).on('mosuedown', '#histogram', function(e){
//   console.log("Offset XY : " + e.offsetX + "," + e.offsetY);
// })

$('#histogram').mousedown(function(e){
  //console.log(e);
  Mgr.VolumeManager().OnClickedOpacity(e.offsetX, e.offsetY);
});

$(document).mousemove(function(e){
  //console.log(Mgr.VolumeManager().IsOpacitySelected());

  if(Mgr.VolumeManager().m_selectedOpacityIndex != -1){
    //console.log(document.getElementById("histogram").offsetLeft + "");
    //console.log("offset : " + e.offsetX + ", " + e.offsetY);
    //console.log(document.getElementById("histogram"));

    offX = e.clientX - document.getElementById("histogram").offsetLeft;
    offY = e.clientY - document.getElementById("histogram").offsetTop - 52;

    //console.log("cOff : " + offX + "," + offY);
    //console.log("oOff : " + e.offsetX + "," + e.offsetY);
    Mgr.VolumeManager().OnMoveOpacity(offX, offY);
  }
});

$(document).mouseup(function(e){
  //console.log("mouseUP");
  Mgr.VolumeManager().OnReleaseOpacity();
});

//$('#histogram').on('mouseDown', function())

$(document).on('mousewheel DOMMouseScroll', '#viewport2', function(e) {

  var E = e.originalEvent;
  delta = E.wheelDelta;

  Mgr.VolumeManager().MoveIndex(delta);
});


$(document).on('dblclick', '#viewport', function(){
  Mgr.ResetCamera();
});

$(document).on('contextmenu', '#meshTree button', function(event){
  $contextMenu.css({
    display: "block",
    left: event.pageX,
    top: event.pageY
  });
  return false;
});

$(document).on('click', "#contextMenu li", function(){
  var index = $(this).index();

  switch (index) {
    case 0:
    break;
    case 1: //delete mesh
    var idx = Mgr.MeshManager().m_selectedMeshIdx;
    Mgr.MeshManager().RemoveMesh(idx);
    break;
    case 2:
    break;
    case 3:
    break;
    default:

  }
});

//Tree Keydown
$('#meshTree').bind('keydown', function(event) {

  //If you want to check the code from the key
  //console.log(event.keyCode);

  switch(event.keyCode){
    case 8: // Delete Key - Delete Selected Mesh
    var index = Mgr.MeshManager().m_selectedMeshIdx;
    Mgr.MeshManager().RemoveMesh(index);
    break;
    default:
    break;
  }
});

$('#volumeTree').bind('keydown', function(event) {

  //If you want to check the code from the key
  //console.log(event.keyCode);

  switch(event.keyCode){
    case 8: // Delete Key - Delete Selected Mesh
    var index = Mgr.VolumeManager().m_selectedVolumeIdx;
    Mgr.VolumeManager().RemoveVolume(index);
    break;
    default:
    break;
  }
});
