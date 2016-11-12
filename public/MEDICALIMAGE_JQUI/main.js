//Sample Tree Data Sample
var tree_data =  [
{id:"root", value:"Medical Data(Testing)", open:true, data:[
    { id:"1", open:true, value:"Mesh", data:[
        { id:"1.1", value:"Mandible" },
        { id:"1.2", value:"Fibula-Right" },
        { id:"1.3", value:"Fibula-Left" }
    ]},
    { id:"2", open:false, value:"Volume", data:[
        { id:"2.1", value:"001.dcm" },
        { id:"2.2", value:"002.dcm" },
        { id:"2.3", value:"003.dcm" },
        { id:"2.4", value:"004.dcm" },
        { id:"2.5", value:"005.dcm" },
        { id:"2.6", value:"006.dcm" },
        { id:"2.7", value:"007.dcm" },
    ]}
]}
]

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
        {id:"ID_VIEW_TREE",view:"tree",template:"{common.icon()} {common.checkbox()} {common.folder()} #value#", data: tree_data, width:window.innerWidth/5 },//first column
        {view:"resizer"},
        {
          cols:[
            {id:"ID_VIEW_MAIN", view:"template", width:window.innerWidth/1.7},
            {view:"resizer"},
            {
              rows:[
                {id:"ID_VIEW_AXL", view:"template"},
                {view:"resizer"},
                {id:"ID_VIEW_COR", view:"template"},
                {view:"resizer"},
                {id:"ID_VIEW_SAG", view:"template"}
              ]
            }
          ]
        } //second column
      ]
    },
    {view:"resizer"},
    {
      //Footer
      id:"ID_VIEW_FOOTER", template:"Log Area", height:100
    }
  ]
});
