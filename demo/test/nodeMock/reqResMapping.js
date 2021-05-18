const ccdApiMock = require('./ccd/ccdApi');
const ccdReqResMapping = require('./ccd/reqResMapping');



const dummyCaseDetails = require('./ccd/caseDetails_data');

const requestMapping = {
   get:{
       
        ...ccdReqResMapping.get,

     
       '/api/jurisdictions':(req,res) => {
            res.send(getJurisdictions());
       },
      
        '/data/internal/cases/:caseid': (req,res) => {
            res.send(dummyCaseDetails);
        },
       
        '/data/caseworkers/:uid/jurisdictions/:jurisdiction/case-types/:caseType/cases/pagination_metadata': (req,res) => {
            res.send();
        }

    },
    post:{
       
        ...ccdReqResMapping.post,
      

    },
    put:{

    },
    delete:{

    }

}


function getJurisdictions(){
    return [{"id":"SSCS"},{"id":"AUTOTEST1"},{"id":"DIVORCE"},{"id":"PROBATE"},{"id":"PUBLICLAW"},{"id":"bulkscan"},{"id":"BULKSCAN"},{"id":"IA"},{"id":"EMPLOYMENT"},{"id":"CMC"}]
}


module.exports = { requestMapping};


