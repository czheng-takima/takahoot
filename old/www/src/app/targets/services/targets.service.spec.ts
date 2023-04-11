import { TestBed, inject } from '@angular/core/testing';

import { TargetsService } from './targets.service';

describe('TargetsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TargetsService]
    });
  });

  it('should be created', inject([TargetsService], (service: TargetsService) => {
    expect(service).toBeTruthy();
  }));
});
