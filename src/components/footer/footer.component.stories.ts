// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/angular/types-6-0';
import { FooterComponent } from './footer.component';

// More on default export: https://storybook.js.org/docs/angular/writing-stories/introduction#default-export
export default {
  title: 'components/footer/FooterComponent',
  component: FooterComponent,

} as Meta;

// More on component templates: https://storybook.js.org/docs/angular/writing-stories/introduction#using-args
const Template: Story<FooterComponent> = (args: FooterComponent) => ({
  props: args,
});

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/angular/writing-stories/args
Default.args = {
  email: 'example@test.com',
  isSolicitor: true,
  phone: '0777777777',
  workhours: '9am - 5pm'
};
