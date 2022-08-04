import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { StorybookComponent } from 'storybook/storybook.component';
import { LoadingSpinnerComponent } from './loading-spinner.component';

export default {
    title: 'shared/components/loading-spinner/LoadingSpinnerComponent',
    component: LoadingSpinnerComponent,
    decorators: [
        moduleMetadata({
            declarations: [
                StorybookComponent
            ]
        }),
        componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
    ]
} as Meta;

const template: Story<LoadingSpinnerComponent> = (args: LoadingSpinnerComponent) => ({
    props: args,
});

export const standard: Story = template.bind({});
