<script lang="ts">
    import { CalendarClock, Coffee } from "lucide-svelte";
import { appUIState } from "../../stores/appUIState";
    import { type WorkItem } from "../../stores/persistentTasks";
    import { durationFormaterToString, exactDurationFormater } from "../../utils/time-formater";

    type WorkItemExtended = WorkItem & {
        sessionHumanDuration: string
        workPercent:number
        workHumanDuration: string
        pausePercent:number
        pauseHumanDuration: string
    }

    export let taskHistory:WorkItem[];
    let taskHistoryExtended:WorkItemExtended[] = [];
    $: taskHistoryExtended = taskHistory.map(taskHistoryItem => {
        return {
            ...taskHistoryItem,
            sessionHumanDuration: durationFormaterToString((taskHistoryItem.end - taskHistoryItem.start), 'HUMAN', { style: 'narrow', numeric: 'always' }),
            workPercent:100 * (taskHistoryItem.wDuration / (taskHistoryItem.end - taskHistoryItem.start)),
            workHumanDuration: durationFormaterToString(taskHistoryItem.wDuration, 'HUMAN', { style: 'narrow', numeric: 'always' }),
            pausePercent:100 * (taskHistoryItem.pDuration / (taskHistoryItem.end - taskHistoryItem.start)),
            pauseHumanDuration: durationFormaterToString(taskHistoryItem.pDuration, 'HUMAN', { style: 'narrow', numeric: 'always' })
        }
    });
</script>

{#if $appUIState.isMobileViewport}
    <ol class="twh-HistoryItem twh-HistoryItem-mobile">
        {#each taskHistoryExtended as historyItem, index }
        <li>
            <h5>#{ taskHistoryExtended.length - index } { exactDurationFormater.format(historyItem.start) }</h5>
            <ol class="twh-SessionRatio">
                <li class="twh-SessionRatio_Work" style:width={ `${ historyItem.workPercent }%` }><span class="sr-only">Travail effectif ({ historyItem.workPercent }%)</span></li>
                <li class="twh-SessionRatio_Pause" style:width={ `${ historyItem.pausePercent }%` }><span class="sr-only">Pauses ({ historyItem.pausePercent }%)</span></li>
            </ol>
            <p>Durée de la session { historyItem.sessionHumanDuration } <small>( Travail{ historyItem.workHumanDuration } , Pause{ historyItem.pauseHumanDuration } )</small></p>
        </li>
        {/each}
    </ol>
{:else}
    <table role="grid">
        <thead>
            <th scope="col">#</th>
            <th scope="col">Date</th>
            <th scope="col">Session de travail ( <CalendarClock color="var(--work-color)" /> Travail effectif | <Coffee  color="var(--pause-color)" /> Pause )</th>
        </thead>
        <tbody>
            {#each taskHistoryExtended as historyItem, index }
            <tr>
                <th scope="row">{ taskHistoryExtended.length - index }</th>
                <td class="twh-TDDate">{ exactDurationFormater.format(historyItem.start) }</td>
                <td>
                    <ol class="twh-SessionRatio">
                        <li class="twh-SessionRatio_Work" style:width={ `${ historyItem.workPercent }%` }><span class="sr-only">Travail effectif ({ historyItem.workPercent }%)</span></li>
                        <li class="twh-SessionRatio_Pause" style:width={ `${ historyItem.pausePercent }%` }><span class="sr-only">Pauses ({ historyItem.pausePercent }%)</span></li>
                    </ol>
                    <p>Durée de la session { historyItem.sessionHumanDuration } <small>( Travail{ historyItem.workHumanDuration } , Pause{ historyItem.pauseHumanDuration } )</small></p>
                </td>
              </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style lang="scss">
    table { margin-block-end: 0; }
    th, td { padding:calc(var(--spacing) / 4) calc(var(--spacing) / 2); }
    td p { margin-block: calc(var(--spacing) * 0.2) 0; }
    .twh-TDDate::first-letter { text-transform: capitalize; }

    .twh-SessionRatio {
        display:flex;
        list-style: none;
        padding-inline-start: 0;
        margin-block-end: 0;
        width:100%;
        height: 1rem;
        border-radius: 0.5rem;
        overflow: hidden;
        border:1px solid var(--muted-color);
        background-color: var(--background-color);

        li { 
            margin-block-end: 0;

            &.twh-SessionRatio_Work { background-color: var(--work-color); }
            &.twh-SessionRatio_Pause { background-color: var(--pause-color); }
        }
    }

    .twh-HistoryItem.twh-HistoryItem-mobile {
        list-style:none;
        padding-inline-start: 0;
        display: flex;
        flex-direction: column;
        gap: var(--spacing);

        li, p, h5 { margin-block-end: 0; }
    }
</style>