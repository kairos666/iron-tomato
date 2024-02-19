<script lang="ts">
    import { CalendarOff } from "lucide-svelte";
    import { type Observable, type Subscription, tap, map } from "rxjs";
    import type { StatTask } from "../../utils/statsObservables";
    import { onDestroy } from "svelte";
    import _ from "lodash";
    import type { WorkItem } from "../../stores/persistentTasks";
    import WeekDayTaskDistribution from "./WeekDayTaskDistribution.svelte";
    import { isSameDay, nextFriday, nextSaturday, nextSunday, nextThursday, nextTuesday, nextWednesday } from "date-fns";

    const workWeekDays = [{ dayLabel: "Lundi", dayIndex: 1 },{ dayLabel: "Mardi", dayIndex: 2 },{ dayLabel: "Mercredi", dayIndex: 3 },{ dayLabel: "Jeudi", dayIndex: 4 },{ dayLabel: "Vendredi", dayIndex: 5 }];
    const weekendDays = [{ dayLabel: "Samedi", dayIndex: 6 },{ dayLabel: "Dimanche", dayIndex: 0 }];
    export let blockTitle:string;
    export let blockEmptyTxt:string;
    export let firstDayOfTheWeek:Date;
    export let srcObservable:Observable<StatTask[]>;
    let hasRelevantTasks:boolean = false;
    let weekTasksSubscription:Subscription|null = null;
    let tasksList:StatTask[][] = []; // 0 sunday sessions, 1 monday sessions, ...
    $: if(srcObservable) { subscribeToSrc(srcObservable) }

    function subscribeToSrc(srcObs:Observable<StatTask[]>) {
        // unsubscribe first (if necessary)
        unsubscribeFromSrc();

        // subscribe to src
        weekTasksSubscription = srcObs.pipe(
            tap(weekTasks => { hasRelevantTasks = (weekTasks.length !== 0) }), // empty if no relevant tasks for the week (side effect)
            map(allRelevantTasks => {
                return allRelevantTasks.reduce((acc, curr) => {
                    // current task split work
                    const splitWorkItems = _.groupBy(curr.inRangeWorkItems, (workItem:WorkItem) => new Date(workItem.start).getDay());

                    // distribute cloned task per day (only relevant work items for each days)
                    Object.entries(splitWorkItems).forEach(([index, dayWorkItems]) => {
                        // update partial stat task based on day of the week
                        const dayIndex:number = parseInt(index);
                        const dayOfTheWeek:Date = (dayIndex === 0)
                            ? nextSunday(firstDayOfTheWeek)
                            : (dayIndex === 2)
                            ? nextTuesday(firstDayOfTheWeek)
                            : (dayIndex === 3)
                            ? nextWednesday(firstDayOfTheWeek)
                            : (dayIndex === 4)
                            ? nextThursday(firstDayOfTheWeek)
                            : (dayIndex === 5)
                            ? nextFriday(firstDayOfTheWeek)
                            : (dayIndex === 6)
                            ? nextSaturday(firstDayOfTheWeek)
                            : firstDayOfTheWeek; // monday
                        const hasFinishedThatDay:boolean = (curr?.dateDone) ? isSameDay(curr.dateDone, dayOfTheWeek) : false;
                        const hasBeenCreatedThatDay:boolean = isSameDay(curr.dateCreated, dayOfTheWeek);
                        const hasBeenActiveThatDay:boolean = true; // would not appear that day otherwise
                        const cumulatedWDuration:number = dayWorkItems.reduce((acc, currSession) => {
                            return acc + currSession.wDuration;
                        }, 0);
                        const cumulatedPDuration:number = dayWorkItems.reduce((acc, currSession) => {
                            return acc + currSession.pDuration;
                        }, 0);
                        const clonedTaskForTheDay:StatTask = { 
                            ...curr, 
                            inRangeWorkItems: (dayWorkItems as WorkItem[]),
                            hasFinishedThatDay,
                            hasBeenCreatedThatDay,
                            hasBeenActiveThatDay,
                            cumulatedWDuration,
                            cumulatedPDuration
                        };

                        acc[dayIndex].push(clonedTaskForTheDay);
                    })

                    return acc;
                }, ([[], [], [], [], [], [], []] as StatTask[][]));
            }),
            map(weekDistribution => {
                // sort each day's tasks from most cumulated session time to least
                return weekDistribution.map(dayDistribution => {
                    return dayDistribution.sort((a, b) => {
                        const cumulatedSessionTimeA:number = a.cumulatedWDuration + a.cumulatedPDuration;
                        const cumulatedSessionTimeB:number = b.cumulatedWDuration + b.cumulatedPDuration;

                        return (cumulatedSessionTimeA < cumulatedSessionTimeB) ? 1 : (cumulatedSessionTimeA > cumulatedSessionTimeB) ? -1 : 0;
                    })
                })
            })
        ).subscribe({ next: handleData });
    }

    function handleData(srcData:StatTask[][]) {
        // tasks list
        tasksList = [...srcData];
    }

    function unsubscribeFromSrc() {
        if(!weekTasksSubscription) return;
        weekTasksSubscription.unsubscribe();
        weekTasksSubscription = null;
    }

    onDestroy(() => {
        unsubscribeFromSrc();
    });
</script>

<article class="swt-Block">
    <header>
        <h2>{ blockTitle }</h2>
    </header>
    {#if hasRelevantTasks}
        {#each workWeekDays.map(({dayLabel, dayIndex}) => ({ dayLabel, tasks: tasksList[dayIndex]})) as weekDayTasks (weekDayTasks.dayLabel)}
        <WeekDayTaskDistribution dayLabel={ weekDayTasks.dayLabel } weekDayTasks={ weekDayTasks.tasks } />
        {/each}
        <footer>
            {#each weekendDays.map(({dayLabel, dayIndex}) => ({ dayLabel, tasks: tasksList[dayIndex]})) as weekendDayTasks (weekendDayTasks.dayLabel)}
            <WeekDayTaskDistribution dayLabel={ weekendDayTasks.dayLabel } weekDayTasks={ weekendDayTasks.tasks } />
            {/each}
        </footer>
    {:else}
    <p class="swt-EmptyHistory"><CalendarOff /> <i>{ blockEmptyTxt }</i></p>
    {/if}
</article>

<style lang="scss">
    @import "../../styles/page-detail-block";

    .swt-Block {
        @include pdb_BlockStyle(h2, false);
        margin: var(--outer-small-spacing) 0 0;
        overflow: hidden;

        footer {
            margin-block-start: 1rem;
            padding-block: 1rem 2rem;
        }
    }

    .swt-EmptyHistory {
        margin-block-end: 0;
    }
</style>