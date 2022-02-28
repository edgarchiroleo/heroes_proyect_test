import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutComponent} from './components/layout/layout-component/layout-component.component';
import { MockApiModule } from './mock-api/mock-api.module';
import { HttpClientModule } from '@angular/common/http';
import { HeroesMockApi } from './mock-api/heroes/api';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MockApiModule.forRoot([HeroesMockApi]),
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
