import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { HeroesComponent } from './heroes.component';
import { HeroesRoutingModule } from './router/heroes.routes';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeroesListComponent } from './views/list/heroes-list.component';
import { HeroeDetailsComponent } from './views/details/details-heroe.component';

@NgModule({
  imports: [
    SharedModule,
    HeroesRoutingModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatRippleModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSortModule,
    MatSidenavModule
  ],
  exports: [],
  declarations: [
    HeroesComponent,
    HeroesListComponent,
    HeroeDetailsComponent
  ],
  providers: [],
})
export class HeroesModule {}
