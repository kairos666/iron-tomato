<script lang="ts">
    import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@rgossiaux/svelte-headlessui";
    import { Grid2X2, List } from "lucide-svelte";
    import { appUIState } from '../stores/appUIState';

    let viewType:'list'|'matrix' = 'list';
    $: appUIState.changeViewMode(viewType);
</script>

<RadioGroup class="tv-Wrapper" bind:value={ viewType }>
    <RadioGroupLabel class="tv-Label">Affichage de la liste des tâches</RadioGroupLabel>
    <RadioGroupOption class="tv-Option" value="list" let:checked>
        <span class:checked><List /> Liste</span>
    </RadioGroupOption>
    <RadioGroupOption class="tv-Option" value="matrix" let:checked>
        <span class:checked><Grid2X2 /> Matrice</span>
    </RadioGroupOption>
</RadioGroup>