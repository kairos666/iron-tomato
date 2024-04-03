<script lang="ts">
    import { onMount } from "svelte";
    import { allTasksList } from "../../stores/persistentTasks";
    import StatsDayTasksBlock from "./StatsDayTasksBlock.svelte";
    import StatsOverallDayBlock from "./StatsOverallDayBlock.svelte";
    import StatsRangeSelectorBlock from "./StatsRangeSelectorBlock.svelte";
    import { BehaviorSubject, Observable, from } from "rxjs";
    import { inRangeTasksObservables, type RangeSelection, type StatTask } from "../../utils/statsObservables";
    import StatsWeekTasksBlock from "./StatsWeekTasksBlock.svelte";
    import { appUIState } from "../../stores/appUIState";
    
    let isWeekStats:boolean;
    let statsTargetDate:Date;
    let statsTargetCategories:string[];
    let rangeSelector:BehaviorSubject<RangeSelection> = new BehaviorSubject(({ targetDate: new Date(), targetCategories: [], isWeekRange: false } as RangeSelection));
    let inRangeTasksObservable:Observable<StatTask[]>;

    // reactively update RANGE
    $: if(statsTargetDate || statsTargetCategories || isWeekStats) {
        rangeSelector.next({ targetDate: statsTargetDate, targetCategories: statsTargetCategories, isWeekRange: isWeekStats });
    }

    onMount(() => {
        inRangeTasksObservable = inRangeTasksObservables(from(allTasksList), rangeSelector);
    })
</script>

<div class="sdm-Block">
    <StatsRangeSelectorBlock bind:isWeekRange={ isWeekStats } bind:targetDate={ statsTargetDate } bind:targetCategories={ statsTargetCategories }/>
    <StatsOverallDayBlock srcObservable={ inRangeTasksObservable } />
    {#if isWeekStats && !$appUIState.isMobileViewport}
        <StatsWeekTasksBlock blockTitle="Activité de la semaine par tâche" blockEmptyTxt="Pas d'activité cette semaine là." srcObservable={ inRangeTasksObservable } firstDayOfTheWeek={ statsTargetDate } />
    {:else if isWeekStats && $appUIState.isMobileViewport}
        <StatsDayTasksBlock blockTitle="Activité de la semaine par tâche" blockEmptyTxt="Pas d'activité cette semaine là." srcObservable={ inRangeTasksObservable } />
    {:else}
        <StatsDayTasksBlock blockTitle="Activité du jour par tâche" blockEmptyTxt="Pas d'activité ce jour là." srcObservable={ inRangeTasksObservable } />
    {/if}
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