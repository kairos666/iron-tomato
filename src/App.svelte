<script lang="ts">
    import { appUIState } from './stores/appUIState';
    import AppHeader from './lib/AppHeader.svelte';
    import DialogReset from './lib/DialogReset.svelte';
    import DialogTaskCreateForm from './lib/DialogTaskCreateForm.svelte';
    import DialogDeleteTask from './lib/DialogDeleteTask.svelte';
    import DoneTasksList from './lib/DoneTasksList.svelte';
    import TodoTasksList from './lib/TodoTasksList.svelte';
    import AdaptativeLayout from './lib/AdaptativeLayout.svelte';
    import { PlusCircle } from 'lucide-svelte';
    import TaskDetailHeader from './lib/TaskDetailHeader.svelte';
    import TaskDetail from './lib/TaskDetail.svelte';
    import ParametersForm from './lib/ParametersBlock/ParametersForm.svelte';
    import StatsDashboardHeader from './lib/StatsDashboardBlock/StatsDashboardHeader.svelte';
    import StatsDashboardMainBlock from './lib/StatsDashboardBlock/StatsDashboardMainBlock.svelte';
    import DialogAddTaskHistoryEntry from './lib/DialogAddTaskHistoryEntry.svelte';
    import DialogModifyTaskHistoryEntry from './lib/DialogModifyTaskHistoryEntry.svelte';

    const { setModal } = appUIState;
</script>

{#if ($appUIState.mainView === 'dashboard' && $appUIState.tasksShown === 'todo')}
    <AdaptativeLayout>
        <AppHeader slot="header" />
        <TodoTasksList />
        <button slot="footer" class="lst-AddTaskBtn" on:click={ () => setModal('task-create') }><PlusCircle /><span class="sr-only">Créer une tâche</span></button>
    </AdaptativeLayout>
{:else if ($appUIState.mainView === 'dashboard' && $appUIState.tasksShown === 'done')}
    <AdaptativeLayout>
        <AppHeader slot="header" />
        <DoneTasksList />
    </AdaptativeLayout>
{:else if ($appUIState.mainView === 'task-detail' && typeof $appUIState.activeTask === 'number')}
    <AdaptativeLayout>
        <TaskDetailHeader slot="header" />
        <TaskDetail taskID={ String($appUIState.activeTask) } />
    </AdaptativeLayout>
{:else if ($appUIState.mainView === 'parameters-settings')}
    <AdaptativeLayout>
        <AppHeader slot="header" />
        <ParametersForm />
    </AdaptativeLayout>
{:else if ($appUIState.mainView === 'stats-dashboard')}
    <AdaptativeLayout>
        <StatsDashboardHeader slot="header" />
        <StatsDashboardMainBlock />
    </AdaptativeLayout>
{:else}
    <p>Oups il y'a eu une erreur!</p>
{/if}
<DialogReset />
<DialogTaskCreateForm />
<DialogDeleteTask />
<DialogAddTaskHistoryEntry />
<DialogModifyTaskHistoryEntry />

<style lang="scss">
    .lst-AddTaskBtn {
        width: calc(100% - 2 * var(--block-spacing-horizontal));
        max-width: 500px;
        height:75%;
        margin-block-end:0;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px solid var(--primary-inverse);
    }
</style>