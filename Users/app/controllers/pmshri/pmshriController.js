const express = require("express");
const routers = express.Router();
const Handler = require("../../handlers").pmshri;
const multer = require("multer");
const PDFDocument = require('pdfkit');
const PDFTable = require('pdfkit-table');
// SIDEBAR ROUTE

routers.post("/component-sidebar", async (req, res) => {
  return await Handler.componentsidebar(req, res);
});

//COMMON API'S LIKE STATE / DISTRICTS / SCHOOLS / ACTIVITY     START

routers.get("/state-list", async (req, res) => {
  return await Handler.stateList(req, res);
});
routers.post("/districts-list", async (req, res) => {
  return await Handler.districtList(req, res);
});

routers.post("/school-list", async (req, res) => {
  return await Handler.schoolList(req, res);
});

// get activities

routers.post("/get-major-component", async (req, res) => {
  return await Handler.getMajorComponent(req, res);
});
routers.post("/get-sub-component", async (req, res) => {
  return await Handler.getSubcomponent(req, res);
});
routers.post("/get-activity", async (req, res) => {
  return await Handler.getActivities(req, res);
});
routers.post("/get-activity-detail", async (req, res) => {
  return await Handler.getActivityDetail(req, res);
});

//COMMON API'S LIKE STATE / DISTRICTS / SCHOOLS // END //

// CONFIGURATION PLAN ROUTES

routers.post("/update_physical_asset", async (req, res) => {
  return await Handler.updatePhysicalAsset(req, res);

});
routers.post("/configure-activity-list", async (req, res) => {
  return await Handler.planActivityList(req, res);
});
routers.post("/configure-by-activity-list", async (req, res) => {
  return await Handler.configurePlanByActivity(req, res);
});

routers.post("/update-configure-activity-list", async (req, res) => {
  return await Handler.updateconfigureList(req, res);
});
routers.post(
  "/update-configure-activity-list-by-activity",
  async (req, res) => {
    return await Handler.updateconfigureListByActivity(req, res);
  }
);

routers.post("/update-configured-approve-plan", async (req, res) => {
  return await Handler.updateconfiguredApprovePlan(req, res);
});

routers.post("/approve-configuration-list", async (req, res) => {
  return await Handler.approveConfigurationList(req, res);
});

routers.post("/configured-recommendation-activity-list", async (req, res) => {
  return await Handler.getRecommandationList(req, res);
});

routers.post("/submit-approved-recommendation-planpmsri", async (req, res) => {
  return await Handler.submitApprovedPlanPmshri(req, res);
});

//APROVE PLAN STATE

routers.post("/get-approve-plans-by-state", async (req, res) => {
  return await Handler.getApprovePlanbyState(req, res);
});
routers.post("/update-status-approve-plans-by-state", async (req, res) => {
  return await Handler.updateStatusByStateApprovePlan(req, res);
});
routers.post("/update-consolidate-data", async (req, res) => {
  return await Handler.consolidateSchoolData(req, res);
});
routers.post("/update-approve-plans-by-state", async (req, res) => {
  return await Handler.updateconfigureListByState(req, res);
});

routers.post("/sub-components", async (req, res) => {
  return await Handler.subcomponent(req, res);
});

routers.post("/activity-master-options", async (req, res) => {
  return await Handler.activitymasteroptions(req, res);
});

routers.post("/activity-master-details", async (req, res) => {
  return await Handler.activitymasterdetails(req, res);
});

routers.post("/add-activity", async (req, res) => {
  return await Handler.addactivity(req, res);
});

routers.post("/edit-activity", async (req, res) => {
  return await Handler.editactivity(req, res);
});

// ALLOCATION

routers.post("/allocation-list", async (req, res) => {
  return await Handler.allocationList(req, res);
});
const storagesingle = multer.memoryStorage();
const uploadsingle = multer({ storage: storagesingle });
routers.post(
  "/state-temp-allocate-fund-uploaded-detail",
  uploadsingle.single("file"),
  async (req, res) => {
    return await Handler.submitTempAllocationList(req, res);
  }
);

routers.post("/state-allocate-fund-uploaded-detail", async (req, res) => {
  return await Handler.submitAllocationList(req, res);
});
routers.post("/cancel-allocation", async (req, res) => {
  return await Handler.DeleteTempAllocationList(req, res);
});
routers.post("/get-allocation-school-list", async (req, res) => {
  return await Handler.allocationSchoolList(req, res);
});
// DASHBOAR API'S START
routers.post("/pmshriDashbord", async (req, res) => {
  return await Handler.dashboardPm_Shri(req, res);
});
routers.post("/dashboard", async (req, res) => {
  return await Handler.dashboard(req, res);
});
routers.post("/dis-approve-school", async (req, res) => {
  return await Handler.disApprove(req, res);
});
// DASHBOARD API'S END

routers.post("/pmshri_financial-status", async (req, res) => {
  return await Handler.pmshridashboardFinancialStatus(req, res);
});

routers.post('/pdf', async (req, res) => {
  console.log("fbrjkhbgntrbmtrbvkmgbrvmgtb");
  try {
    const data = [
      {
        "id": 1,
        "name": "Leanne Graham",
        "username": "Bret",
        "email": "Sincere@april.biz",
        "address": {
          "street": "Kulas Light",
          "suite": "Apt. 556",
          "city": "Gwenborough",
          "zipcode": "92998-3874",
          "geo": {
            "lat": "-37.3159",
            "lng": "81.1496"
          }
        },
        "phone": "1-770-736-8031 x56442",
        "website": "hildegard.org",
        "company": {
          "name": "Romaguera-Crona",
          "catchPhrase": "Multi-layered client-server neural-net",
          "bs": "harness real-time e-markets"
        }
      },
      {
        "id": 2,
        "name": "Ervin Howell",
        "username": "Antonette",
        "email": "Shanna@melissa.tv",
        "address": {
          "street": "Victor Plains",
          "suite": "Suite 879",
          "city": "Wisokyburgh",
          "zipcode": "90566-7771",
          "geo": {
            "lat": "-43.9509",
            "lng": "-34.4618"
          }
        },
        "phone": "010-692-6593 x09125",
        "website": "anastasia.net",
        "company": {
          "name": "Deckow-Crist",
          "catchPhrase": "Proactive didactic contingency",
          "bs": "synergize scalable supply-chains"
        }
      },
      {
        "id": 3,
        "name": "Clementine Bauch",
        "username": "Samantha",
        "email": "Nathan@yesenia.net",
        "address": {
          "street": "Douglas Extension",
          "suite": "Suite 847",
          "city": "McKenziehaven",
          "zipcode": "59590-4157",
          "geo": {
            "lat": "-68.6102",
            "lng": "-47.0653"
          }
        },
        "phone": "1-463-123-4447",
        "website": "ramiro.info",
        "company": {
          "name": "Romaguera-Jacobson",
          "catchPhrase": "Face to face bifurcated interface",
          "bs": "e-enable strategic applications"
        }
      },
      {
        "id": 4,
        "name": "Patricia Lebsack",
        "username": "Karianne",
        "email": "Julianne.OConner@kory.org",
        "address": {
          "street": "Hoeger Mall",
          "suite": "Apt. 692",
          "city": "South Elvis",
          "zipcode": "53919-4257",
          "geo": {
            "lat": "29.4572",
            "lng": "-164.2990"
          }
        },
        "phone": "493-170-9623 x156",
        "website": "kale.biz",
        "company": {
          "name": "Robel-Corkery",
          "catchPhrase": "Multi-tiered zero tolerance productivity",
          "bs": "transition cutting-edge web services"
        }
      },
      {
        "id": 5,
        "name": "Chelsey Dietrich",
        "username": "Kamren",
        "email": "Lucio_Hettinger@annie.ca",
        "address": {
          "street": "Skiles Walks",
          "suite": "Suite 351",
          "city": "Roscoeview",
          "zipcode": "33263",
          "geo": {
            "lat": "-31.8129",
            "lng": "62.5342"
          }
        },
        "phone": "(254)954-1289",
        "website": "demarco.info",
        "company": {
          "name": "Keebler LLC",
          "catchPhrase": "User-centric fault-tolerant solution",
          "bs": "revolutionize end-to-end systems"
        }
      },
      {
        "id": 6,
        "name": "Mrs. Dennis Schulist",
        "username": "Leopoldo_Corkery",
        "email": "Karley_Dach@jasper.info",
        "address": {
          "street": "Norberto Crossing",
          "suite": "Apt. 950",
          "city": "South Christy",
          "zipcode": "23505-1337",
          "geo": {
            "lat": "-71.4197",
            "lng": "71.7478"
          }
        },
        "phone": "1-477-935-8478 x6430",
        "website": "ola.org",
        "company": {
          "name": "Considine-Lockman",
          "catchPhrase": "Synchronised bottom-line interface",
          "bs": "e-enable innovative applications"
        }
      },
      {
        "id": 7,
        "name": "Kurtis Weissnat",
        "username": "Elwyn.Skiles",
        "email": "Telly.Hoeger@billy.biz",
        "address": {
          "street": "Rex Trail",
          "suite": "Suite 280",
          "city": "Howemouth",
          "zipcode": "58804-1099",
          "geo": {
            "lat": "24.8918",
            "lng": "21.8984"
          }
        },
        "phone": "210.067.6132",
        "website": "elvis.io",
        "company": {
          "name": "Johns Group",
          "catchPhrase": "Configurable multimedia task-force",
          "bs": "generate enterprise e-tailers"
        }
      },
      {
        "id": 8,
        "name": "Nicholas Runolfsdottir V",
        "username": "Maxime_Nienow",
        "email": "Sherwood@rosamond.me",
        "address": {
          "street": "Ellsworth Summit",
          "suite": "Suite 729",
          "city": "Aliyaview",
          "zipcode": "45169",
          "geo": {
            "lat": "-14.3990",
            "lng": "-120.7677"
          }
        },
        "phone": "586.493.6943 x140",
        "website": "jacynthe.com",
        "company": {
          "name": "Abernathy Group",
          "catchPhrase": "Implemented secondary concept",
          "bs": "e-enable extensible e-tailers"
        }
      },
      {
        "id": 9,
        "name": "Glenna Reichert",
        "username": "Delphine",
        "email": "Chaim_McDermott@dana.io",
        "address": {
          "street": "Dayna Park",
          "suite": "Suite 449",
          "city": "Bartholomebury",
          "zipcode": "76495-3109",
          "geo": {
            "lat": "24.6463",
            "lng": "-168.8889"
          }
        },
        "phone": "(775)976-6794 x41206",
        "website": "conrad.com",
        "company": {
          "name": "Yost and Sons",
          "catchPhrase": "Switchable contextually-based project",
          "bs": "aggregate real-time technologies"
        }
      },
      {
        "id": 10,
        "name": "Clementina DuBuque",
        "username": "Moriah.Stanton",
        "email": "Rey.Padberg@karina.biz",
        "address": {
          "street": "Kattie Turnpike",
          "suite": "Suite 198",
          "city": "Lebsackbury",
          "zipcode": "31428-2261",
          "geo": {
            "lat": "-38.2386",
            "lng": "57.2232"
          }
        },
        "phone": "024-648-3804",
        "website": "ambrose.net",
        "company": {
          "name": "Hoeger LLC",
          "catchPhrase": "Centralized empowering task-force",
          "bs": "target end-to-end models"
        }
      }
    ]
    // Create a new PDF document
    const doc = new PDFDocument();

    // Load the font
    // doc.font('path/to/font.ttf');

    // Use the font
    doc.text('Hello, World!');

    // End the document
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating PDF');
  }
})


module.exports = routers;
