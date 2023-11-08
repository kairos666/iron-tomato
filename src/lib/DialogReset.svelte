<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { tasksReset } from "../stores/persistentTasks";
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { CircleOff } from "lucide-svelte";

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
            <DialogTitle><CircleOff size={ 32 } /> Remise à zéro des tâches</DialogTitle>
            <DialogDescription>Si vous confirmez l'action, toutes les tâches seront définitivement effacées de la liste.</DialogDescription>
        </hgroup>
        <menu class="dlg-Container_ActionsMenu">
            <button class="secondary outline" on:click={() => dispatchClose() }>Annuler</button>
            <button on:click={() => { tasksReset(); dispatchClose() }}>Remise à zéro de la liste</button>
        </menu>
    </article>
</Dialog>