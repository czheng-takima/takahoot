import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {TargetsActionTypes} from './targets.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Target} from '../models/target.model';
import {of} from 'rxjs';

import * as fromTargets from './../store/targets.actions';
import {WebusbService} from '../../shared/services/webusb.service';
import {TargetsService} from '../services/targets.service';
import {TargetOutboundMessage} from '../models/target-outbound-message.model';


function deviceToTarget(index: number, device: USBDevice): Target {
    const claimedInterfaces: number = device.configuration?.interfaces.filter(i => i.claimed).length || 0;
    return {
        index: index,
        name: device.productName || '',
        claimed: claimedInterfaces > 0,
        connected: false,
        device: device,
        state: []
    };
}

@Injectable()
export class TargetsEffects {

    constructor(
        private actions$: Actions,
        private webusbService: WebusbService,
        private targetsService: TargetsService,
        //private store: Store<AppState>
        ) {
    }

    @Effect()
    query = this.actions$.pipe(
        ofType(TargetsActionTypes.TARGETS_QUERY),
        switchMap(() => this.webusbService.refreshDevices()
            .pipe(map((data) => {
                    const targets: Target[] = data.map((device, index) => deviceToTarget(index, device));
                    return (new fromTargets.TargetsLoaded({targets: targets}));
                }),
                catchError(error => of(new fromTargets.TargetsError({error})))
            )
        )
    );

    @Effect()
    claim$ = this.actions$.pipe(
        ofType(TargetsActionTypes.TARGET_CLAIM),
        map((action: fromTargets.TargetClaim) => action.payload.target),
        switchMap((data: Target) => this.webusbService.claim(data.device)
            .pipe(map(claimed => {
                if (claimed) {
                    return (new fromTargets.TargetsRefresh());
                }
            }), catchError(error => of(new fromTargets.TargetsError({error}))))
        )
    );

    @Effect({dispatch: false})
    sendMessage$ = this.actions$.pipe(
        ofType(TargetsActionTypes.TARGET_SEND_MESSAGE),
        map((action: fromTargets.TargetSendMessage) => action.payload),
        switchMap((data: {message: TargetOutboundMessage, target: Target}) => this.targetsService.sendMessage(data.message, data.target))
    );

    @Effect()
    unclaim = this.actions$.pipe(
        ofType(TargetsActionTypes.TARGET_UNCLAIM),
        map((action: fromTargets.TargetUnclaim) => action.payload.target),
        switchMap((data: Target) => this.webusbService.unclaim(data.device)
            .pipe(map(success => {
                if (success) {
                    return (new fromTargets.TargetsRefresh());
                }
            }), catchError(error => of(new fromTargets.TargetsError({error}))))
        )
    );

}
