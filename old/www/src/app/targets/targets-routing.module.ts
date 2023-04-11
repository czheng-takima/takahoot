import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TargetsComponent } from './containers/targets.component';

const routes: Routes = [
  { path: '', component: TargetsComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TargetsRoutingModule {}
