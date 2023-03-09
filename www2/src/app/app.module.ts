import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game.component';
import { LogMessagesComponent } from './components/log-messages/log-messages.component';
import { SerialComponent } from './components/serial/serial.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TargetComponent } from './components/target/target.component';
import { TargetsComponent } from './components/targets/targets.component';
import { KahootEngineService } from './services/kahoot-engine.service'; 
import { TargetsService } from './services/targets.service';
import { WebSerialService } from './services/webserial.service';


const materialModules = [
  MatCardModule,
  MatGridListModule,
  MatButtonModule,
  MatInputModule,
  MatIconModule,
  MatSelectModule,
  MatTabsModule,
  MatToolbarModule,
  MatListModule,
];

@NgModule({
  declarations: [
    AppComponent,
    TargetComponent,
    TargetsComponent,
    GameComponent,
    SerialComponent,
    SettingsComponent,
    LogMessagesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ...materialModules,
    HttpClientModule,
    FormsModule,
    FlexLayoutModule,
  ],
  providers: [
    KahootEngineService,
    TargetsService,
    WebSerialService,
    HttpClient,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
