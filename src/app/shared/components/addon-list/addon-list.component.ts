import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {first, takeUntil} from 'rxjs/operators';

import {ApiService} from '../../../core/services';
import {AddonConfigEntity, AddonEntity} from '../../entity/AddonEntity';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';

import {SelectAddonDialogComponent} from './select-addon-dialog/select-addon-dialog.component';

@Component({
  selector: 'km-addon-list',
  templateUrl: 'addon-list.component.html',
  styleUrls: ['addon-list.component.scss'],
})
export class AddonsListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() addons: AddonEntity[] = [];
  @Input() isClusterReady = true;

  // Usage of event emitters allows to handle edits and deletions in multiple ways in different places.
  // Thanks to them this component can be used inside wizard (performing actions on a local addons array)
  // and also in the cluster view (calling API endpoints to perform any action).
  @Output() addAddon = new EventEmitter<AddonEntity>();
  @Output() deleteAddon = new EventEmitter<AddonEntity>();

  accessibleAddons: string[] = [];
  installableAddons: string[] = [];
  addonConfigs = new Map<string, AddonConfigEntity>();
  private _unsubscribe: Subject<any> = new Subject();

  constructor(
      private readonly _apiService: ApiService, private readonly _matDialog: MatDialog,
      private readonly _domSanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this._apiService.getAccessibleAddons().pipe(takeUntil(this._unsubscribe)).subscribe(accessibleAddons => {
      this.accessibleAddons = accessibleAddons;
      this._updateInstallableAddons();
    });

    this._apiService.addonConfigs.pipe(takeUntil(this._unsubscribe)).subscribe(addonConfigs => {
      const map = new Map();
      addonConfigs.forEach(addonConfig => map.set(addonConfig.name, addonConfig));
      this.addonConfigs = map;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this._updateInstallableAddons();
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  _updateInstallableAddons(): void {
    const installedAddons = this.addons.map(addon => {
      return addon.name;
    });

    this.installableAddons = this.accessibleAddons.filter(accessibleAddon => {
      return installedAddons.indexOf(accessibleAddon) < 0;
    });
  }

  hasLogo(name: string): boolean {
    const addonConfig = this.addonConfigs.get(name);
    return !!addonConfig && !!addonConfig.spec.logo;
  }

  getAddonLogo(name: string): SafeUrl {
    return this._domSanitizer.bypassSecurityTrustUrl(
        `data:image/svg+xml;base64,${this.addonConfigs.get(name).spec.logo}`);
  }

  canAdd(): boolean {
    return this.isClusterReady && this.accessibleAddons.length > 0 && this.addons.length < this.accessibleAddons.length;
  }

  getAddBtnClass(): string {
    return !this.canAdd() ? 'disabled' : '';
  }

  getAddBtnTooltip(): string {
    if (this.accessibleAddons.length === 0) {
      return 'There are no accessible addons.';
    } else if (this.addons.length === this.accessibleAddons.length) {
      return 'All accessible addons are already installed.';
    } else {
      return '';
    }
  }

  add(): void {
    if (this.canAdd()) {
      const dialog = this._matDialog.open(SelectAddonDialogComponent);
      dialog.componentInstance.installableAddons = this.installableAddons;
      dialog.componentInstance.addonConfigs = this.addonConfigs;
      dialog.afterClosed().pipe(first()).subscribe(addedAddon => {
        if (!!addedAddon) {
          this.addAddon.emit(addedAddon);
        }
      });
    }
  }

  delete(addon: AddonEntity): void {
    const config: MatDialogConfig = {
      data: {
        title: 'Delete Addon',
        message: `Are you sure you want to permanently delete addon "<strong>${addon.name}</strong>"?`,
        confirmLabel: 'Delete',
      },
    };

    if (addon.spec.isDefault) {
      config.data.warning = 'This is a default addon. It will be automatically restored after deletion.';
    }

    const dialog = this._matDialog.open(ConfirmationDialogComponent, config);
    dialog.afterClosed().pipe(first()).subscribe(isConfirmed => {
      if (!!isConfirmed) {
        this.deleteAddon.emit(addon);
      }
    });
  }
}