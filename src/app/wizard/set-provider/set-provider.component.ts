import { WizardActions } from 'app/redux/actions/wizard.actions';
import { DataCenterEntity } from './../../shared/entity/DatacenterEntity';
import { DatacenterService } from './../../core/services/datacenter/datacenter.service';
import { Observable } from 'rxjs/Observable';
import { select } from '@angular-redux/store';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NodeProvider } from '../../shared/model/NodeProviderConstants';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'kubermatic-set-provider',
  templateUrl: 'set-provider.component.html',
  styleUrls: ['set-provider.component.scss']
})
export class SetProviderComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  public setProviderForm: FormGroup;
  public supportedNodeProviders: string[] = NodeProvider.Supported;
  public datacenters: { [key: string]: DataCenterEntity[] } = {};

  @select(['wizard', 'setProviderForm', 'provider']) provider$: Observable<string>;
  public selectedProvider: string = '';

  constructor(private fb: FormBuilder,
              private dcService: DatacenterService) { }

  public ngOnInit(): void {
    const sub = this.provider$.subscribe(provider => {
      provider && (this.selectedProvider = provider);
    });
    this.subscriptions.push(sub);

    this.setProviderForm = this.fb.group({
      provider: [this.selectedProvider]
    });

    const sub2 = this.getDatacenters();
    this.subscriptions.push(sub2);
  }

  public onChange(): void {
    WizardActions.resetForms();
  }

  public getDatacenters(): Subscription {
    return this.dcService.getDataCenters().subscribe(result => {
      result.forEach(elem => {
        if (!this.datacenters.hasOwnProperty(elem.spec.provider)) {
          this.datacenters[elem.spec.provider] = [];
        }

        this.datacenters[elem.spec.provider].push(elem);
      });
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}