import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { WanderLibraryModule } from 'projects/wander-library/src/public-api';
import { SharedModule } from '../../components/shared/shared.module';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HomeRoutingModule,
    WanderLibraryModule,
    SharedModule
  ]
})
export class HomeModule { }
