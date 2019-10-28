import { Injectable } from '@angular/core';
import { FieldsUtils } from '../../../services/fields/fields.utils';

// @dynamic
@Injectable()
export class PlaceholderService {

    resolvePlaceholders(pageFormFields, stringToResolve): string {
        let ps = new PlaceholderService.PlaceholderSubstitutor({pageFormFields: pageFormFields, stringToResolve: stringToResolve});
        return ps.resolvePlaceholders();
    }

}

export namespace PlaceholderService {
    export class PlaceholderSubstitutor {
        private static readonly PLACEHOLDER_CONTENT_PATTERN = /^[a-zA-Z0-9_.\]\[]+$/;
        private static readonly PLACEHOLDER_PATTERN = /\$\{[a-zA-Z0-9_.\]\[]+\}/;
        private static readonly STARTING_PLACEHOLDER = '$';
        private static readonly CLOSING_PLACEHOLDER = '}';
        private static readonly OPENING_PLACEHOLDER = '{';
        private static readonly NEW_LINE = `
___
`;

        private stringToResolve: string;
        private scanIndex: number;
        private numberCollectionItemsAsPlaceholder: number;
        private collectionItemIndex: number;
        private fieldIdToSubstitute: string;
        private startSubstitutionIndex: number;
        private isCollecting: boolean;
        private readonly pageFormFields: object;
        private readonly originalStringToResolve: string;

        constructor(values: {
            stringToResolve: string,
            pageFormFields: any}) {
              this.stringToResolve = values.stringToResolve;
              this.originalStringToResolve = values.stringToResolve;
              this.pageFormFields = values.pageFormFields;
        }

        public resolvePlaceholders(): string {
            while (this.hasUnresolvedPlaceholder()) {
                this.resetPlaceholderSubstitutor();
                while (this.doesPlaceholderContainCollectionItems()) {
                    while (this.isScanningStringToResolve()) {
                        if (this.isStartPlaceholderAndNotCollecting()) {
                            this.setStartCollecting();
                        } else if (this.isCollecting) {
                            if (this.isClosingPlaceholder()) {
                                this.substitute();
                            } else if (!this.isOpeningPlaceholder()) {
                                this.appendCharacter();
                            }
                        }
                        this.scanIndex++
                    }
                    this.appendOriginalStringIfCollectionItemAsPlaceholder();
                }
            }
            return this.stringToResolve;
        }

        private isScanningStringToResolve() {
            return this.scanIndex < this.stringToResolve.length;
        }

        private doesPlaceholderContainCollectionItems() {
            return this.numberCollectionItemsAsPlaceholder-- > 0;
        }

        private hasUnresolvedPlaceholder() {
            return this.stringToResolve && this.stringToResolve.match(PlaceholderSubstitutor.PLACEHOLDER_PATTERN);
        }

        private isStartPlaceholderAndNotCollecting(): boolean {
            return this.isStartingPlaceholder() && !this.isCollecting;
        }

        private isOpeningPlaceholder(): boolean {
            return this.stringToResolve.charAt(this.scanIndex) === PlaceholderSubstitutor.OPENING_PLACEHOLDER;
        }

        private isClosingPlaceholder(): boolean {
            return this.stringToResolve.charAt(this.scanIndex) === PlaceholderSubstitutor.CLOSING_PLACEHOLDER;
        }

        private resetPlaceholderSubstitutor() {
            this.scanIndex = 0;
            this.numberCollectionItemsAsPlaceholder = 1;
            this.collectionItemIndex = 0;
            this.fieldIdToSubstitute = '';
            this.startSubstitutionIndex = -1;
            this.isCollecting = false;
        }

        private substitute() {
            if (this.isMatchingPlaceholderPattern() && this.isFieldIdInFormFields()) {
                this.updateNumberOfCollectionItemsAsPlaceholder();
                if (this.isFieldIdToSubstituteReferringItself()) {
                    this.substituteWithEmptyString();
                } else {
                    this.substituteFromFormFields();
                }
            } else {
                this.substituteWithEmptyString();
            }
            this.isCollecting = false;
            this.fieldIdToSubstitute = '';
        }

        private appendOriginalStringIfCollectionItemAsPlaceholder() {
            if (this.collectionItemIndex < this.numberCollectionItemsAsPlaceholder - 1) {
                this.stringToResolve += PlaceholderSubstitutor.NEW_LINE + this.originalStringToResolve;
                this.collectionItemIndex += 1;
            }
        }

        private setStartCollecting() {
            this.isCollecting = true;
            this.startSubstitutionIndex = this.scanIndex;
        }

        private appendCharacter() {
            this.fieldIdToSubstitute += this.stringToResolve.charAt(this.scanIndex);
        }

        private isMatchingPlaceholderPattern() {
            return this.fieldIdToSubstitute.match(PlaceholderSubstitutor.PLACEHOLDER_CONTENT_PATTERN);
        }

        private isFieldIdInFormFields() {
            let fieldValue = this.getFieldValue();
            return fieldValue ? FieldsUtils.isSimpleTypeOrCollectionOfSimpleTypes(fieldValue) : fieldValue !== undefined;
        }

        private isFieldIdToSubstituteReferringItself() {
            let value = this.getSubstitutionValueOrEmpty();
            return '${'.concat(this.fieldIdToSubstitute).concat('}') === value;
        }

        private getSubstitutionValueLengthOrZero() {
            return this.pageFormFields[this.fieldIdToSubstitute] ? this.getSubstitutionValueOrEmpty().toString().length : 0;
        }

        private getFieldValue() {
            let pageFormFieldsClone = FieldsUtils.cloneObject(this.pageFormFields);
            let fieldIds = this.fieldIdToSubstitute.split('.');
            for (let index = 0; index < fieldIds.length; index++) {
                if (this.isMultiSelectValue(pageFormFieldsClone, fieldIds, index)) {
                    pageFormFieldsClone = pageFormFieldsClone[fieldIds[index] + FieldsUtils.LABEL_SUFFIX];
                } else if (FieldsUtils.isCollection(pageFormFieldsClone)) {
                    pageFormFieldsClone = pageFormFieldsClone[this.collectionItemIndex]['value'][fieldIds[index]];
                } else if (this.isComplex(pageFormFieldsClone, fieldIds, index)) {
                    pageFormFieldsClone = pageFormFieldsClone[fieldIds[index]];
                } else {
                    return undefined;
                }
            }
            if (FieldsUtils.isCollection(pageFormFieldsClone)) {
                pageFormFieldsClone = pageFormFieldsClone.map(fieldValue => fieldValue['value']);
            }
            return pageFormFieldsClone;
        }

        private getSubstitutionValueOrEmpty() {
            let fieldValue = this.getFieldValue();
            if (fieldValue instanceof Array) {
                fieldValue = fieldValue.join(', ');
            }
            return fieldValue ? fieldValue : '';
        }

        private getNumberOfCollectionItemsIfAny() {
            let fieldIds = this.fieldIdToSubstitute.split('.');
            let pageFormFieldsClone = FieldsUtils.cloneObject(this.pageFormFields);
            let numberCollectionItemsAsPlaceholder = 1;

            for (let index = 0; index < fieldIds.length; index++) {
                if (FieldsUtils.isCollection(pageFormFieldsClone)) {
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

        private getNewNumberOfCollectionItemsIfHigher(newNumberOfCollectionItemsAsPlaceholder, numberCollectionItemsAsPlaceholder) {
            return newNumberOfCollectionItemsAsPlaceholder > numberCollectionItemsAsPlaceholder ?
                                                        newNumberOfCollectionItemsAsPlaceholder :
                                                        numberCollectionItemsAsPlaceholder;
        }

        private isStartingPlaceholder(): boolean {
            return this.stringToResolve.charAt(this.scanIndex) === PlaceholderSubstitutor.STARTING_PLACEHOLDER;
        }

        private isMultiSelectValue(pageFormFields, fieldIds, index) {
            let field = pageFormFields[fieldIds[index]];
            return FieldsUtils.isNonEmptyArray(field) && !FieldsUtils.isCollectionWithValue(field);
        }

        private isComplex(pageFormFields, fieldIds, index) {
            return pageFormFields[fieldIds[index]];
        }

        private updateNumberOfCollectionItemsAsPlaceholder() {
            if (this.fieldIdToSubstitute.split('.').length > 1) {
                let newNumberOfCollectionItemsAsPlaceholder = this.getNumberOfCollectionItemsIfAny();
                this.numberCollectionItemsAsPlaceholder =
                    this.getNewNumberOfCollectionItemsIfHigher(newNumberOfCollectionItemsAsPlaceholder,
                        this.numberCollectionItemsAsPlaceholder);
            }
        }

        private substituteFromFormFields() {
            let replacedString = this.stringToResolve.substring(this.startSubstitutionIndex)
                .replace('${'.concat(this.fieldIdToSubstitute).concat('}'), this.getSubstitutionValueOrEmpty());
            this.stringToResolve = this.stringToResolve.substring(0, this.startSubstitutionIndex).concat(replacedString);
            this.resetScanIndexAfterSubstitution();
        }

        private substituteWithEmptyString() {
            let replacedString = this.stringToResolve.substring(this.startSubstitutionIndex)
                .replace('${'.concat(this.fieldIdToSubstitute).concat('}'), '');
            this.stringToResolve = this.stringToResolve.substring(0, this.startSubstitutionIndex).concat(replacedString);
            this.scanIndex = this.startSubstitutionIndex;
        }

        private resetScanIndexAfterSubstitution() {
            this.scanIndex = this.startSubstitutionIndex + this.getSubstitutionValueLengthOrZero();
        }
    };
}
