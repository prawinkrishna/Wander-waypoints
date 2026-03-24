import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SharedItineraryComponent } from './shared-itinerary.component';

const routes: Routes = [
    { path: ':token', component: SharedItineraryComponent }
];

@NgModule({
    declarations: [SharedItineraryComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTooltipModule
    ]
})
export class SharedItineraryModule {}
