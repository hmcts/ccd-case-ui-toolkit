import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { StorybookComponent } from '../../../../../../../../storybook/storybook.component';
import { CaseField } from '../../../../shared/domain/definition/case-field.model';
import { FieldType } from '../../../../shared/domain/definition/field-type.model';
import { PaletteUtilsModule } from '../utils';
import { FixedListPipe } from './fixed-list.pipe';
import { WriteFixedListFieldComponent } from './write-fixed-list-field.component';

const VALUE = 'BJ';
const FIELD_TYPE: FieldType = {
    id: 'Gender',
    type: 'FixedList',
    fixed_list_items: [
        {
            code: 'BJ',
            label: 'Boris Johnson',
            order: 1
        },
        {
            code: 'LT',
            label: 'Lizz Truss',
            order: 3
        }
    ]
};

const CASE_FIELD: CaseField = Object.assign(new CaseField(), {
    id: 'x',
    label: 'Select a Prime Minister',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE,
});

const PRESELECTED_CASE_FIELD: CaseField = Object.assign(new CaseField(), {
    id: 'x',
    label: 'Select a Prime Minister',
    display_context: 'MANDATORY',
    field_type: FIELD_TYPE,
    value: null,
});

export default {
    title: 'shared/components/fixed-list/WriteFixedListFieldComponent',
    component: WriteFixedListFieldComponent,
    decorators: [
        moduleMetadata({
            imports: [
                ReactiveFormsModule,
                PaletteUtilsModule,
                FormsModule
            ],
            declarations: [
                StorybookComponent,
                FixedListPipe
            ]
        }),
        componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
    ]
} as Meta;

const template: Story<WriteFixedListFieldComponent> = (args: WriteFixedListFieldComponent) => ({
    props: args,
});

export const standard: Story = template.bind({});

standard.args = {
    caseField: PRESELECTED_CASE_FIELD
};

export const preselected: Story = template.bind({});

preselected.args = {
    caseField: CASE_FIELD
};
