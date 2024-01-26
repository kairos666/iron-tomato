import { BehaviorSubject, combineLatest, distinctUntilKeyChanged, interval, Observable, scan, timestamp } from "rxjs";

export type MaggicCheck = {
    state:string // NOT STARTED|WORK|PAUSE
    start: number
    end: number
    workDuration: number
    pauseDuration: number
}

type MaggicCheckBuilder = (bSubject:BehaviorSubject<'NOT STARTED'|'WORK'|'PAUSE'>, initialValue:MaggicCheck, deltaTimeInterval:number) => Observable<MaggicCheck>

export const maggicCheckerObservableBuilder:MaggicCheckBuilder = (bSubject:BehaviorSubject<'NOT STARTED'|'WORK'|'PAUSE'>, initialValue:MaggicCheck, deltaTimeInterval:number) => {
    return combineLatest([bSubject, interval(deltaTimeInterval)]).pipe(
        timestamp(),
        scan((acc, curr) => {
            const { value: [state], timestamp } = curr;

            // evaluate all new values
            const start:number = (acc.start < 347155200000 && state !== "NOT STARTED") ? timestamp : acc.start; // only once first worked (start after 01/01/1981)
            const end:number = timestamp; // update each new event
            const interval:number = timestamp - acc.end;

            // accumulate in corresponding bucket
            let workDuration:number = acc.workDuration;
            let pauseDuration:number = acc.pauseDuration;
            
            switch(true) {
                case (acc.state === 'WORK'):
                    // was work until now
                    workDuration += interval;
                    break;

                case (acc.state === 'PAUSE'):
                    // was pause until now
                    pauseDuration += interval;
            };

            return { state, start, end, workDuration, pauseDuration };
        }, initialValue),
        distinctUntilKeyChanged('state', (previousVal, val) => (previousVal === 'NOT STARTED' && val === 'NOT STARTED')), // let pass everything but repeated NOT STARTED
    );
}