//Define Header
var E_Manager = require("./E_Manager.js");


//Initialize Manager
var Manager = new E_Manager();
Manager.Initialize();
Manager.Animate();

///////////////////////////////////INTERACTION EVENTS////////////////////////////////
/// Resizing Events

$(window).resize(function(){
  Manager.OnResize();
});

$$("ID_LEFT_AREA").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_MAIN").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_AXL").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_COR").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_SAG").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_FOOTER").attachEvent("onViewResize", function(){
  Manager.OnResize();
});


/// Button Events
$$("ID_BUTTON_IMPORT_MESH").attachEvent("onItemClick", function(){
  var parent = $$("ID_BUTTON_IMPORT_MESH").getNode().childNodes[0];

  //Create File Dialog
  var fileDialog = document.createElement("input");
  fileDialog.setAttribute("type", "file");
  fileDialog.setAttribute("multiple", true);
  fileDialog.click();
  parent.appendChild(fileDialog);

  fileDialog.addEventListener("change", function(ev){
    //console.log(ev.target.files);

    for(var i=0 ; i<ev.target.files.length ; i++){
        var path = URL.createObjectURL(ev.target.files[i]);
        var name = ev.target.files[i].name;

        //Import Mesh
        Manager.MeshMgr().ImportMesh(path, name);
    }

    //Remove File Dialog Element
    parent.removeChild(fileDialog);
  });
});

$$("ID_BUTTON_IMPORT_VOLUME").attachEvent("onItemClick", function(){
  console.log("Volume Import Clicked");
});
