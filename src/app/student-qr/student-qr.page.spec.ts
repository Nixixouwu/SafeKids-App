import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentQrPage } from './student-qr.page';

describe('StudentQrPage', () => {
  let component: StudentQrPage;
  let fixture: ComponentFixture<StudentQrPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentQrPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
