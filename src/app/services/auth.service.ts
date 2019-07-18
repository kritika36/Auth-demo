import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {pipe} from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';


@Injectable()
export class AuthService {
  constructor(private http: HttpClient) {
  }

  login(credentials) { 
   return this.http.post('/api/authenticate', 
      JSON.stringify(credentials))
      .pipe (
        map(response=> {
          let result= response;
          console.log(result);
          if(result && result['token']){
            localStorage.setItem('token', result['token']);
            return true;
          }
          return false;
          }
        )
      );
  }

  logout() { 
    localStorage.removeItem('token');
  }

  isLoggedIn() { 
  
    let jwtHelper= new JwtHelperService();
    let token= localStorage.getItem('token');
    if(!token)
    return false;

    let expirationDate= jwtHelper.getTokenExpirationDate(token);
    let isExpired= jwtHelper.isTokenExpired(token);

    console.log("Expiration",expirationDate);
    console.log("isExpired",isExpired);
    return !isExpired;
  }
  get currentUser() {
    let token= localStorage.getItem('token');
    if(!token) return null;

    let jwtHelper= new JwtHelperService();
    return jwtHelper.decodeToken(token);
  }
}

