<script lang="ts">
    import { Inbox } from 'lucide-svelte';
    import { doneTasksList } from '../stores/persistentTasks';
    import DoneTask from './DoneTask.svelte';

    $: isReady = ($doneTasksList !== undefined)
</script>

<div role="list">
    {#if !isReady}
        <p class="empty-state-emphasized" aria-busy="true">Chargement des tâches terminées</p>
    {:else}
        {#each $doneTasksList as task (task.id)}
            <DoneTask data={ task } />
        {:else}
            <p class="empty-state-emphasized"><Inbox /> Liste des tâches terminées vide</p>
        {/each}
    {/if}
</div>