import { Injectable } from '@angular/core';
import { FieldsUtils } from '../../../services/fields/fields.utils';

// @dynamic
@Injectable()
export class PlaceholderService {

    private static readonly PLACEHOLDER_PATTERN = /^[a-zA-Z0-9_.\]\[]+$/;
    private static readonly STARTING_PLACEHOLDER = '$';
    private static readonly OPENING_PLACEHOLDER = '{';
    private static readonly CLOSING_PLACEHOLDER = '}';
    private static readonly NEW_LINE = `
___
`;

    constructor(
        private fieldsUtils: FieldsUtils
      ) { }

    resolvePlaceholders(pageFormFields, stringToResolve): string {
        let startSubstitutionIndex = -1;
        let fieldIdToSubstitute = '';
        let isCollecting = false;
        let originalStringToResolve = stringToResolve;
        let numberCollectionItemsAsPlaceholder = 1;
        let colItemIndex = 0;
        let scanIndex = 0;

        if (stringToResolve && typeof stringToResolve === 'string') {
            while (numberCollectionItemsAsPlaceholder-- > 0) {

                while (scanIndex < stringToResolve.length) {
                    if (this.isStartPlaceholderAndNotCollecting(stringToResolve, scanIndex, isCollecting)) {
                        startSubstitutionIndex = scanIndex;
                        isCollecting = true;
                    } else if (isCollecting) {
                        if (this.isClosingPlaceholder(stringToResolve, scanIndex)) {
                            if (this.isMatchingPlaceholderPattern(fieldIdToSubstitute)
                                && this.isFieldIdInFormFields(fieldIdToSubstitute, pageFormFields, colItemIndex)) {

                                    if (fieldIdToSubstitute.split('.').length > 1) {
                                        let newNumberOfCollectionItemsAsPlaceholder =
                                            this.getNumberOfCollectionItemsIfAny(pageFormFields, fieldIdToSubstitute);
                                            numberCollectionItemsAsPlaceholder = this.getNewNumberOfCollectionItemsIfHigher(
                                                newNumberOfCollectionItemsAsPlaceholder,
                                                numberCollectionItemsAsPlaceholder)
                                    }
                                    stringToResolve = this.substitute(
                                        pageFormFields, stringToResolve, startSubstitutionIndex, fieldIdToSubstitute, colItemIndex);

                                    scanIndex = this.resetScanIndexAfterSubstitution(
                                        startSubstitutionIndex, pageFormFields, fieldIdToSubstitute, colItemIndex);
                            }
                            isCollecting = false;
                            fieldIdToSubstitute = '';
                        } else if (!this.isOpeningPlaceholder(stringToResolve, scanIndex)) {
                            fieldIdToSubstitute += stringToResolve.charAt(scanIndex);
                        }
                    }
                    scanIndex++
                }

                if (colItemIndex < numberCollectionItemsAsPlaceholder - 1) {
                    stringToResolve += PlaceholderService.NEW_LINE;
                    stringToResolve += originalStringToResolve;
                    colItemIndex += 1;
                }
            }
        }
        return stringToResolve;
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

    private isMatchingPlaceholderPattern(fieldIdToSubstitute) {
        return fieldIdToSubstitute.match(PlaceholderService.PLACEHOLDER_PATTERN);
    }

    private isFieldIdInFormFields(fieldIdToSubstitute, pageFormFields, collectionItemIndex) {
        let fieldValue = this.getFieldValue(pageFormFields, fieldIdToSubstitute, collectionItemIndex);
        return fieldValue ? this.isSimpleTypeOrCollectionOfSimpleTypes(fieldValue) : fieldValue !== undefined;
    }

    private isSimpleTypeOrCollectionOfSimpleTypes(fieldValue) {
        return !this.isObject(fieldValue) && (this.isArray(fieldValue) ? this.isSimpleArray(fieldValue) : true);
    }

    private isSimpleArray(fieldValue) {
        return !this.isObject(fieldValue[0]) && !Array.isArray(fieldValue[0]) && fieldValue[0] !== undefined;
    }

    private isStartingPlaceholder(stringToResolve, scanIndex): boolean {
        return stringToResolve.charAt(scanIndex) === PlaceholderService.STARTING_PLACEHOLDER;
    }

    private isStartPlaceholderAndNotCollecting(stringToResolve, scanIndex, isCollectingPlaceholder): boolean {
        return this.isStartingPlaceholder(stringToResolve, scanIndex) && !isCollectingPlaceholder;
    }

    private isClosingPlaceholder(stringToResolve, scanIndex): boolean {
        return stringToResolve.charAt(scanIndex) === PlaceholderService.CLOSING_PLACEHOLDER;
    }

    private isOpeningPlaceholder(stringToResolve, scanIndex): boolean {
        return stringToResolve.charAt(scanIndex) === PlaceholderService.OPENING_PLACEHOLDER;
    }

    private substitute(pageFormFields, stringToResolve, startSubstitutionIndex, fieldIdToSubstitute, collectionItemIndex): string {
        let replacedString = stringToResolve.substring(startSubstitutionIndex)
            .replace('${'.concat(fieldIdToSubstitute).concat('}'),
                this.getSubstitutionValueOrEmpty(pageFormFields, fieldIdToSubstitute, collectionItemIndex));
        return stringToResolve.substring(0, startSubstitutionIndex).concat(replacedString);
    }

    private resetScanIndexAfterSubstitution(startSubstitutionIndex, pageFormFields, fieldIdToSubstitute, collectionItemIndex): number {
        return startSubstitutionIndex + this.getSubstitutionValueLengthOrZero(pageFormFields, fieldIdToSubstitute, collectionItemIndex);
    }

    private getSubstitutionValueOrEmpty(pageFormFields, fieldIdToSubstitute, collectionItemIndex) {
        let fieldValue = this.getFieldValue(pageFormFields, fieldIdToSubstitute, collectionItemIndex);
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

    private getSubstitutionValueLengthOrZero(pageFormFields, fieldIdToSubstitute, collectionItemIndex) {
        return pageFormFields[fieldIdToSubstitute] ? this.getSubstitutionValueOrEmpty(
            pageFormFields, fieldIdToSubstitute, collectionItemIndex)
            .toString().length : 0;
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
