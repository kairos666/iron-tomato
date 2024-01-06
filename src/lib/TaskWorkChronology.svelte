<script lang="ts">
    import { getLiveQueryForTaskId, type WorkItem } from "../stores/persistentTasks";
    import { exactDurationFormater } from "../utils/time-formater";

    type WorkItemExtended = WorkItem & {
        startPerc: number
        endPerc: number
    }

    type ChronologicHistory = {
        chronologyRangeStart: string
        chronologyRangeEnd: string
        workSessions: WorkItemExtended[]
    }

    export let taskID:string;
    let chronology:ChronologicHistory|null = null;
    $: taskQuery = getLiveQueryForTaskId(taskID);
    $: if($taskQuery) {
        if($taskQuery?.workHistory === undefined || $taskQuery?.workHistory.length === 0) {
            chronology = null;
        } else {
            // calculate chronology
            const chronologyStartAndEnd:{ start:number, end:number } = $taskQuery.workHistory.reduce((acc, curr) => ({ start: Math.min(acc.start, curr.start), end: Math.max(acc.end, (curr.start + curr.duration)) }), { start:Infinity, end:-1 });
            const chronologyAmplitude:number = chronologyStartAndEnd.end - chronologyStartAndEnd.start;
            const chronologyWorkSessions:WorkItemExtended[] = $taskQuery.workHistory
                .sort((workA, workB) => (workA.start <= workB.start) ? 1 : -1) // ensure chonological order (based on start date)
                .map(baseWorkSession => {
                    // evaluate work session zones (start + duration / end can be misleading)
                    return {
                        ...baseWorkSession,
                        startPerc: (baseWorkSession.start - chronologyStartAndEnd.start) / chronologyAmplitude,
                        endPerc: (baseWorkSession.start + baseWorkSession.duration - chronologyStartAndEnd.start) / chronologyAmplitude
                    }
                });
            chronology = {
                chronologyRangeStart: exactDurationFormater.format(chronologyStartAndEnd.start),
                chronologyRangeEnd: exactDurationFormater.format(chronologyStartAndEnd.end),
                workSessions: chronologyWorkSessions
            };
        }

        console.log(chronology);
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
            ><span class="sr-only">Session de travail #{ index + 1 }</span></li>
        {/each}
        </ol>
        <span class="twc-Chronology_End">{ chronology.chronologyRangeEnd }</span>
    </figure>
{/if}

<style lang="scss">
    .twc-Chronology {
        margin-block: var(--spacing) 0;
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
            grid-area: chronology-bar;
            position: relative;
            width:100%;
            height: 1rem;
            border-radius: 0.5rem;
            overflow: hidden;
            border:1px solid var(--muted-border-color);
            background-color: var(--background-color);
            list-style:none;
            padding-inline-start: 0;
            margin-block-end: 0;

            .twc-Chronology_Bar_WorkSession {
                position:absolute;
                height: calc(1rem - 2px);
                background-color: var(--primary);
                margin-block-end: 0;
            }
        }
    }
</style>