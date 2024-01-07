<script lang="ts">
    import { CalendarOff } from "lucide-svelte";
    import TaskWorkChronology from "./TaskWorkChronology.svelte";
    import TaskWorkHistory from "./TaskWorkHistory.svelte";
    import { getLiveQueryForTaskId } from "../../stores/persistentTasks";

    export let taskID:string;
    $: taskQuery = getLiveQueryForTaskId(taskID);
    $: hasHistory = !($taskQuery?.workHistory === undefined || $taskQuery?.workHistory.length === 0);
</script>

{#if hasHistory}
<article class="th-Block">
    <header>
        <h3>Historique d'activité</h3>
        <dl class="th-MainStats">
            <dt>Périodes des sessions de travail (TODO - static) :</dt><dd>vendredi 05 janv. 2024, 23:58 - samedi 06 janv. 2024, 21:12</dd>
            <dt>Travail effectif cumulé (TODO - static) :</dt><dd>15 heures 35 minutes 32 secondes</dd>
        </dl>
    </header>
    <TaskWorkHistory taskHistory={ $taskQuery?.workHistory ?? [] } />
    <footer>
        <TaskWorkChronology taskHistory={ $taskQuery?.workHistory ?? [] } />
    </footer>
</article>
{:else}
<article class="th-Block">
    <header>
        <h3>Historique d'activité</h3>
    </header>
    <p class="th-EmptyHistory"><CalendarOff /> <i>La tâche ne contient pas d'imputations</i></p>
</article>
{/if}

<style lang="scss">
    @import "../../styles/page-detail-block";

    .th-Block { 
        @include pdb_BlockStyle(h3);
        grid-area: work-history;
    }

    .th-MainStats {
        padding-inline-start: 0;
        margin-block: var(--spacing) 0;
        display: grid;
        grid-template-columns: 1fr;
        grid-auto-rows: auto;
        grid-gap: calc(var(--spacing) * 0.5);

        @media (min-width:576px) {
            grid-template-columns: auto 1fr;
            grid-auto-rows: auto;
            dt { justify-self: end; }
        }

        dt { font-style: italic; }
        dd { margin-inline-start: 0; font-weight: 500; }
    }

    .th-EmptyHistory { margin-block-end: 0; }
</style>