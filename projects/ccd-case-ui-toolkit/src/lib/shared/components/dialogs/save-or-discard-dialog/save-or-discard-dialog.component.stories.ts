import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { StorybookComponent } from 'storybook/storybook.component';
import { SaveOrDiscardDialogComponent } from './save-or-discard-dialog.component';

export default {
    title: 'shared/components/dialogs/save-or-discard-dialog/SaveOrDiscardDialogComponent',
    component: SaveOrDiscardDialogComponent,
    decorators: [
        moduleMetadata({
            imports: [
                CommonModule,
                FormsModule,
                ReactiveFormsModule
              ],
            declarations: [
                StorybookComponent
            ],
            providers: [
                { provide: MatDialogRef, useValue: {} }
              ]
        }),
        componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
    ]
} as Meta;

const template: Story<SaveOrDiscardDialogComponent> = (args: SaveOrDiscardDialogComponent) => ({
    props: args,
});

export const standard: Story = template.bind({});
