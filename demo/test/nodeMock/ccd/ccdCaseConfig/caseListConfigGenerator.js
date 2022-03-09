

const CaseField = {
    "label": "Case reference",
    "order": 1,
    "metadata": true,
    "case_field_id": "[CREATED_DATE]",
    "case_field_type": {
        "id": "Number",
        "type": "DateTime",
        "min": null,
        "max": null,
        "regular_expression": null,
        "fixed_list_items": [],
        "complex_fields": [],
        "collection_field_type": null
    },
    "display_context_parameter": null
};

class CaseListConfig{

    constructor(){
        this.caseListConfig = {
            columns : [],
            results:[],
            total:0
        }
        
    }

    addCaseField(caseFieldProps){
        const caseField = JSON.parse(JSON.stringify(CaseField));
        this.setObjectProps(caseField, caseFieldProps);
        this.caseListConfig.columns.push(caseField);
    }

    setCaseFieldTypeProps(caseFieldId, filedTypeProps){
        const CaseField = this.caseListConfig.columns.filter(caseField => {
            return caseField.case_field_id === caseFieldId
        });
        if (CaseField.length === 0){
            throw new Error(`Column case_field_id not found ${caseField}. Check if columns with case_field_id already added`);
        }
        this.setObjectProps(CaseField[0].case_field_type, filedTypeProps);
    }

    addCaseData(dataRows){
        for(let i = 0; i < dataRows.length; i++){
            const caseData = {
                case_id: (new Date()).getTime() + "" + Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
                case_fields:{

                },
                case_fields_formatted:{

                }
            }
            this.setObjectProps(caseData.case_fields, dataRows[i]);
            this.setObjectProps(caseData.case_fields_formatted, dataRows[i]);
            this.caseListConfig.results.push(caseData);
        }
    }


    getCaseListConfig(){
        return this.caseListConfig;
    }

    setObjectProps(fieldObj, props) {
        Object.keys(props).forEach(key => {
            fieldObj[key] = props[key];
        });
    }

}

module.exports = CaseListConfig;
