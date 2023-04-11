import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonsModule, CardsModule, IconsModule, InputsModule, InputUtilitiesModule} from 'angular-bootstrap-md';
import {FormsModule} from '@angular/forms';
import {TargetsListComponent} from './components/targets-list/targets-list.component';
import {TargetComponent} from './components/target/target.component';
import { BumperComponent } from './components/bumper/bumper.component';

@NgModule({
  declarations: [
    TargetsListComponent,
    TargetComponent,
    BumperComponent
  ],
  imports: [
    CommonModule,
    InputsModule,
    InputUtilitiesModule,
    IconsModule,
    FormsModule,
    ButtonsModule,
    CardsModule
  ],
  exports: [TargetsListComponent, TargetComponent, BumperComponent],
  providers: [],
  entryComponents: [

  ]
})
export class SharedModule {
}
