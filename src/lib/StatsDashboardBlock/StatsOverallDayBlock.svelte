<script lang="ts">
    import { CalendarClock, CheckCircle, Coffee, ListTodo, Star } from "lucide-svelte";
    import { appUIState } from "../../stores/appUIState";
    import PieChart from "../PieChart.svelte";

    const dayStats = [
        { label: `Travail`, percent: 63, color: "var(--work-color)" },
        { label: `Pause`, percent: 37, color: "var(--pause-color)" }
    ];
</script>

<section class="sod-Block">
    {#if $appUIState.isMobileViewport}
        <span class="sod-Badge sod-Badge-data sod-Badge-mobile">4 <ListTodo size="20" color="var(--badge-color)" /></span>
        <span class="sod-Badge sod-Badge-data sod-Badge-mobile">3 <Star size="20" color="var(--badge-color)" /></span>
        <span class="sod-Badge sod-Badge-data sod-Badge-mobile">1 <CheckCircle size="20" color="var(--badge-color)" /></span>
        <span class="sod-Badge sod-Badge-work sod-Badge-mobile">02h23 <CalendarClock size="20" color="var(--badge-color)" /></span>
        <span class="sod-Badge sod-Badge-pause sod-Badge-mobile">00h43 <Coffee size="20" color="var(--badge-color)" /></span>
    {:else}
    <ul class="sod-Data">
        <li><span class="sod-Badge sod-Badge-data sod-Badge-desktop">4 <ListTodo size="20" color="var(--badge-color)" /></span> tâches ont avancées</li>
        <li><span class="sod-Badge sod-Badge-data sod-Badge-desktop">3 <Star size="20" color="var(--badge-color)" /></span> créations de tâches</li>
        <li><span class="sod-Badge sod-Badge-data sod-Badge-desktop">1 <CheckCircle size="20" color="var(--badge-color)" /></span> tâches terminées</li>
    </ul>
    <ul class="sod-StatsLegend">
        <li><span class="sod-Badge sod-Badge-work sod-Badge-desktop">02h23 <CalendarClock color="var(--badge-color)" /></span></li>
        <li><span class="sod-Badge sod-Badge-pause sod-Badge-desktop">00h43 <Coffee color="var(--badge-color)" /></span></li>
    </ul>
    <PieChart statistics={ dayStats } baseSize={ 200 } holeSize={ 75 } />
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