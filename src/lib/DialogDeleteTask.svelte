<script lang="ts">
    import { taskDelete } from "../stores/persistentTasks";
    import { appUIState } from '../stores/appUIState';
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { Eraser } from "lucide-svelte";

    const { clearModal, changeMainView } = appUIState;
    function deleteTask(taskID:string|null) {
        if(taskID === null) return;
        taskDelete(taskID).then(() => changeMainView('dashboard')); 
        clearModal();
    }
    $: isModalActive = (typeof $appUIState.modal === 'string' && $appUIState.modal.startsWith('task-delete'));
    $: targetTaskId = (isModalActive) 
        ? $appUIState.modal?.replace('task-delete-', '') ?? null 
        : null;
</script>

<Dialog open={ isModalActive } on:close={() => clearModal() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle><Eraser size="32" /> Supprimer la tâche</DialogTitle>
            <DialogDescription>Si vous confirmez l'action, la tâche sera définitivement effacée.</DialogDescription>
        </hgroup>
        <menu class="dlg-Container_ActionsMenu">
            <button class="secondary outline" on:click={() => clearModal() }>Annuler</button>
            <button on:click={() => { deleteTask(targetTaskId) }}>Supprimer la tâche</button>
        </menu>
    </article>
</Dialog>