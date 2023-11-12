<script lang="ts">
    import Task from './lib/Task.svelte';
    import { allTasksList, taskReorder} from './stores/persistentTasks';
    import { appUIState } from './stores/appUIState';
    import { type ComponentEvents } from 'svelte';
    import AppHeader from './lib/AppHeader.svelte';
    import DialogReset from './lib/DialogReset.svelte';
    import TasksList from './lib/TasksList.svelte';
    import DialogTaskCreateForm from './lib/DialogTaskCreateForm.svelte';
    import DialogTaskEditForm from './lib/DialogTaskEditForm.svelte';
    import { PlusCircle } from 'lucide-svelte';

    const { setModal, changeListView } = appUIState;

    // handle actions 
    function handleEditTask(evt:ComponentEvents<Task>['edit']) { setModal(evt.detail) }
    function handleChangeListView(evt:ComponentEvents<AppHeader>['list-view-change']) { changeListView(evt.detail) }
    function handleReorderTask(evt:ComponentEvents<Task>['reorder']) {
        // replicate reordering
        const workTaskArray:{ id:string, order:number }[] = $allTasksList.map(task => ({ id: task.id, order: task.order }));
        const taskToBeMoved:{ id:string, order:number } = workTaskArray.splice(evt.detail.fromIndex, 1)[0];
        workTaskArray.splice(evt.detail.toIndex, 0, taskToBeMoved);

        // reassign order values
        const resultTaskArray = workTaskArray.map((taskPartial, index) => ({ id: taskPartial.id, order: index + 1 }));

        taskReorder(resultTaskArray); 
    }
</script>

<main>
    <AppHeader listView={ $appUIState.listView } on:reset={ () => setModal('reset') } on:list-view-change={ handleChangeListView } />
    <div class="container">
        <TasksList on:reorder={ handleReorderTask }>
            {#if $allTasksList}
                {#each $allTasksList as task (task.id)}
                        <Task data={ task } on:edit={ handleEditTask } />
                    {:else}
                        <p aria-busy="true">Il n'y a pas de tâches</p>
                {/each}
            {:else}
                <p aria-busy="true">Il n'y a pas de tâches</p>
            {/if}
            <button slot="add-task" on:click={ () => setModal('task') }><PlusCircle /><span class="sr-only">Créer une tâche</span></button>
        </TasksList>
    </div>
    <DialogReset />
    <DialogTaskCreateForm />
    <DialogTaskEditForm />
</main>
