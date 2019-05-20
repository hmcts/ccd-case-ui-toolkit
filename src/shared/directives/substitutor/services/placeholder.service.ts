import { Injectable } from '@angular/core';
import { FieldsUtils } from '../../../services/fields/fields.utils';

// @dynamic
@Injectable()
export class PlaceholderService {

    private static readonly PLACEHOLDER_PATTERN = /^[a-zA-Z0-9_.\]\[]+$/;
    private static readonly STARTING_PLACEHOLDER = '$';
    private static readonly OPENING_PLACEHOLDER = '{';
    private static readonly CLOSING_PLACEHOLDER = '}';

    resolvePlaceholders(pageFormFields, stringToResolve): string {
        console.log('[[[[[ START [[[[[');
        console.log('resolvePlaceholders stringToResolve=', stringToResolve);
        let startSubstitutionIndex = -1;
        let fieldIdToSubstitute = '';
        let isCollecting = false;
        let originalStringToResolve = stringToResolve;
        if (stringToResolve && typeof stringToResolve === 'string') {
            let numberCollectionItemsAsPlacholder = this.getPlaceholdersCollectionItemsNumberIfExists(pageFormFields, stringToResolve);
            console.log('resolvePlaceholders numberCollectionItemsAsPlacholder=', numberCollectionItemsAsPlacholder);
            for (let colItemIndex = 0; colItemIndex < numberCollectionItemsAsPlacholder; colItemIndex++) {
                console.log('resolvePlaceholders colItemIndex=', colItemIndex);

                for (let scanIndex = 0; scanIndex < stringToResolve.length; scanIndex++) {
                    if (this.isStartPlaceholderAndNotCollecting(stringToResolve, scanIndex, isCollecting)) {
                        startSubstitutionIndex = scanIndex;
                        isCollecting = true;
                    } else if (isCollecting) {
                        if (this.isClosingPlaceholder(stringToResolve, scanIndex)) {
                            if (this.isMatchingPlaceholderPattern(fieldIdToSubstitute)
                                && this.isFieldIdInFormFields(fieldIdToSubstitute, pageFormFields, colItemIndex)) {

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
                }

                if (colItemIndex < numberCollectionItemsAsPlacholder - 1) {
                    stringToResolve += '\r\n';
                    stringToResolve += originalStringToResolve;
                }
                console.log('resolvePlaceholders new stringToResolve=', stringToResolve);
            }
        }
        console.log(']]]]] END ]]]]]');
        return stringToResolve;
    }

    private getPlaceholdersCollectionItemsNumberIfExists(pageFormFields, stringToResolve) {
        let isCollecting = false;
        let startSubstitutionIndex = -1;
        let fieldIdToSubstitute = '';

        for (let scanIndex = 0; scanIndex < stringToResolve.length; scanIndex++) {
            if (this.isStartPlaceholderAndNotCollecting(stringToResolve, scanIndex, isCollecting)) {
                startSubstitutionIndex = scanIndex;
                isCollecting = true;
            } else if (isCollecting) {
                if (this.isClosingPlaceholder(stringToResolve, scanIndex)) {
                    if (this.isMatchingPlaceholderPattern(fieldIdToSubstitute)
                        && this.isFieldIdInFormFields(fieldIdToSubstitute, pageFormFields, 0)) {

                        let fieldIds = fieldIdToSubstitute.split('.');
                        for (let index = 0; index < fieldIds.length; index++) {
                            if (this.isNonEmptyCollection(pageFormFields) && this.isLeaf(fieldIds.length, index)) {
                                return pageFormFields.length;
                            } else if (pageFormFields[fieldIds[index]] === undefined) {
                                return 0;
                            } else {
                                pageFormFields = pageFormFields[fieldIds[index]];
                            }

                        }

                        scanIndex = this.resetScanIndexAfterSubstitution(
                            startSubstitutionIndex, pageFormFields, fieldIdToSubstitute, 0);
                    }
                    isCollecting = false;
                    fieldIdToSubstitute = '';
                } else if (!this.isOpeningPlaceholder(stringToResolve, scanIndex)) {
                    fieldIdToSubstitute += stringToResolve.charAt(scanIndex);
                }
            }
        }
        return 1;
    }

    private isMatchingPlaceholderPattern(fieldIdToSubstitute) {
        return fieldIdToSubstitute.match(PlaceholderService.PLACEHOLDER_PATTERN);
    }

    private isFieldIdInFormFields(fieldIdToSubstitute, pageFormFields, collectionItemIndex) {
        let fieldValue = this.getFieldValue(pageFormFields, fieldIdToSubstitute, collectionItemIndex);
        console.log('isFieldIdInFormFields, fieldValue=', fieldValue);
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
        console.log('getFieldValue fieldIdToSubstitute=', fieldIdToSubstitute);
        console.log('getFieldValue collectionItemIndex=', collectionItemIndex);
        let fieldIds = fieldIdToSubstitute.split('.');
        for (let index = 0; index < fieldIds.length; index++) {
            console.log('getFieldValue pageFormFields=', pageFormFields);
            console.log('getFieldValue fieldIds[index]=', fieldIds[index]);
            if (pageFormFields !== undefined) {
                console.log('getFieldValue pageFormFields[fieldIds[index]]=', pageFormFields[fieldIds[index]]);
            }
            if (this.isNonEmptyCollection(pageFormFields) && this.isLeaf(fieldIds.length, index)) {
                console.log('getFieldValue isNotEmptyArray && isCollection inside isLeaf');
                let placeholderSuffix = fieldIds[fieldIds.length - 1];
                console.log('placeholderSuffix=', placeholderSuffix);
                pageFormFields = pageFormFields[collectionItemIndex]['value'][placeholderSuffix];
                console.log('returnItems=', pageFormFields);
                return pageFormFields;
            } else {
                if (pageFormFields !== undefined && this.isNonEmptyArray(pageFormFields[fieldIds[index]])
                    && !this.isCollection(pageFormFields[fieldIds[index]])) {
                    console.log('getFieldValue isNotEmptyArray && isNotCollection');
                    pageFormFields = pageFormFields[fieldIds[index] + FieldsUtils.LABEL_SUFFIX];
                } else if (this.isNonEmptyCollection(pageFormFields)) {
                    console.log('getFieldValue isNonEmptyCollection');
                    pageFormFields = pageFormFields[collectionItemIndex]['value'][fieldIds[index]];
                } else if (pageFormFields !== undefined  && pageFormFields[fieldIds[index]] !== undefined) {
                    console.log('getFieldValue pageFormFields[fieldIds[index]] exists');
                    pageFormFields = pageFormFields[fieldIds[index]];
                } else {
                    console.log('getFieldValue undefined');
                    return undefined;
                }
            }
        }
        console.log('getFieldValue pageFormFields=', pageFormFields);
        if (this.isNonEmptyArray(pageFormFields) && this.isCollection(pageFormFields)) {
            console.log('getFieldValue isNotEmptyArray && isCollection');
            pageFormFields = pageFormFields.map(fieldValue => fieldValue['value']);
        }
        return pageFormFields;
    }

    private isLeaf(length, currentIndex) {
        console.log('length=', length);
        console.log('currentIndex=', currentIndex);
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
