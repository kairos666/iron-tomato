<script lang="ts">
    import { taskCategories } from '../constants/task-categories';
    import { appUIState } from '../stores/appUIState';
    import { taskById, type Task } from '../stores/persistentTasks';
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { Eye } from "lucide-svelte";
    import TaskCategoryIcon from './TaskCategoryIcon.svelte';
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
    $: currentCategory = taskCategories.find(cat => cat.id === targetTask?.category) ?? null;
</script>

<Dialog open={ isModalActive } on:close={() => clearModal() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle>
                {#if currentCategory}
                    <TaskCategoryIcon name={ currentCategory.icon } stroke-width="1" size="32" color={ currentCategory.color } /> { targetTask?.label }
                {:else}
                    <Eye size={ 32 } /> { targetTask?.label }
                {/if}
            </DialogTitle>
            <DialogDescription></DialogDescription>
        </hgroup>
        <p>{ targetTask?.description }</p>
        <menu class="dlg-Container_ActionsMenu">
            <button on:click={() => { clearModal() }}>Ok</button>
        </menu>
    </article>
</Dialog>