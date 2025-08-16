import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { GpsComponent } from '../gps/gps.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { PlacesListComponent } from '../places-list/places-list.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [NavbarComponent, PlacesListComponent, GpsComponent, CardComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  exports: [NavbarComponent, PlacesListComponent, GpsComponent, CardComponent]
})
export class SharedModule {}
