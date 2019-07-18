import { Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router : Router,
    private authservice: AuthService) { }

  canActivate(route,state: RouterStateSnapshot) {
   if (this.authservice.isLoggedIn()) return true;
   this.router.navigate(['/login'], {queryParams: {returUrl: state.url}});
   return false;
  }
}
