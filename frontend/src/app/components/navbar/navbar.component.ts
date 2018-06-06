import { Component, OnInit } from '@angular/core';
import {Router, NavigationExtras} from '@angular/router';

import {AuthService} from '../.././services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  searchTags : string;
  constructor(private router : Router,
              public authService : AuthService) { }

  ngOnInit() {
  }

  onSearch(){
    let navExtras : NavigationExtras = {
      queryParams: { 'search' : this.searchTags}
    };
    this.router.navigate(['/questions'], navExtras);
    return false;
  }

  onLogout(){
    this.authService.logout().subscribe(
      (data) => {
        if(data['success']){
          localStorage.clear();
          this.router.navigate(['/auth','login']);
        }
      },
      (err) => {

      }
    );
  }
}
