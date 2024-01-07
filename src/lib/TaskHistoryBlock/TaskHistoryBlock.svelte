<script lang="ts">
    import { CalendarClock, CalendarDays, CalendarOff } from "lucide-svelte";
    import TaskWorkChronology from "./TaskWorkChronology.svelte";
    import TaskWorkHistory from "./TaskWorkHistory.svelte";
    import { getLiveQueryForTaskId, type WorkItem } from "../../stores/persistentTasks";
    import { durationFormaterToString } from "../../utils/time-formater";

    export let taskID:string;
    $: taskQuery = getLiveQueryForTaskId(taskID);
    $: hasHistory = !($taskQuery?.workHistory === undefined || $taskQuery?.workHistory.length === 0);
    $: taskOpenSince = ($taskQuery?.dateCreated !== undefined) ? durationFormaterToString(new Date().getTime() - $taskQuery.dateCreated, 'HUMAN', { style: 'narrow', numeric: 'always' }) : null;
    $: taskEffectiveWork = (hasHistory) ? durationFormaterToString((($taskQuery as any).workHistory as WorkItem[]).reduce((acc, curr) => acc + curr.duration, 0), 'HUMAN', { style: 'narrow', numeric: 'always' }) : null;
</script>

{#if hasHistory}
<article class="th-Block">
    <header>
        <h3>Historique d'activité</h3>
        {#if taskOpenSince}<span class="th-Badge th-BadgeOpenSince"><CalendarDays stroke-width="1" size="15" color="var(--primary-inverse)" /> tâche ouverte depuis { taskOpenSince }</span>{/if}
        {#if taskEffectiveWork}<span class="th-Badge th-BadgeCumulatedActiveWork"><CalendarClock stroke-width="1" size="15" color="var(--primary-inverse)" /> travail effectif : { taskEffectiveWork }</span>{/if}
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
    @import "../../styles/page-detail-badges";

    .th-Block { 
        @include pdb_BlockStyle(h3);
        grid-area: work-history;
    }

    .th-Badge.th-BadgeOpenSince {
        @include pdb_BadgeStyle(var(--primary-inverse), var(--muted-color));
    }
    .th-Badge.th-BadgeCumulatedActiveWork {
        @include pdb_BadgeStyle(var(--primary-inverse), var(--primary));
    }

    .th-EmptyHistory { margin-block-end: 0; }
</style>