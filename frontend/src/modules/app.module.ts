import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from 'src/components/app/app.component';
import { UserFormComponent } from 'src/components/user-form/user-form.component';
import { FormsModule } from '@angular/forms';
import { SteamAPIService} from '../services/steam-api.service';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component: UserFormComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    UserFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    HttpClientModule
  ],
  providers: [SteamAPIService],
  bootstrap: [AppComponent]
})
export class AppModule { }
