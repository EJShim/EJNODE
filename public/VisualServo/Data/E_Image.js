function E_Image()
{
  THREE.Mesh.call(this);

  this.canvas = document.createElement('canvas');
}

E_Image.prototype = Object.create(THREE.Mesh.prototype);

E_Image.prototype.ImportImage = function(path, Mgr)
{
  var IMAGE = this;
  var loader = new THREE.TextureLoader();
  loader.load(
    path, //texture path
    function(texture) //onload function
    {
      var height = texture.image.height;
      var width =  texture.image.width;

      //update canvas element

      IMAGE.canvas.width = texture.image.width;
      IMAGE.canvas.height = texture.image.height;
      IMAGE.canvas.getContext('2d').drawImage(texture.image, 0, 0, IMAGE.canvas.width, IMAGE.canvas.height);

      texture.minFilter = THREE.LinearFilter;

      IMAGE.material = new THREE.MeshBasicMaterial({ map : texture });
      IMAGE.material.side = THREE.DoubleSide;
      IMAGE.geometry = new THREE.PlaneGeometry(width/15, height/15);

      IMAGE.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      
      Mgr.GetScene().add(IMAGE);
      Mgr.Redraw();
    }
  );
}

E_Image.prototype.GetImageData = function()
{
  return this.canvas.getContext('2d').getImageData(0, 0, this.canvas.width, this.canvas.height);
}

E_Image.prototype.SetImageData = function(imgData)
{
  this.canvas.width = imgData.width;
  this.canvas.height = imgData.height;
  this.canvas.getContext('2d').putImageData(imgData, 0, 0);
  var texture = new THREE.Texture(this.canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  this.material.map = texture;
}

////TEST Image Procssing
E_Image.prototype.SetImageRed = function()
{
  //TEST if image modify is possible
  var imgData = this.GetImageData();

  //Set R value maximum
  for(var i=2 ; i<imgData.data.length ; i+=4){
    imgData.data[i] = 140;
  }
  this.SetImageData(imgData);
}
