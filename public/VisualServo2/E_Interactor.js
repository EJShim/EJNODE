function E_Interactor(Mgr)
{
  this.Manager = Mgr;

  this.m_bDown = false;
  this.m_bRDown = false;
  this.m_keyCode = -1;

  this.prevPosition = new THREE.Vector2(0, 0);
  this.v2Delta = new THREE.Vector2(0, 0);
}

E_Interactor.prototype.onMouseDown = function(event)
{
  this.m_bDown = true;

  var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;


  //Store Position;
  this.prevPosition.x = mouseX;
  this.prevPosition.y = mouseY;
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
  if(!this.m_bDown) return;

  //Get Current position
  var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  var currentPosition = new THREE.Vector2(mouseX, mouseY);

  this.v2Delta = currentPosition.clone().sub(this.prevPosition.clone());

  this.prevPosition = currentPosition;
}

E_Interactor.prototype.onKeyboardDown = function(event)
{
  this.m_keyCode = event.keyCode;
}

E_Interactor.prototype.onKeyboardUp = function(event)
{
  if(this.m_keyCode == 80) {

    this.Manager.ToggleModeCalibration(!this.Manager.m_bCalibration);
  }
  this.Manager.Redraw();

  this.m_keyCode = -1;
}

E_Interactor.prototype.Update = function()
{
  if(this.m_keyCode != -1){
    this.HandleKeyEvent();
  }

  if(this.v2Delta.length() != 0.0){
    this.HandleMouseMove();
    this.v2Delta = new THREE.Vector2();
  }

}

E_Interactor.prototype.HandleMouseMove = function()
{
  var camera = this.Manager.GetCamera(this.Manager.VIEW_CAM);

  var xComp = new THREE.Vector2(this.v2Delta.x, 0);
  var yComp = new THREE.Vector2(0, this.v2Delta.y);
  var theta = xComp.clone().add(yComp).length();

  var xEul = new THREE.Vector3(0, -this.v2Delta.x, 0);
  var yEul = new THREE.Vector3(this.v2Delta.y, 0, 0);
  var axis = xEul.clone().add(yEul).normalize();

  var mat = camera.matrix.clone()
  mat.multiply(new THREE.Matrix4().makeRotationAxis(axis , theta));
  camera.rotation.setFromRotationMatrix(mat);
  this.Manager.Redraw();
}

E_Interactor.prototype.HandleKeyEvent = function()
{
  var camera = this.Manager.GetCamera(this.Manager.VIEW_CAM);
  var mat = camera.matrix.clone();


  switch (this.m_keyCode) {
    case -1:
      return;
    break;
    case 67: // c
      mat.multiply(new THREE.Matrix4().makeTranslation(0, 0, 1));
      camera.position.setFromMatrixPosition(mat);
      camera.userData.axis.matrix.copy(mat);
    break;
    case 32: // Space key
      mat.multiply(new THREE.Matrix4().makeTranslation(0, 0, -1));
      camera.position.setFromMatrixPosition(mat);
      camera.userData.axis.matrix.copy(mat);
    break;
    case 87: // W Key
      mat.multiply(new THREE.Matrix4().makeTranslation(0, 1, 0));
      camera.position.setFromMatrixPosition(mat);
      camera.userData.axis.matrix.copy(mat);
    break;
    case 83: // S key
      mat.multiply(new THREE.Matrix4().makeTranslation(0, -1, 0));
      camera.position.setFromMatrixPosition(mat);
      camera.userData.axis.matrix.copy(mat);
    break;
    case 65: // A key
      mat.multiply(new THREE.Matrix4().makeTranslation(-1, 0, 0));
      camera.position.setFromMatrixPosition(mat);
      camera.userData.axis.matrix.copy(mat);
    break;
    case 68: // D Key
      mat.multiply(new THREE.Matrix4().makeTranslation(1, 0, 0));
      camera.position.setFromMatrixPosition(mat);
      camera.userData.axis.matrix.copy(mat);
    break;
    case 81: // Q
      mat.multiply(new THREE.Matrix4().makeRotationZ(0.01));
      camera.rotation.setFromRotationMatrix(mat);
      camera.userData.axis.matrix.copy(mat);

    break;
    case 69: // E Key
      mat.multiply(new THREE.Matrix4().makeRotationZ(-0.01));
      camera.rotation.setFromRotationMatrix(mat);
      camera.userData.axis.matrix.copy(mat);
    break;


    default:
    break;
  }


  //Handle Mouse Move
      this.Manager.Redraw();

}


//Event Handlers
$("#viewport1").mousedown(function(event){
  Manager.GetInteractor().onMouseDown(event);
});

$("#viewport1").mousemove(function(event){
  Manager.GetInteractor().onMouseMove(event);
});

$(window).mouseup(function(event){
  Manager.GetInteractor().onMouseUp(event);
});

$(window).keydown(function(event){
  Manager.GetInteractor().onKeyboardDown(event);
});

$(window).keyup(function(event){
  Manager.GetInteractor().onKeyboardUp(event);
});
