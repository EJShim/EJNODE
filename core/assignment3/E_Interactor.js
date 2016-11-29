function E_Interactor(Mgr)
{
  this.Manager = Mgr;

  this.m_bDown = false;
  this.m_bRDown = false;
  this.m_bObjectSelected = false;

  this.m_keyCode = -1;

  this.prevPosition = new THREE.Vector2(0, 0);
}

E_Interactor.prototype.onMouseDown = function(event)
{
  this.m_bDown = true;

  var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  //Check if Object is Selected;
  this.m_bObjectSelected = this.Manager.SelectObject(mouseX, mouseY);

  //Store Position;
  this.prevPosition.x = mouseX;
  this.prevPosition.y = mouseY;
}

E_Interactor.prototype.onMouseUp = function(event)
{
  if(this.m_bDown){
    if(this.m_bObjectSelected){
      this.Manager.OnReleaseMouse();
      this.m_bObjectSelected = false;
    }
  }
  this.m_bDown = false;
  this.m_bRDown = false;
}

E_Interactor.prototype.onMouseRDown = function(event)
{
  this.m_bRDown = true;
  this.m_bDown = false;

  event.preventDefault();
}

E_Interactor.prototype.onMouseRUp = function(event)
{

}

E_Interactor.prototype.onMouseMove = function(event)
{
  if(!this.m_bDown && !this.m_bRDown) return;

  //Get Current position
  var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  var currentPosition = new THREE.Vector2(mouseX, mouseY);
  var delta = currentPosition.clone().sub(this.prevPosition.clone());

  if(this.m_bDown && this.m_bObjectSelected)
  {
    this.Manager.OnMoveObject(mouseX, mouseY);
  }else if(this.m_bRDown){
    //Mouse R Move Event
    var camera = this.Manager.GetCamera();

    var xComp = new THREE.Vector2(delta.x, 0);
    var yComp = new THREE.Vector2(0, delta.y);
    var theta = xComp.clone().add(yComp).length();

    var xEul = new THREE.Vector3(0, -delta.x, 0);
    var yEul = new THREE.Vector3(delta.y, 0, 0);
    var axis = xEul.clone().add(yEul).normalize();

    var mat = camera.matrix.clone()
    mat.multiply(new THREE.Matrix4().makeRotationAxis(axis , theta));
    camera.rotation.setFromRotationMatrix(mat);
    //this.Manager.Redraw();
  }

  this.prevPosition = currentPosition;
}

E_Interactor.prototype.onKeyboardDown = function(event)
{
  this.m_keyCode = event.keyCode;

  if(this.m_keyCode == 32){
    //this.Manager.ResetGround();
  }
}

E_Interactor.prototype.onKeyboardUp = function(event)
{
  this.m_keyCode = -1;
}

E_Interactor.prototype.Update = function()
{

  var camera = this.Manager.GetCamera();
  var mat = camera.matrix.clone();

  var factor = 0.1;

  switch (this.m_keyCode) {
    case -1:
      return;
    break;
    case 86:
    //this.Manager.frand(-2.0, 2.0), this.Manager.frand(2.0, 3.0), this.Manager.frand(-2.0, 2.0)
      this.Manager.GenerateObject(0, 5, 0);
    break;
    case 67: // c
      mat.multiply(new THREE.Matrix4().makeTranslation(0, 0, factor));
      camera.position.setFromMatrixPosition(mat);
    break;
    case 32: // Space key
      mat.multiply(new THREE.Matrix4().makeTranslation(0, 0, -factor));
      camera.position.setFromMatrixPosition(mat);

    break;
    case 87: // W Key
      mat.multiply(new THREE.Matrix4().makeTranslation(0, factor, 0));
      camera.position.setFromMatrixPosition(mat);

    break;
    case 83: // S key
      mat.multiply(new THREE.Matrix4().makeTranslation(0, -factor, 0));
      camera.position.setFromMatrixPosition(mat);

    break;
    case 65: // A key
      mat.multiply(new THREE.Matrix4().makeTranslation(-factor, 0, 0));
      camera.position.setFromMatrixPosition(mat);

    break;
    case 68: // D Key
      mat.multiply(new THREE.Matrix4().makeTranslation(factor, 0, 0));
      camera.position.setFromMatrixPosition(mat);

    break;
    case 81: // Q
      mat.multiply(new THREE.Matrix4().makeRotationZ(factor / 10));
      camera.rotation.setFromRotationMatrix(mat);


    break;
    case 69: // E Key
      mat.multiply(new THREE.Matrix4().makeRotationZ(-factor / 10));
      camera.rotation.setFromRotationMatrix(mat);

    break;
    default:
    break;
  }
}

module.exports = E_Interactor;
