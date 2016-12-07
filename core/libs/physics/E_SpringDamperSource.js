function E_SpringDamper(Mgr)
{

  this.Manager = Mgr;

  this.objects = [];
  this.cValue = 5;
  this.equilibriumLength = 1;
  this.kValue = 50;

  //TEMP

}

E_SpringDamper.prototype.AddMesh = function(mesh)
{
  if(this.objects.length > 1){
    console.log("cannot add more than 2 objects");
    return;
  }
  this.objects.push(mesh);

  //Add Mesh a Spring Damper
  if(this.objects.length == 2){
    this.objects[0].connectedObject.push(this.objects[1]);
    this.objects[1].connectedObject.push(this.objects[0]);

    var length = this.objects[0].position.clone().sub(this.objects[1].position).length();
    //this.equilibriumLength = length;
  }
}

E_SpringDamper.prototype.UpdateConnectivity = function()
{
  //Calculate The amount of Stretc
  if(this.objects[0].parent == null || this.objects[1].parent == null){
    if(this.objects[0].parent == null){
      var idx = this.objects[1].connectedObject.indexOf(this.objects[0]);
      this.objects[1].connectedObject.splice(idx, 1);
    }else{
      var idx = this.objects[0].connectedObject.indexOf(this.objects[1]);
      this.objects[0].connectedObject.splice(idx, 1);
    }

    this.Manager.ParticleSystem().remove(this);
    this.Manager.GetScene().remove(this);
  }
}

E_SpringDamper.prototype.Update = function()
{

  this.UpdateConnectivity();
  this.UpdateLineShape();


  //Calculate Force for both objects - Spring Force
  var pbpa = this.objects[1].position.clone().sub( this.objects[0].position.clone());
  var lpbpa = pbpa.length();

  var magnitudeSpring = this.kValue * ( lpbpa - this.equilibriumLength );
  var Fsa = pbpa.multiplyScalar( magnitudeSpring / lpbpa );

  //Damper Force
  var d = this.objects[1].position.clone().sub( this.objects[0].position.clone()).normalize();
  var vda = this.objects[0].velocity.clone().dot(d.clone());
  var vdb = this.objects[1].velocity.clone().dot(d.clone());
  //var Fa = d.clone().multiplyScalar(this.objects[0].velocity.length() * this.cValue).add(Fsa);

  var Fa = d.clone().multiplyScalar(this.cValue * (vdb - vda)).add(Fsa);
  var Fb = Fa.clone().multiplyScalar(-1);


  this.objects[0].ApplyForce(Fa);
  this.objects[1].ApplyForce(Fb);
}

E_SpringDamper.prototype.MultiplyScalar = function(mat, scalar)
{
  var col = mat._size[0];
  var row = mat._size[1];
  var result = math.zeros(col, row);

  for(var i=0 ; i<col ; i++){
    for(var j=0 ; j<row ; j++){
      result._data[i][j] = mat._data[i][j] * scalar;
    }
  }

  return result;
}


module.exports = E_SpringDamper;
