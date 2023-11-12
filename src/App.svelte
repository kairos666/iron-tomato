<script lang="ts">
    import Task from './lib/Task.svelte';
    import { allTasksList, taskReorder, type Task as TaskType } from './stores/persistentTasks';
    import { appUIState } from './stores/appUIState';
    import { type ComponentEvents } from 'svelte';
    import AppHeader from './lib/AppHeader.svelte';
    import DialogTaskForm from './lib/DialogTaskForm.svelte';
    import DialogReset from './lib/DialogReset.svelte';
    import TasksList from './lib/TasksList.svelte';

    let activeModal:undefined|'reset'|'task'|TaskType = undefined; // no modal, reset, new task, edit task

    // handle actions 
    function handleCreateTask() { activeModal = 'task'; }
    function handleResetAllTasks() { activeModal = 'reset'; }
    function handleEditTask(evt:ComponentEvents<Task>['edit']) { activeModal = evt.detail; }
    function handleChangeListView(evt:ComponentEvents<any>['list-view-change']) { appUIState.changeListView(evt.detail) }
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
    <AppHeader listView={ $appUIState.listView } on:reset={ handleResetAllTasks } on:list-view-change={ handleChangeListView } />
    <div class="container">
        <TasksList on:reorder={ handleReorderTask } on:create-task={ handleCreateTask }>
            {#if $allTasksList}
                {#each $allTasksList as task (task.id)}
                        <Task data={ task } on:edit={ handleEditTask } />
                    {:else}
                        <p aria-busy="true">Il n'y a pas de tâches</p>
                {/each}
            {:else}
                <p aria-busy="true">Il n'y a pas de tâches</p>
            {/if}
        </TasksList>
    </div>
    <DialogReset open={ (activeModal === "reset") } on:close={() => { activeModal = undefined }} />
    <DialogTaskForm 
        open={ (activeModal === "task" || typeof activeModal === "object") } 
        initialTask={ (activeModal !== "reset" && activeModal !== "task") ? activeModal : undefined } 
        on:close={() => { activeModal = undefined }} 
    />
</main>
