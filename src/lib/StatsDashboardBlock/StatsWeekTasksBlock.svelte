<script lang="ts">
    import { CalendarOff, CheckCircle, Star } from "lucide-svelte";
    import { type Observable, type Subscription, tap, map } from "rxjs";
    import type { StatTask } from "../../utils/statsObservables";
    import { onDestroy } from "svelte";
    import _ from "lodash";
    import type { WorkItem } from "../../stores/persistentTasks";
    import WeekDayTaskDistribution from "./WeekDayTaskDistribution.svelte";
    import { isSameDay, nextFriday, nextSaturday, nextSunday, nextThursday, nextTuesday, nextWednesday } from "date-fns";
    import { appUIState } from "../../stores/appUIState";
    import { taskCategories } from "../../constants/task-categories";
    import TaskCategoryIcon from "../TaskCategoryIcon.svelte";

    type StatTaskExtended = StatTask & { icon?:string }

    const { changeMainView } = appUIState;
    const workWeekDays = [{ dayLabel: "Lundi", dayIndex: 1 },{ dayLabel: "Mardi", dayIndex: 2 },{ dayLabel: "Mercredi", dayIndex: 3 },{ dayLabel: "Jeudi", dayIndex: 4 },{ dayLabel: "Vendredi", dayIndex: 5 }, { dayLabel: "Samedi", dayIndex: 6 },{ dayLabel: "Dimanche", dayIndex: 0 }];
    export let blockTitle:string;
    export let blockEmptyTxt:string;
    export let firstDayOfTheWeek:Date;
    export let srcObservable:Observable<StatTask[]>;
    let hoveredTaskID:string|null = null;
    let hasRelevantTasks:boolean = false;
    let weekTasksSubscription:Subscription|null = null;
    let tasksList:StatTaskExtended[] = [];
    let distributedTasksList:StatTask[][] = []; // 0 sunday sessions, 1 monday sessions, ...
    $: if(srcObservable) { subscribeToSrc(srcObservable) }

    function sortTasks(a:StatTask, b:StatTask) {
        const cumulatedSessionTimeA:number = a.cumulatedWDuration + a.cumulatedPDuration;
        const cumulatedSessionTimeB:number = b.cumulatedWDuration + b.cumulatedPDuration;

        return (cumulatedSessionTimeA < cumulatedSessionTimeB) ? 1 : (cumulatedSessionTimeA > cumulatedSessionTimeB) ? -1 : 0;
    }

    function onTaskHover(taskID:string, isHover:boolean) {
        hoveredTaskID = (isHover) ? taskID : null;
    }

    function subscribeToSrc(srcObs:Observable<StatTask[]>) {
        // unsubscribe first (if necessary)
        unsubscribeFromSrc();

        // subscribe to src
        weekTasksSubscription = srcObs.pipe(
            tap(weekTasks => { hasRelevantTasks = (weekTasks.length !== 0) }), // empty if no relevant tasks for the week (side effect)
            tap(weekTasks => { 
                // just register tasks sorted by most cumulated session time to least (no distribution yet)
                tasksList = weekTasks.map(task => {
                    const icon:string|null = taskCategories.find(item => (item.id === task.category))?.icon ?? null;
                    return (icon === null) ? task :  { ...task, icon };
                }).sort(sortTasks);
            }),
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
                    return dayDistribution.sort(sortTasks);
                })
            })
        ).subscribe({ next: handleData });
    }

    function handleData(srcData:StatTask[][]) {
        // tasks list
        distributedTasksList = [...srcData];
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
        <menu class="swt-WeekDistribLayout">
            <div class="swt-WeekDaysDistrib">
                {#each workWeekDays.map(({dayLabel, dayIndex}) => ({ dayLabel, tasks: distributedTasksList[dayIndex]})) as weekDayTasks (weekDayTasks.dayLabel)}
                <WeekDayTaskDistribution dayLabel={ weekDayTasks.dayLabel } weekDayTasks={ weekDayTasks.tasks } highligtedTaskID={ hoveredTaskID } />
                {/each}
            </div>
            <div class="swt-TasksLinkList">
                {#each tasksList as task (task.id)}
                    <button 
                        class="swt-TaskLink" 
                        on:mouseover={ () => onTaskHover(task.id, true) } 
                        on:focus={ () => onTaskHover(task.id, true) } 
                        on:mouseout={ () => onTaskHover(task.id, false) } 
                        on:blur={ () => onTaskHover(task.id, false) }
                        on:click={ () => changeMainView('task-detail', parseInt(task.id)) }
                    >
                        <h3 class="swt-TaskLink_Title">{ task.label }</h3>
                        {#if task.icon}<span class="swt-TaskLink_Cat"><TaskCategoryIcon name={ task.icon } stroke-width="1" size="20" color="var(--h6-color)" /></span>{/if}
                        {#if task.hasFinishedThatDay}<span class="swt-TaskLink_Done"><CheckCircle size="20" color="var(--h6-color)" /></span>{/if}
                        {#if task.hasBeenCreatedThatDay}<span class="swt-TaskLink_New"><Star size="20" color="var(--h6-color)" /></span>{/if}
                    </button>
                {/each}
            </div>
        </menu>
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
    }

    .swt-WeekDistribLayout {
        padding-inline-start: 0;
        margin:calc(var(--spacing) * -1);
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-auto-rows: auto;
        justify-items:stretch;
    }

    .swt-WeekDaysDistrib {
        grid-column: 1 / 2;
        padding: var(--spacing);
        justify-self: stretch;
        align-self: center;
    }

    .swt-TasksLinkList {
        grid-column: 2 / 3;
        border-left:1px solid var(--card-border-color);
    }

    .swt-TaskLink {
        margin-block-end: 0;
        padding: calc(var(--spacing) * 0.5);
        border-radius: 0;
        background-color: transparent;
        border: none;
        display: grid;
        gap: calc(var(--spacing) * 0.5);
        grid-template-columns: 20px 1fr 20px 20px;
        grid-template-rows: auto;
        grid-template-areas: 
            "cat title done created";

        .swt-TaskLink_Title { 
            grid-area: title;
            font-size: 0.85em;
            color: var(--h1-color);
            text-align: left;
            align-self: center;
            margin-block-end: 0;
        }

        .swt-TaskLink_Cat {
            grid-area: cat;
            align-self: center;
        }
        .swt-TaskLink_Done {
            grid-area: done;
        }
        .swt-TaskLink_New {
            grid-area: created;
        }

        &:hover, &:focus, &:active {
            background-color: var(--primary-focus);
        }

        & + .swt-TaskLink {
            border-top:1px solid var(--card-border-color);
        }
    }

    .swt-EmptyHistory {
        margin-block-end: 0;
    }
</style>