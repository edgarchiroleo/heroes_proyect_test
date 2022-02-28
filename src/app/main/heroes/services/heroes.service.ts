import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  debounceTime,
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { ApiUtils } from 'src/app/mock-api/mock-api.service';
import { IHeroeModel, IHeroePagination } from '../models/heroes.model';

@Injectable({ providedIn: 'root' })
export class HeroesService {
  // Private
  private _heroes: BehaviorSubject<IHeroeModel[] | null> = new BehaviorSubject<
    IHeroeModel[] | null
  >(null);
  private _pagination: BehaviorSubject<IHeroePagination | null> =
    new BehaviorSubject<IHeroePagination | null>(null);
  private _heroe: BehaviorSubject<IHeroeModel | null> =
    new BehaviorSubject<IHeroeModel | null>(null);
  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------
  /**
   * Getter for heroes
   */
  get heroes$(): Observable<IHeroeModel[] | null> {
    return this._heroes.asObservable();
  }

  /**
   * Getter for heroe
   */
  get heroe$(): Observable<IHeroeModel | null> {
    return this._heroe.asObservable();
  }

  /**
   * Getter for pagination
   */
  get pagination$(): Observable<IHeroePagination | null> {
    return this._pagination.asObservable();
  }

  /**
   * Sette for heroes
   */
  set heroes(value: IHeroeModel[]) {
    this._heroes.next(value);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get Heroes
   */
  getHeroes(
    page: number = 0,
    size: number = 10,
    sort: string = 'name',
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = ''
  ): Observable<{ pagination: IHeroePagination; heroes: IHeroeModel[] }> {
    return this._httpClient
      .get<{ pagination: IHeroePagination; heroes: IHeroeModel[] }>(
        'api/heroes',
        {
          params: {
            page: '' + page,
            size: '' + size,
            sort,
            order,
            search,
          },
        }
      )
      .pipe(
        tap((response) => {
          this._pagination.next(response.pagination);
          this._heroes.next(response.heroes);
        })
      );
  }

  /**
   * Get product by id
   */
  getHeroeById(id: string): Observable<IHeroeModel | null> {
    return this._heroes.pipe(
      take(1),
      map((heroes) => {
        const heroe = heroes?.find((item) => item.id === id) || null;

        if (heroe) this._heroe.next(heroe);

        return heroe;
      }),
      switchMap((heroe) => {
        if (!heroe) {
          return throwError('Could not found heroe with id of ' + id + '!');
        }

        return of(heroe);
      })
    );
  }

  /**
   * Create product
   */
  createHeroe(): Observable<IHeroeModel> {
    return this.heroes$.pipe(
      take(1),
      switchMap((heroes) =>
        this._httpClient.post<IHeroeModel>('api/heroes', {}).pipe(
          map((newHeroe) => {
            if (heroes) {
              newHeroe.id = ApiUtils.guid();
              this._heroes.next([newHeroe, ...heroes]);
            }
            return newHeroe;
          })
        )
      )
    );
  }

  /**
   * Update heroe
   *
   * @param id
   * @param product
   */
  updateHeroe(id: string, heroe: IHeroeModel): Observable<IHeroeModel | null> {
    return this.heroes$.pipe(
      take(1),
      switchMap((heroes) =>
        this._httpClient
          .patch<IHeroeModel>('api/heroes', {
            id,
            heroe,
          })
          .pipe(
            map((updatedHeroe) => {
              const index = heroes?.findIndex((item) => item.id === id);

              if (index !== -1 && heroes) {
                heroes[index] = updatedHeroe;
                this._heroes.next(heroes);
              }

              return updatedHeroe;
            }),
            switchMap((updatedHeroe) =>
              this.heroe$.pipe(
                take(1),
                filter((item) => item !== null && item.id === id),
                tap(() => {
                  this._heroe.next(updatedHeroe);
                  return updatedHeroe;
                })
              )
            )
          )
      )
    );
  }

  /**
   * Delete the heroe
   *
   * @param id
   */
  deleteHeroe(id: string): Observable<boolean> {
    return this.heroes$.pipe(
      take(1),
      switchMap((heroes) =>
        this._httpClient.delete<boolean>('api/heroes', { params: { id } }).pipe(
          map((isDeleted: boolean) => {
            const index = heroes?.findIndex((item) => item?.id === id);
            if (index !== -1) {
              heroes?.splice(index, 1);
            }

            this._heroes.next(heroes);

            return isDeleted;
          })
        )
      )
    );
  }
}
