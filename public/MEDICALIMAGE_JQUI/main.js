//Sample Tree Data Sample
var tree_data =  [
{id:"root", value:"Cars", open:true, data:[
    { id:"1", open:true, value:"Toyota", data:[
        { id:"1.1", value:"Avalon" },
        { id:"1.2", value:"Corolla" },
        { id:"1.3", value:"Camry" }
    ]},
    { id:"2", open:true, value:"Skoda", data:[
        { id:"2.1", value:"Octavia" },
        { id:"2.2", value:"Superb" }
    ]}
]}
]

webix.ui({
  view:"layout",
  responsive:true,
  
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
        { view:"tree", data: tree_data, id:"main", width:200 },//first column
        {view:"resizer"},
        {
          cols:[
            {
              rows:[
                {id:"ID_VIEW_MAIN", view:"template", template:""}
              ]
            },{view:"resizer"},
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
