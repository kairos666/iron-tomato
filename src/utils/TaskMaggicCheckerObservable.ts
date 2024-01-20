import { BehaviorSubject, combineLatest, distinctUntilKeyChanged, interval, Observable, scan, timeInterval } from "rxjs";

const minDelayThresholdSleepTime:number = 1000; //ms
const deltaTimeInterval:number = 500; //ms

type MaggicCheck = {
    state:string // NOT STARTED|WORK|PAUSE
    sleepState:string // WAKE|SLEEP
    start: number
    end: number
    clockIteration: number
    sleepDuration: number
    workDuration: number
    pauseDuration: number
}

export const TaskMaggicCheckerObservable:(bSubject:BehaviorSubject<string>) => Observable<MaggicCheck> = (bSubject:BehaviorSubject<string>) => {
    return combineLatest([bSubject, interval(deltaTimeInterval)]).pipe(
        timeInterval(),
        scan((acc, curr) => {
            const [newState, newIteration] = curr.value;
            const timestamp:number = new Date().getTime();
            const newStart:number = (acc.start === 0 && newState !== "NOT STARTED") ? timestamp : acc.start; // only once first worked
            const newEnd:number = timestamp; // update each time
            const newSleepState:'WAKE'|'SLEEP' = (Math.abs(newEnd - (acc.end + deltaTimeInterval * (newIteration - acc.clockIteration))) > minDelayThresholdSleepTime) ? 'SLEEP' : 'WAKE';
            let newWorkDuration:number = acc.workDuration;
            let newPauseDuration:number = acc.pauseDuration;
            let newSleepDuration:number = acc.sleepDuration;
            
            switch(true) {
                // IS SLEEPING
                case ((acc.sleepState === "WAKE" && newSleepState === "SLEEP") || (acc.sleepState === "SLEEP" && newSleepState === "SLEEP")):
                    // sleep interval
                    newSleepDuration += curr.interval;
                    break;

                // IS AWAKE
                case (acc.state === 'WORK'):
                    // was work until now
                    newWorkDuration += curr.interval;
                    break;

                case (acc.state === 'PAUSE'):
                    // was pause until now
                    newPauseDuration += curr.interval;
            };

            return { state: newState, sleepState: newSleepState, start: newStart, end: newEnd, clockIteration: newIteration, sleepDuration: newSleepDuration, workDuration: newWorkDuration, pauseDuration: newPauseDuration };
        }, { state: 'NOT STARTED', sleepState: 'WAKE', start:0, end:new Date().getTime(), clockIteration:0, sleepDuration: 0, workDuration: 0, pauseDuration: 0 }),
        distinctUntilKeyChanged('state', (previousVal, val) => (previousVal === 'NOT STARTED' && val === 'NOT STARTED')), // let pass everything but repeated NOT STARTED
    )
}