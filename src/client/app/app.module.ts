import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { StepService } from './step.service';
import { PathsComponent } from './paths.component';

import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
      path: '',
      component: PathsComponent
  }
 ];

@NgModule({
  declarations: [
    AppComponent,
    PathsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],

  providers: [StepService],
  bootstrap: [AppComponent]
})
export class AppModule { }
