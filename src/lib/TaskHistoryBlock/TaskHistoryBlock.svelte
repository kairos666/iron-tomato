<script lang="ts">
    import TaskWorkChronology from "./TaskWorkChronology.svelte";
    import TaskWorkHistory from "./TaskWorkHistory.svelte";

    export let taskID:string;
    export let hasHistory:boolean;
</script>

<article class="th-Block">
    <header>
        <h3>Historique de l'activité sur la tâche</h3>
        {#if hasHistory}
        <dl class="th-MainStats">
            <dt>Périodes des sessions de travail (TODO - static) :</dt><dd>vendredi 05 janv. 2024, 23:58 - samedi 06 janv. 2024, 21:12</dd>
            <dt>Travail effectif cumulé (TODO - static) :</dt><dd>15 heures 35 minutes 32 secondes</dd>
        </dl>
        {/if}
    </header>
    <TaskWorkHistory taskID={ taskID } />
    {#if hasHistory}
    <footer>
        <TaskWorkChronology taskID={ taskID } />
    </footer>
    {/if}
</article>

<style lang="scss">
    @import "../../styles/page-detail-block";

    .th-Block { 
        @include pdb_BlockStyle(h3);
        grid-area: work-history;
    }

    .th-MainStats {
        padding-inline-start: 0;
        margin-block: var(--spacing) 0;
        display: grid;
        grid-template-columns: 1fr;
        grid-auto-rows: auto;
        grid-gap: calc(var(--spacing) * 0.5);

        @media (min-width:576px) {
            grid-template-columns: auto 1fr;
            grid-auto-rows: auto;
            dt { justify-self: end; }
        }

        dt { font-style: italic; }
        dd { margin-inline-start: 0; font-weight: 500; }
    }
</style>