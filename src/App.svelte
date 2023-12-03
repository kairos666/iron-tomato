<script lang="ts">
    import { appUIState } from './stores/appUIState';
    import AppHeader from './lib/AppHeader.svelte';
    import DialogReset from './lib/DialogReset.svelte';
    import DialogTaskCreateForm from './lib/DialogTaskCreateForm.svelte';
    import DialogTaskEditForm from './lib/DialogTaskEditForm.svelte';
    import DialogTaskDetail from './lib/DialogTaskDetail.svelte';
    import DoneTasksList from './lib/DoneTasksList.svelte';
    import TodoTasksList from './lib/TodoTasksList.svelte';
    import AdaptativeLayout from './lib/AdaptativeLayout.svelte';
    import { PlusCircle } from 'lucide-svelte';

    const { setModal } = appUIState;
</script>

{#if ($appUIState.tasksShown === 'todo')}
    <AdaptativeLayout>
        <AppHeader slot="header" />
        <TodoTasksList />
        <button slot="footer" class="lst-AddTaskBtn" on:click={ () => setModal('task-create') }><PlusCircle /><span class="sr-only">Créer une tâche</span></button>
    </AdaptativeLayout>
{:else if ($appUIState.tasksShown === 'done')}
    <AdaptativeLayout>
        <AppHeader slot="header" />
        <DoneTasksList />
    </AdaptativeLayout>
{/if}
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