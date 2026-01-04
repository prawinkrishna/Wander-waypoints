import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AiPlannerLayoutComponent } from './components/ai-planner-layout/ai-planner-layout.component';

const routes: Routes = [
    { path: '', component: AiPlannerLayoutComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AiPlannerRoutingModule { }
