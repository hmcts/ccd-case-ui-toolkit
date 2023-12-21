import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { StorybookComponent } from '../../../../../../../storybook/storybook.component';
import { createCaseView } from '../../../shared/fixture/case-view.test.fixture';
import { PaletteModule } from '../palette';
import { CaseHeaderComponent } from './case-header.component';

const caseDetails = createCaseView();

export default {
    title: 'shared/components/case-header/CaseHeaderComponent',
    component: CaseHeaderComponent,
    decorators: [
        moduleMetadata({
            imports: [
                CommonModule,
                RouterModule,
                PaletteModule,
            ],
            declarations: [
                StorybookComponent
            ]
        }),
        componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
    ]
} as Meta;

const template: Story<CaseHeaderComponent> = (args: CaseHeaderComponent) => ({
    props: args,
});

export const standard: Story = template.bind({});

standard.args = {
    caseDetails
};
