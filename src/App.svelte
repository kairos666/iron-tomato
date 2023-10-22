<script lang="ts">
    import svelteLogo from './assets/svelte.svg';
    import appLogo from '/tomacco-logo.png';
    import Task from './lib/Task.svelte';
    import { tasksStore } from './stores/tasks';
    import type { Task as TaskType } from './stores/tasks';
    import { onDestroy } from 'svelte';

    let tasksArray:TaskType[] = [];
    const unsubscribeTasksStore = tasksStore.subscribe(tasks => tasksArray = tasks);

    onDestroy(unsubscribeTasksStore);
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
        <header>
            <button>Créer une tâche</button>
        </header>
        {#each tasksArray as task}
            <Task data={ task } />
        {:else}
            <p aria-busy="true">Il n'y a pas de tâches</p>
        {/each}
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
</style>
