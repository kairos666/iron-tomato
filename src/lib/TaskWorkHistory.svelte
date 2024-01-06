<script lang="ts">
    import { CalendarOff } from "lucide-svelte";
    import { getLiveQueryForTaskId, type WorkItem } from "../stores/persistentTasks";

    export let taskID:string;
    $: taskQuery = getLiveQueryForTaskId(taskID);
    $: hasHistory = !($taskQuery?.workHistory === undefined || $taskQuery?.workHistory.length === 0);
</script>

{#if hasHistory}
    <p>history</p>
{:else}
    <p class="twh-EmptyHistory"><CalendarOff /> <i>La tâche ne contient pas d'imputations</i></p>
{/if}

<style lang="scss">
    .twh-EmptyHistory { margin-block-end: 0; }
</style>