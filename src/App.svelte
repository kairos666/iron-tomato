<script lang="ts">
    import Task from './lib/Task.svelte';
    import { tasksStore } from './stores/tasks';
    import type { Task as TaskType } from './stores/tasks';
    import { onDestroy, afterUpdate } from 'svelte';
    import Sortable from 'sortablejs';
    import AppHeader from './lib/AppHeader.svelte';
    import DialogTaskForm from './lib/DialogTaskForm.svelte';
    import DialogReset from './lib/DialogReset.svelte';

    let tasksArray:TaskType[] = [];
    let activeModal:undefined|'reset'|'task' = undefined;
    const unsubscribeTasksStore = tasksStore.subscribe(tasks => tasksArray = tasks);
    onDestroy(unsubscribeTasksStore);

    // handle todos list actions 
    function handleCreateTask() { activeModal = 'task'; }
    function handleResetAllTasks() { activeModal = 'reset'; }

    // DRAG N DROP handling
    function initDragAndSort(todosList:HTMLElement) {
        // run once on mount
        const sortable = new Sortable(todosList, {
            group: "todos-list",
            chosenClass: "sortable-chosen",
            handle: ".sortable-handle",
            swap: true,
            animation: 200,
            onEnd(event) {
                if(event.newIndex === undefined || event.oldIndex === undefined) return;
                tasksStore.changeTaskOrder(event.oldIndex, event.newIndex)
            }
        });

        // lifecycle hooks
        afterUpdate(() => {
            // activate/deactivate depending on list size
            sortable.option('disabled', (tasksArray.length <= 1));
        });
        onDestroy(() => sortable.destroy());
    }
</script>

<main>
    <AppHeader />
    <div class="container">
        <header class="lst-ActionMenu">
            <button on:click={ handleCreateTask }>Créer une tâche</button>
            <button class="secondary outline" on:click={ handleResetAllTasks }>Reset</button>
        </header>
        <div use:initDragAndSort role="list">
            {#each tasksArray as task (task.id)}
                <Task data={ task } />
            {:else}
                <p aria-busy="true">Il n'y a pas de tâches</p>
            {/each}
        </div>
    </div>
    <DialogReset open={ (activeModal === "reset") } on:close={() => { activeModal = undefined }} />
    <DialogTaskForm open={ (activeModal === "task") } on:close={() => { activeModal = undefined }} />
</main>

<style lang="scss">
    .lst-ActionMenu {
        display:flex;
        gap: var(--spacing);
    }
</style>
