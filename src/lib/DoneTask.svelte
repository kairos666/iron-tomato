<script lang="ts">
    import { taskReopen, taskDelete, type Task } from '../stores/persistentTasks';
    import { appUIState } from '../stores/appUIState';
    import { Eraser, Eye, Undo2 } from "lucide-svelte";

    export let data:Task;
    const { setModal } = appUIState;

    // deduce available actions based on data
    $: hasDescription = !!data.description;

    function handleDetail() { setModal(`task-detail-${ parseInt(data.id) }`) }
    function handleReopen() { taskReopen(data.id) }
    function handleDelete() { taskDelete(data.id) }
</script>

<article class="tsk-Card tsk-Card-isDone" class:tsk-Card-isUrgent={ data.isUrgent } class:tsk-Card-isImportant={ data.isImportant } role="listitem" data-id={ data.id }>
    <h2 draggable="true" aria-labelledby="poignée de la tâche" class="sortable-handle">{ data.label }</h2>
    <div class="tsk-Card_Factors">
        {#if data.isImportant}<span class="tsk-Card_FactorsImportantBadge">Important</span>{/if}
        {#if data.isUrgent}<span class="tsk-Card_FactorsUrgentBadge">Urgent</span>{/if}
    </div>
    <menu class="tsk-Card_Menu">
        {#if hasDescription} <button on:click={ handleDetail } class="tsk-Btn" data-tooltip="Voir description" data-placement="left"><Eye size={ 26 } color="var(--icon-color)"/><span class="sr-only">Voir description</span></button> {/if}
        <button on:click={ handleReopen } class="tsk-Btn" data-tooltip="Rouvrir" data-placement="left"><Undo2 size={ 26 } color="var(--icon-color)"/><span class="sr-only">Rouvrir</span></button>
        <button on:click={ handleDelete } class="tsk-Btn" data-tooltip="Supprimer" data-placement="left"><Eraser size={ 26 } color="var(--icon-color)"/><span class="sr-only">Supprimer</span></button>
    </menu>
</article>

<style lang="scss">
    .tsk-Card {
        --category-border-offset: 3px;
        --card-box-shadow: 0px 30px 15px -30px rgba(27,40,50, 0.8);

        @media (min-width: 576px) {
            --task-spacing: 0.75rem;
            --task-font-size: 1rem;
        }

        display: grid;
        grid-template-columns: auto 1fr auto auto;
        grid-template-rows: auto;
        grid-template-areas:
            "done title factors actions";
        align-items: center;
        margin-block: var(--task-spacing);
        padding: var(--task-spacing);
        gap: var(--task-spacing);
        position:relative;
        z-index: 1;

        &.tsk-Card-isDone {
            background-color: transparent;
            &::before {
                content: '';
                position: absolute;
                inset: 0;
                background-color: var(--ins-color);
                border-radius: var(--border-radius);
                z-index: -2;
            }
            &::after {
                content: '';
                position: absolute;
                inset: var(--category-border-offset);
                background-color: var(--background-color);
                border-radius: var(--border-radius);
                z-index: -1;
            }
        }
    }

    .tsk-Btn {
        display: inline-block;
        width: auto;
        background: none;
        border:none;
        padding:0;
        margin:0;
        grid-area: done;
        --icon-color: var(--muted-border-color);
        .tsk-Card:hover & { --icon-color: var(--secondary); }
        &:hover, &:focus, &:active { --icon-color: var(--primary); box-shadow:none; }
    }
    h2 { 
        grid-area: title; 
        margin-block-end:0; 
        font-size: var(--task-font-size);
        line-height: 32px;
        font-weight:500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor:grab;
    }

    .tsk-Card_Menu {
        grid-area: actions;
        align-self: center;
        margin:0;
        padding:0;
        display: flex;
        justify-content: flex-end;
        gap: var(--task-spacing);
    }

    .tsk-Card_Factors {
        grid-area: factors;
        display:flex;
        gap: var(--task-spacing);
    }
    .tsk-Card_FactorsUrgentBadge, .tsk-Card_FactorsImportantBadge {
        padding: 1px 4px;
        font-weight: 400;
        border-radius: var(--border-radius);
        color: var(--primary-inverse);
    }
    .tsk-Card_FactorsUrgentBadge {
        grid-area: urgent;
        justify-self: end;
        background-color: var(--urgent-color);
    } 
    .tsk-Card_FactorsImportantBadge {
        grid-area: important;
        justify-self: start;
        background-color: var(--important-color);
    }
</style>