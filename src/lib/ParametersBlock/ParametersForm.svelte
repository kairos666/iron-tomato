<script lang="ts">
    import { Save, X } from "lucide-svelte";
    import { parameterState, type ParameterState }from "../../stores/parametersState";
    import { onDestroy } from 'svelte';
    import { appUIState } from "../../stores/appUIState";

    let hasLoadedParameters:boolean = false;
    let mRatioWorkPause:number;
    let minThresholdLoggedWork:number;
    const { changeMainView } = appUIState;

    // update form values if state is updated (classic style)
    const unsubscribeCb = parameterState.subscribe(parameterState => {
        mRatioWorkPause = parameterState.mRatioWorkPause;
        minThresholdLoggedWork = parameterState.minThresholdLoggedWork / (1000 * 60 * 60);
        hasLoadedParameters = true;
    });
    onDestroy(() => {
        unsubscribeCb();
    });

    // convert form values to state values
    function fromFormValuesToState():ParameterState {
        return {
            minThresholdLoggedWork: minThresholdLoggedWork * (1000 * 60 * 60),
            mRatioWorkPause
        }
    }

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        parameterState.changeParameters(fromFormValuesToState());
        changeMainView('dashboard');
    }
</script>

{#if hasLoadedParameters}
    <form class="pf-Form" on:submit={ onSubmit }>
        <!-- <fieldset class="pf-ParamBlock">
            <legend>Paramètres liste de tâches et matrice d'Eisenhower</legend>
            <p>TODO</p>
        </fieldset> -->
        <fieldset class="pf-ParamBlock">
            <legend>Paramètres d'activité sur une tâche</legend>
            <label for="min-work-duration-to-log">Durée minimale de travail pertinente</label>
            <input type="number" step="1" min="1" id="min-work-duration-to-log" name="min-work-duration-to-log" bind:value={ minThresholdLoggedWork } required />
            <small>minimum { minThresholdLoggedWork } minutes de travail cumulé pour déclencher l'enregistrement dans l'historique d'activité</small>
            <label for="maggic-ratio">Ratio travail / pause</label>
            <input type="number" step="1" min="1" id="maggic-ratio" name="maggic-ratio" bind:value={ mRatioWorkPause } required />
            <small>pour 25 minutes de travail, environ { Math.round(25 / mRatioWorkPause) } minutes de pause</small>
        </fieldset>
        <menu class="pf-ParamFormActions">
            <button type="reset" class="secondary outline" on:click={ () => changeMainView('dashboard') }><X color="var(--secondary)" /> Annuler</button>
            <button type="submit" class="primary"><Save color="var(--primary-inverse)" /> Appliquer les modifications</button>
        </menu>
    </form>
{:else}
    <p class="empty-state-emphasized">Paramètres en cours de chargement</p>
{/if}

<style lang="scss">
    @import "../../styles/variables.scss";
    .pf-Form {
        margin-block-end: 0;
        display:grid;
        gap: var(--spacing);

        @media (max-width:1199px) {
            grid-template-columns: 1fr;
            grid-auto-rows: auto; 
        }
        @media (min-width: 1200px) {
            grid-template-columns: 5fr 3fr;
            grid-template-rows: repeat(4, auto);
        }
    }
    .pf-ParamBlock {
        margin-block: 0;

        legend {
            font-size: 1.25rem;
            color: var(--primary);
            margin-block-end: var(--spacing);
        }
    }
    .pf-ParamFormActions {
        padding-inline-start: 0;
        margin-block: 0;
        @media (max-width:1199px) {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing);

            > button { flex:1 1 calc(50% - var(--spacing) * 0.5); margin-block-end: 0; }
        }
        @media (min-width: 1200px) {
            position: sticky;
            top: calc(var(--spacing) + $header-height);
            align-self: start;
            grid-column: 2 / 3;
            grid-row: 1 / 5;

            button { margin-block-end: var(--spacing); }
        }
    }
</style>