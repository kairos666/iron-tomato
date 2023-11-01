<script lang="ts">
    import svelteLogo from './assets/svelte.svg';
    import appLogo from '/tomacco-logo.png';
    import Task from './lib/Task.svelte';
    import { mockTask, tasksStore } from './stores/tasks';
    import type { Task as TaskType } from './stores/tasks';
    import { onDestroy } from 'svelte';
    import Sortable from 'sortablejs';

    let tasksArray:TaskType[] = [];
    const unsubscribeTasksStore = tasksStore.subscribe(tasks => tasksArray = tasks);
    onDestroy(unsubscribeTasksStore);

    // handle todos list actions 
    function handleCreateTask() {
        tasksStore.createTask(mockTask());
    }
    function handleResetAllTasks() {
        tasksStore.reset();
    }

    // DRAG N DROP handling
    function initDragAndSort(todosList:HTMLElement) {
        const sortable = new Sortable(todosList, {
            group: "todos-list",
            onEnd(event) {
                if(event.newIndex === undefined || event.oldIndex === undefined) return;
                tasksStore.changeTaskOrder(event.oldIndex, event.newIndex)
            }
        });
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
        <p>Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!</p>
        <p class="read-the-docs">Click on the Vite and Svelte logos to learn more</p>
    </div>
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
