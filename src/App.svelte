<script lang="ts">
    import { tasksDoneReset } from './stores/persistentTasks';
    import { appUIState } from './stores/appUIState';
    import { type ComponentEvents } from 'svelte';
    import AppHeader from './lib/AppHeader.svelte';
    import DialogReset from './lib/DialogReset.svelte';
    import DialogTaskCreateForm from './lib/DialogTaskCreateForm.svelte';
    import DialogTaskEditForm from './lib/DialogTaskEditForm.svelte';
    import DialogTaskDetail from './lib/DialogTaskDetail.svelte';
    import TasksViewModeSelect from './lib/TasksViewModeSelect.svelte';
    import DoneTasksList from './lib/DoneTasksList.svelte';
    import TodoTasksList from './lib/TodoTasksList.svelte';

    const { setModal, changeTasksShown } = appUIState;

    // handle actions 
    function handleChangeListView(evt:ComponentEvents<AppHeader>['tasks-shown-change']) { changeTasksShown(evt.detail) }
</script>

<main>
    <AppHeader tasksShown={ $appUIState.tasksShown } on:reset={ () => setModal('reset') } on:reset-done={ () => tasksDoneReset() } on:tasks-shown-change={ handleChangeListView } />
    <div class="container">
        {#if ($appUIState.tasksShown === 'todo')}
            <TasksViewModeSelect />
            <TodoTasksList />
        {:else if ($appUIState.tasksShown === 'done')}
            <DoneTasksList />
        {/if}
    </div>
    <DialogReset />
    <DialogTaskCreateForm />
    <DialogTaskEditForm />
    <DialogTaskDetail />
</main>