<script lang="ts">
    import svelteLogo from './assets/svelte.svg';
    import appLogo from '/tomacco-logo.png';
    import Task from './lib/Task.svelte';
    import { mockTask, tasksStore } from './stores/tasks';
    import type { Task as TaskType } from './stores/tasks';
    import { onDestroy, afterUpdate } from 'svelte';
    import Sortable from 'sortablejs';
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";

    let tasksArray:TaskType[] = [];
    let activeModal:undefined|'reset' = undefined;
    const unsubscribeTasksStore = tasksStore.subscribe(tasks => tasksArray = tasks);
    onDestroy(unsubscribeTasksStore);

    // handle todos list actions 
    function handleCreateTask() {
        tasksStore.createTask(mockTask());
    }
    function handleResetAllTasks() {
        activeModal = 'reset';
    }

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
    <nav>
        <h1>Iron tomato</h1>
        <div>
            <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
                <img src={appLogo} class="logo" alt="Tomacco Logo" />
            </a>
            <a href="https://svelte.dev" target="_blank" rel="noreferrer">
                <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
            </a>
        </div>
    </nav>
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
    <Dialog open={ (activeModal === "reset") } on:close={() => { activeModal = undefined }}>
        <DialogOverlay class="dlg-Overlay" />
        <article class="dlg-Container">
            <DialogTitle>Remise à zéro des tâches</DialogTitle>
            <DialogDescription>Si vous confirmez l'action, toutes les tâches seront définitivement effacées de la liste.</DialogDescription>
            <menu class="dlg-Container_ActionsMenu">
                <button class="secondary outline" on:click={() => { activeModal = undefined }}>Annuler</button>
                <button on:click={() => { activeModal = undefined; tasksStore.reset() }}>Reset</button>
            </menu>
        </article>
    </Dialog> 
</main>

<style lang="scss">
    .logo {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }
    .logo:hover {
        filter: drop-shadow(0 0 2em #646cffaa);
    }

    .lst-ActionMenu {
        display:flex;
        gap: var(--spacing);
    }
</style>
