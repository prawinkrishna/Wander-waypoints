import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { PlacesListComponent } from '../places-list/places-list.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { WanderLibraryModule } from 'projects/wander-library/src/public-api';

@NgModule({
  declarations: [NavbarComponent, PlacesListComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    WanderLibraryModule
  ],
  exports: [NavbarComponent, PlacesListComponent, WanderLibraryModule]
})
export class SharedModule {}
