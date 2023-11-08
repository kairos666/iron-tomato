<script lang="ts">
    import Task from './lib/Task.svelte';
    import { allTasksList, taskReorder, type Task as TaskType } from './stores/persistentTasks';
    import { type ComponentEvents } from 'svelte';
    import AppHeader from './lib/AppHeader.svelte';
    import DialogTaskForm from './lib/DialogTaskForm.svelte';
    import DialogReset from './lib/DialogReset.svelte';
    import TasksList from './lib/TasksList.svelte';
    import { CircleOff, PlusCircle } from 'lucide-svelte';

    let activeModal:undefined|'reset'|'task'|TaskType = undefined; // no modal, reset, new task, edit task

    // handle todos list actions 
    function handleCreateTask() { activeModal = 'task'; }
    function handleResetAllTasks() { activeModal = 'reset'; }
    function handleEditTask(evt:ComponentEvents<Task>['edit']) { activeModal = evt.detail; }
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
    <AppHeader />
    <div class="container">
        <header class="lst-ActionMenu">
            <button on:click={ handleCreateTask }><PlusCircle /><sapn class="sr-only">Créer une tâche</sapn></button>
            <button class="secondary outline" on:click={ handleResetAllTasks }><CircleOff /><span class="sr-only">Remise à zéro de la liste</span></button>
        </header>
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
        </TasksList>
    </div>
    <DialogReset open={ (activeModal === "reset") } on:close={() => { activeModal = undefined }} />
    <DialogTaskForm 
        open={ (activeModal === "task" || typeof activeModal === "object") } 
        initialTask={ (activeModal !== "reset" && activeModal !== "task") ? activeModal : undefined } 
        on:close={() => { activeModal = undefined }} 
    />
</main>

<style lang="scss">
    .lst-ActionMenu {
        display:flex;
        gap: var(--spacing);
    }
</style>
