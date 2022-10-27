import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators'
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

    constructor(
        private _authService: AuthService
    ) { 
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Can activate
     *
     * @param route
     * @param state
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean
    {        
        return this._check();
    }

    /**
     * Can activate child
     *
     * @param childRoute
     * @param state
     */
     canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
     {
         return this._check();
     }
 
     /**
      * Can load
      *
      * @param route
      * @param segments
      */
     canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean
     {
         return this._check();
     }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check the authenticated status
     *
     * @private
     */
     private _check(): Observable<boolean>
     {
        return this._authService.isAuthenticated$
        .pipe(
            switchMap((authenticated)=>{
                if(!authenticated){
                    this._authService.loginWithRedirect()
                    .subscribe((data)=>{
                        debugger;
                        console.log(data)
                    });

                    return of(false);
                }
                return of(true);
            })
        )        
     }
    
}