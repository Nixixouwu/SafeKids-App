import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecoverPasswordPage } from './recover-password.page';
import { FormsModule } from '@angular/forms';

describe('RecoverPasswordPage', () => {
  let component: RecoverPasswordPage;
  let fixture: ComponentFixture<RecoverPasswordPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecoverPasswordPage],
      imports: [FormsModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
