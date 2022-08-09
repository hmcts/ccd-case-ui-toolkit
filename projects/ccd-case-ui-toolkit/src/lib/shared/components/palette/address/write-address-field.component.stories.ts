import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { ConditionalShowModule, FocusElementModule } from 'src/shared/directives';
import { AddressModel, CaseField } from 'src/shared/domain';
import { createFieldType } from 'src/shared/fixture';
import { AddressesService, FormValidatorsService } from 'src/shared/services';
import { StorybookComponent } from 'storybook/storybook.component';
import { WriteComplexFieldComponent } from '../complex';
import { FieldLabelPipe, IsCompoundPipe } from '../utils';
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
            ],
            declarations: [
                StorybookComponent,
                FieldLabelPipe,
                WriteComplexFieldComponent
            ],
            providers: [
                IsCompoundPipe,
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
