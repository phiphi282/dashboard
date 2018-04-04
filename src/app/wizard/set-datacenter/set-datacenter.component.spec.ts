import { DatacenterService } from './../../core/services/datacenter/datacenter.service';
import { SharedModule } from '../../shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SetDatacenterComponent } from './set-datacenter.component';
import { DatacenterMockService } from '../../testing/services/datacenter-mock.service';
import { WizardService } from '../../core/services/wizard/wizard.service';
import { MatButtonToggleModule } from '@angular/material';
import { fakeDigitaloceanCluster } from '../../testing/fake-data/cluster.fake';

describe('SetDatacenterComponent', () => {
  let fixture: ComponentFixture<SetDatacenterComponent>;
  let component: SetDatacenterComponent;
  let dcService: DatacenterService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        SharedModule,
        MatButtonToggleModule,
      ],
      declarations: [
        SetDatacenterComponent
      ],
      providers: [
        WizardService,
        { provide: DatacenterService, useClass: DatacenterMockService }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetDatacenterComponent);
    component = fixture.componentInstance;
    component.cluster = fakeDigitaloceanCluster;
    component.cluster.spec.cloud.dc = '';

    fixture.detectChanges();

    dcService = fixture.debugElement.injector.get(DatacenterService);
  });

  it('should create the set-datacenter cmp', () => {
    expect(component).toBeTruthy();
  });

  it('form invalid after creating', () => {
    expect(component.setDatacenterForm.valid).toBeFalsy();
  });
});
