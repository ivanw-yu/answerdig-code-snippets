import {NgModule} from '@angular/core';

import { Routes, RouterModule, PreloadAllModules } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { ProfileComponent } from "./components/profile/profile.component";
import { QuestionsComponent } from "./components/questions/questions.component";
import { QuestionComponent } from "./components/question/question.component";
import { QuestionsListingComponent } from "./components/questions-listing/questions-listing.component";
import { AuthComponent } from './components/auth/auth.component';
import { AppComponent } from './app.component';
import { AuthGuard } from './services/auth-guard.service';

const appRoutes : Routes = [
    {path: '', pathMatch: 'full', component: HomeComponent},
    {path: 'auth', component: AuthComponent, loadChildren: './modules/auth.module#AuthModule'},
    {path: 'profile', component: ProfileComponent, loadChildren: './modules/profile.module#ProfileModule', canActivate: [AuthGuard]},
    {path: 'questions', component: QuestionsComponent, loadChildren: './modules/questions.module#QuestionsModule'},
    {path: '**', redirectTo: ''}
]

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, {preloadingStrategy: PreloadAllModules})
    ],
    exports : [RouterModule]
})
export class AppRouting {}
