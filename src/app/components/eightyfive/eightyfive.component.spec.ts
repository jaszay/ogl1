import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EightyfiveComponent } from './eightyfive.component';

describe('EightyfiveComponent', () => {
  let component: EightyfiveComponent;
  let fixture: ComponentFixture<EightyfiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EightyfiveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EightyfiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
