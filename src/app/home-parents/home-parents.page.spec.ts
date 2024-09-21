import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeParentsPage } from './home-parents.page';

describe('HomeParentsPage', () => {
  let component: HomeParentsPage;
  let fixture: ComponentFixture<HomeParentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeParentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
