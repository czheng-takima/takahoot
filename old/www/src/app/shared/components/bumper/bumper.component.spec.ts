import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BumperComponent } from './bumper.component';

describe('BumperComponent', () => {
  let component: BumperComponent;
  let fixture: ComponentFixture<BumperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BumperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BumperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
