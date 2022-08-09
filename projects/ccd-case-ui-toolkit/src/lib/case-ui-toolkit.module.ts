import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { PaginatePipe } from 'ngx-pagination';
import { AlertComponent } from './components/banners/alert/alert.component';
import { BannersModule } from './components/banners/banners.module';
import { BodyComponent } from './components/body/body.component';
import { BodyModule } from './components/body/body.module';
import { FooterComponent } from './components/footer/footer.component';
import { FootersModule } from './components/footer/footers.module';
import { FormModule } from './components/form/form.module';
import { HeaderBarComponent } from './components/header/header-bar/header-bar.component';
import { HeadersModule } from './components/header/headers.module';
import { NavigationItemComponent } from './components/header/navigation/navigation-item.component';
import { NavigationComponent } from './components/header/navigation/navigation.component';
import { PhaseComponent } from './components/header/phase/phase.component';
import { TabComponent } from './components/tabs/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabsModule } from './components/tabs/tabs.module';

@NgModule({
    imports: [
      // BannersModule,
      // HeadersModule,
      FootersModule,
      // BodyModule,
      // TabsModule,
      // PortalModule,
      // FormModule
    ],
    exports: [
      // AlertComponent,
      // PhaseComponent,
      // HeaderBarComponent,
      // NavigationComponent,
      // NavigationItemComponent,
      FooterComponent,
      // BodyComponent,
      // TabsComponent,
      // TabComponent,
      // PaginatePipe
    ]
})
export class CaseUIToolkitModule {}
