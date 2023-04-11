import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TargetsComponent } from './containers/targets.component';
import { StoreModule } from '@ngrx/store';
import { HttpClientModule } from '@angular/common/http';
import { ButtonsModule, InputsModule, CardsModule, WavesModule, IconsModule, ModalModule } from 'angular-bootstrap-md';

import * as fromTargets from './store/targets.reducer';
import { EffectsModule } from '@ngrx/effects';
import { TargetsEffects } from './store/targets.effects';
import { FormsModule } from '@angular/forms';
import { TargetsRoutingModule } from './targets-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ModalModule,
    SharedModule,
    TargetsRoutingModule,
    HttpClientModule,
    FormsModule,
    ButtonsModule,
    InputsModule,
    WavesModule,
    IconsModule,
    CardsModule,
    StoreModule.forFeature('targets', fromTargets.targetsReducer),
    EffectsModule.forFeature([TargetsEffects])
  ],
  declarations: [TargetsComponent],
  exports: [TargetsComponent],
})
export class TargetsModule { }
