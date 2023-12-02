<script lang="ts">
    import { CircleDashed, Grid2X2, TimerReset, Trash2 } from 'lucide-svelte';
    import { Popover, PopoverButton, PopoverPanel, RadioGroup, RadioGroupLabel, RadioGroupOption } from "@rgossiaux/svelte-headlessui";
    import appLogo from '/tomacco-logo.png';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let tasksShown:'todo'|'done';
    $: dispatch('tasks-shown-change', tasksShown);

    function onResetTask() { dispatch('reset') } // confirmation modal
    function onResetDoneTask() { dispatch('reset-done') } // no confirmation modal
</script>

<nav class="hdr-Container">
    <div class="hdr-TitleWrapper">
        <img src={appLogo} class="hdr-Logo" alt="Tomacco Logo" />
        <h1 class="hdr-Title">Iron tomato</h1>
    </div>
    <Popover class="pop-Wrapper">
        <PopoverButton class="pop-TriggerBtn">Plus d'options</PopoverButton>
        <PopoverPanel class="pop-Panel">
            <RadioGroup class="vslct-Wrapper" bind:value={ tasksShown }>
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
            <button class="pop-ItemBtn" on:click={ onResetDoneTask }><CircleDashed /><span>Nettoyage des tâches terminées</span></button>
            <button class="pop-ItemBtn" on:click={ onResetTask }><Trash2 /><span>Remise à zéro de la liste de tâches</span></button>
        </PopoverPanel>
    </Popover>
</nav>

<style lang="scss">
    .hdr-Container {
        display:flex;
        align-items: center;
        height:100%;
        padding-inline: calc(var(--spacing) * 0.5);
        gap: calc(var(--spacing) * 0.5);

        @media (min-width: 576px) {
            gap: var(--spacing);
            padding-inline: var(--spacing);
        }
    }

    .hdr-TitleWrapper {
        flex:1 0 auto;
        display:flex;
        gap: inherit;
    }

    .hdr-Title { 
        font-size: 1.25rem;
        margin-block-end: 0;
        color: var(--primary-inverse);
    }

    .hdr-Logo {
        height: 1.8rem;
    }
</style>