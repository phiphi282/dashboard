import { Observable } from 'rxjs/Observable';

import { NodeDeleteConfirmationComponent } from './node-delete-confirmation.component';
import { MdDialog, MdDialogConfig } from '@angular/material';
import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable()
export class NodeDeleteConfirmationService {

  constructor(private dialog: MdDialog) { }

  public confirm(title: string,
                 message: string,
                 viewContainerRef: ViewContainerRef,
                 btnOkText: string = 'Ok',
                 btnCancelText: string = 'Cancel'): Observable<boolean> {

   // let config = new MdDialogConfig();

    const config: MdDialogConfig = {
      disableClose: false,
      hasBackdrop: true,
      backdropClass: '',
      width: '',
      height: '',
      position: {
        top: '',
        bottom: '',
        left: '',
        right: ''
      },
      data: {
        message: 'Jazzy jazz jazz'
      }
    };

    config.viewContainerRef = viewContainerRef;

    const dialogRef = this.dialog.open(NodeDeleteConfirmationComponent, config);

    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.btnOkText = btnOkText;
    dialogRef.componentInstance.btnCancelText = btnCancelText;

    return dialogRef.afterClosed();
  }

  public confirmWithoutContainer(title: string,
                                 message: string,
                                 titleAlign: string= 'center',
                                 messageAlign: string= 'center',
                                 btnOkText: string = 'Ok',
                                 btnCancelText: string = 'Cancel' ): Observable<boolean> {

    const config = new MdDialogConfig();
    // config.viewContainerRef = viewContainerRef;

    const dialogRef = this.dialog.open(NodeDeleteConfirmationComponent, config);

    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.titleAlign = titleAlign;
    dialogRef.componentInstance.messageAlign = messageAlign;
    dialogRef.componentInstance.btnOkText = btnOkText;
    dialogRef.componentInstance.btnCancelText = btnCancelText;

    return dialogRef.afterClosed();
  }
}
