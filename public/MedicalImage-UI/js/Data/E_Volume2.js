var E_DicomLoader       = AMI.default.Loaders.Volume
var E_SliceImage        = AMI.default.Helpers.Stack;
var E_Lut               = AMI.default.Helpers.Lut;

function E_Volume2(stack)
{
  var m_stack = stack;

  //prepare stack information
  if(!m_stack.prepared){
    m_stack.prepare();
    m_stack.pack();

    //Set Up Range
    var range = m_stack._minMax;
    m_stack._windowWidth = range[1] - range[0] - 1;
    m_stack._windowCenter = (range[1] + range[0] - 1) / 2;
  }

  this.m_volumeData;
  var m_sliceImage = new E_SliceImage(m_stack);
  var m_sliceImage2D = new E_SliceImage(m_stack);
  var m_lut = new E_Lut("c", "default", "linear");

  var m_sceneRTT = new THREE.Scene();
  var m_rtTexture = new THREE.WebGLRenderTarget(window.innerWidth,
                                             window.innerHeight,
                                             {minFilter: THREE.LinearFilter,
                                               magFilter: THREE.NearestFilter,
                                               format: THREE.RGBAFormat
                                             });


  this.GetStackInformation = function()
  {
    return m_stack;
  }

  this.GetVolumeData = function(){
    return this.m_volumeData;
  }

  this.GetSliceImage = function(){
    return m_sliceImage;
  }

  this.GetSliceImage2D = function(){
    return m_sliceImage2D;
  }

  this.GetLut = function(){
    return m_lut;
  }

  this.GetSceneRTT = function(){
    return m_sceneRTT;
  }

  this.GetRTTexture  = function(){
    return m_rtTexture;
  }

  //Initialize
  this.Init();
  this.InitLUT();

  this.SetCustomShader();
  this.UpdateLUT();
}


E_Volume2.prototype.Init = function()
{
  //Set Slice Image
  this.GetSliceImage().bbox.visible = false;
  this.GetSliceImage().border.color = 0xF44336;

  this.GetSliceImage2D().bbox.visible = false;
  this.GetSliceImage2D().border.color = 0xF44336;


  //Set Custom ShaderMaterial

  //Set Color and Opacity Transfer Function
}

E_Volume2.prototype.InitLUT = function()
{
  var lut = this.GetLut();
  var range = this.GetStackInformation().minMax;
  var pointZero = -range[0];
  var width = range[1]-range[0];


  //color : White for all values
  var CTPbone = [[0, 0, 0, 0],
                [ .2, .73, .25 , .30],
                [ .6, .90, .82, .56],
                [1, 1, 1, 1]];

  //Opacity : linear increase
  var OTPbone = [[0, 0],
                //[this.Normalize(pointZero+160, range[0], range[1]), 0],
                //[this.Normalize(pointZero+641, range[0], range[1]), .72],
                [1, .71]];

  var CTPmip = [[0, 1, 1, 1], [1, 1, 1, 1]];
  var OTPmip = [[0, 0], [1, 1]];

  lut._color = CTPbone;
  lut._opacity = OTPbone;
}

E_Volume2.prototype.Normalize = function(value, minVal, maxVal)
{
  if(value < 0) value = 0;
  if(value > 1) value = 1;
  return (value-minVal) / (maxVal - minVal);
}


E_Volume2.prototype.AddToRenderer = function(scene)
{
  scene.add(this.GetVolumeData());
}

E_Volume2.prototype.AddSliceImageToRenderer= function(scene)
{
  scene.add(this.GetSliceImage());
}

E_Volume2.prototype.AddSliceImageTo2DRenderer = function(scene)
{
  scene.add(this.GetSliceImage2D());
}

E_Volume2.prototype.RemoveFromRenderer = function(scene)
{
  scene.remove(this.GetVolumeData());
}

E_Volume2.prototype.MoveIndex = function(value){
  if(value > 0){
    if(this.GetSliceImage().index >= this.GetStackInformation().dimensionsIJK.z-1) return;
    this.GetSliceImage().index++;
    this.GetSliceImage2D().index++;
  }else{
    if(this.GetSliceImage().index <= 0) return;
    this.GetSliceImage().index--;
    this.GetSliceImage2D().index--;
  }
}

E_Volume2.prototype.GetBoundingBox = function(){
  return this.GetVolumeData().uniforms.uWorldBBox.value;
}

E_Volume2.prototype.GetCenter = function()
{
  return this.GetStackInformation().worldCenter();
}

E_Volume2.prototype.SetCustomShader = function()
{
  var offset = new THREE.Vector3(-0.5, -0.5, -0.5);
  var stack = this.GetStackInformation();


  var boxGeometry = new THREE.BoxGeometry(
    stack.dimensionsIJK.x - 1,
    stack.dimensionsIJK.y - 1,
    stack.dimensionsIJK.z - 1
  );

  boxGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(
    stack.halfDimensionsIJK.x + offset.x,
    stack.halfDimensionsIJK.y + offset.y,
    stack.halfDimensionsIJK.z + offset.z
  ));



  //Material
  var uniformFirstPass = this.firstPassUniforms();
  uniformFirstPass.uWorldBBox.value = stack.worldBoundingBox();

  var materialFirstPass = new THREE.ShaderMaterial({
    uniforms : uniformFirstPass,
    vertexShader : $('#volume-vertex-firstpass').text(),
    fragmentShader : $('#volume-fragment-firstpass').text(),
    side: THREE.BackSide
  });

  var boxMeshFirstPass = new THREE.Mesh(boxGeometry, materialFirstPass);
  //go to LPS space
  boxMeshFirstPass.applyMatrix(stack._ijk2LPS);

  this.GetSceneRTT().add(boxMeshFirstPass);

  //Second Pass
  var textures = [];
  for(var m = 0 ; m < stack._rawData.length ; m++){
    var tex = new THREE.DataTexture(
      stack.rawData[m],
      stack.textureSize,
      stack.textureSize,
      stack.textureType,
      THREE.UnsignedByteType,
      THREE.UVMapping,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      THREE.NearestFilter,
      THREE.NearestFilter
    );
    tex.needsUpdate = true;
    tex.flipY = true;
    textures.push(tex);
  }


  var uniformSecondPass = this.SecondPassUniforms();
  uniformSecondPass.uTextureSize.value = stack.textureSize;
  uniformSecondPass.uTextureContainer.value = textures;
  uniformSecondPass.uWorldToData.value = stack.lps2IJK;
  uniformSecondPass.uNumberOfChannels.value = stack.numberOfChannels;
  uniformSecondPass.uBitsAllocated.value = stack.bitsAllocated;
  uniformSecondPass.uWindowCenterWidth.value = [stack.windowCenter, stack.windowWidth];
  uniformSecondPass.uRescaleSlopeIntercept.value = [stack.rescaleSlope, stack.rescaleIntercept];
  uniformSecondPass.uTextureBack.value = this.GetRTTexture().texture;
  uniformSecondPass.uWorldBBox.value = stack.worldBoundingBox();
  uniformSecondPass.uLut.value = 1;
  uniformSecondPass.uDataDimensions.value = [stack.dimensionsIJK.x,
                                              stack.dimensionsIJK.y,
                                              stack.dimensionsIJK.z];

  uniformSecondPass.uSteps.value = 512;
  uniformSecondPass.uInterpolation = 1;



  var materialSecondPass = new THREE.ShaderMaterial({
    uniforms:uniformSecondPass,
    vertexShader : $('#volume-vertex-secondpass').text(),
    fragmentShader : $('#volume-fragment-secondpass').text(),
    side:THREE.FrontSide,
    transparent: true,
  });

  this.m_volumeData = new THREE.Mesh(boxGeometry, materialSecondPass);
  this.m_volumeData.applyMatrix(stack._ijk2LPS);

  //go to lps space
  //this.GetVolumeData().applyMatrix(stack._ijk2LPS);
}

E_Volume2.prototype.UpdateLUT = function()
{
  var lut = this.GetLut();

  //Update Lut
  lut.paintCanvas();

  //Apply LUT to shader
  this.GetVolumeData().material.uniforms.uTextureLUT.value = lut.texture;
}

E_Volume2.prototype.SecondPassUniforms = function(){
  return {
    'uTextureSize': {
      type: 'i',
      value: 0
    },
    'uTextureContainer': {
      type: 'tv',
      value: []
    },
    'uDataDimensions': {
      type: 'iv',
      value: [0, 0, 0]
    },
    'uWorldToData': {
      type: 'm4',
      value: new THREE.Matrix4()
    },
    'uWindowCenterWidth': {
      type: 'fv1',
      value: [0.0, 0.0]
    },
    'uRescaleSlopeIntercept': {
      type: 'fv1',
      value: [0.0, 0.0]
    },
    'uNumberOfChannels': {
      type: 'i',
      value: 1
    },
    'uBitsAllocated': {
      type: 'i',
      value: 8
    },
    'uTextureBack': {
      type: 't',
      value: null
    },
    'uWorldBBox': {
      type: 'fv1',
      value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    },
    'uSteps': {
      type: 'i',
      value: 256
    },
    'uLut': {
      type: 'i',
      value: 0
    },
    'uTextureLUT':{
      type: 't',
      value: []
    },
    'uAlphaCorrection':{
      type: 'f',
      value: 1.0
    },
    'uFrequence':{
      type: 'f',
      value: 0.0
    },
    'uAmplitude':{
      type: 'f',
      value: 0.0
    },
    'uPixelType': {
      type: 'i',
      value: 0
    },
    'uInterpolation': {
      type: 'i',
      value: 0
    }
  };
}

E_Volume2.prototype.firstPassUniforms = function(){
  return {
    'uWorldBBox': {
      type: 'fv1',
      value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    }
  };
}
