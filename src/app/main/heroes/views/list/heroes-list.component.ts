import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { IHeroeModel, IHeroePagination } from '../../models/heroes.model';
import { HeroesService } from '../../services/heroes.service';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-heroes-list',
  templateUrl: './heroes-list.component.html',
  styleUrls: ['./heroes-list.component.scss'],
})
export class HeroesListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  // Public Properties
  searchInputControl: FormControl = new FormControl();
  dataSource: HeroesDataSource;
  displayedColumns = ['name', 'code', 'company', 'actions'];
  pagination: IHeroePagination;
  isLoading: boolean = false;
  selectedHeroe: IHeroeModel;
  heroes: IHeroeModel[];

  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  /**
   * Constructor
   */
  constructor(
    private _heroesService: HeroesService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {
    this.dataSource = new HeroesDataSource(this._heroesService);
    this.pagination = {
      length: 0,
      size: 0,
      page: 0,
      lastPage: 0,
      startIndex: 0,
      endIndex: 0,
    };
  }

  ngOnInit(): void {
    // Get the pagination
    this._heroesService.pagination$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((pagination: IHeroePagination | null) => {
        if (pagination) this.pagination = pagination;

        this._changeDetectorRef.markForCheck();
      });

    // Subscribe to search input field value changes
    this.searchInputControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(300),
        switchMap((query) => {
          //this.closeDetails();
          this.isLoading = true;
          this._changeDetectorRef.markForCheck();
          return this._heroesService.getHeroes(0, 10, 'name', 'asc', query);
        }),
        map(() => {
          this.isLoading = false;
        })
      )
      .subscribe();

      this._heroesService.heroes$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((heroes: IHeroeModel[]) => {
        this.heroes = heroes;
      });

    this.matDrawer.openedChange.subscribe((opened) => {
      if (!opened) {
        this.selectedHeroe = null;

        this._changeDetectorRef.markForCheck();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this._sort && this._paginator) {
      this._sort.sort({
        id: 'name',
        start: 'asc',
        disableClear: true,
      });

      this._changeDetectorRef.markForCheck();

      this._sort.sortChange
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(() => {
          this._paginator.pageIndex = 0;

          //this.closeDetails();
        });

      merge(this._sort.sortChange, this._paginator.page)
        .pipe(
          switchMap(() => {
            //this.closeDetails();
            this.isLoading = true;
            return this._heroesService.getHeroes(
              this._paginator.pageIndex,
              this._paginator.pageSize,
              this._sort.active,
              this._sort.direction
            );
          }),
          map(() => {
            this.isLoading = false;
          })
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * On backdrop clicked
   */
  onBackdropClicked(): void {
    this._router.navigate(['./'], { relativeTo: this._activatedRoute });

    this._changeDetectorRef.markForCheck();
  }

  /**
   * On create heroe clicked
   */
  createHeroe(): void {
    // Create the heroe
    this._heroesService.createHeroe().subscribe((newHeroe) => {
      // Go to the new heroe
      this._router.navigate(['./', newHeroe?.id], {
        relativeTo: this._activatedRoute,
      });

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Remove heroe action
   */
  deleteHeroe(id): void {
    this._heroesService.deleteHeroe(id).subscribe(() => {
      this._heroesService.getHeroes(0, 10, 'name', 'asc', this.searchInputControl.value).subscribe(()=>{});
    });
  }

  goHeroe(id): void {
    this._router.navigate(['./', id], {
      relativeTo: this._activatedRoute,
    });
  }
}

export class HeroesDataSource extends DataSource<IHeroeModel[]> {
  constructor(private _heroesService: HeroesService) {
    super();
  }

  /**
   * Connect function called by the table to retrieve one stream containing the data to render.
   * @returns {Observable<IHeroeModel[]>}
   */
  connect(): Observable<any[]> {
    return this._heroesService.heroes$.pipe(
      map((heroes) => {
        return heroes || [];
      })
    );
  }

  disconnect(collectionViewer: CollectionViewer): void {}
}
