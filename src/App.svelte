<script lang="ts">
    import Task from './lib/Task.svelte';
    import { allTasksList, doneTasksList, unfinishedTasksList, taskReorder} from './stores/persistentTasks';
    import { appUIState } from './stores/appUIState';
    import { type ComponentEvents } from 'svelte';
    import AppHeader from './lib/AppHeader.svelte';
    import DialogReset from './lib/DialogReset.svelte';
    import TasksList from './lib/TasksList.svelte';
    import DialogTaskCreateForm from './lib/DialogTaskCreateForm.svelte';
    import DialogTaskEditForm from './lib/DialogTaskEditForm.svelte';
    import { Inbox, PartyPopper, PlusCircle } from 'lucide-svelte';
    import DialogTaskDetail from './lib/DialogTaskDetail.svelte';

    const { setModal, changeListView } = appUIState;
    $: isReady = (appUIState !== undefined && $doneTasksList !== undefined && $unfinishedTasksList !== undefined)

    // handle actions 
    function handleSeeTask(evt:ComponentEvents<any>['task-detail']) { setModal(`task-detail-${ evt.detail }`) }
    function handleEditTask(evt:ComponentEvents<any>['task-edit']) { setModal(`task-edit-${ evt.detail }`) }
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
        {#if !isReady}
            <p class="empty-state" aria-busy="true">Chargement des tâches</p>
        {:else if ($appUIState.listView === 'todo')}
            <TasksList on:reorder={ handleReorderTask }>
                {#each $unfinishedTasksList as task (task.id)}
                    <Task data={ task } on:task-edit={ handleEditTask } on:task-detail={ handleSeeTask } />
                {:else}
                    <p class="empty-state"><PartyPopper /> Aucune tâche à faire dans la liste</p>
                {/each}
                <button slot="add-task" on:click={ () => setModal('task-create') }><PlusCircle /><span class="sr-only">Créer une tâche</span></button>
            </TasksList>
        {:else if ($appUIState.listView === 'done')}
            <TasksList on:reorder={ handleReorderTask }>
                {#each $doneTasksList as task (task.id)}
                    <Task data={ task } on:task-edit={ handleEditTask } on:task-detail={ handleSeeTask } />
                {:else}
                    <p class="empty-state"><Inbox /> Liste des tâches terminées vide</p>
                {/each}
            </TasksList>
        {/if}
    </div>
    <DialogReset />
    <DialogTaskCreateForm />
    <DialogTaskEditForm />
    <DialogTaskDetail />
</main>