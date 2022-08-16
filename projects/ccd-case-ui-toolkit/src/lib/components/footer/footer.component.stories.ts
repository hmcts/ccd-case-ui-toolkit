import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';
import { Meta, Story } from '@storybook/angular/types-6-0';
import { StorybookComponent } from '../../../../../../storybook/storybook.component';
import { FooterComponent } from './footer.component';

export default {
  title: 'components/footer/FooterComponent',
  component: FooterComponent,
  decorators: [
    moduleMetadata({
        declarations: [
            StorybookComponent
        ]
    }),
    componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
]
} as Meta;

const template: Story<FooterComponent> = (args: FooterComponent) => ({
  props: args,
});

export const standard = template.bind({});

standard.args = {
  email: 'example@test.com',
  isSolicitor: true,
  phone: '0777777777',
  workhours: '9am - 5pm'
};
