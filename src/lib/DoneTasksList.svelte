<script lang="ts">
    import { Inbox } from 'lucide-svelte';
    import { doneTasksList } from '../stores/persistentTasks';
    import Task from './Task.svelte';

    $: isReady = ($doneTasksList !== undefined)
</script>

<div role="list">
    {#if !isReady}
        <p class="empty-state" aria-busy="true">Chargement des tâches terminées</p>
    {:else}
        {#each $doneTasksList as task (task.id)}
            <Task data={ task } />
        {:else}
            <p class="empty-state"><Inbox /> Liste des tâches terminées vide</p>
        {/each}
    {/if}
</div>