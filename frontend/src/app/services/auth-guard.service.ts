import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';

import {AuthService} from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService : AuthService,
                private router : Router) {}
                
    canActivate(route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot) : Observable<boolean> | Promise<boolean> | boolean {

        if(!this.authService.loggedIn()){
            this.router.navigate(['/auth','login']);
        }
        return true;
    }
}