const express = require('express');
const routers = express.Router();
const Excel = require('../../handlers').Excel;
const Model = require("../../models");
const xlsx = require('xlsx');

routers.get('/users', async (req, res) => {
    const request = req.body;
    const udise = ['udise_code as Udise Code'];
    const state = ['ms.name as State Name'];
    const district = ['md.name as District Name'];
    var select = ['u.name as Name', 'email as Email', 'mobile as Mobile', 'mr.name as Role', db.raw("CASE WHEN permission = 1 THEN Editor ELSE Viwer END AS cost")];
    var Query = Model.User.query().join('master_roles as mr', 'mr.id', '=', 'u.role_id');

    if (request.role > 2) {
        var Query = Query.join('master_states as ms', 'ms.id', '=', 'u.state_id');
        var select = [...select, ...state];
        if (request.role > 5) {
            var select = [...select, ...district];
            if (request.role > 6) {
                var select = [...udise, ...select];
            }
            var Query = Query.join('master_districts as md', 'md.id', '=', 'u.district_id');
        }
        if (request.state > 0) {
            var Query = Query.where('u.state_id', request.state);
        }
        if (request.district > 0) {
            var Query = Query.where('u.district_id', request.district);
        }
    }

    req.data = await Query.select(select).where({ role_id: request.role });
    req.fname = 'users';
    return Excel.handle(req, res);
});

routers.get('/benchmark-schools', async (req, res) => {
    const request = req.body;
    var select = [
        'udise_code as Udise Code', 'school_name as School Name', 'email as Email', 'mobile as Mobile',
        'state_name as State Name', 'district_name as District Name', 'block_name as Block Name',
        'mc.name as Category Name', 'total_enrolment as Total Enrolments',
    ];

    var Query = Model.Benchmark.query();
    if (request.state > 0) {
        var Query = Query.where('bs.state_id', request.state);
    }
    if (request.district > 0) {
        var Query = Query.where('bs.district_id', request.district);
    }
    var Query = Query.join('master_categories as mc', 'mc.id', '=', 'bs.category_id');

    if (request.final_flag > 0) {
        var Query = Query.where('bs.final_flag', 1);
    }
    if (request.district_verification > 0) {
        var Query = Query.where('bs.district_verification', '<>', null);
    }
    if (request.pass_status > 0) {
        var Query = Query.where('bs.pass_status', 1);
    }
    if (request.pass_by_district > 0) {
        var Query = Query.where('bs.pass_by_district', 1);
    }

    req.data = await Query.select(select);
    req.fname = 'benchmark-schools';
    return Excel.handle(req, res);
});

// NITIN WORK THIS PART
routers.get('/downloadexcels', async (req, res) => {
    // const data = [
    //     { Name: 'John Doe', Age: 30, City: 'New York' },
    //     { Name: 'Jane Smith', Age: 25, City: 'London' },
    //     // ... add more objects as needed
    // ];
    const request = req.body;
    var select = ['title', 'type_code', 'district_id', 'state_id',
        'block_id', 'links_to_school', 'description', 'status',
        'udise_code',]
    var Query = Model.Mastercommondata.query();
    req.data = await Query.select(select);

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(req.data);

    //     let titleRow = worksheet.addRow([title]);
    //   worksheet.addRow([]);//blank row add


    //   const titlename = worksheet.addRow(['Name  ' + '']) 
    //   const titleperiod = worksheet.addRow(['Period  ' + '']) 
    //   const titleposition = worksheet.addRow(['Position  ' + '']) 

    //   titlename.getCell(2).value = 'Thomos L Phillps';
    //   titleperiod.getCell(2).value = 'jul-19';
    //   titleposition.getCell(2).value = 'Principal';


    //   titleRow.font = { name: 'Times New Roman', family: 6, size: 16, bold: true }
    //   titlename.font = { name: 'Times New Roman',  family: 6, size:12, bold: true }
    //   titleperiod.font = { name: 'Times New Roman',  family: 6, size: 12, bold: true }
    //   titleposition.font = { name: 'Times New Roman', family: 6, size: 12, bold: true }

    //   worksheet.addRow([]);

    //  worksheet.eachRow(function (Row, rowNum) {
    //     Row.eachCell(function (Cell, cellNum) {
    //         /** cell.alignment not work */
    //         if (cellNum == 4) 
    //         {
    //             Cell.alignment = {
    //                 vertical: 'middle',
    //                 horizontal: 'right', wrapText: true,
    //                }
    //         }
    //         else
    //         {
    //             Cell.alignment = {
    //                 vertical: 'middle',
    //                 horizontal: 'left', wrapText: true}}
    //     })
    // })


    // Create a workbook with a single worksheet

    // ws.eachRow(function (Row, rowNum) {
    //     Row.eachCell(function (Cell, cellNum) {
    //         /** cell.alignment not work */
    //         if (cellNum == 4) {
    //             Cell.alignment = {
    //                 vertical: 'middle',
    //                 horizontal: 'right', wrapText: true,
    //             }
    //         }
    //         else {
    //             Cell.alignment = {
    //                 vertical: 'middle',
    //                 horizontal: 'left', wrapText: true
    //             }
    //         }
    //     })
    // })

    // Custom styles for header and cells
    const styles = {
        header: {
            font: { bold: true, color: { rgb: 'FF0000' } },
            fill: { fgColor: 'FFFF00' },
            border: { top: { style: 'thin' }, bottom: { style: 'thin' } },
        },
        cell: {
            font: { italic: true, color: { rgb: '0000FF' } },
            fill: { bgColor: 'C0C0C0' },
            border: { top: { style: 'thin' }, bottom: { style: 'thin' } },
        },
    };
    // Apply custom styles to header row
    const headerRange = xlsx.utils.decode_range(ws['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = { r: headerRange.s.r, c: C };
        const cellRef = xlsx.utils.encode_cell(cellAddress);
        ws[cellRef].s = styles.header; // Apply style to header cell
    }
    // Apply custom styles to each cell
    const dataRange = xlsx.utils.decode_range(ws['!ref']);
    for (let R = dataRange.s.r; R <= dataRange.e.r; ++R) {
        for (let C = dataRange.s.c; C <= dataRange.e.c; ++C) {
            const cellAddress = { r: R, c: C };
            const cellRef = xlsx.utils.encode_cell(cellAddress);
            ws[cellRef].s = styles.cell; // Apply style to each data cell
        }
    }

    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelFileName = 'custom_style_created_file.xlsx';
    xlsx.writeFile(wb, excelFileName);



    // Save the workbook to a file
    // const excelFileName = 'styles?_downloaded_file.xlsx';
    // xlsx.writeFile(wb, excelFileName);
    // res.send(a)



    // WORKING PROPER 
    const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=downloaded_file.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
})
























module.exports = routers;