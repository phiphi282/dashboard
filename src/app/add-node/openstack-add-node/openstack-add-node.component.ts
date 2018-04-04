import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { AddNodeService } from '../../core/services/add-node/add-node.service';
import { NodeProviderData } from '../../shared/model/NodeSpecChange';
import { ApiService } from '../../core/services';
import { CloudSpec } from '../../shared/entity/ClusterEntity';
import { OpenstackFlavor } from '../../shared/entity/provider/openstack/OpenstackSizeEntity';

@Component({
  selector: 'kubermatic-openstack-add-node',
  templateUrl: './openstack-add-node.component.html',
  styleUrls: ['./openstack-add-node.component.scss']
})
export class OpenstackAddNodeComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public cloudSpec: CloudSpec;
  public flavors: OpenstackFlavor[] = [];
  public loadingFlavors = false;
  public osNodeForm: FormGroup = new FormGroup({
    flavor: new FormControl(0, Validators.required),
    image: new FormControl('', Validators.required),
  });
  private subscriptions: Subscription[] = [];

  constructor(private addNodeService: AddNodeService, private api: ApiService) { }

  ngOnInit(): void {
    this.subscriptions.push(this.osNodeForm.valueChanges.subscribe(data => {
      this.addNodeService.changeNodeProviderData(this.getNodeProviderData());
    }));

    this.addNodeService.changeNodeProviderData(this.getNodeProviderData());
    this.loadFlavors();
  }

  ngOnDestroy() {
    for (const sub of this.subscriptions) {
      if (sub) {
        sub.unsubscribe();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadFlavors();
  }

  getNodeProviderData(): NodeProviderData {
    return {
      spec: {
        openstack: {
          flavor: this.osNodeForm.controls.flavor.value,
          image: this.osNodeForm.controls.image.value,
        },
      },
      valid: this.osNodeForm.valid,
    };
  }

  public loadFlavors() {
    if (
      this.cloudSpec.openstack.username === '' ||
      this.cloudSpec.openstack.password === '' ||
      this.cloudSpec.openstack.tenant === '' ||
      this.cloudSpec.openstack.domain === '' ||
      this.flavors.length > 0) {
      return;
    }

    this.loadingFlavors = true;
    this.subscriptions.push(this.api.getOpenStackFlavors(this.cloudSpec.openstack.username, this.cloudSpec.openstack.password, this.cloudSpec.openstack.tenant, this.cloudSpec.openstack.domain, this.cloudSpec.dc).subscribe(
      flavors => {
        const sortedFlavors = flavors.sort((a, b) => {
          return (a.memory < b.memory ? -1 : 1) * ('asc' ? 1 : -1);
        });
        this.flavors = sortedFlavors;
        if (sortedFlavors.length > 0 && this.osNodeForm.controls.flavor.value !== '0') {
          this.osNodeForm.controls.flavor.setValue(sortedFlavors[0].slug);
        }
        this.loadingFlavors = false;
      }));
  }
}
