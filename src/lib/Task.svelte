<script lang="ts">
    import type { Task } from "../stores/tasks";

    export let data:Task;
</script>

<article class="tsk-Card">
    <h2>{ data.label }</h2>
    {#if data.description}
        <p>{ data.description }</p>
    {/if}
    <menu class="tsk-Card_Menu">
        <button class="outline">Achever</button>
        <button class="secondary outline">Modifier</button>
        <button class="contrast outline">Supprimer</button>
    </menu>
</article>

<style lang="scss">
    .tsk-Card {
        display: grid;
        grid-template-columns: 3fr 1fr;
        grid-template-rows: auto;
        grid-template-areas:
            "title actions"
            "description actions";
        gap: var(--spacing);

        h2 { grid-area: title; margin-block-end:0; }
        p { grid-area: description; margin-block-end:0; }
    }

    .tsk-Card_Menu {
        grid-area: actions;
        margin:0;
        padding:0;
        display: flex;
        gap: var(--spacing);
    }
</style>