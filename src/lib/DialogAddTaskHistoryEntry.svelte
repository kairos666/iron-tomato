<script lang="ts">
    import { appUIState } from '../stores/appUIState';
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { CalendarPlus, Clock, CalendarClock, Coffee } from "lucide-svelte";
    import { parameterState } from '../stores/parametersState';
    import { add, format, isAfter } from 'date-fns';
    import { durationFormaterToString } from '../utils/time-formater';
    
    let isModalActive:boolean = false;
    let startDateInput:HTMLInputElement;
    let endDateInput:HTMLInputElement;
    let formWorkRatio:number = balancedRatioPerc($parameterState.mRatioWorkPause);
    let formStartDate:Date = new Date();
    let formEndDate:Date = add(formStartDate, { hours: 1 });
    let sessionDuration:string;
    let workDuration:string;
    let pauseDuration:string;

    const { clearModal } = appUIState;
    $: isModalActive = (typeof $appUIState.modal === 'string' && $appUIState.modal.endsWith('history-create'));
    $: if(!isModalActive) {
        // reset form
        formWorkRatio = balancedRatioPerc($parameterState.mRatioWorkPause);
        formStartDate = new Date();
        formEndDate = add(formStartDate, { hours: 1 });
    }
    $: {
        const sessionDurationCount:number = 1000 * Math.round((formEndDate.getTime() - formStartDate.getTime()) / 1000);
        const workDurationCount:number = 1000 * Math.round((formWorkRatio / 100) * sessionDurationCount / 1000);
        const pauseDurationCount:number = 1000 * Math.round((sessionDurationCount - workDurationCount) / 1000);
        sessionDuration = durationFormaterToString(sessionDurationCount, 'HUMAN', { style: 'narrow', numeric: 'always' });
        workDuration = durationFormaterToString(workDurationCount, 'HUMAN', { style: 'narrow', numeric: 'always' });
        pauseDuration = durationFormaterToString(pauseDurationCount, 'HUMAN', { style: 'narrow', numeric: 'always' });
    }

    function balancedRatioPerc(ratio:number) { return Math.round((1000 * ratio) / (ratio + 1)) / 10 }

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        const taskTargetRegExp:RegExp = /task-(?<target>\d+)-history-create/g;
        const targetTaskId:string|null = taskTargetRegExp.exec($appUIState.modal ?? "")?.groups?.target ?? null;
        console.log('TODO entry link', targetTaskId, formWorkRatio, formStartDate, formEndDate);
    }

    function onChangeRatio(evt: { currentTarget:HTMLInputElement }) {
        formWorkRatio = parseFloat(evt.currentTarget.value);
    }

    function onStartDateInputChange(evt:any) { 
        const changedValue:string|false = evt?.currentTarget?.value ?? false;
        if(!changedValue) return;
        
        formStartDate = new Date(changedValue);
        if(isAfter(formStartDate, formEndDate)) {
            // impact end (end must be after start)
            formEndDate = add(formStartDate, { minutes: 5 });
            endDateInput.value = format(formEndDate, `yyyy-MM-dd'T'HH:mm`);
        }
    }

    function onEndDateInputChange(evt:any) { 
        const changedValue:string|false = evt?.currentTarget?.value ?? false;
        if(!changedValue) return;

        formEndDate = new Date(changedValue);
        if(isAfter(formStartDate, formEndDate)) {
            // impact start (start must be before end)
            formStartDate = add(formEndDate, { minutes: -5 });
            startDateInput.value = format(formStartDate, `yyyy-MM-dd'T'HH:mm`);
        }
    }
</script>

<Dialog open={ isModalActive } on:close={() => clearModal() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle><CalendarPlus size="32" /> Ajouter une entrée d'historique</DialogTitle>
            <DialogDescription>Attention, les sessions peuvent se chevaucher.</DialogDescription>
        </hgroup>
        <form on:submit={ onSubmit } class="dlg-Form">
            <div class="frm-DateInputs">
                <label for="history-entry-start-date-picking">Départ de session</label>
                <input type="datetime-local" id="history-entry-start-date-picking" name="history-entry-start-date-picking" value={ format(formStartDate, `yyyy-MM-dd'T'HH:mm`) } on:change={ onStartDateInputChange } bind:this={ startDateInput } required />    
                <label for="history-entry-end-date-picking">Fin de session</label>
                <input type="datetime-local" id="history-entry-end-date-picking" name="history-entry-end-date-picking" value={ format(formEndDate, `yyyy-MM-dd'T'HH:mm`) } on:change={ onEndDateInputChange } bind:this={ endDateInput } required />
            </div>
            <label>Ratio travail/pause <input type="range" value={ formWorkRatio } min="0" max="100" step="0.01" on:change={ onChangeRatio } style:--range-ratio={ `${formWorkRatio}%` } /></label>
            <div class="frm-entry-summary">
                <span data-tooltip={ 'durée de session' }><Clock /> { sessionDuration }</span>
                <span data-tooltip={ 'travail sur la session' }><CalendarClock color="var(--work-color)" /> { workDuration }</span>
                <span data-tooltip={ 'pause sur la session' }><Coffee  color="var(--pause-color)" /> { pauseDuration }</span>
            </div>
            <menu class="dlg-Container_ActionsMenu">
                <button class="secondary outline" on:click={ () => clearModal() }>Annuler</button>
                <button type="submit">Ajouter la session</button>
            </menu>
        </form>
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