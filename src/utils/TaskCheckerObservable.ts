import { BehaviorSubject, combineLatest, distinctUntilKeyChanged, interval, map, Observable, pairwise, scan, startWith, timeInterval } from "rxjs";

//const minThresholdLoggedWork:number = 1000 * 60 * 5; // 5 minutes minimum otherwise ignored
const sleepTimeDetectionFrequency:number = 1000 * 60 * 2; // 2 min (sleep duration accuracy +/- each wake sleep cycle)
const minDelayThresholdSleepTime:number = 1000; //ms
const deltaTimeInterval:number = 500; //ms

export const SystemSleepChecker:() => Observable<'SLEEP'|'WAKE'> = () => {
    return interval(sleepTimeDetectionFrequency).pipe(
        map(iterationCount => ({ iteration: iterationCount, timestamp: new Date().getTime() })),
        pairwise(),
        map(([first, second]) => {
            const iterationDiff:number = second.timestamp - (first.timestamp + sleepTimeDetectionFrequency);

            return (iterationDiff < minDelayThresholdSleepTime) ? 'WAKE' : 'SLEEP';
        }),
        startWith(('WAKE' as 'SLEEP'|'WAKE'))
    )
}

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