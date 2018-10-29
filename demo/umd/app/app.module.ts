import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CaseCreateConsumerComponent } from './case-create-consumer.component';
import { CaseUIToolkitModule } from '../../lib/case-ui-toolkit.module';

@NgModule({
  imports: [ BrowserModule, CaseUIToolkitModule, RouterModule ],
  declarations: [ CaseCreateConsumerComponent ],
  bootstrap: [ CaseCreateConsumerComponent ]
})
export class AppModule {
}
