import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetsListComponent } from './projects-list.component';

describe('ProjectsListComponent', () => {
  let component: TargetsListComponent;
  let fixture: ComponentFixture<TargetsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
