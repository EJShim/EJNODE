var E_DicomLoader       = AMI.default.Loaders.Volume
var E_VolumeData        = AMI.default.Helpers.VolumeRendering;
var E_SliceImage        = AMI.default.Helpers.Stack;
var E_Lut               = AMI.default.Helpers.Lut;
var ShadersRaycasting = AMI.default.Shaders.Raycasting;

function E_Volume(stack)
{
  var m_stack = stack;

  //prepare stack information
  if(!m_stack.prepared){
    m_stack.prepare();

    //Set Up Range
    var range = m_stack._minMax;
    m_stack._windowWidth = range[1] - range[0] - 1;
    m_stack._windowCenter = (range[1] + range[0] - 1) / 2;
  }

  var m_volumeData = new E_VolumeData(m_stack);
  var m_sliceImage = new E_SliceImage(m_stack);
  var m_sliceImage2D = new E_SliceImage(m_stack);
  var m_lut = new E_Lut("c", "default", "linear");
  this.GetStackInformation = function()
  {
    return m_stack;
  }
  this.GetVolumeData = function(){
    return m_volumeData;
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

  //Initialize
  this.Init();
  this.InitLUT();

  this.SetCustomShader();
  //this.SetSecondPassShader();
  this.UpdateLUT();
}


E_Volume.prototype.Init = function()
{
  //Set Slice Image
  this.GetSliceImage().bbox.visible = false;
  this.GetSliceImage().border.color = 0xF44336;

  this.GetSliceImage2D().bbox.visible = false;
  this.GetSliceImage2D().border.color = 0xF44336;


  //Set Custom ShaderMaterial

  //Set Color and Opacity Transfer Function
}

E_Volume.prototype.InitLUT = function()
{
  var lut = this.GetLut();
  var range = this.GetStackInformation().minMax;
  var pointZero = -range[0];
  var width = range[1]-range[0];


  //color : White for all values
  var CTPbone = [[0, 0, 0, 0],
                            [(pointZero-16)/width, .73, .25 , .30],
                            [(pointZero+641)/width, .90, .82, .56],
                            [1, 1, 1, 1]];

  //Opacity : linear increase
  var OTPbone = [[0, 0],
                              [(pointZero-16)/width, 0],
                              [(pointZero+641)/width, .72],
                              [1, .71]];

  var CTPmip = [[0, 1, 1, 1], [1, 1, 1, 1]];
  var OTPmip = [[0, 0], [1, 1]];

  lut._color = CTPmip;
  lut._opacity = OTPmip;
}

E_Volume.prototype.AddToRenderer = function(scene)
{
  scene.add(this.GetVolumeData());
}

E_Volume.prototype.AddSliceImageToRenderer= function(scene)
{
  scene.add(this.GetSliceImage());
}

E_Volume.prototype.AddSliceImageTo2DRenderer = function(scene)
{
  scene.add(this.GetSliceImage2D());
}

E_Volume.prototype.RemoveFromRenderer = function(scene)
{
  scene.remove(this.GetVolumeData());
}

E_Volume.prototype.MoveIndex = function(value){
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

E_Volume.prototype.GetBoundingBox = function(){
  return this.GetVolumeData().uniforms.uWorldBBox.value;
}

E_Volume.prototype.GetCenter = function()
{
  return this.GetStackInformation().worldCenter();
}

E_Volume.prototype.SetCustomShader = function()
{
  //Set Custom Shader Code
  var uniforms = this.GetVolumeData().uniforms ;
  var material = this.GetVolumeData()._material ;


  material.fragmentShader = $('#volume-fragment-singlepass').text();

  //Set Shader Uniforms
  // Set CTF and OTF to the volume Data
  uniforms.uLut.value = 1;
  uniforms.uInterpolation.value = 0;


  uniforms.uWindowCenterWidth.value[1] *= 10/8;
}

E_Volume.prototype.SetSecondPassShader = function()
{
  //Generate First Pass Volume, copying current Material
  var stack = $.extend(true, {}, this.GetStackInformation());

  var firstPassVolume = new E_VolumeData(stack);

}

E_Volume.prototype.UpdateLUT = function()
{
  var lut = this.GetLut();

  // var range = this.GetStackInformation().minMax;
  // lut._canvas.width = range[1]-range[0];
  //Update Lut
  lut.paintCanvas();

  //Apply LUT to shader
  this.GetVolumeData().uniforms.uTextureLUT.value = lut.texture;
}


E_VolumeData.prototype.GetCenter = function()
{
  return this.stack.worldCenter();
}
