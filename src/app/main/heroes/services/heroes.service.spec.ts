import { TestBed } from '@angular/core/testing';
import { HeroesService } from './heroes.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { heroes } from 'src/app/mock-api/heroes/data';
import { IHeroeModel } from '../models/heroes.model';

describe('HeroesService', () => {
  let service: HeroesService;
  let httpTestingController: HttpTestingController;

  const mockGetHeroesData = {
    heroes: heroes,
    pagination: {
      endIndex: 1,
      lastPage: 1,
      length: 2,
      page: 0,
      size: 10,
      startIndex: 0,
    },
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(HeroesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('getHeroes should make a GET HTTP request and return all data items', () => {
    service.getHeroes(0, 10, 'name', 'asc', null).subscribe((response) => {
      expect(response).toEqual(mockGetHeroesData);
      expect(response.heroes.length).toBe(2);
      expect(response.pagination.size).toBe(10);
    });
    const req = httpTestingController.expectOne(
      'api/heroes?page=0&size=10&sort=name&order=asc&search=null'
    );
    expect(req.request.method).toBe('GET');
    expect(req.cancelled).toBeFalsy();
    expect(req.request.responseType).toEqual('json');
    req.flush(mockGetHeroesData);
    httpTestingController.verify();
  });

  it('getHeroeById return data from behaivor subject', () => {
    service.heroes = heroes;
    service
      .getHeroeById('7eb7c859-1347-4317-96b6-9476a7e2ba3c')
      .subscribe((response) => {
        expect(response).toEqual(heroes[0]);
      });
  });

  it('create Heroe should make a POST HTTP request with resource as body', () => {
    const createObj = {
      id: '',
      code: null,
      name: 'A New hero',
      description: '',
    };
    service.heroes = heroes;
    service.createHeroe().subscribe((response) => {
      expect(response.name).toBe(createObj.name);
    });
    const req = httpTestingController.expectOne(
      'api/heroes',
      'post create to api'
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    expect(req.cancelled).toBeFalsy();
    expect(req.request.responseType).toEqual('json');
    req.flush(createObj);
    httpTestingController.verify();
  });

  it('update heroe should make a PATCH HTTP request with id appended to end of url and resource as body', () => {
    const updateObj: IHeroeModel = {
      id: '7eb7c859-1347-4317-96b6-9476a7e2ba3c',
      code: '23455',
      name: 'A Update hero',
      description: 'test',
      company: 'test',
    };
    service.heroes = heroes;
    service
      .updateHeroe('7eb7c859-1347-4317-96b6-9476a7e2ba3c', updateObj)
      .subscribe((response) => {
        expect(response.name).toBe('A Update hero');
      });
    const req = httpTestingController.expectOne(
      'api/heroes',
      'put to heroe api'
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      id: '7eb7c859-1347-4317-96b6-9476a7e2ba3c',
      heroe: updateObj,
    });
    expect(req.cancelled).toBeFalsy();
    expect(req.request.responseType).toEqual('json');
    req.flush(updateObj);
    httpTestingController.verify();
  });

  it('delete heroe should make a DELETE HTTP request with id appended to end of url', () => {
    service.heroes = heroes;
    service
      .deleteHeroe(heroes[0].id)
      .subscribe((response) => {
        expect(response).toBe(true);
      });

    const req = httpTestingController.expectOne(
      'api/heroes?id='+ heroes[0].id,
      'delete heroe to api'
    );
    expect(req.request.method).toBe('DELETE');
    expect(req.cancelled).toBeFalsy();
    expect(req.request.responseType).toEqual('json');
    req.flush(true);
    httpTestingController.verify();
  });
});
