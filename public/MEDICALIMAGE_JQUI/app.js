(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
var E_Manager = require("./E_Manager.js");


//Initialize Manager
var Manager = new E_Manager();



///////////////////////////////////TEST INTERACTION////////////////////////////////

},{"./E_Manager.js":1}]},{},[2]);
