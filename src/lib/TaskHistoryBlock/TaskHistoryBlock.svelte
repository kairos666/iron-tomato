<script lang="ts">
    import { CalendarOff } from "lucide-svelte";
    import TaskWorkChronology from "./TaskWorkChronology.svelte";
    import TaskWorkHistory from "./TaskWorkHistory.svelte";
    import { getLiveQueryForTaskId, type WorkItem } from "../../stores/persistentTasks";
    import { durationFormaterToString } from "../../utils/time-formater";
    import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@rgossiaux/svelte-headlessui";
    import PieChart from "../PieChart.svelte";

    export let taskID:string;
    let ratioTotal:{ label:string, percent:number, color:string }[] = [];
    let ratioSessions:{ label:string, percent:number, color:string }[] = [];
    $: taskQuery = getLiveQueryForTaskId(taskID);
    $: hasHistory = !($taskQuery?.workHistory === undefined || $taskQuery?.workHistory.length === 0);
    $: if(hasHistory) {
        const durationSinceCreation:number = new Date().getTime() - ($taskQuery as any).dateCreated;
        const durationTotalWorkSessions:number = (($taskQuery as any).workHistory as WorkItem[]).reduce((acc, curr) => acc + (curr.end - curr.start), 0);
        const durationEffectiveWork:number = (($taskQuery as any).workHistory as WorkItem[]).reduce((acc, curr) => acc + curr.duration, 0);
        const durationPauses:number = durationTotalWorkSessions - durationEffectiveWork;
        const durationWithoutWorkSession:number = durationSinceCreation - durationTotalWorkSessions;
        const taskEffectiveWork:string = durationFormaterToString(durationEffectiveWork, 'HUMAN', { style: 'narrow', numeric: 'always' });
        const taskPauses:string = durationFormaterToString(durationPauses, 'HUMAN', { style: 'narrow', numeric: 'always' });

        ratioTotal = [
            { label: `Travail effectif sur la tâche : ${ taskEffectiveWork }`, percent: 100 * (durationEffectiveWork / durationSinceCreation), color: "var(--primary)" },
            { label: `Pauses sur la tâche : ${ taskPauses }`, percent: 100 * (durationPauses / durationSinceCreation), color: "var(--muted-color)" },
            { label: `Tâche ignorée`, percent: 100 * (durationWithoutWorkSession / durationSinceCreation), color: "var(--muted-border-color)" }
        ];
        ratioSessions = [
            { label: `Travail effectif sur la tâche : ${ taskEffectiveWork }`, percent: 100 * (durationEffectiveWork / durationTotalWorkSessions), color: "var(--primary)" },
            { label: `Pauses sur la tâche : ${ taskPauses }`, percent: 100 * (durationPauses / durationTotalWorkSessions), color: "var(--muted-color)" }
        ];
    } else {
        ratioTotal = [];
        ratioSessions = [];
    }
</script>

{#if hasHistory}
<article class="th-Block">
    <header>
        <h3>Historique d'activité</h3>
    </header>
    <TabGroup>
        <TabList class="tab-TabList">
            <Tab class={ ({selected}) => selected ? "tab-selected" : "tab-unselected" }>Distribution de l'activité</Tab>
            <Tab class={ ({selected}) => selected ? "tab-selected" : "tab-unselected" }>Historique détaillé</Tab>
        </TabList>
        <TabPanels>
            <TabPanel>
                <section class="th-StatBlock">
                    <h4>Ratios depuis la création de la tâche</h4>
                    <PieChart statistics={ ratioTotal } baseSize={ 150 } holeSize={ 50 } />
                </section>
                <section class="th-StatBlock">
                    <h4>Ratios des sessions de travail</h4>
                    <PieChart statistics={ ratioSessions } baseSize={ 150 } holeSize={ 50 } />
                </section>
                <hr />
                <section class="th-DistributionSessionsBlock">
                    <h4>Répartition des sessions de travail</h4>
                    <p><small>Plus la couleur de session est foncée et plus la période d'activité est intense.</small></p>
                    <TaskWorkChronology taskHistory={ $taskQuery?.workHistory ?? [] } />
                </section>
                <hr />
                <section class="th-DistributionWeekBlock">
                    <h4>Répartition au cours des jours de la semaine</h4>
                    <p>TODO</p>
                </section>
            </TabPanel>
            <TabPanel>
                <section class="th-SessionDetailsBlock">
                    <h4>Sessions enregistrées</h4>
                    <TaskWorkHistory taskHistory={ $taskQuery?.workHistory ?? [] } />
                </section>
            </TabPanel>
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

        h4 { margin-block-end: calc(var(--spacing) * 0.35); }
        p { margin-block-end: calc(var(--spacing) * 0.2); }
        hr { margin-block: calc(var(--spacing) * 2); }
    }

    .th-EmptyHistory { margin-block-end: 0; }
</style>