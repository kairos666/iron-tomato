<script lang="ts">
    import { CalendarClock, CalendarDays, CalendarOff } from "lucide-svelte";
    import TaskWorkChronology from "./TaskWorkChronology.svelte";
    import TaskWorkHistory from "./TaskWorkHistory.svelte";
    import { getLiveQueryForTaskId, type WorkItem } from "../../stores/persistentTasks";
    import { durationFormaterToString } from "../../utils/time-formater";
    import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@rgossiaux/svelte-headlessui";

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
    <TabGroup>
        <TabList class="tab-TabList">
            <Tab class={ ({selected}) => selected ? "tab-selected" : "tab-unselected" }>Chronologie sessions de travail</Tab>
            <Tab class={ ({selected}) => selected ? "tab-selected" : "tab-unselected" }>Historique détaillé</Tab>
            <Tab class={ ({selected}) => selected ? "tab-selected" : "tab-unselected" }>Découpage par jours</Tab>
        </TabList>
        <TabPanels>
            <TabPanel><TaskWorkChronology taskHistory={ $taskQuery?.workHistory ?? [] } /></TabPanel>
            <TabPanel><TaskWorkHistory taskHistory={ $taskQuery?.workHistory ?? [] } /></TabPanel>
            <TabPanel>Content 3</TabPanel>
        </TabPanels>
    </TabGroup>
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