<script lang="ts">
    import TaskMaggicTimer from "./TaskMaggicTimer.svelte";

    export let taskID:string;
</script>

<article class="ttc-Block">
    <header class="ttc-Block_Header">
        <h3>Activité</h3>
    </header>
    <TaskMaggicTimer taskID={ taskID } />
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
</style>