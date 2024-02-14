<script lang="ts">
    import type { StatTask } from "../../utils/statsObservables";

    export let label:string;
    export let weekDayTasks:StatTask[];

    function hasAtLeastOneHourActivity(task:StatTask):boolean {
        return Math.round((task.cumulatedWDuration + task.cumulatedPDuration) / (1000 * 60 * 60)) >= 1;
    }

    function hoursArrayBuilder(task:StatTask):{ color: string, hourPerc:number }[] {
        let sessionHoursCount:number = (task.cumulatedWDuration + task.cumulatedPDuration) / (1000 * 60 * 60);
        const result:{ color: string, hourPerc:number }[] = [];

        while(sessionHoursCount > 0) {
            if(sessionHoursCount >= 1) {
                // add full 1H block
                result.push({ color: "var(--primary)", hourPerc: 100 });
            } else {
                // add partial 1H block
                result.push({ color: "var(--primary)", hourPerc: 100 * sessionHoursCount });
            }

            sessionHoursCount--;
        }

        return result;
    }
</script>

<section class="DayDistributionWrapper">
    <header class="DayLabel">{ label }</header>
    <div class="TasksList">
        {#each weekDayTasks as task (task.id)}
            {#if hasAtLeastOneHourActivity(task)}
                <figure class="TaskFigure">
                    <div class="TaskHourBlocksContainer">
                        {#each hoursArrayBuilder(task) as taskHourBlock}
                        <span class="TaskHourBlock" style:--session-width={ `${taskHourBlock.hourPerc}%` } style:--session-color={ taskHourBlock.color }></span>
                        {/each}
                    </div>
                    <figcaption class="TaskFigcaption">
                        <span>{ task.label }</span>
                        {#if task.hasBeenCreatedThatDay}<span>C</span>{/if}
                        {#if task.hasFinishedThatDay}<span>A</span>{/if}
                    </figcaption>
                </figure>
            {/if}
        {/each}
    </div>
</section>

<style lang="scss">
    .DayDistributionWrapper {
        margin-block:0.25rem;
        display:flex;
        align-items: center;
        gap: var(--spacing);
    }

    .DayLabel {
        width: 4.5rem;
        text-align:right;
    }

    .TasksList {
        flex:1 1 auto;
        display:flex;
        flex-wrap:wrap;
        gap: 0.5rem;
    }

    .TaskFigure {
        text-align: center;
        margin-block-end: 0;
    }

    .TaskFigcaption {
        padding-block: 0;
    }

    .TaskHourBlocksContainer {
        display: flex;
        flex-wrap: wrap;
        padding:0 0.5rem;
        gap:0.5rem;
    }

    .TaskHourBlock {
        display:inline-block;
        width: calc(10px + 1.2vw);
        height: calc(10px + 1.2vw);
        border: 1px solid var(--muted-border-color);
        border-radius: var(--border-radius);
        background: linear-gradient(135deg, var(--session-color) 0%, var(--session-color) var(--session-width), transparent var(--session-width), transparent 100%);;
    }
</style>