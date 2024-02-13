<script lang="ts">
    import { CalendarOff } from "lucide-svelte";
    import { type Observable, type Subscription, tap, map } from "rxjs";
    import type { StatTask } from "../../utils/statsObservables";
    import { onDestroy } from "svelte";
    import _ from "lodash";
    import type { WorkItem } from "../../stores/persistentTasks";
    import WeekDayTaskDistribution from "./WeekDayTaskDistribution.svelte";

    const workWeekDays = [{ dayLabel: "Lundi", dayIndex: 1 },{ dayLabel: "Mardi", dayIndex: 2 },{ dayLabel: "Mercredi", dayIndex: 3 },{ dayLabel: "Jeudi", dayIndex: 4 },{ dayLabel: "Vendredi", dayIndex: 5 }];
    const weekendDays = [{ dayLabel: "Samedi", dayIndex: 6 },{ dayLabel: "Dimanche", dayIndex: 0 }];
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
                            const clonedTaskForTheDay:StatTask = { ...curr, inRangeWorkItems: (dayWorkItems as WorkItem[]) };

                            acc[parseInt(index)].push(clonedTaskForTheDay);
                        })

                        return acc;
                    }, ([[], [], [], [], [], [], []] as StatTask[][]));
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
        <h2>Activité de la semaine par tâche</h2>
    </header>
    {#if hasRelevantTasks}
        {#each workWeekDays.map(({dayLabel, dayIndex}) => ({ dayLabel, tasks: tasksList[dayIndex]})) as weekDayTasks (weekDayTasks.dayLabel)}
        <WeekDayTaskDistribution label={ weekDayTasks.dayLabel } weekDayTasks={ weekDayTasks.tasks } />
        {/each}
    <footer>
        {#each weekendDays.map(({dayLabel, dayIndex}) => ({ dayLabel, tasks: tasksList[dayIndex]})) as weekendDayTasks (weekendDayTasks.dayLabel)}
        <WeekDayTaskDistribution label={ weekendDayTasks.dayLabel } weekDayTasks={ weekendDayTasks.tasks } />
        {/each}
    </footer>
    {:else}
    <p class="swt-EmptyHistory"><CalendarOff /> <i>Pas d'activité cette semaine là.</i></p>
    {/if}
</article>

<style lang="scss">
    @import "../../styles/page-detail-block";

    .swt-Block {
        @include pdb_BlockStyle(h2, false);
        margin: var(--outer-large-spacing) 0;
        overflow: hidden;
    }

    .swt-EmptyHistory {
        margin-block-end: 0;
    }
</style>