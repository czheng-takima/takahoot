import { TestBed } from '@angular/core/testing';

import { WebusbService } from './webusb.service';

describe('WebusbService', () => {
  let service: WebusbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebusbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
