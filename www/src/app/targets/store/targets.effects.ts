import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Target } from '../models/target.model';
import { TargetsActionTypes } from './targets.actions';

import { TargetOutboundMessage } from '../models/target-outbound-message.model';
import { TargetsService } from '../services/targets.service';
import * as fromTargets from './../store/targets.actions';


// function deviceToTarget(index: number, device: USBDevice): Target {
//     const claimedInterfaces: number = device.configuration?.interfaces.filter(i => i.claimed).length || 0;
//     return {
//         index: index,
//         name: device.productName || '',
//         claimed: claimedInterfaces > 0,
//         connected: false,
//         device: device,
//         state: []
//     };
// }



@Injectable()
export class TargetsEffects {

    constructor(
        private actions$: Actions,
        private targetsService: TargetsService,
        //private store: Store<AppState>
    ) {
    }

    @Effect()
    establishConnection$ = this.actions$.pipe(
        ofType(TargetsActionTypes.TARGET_ESTABLISH_CONNECTION),
        switchMap(() => this.targetsService.selectPort()
            .pipe(
                map(() => { }), catchError(error => of(new fromTargets.TargetsError({ error })))
            )
        )
    );

    @Effect({ dispatch: false })
    sendMessage$ = this.actions$.pipe(
        ofType(TargetsActionTypes.TARGET_SEND_MESSAGE),
        map((action: fromTargets.TargetSendMessage) => action.payload),
        switchMap((data: { message: TargetOutboundMessage, target: Target }) => this.targetsService.sendMessage(data.message, data.target))
    );
}
