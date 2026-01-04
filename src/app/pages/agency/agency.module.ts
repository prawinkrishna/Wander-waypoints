import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; // removing this line effectively by not including it in replacement if I could, but I need to match exact lines. 
// Wait, I should use `replace_file_content` to replace the imports section.

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule, Routes } from '@angular/router';
import { AgencyComponent } from './agency.component';
import { AgencyDashboardComponent } from './dashboard/dashboard.component';
import { TripManagementComponent } from './trip-management/trip-management.component';
import { SharedModule } from '../../components/shared/shared.module';

const routes: Routes = [
    {
        path: '',
        component: AgencyComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AgencyDashboardComponent },
            { path: 'trips', component: TripManagementComponent },
        ]
    }
];

@NgModule({
    declarations: [
        AgencyComponent,
        AgencyDashboardComponent,
        TripManagementComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatGridListModule,
        MatTableModule,
        MatBadgeModule
    ]
})
export class AgencyModule { }
