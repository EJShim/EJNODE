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



////Sample Property Sheets
var color_options = [
    {id:1, value:"red"},
    {id:2, value:"blue"},
    {id:3, value:"green"},
    {id:4, value:"orange"},
    {id:5, value:"grey"},
    {id:6, value:"yellow"}
];

var position_options = [
    {id:1, value:"left"},
    {id:2, value:"right"},
    {id:3, value:"top"},
    {id:4, value:"bottom"}
];


var propertysheet_1 = {
view:"property",  id:"ID_VIEW_PROPERTY",
elements:[
  { label:"Property(TEST)", type:"label" },
  { label:"Width", type:"text", id:"width", value: 250},
  { label:"Height", type:"text", id:"height"},
        { label:"Password", type:"password", id:"pass"},
  { label:"Data loading", type:"label" },
  { label:"Data url", type:"text", id:"url", value:"http://webix.com/data"},
        { label:"Type", type:"select", options:["json","xml","csv"], id:"type"},
        { label:"Position", type:"select", options:position_options, id:"position"},
        { label:"Date", type:"date", id:"date", format:webix.i18n.dateFormatStr},
        { label:"Color", type:"combo", options:color_options, id:"color"},
  { label:"Use JSONP", type:"checkbox", id:"jsonp"}
]
};


////MainFrm
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
        {
          id:"ID_LEFT_AREA",
          rows:[
            {id:"ID_VIEW_TREE",view:"tree",template:"{common.icon()} {common.checkbox()} {common.folder()} #value#", data: tree_data, width:window.innerWidth/5 },//first column,
            {view:"resizer"},
            propertysheet_1
          ]
        },
        {view:"resizer"},
        {
          rows:[
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
            },

              {view:"resizer"},
              {
                //Footer
                id:"ID_VIEW_FOOTER", template:"Log Area", height:100
              }

          ]
        } //second column
      ]
    }
  ]
});
