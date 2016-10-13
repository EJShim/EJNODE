
$(document).ready(function(){/* google maps -----------------------------------------------------*/
google.maps.event.addDomListener(window, 'load', initialize);

var map;
var markerList = new Array();



//----- Function Definition-----//

function OnSelectedLocation(idx)
{
  //move map to marker position
  alert(idx);
  map.panTo(markerList[idx].getPosition());
};

function AddMarker(pos)
{
  //Initialize
  var index = markerList.length;
  var marker = new google.maps.Marker({
    position: pos,
    url: '/',
    animation: google.maps.Animation.DROP
  });

  //Add on Map
  marker.setMap(map);

  //add event list-group-item-danger


  //Add on List
  markerList.push(marker);
}

function initialize() {

  /* position Seoul */
  var latlng = new google.maps.LatLng(37.5829714,126.9520088); //City Hall Seoul

  var mapOptions = {
    center: latlng,
    disableDefaultUI: true,
    zoom: 13,
    minZoom:13,
    maxZoom:14
  };

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  AddMarker(latlng); //Center - city hall
  AddMarker(new google.maps.LatLng(37.5650172,126.849464)); // west
  AddMarker(new google.maps.LatLng(37.5403932,127.0670473)); //Konkuk University
  AddMarker(new google.maps.LatLng(37.5984262,127.0408343)); //KIST
  AddMarker(new google.maps.LatLng(37.7913583,127.5233531)); //GaPyeong - namisum

  for(var i in markerList){
    markerList[i].addListener('click', function(){
      OnSelectedLocation(i);
    });
  }
};


// Handle Evenent Signals
$( ".dropdown-menu li" ).click(function() {
  //var index = $("li").index( $("#p1") );
  var index = $(this).index();
  OnSelectedLocation(index);
});






/* end google maps -----------------------------------------------------*/
});
