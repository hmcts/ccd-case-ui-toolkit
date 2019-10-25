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

    static ProgressTracker = class {
        stringToResolve;
        pageFormFields;
        scanIndex;
        numberCollectionItemsAsPlaceholder;
        collectionItemIndex;
        fieldIdToSubstitute;
        startSubstitutionIndex;
        constructor(values: {
            stringToResolve: string,
            pageFormFields: any}) {
              this.stringToResolve = values.stringToResolve;
              this.pageFormFields = values.pageFormFields;
          }
    };

    constructor(
        private fieldsUtils: FieldsUtils
      ) { }

    resolvePlaceholders(pageFormFields, stringToResolve): string {
        let pt = new PlaceholderService.ProgressTracker({pageFormFields: pageFormFields, stringToResolve: stringToResolve});
        while (this.hasUnresolvedPlaceholder(pt)) {
            this.resetProgressTracker(pt);
            let originalStringToResolve = pt.stringToResolve;
            let isCollecting = false;

            if (pt.stringToResolve && typeof pt.stringToResolve === 'string') {
                while (pt.numberCollectionItemsAsPlaceholder-- > 0) {

                    while (pt.scanIndex < pt.stringToResolve.length) {
                        if (this.isStartPlaceholderAndNotCollecting(pt, isCollecting)) {
                            pt.startSubstitutionIndex = pt.scanIndex;
                            isCollecting = true;
                        } else if (isCollecting) {
                            if (this.isClosingPlaceholder(pt)) {
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
                                isCollecting = false;
                                pt.fieldIdToSubstitute = '';
                            } else if (!this.isOpeningPlaceholder(pt)) {
                                pt.fieldIdToSubstitute += pt.stringToResolve.charAt(pt.scanIndex);
                            }
                        }
                        pt.scanIndex++
                    }
                    this.incrementCollectionItemIndex(pt, originalStringToResolve);
                }
            }
        }
        return pt.stringToResolve;
    }

    private incrementCollectionItemIndex(pt, originalStringToResolve) {
        if (pt.collectionItemIndex < pt.numberCollectionItemsAsPlaceholder - 1) {
            pt.stringToResolve += PlaceholderService.NEW_LINE + originalStringToResolve;
            pt.collectionItemIndex += 1;
        }
    }

    private resetProgressTracker(pt) {
        pt.scanIndex = 0;
        pt.numberCollectionItemsAsPlaceholder = 1;
        pt.collectionItemIndex = 0;
        pt.fieldIdToSubstitute = '';
        pt.startSubstitutionIndex = -1;
    }

    private updateNumberOfCollectionItemsAsPlaceholder(pt) {
        if (pt.fieldIdToSubstitute.split('.').length > 1) {
            let newNumberOfCollectionItemsAsPlaceholder = this.getNumberOfCollectionItemsIfAny(pt.pageFormFields, pt.fieldIdToSubstitute);
            pt.numberCollectionItemsAsPlaceholder = this.getNewNumberOfCollectionItemsIfHigher(newNumberOfCollectionItemsAsPlaceholder,
                pt.numberCollectionItemsAsPlaceholder);
        }
    }

    private substituteWithEmptyString(pt) {
        let replacedString = pt.stringToResolve.substring(pt.startSubstitutionIndex)
            .replace('${'.concat(pt.fieldIdToSubstitute).concat('}'), '');
        pt.stringToResolve = pt.stringToResolve.substring(0, pt.startSubstitutionIndex).concat(replacedString);
        pt.scanIndex = pt.startSubstitutionIndex;
    }

    private substituteFromFormFields(pt) {
        let replacedString = pt.stringToResolve.substring(pt.startSubstitutionIndex)
            .replace('${'.concat(pt.fieldIdToSubstitute).concat('}'), this.getSubstitutionValueOrEmpty(pt));
        pt.stringToResolve = pt.stringToResolve.substring(0, pt.startSubstitutionIndex).concat(replacedString);
        this.resetScanIndexAfterSubstitution(pt);
    }

    private isFieldIdToSubstituteReferringItself(pt) {
        let value = this.getSubstitutionValueOrEmpty(pt);
        return '${'.concat(pt.fieldIdToSubstitute).concat('}') === value;
    }

    private hasUnresolvedPlaceholder(pt) {
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
            if (this.isNonEmptyCollection(pageFormFieldsClone)) {
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

    private isMatchingPlaceholderPattern(pt) {
        return pt.fieldIdToSubstitute.match(PlaceholderService.PLACEHOLDER_CONTENT_PATTERN);
    }

    private isFieldIdInFormFields(pt) {
        let fieldValue = this.getFieldValue(pt.pageFormFields, pt.fieldIdToSubstitute,
            pt.collectionItemIndex);
        return fieldValue ? this.isSimpleTypeOrCollectionOfSimpleTypes(fieldValue) : fieldValue !== undefined;
    }

    private isSimpleTypeOrCollectionOfSimpleTypes(fieldValue) {
        return !this.isObject(fieldValue) && (this.isArray(fieldValue) ? this.isSimpleArray(fieldValue) : true);
    }

    private isSimpleArray(fieldValue) {
        return !this.isObject(fieldValue[0]) && !Array.isArray(fieldValue[0]) && fieldValue[0] !== undefined;
    }

    private isStartingPlaceholder(pt): boolean {
        return pt.stringToResolve.charAt(pt.scanIndex) === PlaceholderService.STARTING_PLACEHOLDER;
    }

    private isStartPlaceholderAndNotCollecting(pt, isCollectingPlaceholder): boolean {
        return this.isStartingPlaceholder(pt) && !isCollectingPlaceholder;
    }

    private isClosingPlaceholder(pt): boolean {
        return pt.stringToResolve.charAt(pt.scanIndex) === PlaceholderService.CLOSING_PLACEHOLDER;
    }

    private isOpeningPlaceholder(pt): boolean {
        return pt.stringToResolve.charAt(pt.scanIndex) === PlaceholderService.OPENING_PLACEHOLDER;
    }

    private resetScanIndexAfterSubstitution(pt) {
        pt.scanIndex = pt.startSubstitutionIndex + this.getSubstitutionValueLengthOrZero(pt);
    }

    private getSubstitutionValueOrEmpty(pt) {
        let fieldValue = this.getFieldValue(pt.pageFormFields, pt.fieldIdToSubstitute, pt.collectionItemIndex);
        if (fieldValue instanceof Array) {
            fieldValue = fieldValue.join(', ');
        }
        return fieldValue ? fieldValue : '';
    }

    private getFieldValue(pageFormFields, fieldIdToSubstitute, collectionItemIndex) {
        let fieldIds = fieldIdToSubstitute.split('.');
        for (let index = 0; index < fieldIds.length; index++) {
            if (this.isNonEmptyCollection(pageFormFields) && this.isLeaf(fieldIds.length, index)) {
                let placeholderSuffix = fieldIds[fieldIds.length - 1];
                pageFormFields = pageFormFields[collectionItemIndex]['value'][placeholderSuffix];
                return pageFormFields;
            } else {
                if (pageFormFields !== undefined && this.isNonEmptyArray(pageFormFields[fieldIds[index]])
                    && !this.isCollection(pageFormFields[fieldIds[index]])) {
                    pageFormFields = pageFormFields[fieldIds[index] + FieldsUtils.LABEL_SUFFIX];
                } else if (this.isNonEmptyCollection(pageFormFields)) {
                    pageFormFields = pageFormFields[collectionItemIndex]['value'][fieldIds[index]];
                } else if (pageFormFields !== undefined  && pageFormFields[fieldIds[index]] !== undefined) {
                    pageFormFields = pageFormFields[fieldIds[index]];
                } else {
                    return undefined;
                }
            }
        }
        if (this.isNonEmptyArray(pageFormFields) && this.isCollection(pageFormFields)) {
            pageFormFields = pageFormFields.map(fieldValue => fieldValue['value']);
        }
        return pageFormFields;
    }

    private isLeaf(length, currentIndex) {
        return length === currentIndex + 1;
    }

    private isNonEmptyCollection(pageFormFields) {
        return this.isNonEmptyArray(pageFormFields) && this.isCollection(pageFormFields);
    }

    private isNonEmptyArray(pageFormFields) {
        return Array.isArray(pageFormFields) && pageFormFields[0];
    }

    private isCollection(pageFormFields) {
        return pageFormFields[0]['value'];
    }

    private getSubstitutionValueLengthOrZero(pt) {
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
