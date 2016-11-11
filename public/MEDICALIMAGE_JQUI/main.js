webix.ui({
  rows: [
    {
      view:"toolbar",
      elements:[
        {view:"button", value:"Import Dicom", width:100},
        {view:"button", value:"Import Mesh", width:100}
      ]
    },
    {
      cols:[
        { template:"LIST VIEW", id:"main", width:200 },//first column
        {view:"resizer"},
        {
          cols:[
            {
              rows:[
                {id:"ID_VIEW_MAIN", template :"<canvas id='ID_VIEW_MAIN'> </canvas>"}
              ]
            },{id:"testresize",view:"resizer"},
            {
              rows:[
                {template:"<canvas id='ID_VIEW_AXL'> </canvas>", padding:0},
                {view:"resizer"},
                {template:"<canvas id='ID_VIEW_COR'> </canvas>"},
                {view:"resizer"},
                {template:"<canvas id='ID_VIEW_SAG'> </canvas>"}
              ]
            }
          ]
        } //second column
      ]
    },
    {view:"resizer"},
    {
      //Footer
      template:"Log Area", height:100
    }
  ]
});
