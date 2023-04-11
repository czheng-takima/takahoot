import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetComponent } from './project.component';

describe('ProjectComponent', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
