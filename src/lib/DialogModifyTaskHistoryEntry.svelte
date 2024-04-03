<script lang="ts">
    import { appUIState } from '../stores/appUIState';
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { CalendarClock, CalendarRange, Clock, Coffee } from "lucide-svelte";
    import { durationFormaterToString } from '../utils/time-formater';
    import { taskEditWorkItem, taskWorkItem, type WorkItem } from '../stores/persistentTasks';

    let targetTaskId:string|null;
    let targetWorkItem:WorkItem|null = null;
    let isModalActive:boolean = false;
    let formWorkRatio:number;
    let sessionDuration:string;
    let workDuration:string;
    let pauseDuration:string;

    const { clearModal } = appUIState;
    $: isModalActive = (typeof $appUIState.modal === 'string' && $appUIState.modal.endsWith('history-edit'));
    $: if(!isModalActive) targetWorkItem = null;
    $: if(isModalActive) {
        // extract work item identifiers
        const taskAndEntryTargetRegExp:RegExp = /task-(?<target>\d+)-(?<entryStart>\d+):(?<entryEnd>\d+)-history-edit/g;
        const regExpExecution:any|null = taskAndEntryTargetRegExp.exec($appUIState.modal ?? "")?.groups ?? null;
        const targetID:string|null = regExpExecution.target ?? null;
        const entryStart:string|null = regExpExecution.entryStart ?? null;
        const entryEnd:string|null = regExpExecution.entryEnd ?? null;

        // extract work item
        if(targetID === null || entryStart === null || entryEnd === null) {
            targetWorkItem = null;
        } else {
            taskWorkItem(targetID, entryStart, entryEnd)
                .then(wi => {
                    targetWorkItem = wi;
                    formWorkRatio = 100 * (wi.wDuration / (wi.wDuration + wi.pDuration));
                    targetTaskId = targetID;
                })
                .catch(err => {
                    targetWorkItem = null;
                    targetTaskId = null;
                    console.warn(err);
                })
        }
    }
    $: if(targetWorkItem !== null) {
        const sessionDurationCount:number = 1000 * Math.round((targetWorkItem.end - targetWorkItem.start) / 1000);
        const workDurationCount:number = 1000 * Math.round((formWorkRatio / 100) * sessionDurationCount / 1000);
        const pauseDurationCount:number = 1000 * Math.round((sessionDurationCount - workDurationCount) / 1000);
        sessionDuration = durationFormaterToString(sessionDurationCount, 'HUMAN', { style: 'narrow', numeric: 'always' });
        workDuration = durationFormaterToString(workDurationCount, 'HUMAN', { style: 'narrow', numeric: 'always' });
        pauseDuration = durationFormaterToString(pauseDurationCount, 'HUMAN', { style: 'narrow', numeric: 'always' });
    }

    function onChangeRatio(evt: { currentTarget:HTMLInputElement }) {
        formWorkRatio = parseFloat(evt.currentTarget.value);
    }

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();

        // generate modified work item
        const sDuration:number = (targetWorkItem as WorkItem).end - (targetWorkItem as WorkItem).start;
        const wDuration:number = Math.round((formWorkRatio / 100) * sDuration);
        const pDuration:number = sDuration - wDuration;
        const newWorkItem:WorkItem = { 
            ...(targetWorkItem as WorkItem), 
            wDuration, 
            pDuration
        }

        if(targetTaskId !== null) taskEditWorkItem(targetTaskId, newWorkItem);
        clearModal();
    }
</script>

<Dialog open={ isModalActive } on:close={() => clearModal() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle><CalendarRange size="32" /> Modifier une entrée d'historique</DialogTitle>
            <DialogDescription>Attention, les sessions peuvent se chevaucher ou être incrites dans le futur.</DialogDescription>
        </hgroup>
        {#if targetWorkItem !== null}
        <form on:submit={ onSubmit } class="dlg-Form">
            <label>Ratio travail/pause <input type="range" value={ formWorkRatio } min="0" max="100" step="0.01" on:change={ onChangeRatio } style:--range-ratio={ `${formWorkRatio}%` } /></label>
            <div class="frm-entry-summary">
                <span data-tooltip={ 'durée de session' }><Clock /> { sessionDuration }</span>
                <span data-tooltip={ 'travail sur la session' }><CalendarClock color="var(--work-color)" /> { workDuration }</span>
                <span data-tooltip={ 'pause sur la session' }><Coffee color="var(--pause-color)" /> { pauseDuration }</span>
            </div>
            <menu class="dlg-Container_ActionsMenu">
                <button class="secondary outline" on:click={() => clearModal() }>Annuler</button>
                <button type="submit">Modifier la session</button>
                <button on:click={() => { console.log('TODO result action') }}>Suppression la session</button>
            </menu>
        </form>
        {:else}
        <div class="frm-entry-summary" aria-busy="true"></div>
        <menu class="dlg-Container_ActionsMenu">
            <button class="secondary outline" on:click={() => clearModal() }>Annuler</button>
            <button disabled>Modifier la session</button>
            <button disabled>Suppression la session</button>
        </menu>
        {/if}
    </article>
</Dialog>

<style lang="scss">
    .frm-DateInputs {
        display:grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
        gap: 0.5rem var(--spacing);
        grid-auto-flow: column;
    }

    .frm-entry-summary {
        padding: var(--spacing);
        margin-block-end: var(--spacing);
        border-radius: var(--border-radius);
        background-color: var(--muted-border-color);
        display:flex;
        gap: calc(var(--spacing) * 0.5);

        > * {
            flex: 1 1 auto;
            border-bottom: none;
            text-align: center;
        }
    }
    input[type="range"]::-webkit-slider-runnable-track {
        background: linear-gradient(90deg, var(--work-color) 0%, var(--work-color) var(--range-ratio), var(--pause-color) var(--range-ratio));
    }
</style>