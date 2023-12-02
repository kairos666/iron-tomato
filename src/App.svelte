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
    import AdaptativeLayout from './lib/AdaptativeLayout.svelte';
    import { PlusCircle } from 'lucide-svelte';

    const { setModal, changeTasksShown } = appUIState;

    // handle actions 
    function handleChangeListView(evt:ComponentEvents<AppHeader>['tasks-shown-change']) { changeTasksShown(evt.detail) }
</script>

<AdaptativeLayout>
    <AppHeader slot="header" tasksShown={ $appUIState.tasksShown } on:reset={ () => setModal('reset') } on:reset-done={ () => tasksDoneReset() } on:tasks-shown-change={ handleChangeListView } />
    {#if ($appUIState.tasksShown === 'todo')}
        <TasksViewModeSelect />
        <TodoTasksList />
    {:else if ($appUIState.tasksShown === 'done')}
        <DoneTasksList />
    {/if}
    <button slot="footer" class="lst-AddTaskBtn" on:click={ () => setModal('task-create') }><PlusCircle /><span class="sr-only">Créer une tâche</span></button>
</AdaptativeLayout>
<DialogReset />
<DialogTaskCreateForm />
<DialogTaskEditForm />
<DialogTaskDetail />

<style lang="scss">
    .lst-AddTaskBtn {
        width: calc(100% - 2 * var(--block-spacing-horizontal));
        max-width: 500px;
        height:75%;
        margin-block-end:0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>