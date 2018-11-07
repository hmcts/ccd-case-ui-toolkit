import { Injectable } from '@angular/core';
import { FieldsUtils } from '../../../services/fields/fields.utils';

// @dynamic
@Injectable()
export class LabelSubstitutionService {

    private static readonly LABEL_ID_PATTERN = /^[a-zA-Z0-9_.\]\[]+$/;
    private static readonly STARTING_PLACEHOLDER = '$';
    private static readonly OPENING_PLACEHOLDER = '{';
    private static readonly CLOSING_PLACEHOLDER = '}';

    substituteLabel(pageFormFields, label): string {
        let startSubstitutionIndex = -1;
        let fieldIdToSubstitute = '';
        let isCollecting = false;
        if (label) {
            for (let scanIndex = 0; scanIndex < label.length; scanIndex++) {
                if (this.isStartPlaceholderAndNotCollecting(label, scanIndex, isCollecting)) {
                    startSubstitutionIndex = scanIndex;
                    isCollecting = true;
                } else if (isCollecting) {
                    if (this.isClosingPlaceholder(label, scanIndex)) {
                        if (this.isMatchingLabelIdPattern(fieldIdToSubstitute)
                            && this.isFieldIdInFormFields(fieldIdToSubstitute, pageFormFields)) {
                            label = this.substitute(pageFormFields, label, startSubstitutionIndex, fieldIdToSubstitute);
                            scanIndex = this.resetScanIndexAfterSubstitution(startSubstitutionIndex, pageFormFields, fieldIdToSubstitute);
                        }
                        isCollecting = false;
                        fieldIdToSubstitute = '';
                    } else if (!this.isOpeningPlaceholder(label, scanIndex)) {
                        fieldIdToSubstitute += label.charAt(scanIndex);
                    }
                }
            }
        }
        return label;
    }

    private isMatchingLabelIdPattern(fieldIdToSubstitute) {
        return fieldIdToSubstitute.match(LabelSubstitutionService.LABEL_ID_PATTERN);
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

    private isStartingPlaceholder(label, scanIndex): boolean {
        return label.charAt(scanIndex) === LabelSubstitutionService.STARTING_PLACEHOLDER;
    }

    private isStartPlaceholderAndNotCollecting(label, scanIndex, isCollectingPlaceholder): boolean {
        return this.isStartingPlaceholder(label, scanIndex) && !isCollectingPlaceholder;
    }

    private isClosingPlaceholder(label, scanIndex): boolean {
        return label.charAt(scanIndex) === LabelSubstitutionService.CLOSING_PLACEHOLDER;
    }

    private isOpeningPlaceholder(label, scanIndex): boolean {
        return label.charAt(scanIndex) === LabelSubstitutionService.OPENING_PLACEHOLDER;
    }

    private substitute(pageFormFields, label, startSubstitutionIndex, fieldIdToSubstitute): string {
        let replacedString = label.substring(startSubstitutionIndex)
                                .replace('${'.concat(fieldIdToSubstitute).concat('}'),
                                        this.getSubstitutionValueOrEmpty(pageFormFields, fieldIdToSubstitute));
        return label.substring(0, startSubstitutionIndex).concat(replacedString);
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
