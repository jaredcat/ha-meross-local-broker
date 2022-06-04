import { Component, AfterViewInit, ViewChild, OnInit, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Device } from '@app/model/device';
import { DeviceStore } from '@app/providers/device';
import { Subdevice } from '@app/model/subdevice';
import { SubdeviceStore } from '@app/providers/subdevice';
import { AdminService } from '@app/services/admin';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Configuration } from '@app/model/configuration';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface SetNameDialogData {
  device: Device;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnInit {
  devicesColumns: string[] = ['deviceId', 'network', 'status', 'userId', 'type'];
  subdevicesColumns: string[] = ['subdeviceId', 'type', 'hubId'];
  deviceSource = new MatTableDataSource<Device>([]);
  subdeviceSource = new MatTableDataSource<Subdevice>([]);
  autoUpdate = true;
  unconfigured = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private deviceStore: DeviceStore,
    private subdeviceStore: SubdeviceStore,
    private adminService: AdminService,
    private snackBarService: MatSnackBar,
    public dialog: MatDialog
  ) {}
  ngOnInit(): void {
    // Update the device and subdevice lists once
    this.deviceStore.devices.subscribe((devices) => (this.deviceSource.data = devices));
    this.subdeviceStore.devices.subscribe((devices) => (this.subdeviceSource.data = devices));
    this.adminService.getConfiguration().subscribe((account: Configuration) => {
      this.unconfigured = !account;
    });
  }

  alertCopied(): void {
    this.snackBarService.open('Device uuid copied to clipboard.', 'ok', { duration: 2000 });
  }

  ngAfterViewInit() {
    this.deviceSource.paginator = this.paginator;
    this.deviceSource.sort = this.sort;
  }

  assignName(device: Device) {
    const dialogRef = this.dialog.open(SetDeviceNameDialog, {
      data: { device: device },
    });
  }
}

@Component({
  selector: 'set-device-name-dialog',
  templateUrl: 'set-device-name-dialog.html',
})
export class SetDeviceNameDialog {
  newDeviceName: string;

  constructor(
    public dialogRef: MatDialogRef<SetDeviceNameDialog>,
    private deviceStore: DeviceStore,
    @Inject(MAT_DIALOG_DATA) public data: SetNameDialogData
  ) {
    this.newDeviceName = data.device.devName;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  setDeviceName(): void {
    this.deviceStore.updateDeviceName(this.data.device.uuid, this.newDeviceName).subscribe((d) => {
      if (d !== null) {
        this.data.device.devName = this.newDeviceName;
      }
      this.dialogRef.close();
    });
  }
}
