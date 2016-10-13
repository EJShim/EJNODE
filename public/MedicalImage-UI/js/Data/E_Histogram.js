function E_Histogram()
{

  this.GetCanvas = function(){
    return document.getElementById("histogram");
  }
}

E_Histogram.prototype.Update = function(lut)
{
  //paint canvas 를 상속받아 수정.
  var hisCanvas = this.GetCanvas()
  hisCanvas.width = document.getElementById("leftMenu").offsetWidth * 0.8;

  var hisCtx = hisCanvas.getContext('2d');

  hisCtx.clearRect(0, 0, hisCanvas.width, hisCanvas.height);

  //ctx.globalCompositeOperation = 'source-over';
  // apply color
  var hisColor = hisCtx.createLinearGradient(0, 0, hisCanvas.width, 0);

  for (var i = 0; i < lut._color.length; i++) {
    hisColor.addColorStop(lut._color[i][0], 'rgba(' + Math.round(lut._color[i][1] * 255) + ', ' + Math.round(lut._color[i][2] * 255) + ', ' + Math.round(lut._color[i][3] * 255) + ', 1)');
  }


  hisCtx.fillStyle = hisColor;
  hisCtx.fillRect(0, 0, hisCanvas.width, hisCanvas.height);

  hisCtx.globalCompositeOperation = 'destination-over';

  // apply opacity
  var hisOpacity = hisCtx.createLinearGradient(0, 0, hisCanvas.width, 0);

  for (var i = 0; i < lut._opacity.length; i++) {
    hisOpacity.addColorStop(lut._opacity[i][0], 'rgba(255, 255, 255, ' + lut._opacity[i][1] + ')');

  }

  hisCtx.fillStyle = hisOpacity;
  hisCtx.fillRect(0, 0, hisCanvas.width, hisCanvas.height);


  //Add Opacity Point
   hisCtx.globalCompositeOperation = "source-over";

   for(var i=0 ; i<lut._opacity.length ; i++){

     var x = lut._opacity[i][0] * hisCanvas.width;
     var y = hisCanvas.height - lut._opacity[i][1] * hisCanvas.height;

     hisCtx.lineTo(x, y);
     hisCtx.arc(x, y, 2, 0, 2*Math.PI, true);
     hisCtx.stroke();

     hisCtx.moveTo(x, y);
   }

}

E_Histogram.prototype.IsPointSelected = function(x, y)
{

}
