import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardPage } from './dashboard.page';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../../components/shared/shared.module';

@NgModule({
  declarations: [DashboardPage],
  imports: [CommonModule, DashboardRoutingModule, SharedModule],
})
export class DashboardModule {}
