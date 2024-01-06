<script lang="ts">
    import { CalendarOff } from "lucide-svelte";
    import { getLiveQueryForTaskId, type WorkItem } from "../stores/persistentTasks";

    type WorkItemExtended = WorkItem & {
        label: string
        startPerc: number
        endPerc: number
    }

    type ChronologicHistory = {
        chronologyStart: number
        chronologyStartLabel: string
        chronologyEnd: number
        chronologyEndLabel: string
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
            chronology = {
                chronologyStart: 1704495509835,
                chronologyStartLabel: "05 janvier 2023 - 11h30",
                chronologyEnd: 1704496875317,
                chronologyEndLabel: "06 janvier 2024 - 00:30",
                workSessions: [
                    {
                        "label": `5h30`,
                        "start": 1704495509835,
                        "startPerc": 0,
                        "endPerc": 0.15,
                        "end": 1704495551202,
                        "duration": 41367
                    },
                    {
                        "label": "work session 2",
                        "start": 1704495554796,
                        "startPerc": 0.2,
                        "endPerc": 0.25,
                        "end": 1704495650778,
                        "duration": 95982
                    },
                    {
                        "label": "work session 3",
                        "start": 1704495662796,
                        "startPerc": 0.3,
                        "endPerc": 0.35,
                        "end": 1704495695316,
                        "duration": 32520
                    },
                    {
                        "label": "work session 4",
                        "start": 1704496113374,
                        "startPerc": 0.4,
                        "endPerc": 0.45,
                        "end": 1704496240544,
                        "duration": 127170
                    },
                    {
                        "label": "work session 5",
                        "start": 1704496246844,
                        "startPerc": 0.80,
                        "endPerc": 1,
                        "end": 1704496875317,
                        "duration": 628473
                    }
                ]
            };
            console.log($taskQuery.workHistory);
        }
    }
</script>

{#if chronology}
    <figure class="twh-Chronology">
        <span class="twh-Chronology_Start">{ chronology.chronologyStartLabel }</span>
        {#each chronology.workSessions as session}
            <span 
                class="twh-Chronology_WorkSession" 
                style:left={ `${ session.startPerc * 100 }%` } 
                style:right={ `${ 100 - session.endPerc * 100 }%` } 
                data-tooltip={ session.label } 
                data-placement={ (session.start === chronology.chronologyStart) ? "right" : (session.end === chronology.chronologyEnd) ? "left" : "top" }
            ></span>
        {/each}
        <span class="twh-Chronology_End">{ chronology.chronologyEndLabel }</span>
    </figure>
{:else}
    <p class="twh-EmptyHistory"><CalendarOff /> <i>La tâche ne contient pas d'imputations</i></p>
{/if}

<style lang="scss">
    .twh-Chronology {
        margin-block-end: 0;
        position:relative;
        width: 100%;
        height: 6rem;

        &:before {
            content: '';
            position:absolute;
            top: 3rem;
            height:1px;
            width:100%;
            background-color: var(--primary);
        }

        .twh-Chronology_Start {
            position:absolute;
            inset: auto auto 0 0;
        }

        .twh-Chronology_End {
            position:absolute;
            inset: auto 0 0 auto;
        }

        .twh-Chronology_WorkSession {
            position:absolute;
            top: calc(3rem - 4px);
            height: 10px;
            background-color: var(--primary);
            border-radius: 5px;
        }
    }

    .twh-EmptyHistory { margin-block-end: 0; }
</style>