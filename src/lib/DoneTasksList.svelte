<script lang="ts">
    import { Inbox } from 'lucide-svelte';
    import { doneTasksList } from '../stores/persistentTasks';
    import { appUIState } from '../stores/appUIState';
    import Task from './Task.svelte';
    import type { ComponentEvents } from 'svelte';
    const { setModal } = appUIState;

    $: isReady = (appUIState !== undefined && $doneTasksList !== undefined)
    function handleForbiddenAction() { console.warn(`shouldn't be able to perform this action`) }
    function handleSeeTask(evt:ComponentEvents<any>['task-detail']) { setModal(`task-detail-${ evt.detail }`) }
</script>

<div role="list">
    {#if !isReady}
        <p class="empty-state" aria-busy="true">Chargement des tâches terminées</p>
    {:else}
        {#each $doneTasksList as task (task.id)}
            <Task data={ task } on:task-edit={ handleForbiddenAction } on:task-detail={ handleSeeTask } />
        {:else}
            <p class="empty-state"><Inbox /> Liste des tâches terminées vide</p>
        {/each}
    {/if}
</div>