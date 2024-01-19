import { BehaviorSubject, combineLatest, distinctUntilKeyChanged, interval, Observable, scan, timeInterval } from "rxjs";

const minDelayThresholdSleepTime:number = 1000; //ms
const deltaTimeInterval:number = 500; //ms

type TimeCheck = {
    state:string // NOT STARTED|WORK|PAUSE
    sleepState:string // WAKE|SLEEP
    start: number
    end: number
    clockIteration: number
    totalDuration: number
    sleepDuration: number
}

export const TaskCheckerObservable:(bSubject:BehaviorSubject<string>) => Observable<TimeCheck> = (bSubject:BehaviorSubject<string>) => {
    return combineLatest([bSubject, interval(deltaTimeInterval)]).pipe(
        timeInterval(),
        scan((acc, curr) => {
            const [newState, newIteration] = curr.value;
            const timestamp:number = new Date().getTime();
            const newStart:number = (acc.start === 0 && newState !== "NOT STARTED") ? timestamp : acc.start; // only once first worked
            const newEnd:number = timestamp; // update each time
            const newSleepState:'WAKE'|'SLEEP' = (Math.abs(newEnd - (acc.end + deltaTimeInterval * (newIteration - acc.clockIteration))) > minDelayThresholdSleepTime) ? 'SLEEP' : 'WAKE';
            const newTotalDuration:number = (acc.state === "WORK") ? acc.totalDuration + curr.interval : acc.totalDuration; // only accumulate if previous state was work
            const newSleepDuration:number = ((acc.sleepState === "WAKE" && newSleepState === "SLEEP") || (acc.sleepState === "SLEEP" && newSleepState === "SLEEP"))
                ? acc.sleepDuration + curr.interval
                : acc.sleepDuration;

            return { state: newState, sleepState: newSleepState, start: newStart, end: newEnd, clockIteration: newIteration, totalDuration: newTotalDuration, sleepDuration: newSleepDuration };
        }, { state: 'NOT STARTED', sleepState: 'WAKE', start:0, end:new Date().getTime(), clockIteration:0, totalDuration: 0, sleepDuration: 0}),
        distinctUntilKeyChanged('state', (previousVal, val) => (val === previousVal && !(previousVal === val && val === "WORK"))), // each state change once unless WORK
    )
}