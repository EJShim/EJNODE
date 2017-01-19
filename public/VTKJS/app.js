(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vtkFullScreenRenderWindow = vtk.Rendering.Misc.vtkFullScreenRenderWindow;
var vtkConeSource             = vtk.Filters.Sources.vtkConeSource;
var vtkMapper                 = vtk.Rendering.Core.vtkMapper;
var vtkActor                  = vtk.Rendering.Core.vtkActor;

// --------------------------------------------------------------------------
// Standard rendering code setup
// --------------------------------------------------------------------------
var fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
var renderer = fullScreenRenderer.getRenderer();
var renderWindow = fullScreenRenderer.getRenderWindow();
// --------------------------------------------------------------------------
// Example code
// --------------------------------------------------------------------------
var cone = vtkConeSource.newInstance();
var actor = vtkActor.newInstance();
var mapper = vtkMapper.newInstance();

actor.setMapper(mapper);
mapper.setInputConnection(cone.getOutputPort());
renderer.addActor(actor);


renderer.resetCamera();
renderWindow.render();

},{}]},{},[1]);
