import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AiPlannerRoutingModule } from './ai-planner-routing.module';
import { AiChatComponent } from './components/ai-chat/ai-chat.component';
import { TripCanvasComponent } from './components/trip-canvas/trip-canvas.component';
import { SharedModule } from '../../components/shared/shared.module';

import { AiPlannerLayoutComponent } from './components/ai-planner-layout/ai-planner-layout.component';

@NgModule({
    declarations: [AiChatComponent, TripCanvasComponent, AiPlannerLayoutComponent],
    imports: [
        CommonModule,
        FormsModule,
        AiPlannerRoutingModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        SharedModule
    ]
})
// Module definition
export class AiPlannerModule { }
