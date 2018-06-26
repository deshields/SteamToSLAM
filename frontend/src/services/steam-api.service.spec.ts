import { TestBed, inject } from '@angular/core/testing';

import { SteamAPIService } from './steam-api.service';

describe('SteamAPIService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SteamAPIService]
    });
  });

  it('should be created', inject([SteamAPIService], (service: SteamAPIService) => {
    expect(service).toBeTruthy();
  }));
});
