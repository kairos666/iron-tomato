<script lang="ts">
    import StatsDayTasksBlock from "./StatsDayTasksBlock.svelte";
    import StatsOverallDayBlock from "./StatsOverallDayBlock.svelte";
    import StatsRangeSelectorBlock from "./StatsRangeSelectorBlock.svelte";

    let statsTargetDate:Date;
    $: if(statsTargetDate) {
        console.log('new target date: ', statsTargetDate);
    }
</script>

<div class="sdm-Block">
    <StatsRangeSelectorBlock bind:targetDate={ statsTargetDate } />
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