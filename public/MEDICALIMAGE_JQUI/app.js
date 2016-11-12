(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var VIEW_MAIN = 0;
var VIEW_2D_AXL = 1;
var VIEW_2D_COR = 2;
var VIEW_2D_SAG = 3;

function E_Manager()
{
  var m_renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true, alpha:true});
  
  this.GetRenderer = function(){
    return m_renderer;
  }
}

E_Manager.prototype.Initialize = function()
{
  var renderer = this.GetRenderer();
  renderer.scene = new THREE.Scene();
  renderer.camera = new THREE.PerspectiveCamera( 45, $$("ID_VIEW_MAIN").$width/$$("ID_VIEW_MAIN").$height, 0.1, 10000000000 );

  var viewport = $$("ID_VIEW_MAIN");

  viewport.$view.replaceChild(renderer.domElement, viewport.$view.childNodes[0]);

  renderer.setClearColor(0x000000);
  renderer.setSize(viewport.$width, viewport.$height);

  this.Redraw();
}

E_Manager.prototype.Redraw = function()
{
  var renderer = this.GetRenderer();


  renderer.render(renderer.scene, renderer.camera);
}
module.exports = E_Manager;

},{}],2:[function(require,module,exports){
var E_Manager = require("./E_Manager.js");


//Initialize Manager
var Manager = new E_Manager();

Manager.Initialize();

///////////////////////////////////TEST INTERACTION////////////////////////////////

},{"./E_Manager.js":1}]},{},[2]);
