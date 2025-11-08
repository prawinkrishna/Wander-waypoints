import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlacesListComponent } from './places-list.component';
import { MatButtonModule } from '@angular/material/button';
import { WanderLibraryModule } from 'wander-library';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [PlacesListComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    WanderLibraryModule,
    FormsModule
  ],
  exports: [PlacesListComponent]
})
export class PlacesListComponentModule { }
