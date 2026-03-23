import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { WelcomeComponent } from './welcome.component';

const routes: Routes = [
    { path: '', component: WelcomeComponent }
];

@NgModule({
    declarations: [WelcomeComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatButtonModule,
        MatIconModule
    ]
})
export class WelcomeModule { }
