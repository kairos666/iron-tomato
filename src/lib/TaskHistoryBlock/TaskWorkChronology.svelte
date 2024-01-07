<script lang="ts">
    import { type WorkItem } from "../../stores/persistentTasks";
    import { exactDurationFormater } from "../../utils/time-formater";

    type WorkItemExtended = WorkItem & {
        startPerc: number
        endPerc: number
        activeWorkPerc: number
    }

    type ChronologicHistory = {
        chronologyRangeStart: string
        chronologyRangeEnd: string
        workSessions: WorkItemExtended[]
    }

    export let taskHistory:WorkItem[];
    let chronology:ChronologicHistory|null = null;
    $: if(taskHistory === undefined || taskHistory.length === 0) {
            chronology = null;
        } else {
            // calculate chronology
            const chronologyStartAndEnd:{ start:number, end:number } = taskHistory.reduce((acc, curr) => ({ start: Math.min(acc.start, curr.start), end: Math.max(acc.end, curr.end) }), { start:Infinity, end:-1 });
            const chronologyAmplitude:number = chronologyStartAndEnd.end - chronologyStartAndEnd.start;
            const chronologyWorkSessions:WorkItemExtended[] = taskHistory
                .sort((workA, workB) => (workA.start <= workB.start) ? 1 : -1) // ensure chonological order (based on start date)
                .map(baseWorkSession => {
                    const activeWorkPerc:number = baseWorkSession.duration / (baseWorkSession.end - baseWorkSession.start);
                    // evaluate work session zones (start + duration / end can be misleading)
                    return {
                        ...baseWorkSession,
                        startPerc: (baseWorkSession.start - chronologyStartAndEnd.start) / chronologyAmplitude,
                        endPerc: (baseWorkSession.end - chronologyStartAndEnd.start) / chronologyAmplitude,
                        activeWorkPerc
                    }
                });
            chronology = {
                chronologyRangeStart: exactDurationFormater.format(chronologyStartAndEnd.start),
                chronologyRangeEnd: exactDurationFormater.format(chronologyStartAndEnd.end),
                workSessions: chronologyWorkSessions
            };
        }
</script>

{#if chronology}
    <figure class="twc-Chronology">
        <span class="twc-Chronology_Start">{ chronology.chronologyRangeStart }</span>
        <ol class="twc-Chronology_Bar">
        {#each chronology.workSessions as session, index}
            <li 
                class="twc-Chronology_Bar_WorkSession" 
                style:left={ `${ session.startPerc * 100 }%` } 
                style:right={ `${ 100 - session.endPerc * 100 }%` }
                style={ `--active-work-percentage:${ session.activeWorkPerc * 100 }%;--pause-percentage:${ (1 - session.activeWorkPerc) * 100 }%;` }
            ><span class="sr-only">Session de travail #{ index + 1 }</span></li>
        {/each}
        </ol>
        <span class="twc-Chronology_End">{ chronology.chronologyRangeEnd }</span>
    </figure>
{/if}

<style lang="scss">
    .twc-Chronology {
        margin-block-end: 0;
        display:grid;
        width: 100%;
        grid-template-columns: auto auto;
        grid-template-rows: auto auto;
        grid-template-areas: 
            "start-date end-date"
            "chronology-bar chronology-bar";
        column-gap: var(--spacing);
        row-gap: calc(var(--spacing) * 0.5);

        .twc-Chronology_Start {
            grid-area: start-date;
        }

        .twc-Chronology_End {
            grid-area: end-date;
            justify-self: end;
        }

        .twc-Chronology_Bar {
            --pause-color: var(--muted-border-color);
            --active-work-color: var(--primary);

            grid-area: chronology-bar;
            position: relative;
            width:100%;
            height: 1rem;
            border-radius: 0.5rem;
            overflow: hidden;
            border:1px solid var(--pause-color);
            background-color: var(--background-color);
            list-style:none;
            padding-inline-start: 0;
            margin-block-end: 0;

            .twc-Chronology_Bar_WorkSession {
                position:absolute;
                height: calc(1rem - 2px);
                background-color: color-mix(in srgb, var(--pause-color) var(--pause-percentage), var(--active-work-color) var(--active-work-percentage));
                margin-block-end: 0;
            }
        }
    }
</style>