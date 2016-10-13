function E_Interactor(Mgr)
{
  this.Manager = Mgr;

  this.m_bDown = false;
  this.m_bRDown = false;

  this.m_keyCode = -1;

  this.prevPosition = new THREE.Vector2(0, 0);
}

E_Interactor.prototype.onMouseDown = function(event)
{
  this.m_bDown = true;

  var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  this.Manager.GenerateObjectScreen(mouseX, mouseY);
}

E_Interactor.prototype.onMouseUp = function(event)
{
  this.m_bDown = false;
}

E_Interactor.prototype.onMouseRDown = function(event)
{
}

E_Interactor.prototype.onMouseRUp = function(event)
{

}

E_Interactor.prototype.onMouseMove = function(event)
{

}

E_Interactor.prototype.onKeyboardDown = function(event)
{
  this.m_keyCode = event.keyCode;

  if(this.m_keyCode == 32){
    this.Manager.ResetGround();
  }
}

E_Interactor.prototype.onKeyboardUp = function(event)
{
  this.m_keyCode = -1;
}

E_Interactor.prototype.Update = function()
{

  var camera = this.Manager.GetCamera();
  var camDir = new THREE.Vector3(0, 0, 0);
  camera.getWorldDirection(camDir);
  var camUp = camera.up.clone();

  var sideDir = camUp.cross(camDir.clone());
  switch (this.m_keyCode) {
    case -1:
      return;
    break;
    case 87: // W Key
      var nextPosition = camera.position.clone().add(camDir.clone().multiplyScalar(0.1));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    case 83: // S key
      var nextPosition = camera.position.clone().sub(camDir.clone().multiplyScalar(0.1));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    case 65: // A key
      var nextPosition = camera.position.clone().add(sideDir.multiplyScalar(0.1));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    case 68: // D Key
      var nextPosition = camera.position.clone().sub(sideDir.multiplyScalar(0.1));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    default:
    break;
  }
}


//Event Handlers
$("#viewport").mousedown(function(event){
  Manager.GetInteractor().onMouseDown(event);
});

$("#viewport").mousemove(function(event){
  Manager.GetInteractor().onMouseMove(event);
});

$("#viewport").mouseup(function(event){
  Manager.GetInteractor().onMouseUp(event);
});


$("#viewport").bind('touchstart', function(event) {
  Manager.GetInteractor().onMouseDown(event.originalEvent.touches[0]);
});

$("#viewport").bind('touchmove', function(event) {
  Manager.GetInteractor().onMouseMove(event.originalEvent.touches[0]);
  event.preventDefault();
});
$("#viewport").bind('touchend', function(event) {
  Manager.GetInteractor().onMouseUp(event.originalEvent.touches[0]);
 });

$(window).keydown(function(event){
  Manager.GetInteractor().onKeyboardDown(event);
});

$(window).keyup(function(event){
  Manager.GetInteractor().onKeyboardUp(event);
});
