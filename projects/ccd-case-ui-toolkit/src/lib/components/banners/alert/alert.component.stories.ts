import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';
import { Meta, Story } from '@storybook/angular/types-6-0';
import { StorybookComponent } from 'storybook/storybook.component';
import { AlertComponent, AlertMessageType } from './alert.component';

export default {
  title: 'components/banners/alert/AlertComponent',
  component: AlertComponent,
  decorators: [
    moduleMetadata({
        declarations: [
            StorybookComponent
        ]
    }),
    componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
]
} as Meta;

const template: Story<AlertComponent> = (args: AlertComponent) => ({
  props: args,
});

export const standard = template.bind({});
standard.args = {
    type: AlertMessageType.INFORMATION,
    showIcon: true
};
