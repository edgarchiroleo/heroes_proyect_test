import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IHeroeModel, IHeroePagination } from '../models/heroes.model';
import { HeroesService } from './heroes.service';

@Injectable({ providedIn: 'root' })
export class HeroeResolverService implements Resolve<any> {
  /**
   * Constructor
   */
  constructor(private _heroesService: HeroesService, private _router: Router) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Resolver
   *
   * @param route
   * @param state
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<IHeroeModel | null> {

    const  id = route.paramMap.get('id');
    if(!id) return of(null);

    return this._heroesService.getHeroeById(id).pipe(
      catchError((error) => {
        console.error(error);

        // Get the parent url
        const parentUrl = state.url.split('/').slice(0, -1).join('/');

        // Navigate to there
        this._router.navigateByUrl(parentUrl);

        // Throw an error
        return throwError(error);
      })
    );
  }
}


@Injectable({ providedIn: 'root' })
export class HeroesResolverService implements Resolve<any> {
  /**
   * Constructor
   */
  constructor(private _heroesService: HeroesService, private _router: Router) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Resolver
   *
   * @param route
   * @param state
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<{ pagination: IHeroePagination; heroes: IHeroeModel[] }> {

    return this._heroesService.getHeroes()

  }
}


