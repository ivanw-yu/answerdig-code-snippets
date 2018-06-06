import { Component, 
         OnInit, 
         ViewChild,
         Input,
         AfterViewInit} from '@angular/core';

import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CustomValidatorsService } from '../../services/custom-validators.service';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';



@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css', './../register/register.component.css']
})
export class UserFormComponent implements OnInit{

  @ViewChild('userForm') userForm : NgForm;
  @Input() user;
  @Input() mode;
  httpError : string;

  constructor(private requestService : RequestService,
              private authService : AuthService,
              public customValidators : CustomValidatorsService,
              private router : Router) { }

  ngOnInit() {
    setTimeout(() => {
      this.userForm.setValue({
        name: {first: this.user['name']['first'], last: this.user['name']['last']},
        username: this.user['username'],
        email : this.user['email'],
        password: ''
      })
    }, 0);
  }

  onSubmit(){
    const user = this.userForm.value;

    if(this.mode == 'edit'){
      user._id = this.user._id;
      return this.requestService.editUser(user).subscribe( (data) => {
        if(data['success']){
          localStorage.setItem('user', JSON.stringify(data['user']));
          this.router.navigate(['/profile']);
        }else{
          this.httpError = data['message'];
        }
      },
      (error) => {
        this.setHttpError(error);
      });
    }

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
