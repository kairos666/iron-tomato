<script lang="ts">
    import { appUIState } from '../stores/appUIState';
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { CalendarPlus, Clock, CalendarClock, Coffee } from "lucide-svelte";
    import { parameterState } from '../stores/parametersState';
    import { add, format, isAfter } from 'date-fns';
    
    let startDateInput:HTMLInputElement;
    let endDateInput:HTMLInputElement;
    let formWorkRatio:number = balancedRatioPerc($parameterState.mRatioWorkPause);
    let formStartDate:Date = new Date();
    let formEndDate:Date = add(formStartDate, { hours: 1 });

    const { clearModal } = appUIState;
    $: isModalActive = (typeof $appUIState.modal === 'string' && $appUIState.modal.endsWith('history-create'));
    $: if(isModalActive) {
        // reset form
        formWorkRatio = balancedRatioPerc($parameterState.mRatioWorkPause);
        formStartDate = new Date();
        formEndDate = add(formStartDate, { hours: 1 });
    }

    function balancedRatioPerc(ratio:number) { return Math.round((1000 * ratio) / (ratio + 1)) / 10 }

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        console.log(formWorkRatio, formStartDate, formEndDate);
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
            <DialogDescription>Tâche #TODO</DialogDescription>
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
                <span><Clock /> XXXX durée de session</span>
                <span><CalendarClock color="var(--work-color)" /> XXXX Travail effectif</span>
                <span><Coffee  color="var(--pause-color)" /> XXXX Pause</span>
            </div>
            <menu class="dlg-Container_ActionsMenu">
                <button class="secondary outline" on:click={() => clearModal() }>Annuler</button>
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
    input[type="range"]::-webkit-slider-runnable-track {
        background: linear-gradient(90deg, var(--work-color) 0%, var(--work-color) var(--range-ratio), var(--pause-color) var(--range-ratio));
    }
</style>