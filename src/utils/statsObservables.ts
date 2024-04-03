import { add, areIntervalsOverlapping, isSameDay, isSameISOWeek } from "date-fns";
import { combineLatest, map, Observable } from "rxjs";
import { type WorkItem, type Task } from "../stores/persistentTasks";

export type StatTask = Task & {
    hasFinishedThatDay:boolean // or same week if weekRange
    hasBeenCreatedThatDay:boolean // or same week if weekRange
    hasBeenActiveThatDay:boolean // or same week if weekRange
    inRangeWorkItems:WorkItem[]
    cumulatedWDuration:number
    cumulatedPDuration:number
}

export type RangeSelection = {
    targetDate:Date
    targetCategories:string[]
    isWeekRange:boolean
}

export const inRangeTasksObservables = function(unFilteredTasks:Observable<Task[]>, rangeSelection:Observable<RangeSelection>):Observable<StatTask[]> {
    return combineLatest([unFilteredTasks, rangeSelection]).pipe(
        map(([allTasks, targetRange]) => allTasks.map(task => {
            // match all named categories or no category (none)
            const matchCategoryRange:boolean = (task.category !== null) 
                ? targetRange.targetCategories.includes(task.category) 
                : targetRange.targetCategories.includes('none');

            // relevant because achieved that day (even if no activity)
            const hasFinishedThatDay:boolean = (task.isDone && task.dateDone !== undefined && targetRange.isWeekRange)
                ? isSameISOWeek(task.dateDone, targetRange.targetDate)
                : (task.isDone && task.dateDone !== undefined && !targetRange.isWeekRange)
                ? isSameDay(task.dateDone, targetRange.targetDate)
                : false;

            // relevant because created that day (even if no activity)
            const hasBeenCreatedThatDay:boolean = (targetRange.isWeekRange)
                ? isSameISOWeek(task.dateCreated, targetRange.targetDate)
                : isSameDay(task.dateCreated, targetRange.targetDate);

            // relevant because active that day
            const inRangeWorkItems:WorkItem[] = (task.workHistory !== undefined && targetRange.isWeekRange)
                ? task.workHistory.filter(entry => areIntervalsOverlapping({ start: entry.start, end: entry.end }, { start: targetRange.targetDate, end: add(targetRange.targetDate, { days: 7, seconds: -1 }) }))
                : (task.workHistory !== undefined && !targetRange.isWeekRange)
                ? task.workHistory.filter(entry => areIntervalsOverlapping({ start: entry.start, end: entry.end }, { start: targetRange.targetDate, end: add(targetRange.targetDate, { days: 1, seconds: -1 }) }))
                : [];
            const hasBeenActiveThatDay:boolean = (inRangeWorkItems.length > 0);
            const matchDateRange:boolean = (hasFinishedThatDay || hasBeenCreatedThatDay || hasBeenActiveThatDay);

            // cumulated work & pause that day
            const cumulatedWDuration:number = inRangeWorkItems.reduce((acc, currSession) => {
                return acc + currSession.wDuration;
            }, 0);
            const cumulatedPDuration:number = inRangeWorkItems.reduce((acc, currSession) => {
                return acc + currSession.pDuration;
            }, 0);

            return (matchCategoryRange && matchDateRange)
                ? {...task, hasFinishedThatDay, hasBeenCreatedThatDay, hasBeenActiveThatDay, inRangeWorkItems, cumulatedWDuration, cumulatedPDuration }
                : (null as unknown as StatTask);
        }).filter(relevantTask => (relevantTask !== null)))
    );
}
