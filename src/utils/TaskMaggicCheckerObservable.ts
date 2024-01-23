import { BehaviorSubject, combineLatest, distinctUntilKeyChanged, interval, Observable, scan, timestamp } from "rxjs";

const minDelayThresholdSleepTime:number = 1000; //ms
const deltaTimeInterval:number = 500; //ms

type MaggicCheck = {
    state:string // NOT STARTED|WORK|PAUSE
    sleepState:string // WAKE|SLEEP
    start: number
    end: number
    sleepDuration: number
    workDuration: number
    pauseDuration: number
}

export const TaskMaggicCheckerObservable:(bSubject:BehaviorSubject<string>) => Observable<MaggicCheck> = (bSubject:BehaviorSubject<string>) => {
    return combineLatest([bSubject, interval(deltaTimeInterval)]).pipe(
        timestamp(),
        scan((acc, curr) => {
            const { value: [state], timestamp } = curr;

            // evaluate all new values
            const start:number = (acc.start === 0 && state !== "NOT STARTED") ? timestamp : acc.start; // only once first worked
            const end:number = timestamp; // update each new event
            const interval:number = timestamp - acc.end;

            // event are every deltaTimeInterval or sooner - if event takes more time this is a sign of sleep
            const sleepState:'WAKE'|'SLEEP' = (Math.abs(deltaTimeInterval - interval) >= minDelayThresholdSleepTime) ? 'SLEEP' : 'WAKE';

            // accumulate in corresponding bucket
            let workDuration:number = acc.workDuration;
            let pauseDuration:number = acc.pauseDuration;
            let sleepDuration:number = acc.sleepDuration;
            
            switch(true) {
                // IS SLEEPING
                case ((acc.sleepState === "WAKE" && sleepState === "SLEEP") || (acc.sleepState === "SLEEP" && sleepState === "SLEEP")):
                    // sleep interval
                    sleepDuration += interval;
                    break;

                // IS AWAKE
                case (acc.state === 'WORK'):
                    // was work until now
                    workDuration += interval;
                    break;

                case (acc.state === 'PAUSE'):
                    // was pause until now
                    pauseDuration += interval;
            };

            return { state, sleepState, start, end, sleepDuration, workDuration, pauseDuration };
        }, { state: 'NOT STARTED', sleepState: 'WAKE', start:0, end:0, sleepDuration: 0, workDuration: 0, pauseDuration: 0 }),
        distinctUntilKeyChanged('state', (previousVal, val) => (previousVal === 'NOT STARTED' && val === 'NOT STARTED')), // let pass everything but repeated NOT STARTED
    );
}