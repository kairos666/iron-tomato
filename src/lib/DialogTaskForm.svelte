<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { tasksStore, type Task } from "../stores/tasks";
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";

    export let open:boolean;
    export let initialTask:Task|undefined = undefined;

    // handle pre filled form if edit instead of creation (if statement ensure re-evaluation between openings)
    let formTask:{ label:string, description:string };
    $: if(open) formTask = { 
        label: initialTask?.label ?? "",
        description: initialTask?.description ?? ""
    }

    const dispatch = createEventDispatcher();
    function dispatchClose() {
        dispatch('close');
    }

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();

        // format new/edited task
        const timestamp = new Date().getTime();
        const resultTask:Task = {
            id: initialTask?.id ?? String(Math.round(timestamp / (Math.random() * 10000000))),
            label: formTask.label,
            description: (formTask.description !== "") ? formTask.description : undefined, 
            isActive: initialTask?.isActive ?? false,
            isUrgent: initialTask?.isActive ?? false,
            isImportant: initialTask?.isActive ?? false,
            isDone: initialTask?.isActive ?? false,
            dateCreated : initialTask?.dateCreated ?? timestamp,
            dateDone: initialTask?.dateDone ?? undefined
        }
        
        // commit task
        tasksStore.createTask(resultTask);
        dispatchClose();
    }
</script>

<Dialog open={ open } on:close={() => dispatchClose() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle>Créer une tâche</DialogTitle>
            <DialogDescription>Définir et ajouter une nouvelle tâche à la liste.</DialogDescription>
        </hgroup>
        <form on:submit={ onSubmit }>
            <label for="task-label">Libellé</label>
            <input type="text" id="task-label" name="task-label" placeholder="Intitulé de la tâche" bind:value={ formTask.label } required />
            <label for="task-description">Description</label>
            <textarea id="task-description" name="task-description" placeholder="Descriptif détaillé optionnel de la tâche" bind:value={ (formTask.description) } />
            <menu class="dlg-Container_ActionsMenu">
                <button type="reset" class="secondary outline" on:click={() => dispatchClose() }>Annuler</button>
                <button type="submit">Créer</button>
            </menu>
        </form>
    </article>
</Dialog> 