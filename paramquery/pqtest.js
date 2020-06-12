$(function () {
    var data = [
        { id: 1, company: 'Exxon Mobil', revenues: '339938.0', profits: '36130.0', check1: true },
        { id: 2, company: 'Wal-Mart Stores', revenues: '315654.0', profits: '11231.0', check1: false },
        { id: 3, company: 'Royal Dutch Shell', revenues: '306731.0', profits: '25311.0', check1: true },
        { id: 4, company: 'BP', revenues: '267600.0', profits: '22341.0', check1: false },
        { id: 5, company: 'General Motors', revenues: '192604.0', profits: '-10567.0', check1: true },
        { id: 6, company: 'Chevron', revenues: '189481.0', profits: '14099.0', check1: false },
        { id: 7, company: 'DaimlerChrysler', revenues: '186106.3', profits: '3536.3', check1: true },
        { id: 8, company: 'Toyota Motor', revenues: '185805.0', profits: '12119.6', check1: false },
        { id: 9, company: 'Ford Motor', revenues: '177210.0', profits: '2024.0', check1: true },
        { id: 10, company: 'ConocoPhillips', revenues: '166683.0', profits: '13529.0', check1: false },
        { id: 11, company: 'General Electric', revenues: '157153.0', profits: '16353.0', check1: true },
        { id: 12, company: 'Total', revenues: '152360.7', profits: '15250.0', check1: true },
        { id: 13, company: 'ING Group', revenues: '138235.3', profits: '8958.9', check1: true },
        { id: 14, company: 'Citigroup', revenues: '131045.0', profits: '24589.0', check1: true },
        { id: 15, company: 'AXA', revenues: '129839.2', profits: '5186.5', check1: true },
        { id: 16, company: 'Allianz', revenues: '121406.0', profits: '5442.4', check1: true },
        { id: 17, company: 'Volkswagen', revenues: '118376.6', profits: '1391.7', check1: true },
        { id: 18, company: 'Fortis', revenues: '112351.4', profits: '4896.3', check1: true },
        { id: 19, company: 'Crédit Agricole', revenues: '110764.6', profits: '7434.3', check1: true },
        { id: 20, company: 'American Intl. Group', revenues: '108905.0', profits: '10477.0', check1: true }
    ];

    var obj = {
        width: "flex",
        height: 400,
        resizable: true,
        columnBorders: false,
        draggable: true,
        editable: false,
        freezeCols: 1,
        pageModel: {type: "local", rPP: 20, rPPOptions: [10, 20, 30, 40, 50, 100]},
        colModel: [
            { title: "Rank", width: 100, dataType: "integer", dataIndx: "id", halign: "right", hidden: true},
            { title: "Company", width: 200, dataType: "string", dataIndx: "company", },
            { title: "Revenues ($ millions)", width: 150, dataType: "float", align: "right", dataIndx: "revenues" },
            { title: "Profits ($ millions)", width: 150, dataType: "float", align: "right", dataIndx: "profits" },
            { title: "", maxWidth: 30, minWidth: 30, align: "center", resizable: false, type: "checkBoxSelection",
                dataIndx: "check1", sortable: false, editable: false, cb: {all:true, header: true},
                render: function(ui){
                    // console.log("render", ui);
                    if(ui.cellData) return "";
                }
            },
        ],
        dataModel: {
            data: data
        },
        check: function(evt, ui){
            // console.log("check");
            // console.log(ui);
        },
        create: function (evt, ui) {
            var $grid = $(this);
            // console.log($grid);
            // console.log(grid);
            // console.log(grid.option("dataModel.data"));
            // console.log(ui.dataModel.data);
        }
    };
    var $grid = $("#grid_array").pqGrid(obj);
    // $grid.pqGrid("option", "freezeCols", 1);
    // $grid.pqGrid("refresh");
    // console.log($grid.pqGrid("option", "colModel"));
    $("#grid_btn").on("click", function(){
        // var dataAry = $grid.pqGrid("option", "dataModel.data");
        // dataAry.push({id: dataAry[dataAry.length - 1].id + 1,
        //                 company: "test", revenues: '1234.0', profits: '5431.0', check1: false});
        // $grid.pqGrid("refresh");
        // console.log($grid.pqGrid("option", "colModel"));
        // var colModels = $grid.pqGrid("option", "colModel");
        // for(var i=0; i<colModels.length; i++){
        //     if(colModels[i].hidden){
        //         colModels[i].hidden = false;
        //     }
        // }
        // $grid.pqGrid("refresh");
        if($grid.pqGrid("option", "disabled")){
            $grid.pqGrid("option", "disabled", false);
        }else{
            $grid.pqGrid("option", "disabled", true);
        }
    });

    $(".selector").pqGrid({
        selectChange: function(event, ui){
            console.log(ui);
        }
    })
});