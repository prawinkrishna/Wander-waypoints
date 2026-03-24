import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../components/shared/shared.module';
import { authenticatedUserGuard } from '../../core/guards/authenticated-user.guard';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MarketplaceHomeComponent } from './marketplace-home/marketplace-home.component';
import { CreateRequestComponent } from './create-request/create-request.component';
import { MyRequestsComponent } from './my-requests/my-requests.component';
import { RequestDetailComponent } from './request-detail/request-detail.component';

const routes: Routes = [
    { path: '', component: MarketplaceHomeComponent },
    { path: 'create-request', component: CreateRequestComponent, canActivate: [authenticatedUserGuard] },
    { path: 'my-requests', component: MyRequestsComponent, canActivate: [authenticatedUserGuard] },
    { path: 'request/:id', component: RequestDetailComponent },
];

@NgModule({
    declarations: [
        MarketplaceHomeComponent,
        CreateRequestComponent,
        MyRequestsComponent,
        RequestDetailComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        SharedModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatPaginatorModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTooltipModule,
    ],
})
export class MarketplaceModule {}
