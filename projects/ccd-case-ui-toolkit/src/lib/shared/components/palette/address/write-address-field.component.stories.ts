import { ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { StorybookComponent } from '../../../../../../../../storybook/storybook.component';
import { ConditionalShowModule, FocusElementModule } from '../../../../shared/directives';
import { AddressModel, CaseField } from '../../../../shared/domain';
import { createFieldType } from '../../../../shared/fixture';
import { AddressesService } from '../../../services/addresses/addresses.service';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { FieldReadLabelComponent } from '../base-field/field-read-label.component';
import { FieldReadComponent } from '../base-field/field-read.component';
import { FieldWriteComponent } from '../base-field/field-write.component';
import { WriteComplexFieldComponent } from '../complex';
import { PaletteModule } from '../palette.module';
import { FieldLabelPipe, IsCompoundPipe, IsReadOnlyPipe } from '../utils';
import { WriteAddressFieldComponent } from './write-address-field.component';

const addressesService = new AddressesService(null, null);
const CASE_FIELD_LABEL = 'Solicitor Address';

function caseField(addressModel: AddressModel) {
    const field = new CaseField();
    field.id = 'caseFieldId';
    field.label = CASE_FIELD_LABEL;
    field.field_type = createFieldType('FieldTypeId', 'Complex');
    field.value = addressModel;
    return field;
}

const address = new AddressModel();
address.AddressLine1 = 'Address Line 1';
address.AddressLine2 = 'Address Line 2';
address.AddressLine3 = 'Address Line 3';
address.PostTown = 'PostTown';
address.County = 'County';
address.PostCode = 'PostCode';
address.Country = 'Country';

const caseFieldInput = caseField(address);

export default {
    title: 'shared/components/palette/address/WriteAddressFieldComponent',
    component: WriteAddressFieldComponent,
    decorators: [
        moduleMetadata({
            imports: [
                ConditionalShowModule,
                ReactiveFormsModule,
                FocusElementModule,
                PaletteModule
            ],
            declarations: [
                StorybookComponent,
            ],
            providers: [
                IsCompoundPipe,
                IsReadOnlyPipe,
                CaseFieldService,
                FormValidatorsService,
                { provide: AddressesService, useValue: addressesService }]
        }),
        componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
    ]
} as Meta;

const template: Story<WriteAddressFieldComponent> = (args: WriteAddressFieldComponent) => ({
    props: args,
});

export const standard: Story = template.bind({});

standard.args = {
    caseField: caseFieldInput
};
