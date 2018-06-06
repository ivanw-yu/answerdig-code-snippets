import { Injectable,
         isDevMode } from '@angular/core';

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from '.././models/user';


@Injectable()
export class AuthService {

  private url  = isDevMode() ? 'http://localhost:5000/api/' : 'api/';

  constructor(private http : HttpClient) { }

  registerUser(user){
    var headers = new HttpHeaders({ 'Content-Type' : 'application/json'});
    const body = { name : { first: user.name.first, last: user.name.last},
                   username: user.username,
                   password: user.password,
                   email: user.email };
    return this.http.post(this.url + 'users', body, {headers});
  }

  loginUser(usernameOrEmail : string, password : string){
    var headers = new HttpHeaders({'Content-Type' : 'application/json'});
    const body = {username: usernameOrEmail, email: usernameOrEmail, password};
    return this.http.post(this.url + 'users/login', body, {headers/*, observe: 'response'*/});
  }

  loggedIn(){
    return localStorage.getItem('token') !== null;
  }

  getUser(){
    return JSON.parse(localStorage.getItem('user'));
  }

  logout(){
    let token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'x-auth' : token
    });
    return this.http.delete(this.url  + 'users/logout', {headers} );
  }
}
