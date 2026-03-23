import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';

import { MatPaginatorModule } from '@angular/material/paginator';

// Components
import { StudioComponent } from './studio.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateItineraryComponent } from './create-itinerary/create-itinerary.component';
import { EditItineraryComponent } from './edit-itinerary/edit-itinerary.component';
import { StudioSettingsComponent } from './settings/studio-settings.component';
import { ItineraryListComponent } from './itinerary-list/itinerary-list.component';
import { PlaceSearchDialogComponent } from '../../components/place-search-dialog/place-search-dialog.component';
import { ShareItineraryDialogComponent } from '../../components/share-itinerary-dialog/share-itinerary-dialog.component';

// Marketplace Components
import { StudioMarketplaceComponent } from './studio-marketplace/studio-marketplace.component';
import { StudioRequestDetailComponent } from './studio-request-detail/studio-request-detail.component';
import { MyBidsComponent } from './my-bids/my-bids.component';
import { SubmitBidFormComponent } from './submit-bid-form/submit-bid-form.component';

// Shared
import { SharedModule } from '../../components/shared/shared.module';

const routes: Routes = [
    {
        path: '',
        component: StudioComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'create-itinerary', component: CreateItineraryComponent },
            { path: 'edit-itinerary/:id', component: EditItineraryComponent },
            { path: 'itineraries', component: ItineraryListComponent },
            { path: 'settings', component: StudioSettingsComponent },
            { path: 'marketplace', component: StudioMarketplaceComponent },
            { path: 'marketplace/request/:id', component: StudioRequestDetailComponent },
            { path: 'marketplace/my-bids', component: MyBidsComponent },
        ]
    }
];

@NgModule({
    declarations: [
        StudioComponent,
        DashboardComponent,
        CreateItineraryComponent,
        EditItineraryComponent,
        StudioSettingsComponent,
        ItineraryListComponent,
        PlaceSearchDialogComponent,
        ShareItineraryDialogComponent,
        StudioMarketplaceComponent,
        StudioRequestDetailComponent,
        MyBidsComponent,
        SubmitBidFormComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        FormsModule,
        LayoutModule,
        DragDropModule,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatChipsModule,
        MatTableModule,
        MatExpansionModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTooltipModule,
        MatAutocompleteModule,
        MatSliderModule,
        MatCheckboxModule,
        MatMenuModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatRadioModule,
        MatPaginatorModule
    ]
})
export class StudioModule { }
