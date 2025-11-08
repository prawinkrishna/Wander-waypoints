import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../../components/shared/shared.module';
import { WanderLibraryModule } from 'wander-library';
import { PlacesListComponentModule } from '../../components/places-list/places-list.module';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HomeRoutingModule,
    WanderLibraryModule,
    SharedModule,
    PlacesListComponentModule
  ]
})
export class HomeModule { }
