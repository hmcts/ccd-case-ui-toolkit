import { Injectable } from '@angular/core';

import { FormValueService } from '../../../services';
import { FieldsUtils } from '../../../services/fields/fields.utils';

// @dynamic
@Injectable()
export class PlaceholderService {

    public resolvePlaceholders(pageFormFields: object, stringToResolve: string): string {
        const ps = new PlaceholderService.PlaceholderSubstitutor({pageFormFields, stringToResolve});
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

        private static readonly PLACEHOLDER_START =
            PlaceholderSubstitutor.STARTING_PLACEHOLDER + PlaceholderSubstitutor.OPENING_PLACEHOLDER;
        private static readonly PLACEHOLDER_END = PlaceholderSubstitutor.CLOSING_PLACEHOLDER;

        private stringToResolve: string;
        private scanIndex: number;
        private numberCollectionItemsAsPlaceholder: number;
        private collectionItemIndex: number;
        private fieldIdToSubstitute: string;
        private startSubstitutionIndex: number;
        private isCollecting: boolean;
        private resolvedFormValues = [];
        private readonly pageFormFields: object;
        private readonly originalStringToResolve: string;

        private static wrapPlaceholder(str: string): string {
            return `${this.PLACEHOLDER_START}${str}${this.PLACEHOLDER_END}`;
        }

        constructor(values: { stringToResolve: string, pageFormFields: object }) {
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

        private isScanningStringToResolve(): boolean {
            return this.scanIndex < this.stringToResolve.length;
        }

        private doesPlaceholderContainCollectionItems(): boolean {
            return this.numberCollectionItemsAsPlaceholder-- > 0;
        }

        private hasUnresolvedPlaceholder(): boolean {
            return this.stringToResolve
                && typeof this.stringToResolve === 'string'
                && !!this.stringToResolve.match(PlaceholderSubstitutor.PLACEHOLDER_PATTERN);
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

        private resetPlaceholderSubstitutor(): void {
            this.scanIndex = 0;
            this.numberCollectionItemsAsPlaceholder = 1;
            this.collectionItemIndex = 0;
            this.fieldIdToSubstitute = '';
            this.startSubstitutionIndex = -1;
            this.isCollecting = false;
            this.resolvedFormValues[this.collectionItemIndex] = {};
        }

        private substitute(): void {
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

        private appendOriginalStringIfCollectionItemAsPlaceholder(): void {
            if (this.collectionItemIndex < this.numberCollectionItemsAsPlaceholder - 1) {
                this.stringToResolve += PlaceholderSubstitutor.NEW_LINE + this.originalStringToResolve;
                this.collectionItemIndex += 1;
                this.resolvedFormValues[this.collectionItemIndex] = {};
            }
        }

        private setStartCollecting(): void {
            this.isCollecting = true;
            this.startSubstitutionIndex = this.scanIndex;
        }

        private appendCharacter(): void {
            this.fieldIdToSubstitute += this.stringToResolve.charAt(this.scanIndex);
        }

        private isMatchingPlaceholderPattern(): boolean {
            return !!this.fieldIdToSubstitute.match(PlaceholderSubstitutor.PLACEHOLDER_CONTENT_PATTERN);
        }

        private isFieldIdInFormFields(): boolean {
            return this.getFieldValue() !== undefined;
        }

        private isFieldIdToSubstituteReferringItself(): boolean {
            const placeholder = PlaceholderSubstitutor.wrapPlaceholder(this.fieldIdToSubstitute);
            const value = this.getSubstitutionValueOrEmpty();
            return placeholder === value;
        }

        private getSubstitutionValueLengthOrZero(): number {
            return this.pageFormFields[this.fieldIdToSubstitute] ? this.getSubstitutionValueOrEmpty().toString().length : 0;
        }

        /**
         * Gets the value from `this` field, which could be any of a number of different types:
         *   string | number | object | string[] | object[] | maybe others...
         * @returns The value associated with `this` field.
         */
        private getFieldValue(): any {
            if (this.resolvedFormValues[this.collectionItemIndex][this.fieldIdToSubstitute]) {
                return this.resolvedFormValues[this.collectionItemIndex][this.fieldIdToSubstitute];
            } else {
                const fieldValue = FormValueService.getFieldValue(this.pageFormFields, this.fieldIdToSubstitute, this.collectionItemIndex);
                this.resolvedFormValues[this.collectionItemIndex][this.fieldIdToSubstitute] = fieldValue;
                return this.resolvedFormValues[this.collectionItemIndex][this.fieldIdToSubstitute];
            }
        }

        private getSubstitutionValueOrEmpty(): string {
            const fieldValue = this.getFieldValue();
            return fieldValue ? fieldValue : '';
        }

        private getNumberOfCollectionItemsIfAny(): number {
            const fieldIds = this.fieldIdToSubstitute.split('.');
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

        private isStartingPlaceholder(): boolean {
            return this.stringToResolve.charAt(this.scanIndex) === PlaceholderSubstitutor.STARTING_PLACEHOLDER;
        }

        private updateNumberOfCollectionItemsAsPlaceholder(): void {
            if (this.fieldIdToSubstitute.split('.').length > 1) {
                const newNumber = this.getNumberOfCollectionItemsIfAny();
                this.numberCollectionItemsAsPlaceholder = Math.max(newNumber, this.numberCollectionItemsAsPlaceholder);
            }
        }

        private substituteFromFormFields(): void {
            this.doSubstitution(this.getSubstitutionValueOrEmpty());
            this.resetScanIndexAfterSubstitution();
        }

        private substituteWithEmptyString(): void {
            this.doSubstitution('');
            this.scanIndex = this.startSubstitutionIndex;
        }

        private doSubstitution(value: string): void {
            const placeholder = PlaceholderSubstitutor.wrapPlaceholder(this.fieldIdToSubstitute);
            const replacedString = this.stringToResolve.substring(this.startSubstitutionIndex).replace(placeholder, value);
            this.stringToResolve = this.stringToResolve.substring(0, this.startSubstitutionIndex).concat(replacedString);
        }

        private resetScanIndexAfterSubstitution(): void {
            this.scanIndex = this.startSubstitutionIndex + this.getSubstitutionValueLengthOrZero();
        }
    };
}
