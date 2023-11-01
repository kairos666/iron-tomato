<script lang="ts">
    import type { Task } from "../stores/tasks";
    import { tasksStore } from '../stores/tasks';

    export let data:Task;

    // deduce available actions based on data
    $: isAchieveEnabled = !data.isDone;
    $: isReopenEnabled = data.isDone;
    $: isDeleteEnabled = !data.isDone;
    $: isModifyEnabled = !data.isDone;

    function handleAchieve() { tasksStore.achieveTask(data.id) }
    function handleReopen() { tasksStore.reopenTask(data.id) }
    function handleDelete() { tasksStore.deleteTask(data.id) }
    function handleModify() { tasksStore.editTask({ ...data, description: (data.description === undefined) ? "EDITED" : `${ data.description } EDITED` }) }
</script>

<article class="tsk-Card" role="listitem" data-id={ data.id }>
    <span draggable="true" aria-labelledby="poignée de la tâche" class="sortable-handle"></span>
    <h2>{ data.label }</h2>
    {#if data.description}
        <p>{ data.description }</p>
    {/if}
    <menu class="tsk-Card_Menu">
        {#if isAchieveEnabled} <button on:click={ handleAchieve }>Achever</button> {/if}
        {#if isReopenEnabled} <button on:click={ handleReopen } class="secondary outline">Rouvrir</button> {/if}
        {#if isModifyEnabled} <button on:click={ handleModify } class="secondary outline">Modifier</button> {/if}
        {#if isDeleteEnabled} <button on:click={ handleDelete } class="contrast outline">Supprimer</button> {/if}
    </menu>
</article>

<style lang="scss">
    .tsk-Card {
        display: grid;
        grid-template-columns: 1fr 14fr 5fr;
        grid-template-rows: auto;
        grid-template-areas:
            "handle title actions";
        gap: var(--spacing);
        padding: var(--spacing);
    }
    .tsk-Card:has(p) {
        grid-template-rows: auto auto;
        grid-template-areas:
            "handle title actions"
            "handle description actions";
    }

    .sortable-handle { 
        grid-area: handle; 
        align-self: center;
        display:block;
        width: 40px;
        background-image: repeating-linear-gradient(
            0deg,
            var(--contrast-focus),
            var(--contrast-focus) 4px,
            transparent 4px,
            transparent 18px
        );
        aspect-ratio: 1;
        background-position: center;
    }
    h2 { grid-area: title; margin-block-end:0; }
    p { grid-area: description; margin-block-end:0; }

    .tsk-Card_Menu {
        grid-area: actions;
        align-self: center;
        margin:0;
        padding:0;
        display: flex;
        gap: var(--spacing);

        button { margin-block-end:0; }
    }
</style>