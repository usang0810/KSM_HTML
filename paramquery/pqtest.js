$(function () {
    var data = [
        { id: 1, company: 'Exxon Mobil', revenues: '339938.0', profits: '36130.0' },
        { id: 2, company: 'Wal-Mart Stores', revenues: '315654.0', profits: '11231.0' },
        { id: 3, company: 'Royal Dutch Shell', revenues: '306731.0', profits: '25311.0' },
        { id: 4, company: 'BP', revenues: '267600.0', profits: '22341.0' },
        { id: 5, company: 'General Motors', revenues: '192604.0', profits: '-10567.0' },
        { id: 6, company: 'Chevron', revenues: '189481.0', profits: '14099.0' },
        { id: 7, company: 'DaimlerChrysler', revenues: '186106.3', profits: '3536.3' },
        { id: 8, company: 'Toyota Motor', revenues: '185805.0', profits: '12119.6' },
        { id: 9, company: 'Ford Motor', revenues: '177210.0', profits: '2024.0' },
        { id: 10, company: 'ConocoPhillips', revenues: '166683.0', profits: '13529.0' },
        { id: 11, company: 'General Electric', revenues: '157153.0', profits: '16353.0' },
        { id: 12, company: 'Total', revenues: '152360.7', profits: '15250.0' },
        { id: 13, company: 'ING Group', revenues: '138235.3', profits: '8958.9' },
        { id: 14, company: 'Citigroup', revenues: '131045.0', profits: '24589.0' },
        { id: 15, company: 'AXA', revenues: '129839.2', profits: '5186.5' },
        { id: 16, company: 'Allianz', revenues: '121406.0', profits: '5442.4' },
        { id: 17, company: 'Volkswagen', revenues: '118376.6', profits: '1391.7' },
        { id: 18, company: 'Fortis', revenues: '112351.4', profits: '4896.3' },
        { id: 19, company: 'Crédit Agricole', revenues: '110764.6', profits: '7434.3' },
        { id: 20, company: 'American Intl. Group', revenues: '108905.0', profits: '10477.0' }
    ];

    var obj = {
        width: 700,
        height: 400,
        colModel: [{
            title: "Rank",
            width: 100,
            dataType: "integer",
            dataIndx: "id"
        },
        {
            title: "Company",
            width: 200,
            dataType: "string",
            dataIndx: "company"
        },
        {
            title: "Revenues ($ millions)",
            width: 150,
            dataType: "float",
            align: "right",
            dataIndx: "revenues"
        },
        {
            title: "Profits ($ millions)",
            width: 150,
            dataType: "float",
            align: "right",
            dataIndx: "profits"
        }
        ],
        dataModel: {
            data: data
        },
        create: function(evt, ui){
            var $grid = $(this);
            var grid = $grid.pqGrid("getInstance").grid;
            console.log(grid.option("dataModel.data"));
            console.log(ui.dataModel.data);
        }
    };
    var $grid = $("#grid_array").pqGrid(obj);
    // console.log($grid.pqGrid("option", "colModel"));
});