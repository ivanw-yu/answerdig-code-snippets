import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {Routes, RouterModule} from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProfileComponent } from './components/profile/profile.component';
import { QuestionsComponent } from './components/questions/questions.component';

import { RequestService } from './services/request.service';
import { HelperService } from './services/helper.service';

import {AppRouting} from './app-routing.module';

import {ObjectIdToDatePipe} from './pipes/object-id-date.pipe';
import { MomentModule } from 'angular2-moment';
import { AuthService } from './services/auth.service';
import { CustomValidatorsService } from './services/custom-validators.service';
import { AuthComponent } from './components/auth/auth.component';
import { SharedModule } from './modules/shared.module';
import { AuthGuard } from './services/auth-guard.service';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    FooterComponent,
    ProfileComponent,
    QuestionsComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MomentModule,
    SharedModule,
    AppRouting
  ],
  providers: [RequestService,
              HelperService,
              AuthService,
              CustomValidatorsService,
            AuthGuard,
          {provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
