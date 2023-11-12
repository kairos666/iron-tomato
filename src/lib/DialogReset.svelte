<script lang="ts">
    import { tasksReset } from "../stores/persistentTasks";
    import { appUIState } from '../stores/appUIState';
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from "@rgossiaux/svelte-headlessui";
    import { Trash2 } from "lucide-svelte";

    const { clearModal } = appUIState;
</script>

<Dialog open={ ($appUIState.modal === 'reset') } on:close={() => clearModal() }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle><Trash2 size={ 32 } /> Remise à zéro des tâches</DialogTitle>
            <DialogDescription>Si vous confirmez l'action, toutes les tâches seront définitivement effacées de la liste.</DialogDescription>
        </hgroup>
        <menu class="dlg-Container_ActionsMenu">
            <button class="secondary outline" on:click={() => clearModal() }>Annuler</button>
            <button on:click={() => { tasksReset(); clearModal() }}>Remise à zéro de la liste</button>
        </menu>
    </article>
</Dialog>