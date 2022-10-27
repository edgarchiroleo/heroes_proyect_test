import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IHeroeModel } from '../../models/heroes.model';
import { HeroesService } from '../../services/heroes.service';
import { HeroesListComponent } from '../list/heroes-list.component';

@Component({
  selector: 'app-heroe-details',
  templateUrl: './details-heroe.component.html',
  styleUrls: ['./details-heroe.component.scss'],
})
export class HeroeDetailsComponent implements OnInit, OnDestroy {
  // Public
  heroe: IHeroeModel;
  heroeForm: UntypedFormGroup;
  heroes: IHeroeModel[];
  //Private
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _heroesService: HeroesService,
    private _heroesListComponent: HeroesListComponent,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this._heroesListComponent.matDrawer.open();

    this.createForm();

    // Get the contact
    this._heroesService.heroe$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((heroe: IHeroeModel) => {

        this._heroesListComponent.matDrawer.open();

        this.heroe = heroe;
        this.heroeForm.patchValue(heroe)

        this._changeDetectorRef.markForCheck();
      });

    this._heroesService.heroes$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((heroes: IHeroeModel[]) => {
        this.heroes = heroes;

        this._changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
  /**
   * Close the drawer
   */
  closeDrawer(): Promise<MatDrawerToggleResult> {
    return this._heroesListComponent.matDrawer.close();
  }

  createForm(): void {
    // Create the heroe form
    this.heroeForm = this._formBuilder.group({
      id: [''],
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      company: ['', [Validators.required]],
      description: [''],
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Remove heroe action
   */
  deleteHeroe(): void {
    const id = this.heroe.id;

    const currentHeroeIndex = this.heroes.findIndex((item) => item.id === id);
    const nextContactIndex =
      currentHeroeIndex +
      (currentHeroeIndex === this.heroes.length - 1 ? -1 : 1);
    const nextHeroesId =
      this.heroes.length === 1 && this.heroes[0].id === id
        ? null
        : this.heroes[nextContactIndex].id;

    this._heroesService.deleteHeroe(id).subscribe((isDeleted) => {
      if (!isDeleted) {
        return;
      }
      this._heroesService.getHeroes(0, 10, 'name', 'asc', null).subscribe(()=>{});
      if (nextHeroesId) {
        this._router.navigate(['../', nextHeroesId], {
          relativeTo: this._activatedRoute,
        });
      } else {
        this._router.navigate(['../'], {
          relativeTo: this._activatedRoute,
        });
      }

      this._router.navigate(['../'], {
        relativeTo: this._activatedRoute,
      });
    });

    this._changeDetectorRef.markForCheck();
  }

  /**
   * Update Heroe
   */
  updateHereo(): void {
    let heroe = this.heroeForm.getRawValue();
    heroe.id = this.heroe.id;
    this._heroesService.updateHeroe(heroe.id, heroe).subscribe(() => {
      this._router.navigate(['../'], {
        relativeTo: this._activatedRoute,
      });
    });
  }
}
