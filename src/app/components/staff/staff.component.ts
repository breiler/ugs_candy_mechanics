import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Router } from '@angular/router';

import { StatusService } from '../../services/status.service';
import { MachineService } from '../../services/machine.service';
import { FilesService  } from '../../services/files.service';
import { WorkflowManagerService } from '../../services/workflow-manager.service';
import { Status } from '../../model/status';
import { StateEnum } from '../../model/state-enum';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss']
})
export class StaffComponent implements OnInit, OnDestroy {
  private status:Status;
  private statusSubscription:ISubscription;

  constructor(private router: Router, private statusService:StatusService, private machineService:MachineService, private filesService:FilesService, private workflowManager:WorkflowManagerService) { }

  ngOnInit() {
    this.status = new Status();
    this.statusSubscription = this.statusService.getStatus()
      .subscribe(data => {
        this.status = data;
      });
  }

  ngOnDestroy() {
    this.statusSubscription.unsubscribe();
  }

  isIdle() : boolean {
    return this.status.state == StateEnum.IDLE;
  }

  disconnect() {
    this.workflowManager.stop().subscribe(() => {
      this.machineService.disconnect().subscribe();
    });
  }

  resetMachine() {
    this.workflowManager.stop().subscribe(() => {
      this.machineService.softReset().subscribe(() => {
        console.log("Killing alarm");
        this.machineService.killAlarm().subscribe(() => {
          this.router.navigate(['/select-file']);
        });
      });
    });
  }

  stopSending() {
    this.workflowManager.stop().subscribe();
  }

  returnToStart() {
    this.workflowManager.stop().subscribe(() => {
      this.workflowManager.setFile('');
      this.machineService.sendCommands(environment.moveToOriginCommand).subscribe();
      this.router.navigate(['/select-file']);
    });
  }
}
