
var vtk = require("vtk.js");

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
