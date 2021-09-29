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
        },
        '/api/addresses': (req, res) => {
            const address = {
                "header": {
                    "uri": "https://api.ordnancesurvey.co.uk/places/v1/addresses/postcode?postcode=SW1",
                    "query": "postcode=SW1",
                    "offset": 0,
                    "totalresults": 254579,
                    "format": "JSON",
                    "dataset": "DPA",
                    "lr": "EN,CY",
                    "maxresults": 100,
                    "epoch": "81",
                    "output_srs": "EPSG:27700"
                },
                results: []
            }

            for (let i = 0; i < 10; i++) {
                address.results.push({
                    "DPA": {
                        "UPRN": "12101281" + i,
                        "UDPRN": "2392690" + i,
                        "ADDRESS": `${i}, ALTHORPE MEWS, LONDON, SW1 ${i}PD`,
                        "BUILDING_NUMBER": i,
                        "THOROUGHFARE_NAME": "ALTHORPE MEWS",
                        "POST_TOWN": "LONDON",
                        "POSTCODE": `SW11 ${i}PD`,
                        "RPC": "2",
                        "X_COORDINATE": 526874.0 + i,
                        "Y_COORDINATE": 176714.0 + i,
                        "STATUS": "APPROVED",
                        "LOGICAL_STATUS_CODE": "1",
                        "CLASSIFICATION_CODE": "RD08",
                        "CLASSIFICATION_CODE_DESCRIPTION": "Sheltered Accommodation",
                        "LOCAL_CUSTODIAN_CODE": 5960,
                        "LOCAL_CUSTODIAN_CODE_DESCRIPTION": "WANDSWORTH",
                        "POSTAL_ADDRESS_CODE": "D",
                        "POSTAL_ADDRESS_CODE_DESCRIPTION": "A record which is linked to PAF",
                        "BLPU_STATE_CODE": null,
                        "BLPU_STATE_CODE_DESCRIPTION": "Unknown/Not applicable",
                        "TOPOGRAPHY_LAYER_TOID": "osgb1000042165547",
                        "LAST_UPDATE_DATE": "13/02/2019",
                        "ENTRY_DATE": "19/03/2002",
                        "LANGUAGE": "EN",
                        "MATCH": 1.0,
                        "MATCH_DESCRIPTION": "EXACT"
                    }
                });
            }
            res.send(address);
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


