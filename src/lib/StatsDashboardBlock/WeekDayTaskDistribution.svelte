<script lang="ts">
    import { appUIState } from "../../stores/appUIState";
    import type { StatTask } from "../../utils/statsObservables";

    const { changeMainView } = appUIState;
    export let dayLabel:string;
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
    <header class="DayLabel">{ dayLabel }</header>
    {#if weekDayTasks.some(hasAtLeastOneHourActivity)}
        <div class="TasksList">
            {#each weekDayTasks as task (task.id)}
                {#each hoursArrayBuilder(task) as taskHourBlock}
                    <span class="TaskHourBlock" style:--session-width={ `${taskHourBlock.hourPerc}%` } style:--session-color={ taskHourBlock.color }></span>
                {/each}
            {/each}
        </div>
    {:else}
    <p class="NoSignificantTaskSession">Pas, ou peu, d'activité ce jour là.</p>
    {/if}
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
        gap: 0.1rem;
    }

    .TaskHourBlock {
        display:inline-block;
        width: calc((100% - 23 * 0.5rem)/24);
        min-width: 1.2rem;
        aspect-ratio: 1;
        border: 1px solid var(--muted-border-color);
        border-radius: var(--border-radius);
        background: linear-gradient(135deg, var(--session-color) 0%, var(--session-color) var(--session-width), transparent var(--session-width), transparent 100%);;
    }

    .NoSignificantTaskSession {
        margin-block-end: 0;
        font-size: 0.75em;
        font-style: italic;
        color: var(--muted-color);
        align-self: flex-end;
    }
</style>