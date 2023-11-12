<script lang="ts">
    import { type Task, taskEdit } from "../stores/persistentTasks";
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { Pencil } from "lucide-svelte";
    import { appUIState } from "../stores/appUIState";

    const { clearModal } = appUIState;
    $: isOpen = (typeof $appUIState.modal === 'object' && $appUIState.modal !== undefined);

    // handle pre filled form if edit instead of creation (if statement ensure re-evaluation between openings)
    let formTaskLabel:string = "";
    let formTaskDescription:string = "";
    $: if(isOpen) formTaskLabel = ($appUIState.modal as Task)?.label ?? "";
    $: if(isOpen) formTaskDescription = ($appUIState.modal as Task)?.description ?? "";

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        const submittedFormData = new FormData((evt.target as HTMLFormElement));
        const resultLabel = submittedFormData.get('task-label');
        const resultDescription = submittedFormData.get('task-description');
        if(resultLabel === null || typeof resultLabel !== 'string' || resultDescription === null || typeof resultDescription !== 'string') throw new Error('DialogTaskForm - problem with retrieving form values');
        
        // format new task
        const editedTask:Task = { 
                ...($appUIState.modal as Task),
                label: resultLabel, 
                description: (resultDescription !== "") ? resultDescription : undefined 
        };

        // commit changes and close
        taskEdit(editedTask);
        clearModal();
    }
</script>

<Dialog open={ isOpen } on:close={() => clearModal() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle><Pencil size={ 32 } /> Modifier une tâche</DialogTitle>
            <DialogDescription>Mise à jour de la tâche ciblée.</DialogDescription>
        </hgroup>
        <form on:submit={ onSubmit }>
            <label for="task-label">Libellé</label>
            <input type="text" id="task-label" name="task-label" placeholder="Intitulé de la tâche" value={ formTaskLabel } required />
            <label for="task-description">Description</label>
            <textarea id="task-description" name="task-description" placeholder="Descriptif détaillé optionnel de la tâche" value={ formTaskDescription } />
            <menu class="dlg-Container_ActionsMenu">
                <button type="reset" class="secondary outline" on:click={() => clearModal() }>Annuler</button>
                <button type="submit">Modifier la tâche</button>
            </menu>
        </form>
    </article>
</Dialog> 