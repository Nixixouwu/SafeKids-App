import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentParentsPage } from './student-parents.page';

describe('StudentParentsPage', () => {
  let component: StudentParentsPage;
  let fixture: ComponentFixture<StudentParentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentParentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
