<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { allTasksList, type Task } from "../../stores/persistentTasks";
    import StatsDayTasksBlock from "./StatsDayTasksBlock.svelte";
    import StatsOverallDayBlock from "./StatsOverallDayBlock.svelte";
    import StatsRangeSelectorBlock from "./StatsRangeSelectorBlock.svelte";
    import { Observable, Subject, Subscription, combineLatest, from, map } from "rxjs";

    type StatTask = Task & {
        hasFinishedThatDay:boolean
        hasBeenCreatedThatDay:boolean
        hasBeenActiveThatDay:boolean
    }
    
    let statsTargetDate:Date;
    let statsTargetCategories:string[];
    let rangeSelector:Subject<{ targetDate:Date, targetCategories:string[] }> = new Subject();
    let inRangeTasksObservable:Observable<StatTask[]>;
    let statsSubscription:Subscription;

    // reactively update RANGE
    $: if(statsTargetDate || statsTargetCategories) rangeSelector.next({ targetDate: statsTargetDate, targetCategories: statsTargetCategories });

    onMount(() => {
        inRangeTasksObservable = combineLatest([from(allTasksList), rangeSelector]).pipe(
            map(([allTasks, targetRange]) => allTasks.map(task => {
                // match all named categories or no category (none)
                const matchCategoryRange:boolean = (task.category !== null) 
                    ? targetRange.targetCategories.includes(task.category) 
                    : targetRange.targetCategories.includes('none');
                // relevant because achieved that day (even if no activity)
                const hasFinishedThatDay:boolean = false; // TODO
                // relevant because created that day (even if no activity)
                const hasBeenCreatedThatDay:boolean = false; // TODO
                // relevant because active that day
                const hasBeenActiveThatDay:boolean = true; // TODO
                const matchDateRange:boolean = (hasFinishedThatDay || hasBeenCreatedThatDay || hasBeenActiveThatDay);

                return (matchCategoryRange && matchDateRange)
                    ? {...task, hasFinishedThatDay, hasBeenCreatedThatDay, hasBeenActiveThatDay }
                    : (null as unknown as StatTask);
            }).filter(relevantTask => (relevantTask !== null)))
        );
        statsSubscription = inRangeTasksObservable.subscribe({ next: val => console.log('val update', val) });
    })

    onDestroy(() => { if(statsSubscription) statsSubscription.unsubscribe() });
</script>

<div class="sdm-Block">
    <StatsRangeSelectorBlock bind:targetDate={ statsTargetDate } bind:targetCategories={ statsTargetCategories }/>
    <StatsOverallDayBlock />
    <StatsDayTasksBlock />
</div>

<style lang="scss">
    .sdm-Block {
        @media (max-width:575px) {
            --outer-small-spacing: calc(var(--spacing) * .85);
            --outer-large-spacing: calc(var(--spacing) * 1.25);
            --inner-small-spacing: calc(var(--spacing) * .5);
            --inner-large-spacing: calc(var(--spacing) * 0.65);
        }
        @media (min-width:576px) {
            --outer-small-spacing: var(--spacing);
            --outer-large-spacing: calc(var(--spacing) * 2);
            --inner-small-spacing: calc(var(--spacing) * .85);
            --inner-large-spacing: var(--spacing);
        }
    }
</style>