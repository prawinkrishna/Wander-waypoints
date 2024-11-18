import { TestBed } from '@angular/core/testing';

import { WanderLibraryService } from './wander-library.service';

describe('WanderLibraryService', () => {
  let service: WanderLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WanderLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
