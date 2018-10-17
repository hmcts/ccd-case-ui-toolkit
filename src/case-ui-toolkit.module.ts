import { NgModule } from '@angular/core';
import { HeadersModule } from './headers.module';
import { FootersModule } from './footers.module';
import { BodyModule } from './body.module';

import { PhaseComponent } from './components/phase/phase.component';
import { HeaderComponent } from './components/header/header.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { NavigationItemComponent } from './components/navigation/navigation-item.component';
import { FooterComponent } from './components/footer/footer.component';
import { BodyComponent } from './components/body/body.component';
import { FormModule } from './components/form/form.module';
import { DateInputComponent } from './components/form/date-input/date-input.component';
import { TabsModule } from './components/tabs/tabs.module';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabComponent } from './components/tabs/tab.component';
import { AlertComponent } from './components/banners/alert/alert.component';
import { BannersModule } from './components/banners/banners.module';
// import { CaseEditModule } from './shared/case-editor/case-edit.module';
// import { CaseCreateComponent, CallbackErrorsComponent } from './shared';
// import { CaseEditComponent } from './shared';

@NgModule({
    imports: [
      BannersModule,
      HeadersModule,
      FootersModule,
      BodyModule,
      FormModule,
      TabsModule,
      // CaseEditModule,
    ],
    exports: [
      AlertComponent,
      PhaseComponent,
      HeaderComponent,
      NavigationComponent,
      NavigationItemComponent,
      FooterComponent,
      BodyComponent,
      DateInputComponent,
      TabsComponent,
      TabComponent,
      // CaseCreateComponent,
      // CaseEditComponent,
      // CallbackErrorsComponent,
    ]
})
export class CaseUIToolkitModule {}
