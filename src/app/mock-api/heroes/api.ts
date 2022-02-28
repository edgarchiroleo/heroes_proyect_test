import { Injectable } from '@angular/core';
import { assign, cloneDeep } from 'lodash-es';
import { ApiUtils, MockApiService } from '../mock-api.service';
import { heroes } from './data';

@Injectable({
  providedIn: 'root',
})
export class HeroesMockApi {
  private _heroes: any[] = heroes;
  constructor(private _mockApiService: MockApiService) {
    this.registerHandlers();
  }

  registerHandlers(): void {
    // -----------------------------------------------------------------------------------------------------
    // @ Heroes - GET
    // -----------------------------------------------------------------------------------------------------
    this._mockApiService.onGet('api/heroes', 300).reply(({ request }) => {

      const search = request.params.get('search');
      const sort = request.params.get('sort') || 'name';
      const order = request.params.get('order') || 'asc';
      const page = parseInt(request.params.get('page') ?? '1', 10);
      const size = parseInt(request.params.get('size') ?? '10', 10);
      let heroes: any[] | null = cloneDeep(this._heroes);

      // Sort the Heroes
      if (sort === 'name') {
        heroes.sort((a, b) => {
          const fieldA = a[sort].toString().toUpperCase();
          const fieldB = b[sort].toString().toUpperCase();
          return order === 'asc'
            ? fieldA.localeCompare(fieldB)
            : fieldB.localeCompare(fieldA);
        });
      } else {
        heroes.sort((a, b) =>
          order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]
        );
      }

      if (search) {
        heroes = heroes.filter(
          (heroe) =>
            heroe.name &&
            heroe.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      const heroesLength = heroes.length;

      const begin = page * size;
      const end = Math.min(size * (page + 1), heroesLength);
      const lastPage = Math.max(Math.ceil(heroesLength / size), 1);

      let pagination = {};

      if (page > lastPage) {
        heroes = null;
        pagination = {
          lastPage,
        };
      } else {
        heroes = heroes.slice(begin, end);

        pagination = {
          length: heroesLength,
          size: size,
          page: page,
          lastPage: lastPage,
          startIndex: begin,
          endIndex: end - 1,
        };
      }

      return [
        200,
        {
          heroes,
          pagination,
        },
      ];
    });

    // -----------------------------------------------------------------------------------------------------
    // @ POST
    // -----------------------------------------------------------------------------------------------------
    this._mockApiService.onPost('api/heroes').reply(() => {
      const newHeroe = {
        id: ApiUtils.guid(),
        code: null,
        name: 'A New hero',
        description: '',
      };

      this._heroes.unshift(newHeroe);

      return [200, newHeroe];
    });

    // -----------------------------------------------------------------------------------------------------
    // @ PATCH
    // -----------------------------------------------------------------------------------------------------
    this._mockApiService.onPatch('api/heroes').reply(({ request }) => {
      const id = request.body.id;
      const heroe = cloneDeep(request.body.heroe);

      let updatedHeroes = null;

      this._heroes.forEach((item, index, heroes) => {
        if (item.id === id) {
          heroes[index] = assign({}, heroes[index], heroe);

          updatedHeroes = heroes[index];
        }
      });

      return [200, updatedHeroes];
    });

    // -----------------------------------------------------------------------------------------------------
    // @ Product - DELETE
    // -----------------------------------------------------------------------------------------------------
    this._mockApiService.onDelete('api/heroes').reply(({ request }) => {
      const id = request.params.get('id');

      this._heroes.forEach((item, index) => {
        if (item.id === id) {
          this._heroes.splice(index, 1);
        }
      });

      return [200, true];
    });
  }
}
