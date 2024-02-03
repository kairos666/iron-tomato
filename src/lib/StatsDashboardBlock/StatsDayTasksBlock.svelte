<script lang="ts">
    import { CalendarOff, CheckCircle, Star } from "lucide-svelte";
    import { appUIState } from "../../stores/appUIState";
    import TaskCategoryIcon from "../TaskCategoryIcon.svelte";
    import PieChart from "../PieChart.svelte";
    import type { Observable, Subscription } from "rxjs";
    import type { StatTask } from "../../utils/statsObservables";
    import { onDestroy } from "svelte";
    import { durationFormaterToString, formatMsDuration } from "../../utils/time-formater";
    import { taskCategories } from "../../constants/task-categories";

    type DayTasksData = { label:string, percent:number, color:string }
    type StatTaskExtended = StatTask & { icon?:string }
    const { changeMainView } = appUIState;

    export let srcObservable:Observable<StatTask[]>;
    let dayTasksSubscription:Subscription|null = null;
    let dayTasksData:DayTasksData[] = [];
    let tasksList:StatTaskExtended[] = [];
    $: if(srcObservable) { subscribeToSrc(srcObservable) }
    $: if(tasksList) dayTasksData = buildDayTasksData();

    function subscribeToSrc(srcObs:Observable<StatTask[]>) {
        // unsubscribe first (if necessary)
        unsubscribeFromSrc();

        // subscribe to src
        dayTasksSubscription = srcObs.subscribe({ next: handleData });
    }

    function handleData(srcData:StatTask[]) {
        // tasks list
        tasksList = srcData.map(statTask => {
            const categoryIconName:string|null = (statTask.category) ? convertCatIdToIconName(statTask.category) : null;
            return (categoryIconName) ? { ...statTask, icon: categoryIconName } : statTask;
        });
    }

    function buildDayTasksData(focusedTaskId?:string):DayTasksData[] {
        const hasOddNumberOfTasks:boolean = (tasksList.length % 2 !== 0);
        const alternateColors:string[] = hasOddNumberOfTasks ? ["#E9ECEF", "#CED4DA", "#6C757D"] : ["#E9ECEF", "#CED4DA"];
        const totalActivityDuration:number = tasksList.reduce((acc, curr) => acc + curr.cumulatedWDuration + curr.cumulatedPDuration, 0);
        return tasksList.map((statTask, index) => {
            return {
                label: statTask.label, 
                percent: 100 * (statTask.cumulatedPDuration + statTask.cumulatedWDuration) / totalActivityDuration,
                color: (focusedTaskId === statTask.id)
                    ? "var(--primary)"
                    : alternateColors[(hasOddNumberOfTasks) ? index % 3 : index % 2]
            }
        });
    }

    function convertCatIdToIconName(catID:string):string|null {
        return taskCategories.find(item => (item.id === catID))?.icon ?? null;
    }

    function onTaskHover(taskID:string, isHover:boolean) {
        dayTasksData = (isHover) ? buildDayTasksData(taskID) : buildDayTasksData();
    }

    function unsubscribeFromSrc() {
        if(!dayTasksSubscription) return;
        dayTasksSubscription.unsubscribe();
        dayTasksSubscription = null;
    }

    onDestroy(() => {
        unsubscribeFromSrc();
    });
</script>

<article class="sdt-Block">
    <header>
        <h2>Activité du jour par tâche</h2>
    </header>
    {#if tasksList.length > 0}
    <menu class="sdt-DayTasks" class:sdt-DayTasks-lite={ $appUIState.isMobileViewport }>
        {#if !$appUIState.isMobileViewport && tasksList.length >= 2}
        <div class="sdt-TasksDistrib">
            <PieChart statistics={ dayTasksData } baseSize={ 200 } holeSize={ 75 } />
        </div>
        {/if}
        {#each tasksList as task (task.id)}
        <button 
            class="sdt-TaskBtn" 
            on:mouseover={ () => onTaskHover(task.id, true) } 
            on:focus={ () => onTaskHover(task.id, true) } 
            on:mouseout={ () => onTaskHover(task.id, false) } 
            on:blur={ () => onTaskHover(task.id, false) }
            on:click={ () => changeMainView('task-detail', parseInt(task.id)) }
        >
            <h3 class="sdt-TaskBtn_Title">{ task.label }</h3>
            <p class="sdt-TaskBtn_Desc"><time datetime={ durationFormaterToString(task.cumulatedWDuration, 'TECH') }>{ formatMsDuration(task.cumulatedWDuration, 'hour') }</time> travail, <time class="sod-TotalWorkDuration" datetime={ durationFormaterToString(task.cumulatedPDuration, 'TECH') }>{ formatMsDuration(task.cumulatedPDuration, 'hour') }</time> pause</p>
            {#if task.icon}<span class="sdt-TaskBtn_Cat"><TaskCategoryIcon name={ task.icon } stroke-width="1" size="20" color="var(--h6-color)" /></span>{/if}
            {#if task.hasFinishedThatDay}<span class="sdt-TaskBtn_Done"><CheckCircle size="20" color="var(--h6-color)" /></span>{/if}
            {#if task.hasBeenCreatedThatDay}<span class="sdt-TaskBtn_New"><Star size="20" color="var(--h6-color)" /></span>{/if}
        </button>
        {/each}
    </menu>
    {:else}
    <p class="sdt-EmptyHistory"><CalendarOff /> <i>Pas d'activité ce jour là.</i></p>
    {/if}
</article>

<style lang="scss">
    @import "../../styles/page-detail-block";

    .sdt-Block {
        @include pdb_BlockStyle(h2, false);
        margin: var(--outer-large-spacing) 0;
        overflow: hidden;
    }

    .sdt-DayTasks {
        padding:0;
        margin:calc(var(--spacing) * -1);

        @media (max-width:575px) {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }
        @media (min-width:576px) {
            display: grid;
            grid-template-columns: 1fr 2fr;
            grid-auto-rows: auto;
        }
    }

    .sdt-TasksDistrib { 
        grid-column: 1 / 2; 
        grid-row: 1 / 666;
        justify-self: center;
        align-self: center;
    }

    .sdt-TaskBtn {
        grid-column: 2 / 3;
        margin-block-end: 0;
        padding: 10px;
        border-radius: 0;
        background-color: transparent;
        border: none;
        display: grid;
        gap: 10px;
        grid-template-columns: 20px 1fr 20px 20px;
        grid-template-rows: auto auto;
        grid-template-areas: 
            "cat title done created"
            "cat desc desc desc";

        &:hover, &:focus, &:active {
            background-color: var(--primary-focus);
        }

        @media (min-width:576px) {
            border-left:1px solid var(--card-border-color);
        }

        .sdt-TaskBtn_Title { 
            grid-area: title;
            color: var(--h1-color);
            text-align: left;
            margin-block-end: 0;
        }
        .sdt-TaskBtn_Desc { 
            grid-area: desc; 
            color: var(--h6-color);
            text-align: left;
            margin-block-end: 0;
        }

        .sdt-TaskBtn_Cat {
            grid-area: cat;
            align-self: center;
        }
        .sdt-TaskBtn_Done {
            grid-area: done;
        }
        .sdt-TaskBtn_New {
            grid-area: created;
        }

        & + .sdt-TaskBtn {
            border-top:1px solid var(--card-border-color);
        }
    }

    .sdt-EmptyHistory { margin-block-end: 0; }
</style>