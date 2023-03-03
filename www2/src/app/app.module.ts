import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game.component';
import { TargetComponent } from './components/target/target.component';
import { TargetsComponent } from './components/targets/targets.component';
import { KahootEngineService } from './services/kahoot-engine.service';
import { TargetsService } from './services/targets.service';
import { WebSerialService } from './services/webserial.service';
import { FormsModule } from '@angular/forms';


const materialModules = [
  MatCardModule,
  MatGridListModule,
  MatButtonModule,
  MatInputModule,
  MatIconModule
];

@NgModule({
  declarations: [
    AppComponent,
    TargetComponent,
    TargetsComponent,
    GameComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ...materialModules,
    HttpClientModule,
    FormsModule,
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
