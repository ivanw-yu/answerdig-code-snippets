import { Component,
         OnInit,
         ViewChild } from '@angular/core';

import {NgForm} from '@angular/forms';

import {CustomValidatorsService} from '../.././services/custom-validators.service';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  @ViewChild("registrationForm") registrationForm : NgForm;
  //customValidators : CustomValidatorsService;
  httpError : string;
  constructor(public customValidators : CustomValidatorsService,
              private requestService : RequestService,
              private authService : AuthService,
              private router : Router) { }

  ngOnInit() {
  }

  onSubmit(){
    const user = this.registrationForm.value;
    this.authService.registerUser(user).subscribe( (data) => {
      if(data['success'] && data['token']){
        localStorage.setItem('token', data['token']);
        localStorage.setItem('user', JSON.stringify(data['user']));
        return this.router.navigate(['/profile']);
      }
      this.setHttpError(data);
    },
    (error) => {
      this.setHttpError(error);
    });
  }

  setHttpError(data){
    this.httpError = data['error'].err.errmsg ?
    ((data['error'].err.errmsg.indexOf('username') > 0) ?
        'Username already taken, please use a different username' :
        ((data['error'].err.errmsg.indexOf('email') > 0) ?
          'Email already taken, please use a different email' : data['error'].err.errmsg))
    : "Registration failed, please try again later.";
  }
}
