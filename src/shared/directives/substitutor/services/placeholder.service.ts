import { Injectable } from '@angular/core';
import { FieldsUtils } from '../../../services/fields/fields.utils';

// @dynamic
@Injectable()
export class PlaceholderService {

    private static readonly PLACEHOLDER_CONTENT_PATTERN = /^[a-zA-Z0-9_.\]\[]+$/;
    private static readonly STARTING_PLACEHOLDER = '$';
    private static readonly OPENING_PLACEHOLDER = '{';
    private static readonly CLOSING_PLACEHOLDER = '}';
    private static readonly PLACEHOLDER_PATTERN = /\$\{[a-zA-Z0-9_.\]\[]+\}/;
    private static readonly NEW_LINE = `
___
`;

    constructor(
        private fieldsUtils: FieldsUtils
      ) { }

    resolvePlaceholders(pageFormFields, stringToResolve): string {
        let pt = new PlaceholderService.ProgressTracker({pageFormFields: pageFormFields, stringToResolve: stringToResolve});
        while (this.hasUnresolvedPlaceholder(pt)) {
            this.resetProgressTracker(pt);
            let originalStringToResolve = pt.stringToResolve;
            pt.isCollecting = false;

            if (pt.stringToResolve && typeof pt.stringToResolve === 'string') {
                while (pt.numberCollectionItemsAsPlaceholder-- > 0) {
                    while (pt.scanIndex < pt.stringToResolve.length) {
                        if (this.isStartPlaceholderAndNotCollecting(pt)) {
                            pt.startSubstitutionIndex = pt.scanIndex;
                            pt.isCollecting = true;
                        } else if (pt.isCollecting) {
                            if (this.isClosingPlaceholder(pt)) {
                                this.substitute(pt);
                            } else if (!this.isOpeningPlaceholder(pt)) {
                                pt.fieldIdToSubstitute += pt.stringToResolve.charAt(pt.scanIndex);
                            }
                        }
                        pt.scanIndex++
                    }
                    this.appendOriginalStringIfCollectionItemAsPlaceholder(pt, originalStringToResolve);
                }
            }
        }
        return pt.stringToResolve;
    }

    private substitute(pt: PlaceholderService.ProgressTracker) {
        if (this.isMatchingPlaceholderPattern(pt) && this.isFieldIdInFormFields(pt)) {
            this.updateNumberOfCollectionItemsAsPlaceholder(pt);
            if (this.isFieldIdToSubstituteReferringItself(pt)) {
                this.substituteWithEmptyString(pt);
            } else {
                this.substituteFromFormFields(pt);
            }
        } else {
                this.substituteWithEmptyString(pt);
        }
        pt.isCollecting = false;
        pt.fieldIdToSubstitute = '';
    }

    private appendOriginalStringIfCollectionItemAsPlaceholder(pt: PlaceholderService.ProgressTracker, originalStringToResolve) {
        if (pt.collectionItemIndex < pt.numberCollectionItemsAsPlaceholder - 1) {
            pt.stringToResolve += PlaceholderService.NEW_LINE + originalStringToResolve;
            pt.collectionItemIndex += 1;
        }
    }

    private resetProgressTracker(pt: PlaceholderService.ProgressTracker) {
        pt.scanIndex = 0;
        pt.numberCollectionItemsAsPlaceholder = 1;
        pt.collectionItemIndex = 0;
        pt.fieldIdToSubstitute = '';
        pt.startSubstitutionIndex = -1;
        pt.isCollecting = false;
    }

    private updateNumberOfCollectionItemsAsPlaceholder(pt: PlaceholderService.ProgressTracker) {
        if (pt.fieldIdToSubstitute.split('.').length > 1) {
            let newNumberOfCollectionItemsAsPlaceholder = this.getNumberOfCollectionItemsIfAny(pt.pageFormFields, pt.fieldIdToSubstitute);
            pt.numberCollectionItemsAsPlaceholder = this.getNewNumberOfCollectionItemsIfHigher(newNumberOfCollectionItemsAsPlaceholder,
                pt.numberCollectionItemsAsPlaceholder);
        }
    }

    private substituteWithEmptyString(pt: PlaceholderService.ProgressTracker) {
        let replacedString = pt.stringToResolve.substring(pt.startSubstitutionIndex)
            .replace('${'.concat(pt.fieldIdToSubstitute).concat('}'), '');
        pt.stringToResolve = pt.stringToResolve.substring(0, pt.startSubstitutionIndex).concat(replacedString);
        pt.scanIndex = pt.startSubstitutionIndex;
    }

    private substituteFromFormFields(pt: PlaceholderService.ProgressTracker) {
        let replacedString = pt.stringToResolve.substring(pt.startSubstitutionIndex)
            .replace('${'.concat(pt.fieldIdToSubstitute).concat('}'), this.getSubstitutionValueOrEmpty(pt));
        pt.stringToResolve = pt.stringToResolve.substring(0, pt.startSubstitutionIndex).concat(replacedString);
        this.resetScanIndexAfterSubstitution(pt);
    }

    private isFieldIdToSubstituteReferringItself(pt: PlaceholderService.ProgressTracker) {
        let value = this.getSubstitutionValueOrEmpty(pt);
        return '${'.concat(pt.fieldIdToSubstitute).concat('}') === value;
    }

    private hasUnresolvedPlaceholder(pt: PlaceholderService.ProgressTracker) {
        return pt.stringToResolve && pt.stringToResolve.match(PlaceholderService.PLACEHOLDER_PATTERN);
    }

    private getNewNumberOfCollectionItemsIfHigher(newNumberOfCollectionItemsAsPlaceholder, numberCollectionItemsAsPlaceholder) {
        return newNumberOfCollectionItemsAsPlaceholder > numberCollectionItemsAsPlaceholder ?
                                                    newNumberOfCollectionItemsAsPlaceholder :
                                                    numberCollectionItemsAsPlaceholder;
    }

    private getNumberOfCollectionItemsIfAny(pageFormFields, fieldIdToSubstitute) {
        let fieldIds = fieldIdToSubstitute.split('.');
        let pageFormFieldsClone = this.fieldsUtils.cloneObject(pageFormFields);
        let numberCollectionItemsAsPlaceholder = 1;

        for (let index = 0; index < fieldIds.length; index++) {
            if (this.isCollection(pageFormFieldsClone)) {
                numberCollectionItemsAsPlaceholder = pageFormFieldsClone.length;
                break;
            } else if (pageFormFieldsClone[fieldIds[index]] === undefined) {
                break;
            } else {
                pageFormFieldsClone = pageFormFieldsClone[fieldIds[index]];
            }
        }
        return numberCollectionItemsAsPlaceholder;
    }

    private isMatchingPlaceholderPattern(pt: PlaceholderService.ProgressTracker) {
        return pt.fieldIdToSubstitute.match(PlaceholderService.PLACEHOLDER_CONTENT_PATTERN);
    }

    private isFieldIdInFormFields(pt: PlaceholderService.ProgressTracker) {
        let fieldValue = this.getFieldValue(pt.pageFormFields, pt.fieldIdToSubstitute, pt.collectionItemIndex);
        return fieldValue ? this.isSimpleTypeOrCollectionOfSimpleTypes(fieldValue) : fieldValue !== undefined;
    }

    private isSimpleTypeOrCollectionOfSimpleTypes(fieldValue) {
        return !this.isObject(fieldValue) && (this.isArray(fieldValue) ? this.isSimpleArray(fieldValue) : true);
    }

    private isSimpleArray(fieldValue) {
        return !this.isObject(fieldValue[0]) && !Array.isArray(fieldValue[0]) && fieldValue[0] !== undefined;
    }

    private isStartingPlaceholder(pt: PlaceholderService.ProgressTracker): boolean {
        return pt.stringToResolve.charAt(pt.scanIndex) === PlaceholderService.STARTING_PLACEHOLDER;
    }

    private isStartPlaceholderAndNotCollecting(pt): boolean {
        return this.isStartingPlaceholder(pt) && !pt.isCollecting;
    }

    private isClosingPlaceholder(pt: PlaceholderService.ProgressTracker): boolean {
        return pt.stringToResolve.charAt(pt.scanIndex) === PlaceholderService.CLOSING_PLACEHOLDER;
    }

    private isOpeningPlaceholder(pt: PlaceholderService.ProgressTracker): boolean {
        return pt.stringToResolve.charAt(pt.scanIndex) === PlaceholderService.OPENING_PLACEHOLDER;
    }

    private resetScanIndexAfterSubstitution(pt: PlaceholderService.ProgressTracker) {
        pt.scanIndex = pt.startSubstitutionIndex + this.getSubstitutionValueLengthOrZero(pt);
    }

    private getSubstitutionValueOrEmpty(pt: PlaceholderService.ProgressTracker) {
        let fieldValue = this.getFieldValue(pt.pageFormFields, pt.fieldIdToSubstitute, pt.collectionItemIndex);
        if (fieldValue instanceof Array) {
            fieldValue = fieldValue.join(', ');
        }
        return fieldValue ? fieldValue : '';
    }

    private getFieldValue(pageFormFields, fieldIdToSubstitute, collectionItemIndex) {
        let fieldIds = fieldIdToSubstitute.split('.');
        for (let index = 0; index < fieldIds.length; index++) {
            if (this.isMultiSelectValue(pageFormFields, fieldIds, index)) {
                pageFormFields = pageFormFields[fieldIds[index] + FieldsUtils.LABEL_SUFFIX];
            } else if (this.isCollection(pageFormFields)) {
                pageFormFields = pageFormFields[collectionItemIndex]['value'][fieldIds[index]];
            } else if (this.isComplex(pageFormFields, fieldIds, index)) {
                pageFormFields = pageFormFields[fieldIds[index]];
            } else {
                return undefined;
            }
        }
        if (this.isCollection(pageFormFields)) {
            pageFormFields = pageFormFields.map(fieldValue => fieldValue['value']);
        }
        return pageFormFields;
    }

    private isMultiSelectValue(pageFormFields, fieldIds, index) {
        let field = pageFormFields[fieldIds[index]];
        return this.isNonEmptyArray(field) && !this.isCollectionWithValue(field);
    }

    private isComplex(pageFormFields, fieldIds, index) {
        return pageFormFields[fieldIds[index]];
    }

    private isNonEmptyArray(pageFormFields) {
        return Array.isArray(pageFormFields) && pageFormFields[0];
    }

    private isCollection(pageFormFields) {
        return this.isNonEmptyArray(pageFormFields) && this.isCollectionWithValue(pageFormFields);
    }

    private isCollectionWithValue(pageFormFields) {
        return pageFormFields[0]['value'];
    }

    private getSubstitutionValueLengthOrZero(pt: PlaceholderService.ProgressTracker) {
        return pt.pageFormFields[pt.fieldIdToSubstitute] ? this.getSubstitutionValueOrEmpty(pt).toString().length : 0;
    }

    private getType(elem): string {
        return Object.prototype.toString.call(elem).slice(8, -1);
    }

    private isObject(elem) {
        return this.getType(elem) === 'Object';
    };

    private isArray(elem) {
        return this.getType(elem) === 'Array';
    };
}

export namespace PlaceholderService {
    export class ProgressTracker {
        stringToResolve: string;
        pageFormFields: object;
        scanIndex: number;
        numberCollectionItemsAsPlaceholder: number;
        collectionItemIndex: number;
        fieldIdToSubstitute: string;
        startSubstitutionIndex: number;
        isCollecting: boolean;
        constructor(values: {
            stringToResolve: string,
            pageFormFields: any}) {
              this.stringToResolve = values.stringToResolve;
              this.pageFormFields = values.pageFormFields;
        }
    };
}
