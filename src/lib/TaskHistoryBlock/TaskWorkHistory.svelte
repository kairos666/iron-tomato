<script lang="ts">
    import { appUIState } from "../../stores/appUIState";
    import { type WorkItem } from "../../stores/persistentTasks";

    export let taskHistory:WorkItem[];
</script>

{#if $appUIState.isMobileViewport}
    {#each taskHistory as historyItem }
    <p>work session mobile</p>
    {/each}
{:else}
    <table role="grid">
        <thead>
            <th scope="col">#</th>
            <th scope="col">Session de travail</th>
        </thead>
        <tbody>
            {#each taskHistory as historyItem, index }
            <tr>
                <th scope="row">{ index + 1 }</th>
                <td>{ historyItem.duration }</td>
              </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style lang="scss">
    table { margin-block-end: 0; }
    th, td { padding:calc(var(--spacing) / 4) calc(var(--spacing) / 2); }
</style>