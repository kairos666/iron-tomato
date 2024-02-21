<script lang="ts">
    import { appUIState } from '../stores/appUIState';
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { CalendarPlus } from "lucide-svelte";

    const { clearModal } = appUIState;
    $: isModalActive = (typeof $appUIState.modal === 'string' && $appUIState.modal.endsWith('history-create'));
</script>

<Dialog open={ isModalActive } on:close={() => clearModal() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle><CalendarPlus size="32" /> Ajouter une entrée d'historique</DialogTitle>
            <DialogDescription>Tâche #TODO</DialogDescription>
        </hgroup>
        <menu class="dlg-Container_ActionsMenu">
            <button class="secondary outline" on:click={() => clearModal() }>Annuler</button>
            <button on:click={() => { console.log('TODO result action') }}>Ajouter la session</button>
        </menu>
    </article>
</Dialog>