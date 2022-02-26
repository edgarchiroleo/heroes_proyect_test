import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeroesComponent } from '../heroes.component';
import { CanDeactivateHeroesDetails } from '../services/heroes-deactivate.guard';
import { HeroeResolverService, HeroesResolverService } from '../services/heroes.resolver';
import { HeroeDetailsComponent } from '../views/details/details-heroe.component';
import { HeroesListComponent } from '../views/list/heroes-list.component';

const heroesRoutes: Routes = [
  {
    path: '',
    component: HeroesComponent,
    children: [
      {
        path: '',
        component: HeroesListComponent,
        resolve: [HeroesResolverService],
        children: [
          {
            path: ':id',
            component: HeroeDetailsComponent,
            resolve      : {
              heroe  : HeroeResolverService,
            },
            canDeactivate: [CanDeactivateHeroesDetails]
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(heroesRoutes)],
  exports: [RouterModule],
})
export class HeroesRoutingModule {}
