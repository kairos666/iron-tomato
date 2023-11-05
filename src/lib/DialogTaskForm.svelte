<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { mockTask, tasksStore, type Task } from "../stores/tasks";
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";

    export let open:boolean;
    export let initialTask:Task|undefined = undefined;

    const dispatch = createEventDispatcher();
    function dispatchClose() {
        dispatch('close');
    }
</script>

<Dialog open={ open } on:close={() => dispatchClose() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle>Créer une tâche</DialogTitle>
            <DialogDescription>Définir et ajouter une nouvelle tâche à la liste.</DialogDescription>
        </hgroup>
        <form>
            <label for="label">Libellé</label>
            <input type="text" id="label" name="label" placeholder="Intitulé de la tâche" value={ initialTask?.label ?? '' } required />
            <label for="description">Description</label>
            <textarea id="description" name="description" placeholder="Descriptif détaillé optionnel de la tâche" value={ initialTask?.description ?? '' } />
        </form>
        <menu class="dlg-Container_ActionsMenu">
            <button class="secondary outline" on:click={() => dispatchClose() }>Annuler</button>
            <button on:click={() => { tasksStore.createTask(mockTask()); dispatchClose() }}>Créer</button>
        </menu>
    </article>
</Dialog> 