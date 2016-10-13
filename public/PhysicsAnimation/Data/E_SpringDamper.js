function E_SpringDamper(Mgr)
{
  THREE.Line.call(this);

  this.Manager = Mgr;
  this.geometry = new THREE.Geometry();
  this.geometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1));
  this.material = new THREE.LineBasicMaterial({color:0x0000ff});

  this.objects = [];
  this.cValue = 5;
  this.equilibriumLength = 1;
  this.kValue = 50;

  //TEMP

}

E_SpringDamper.prototype = Object.create(THREE.Line.prototype);

E_SpringDamper.prototype.AddMesh = function(mesh)
{
  if(this.objects.length > 1){
    console.log("cannot add more than 2 objects");
    return;
  }
  this.objects.push(mesh);

  if(this.objects.length >= 2){
    this.geometry.verticesNeedUpdate = true;
    this.geometry.vertices[0] = this.objects[0].position.clone();
    this.geometry.vertices[1] = this.objects[1].position.clone();
  }
}

E_SpringDamper.prototype.Update = function()
{
  //Calculate The amount of Stretc
  if(this.objects.length != 2) return;

  //Update Line Shape
  this.geometry.verticesNeedUpdate = true;
  this.geometry.vertices[0] = this.objects[0].position.clone();
  this.geometry.vertices[1] = this.objects[1].position.clone();


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

  //**** FOR FUN
  var obj1Color = this.objects[0].material.color;
  var obj2Color = this.objects[1].material.color;


  //this.UpdateImplicit();
  //this.material.color = new THREE.Color(1 - obj1Color.r - obj2Color.r, 1 - obj1Color.g - obj2Color.g, 1 - obj1Color.b - obj2Color.b);
}

E_SpringDamper.prototype.UpdateImplicit = function()
{
  if(this.objects.length != 2) return;

  //Update Line Shape
  this.geometry.verticesNeedUpdate = true;
  this.geometry.vertices[0] = this.objects[0].position.clone();
  this.geometry.vertices[1] = this.objects[1].position.clone();

  //Calcualte Force using Implicit Metho
  var Xi = [this.objects[0].position.x, this.objects[0].position.y, this.objects[0].position.z];
  var Xj = [this.objects[1].position.x, this.objects[1].position.y, this.objects[1].position.z];

  var XJmXI = this.objects[1].position.clone().sub(this.objects[0].position);
  var VJmVI = this.objects[1].velocity.clone().sub(this.objects[0].velocity);

  var XJmXIarr = [XJmXI.x,XJmXI.y,XJmXI.z];
  var VJmVIarr = [VJmVI.x,VJmVI.y,VJmVI.z];


  var I = math.eye(3);

  var xjxiT = math.zeros(3, 3);
  for(var i=0 ; i<3 ; i++){
    for(var j=0 ; j<3 ; j++){
      xjxiT._data[i][j] = XJmXIarr[i] * XJmXIarr[j];
    }
  }

  var length = this.objects[1].position.clone().sub(this.objects[0].position).length();
  var length = 1;
  //뒷부분
  var bElement = math.subtract(I, this.MultiplyScalar(xjxiT, 2/math.pow(length, 2) ));
  var SpringForce = this.MultiplyScalar(math.add( this.MultiplyScalar(bElement, this.equilibriumLength / length) , this.MultiplyScalar(I, -1.0) ), this.kValue);

  var xvT = math.zeros(3, 3);
  for(var i=0 ; i<3 ; i++){
    for(var j=0 ; j<3 ; j++){
      xvT._data[i][j] = XJmXIarr[i] * VJmVIarr[j];
    }
  }
  var con = this.objects[1].position.clone().sub(this.objects[0].position).dot( this.objects[1].velocity.clone().sub(this.objects[0].velocity.clone()) );
  var bb = this.MultiplyScalar(bElement, con);

  var DamperForce = this.MultiplyScalar( math.add(xvT, bb), this.cValue / math.pow(length, 2) );

  var FXi = math.subtract(SpringForce, DamperForce);
  var FXj = this.MultiplyScalar(FXi, -1);

  var FVi = this.MultiplyScalar(xjxiT, -this.cValue/math.pow(length,2));
  var FVj = this.MultiplyScalar(FXj, -1);

  var Mi = math.multiply( math.eye(3), this.objects[0].mass );
  var Mj = math.multiply( math.eye(3), this.objects[1].mass );

  var DaDxi = math.multiply( Mi, FXi );
  var DaDxj = math.multiply( Mj, FXj );

  var DaDvi = math.multiply( Mi, FVi );
  var DaDvj = math.multiply( Mj, FVj );

  console.log(DaDvi);

  //console.log(haha);

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
