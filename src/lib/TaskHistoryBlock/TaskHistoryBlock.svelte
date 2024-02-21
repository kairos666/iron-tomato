<script lang="ts">
    import { CalendarOff, CalendarClock, CalendarDays, Coffee } from "lucide-svelte";
    import TaskWorkChronology from "./TaskWorkChronology.svelte";
    import TaskWorkHistory from "./TaskWorkHistory.svelte";
    import { getLiveQueryForTaskId, type WorkItem } from "../../stores/persistentTasks";
    import { durationFormaterToString } from "../../utils/time-formater";
    import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@rgossiaux/svelte-headlessui";
    import PieChart from "../PieChart.svelte";
    import TaskWorkCalendar from "./TaskWorkCalendar.svelte";

    export let taskID:string;
    let ratioTotal:{ label:string, percent:number, color:string, icon: any, humanDuration: string }[] = [];
    let ratioSessions:{ label:string, percent:number, color:string, icon: any, humanDuration: string }[] = [];
    $: taskQuery = getLiveQueryForTaskId(taskID);
    $: hasHistory = !($taskQuery?.workHistory === undefined || $taskQuery?.workHistory.length === 0);
    $: if(hasHistory) {
        const durationSinceCreation:number = new Date().getTime() - ($taskQuery as any).dateCreated;
        const durationTotalWorkSessions:number = (($taskQuery as any).workHistory as WorkItem[]).reduce((acc, curr) => acc + (curr.end - curr.start), 0);
        const durationEffectiveWork:number = (($taskQuery as any).workHistory as WorkItem[]).reduce((acc, curr) => acc + curr.wDuration, 0);
        const durationPauses:number = (($taskQuery as any).workHistory as WorkItem[]).reduce((acc, curr) => acc + curr.pDuration, 0);
        const durationWithoutWorkSession:number = durationSinceCreation - durationTotalWorkSessions;
        const taskEffectiveWork:string = durationFormaterToString(durationEffectiveWork, 'HUMAN', { style: 'narrow', numeric: 'always' });
        const taskPauses:string = durationFormaterToString(durationPauses, 'HUMAN', { style: 'narrow', numeric: 'always' });
        const taskIgnored:string = durationFormaterToString(durationWithoutWorkSession, 'HUMAN', { style: 'narrow', numeric: 'always' });

        ratioTotal = [
            { label: `Travail effectif sur la tâche`, humanDuration: taskEffectiveWork, percent: 100 * (durationEffectiveWork / durationSinceCreation), color: "var(--work-color)", icon: CalendarClock },
            { label: `Pauses sur la tâche`, humanDuration: taskPauses, percent: 100 * (durationPauses / durationSinceCreation), color: "var(--pause-color)", icon: Coffee },           
            { label: `Tâche ignorée`, humanDuration: taskIgnored, percent: 100 * (durationWithoutWorkSession / durationSinceCreation), color: "var(--ignore-color)", icon: CalendarDays }
        ];
        ratioSessions = [
            { label: `Travail effectif sur la tâche`, humanDuration: taskEffectiveWork, percent: 100 * (durationEffectiveWork / (durationEffectiveWork + durationPauses)), color: "var(--work-color)", icon: CalendarClock },
            { label: `Pauses sur la tâche`, humanDuration: taskPauses, percent: 100 * (durationPauses / (durationEffectiveWork + durationPauses)), color: "var(--pause-color)", icon: Coffee }
        ];
    } else {
        ratioTotal = [];
        ratioSessions = [];
    }
</script>

{#if hasHistory}
<article class="th-Block">
    <header class="th-Block_Header">
        <h3>Historique d'activité</h3>
        <menu class="th-Block_Menu">
            <button type="button" class="th-Block_AddBtn" disabled={ $taskQuery?.isDone }>Ajouter manuellement une session</button>
        </menu>
    </header>
    <TabGroup>
        <TabList class="tab-TabList">
            <Tab class={ ({selected}) => selected ? "tab-selected" : "tab-unselected" }>Synthèse d'activité</Tab>
            <Tab class={ ({selected}) => selected ? "tab-selected" : "tab-unselected" }>Distribution de l'activité</Tab>
            <Tab class={ ({selected}) => selected ? "tab-selected" : "tab-unselected" }>Historique détaillé</Tab>
        </TabList>
        <TabPanels>
            <TabPanel class="th-Stats">
                <section class="th-StatBlock">
                    <h4 class="th-PieChartTitle">Ratio global</h4>
                    <PieChart statistics={ ratioTotal } baseSize={ 200 } holeSize={ 75 } style="grid-area:chart;justify-self:center;" />
                    <div class="th-PieChartLegends">
                        {#each ratioTotal as legend}
                            <figure class="th-PieChartLegend" data-tooltip={ `${ legend.humanDuration } (${ Math.round((legend.percent + Number.EPSILON) * 100) / 100 }%)` }>
                                <svelte:component this={ legend.icon } color={ legend.color } />
                                <figcaption>{ legend.label }</figcaption>
                            </figure>
                        {/each}
                    </div>
                </section>
                <section class="th-StatBlock">
                    <h4 class="th-PieChartTitle">Ratio focus travail / pause</h4>
                    <PieChart statistics={ ratioSessions } baseSize={ 200 } holeSize={ 75 } style="grid-area:chart;justify-self:center;" />
                    <div class="th-PieChartLegends">
                        {#each ratioSessions as legend}
                            <figure class="th-PieChartLegend" data-tooltip={ `${ legend.humanDuration } (${ Math.round((legend.percent + Number.EPSILON) * 100) / 100 }%)` }>
                                <svelte:component this={ legend.icon } color={ legend.color } />
                                <figcaption>{ legend.label }</figcaption>
                            </figure>
                        {/each}
                    </div>
                </section>
            </TabPanel>
            <TabPanel>
                <section class="th-DistributionBlock th-Distribution-week">
                    <h4>Répartition au cours des jours de la semaine</h4>
                    <p><small>Répartition du temps de travail par journées.</small></p>
                    <TaskWorkCalendar taskHistory={ $taskQuery?.workHistory ?? [] } />
                </section>
                <hr />
                <section class="th-DistributionBlock th-Distribution-sessions">
                    <h4>Répartition des sessions de travail</h4>
                    <p><small>Plus la couleur de session est foncée et plus la période d'activité est intense.</small></p>
                    <TaskWorkChronology taskHistory={ $taskQuery?.workHistory ?? [] } />
                </section>
            </TabPanel>
            <TabPanel>
                <section class="th-SessionDetailsBlock">
                    <h4>Sessions de travail enregistrées</h4>
                    <TaskWorkHistory taskHistory={ $taskQuery?.workHistory ?? [] } />
                </section>
            </TabPanel>
        </TabPanels>
    </TabGroup>
</article>
{:else}
<article class="th-Block">
    <header class="th-Block_Header">
        <h3>Historique d'activité</h3>
        <menu class="th-Block_Menu">
            <button type="button" class="th-Block_AddBtn" disabled={ $taskQuery?.isDone }>Ajouter manuellement une session</button>
        </menu>
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

        hr { margin-block: calc(var(--spacing) * 2); }
    }

    .th-StatBlock {
        margin-block-end: 0;
        display:grid;
        align-items: center;
        grid-gap: var(--spacing);

        h4 { grid-area: title; margin-block-end: 0; }
        .th-PieChartTitle { grid-area: title; }
        .th-PieChartLegends { grid-area: legend; }
        @media (max-width:575px) {
            grid-template-columns: auto;
            grid-template-rows: auto;
            grid-template-areas: 
                "title"
                "chart"
                "legend";
        }

        @media (min-width:576px) {
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
            grid-template-areas: 
                "title title"
                "chart legend";
        }

        .th-PieChartLegends {
            display:flex;
            flex-direction: column;
            gap: var(--spacing);
        }

        .th-PieChartLegend {
            margin-block-end: 0;
            overflow: visible;
            border-bottom: none;

            figcaption { display:inline; padding-block:0; }
        }
    }

    .th-DistributionBlock {
        margin-block-end: 0;
        h4 { margin-block-end: 0; }
        p { margin-block-end: calc(var(--spacing) * 0.5); }
    }

    .th-SessionDetailsBlock {
        margin-block-end: 0;
        h4 { margin-block-end: 0; }
    }

    .th-EmptyHistory { margin-block-end: 0; }

    .th-Block_Header {
        display:flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing);
    }

    .th-Block_Menu {
        padding-inline-start: 0;
        margin-block: 0;
        display:flex;
        gap: calc(var(--spacing) * 0.5);

        .th-Block_AddBtn {
            margin-block-end: 0;
            padding-block: calc(var(--spacing) * 0.25);
            border-color: var(--secondary);
            color: var(--secondary); 
            background-color: var(--secondary-inverse);
            font-size: 0.8rem;
            &:hover, &:focus, &:active { 
                color: var(--secondary-inverse); 
                background-color: var(--secondary-hover); 
            }
            &:disabled {
                opacity: 0.15;
            }
        }
    }
</style>