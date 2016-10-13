function E_ImageManager(Mgr)
{
  this.Manager = Mgr;

  this.rtTexture = new THREE.WebGLRenderTarget(window.innerWidth,
                                             window.innerHeight,
                                             {minFilter: THREE.LinearFilter,
                                               magFilter: THREE.NearestFilter,
                                               format: THREE.RGBAFormat
                                             });

  this.rtTexture.scissorTest = true;

  this.ctx = document.getElementById("canvas2D").getContext('2d');
  this.features = [];
  this.nFeatures = 0;

  //Image Pyramids for optical flow                curr_img_pyr = new jsfeat.pyramid_t(3);
  this.curr_img_pyr = new jsfeat.pyramid_t(3);
  this.prev_img_pyr = new jsfeat.pyramid_t(3);

  this.curr_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);
  this.prev_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);

  this.point_status = new Uint8Array(10);
  this.prev_xy = new Float32Array(100*2);
  this.curr_xy = new Float32Array(100*2);


  //Pre-defined features

}

E_ImageManager.prototype.ClearCanvas = function()
{
  var canvas = document.getElementById("canvas2D");
  this.ctx.clearRect(0, 0, canvas.width, canvas.height);
}


E_ImageManager.prototype.RendererToImage = function(renderer, scene, camera, left, bottom, width, height)
{

  ///Resize Renderer
  var size = renderer.getSize();

  var reduceFactor = (width * height) / (500 * 500);
  if(reduceFactor < 1) reduceFactor = 1;
  var tempWidth = Math.round(width / reduceFactor);
  var tempHeight = Math.round(height / reduceFactor);
  renderer.setSize(tempWidth, tempHeight);

  //Set RenderTarget Scissro and Viewport
  this.rtTexture.viewport = new THREE.Vector4(left, bottom, tempWidth, tempHeight);
  this.rtTexture.scissor =  new THREE.Vector4(left, bottom, tempWidth, tempHeight);

  //Generate Image Data
  var imageData = new ImageData(tempWidth, tempHeight);

  //Update Render Target
  renderer.render( scene, camera, this.rtTexture, true );
  var img_u8 = new Uint8Array( tempWidth * tempHeight * 4 )
  renderer.readRenderTargetPixels(this.rtTexture, 0, 0, tempWidth, tempHeight, img_u8 );
  imageData.data.set(img_u8);

  //Resize to Original
  renderer.setSize(size.width, size.height);

  return imageData;
}


E_ImageManager.prototype.SetImageDataTo2DRenderer = function(imageData)
{
  var canvas = document.getElementById("canvas2D");
  canvas.getContext('2d').putImageData(imageData, 0, 0);
}


E_ImageManager.prototype.ScaleImageData = function(imageData, scale)
{
  var scaled = new ImageData(imageData.width * scale, imageData.height * scale);

  for(var row = 0; row < imageData.height; row++) {
    for(var col = 0; col < imageData.width; col++) {
      var sourcePixel = [
        imageData.data[(row * imageData.width + col) * 4 + 0],
        imageData.data[(row * imageData.width + col) * 4 + 1],
        imageData.data[(row * imageData.width + col) * 4 + 2],
        imageData.data[(row * imageData.width + col) * 4 + 3]
      ];
      for(var y = 0; y < scale; y++) {
        var destRow = row * scale + y;
        for(var x = 0; x < scale; x++) {
          var destCol = col * scale + x;
          for(var i = 0; i < 4; i++) {
            scaled.data[(destRow * scaled.width + destCol) * 4 + i] =
              sourcePixel[i];
          }
        }
      }
    }
  }

  return scaled;
}

E_ImageManager.prototype.Canny = function(imageData)
{
  var width = imageData.width;
  var height = imageData.height;

  var img_u8 = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);

 jsfeat.imgproc.grayscale(imageData.data, width, height, img_u8);

 var r = 0.1;
 var kernel_size = (r+1) << 1;

 jsfeat.imgproc.gaussian_blur(img_u8, img_u8, kernel_size, 0);
 jsfeat.imgproc.canny(img_u8, img_u8, 0, 1);

 // render result back to canvas
 var data_u32 = new Uint32Array(imageData.data.buffer);
 var alpha = (0xff << 24);
 var i = img_u8.cols*img_u8.rows, pix = 0;
 while(--i >= 0) {
     pix = img_u8.data[i];
     data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
 }

 return imageData
}

E_ImageManager.prototype.Yape06 = function(imageData)
{
  //Get Canvas Information and Clear CTX
  var canvas = document.getElementById("canvas2D");
  var rect = this.Manager.GetClientSize( this.Manager.VIEW_CAM );
  var canvasWidth = rect.right - rect.left;
  var canvasHeight = canvas.height;

  var width = imageData.width;
  var height = imageData.height;
  var img_u8 = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);

  this.features = [];
  var i = width*height;
  while(--i >= 0) {
      this.features[i] = new jsfeat.keypoint_t(0,0,0,0);
  }

  jsfeat.imgproc.grayscale(imageData.data, width, height, img_u8);
  jsfeat.imgproc.box_blur_gray(img_u8, img_u8, 2, 0);

  jsfeat.yape06.laplacian_threshold = 1;
  jsfeat.yape06.min_eigen_value_threshold = 0;


  this.nFeatures = jsfeat.yape06.detect(img_u8, this.features);

  // render result back to canvas
  var data_u32 = new Uint32Array(imageData.data.buffer);

  var pix = (0xff << 24) | (0x00 << 16) | (0xff << 8) | 0x00;
  for(var i=0; i < this.nFeatures; ++i)
  {
      var x = this.features[i].x * (canvasWidth/width);
      var y = this.features[i].y * (canvasHeight/height);
      var off = (x + y * width);
      data_u32[off] = pix;
      data_u32[off-1] = pix;
      data_u32[off+1] = pix;
      data_u32[off-width] = pix;
      data_u32[off+width] = pix;

      this.DrawFeature(x, y, i);
      ///Optical Flow
      this.curr_xy[i << 1] = x;
      this.curr_xy[(i << 1)+1] = y;
  }

  if(this.nFeatures > 4) {
    jsfeat.imgproc.grayscale(imageData.data, width, height, this.curr_img_pyr.data[0]);
    jsfeat.imgproc.grayscale(imageData.data, width, height, this.prev_img_pyr.data[0]);
  }

  return imageData;
}

E_ImageManager.prototype.FastCorners = function(imageData)
{
  //Clear Canvas
  var canvas = document.getElementById("canvas2D");

  var rect = this.Manager.GetClientSize( this.Manager.VIEW_CAM );
  var canvasWidth = rect.right - rect.left;
  var canvasHeight = canvas.height;

  var width = imageData.width;
  var height = imageData.height;
  var img_u8 = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);

  jsfeat.imgproc.grayscale(imageData.data, width, height, img_u8);

  threshold = 5;

  jsfeat.fast_corners.set_threshold(threshold);

  this.features = [];
  var i = width * height;
  while(--i >= 0) {
      this.features[i] = new jsfeat.keypoint_t(0,0,0,0);
  }


  this.nFeatures = jsfeat.fast_corners.detect(img_u8, this.features, 50);

  // render result back to canvas
  var data_u32 = new Uint32Array(imageData.data.buffer);
  var pix = (0xff << 24) | (0x00 << 16) | (0xff << 8) | 0x00;

  for(var i=0; i < this.nFeatures; ++i)
  {
      var x = this.features[i].x * (canvasWidth/width);
      var y = this.features[i].y * (canvasHeight/height);
      var off = (x + y * width);
      data_u32[off] = pix;
      data_u32[off-1] = pix;
      data_u32[off+1] = pix;
      data_u32[off-width] = pix;
      data_u32[off+width] = pix;

      this.DrawFeature(x, y, i);
      ///Optical Flow
      this.curr_xy[i << 1] = x;
      this.curr_xy[(i << 1)+1] = y;
  }

  if(this.nFeatures > 4) jsfeat.imgproc.grayscale(imageData.data, width, height, this.curr_img_pyr.data[0]);

  return imageData
}

E_ImageManager.prototype.OpticalFlow = function(imageData)
{
  var canvas = document.getElementById("canvas2D");

  var width = imageData.width;
  var height = imageData.height;

  // swap flow data
  var _pt_xy = this.prev_xy;
  this.prev_xy = this.curr_xy;
  this.curr_xy = _pt_xy;

  var _pyr = this.prev_img_pyr;
  this.prev_img_pyr = this.curr_img_pyr;
  this.curr_img_pyr = _pyr;

  jsfeat.imgproc.grayscale(imageData.data, width, height, this.curr_img_pyr.data[0]);
  this.curr_img_pyr.build(this.curr_img_pyr.data[0], true);
  jsfeat.optical_flow_lk.track(this.prev_img_pyr, this.curr_img_pyr, this.prev_xy, this.curr_xy, this.nFeatures, 20, 30, this.point_status, 0.01, 0.001);

  var n = this.nFeatures;
  var i=0,j=0;



  for(; i < n; ++i) {
    if(this.point_status[i] == 1) {
        console.log("Optical Flow");
        if(j < i) {
            this.curr_xy[j<<1] = this.curr_xy[i<<1];
            this.curr_xy[(j<<1)+1] = this.curr_xy[(i<<1)+1];
        }
        this.DrawFeature(this.curr_xy[j<<1], this.curr_xy[(j<<1)+1]);
        ++j;
    }
  }
  this.nFeatures = j;
}

E_ImageManager.prototype.UpdateImagePyramid = function()
{
  var canvas = document.getElementById("canvas2D");
  var rect = this.Manager.GetClientSize(this.Manager.VIEW_CAM);
  var canvasWidth = canvas.width
  var canvasHeight = canvas.height;

  this.curr_img_pyr.allocate(canvasWidth, canvasHeight, jsfeat.U8_t|jsfeat.C1_t);
  this.prev_img_pyr.allocate(canvasWidth, canvasHeight, jsfeat.U8_t|jsfeat.C1_t);
}



E_ImageManager.prototype.DrawFeature = function(x, y)
{
  var canvas = document.getElementById("canvas2D");
  var rect = this.Manager.GetClientSize(this.Manager.VIEW_CAM);
  var canvasWidth = rect.right - rect.left;
  var canvasHeight = canvas.height;

  //Convert to UV coordinate
  var u = x - canvasWidth/2;
  var v = -(y - canvasHeight / 2);

  ///clear Canvas
  this.ctx.fillStyle = "rgb(0,255,0)";
  this.ctx.strokeStyle = "rgb(0,0,255)";
  this.ctx.font="10px Georgia";

  this.ctx.beginPath();
  this.ctx.arc(x, y, 4, 0, Math.PI*2, true);
  this.ctx.fillText("( " + u.toFixed(2) + "," + v.toFixed(2) + " ) ",x, y);
  this.ctx.closePath();
  this.ctx.fill();
}


E_ImageManager.prototype.DrawInitPoints = function()
{
  var featurePosition = this.Manager.Tracker().initFeature;
  var p1 = this.UVToScreen(featurePosition[0].x, featurePosition[0].y);
  var p2 = this.UVToScreen(featurePosition[1].x, featurePosition[1].y);
  var p3 = this.UVToScreen(featurePosition[2].x, featurePosition[2].y);
  var p4 = this.UVToScreen(featurePosition[3].x, featurePosition[3].y);

  this.ctx.fillStyle = "rgb(0,0,255)";
  this.ctx.font="10px Georgia";
  this.ctx.beginPath();
  this.ctx.arc(p1[0], p1[1], 4, 0, Math.PI*2, true);
  this.ctx.fill();
  this.ctx.beginPath();
  this.ctx.arc(p2[0], p2[1], 4, 0, Math.PI*2, true);
  this.ctx.fill();
  this.ctx.beginPath();
  this.ctx.arc(p3[0], p3[1], 4, 0, Math.PI*2, true);
  this.ctx.fill();
  this.ctx.beginPath();
  this.ctx.arc(p4[0], p4[1], 4, 0, Math.PI*2, true);
  this.ctx.closePath();
  this.ctx.fill();
}

E_ImageManager.prototype.UVToScreen = function(u, v)
{
  var canvas = document.getElementById("canvas2D");
  var rect = this.Manager.GetClientSize(this.Manager.VIEW_CAM);
  var canvasWidth = rect.right - rect.left;
  var canvasHeight = canvas.height;
  var result = [];

  result[0] = u + canvasWidth/2;
  result[1] = -v + canvasHeight / 2;

  return result;
}

E_ImageManager.prototype.ScreenToUV = function(x, y)
{
  var canvas = document.getElementById("canvas2D");
  var rect = this.Manager.GetClientSize(this.Manager.VIEW_CAM);
  var canvasWidth = rect.right - rect.left;
  var canvasHeight = canvas.height;
  var result = [];

  result[0] = x - canvasWidth/2;
  result[1] = -(y - canvasHeight / 2);

  return result;
}

E_ImageManager.prototype.RenderFakeFeatures = function(camera)
{
  var canvas = document.getElementById("canvas2D");

  //Original Features
  var points = this.Manager.Tracker().fakeFeature;

  //Calculated features
  var features = this.Manager.Tracker().calFeature;

  for(var i=0 ; i<4 ; i++){
    var vec = new THREE.Vector3(points[i].x, points[i].y, points[i].z)
    vec.project(camera);

    //Update Current Feature Position

    var x = Math.round( ( vec.x + 1 ) * canvas.width / 2 );
    var y = Math.round( ( - vec.y + 1 ) * canvas.height / 2 );

    var featUV = this.ScreenToUV(x, y);
    features[i].set(featUV[0], featUV[1]);

    this.DrawFeature(x, y);
  }
}

E_ImageManager.prototype.DrawLine = function(p1, p2)
{
  if(!p1 instanceof THREE.Vector2) return;
  if(!p2 instanceof THREE.Vector2) return;

  var start = this.UVToScreen(p1.x, p1.y);
  var end = this.UVToScreen(p2.x, p2.y);

  this.ctx.strokeStyle = "rgb(255,255,0)";
  this.ctx.beginPath();
  this.ctx.moveTo(start[0], start[1]);
  this.ctx.lineTo(end[0], end[1]);
  this.ctx.stroke();
}
