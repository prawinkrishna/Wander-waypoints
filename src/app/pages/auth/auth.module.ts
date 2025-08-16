import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthPage } from './auth.page';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [AuthPage],
  imports: [CommonModule, AuthRoutingModule],
})
export class AuthModule {}
