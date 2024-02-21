<script lang="ts">
    import { appUIState } from '../stores/appUIState';
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { CalendarRange } from "lucide-svelte";

    const { clearModal } = appUIState;
    $: isModalActive = (typeof $appUIState.modal === 'string' && $appUIState.modal.endsWith('history-edit'));
</script>

<Dialog open={ isModalActive } on:close={() => clearModal() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle><CalendarRange size="32" /> Modifier une entrée d'historique</DialogTitle>
            <DialogDescription>Tâche #TODO, history start #TODO</DialogDescription>
        </hgroup>
        <menu class="dlg-Container_ActionsMenu">
            <button class="secondary outline" on:click={() => clearModal() }>Annuler</button>
            <button on:click={() => { console.log('TODO result action') }}>Modifier la session</button>
            <button on:click={() => { console.log('TODO result action') }}>Suppression la session</button>
        </menu>
    </article>
</Dialog>