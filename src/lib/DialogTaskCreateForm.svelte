<script lang="ts">
    import { type BaseTask, taskCreate } from "../stores/persistentTasks";
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription, Switch, SwitchGroup, SwitchLabel } from "@rgossiaux/svelte-headlessui";
    import { AlarmClock, PlusCircle, Siren } from "lucide-svelte";
    import { appUIState } from "../stores/appUIState";
    import { tick } from "svelte";

    const { clearModal } = appUIState;

    // handle pre filled form if edit instead of creation (if statement ensure re-evaluation between openings)
    let formTaskLabel:string = "";
    let formTaskDescription:string = "";
    let formTaskIsUrgent:boolean = false;
    let formTaskIsImportant:boolean = false;

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        const submittedFormData = new FormData((evt.target as HTMLFormElement));
        const resultLabel = submittedFormData.get('task-label');
        const resultDescription = submittedFormData.get('task-description');
        if(resultLabel === null || typeof resultLabel !== 'string' || resultDescription === null || typeof resultDescription !== 'string') throw new Error('DialogTaskForm - problem with retrieving form values');
        
        // format new task
        const newTask:BaseTask = {
            label: resultLabel,
            description: (resultDescription !== "") ? resultDescription : undefined, 
            isActive: false,
            isUrgent: formTaskIsUrgent,
            isImportant: formTaskIsImportant,
            isDone: false
        }

        // commit changes and close
        taskCreate(newTask).then(scrollToBottomOfPage);
        clearModal();
    }

    // ensure bottom of page to enable chaining task creation
    async function scrollToBottomOfPage() {
        await tick();
        window.scrollTo(0, document.body.scrollHeight);
    }
</script>

<Dialog open={ ($appUIState.modal === 'task-create') } on:close={() => clearModal() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle><PlusCircle size={ 32 } /> Créer une tâche</DialogTitle>
            <DialogDescription>Définir et ajouter une nouvelle tâche à la liste.</DialogDescription>
        </hgroup>
        <form on:submit={ onSubmit }>
            <label for="task-label">Libellé</label>
            <input type="text" id="task-label" name="task-label" placeholder="Intitulé de la tâche" value={ formTaskLabel } required />
            <label for="task-description">Description</label>
            <textarea id="task-description" name="task-description" placeholder="Descriptif détaillé optionnel de la tâche" value={ formTaskDescription } />
            <SwitchGroup class="switch-group">
                <SwitchLabel class="switch-label"><AlarmClock /> Marquer urgent</SwitchLabel>
                <Switch bind:checked={formTaskIsUrgent} class={formTaskIsUrgent ? "switch switch-enabled" : "switch switch-disabled"}>
                    <span class="sr-only">Marquer urgent</span>
                    <span class="toggle" class:toggle-on={ formTaskIsUrgent } class:toggle-off={ !formTaskIsUrgent } />
                </Switch>
            </SwitchGroup>
            <SwitchGroup class="switch-group">
                <SwitchLabel class="switch-label"><Siren /> Marquer important</SwitchLabel>
                <Switch bind:checked={formTaskIsImportant} class={formTaskIsImportant ? "switch switch-enabled" : "switch switch-disabled"}>
                    <span class="sr-only">Marquer important</span>
                    <span class="toggle" class:toggle-on={ formTaskIsImportant } class:toggle-off={ !formTaskIsImportant } />
                </Switch>
            </SwitchGroup>
            <menu class="dlg-Container_ActionsMenu">
                <button type="reset" class="secondary outline" on:click={() => clearModal() }>Annuler</button>
                <button type="submit">Créer la tâche</button>
            </menu>
        </form>
    </article>
</Dialog> 