<script lang="ts">
    import TaskCheckTimer from "./TaskCheckTimer.svelte";
    import TaskMaggicTimer from "./TaskMaggicTimer.svelte";

    export let taskID:string;
    let timeCheckStyle:'basic'|'maggic'|'pomodoro' = 'basic';
</script>

<article class="ttc-Block">
    <header class="ttc-Block_Header">
        <h3>Activité</h3>
        <menu class="ttc-Block_ToggleMenu">
            <button type="button" class="ttc-Block_ToggleMenu_Btn" on:click={ () => timeCheckStyle = 'basic' } class:ttc-Block_ToggleMenu_Btn-pressed={ (timeCheckStyle === 'basic') } aria-pressed={ (timeCheckStyle === 'basic') }>Basique</button>
            <button type="button" class="ttc-Block_ToggleMenu_Btn" on:click={ () => timeCheckStyle = 'maggic' } class:ttc-Block_ToggleMenu_Btn-pressed={ (timeCheckStyle === 'maggic') } aria-pressed={ (timeCheckStyle === 'maggic') }>Maggic</button>
            <button type="button" class="ttc-Block_ToggleMenu_Btn" disabled on:click={ () => timeCheckStyle = 'pomodoro' } class:ttc-Block_ToggleMenu_Btn-pressed={ (timeCheckStyle === 'pomodoro') } aria-pressed={ (timeCheckStyle === 'pomodoro') }>Pomodoro</button>
        </menu>
    </header>
    {#if timeCheckStyle === 'maggic'}
    <TaskMaggicTimer taskID={ taskID } />
    {:else if timeCheckStyle === 'pomodoro'}
    <p>TODO POMODORO clock</p>
    {:else}
    <TaskCheckTimer taskID={ taskID } />
    {/if}
</article>

<style lang="scss">
    @import "../../styles/page-detail-block";

    .ttc-Block { 
        @include pdb_BlockStyle(h3);
        grid-area: work-time-checker;
    }

    .ttc-Block_Header {
        display:flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing);
    }

    .ttc-Block_ToggleMenu {
        padding-inline-start: 0;
        margin-block: 0;
        display:flex;
        gap: calc(var(--spacing) * 0.5);

        .ttc-Block_ToggleMenu_Btn {
            margin-block-end: 0;
            padding-block: calc(var(--spacing) * 0.25);
            border-color: var(--secondary);
            color: var(--secondary); 
            background-color: var(--secondary-inverse);
            &:hover, &:focus, &:active { 
                color: var(--secondary-inverse); 
                background-color: var(--secondary-hover); 
            }
            &.ttc-Block_ToggleMenu_Btn-pressed {
                color: var(--primary-inverse); 
                background-color: var(--primary);
                pointer-events: none;
            }
        }
    }
</style>