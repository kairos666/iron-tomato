<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { tasksStore, type Task } from "../stores/tasks";
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { Pencil, PlusCircle } from "lucide-svelte";

    export let open:boolean;
    export let initialTask:Task|undefined = undefined;
    $: isEdit = !!initialTask;

    // handle pre filled form if edit instead of creation (if statement ensure re-evaluation between openings)
    let formTaskLabel:string = "";
    let formTaskDescription:string = "";
    $: if(open) formTaskLabel = initialTask?.label ?? "";
    $: if(open) formTaskDescription = initialTask?.description ?? "";

    const dispatch = createEventDispatcher();
    function dispatchClose() {
        dispatch('close');
    }

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        const submittedFormData = new FormData((evt.target as HTMLFormElement));
        const resultLabel = submittedFormData.get('task-label');
        const resultDescription = submittedFormData.get('task-description');
        if(resultLabel === null || typeof resultLabel !== 'string' || resultDescription === null || typeof resultDescription !== 'string') throw new Error('DialogTaskForm - problem with retrieving retrieve form values');

        // format new/edited task
        const timestamp = new Date().getTime();
        const resultTask:Task = {
            id: initialTask?.id ?? String(Math.round(timestamp / (Math.random() * 10000000))),
            label: resultLabel,
            description: (resultDescription !== "") ? resultDescription : undefined, 
            isActive: initialTask?.isActive ?? false,
            isUrgent: initialTask?.isActive ?? false,
            isImportant: initialTask?.isActive ?? false,
            isDone: initialTask?.isActive ?? false,
            dateCreated : initialTask?.dateCreated ?? timestamp,
            dateDone: initialTask?.dateDone ?? undefined
        }
        
        // commit task
        if(!initialTask) {
            tasksStore.createTask(resultTask);
        } else {
            tasksStore.editTask(resultTask);
        }
        dispatchClose();
    }
</script>

<Dialog open={ open } on:close={() => dispatchClose() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        {#if isEdit}
            <hgroup>
                <DialogTitle><Pencil size={ 32 } /> Modifier une tâche</DialogTitle>
                <DialogDescription>Mise à jour de la tâche ciblée.</DialogDescription>
            </hgroup>
        {:else}
            <hgroup>
                <DialogTitle><PlusCircle size={ 32 } /> Créer une tâche</DialogTitle>
                <DialogDescription>Définir et ajouter une nouvelle tâche à la liste.</DialogDescription>
            </hgroup>
        {/if}
        <form on:submit={ onSubmit }>
            <label for="task-label">Libellé</label>
            <input type="text" id="task-label" name="task-label" placeholder="Intitulé de la tâche" value={ formTaskLabel } required />
            <label for="task-description">Description</label>
            <textarea id="task-description" name="task-description" placeholder="Descriptif détaillé optionnel de la tâche" value={ formTaskDescription } />
            <menu class="dlg-Container_ActionsMenu">
                <button type="reset" class="secondary outline" on:click={() => dispatchClose() }>Annuler</button>
                <button type="submit">{#if isEdit}Modifier la tâche{:else}Créer la tâche{/if}</button>
            </menu>
        </form>
    </article>
</Dialog> 