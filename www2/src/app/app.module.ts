import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { FirestoreModule } from '@angular/fire/firestore';
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game.component';
import { SerialPortsComponent } from './components/serial-ports/serial-ports.component';
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
  MatCheckboxModule,
  MatTableModule,
];

@NgModule({
  declarations: [
    AppComponent,
    TargetComponent,
    TargetsComponent,
    GameComponent,
    SettingsComponent,
    SerialPortsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ...materialModules,
    HttpClientModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase()),
    FirestoreModule,
  ],
  providers: [
    KahootEngineService,
    TargetsService,
    WebSerialService,
    HttpClient,
    { provide: 'Database', useFactory: getDatabase }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
