import {Component, OnDestroy, OnInit} from '@angular/core';
import {MDBModalRef} from 'angular-bootstrap-md';
import {Target} from '../models/target.model';
import {AppState} from '../../reducers/index';
import {select, Store} from '@ngrx/store';
import * as fromTargets from './../store/targets.actions';
import {Observable, Subscription} from 'rxjs';
import {getAllLoaded, getTargets} from '../store/targets.selectors';
import {map} from 'rxjs/operators';
import {TargetsService} from '../services/targets.service';
import {
  IN_COMPUTER_CONNECTED,
  IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK,
  IN_COMPUTER_ENABLE_BUMPER,
  IN_COMPUTER_ENABLE_BUMPERS,
  IN_COMPUTER_GET_STATE,
  IN_COMPUTER_RESET,
  IN_COMPUTER_START_CALIBRATION
} from '../models/target-outbound-message.model';

@Component({
  selector: 'app-targets',
  templateUrl: './targets.component.html',
  styleUrls: ['./targets.component.scss']
})
export class TargetsComponent implements OnInit, OnDestroy {
  targets$: Observable<Target[] | null>;
  isLoading$: Observable<boolean>;
  modalRef: MDBModalRef;

  private targetSubscriptions: { index: number, subscription: Subscription, timeout: any }[] = [];
  private autoReset: any;
  private autoResetInProgress: boolean = false;
  private targets: Target[];

  modalConfig = {
    class: 'modal-dialog-centered'
  };

  constructor(private store: Store<AppState>, private targetsService: TargetsService) {
  }

  ngOnInit() {
    this.isLoading$ = this.store.select(getAllLoaded);
    this.targets$ = this.store.pipe(
        select(getTargets),
        map((targets: Target[]) => {
          if (!targets || targets.length === 0) {
            this.store.dispatch(new fromTargets.TargetsRefresh());
          }
          this.updateSubscriptions(targets);
          this.targets = targets;
          return targets;
        })
    );
  }

  private updateSubscriptions(targets: Target[]) {
    if (!targets) {
      this.targetSubscriptions.forEach(s => s.subscription.unsubscribe());
      this.targetSubscriptions = [];
      return;
    }
    for (let t of targets) {
      let sub = this.targetSubscriptions.find(s => s.index === t.index);
      if (!sub && t.claimed) {
        let subscription = this.targetsService.readInboundMessages(t).subscribe(tim => {
          console.log(tim);
          this.store.dispatch(new fromTargets.TargetInboundMessageReceived({targetIndex: t.index, message: tim}));
        });
        this.targetSubscriptions.push({index: t.index, subscription: subscription, timeout: undefined});
        this.onConnect(t);
        this.refreshStateEverySecond(t);
      } else if (sub && !t.claimed) {
        sub.subscription.unsubscribe();
        clearInterval(sub.timeout);
        this.targetSubscriptions.splice(this.targetSubscriptions.indexOf(sub), 1);
      }
    }
  }

  onConnect(target: Target) {
    this.store.dispatch(new fromTargets.TargetSendMessage({message: {code: IN_COMPUTER_CONNECTED}, target}));
  }

  onRefreshState(target: Target) {
    this.store.dispatch(new fromTargets.TargetSendMessage({message: {code: IN_COMPUTER_GET_STATE}, target}));
  }

  onReset(target: Target) {
    this.store.dispatch(new fromTargets.TargetSendMessage({message: {code: IN_COMPUTER_RESET}, target}));
  }

  onCalibrate(target: Target) {
    for (let b of target.state) {
      if (b.connected) {
        this.store.dispatch(new fromTargets.TargetSendMessage({message: {code: IN_COMPUTER_START_CALIBRATION, bumperId: b.id}, target}));
      }
    }
  }

  onEnableBumpers(target: Target) {
    for (let b of target.state) {
      if (b.connected) {
        this.store.dispatch(new fromTargets.TargetSendMessage({message: {code: IN_COMPUTER_ENABLE_BUMPER, bumperId: b.id}, target}));
      }
    }
  }

  onDisableBumpers(target: Target) {
    this.store.dispatch(new fromTargets.TargetSendMessage({message: {code: IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK}, target}));
  }

  ngOnDestroy() {
    console.log("this function should be implemented sorry");
    //todo implement
  }


  claimAll() {
    if (this.targets) {
      this.targets.forEach(t => {
        this.store.dispatch(new fromTargets.TargetClaim({target: t}));
      });
    }
  }

  private refreshStateEverySecond(t: Target) {
    this.targetSubscriptions[t.index].timeout = setInterval(() => this.store.dispatch(new fromTargets.TargetSendMessage({
      message: {code: IN_COMPUTER_GET_STATE},
      target: t
    })), 1000);
  }

  unclaimAll() {
      console.log("this function should be implemented sorry");
      //todo implement
  }

  setAutoReset(ar: boolean) {
    if (ar) {
      this.autoReset = setInterval(() => {
        for (let t of this.targets) {
          let hit = t.state.filter(b => b.hit);
          if (hit.length === 0 || this.autoResetInProgress) {
            continue;
          }
          // Dispatch reset 3 seconds after
          this.autoResetInProgress = true;
          setTimeout(() => {
            this.store.dispatch(new fromTargets.TargetSendMessage({message: {code: IN_COMPUTER_ENABLE_BUMPERS}, target: t}));
            setTimeout(() => {
              this.autoResetInProgress = false;
            }, 1000);
          }, 3000);
        }
      }, 1000);
    } else {
      clearInterval(this.autoReset);
      this.autoReset = undefined;
    }

  }

  selectDevices(){
    this.targetsService.selectDevices();
  }
}
