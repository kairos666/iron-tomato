<script lang="ts">
    import { appUIState } from '../stores/appUIState';
    import { taskById, type Task } from '../stores/persistentTasks';
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { Eye } from "lucide-svelte";
    const { clearModal } = appUIState;
    let targetTask:Task|undefined = undefined;

    $: isModalActive = (typeof $appUIState.modal === 'string' && $appUIState.modal.startsWith('task-detail'));
    $: targetTaskId = (isModalActive) 
        ? $appUIState.modal?.replace('task-detail-', '') ?? null 
        : null;
    $: if(isModalActive && targetTaskId !== null) {
        taskById(targetTaskId).then(task => { targetTask = task });
    } else {
        targetTask = undefined;
    }
</script>

<Dialog open={ isModalActive } on:close={() => clearModal() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle><Eye size={ 32 } /> { targetTask?.label }</DialogTitle>
            <DialogDescription></DialogDescription>
        </hgroup>
        <p>{ targetTask?.description }</p>
        <menu class="dlg-Container_ActionsMenu">
            <button on:click={() => { clearModal() }}>Ok</button>
        </menu>
    </article>
</Dialog>