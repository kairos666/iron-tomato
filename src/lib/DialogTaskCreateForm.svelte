<script lang="ts">
    import { type BaseTask, taskCreate } from "../stores/persistentTasks";
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { PlusCircle } from "lucide-svelte";
    import { appUIState } from "../stores/appUIState";

    const { clearModal } = appUIState;

    // handle pre filled form if edit instead of creation (if statement ensure re-evaluation between openings)
    let formTaskLabel:string = "";
    let formTaskDescription:string = "";

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
            isUrgent: false,
            isImportant: false,
            isDone: false
        }

        // commit changes and close
        taskCreate(newTask);
        clearModal();
    }
</script>

<Dialog open={ ($appUIState.modal === 'task') } on:close={() => clearModal() }>
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
            <menu class="dlg-Container_ActionsMenu">
                <button type="reset" class="secondary outline" on:click={() => clearModal() }>Annuler</button>
                <button type="submit">Créer la tâche</button>
            </menu>
        </form>
    </article>
</Dialog> 