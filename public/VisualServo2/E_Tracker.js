function E_Tracker(Mgr)
{
  this.Manager = Mgr;

  //Original Features in UV
  this.initFeature = [];
  this.initFeature[0] = new THREE.Vector2(-150.83334350585938, -144.5);
  this.initFeature[1] = new THREE.Vector2(-150.83334350585938, 144.5);
  this.initFeature[2] = new THREE.Vector2(150.16665649414062, -144.5);
  this.initFeature[3] = new THREE.Vector2(150.16665649414062, 144.5);


  //Fake Feature Position
  this.fakeFeature = []
  this.fakeFeature[1] = new THREE.Vector3(-11.787260127517664, 0, -11.787260127517664);
  this.fakeFeature[0] = new THREE.Vector3(-11.787260127517664, 0, 11.787260127517664);
  this.fakeFeature[3] = new THREE.Vector3(11.787260127517664, 0, -11.787260127517664);
  this.fakeFeature[2] = new THREE.Vector3(11.787260127517664, 0, 11.787260127517664);

  //Calculated Fake Feature
  this.calFeature = [];
  this.calFeature[0] = new THREE.Vector2();
  this.calFeature[1] = new THREE.Vector2();
  this.calFeature[2] = new THREE.Vector2();
  this.calFeature[3] = new THREE.Vector2();
}

E_Tracker.prototype.CalculateVelocity = function()
{
  var imgMgr = this.Manager.ImageMgr();

  var lambda = this.Manager.GetCamera(this.Manager.VIEW_CAM).aspect;
  var z = 90;

  //Column Matrix
  var uvBuffer = [];
  var LBuffer = [];

  var isCalibrated = true;


  this.UpdateFeatureLable();

  for(var i=0 ; i<4 ; i++){
    imgMgr.DrawLine(this.initFeature[i], this.calFeature[i] );

    var err = this.initFeature[i].clone().sub(this.calFeature[i]);
    var u = this.calFeature[i].x;
    var v = this.calFeature[i].y;

    uvBuffer.push([err.x]);
    uvBuffer.push([err.y]);

    if(Math.abs(err.x) > 1 || Math.abs(err.y) > 1) isCalibrated = false;

    LBuffer.push([]);
    LBuffer[i].push( lambda / z);
    LBuffer[i].push( 0 );
    LBuffer[i].push( -u/z );
    LBuffer[i].push( -u*v/lambda );
    LBuffer[i].push( (Math.pow(lambda, 2)+Math.pow(u, 2))/lambda );
    LBuffer[i].push( -v );

    LBuffer.push([]);
    LBuffer[i+1].push( 0 );
    LBuffer[i+1].push( lambda/z );
    LBuffer[i+1].push( -v/z );
    LBuffer[i+1].push( (-Math.pow(lambda,2)-Math.pow(v,2))/lambda );
    LBuffer[i+1].push( u*v/lambda );
    LBuffer[i+1].push( u );
  }


  var e = Sushi.Matrix.fromArray(uvBuffer);
  var L = Sushi.Matrix.fromArray(LBuffer);

  if(isCalibrated){
    //Finish Calibration
    document.getElementById("uvMat").innerHTML = "<h6 style='color:#AA0000'> E </h6><div style='color:green'>" + e.toCSV() + "</div>";
    document.getElementById("LMat").innerHTML =  "<h3 style='color:blue'>Press 'P' to start Calibration </h3> </div>";

    this.Manager.m_bCalibration = false;
    return{
      vx:0,
      vy:0,
      vz:0,
      wx:0,
      wy:0,
      wz:0
    };
  }


  var invL = Sushi.Matrix.mul( Sushi.Matrix.mul(L.t(), L).inverse(), L.t() );
  var resultMat =  Sushi.Matrix.mul(invL, e);


  var factorElement = new Array([-1/100000, -1/100000, 1/100, 5, 5, -1/100]);
  var factorMatrix = Sushi.Matrix.fromArray(factorElement);
  resultMat = resultMat.mulEach(factorMatrix.t());
  var result = Sushi.Matrix.toArray( resultMat );


  document.getElementById("uvMat").innerHTML = "<h6 style='color:#FF0000'> E </h6>" + e.toCSV();
  document.getElementById("LMat").innerHTML =  "<h6 style='color:red'>    Pseudo Inverse L </h6><p>" + invL.toCSV() + "</p><br> <p style='color:#00FFBA'>result " + resultMat.toCSV() + "</p>";

  return {
    vx:result[0],
    vy:result[1],
    vz:result[2],
    wx:result[3],
    wy:result[4],
    wz:result[5]
  };
}


E_Tracker.prototype.UpdateFeatureLable = function()
{
  console.clear();

  for(var i=0 ; i<3 ; i++){
    for(var j=0 ; j< 3-i ; j++ ){
      if(this.calFeature[j].x > this.calFeature[j+1].x){
        var temp = this.calFeature[j].clone();
        this.calFeature[j] = this.calFeature[j+1].clone();
        this.calFeature[j+1] = temp.clone();
      }
    }
  }

  if(this.calFeature[0].y > this.calFeature[1].y){
    var temp = this.calFeature[0].clone();
    this.calFeature[0] = this.calFeature[1].clone();
    this.calFeature[1] = temp;
  }

  if(this.calFeature[2].y > this.calFeature[3].y){
    var temp = this.calFeature[2].clone();
    this.calFeature[2] = this.calFeature[3].clone();
    this.calFeature[3] = temp;
  }
}
