import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SteamUser as Steam} from 'src/classes/user';


@Injectable()
export class SteamAPIService {

  public createUser(user: Steam): any {
    return this.http.post('http://localhost:3000/steamid/', user);
}
  public makeList(): any {
    return this.http.get('http://localhost:3000/recommendations/auth');
  }

  constructor(private http: HttpClient) { }


  
}
