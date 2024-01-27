<script lang="ts">
    import TaskMaggicTimer from "./TaskMaggicTimer.svelte";

    export let taskID:string;
    let activeSession:boolean;
    let timerResetMethod:() => void

    function onStopSession() { timerResetMethod() }
</script>

<article class="ttc-Block">
    <header class="ttc-Block_Header">
        <h3>Activité</h3>
        <menu class="ttc-Block_Menu">
            <button type="button" class="ttc-Block_ResetCheckerBtn" on:click={ onStopSession } disabled={ !activeSession }>Arrêter la session</button>
        </menu>
    </header>
    <TaskMaggicTimer taskID={ taskID } bind:startedSession={ activeSession } bind:resetSession={ timerResetMethod } />
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

    .ttc-Block_Menu {
        padding-inline-start: 0;
        margin-block: 0;
        display:flex;
        gap: calc(var(--spacing) * 0.5);

        .ttc-Block_ResetCheckerBtn {
            margin-block-end: 0;
            padding-block: calc(var(--spacing) * 0.25);
            border-color: var(--secondary);
            color: var(--secondary); 
            background-color: var(--secondary-inverse);
            font-size: 0.8rem;
            &:hover, &:focus, &:active { 
                color: var(--secondary-inverse); 
                background-color: var(--secondary-hover); 
            }
            &:disabled {
                opacity: 0.15;
            }
        }
    }
</style>