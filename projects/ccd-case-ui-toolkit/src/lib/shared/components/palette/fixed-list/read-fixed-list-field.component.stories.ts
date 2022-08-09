import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { StorybookComponent } from 'storybook/storybook.component';
import { CaseField } from '../../../../shared/domain/definition/case-field.model';
import { FieldType } from '../../../../shared/domain/definition/field-type.model';
import { FixedListPipe } from './fixed-list.pipe';
import { ReadFixedListFieldComponent } from './read-fixed-list-field.component';

const VALUE = 'F';
const EXPECTED_LABEL = 'Female';
const FIELD_TYPE: FieldType = {
    id: 'Gender',
    type: 'FixedList',
    fixed_list_items: [
        {
            code: 'M',
            label: 'Male',
            order: 1
        },
        {
            code: VALUE,
            label: EXPECTED_LABEL,
            order: 2
        },
        {
            code: 'O',
            label: 'Other',
            order: 3
        }
    ]
};

const CASE_FIELD: CaseField = Object.assign(new CaseField(), {
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE,
});

export default {
    title: 'shared/components/fixed-list/ReadFixedListFieldComponent',
    component: ReadFixedListFieldComponent,
    decorators: [
        moduleMetadata({
            declarations: [
                StorybookComponent,
                FixedListPipe
            ]
        }),
        componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
    ]
} as Meta;

const template: Story<ReadFixedListFieldComponent> = (args: ReadFixedListFieldComponent) => ({
    props: args,
});

export const standard: Story = template.bind({});

standard.args = {
    caseField: CASE_FIELD
};
