function E_Manager()
{
  var c = document.getElementById("ID_VIEW_AXL");
  var ctx = c.getContext("2d");

  // Create gradient
  var grd = ctx.createLinearGradient(0,0,200,0);
  grd.addColorStop(0,"red");
  grd.addColorStop(1,"white");

  // Fill with gradient
  ctx.fillStyle = grd;
  ctx.fillRect(10,10,150,80);


  var c = document.getElementById("ID_VIEW_COR");
  var ctx = c.getContext("2d");

  // Create gradient
  var grd = ctx.createLinearGradient(0,0,200,0);
  grd.addColorStop(0,"green");
  grd.addColorStop(1,"white");

  // Fill with gradient
  ctx.fillStyle = grd;
  ctx.fillRect(10,10,150,80);


  //test
  console.log($$("ID_VIEW_MAIN"));
}
module.exports = E_Manager;
