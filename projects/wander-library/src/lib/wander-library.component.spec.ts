import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WanderLibraryComponent } from './wander-library.component';

describe('WanderLibraryComponent', () => {
  let component: WanderLibraryComponent;
  let fixture: ComponentFixture<WanderLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WanderLibraryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WanderLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
