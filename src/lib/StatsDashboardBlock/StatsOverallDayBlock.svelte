<script lang="ts">
    import { onDestroy } from "svelte";
    import { CalendarClock, CheckCircle, Coffee, ListTodo, Star } from "lucide-svelte";
    import { appUIState } from "../../stores/appUIState";
    import PieChart from "../PieChart.svelte";
    import { Subscription, Observable } from "rxjs";
    import { type StatTask } from "../../utils/statsObservables";
    import { durationFormaterToString, formatMsDuration } from "../../utils/time-formater";

    type OverallDayData = {
        activeTasks:number
        createdTasks:number
        achievedTasks:number
        cumulatedWDuration:number
        cumulatedPDuration:number
        dayStats: { label:string, percent:number, color:string }[]
    }

    export let srcObservable:Observable<StatTask[]>;
    let overallDaySubscription:Subscription|null = null;
    let overallDayData:OverallDayData = { activeTasks: 0, createdTasks: 0, achievedTasks: 0, cumulatedWDuration:0, cumulatedPDuration: 0, dayStats: buildDayStats(0, 0) };
    $: if(srcObservable) { subscribeToSrc(srcObservable) }

    function subscribeToSrc(srcObs:Observable<StatTask[]>) {
        // unsubscribe first (if necessary)
        unsubscribeFromSrc();

        // subscribe to src
        overallDaySubscription = srcObs.subscribe({ next: handleData });
    }

    function handleData(srcData:StatTask[]) {
        const activeTasks:number = srcData.filter(statTask => (statTask.hasBeenActiveThatDay)).length;
        const createdTasks:number = srcData.filter(statTask => (statTask.hasBeenCreatedThatDay)).length;
        const achievedTasks:number = srcData.filter(statTask => (statTask.hasFinishedThatDay)).length;
        const cumulatedWDuration:number = srcData.reduce((acc, currTask) => acc + currTask.cumulatedWDuration, 0);
        const cumulatedPDuration:number = srcData.reduce((acc, currTask) => acc + currTask.cumulatedPDuration, 0);

        overallDayData = { activeTasks, createdTasks, achievedTasks, cumulatedWDuration, cumulatedPDuration, dayStats: buildDayStats(cumulatedWDuration, cumulatedPDuration) };
    }

    function buildDayStats(wMsDuration:number, pMsDuration:number) {
        switch(true) {
            case (wMsDuration > 0 && pMsDuration > 0):
                return [
                    { label: `Travail`, percent: 100 * (wMsDuration / (wMsDuration + pMsDuration)), color: "var(--work-color)" },
                    { label: `Pause`, percent: 100 * (pMsDuration / (wMsDuration + pMsDuration)), color: "var(--pause-color)" }
                ];
            case (wMsDuration > 0 && pMsDuration === 0):
                return [{ label: `Travail`, percent: 100, color: "var(--work-color)" }];
            case (wMsDuration === 0 && pMsDuration > 0):
                return [{ label: `Pause`, percent: 100, color: "var(--pause-color)" }];
            default:
                return []
        }
    }

    function unsubscribeFromSrc() {
        if(!overallDaySubscription) return;
        overallDaySubscription.unsubscribe();
        overallDaySubscription = null;
    }

    onDestroy(() => {
        unsubscribeFromSrc();
    });
</script>

<section class="sod-Block">
    {#if $appUIState.isMobileViewport}
        <span class="sod-Badge sod-Badge-data sod-Badge-mobile">{ overallDayData.activeTasks } <ListTodo size="20" color="var(--badge-color)" /></span>
        <span class="sod-Badge sod-Badge-data sod-Badge-mobile">{ overallDayData.createdTasks } <Star size="20" color="var(--badge-color)" /></span>
        <span class="sod-Badge sod-Badge-data sod-Badge-mobile">{ overallDayData.achievedTasks } <CheckCircle size="20" color="var(--badge-color)" /></span>
        <span class="sod-Badge sod-Badge-work sod-Badge-mobile"><time class="sod-TotalWorkDuration" datetime={ durationFormaterToString(overallDayData.cumulatedWDuration, 'TECH') }>{ formatMsDuration(overallDayData.cumulatedWDuration, 'hour') }</time> <CalendarClock size="20" color="var(--badge-color)" /></span>
        <span class="sod-Badge sod-Badge-pause sod-Badge-mobile"><time class="sod-TotalPauseDuration" datetime={ durationFormaterToString(overallDayData.cumulatedPDuration, 'TECH') }>{ formatMsDuration(overallDayData.cumulatedPDuration, 'hour') }</time> <Coffee size="20" color="var(--badge-color)" /></span>
    {:else}
    <ul class="sod-Data">
        <li><span class="sod-Badge sod-Badge-data sod-Badge-desktop">{ overallDayData.activeTasks } <ListTodo size="20" color="var(--badge-color)" /></span> tâches ont avancées</li>
        <li><span class="sod-Badge sod-Badge-data sod-Badge-desktop">{ overallDayData.createdTasks } <Star size="20" color="var(--badge-color)" /></span> créations de tâches</li>
        <li><span class="sod-Badge sod-Badge-data sod-Badge-desktop">{ overallDayData.achievedTasks } <CheckCircle size="20" color="var(--badge-color)" /></span> tâches terminées</li>
    </ul>
    <ul class="sod-StatsLegend">
        <li><span class="sod-Badge sod-Badge-work sod-Badge-desktop"><time class="sod-TotalWorkDuration" datetime={ durationFormaterToString(overallDayData.cumulatedWDuration, 'TECH') }>{ formatMsDuration(overallDayData.cumulatedWDuration, 'hour') }</time> <CalendarClock color="var(--badge-color)" /></span></li>
        <li><span class="sod-Badge sod-Badge-pause sod-Badge-desktop"><time class="sod-TotalPauseDuration" datetime={ durationFormaterToString(overallDayData.cumulatedPDuration, 'TECH') }>{ formatMsDuration(overallDayData.cumulatedPDuration, 'hour') }</time> <Coffee color="var(--badge-color)" /></span></li>
    </ul>
    <PieChart statistics={ overallDayData.dayStats } baseSize={ 200 } holeSize={ 75 } />
    {/if}
</section>

<style lang="scss">
    @import "../../styles/page-detail-badges";
    .sod-Block {
        padding: var(--outer-small-spacing);
        margin-block: var(--outer-large-spacing);
        display: flex;

        @media (max-width:575px) {
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: var(--inner-small-spacing);
        }
        @media (min-width:576px) {
            justify-content: stretch;
            align-items: center;
            gap: var(--outer-large-spacing);
            > * { flex: 1 1 0; }
        }
    }

    .sod-Data {
        --badge-color: white;
        --badge-bg-color: goldenrod;
        padding-inline-start: 0;
        margin-block-end: 0;
        li { list-style: none; }
    }
    .sod-StatsLegend {
        padding-inline-start: 0;
        margin-block-end: 0;
        li { list-style: none; }

        @media (min-width:576px) {
            text-align: right;
        }
    }

    .sod-Badge {
        @include pdb_BadgeStyle(var(--badge-color), var(--badge-bg-color));
        
        &.sod-Badge-data { --badge-color: white; --badge-bg-color: goldenrod; }
        &.sod-Badge-work { --badge-color: white; --badge-bg-color: var(--work-color); }
        &.sod-Badge-pause { --badge-color: white; --badge-bg-color: var(--pause-color); }
        &.sod-Badge-mobile { padding: 0.25rem 0.75rem; }
        &.sod-Badge-desktop { padding:5px; }
    }
</style>