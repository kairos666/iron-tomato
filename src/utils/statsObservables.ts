import { combineLatest, map, Observable } from "rxjs";
import { type WorkItem, type Task } from "../stores/persistentTasks";

export type StatTask = Task & {
    hasFinishedThatDay:boolean
    hasBeenCreatedThatDay:boolean
    hasBeenActiveThatDay:boolean
    inRangeWorkItems:WorkItem[]
    cumulatedWDuration:number
    cumulatedPDuration:number
}

export type RangeSelection = {
    targetDate:Date
    targetCategories:string[]
}

export const inRangeTasksObservables = function(unFilteredTasks:Observable<Task[]>, rangeSelection:Observable<RangeSelection>):Observable<StatTask[]> {
    return combineLatest([unFilteredTasks, rangeSelection]).pipe(
        map(([allTasks, targetRange]) => allTasks.map(task => {
            // match all named categories or no category (none)
            const matchCategoryRange:boolean = (task.category !== null) 
                ? targetRange.targetCategories.includes(task.category) 
                : targetRange.targetCategories.includes('none');

            // relevant because achieved that day (even if no activity)
            const hasFinishedThatDay:boolean = (task.isDone && task.dateDone !== undefined)
                ? isSameDayMoment(task.dateDone, targetRange.targetDate)
                : false;

            // relevant because created that day (even if no activity)
            const hasBeenCreatedThatDay:boolean = isSameDayMoment(task.dateCreated, targetRange.targetDate);

            // relevant because active that day
            const inRangeWorkItems:WorkItem[] = (task.workHistory !== undefined)
                ? task.workHistory.filter(sameDayWorkItem(targetRange.targetDate))
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

// DATE utils
function isSameDayMoment(aMoment:Date|number, bMoment:Date|number):boolean {
    const aDate:Date = (typeof aMoment === 'number') ? new Date(aMoment) : aMoment;
    const bDate:Date = (typeof bMoment === 'number') ? new Date(bMoment) : bMoment;

    return (
        (aDate.getDate() === bDate.getDate()) &&
        (aDate.getMonth() === bDate.getMonth()) &&
        (aDate.getFullYear() === bDate.getFullYear())
    );
}

function sameDayWorkItem(targetDayMoment:Date, propertyCheck:'start'|'end' = 'start'):(workItem:WorkItem) => boolean {
    const startOfDayTimestamp:number = new Date(targetDayMoment.getTime()).setUTCHours(0, 0, 0, 0);
    const endOfDayTimestamp:number = new Date(targetDayMoment.getTime()).setUTCHours(23, 59, 59, 999);
    return (workItem:WorkItem) => (startOfDayTimestamp <= workItem[propertyCheck] && workItem[propertyCheck] <= endOfDayTimestamp);
}