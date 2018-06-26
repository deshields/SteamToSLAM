import { Component, OnInit } from '@angular/core';
import { SteamUser as Steam }  from '../../classes/user'
import { SteamAPIService} from '../../services/steam-api.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  // Player: Steam
  message: string;

  analyzeUser(form) :void {
    let user = new Steam(form);
    this.message = 'Name accepted'
    this.toSteam.createUser(user)
    .subscribe( );
  
  }

  constructor(private toSteam: SteamAPIService) {
    this.message = ''
    // this.Player = new Steam({username: ''})
   }

  ngOnInit() {
  }

}
