<script lang="ts">
    import { PartyPopper, PlusCircle } from 'lucide-svelte';
    import { unfinishedTasksList, allTasksList, taskReorder } from '../stores/persistentTasks';
    import { appUIState } from '../stores/appUIState';
    import { onDestroy, afterUpdate } from 'svelte';
    import Sortable from 'sortablejs';
    import Task from './Task.svelte';
    import type { ComponentEvents } from 'svelte';
    
    const { setModal } = appUIState;
    let todosListElt:HTMLElement;

    $: isReady = (appUIState !== undefined && $unfinishedTasksList !== undefined)
    function handleEditTask(evt:ComponentEvents<any>['task-edit']) { setModal(`task-edit-${ evt.detail }`) }
    function handleSeeTask(evt:ComponentEvents<any>['task-detail']) { setModal(`task-detail-${ evt.detail }`) }

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
                if(event.newIndex === undefined || event.oldIndex === undefined) {
                    console.warn(`can't reorder tasks from index: ${ event.oldIndex } to index: ${ event.newIndex }`);
                    return
                };
                
                // replicate reordering
                const workTaskArray:{ id:string, order:number }[] = $allTasksList.map(task => ({ id: task.id, order: task.order }));
                const taskToBeMoved:{ id:string, order:number } = workTaskArray.splice(event.oldIndex, 1)[0];
                workTaskArray.splice(event.newIndex, 0, taskToBeMoved);

                // reassign order values
                const resultTaskArray = workTaskArray.map((taskPartial, index) => ({ id: taskPartial.id, order: index + 1 }));

                taskReorder(resultTaskArray);
            }
        });

        // lifecycle hooks
        afterUpdate(() => {
            // activate/deactivate depending on list size
            const itemsCount:number = todosListElt?.children?.length ?? 0;
            sortable.option('disabled', (itemsCount <= 1));
        });
        onDestroy(() => sortable.destroy());
    }
</script>

{#if !isReady}
    <div role="list">
        <p class="empty-state" aria-busy="true">Chargement des tâches</p>
    </div>
{:else}
    <div use:initDragAndSort bind:this={ todosListElt } role="list">
        {#each $unfinishedTasksList as task (task.id)}
            <Task data={ task } on:task-edit={ handleEditTask } on:task-detail={ handleSeeTask } />
        {:else}
            <p class="empty-state"><PartyPopper /> Aucune tâche à faire dans la liste</p>
        {/each}
    </div>
    <button on:click={ () => setModal('task-create') }><PlusCircle /><span class="sr-only">Créer une tâche</span></button>
{/if}