function E_SpringDamperSource(Mgr)
{


  this.Manager = Mgr;

  this.objects = [];
  this.cValue = 5;
  this.equilibriumLength = 1;
  this.kValue = 110;
}


E_SpringDamperSource.prototype.AddMesh = function(mesh)
{
  if(this.objects.length > 1){
    console.log("cannot add more than 2 objects");
    return;
  }
  this.objects.push(mesh);
}

E_SpringDamperSource.prototype.Update = function()
{
  //Calculate The amount of Stretc
  if(this.objects.length != 2) return;



  //Calculate Force for both objects - Spring Force
  var pbpa = this.objects[1].position.clone().sub( this.objects[0].position.clone());
  var lpbpa = pbpa.length();

  // if(lpbpa > 15){
  //   for(var i in this.objects){
  //     var obj = this.objects[i];
  //     obj.ApplyForce(obj.acceleration.multiplyScalar(obj.mass * -0.5));
  //   }
  // }
  //Resting Spring Distance
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


  //**** FOR FUN
  if(this.objects[0] instanceof E_Particle && this.objects[1] instanceof E_Particle){
    var obj1Color = this.objects[0].material.color;
    var obj2Color = this.objects[1].material.color;
  }
  //this.material.color = new THREE.Color(obj1Color.r + obj2Color.r, obj1Color.g + obj2Color.g, obj1Color.b + obj2Color.b);
}

E_SpringDamperSource.prototype.SetC = function(c)
{
  this.cValue = c;
}

E_SpringDamperSource.prototype.setK = function(k)
{
  this.kValue = k;
}
