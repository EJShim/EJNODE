//Sample Tree Data Sa
var tree_data =  [
    { id:"ID_TREE_MESH", open:true, value:"Mesh"},
    { id:"ID_TREE_VOLUME", open:false, value:"Volume"}
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
        {id:"ID_BUTTON_IMPORT_MESH", view:"button",  value:"Import Mesh", width:100},
        {id:"ID_BUTTON_IMPORT_VOLUME", view:"button", value:"Import Dicom", width:100}
      ]
    },
    {
      cols:[
        {
          id:"ID_LEFT_AREA",
          gravity:0.3,
          rows:[
            {id:"ID_VIEW_TREE",view:"tree",template:"{common.icon()} {common.checkbox()} {common.folder()} #value#", data:tree_data},//first column,
            {view:"resizer"},
            propertysheet_1
          ]
        },
        {view:"resizer"},
        {
          rows:[
            {
              cols:[
                {id:"ID_VIEW_MAIN", view:"template", gravity:2.5},
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
