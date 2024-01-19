import { interval, map, Observable, pairwise, startWith } from "rxjs";

export const SystemSleepChecker:(sleepTimeDetectionFrequency:number, minDelayThresholdSleepTime:number) => Observable<'SLEEP'|'WAKE'> = (sleepTimeDetectionFrequency:number, minDelayThresholdSleepTime:number) => {
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