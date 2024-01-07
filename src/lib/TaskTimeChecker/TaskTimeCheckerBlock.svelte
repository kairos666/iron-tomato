<script lang="ts">
    import TaskCheckTimer from "./TaskCheckTimer.svelte";

    export let taskID:string;
</script>

<article class="ttc-Block">
    <header>
        <h3>Travail sur la session en cours</h3>
    </header>
    <TaskCheckTimer taskID={ taskID } />
</article>

<style lang="scss">
    @import "../../styles/page-detail-block";

    .ttc-Block { 
        @include pdb_BlockStyle(h3);
        grid-area: work-time-checker;
    }
</style>