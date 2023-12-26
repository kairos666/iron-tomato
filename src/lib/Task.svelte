<script lang="ts">
    import { taskAchieve, taskDelete, type Task } from '../stores/persistentTasks';
    import { appUIState } from '../stores/appUIState';
    import { CheckCircle, Eraser, Eye, Pencil } from "lucide-svelte";
    import TaskCategoryIcon from './TaskCategoryIcon.svelte';
    import { taskCategories } from '../constants/task-categories';

    export let data:Task;
    const { setModal } = appUIState;

    // deduce available actions based on data
    $: hasDescription = !!data.description;
    $: isDeleteEnabled = !data.isDone;
    $: isModifyEnabled = !data.isDone;
    $: currentCategory = taskCategories.find(cat => cat.id === data.category) ?? null;

    function handleDetail() { setModal(`task-detail-${ parseInt(data.id) }`) }
    function handleAchieve() { taskAchieve(data.id) }
    function handleDelete() { taskDelete(data.id) }
    function handleModify() { setModal(`task-edit-${ parseInt(data.id) }`) }
</script>

<article class="tsk-Card tsk-Card-isTodo" class:tsk-Card-isUrgent={ data.isUrgent } class:tsk-Card-isImportant={ data.isImportant } class:tsk-Card-hasCategory={ currentCategory } role="listitem" data-id={ data.id }>
    <button class="tsk-Btn tsk-Btn-done" on:click={ handleAchieve }  data-tooltip="Achever" data-placement="right"><CheckCircle size={ 26 } color="var(--icon-color)" /><span class="sr-only">Achever</span></button>
    {#if currentCategory}<TaskCategoryIcon class="tsk-Cat" name={ currentCategory.icon } stroke-width="1" size="15" color={ currentCategory.color } />{/if}
    <h2 draggable="true" aria-labelledby="poignée de la tâche" class="sortable-handle">{ data.label }</h2>
    <menu class="tsk-Card_Menu">
        {#if hasDescription} <button on:click={ handleDetail } class="tsk-Btn" data-tooltip="Voir description" data-placement="left"><Eye size={ 26 } color="var(--icon-color)"/><span class="sr-only">Voir description</span></button> {/if}
        {#if isModifyEnabled} <button on:click={ handleModify } class="tsk-Btn" data-tooltip="Modifier" data-placement="left"><Pencil size={ 26 } color="var(--icon-color)"/><span class="sr-only">Modifier</span></button> {/if}
        {#if isDeleteEnabled} <button on:click={ handleDelete } class="tsk-Btn" data-tooltip="Supprimer" data-placement="left"><Eraser size={ 26 } color="var(--icon-color)"/><span class="sr-only">Supprimer</span></button> {/if}
    </menu>
</article>

<style lang="scss">
    .tsk-Card {
        --category-border-offset: 2px;
        --card-box-shadow: 0px 30px 15px -30px rgba(27,40,50, 0.8);

        display: grid;
        grid-template-columns: auto 1fr auto;
        grid-template-rows: auto;
        grid-template-areas:
            "done title actions";
        align-items: center;
        margin-block: 0;
        padding: var(--task-spacing) calc(var(--task-spacing) * 2);
        gap: calc(var(--task-spacing) * 1.5);
        position:relative;
        z-index: 1;

        &.tsk-Card-hasCategory {
            grid-template-columns: auto auto 1fr auto;
            grid-template-areas:
            "done cat title actions";
        }

        &:not(.tsk-Card-isUrgent):not(.tsk-Card-isImportant) {
            background-color: transparent;
            &::after {
                content: '';
                position: absolute;
                inset: 0;
                background-color: var(--background-color);
                border: var(--category-border-offset) solid var(--muted-color);
                border-radius: var(--border-radius);
                z-index: -1;
            }
        }
        &.tsk-Card-isUrgent:not(.tsk-Card-isImportant) {
            background-color: transparent;
            &::after {
                content: '';
                position: absolute;
                inset: 0;
                background-color: var(--background-color);
                border: var(--category-border-offset) solid var(--urgent-color);
                border-radius: var(--border-radius);
                z-index: -1;
            }
        }

        &.tsk-Card-isImportant:not(.tsk-Card-isUrgent) {
            background-color: transparent;
            &::after {
                content: '';
                position: absolute;
                inset: 0;
                background-color: var(--background-color);
                border: var(--category-border-offset) solid var(--important-color);
                border-radius: var(--border-radius);
                z-index: -1;
            }
        }

        &.tsk-Card-isUrgent.tsk-Card-isImportant {
            background-color: transparent;
            &::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(7deg, var(--urgent-color) 0%, var(--urgent-color) 49%, var(--important-color) 51%, var(--important-color) 100%);
                background-size: 200% 100%;
                border-radius: var(--border-radius);
                z-index: -2;
                animation: animatedgradient 3s ease infinite;
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

        @keyframes animatedgradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    }

    .tsk-Cat {
        grid-area: cat;
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
        &.tsk-Btn-done { 
            grid-area: done;
            --icon-color: var(--muted-border-color);
            &:hover, &:focus, &:active { --icon-color: var(--done-color); }
        }
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
</style>