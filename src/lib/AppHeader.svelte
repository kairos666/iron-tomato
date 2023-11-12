<script lang="ts">
    import { CircleDashed, Grid2X2, TimerReset, Trash2 } from 'lucide-svelte';
    import { Popover, PopoverButton, PopoverPanel, RadioGroup, RadioGroupLabel, RadioGroupOption } from "@rgossiaux/svelte-headlessui";
    //import svelteLogo from '../assets/svelte.svg';
    import appLogo from '/tomacco-logo.png';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let listView:'todo'|'done';
    $: dispatch('list-view-change', listView);

    function onResetTask() { dispatch('reset') }
</script>

<nav class="hdr-Container">
    <div class="hdr-TitleWrapper">
        <img src={appLogo} class="hdr-Logo" alt="Tomacco Logo" />
        <h1 class="hdr-Title">Iron tomato</h1>
    </div>
    <Popover class="pop-Wrapper">
        <PopoverButton class="pop-TriggerBtn">Plus d'options</PopoverButton>
        <PopoverPanel class="pop-Panel">
            <RadioGroup class="vslct-Wrapper" bind:value={ listView }>
                <RadioGroupLabel class="vslct-Label">Affichage liste de tâches</RadioGroupLabel>
                <RadioGroupOption class="vslct-Option" value="todo" let:checked>
                  <span class:checked>Tâches à faire</span>
                </RadioGroupOption>
                <RadioGroupOption class="vslct-Option" value="done" let:checked>
                  <span class:checked>Tâches achevées</span>
                </RadioGroupOption>
            </RadioGroup>
            <span class="pop-Separator"></span>
            <button disabled class="pop-ItemBtn"><TimerReset /><span>Paramètres pomodoro</span></button>
            <button disabled class="pop-ItemBtn"><Grid2X2 /><span>Paramètres matrice d'eisenhower</span></button>
            <span class="pop-Separator"></span>
            <button disabled class="pop-ItemBtn"><CircleDashed /><span>Nettoyage des tâches terminées</span></button>
            <button class="pop-ItemBtn" on:click={ onResetTask }><Trash2 /><span>Remise à zéro de la liste de tâches</span></button>
        </PopoverPanel>
    </Popover>
</nav>

<style lang="scss">
    .hdr-Container {
        background-color: var(--primary);
        padding: calc(var(--spacing) / 4) var(--spacing);
        margin-block-end: var(--typography-spacing-vertical);
    }

    .hdr-TitleWrapper {
        display:flex;
        gap: var(--spacing);
    }

    .hdr-Title { 
        margin-block-end: 0;
        color: var(--primary-inverse);
    }

    .hdr-Logo {
        height: 3rem;
    }
</style>