import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule} from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
//import { FlexLayoutModule } from '@angular/flex-layout';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { LayoutComponent } from './layout.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDividerModule} from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import { ListComponent } from './list.component';
import { MatTableModule } from '@angular/material/table';

@NgModule({
    
    imports: [            
      //BrowserAnimationsModule,
      MatCardModule,
      MatToolbarModule,
      MatButtonModule,
      DashboardRoutingModule,
      MatSidenavModule,
      MatDividerModule,
      MatIconModule,
      MatDialogModule,
      MatTableModule
      //FlexLayoutModule,
    ],
    declarations: [
        LayoutComponent,
        ListComponent
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    exports: [MatSidenavModule],
    bootstrap: [LayoutComponent],
  })
  export class DashboardModule { }