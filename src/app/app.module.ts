import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { CardComponent } from './components/card/card.component';
import  { MatCardModule } from '@angular/material/card';
import { IonicModule } from '@ionic/angular';
import { GpsComponent } from './components/gps/gps.component';
import { WanderLibraryModule } from 'wander-library';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    CardComponent,
    GpsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    IonicModule.forRoot(),
    WanderLibraryModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
