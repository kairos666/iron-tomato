<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { tasksStore } from "../stores/tasks";
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";

    export let open:boolean;

    const dispatch = createEventDispatcher();
    function dispatchClose() {
        dispatch('close');
    }
</script>

<Dialog open={ open } on:close={() => dispatchClose() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle>Remise à zéro des tâches</DialogTitle>
            <DialogDescription>Si vous confirmez l'action, toutes les tâches seront définitivement effacées de la liste.</DialogDescription>
        </hgroup>
        <menu class="dlg-Container_ActionsMenu">
            <button class="secondary outline" on:click={() => dispatchClose() }>Annuler</button>
            <button on:click={() => { tasksStore.reset(); dispatchClose() }}>Reset</button>
        </menu>
    </article>
</Dialog>