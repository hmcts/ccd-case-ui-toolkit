import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { StorybookComponent } from 'storybook/storybook.component';
import { ErrorMessage } from '../../domain';
import { ErrorMessageComponent } from './error-message.component';

const error: ErrorMessage = {
    title: 'An error occured',
    description: 'this is an example storybook error'
};

export default {
    title: 'shared/components/error-message/ErrorMessageComponent',
    component: ErrorMessageComponent,
    decorators: [
        moduleMetadata({
            declarations: [
                StorybookComponent
            ]
        }),
        componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
    ]
} as Meta;

const template: Story<ErrorMessageComponent> = (args: ErrorMessageComponent) => ({
    props: args,
});

export const standard: Story = template.bind({});

standard.args = {
    error
};
