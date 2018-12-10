import { Injectable } from '@angular/core';
import { FieldsUtils } from '../../../services/fields/fields.utils';

// @dynamic
@Injectable()
export class PlaceholderResolverService {

    private static readonly PLACEHOLDER_PATTERN = /^[a-zA-Z0-9_.\]\[]+$/;
    private static readonly STARTING_PLACEHOLDER = '$';
    private static readonly OPENING_PLACEHOLDER = '{';
    private static readonly CLOSING_PLACEHOLDER = '}';

    resolvePlaceholders(pageFormFields, stringToResolve): string {
        let startSubstitutionIndex = -1;
        let fieldIdToSubstitute = '';
        let isCollecting = false;
        if (stringToResolve && typeof stringToResolve === 'string') {
            for (let scanIndex = 0; scanIndex < stringToResolve.length; scanIndex++) {
                if (this.isStartPlaceholderAndNotCollecting(stringToResolve, scanIndex, isCollecting)) {
                    startSubstitutionIndex = scanIndex;
                    isCollecting = true;
                } else if (isCollecting) {
                    if (this.isClosingPlaceholder(stringToResolve, scanIndex)) {
                        if (this.isMatchingPlaceholderPattern(fieldIdToSubstitute)
                            && this.isFieldIdInFormFields(fieldIdToSubstitute, pageFormFields)) {
                            stringToResolve = this.substitute(pageFormFields, stringToResolve, startSubstitutionIndex, fieldIdToSubstitute);
                            scanIndex = this.resetScanIndexAfterSubstitution(startSubstitutionIndex, pageFormFields, fieldIdToSubstitute);
                        }
                        isCollecting = false;
                        fieldIdToSubstitute = '';
                    } else if (!this.isOpeningPlaceholder(stringToResolve, scanIndex)) {
                        fieldIdToSubstitute += stringToResolve.charAt(scanIndex);
                    }
                }
            }
        }
        return stringToResolve;
    }

    private isMatchingPlaceholderPattern(fieldIdToSubstitute) {
        return fieldIdToSubstitute.match(PlaceholderResolverService.PLACEHOLDER_PATTERN);
    }

    private isFieldIdInFormFields(fieldIdToSubstitute, pageFormFields) {
        let fieldValue = this.getFieldValue(pageFormFields, fieldIdToSubstitute);
        return fieldValue ? this.isSimpleTypeOrCollectionOfSimpleTypes(fieldValue) : fieldValue !== undefined;
    }

    private isSimpleTypeOrCollectionOfSimpleTypes(fieldValue) {
        return !this.isObject(fieldValue) && (this.isArray(fieldValue) ? this.isSimpleArray(fieldValue) : true);
    }

    private isSimpleArray(fieldValue) {
        return !this.isObject(fieldValue[0]) && !Array.isArray(fieldValue[0]) && fieldValue[0] !== undefined;
    }

    private isStartingPlaceholder(stringToResolve, scanIndex): boolean {
        return stringToResolve.charAt(scanIndex) === PlaceholderResolverService.STARTING_PLACEHOLDER;
    }

    private isStartPlaceholderAndNotCollecting(stringToResolve, scanIndex, isCollectingPlaceholder): boolean {
        return this.isStartingPlaceholder(stringToResolve, scanIndex) && !isCollectingPlaceholder;
    }

    private isClosingPlaceholder(stringToResolve, scanIndex): boolean {
        return stringToResolve.charAt(scanIndex) === PlaceholderResolverService.CLOSING_PLACEHOLDER;
    }

    private isOpeningPlaceholder(stringToResolve, scanIndex): boolean {
        return stringToResolve.charAt(scanIndex) === PlaceholderResolverService.OPENING_PLACEHOLDER;
    }

    private substitute(pageFormFields, stringToResolve, startSubstitutionIndex, fieldIdToSubstitute): string {
        let replacedString = stringToResolve.substring(startSubstitutionIndex)
            .replace('${'.concat(fieldIdToSubstitute).concat('}'),
                this.getSubstitutionValueOrEmpty(pageFormFields, fieldIdToSubstitute));
        return stringToResolve.substring(0, startSubstitutionIndex).concat(replacedString);
    }

    private resetScanIndexAfterSubstitution(startSubstitutionIndex, pageFormFields, fieldIdToSubstitute): number {
        return startSubstitutionIndex + this.getSubstitutionValueLengthOrZero(pageFormFields, fieldIdToSubstitute);
    }

    private getSubstitutionValueOrEmpty(pageFormFields, fieldIdToSubstitute) {
        let fieldValue = this.getFieldValue(pageFormFields, fieldIdToSubstitute);
        if (fieldValue instanceof Array) {
            fieldValue = fieldValue.join(', ');
        }
        return fieldValue ? fieldValue : '';
    }

    private getFieldValue(pageFormFields, fieldIdToSubstitute) {
        let fieldIds = fieldIdToSubstitute.split('.');
        for (let index = 0; index < fieldIds.length; index++) {
            if (pageFormFields[fieldIds[index]] === undefined) {
                return undefined;
            } else {
                if (this.isNonEmptyArray(pageFormFields[fieldIds[index]]) && !this.isCollection(pageFormFields[fieldIds[index]])) {
                    pageFormFields = pageFormFields[fieldIds[index] + FieldsUtils.LABEL_SUFFIX];
                } else {
                    pageFormFields = pageFormFields[fieldIds[index]];
                }
            }
        }
        if (this.isNonEmptyArray(pageFormFields) && this.isCollection(pageFormFields)) {
            pageFormFields = pageFormFields.map(fieldValue => fieldValue['value']);
        }
        return pageFormFields;
    }

    private isNonEmptyArray(pageFormFields) {
        return Array.isArray(pageFormFields) && pageFormFields[0];
    }

    private isCollection(pageFormFields) {
        return pageFormFields[0]['value'];
    }

    private getSubstitutionValueLengthOrZero(pageFormFields, fieldIdToSubstitute) {
        return pageFormFields[fieldIdToSubstitute] ? this.getSubstitutionValueOrEmpty(pageFormFields, fieldIdToSubstitute)
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
