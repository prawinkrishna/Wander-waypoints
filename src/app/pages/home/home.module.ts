import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { WanderLibraryModule } from 'wander-library';
import { SharedModule } from '../../components/shared/shared.module';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    WanderLibraryModule,
    SharedModule
  ]
})
export class HomeModule { }
