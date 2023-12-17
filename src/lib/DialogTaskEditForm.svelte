<script lang="ts">
    import { type Task, taskEdit, taskById } from "../stores/persistentTasks";
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription, SwitchGroup, SwitchLabel, Switch } from "@rgossiaux/svelte-headlessui";
    import { AlarmClock, Pencil, Siren } from "lucide-svelte";
    import { appUIState } from "../stores/appUIState";
    import Task from "./Task.svelte";
    const { clearModal } = appUIState;
    let initialTask:Task|undefined = undefined;

    $: isModalActive = (typeof $appUIState.modal === 'string' && $appUIState.modal.startsWith('task-edit'));
    $: targetTaskId = (isModalActive) 
        ? $appUIState.modal?.replace('task-edit-', '') ?? null 
        : null;
    $: if(isModalActive && targetTaskId !== null) {
        taskById(targetTaskId).then(task => { initialTask = task });
    } else {
        initialTask = undefined;
    }

    // handle pre filled form (if statement ensure re-evaluation between openings)
    let formTaskLabel:string = "";
    let formTaskDescription:string = "";
    let formTaskIsUrgent:boolean = false;
    let formTaskIsImportant:boolean = false;

    // assign function necessary to avoid reactively updating when user change value in form
    function assignDefaultValue(initialData:Task|undefined, targetProperty:'label'|'description'|'isUrgent'|'isImportant') {
        switch(targetProperty) {
            case 'label': formTaskLabel = initialData?.label ?? ""; break;
            case 'description': formTaskDescription = initialTask?.description ?? ""; break;
            case 'isUrgent': formTaskIsUrgent = initialTask?.isUrgent ?? false; break;
            case 'isImportant': formTaskIsImportant = initialTask?.isImportant ?? false; break;
        }
    }
    $: if(isModalActive) {
        assignDefaultValue(initialTask, 'label');
        assignDefaultValue(initialTask, 'description');
        assignDefaultValue(initialTask, 'isUrgent');
        assignDefaultValue(initialTask, 'isImportant');
    }

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        const submittedFormData = new FormData((evt.target as HTMLFormElement));
        const resultLabel = submittedFormData.get('task-label');
        const resultDescription = submittedFormData.get('task-description');
        if(resultLabel === null || typeof resultLabel !== 'string' || resultDescription === null || typeof resultDescription !== 'string') throw new Error('DialogTaskForm - problem with retrieving form values');
        
        // format new task
        const editedTask:Task = { 
                ...(initialTask as Task),
                label: resultLabel, 
                description: (resultDescription !== "") ? resultDescription : undefined,
                isUrgent: formTaskIsUrgent,
                isImportant: formTaskIsImportant
        };

        // commit changes and close
        taskEdit(editedTask);
        clearModal();
    }
</script>

<Dialog open={ isModalActive } on:close={() => clearModal() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle><Pencil size={ 32 } /> Modifier une tâche</DialogTitle>
            <DialogDescription>Mise à jour de la tâche ciblée.</DialogDescription>
        </hgroup>
        {#if !initialTask}
            <p class="empty-state" aria-busy="true">Chargement de la tâche { targetTaskId }</p>
            <menu class="dlg-Container_ActionsMenu">
                <button class="secondary outline" on:click={() => clearModal() }>Annuler</button>
            </menu>
        {:else}
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
                    <button type="submit">Modifier la tâche</button>
                </menu>
            </form>
        {/if}
    </article>
</Dialog> 