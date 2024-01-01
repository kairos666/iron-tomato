<script lang="ts">
    import { ArrowLeftCircle, Grid2X2, TimerReset } from 'lucide-svelte';
    import { Popover, PopoverButton, PopoverPanel } from "@rgossiaux/svelte-headlessui";
    import appLogo from '/tomacco-logo.png';
    import { appUIState } from '../stores/appUIState';

    const { changeMainView } = appUIState;
</script>

<nav class="hdr-Container">
    <div class="hdr-TitleWrapper">
        <img src={appLogo} class="hdr-Logo" alt="Tomacco Logo" />
        <h1 class="hdr-Title">Iron tomato</h1>
    </div>
    <div class="hdr-Menus">
        <button class="hdr-BackBtn" on:click={ () => changeMainView('dashboard') }>
            <ArrowLeftCircle /> Retour
        </button>
        <Popover class="pop-Wrapper">
            <PopoverButton class="pop-TriggerBtn">Plus d'options</PopoverButton>
            <PopoverPanel class="pop-Panel">
                <button disabled class="pop-ItemBtn"><TimerReset /><span>Paramètres pomodoro</span></button>
                <button disabled class="pop-ItemBtn"><Grid2X2 /><span>Paramètres matrice d'eisenhower</span></button>
            </PopoverPanel>
        </Popover>
    </div>
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

    .hdr-Menus {
        flex:1 1 auto;
        display:flex;
        align-items: center;
        justify-content: flex-end;
        height:100%;
        gap: calc(var(--spacing) * 0.5);

        @media (min-width: 576px) {
            gap: var(--spacing);
        }
    }

    .hdr-Title { 
        font-size: 1.25rem;
        margin-block-end: 0;
        color: var(--primary-inverse);
    }

    .hdr-Logo {
        height: 1.8rem;
    }

    .hdr-BackBtn {
        width:auto;
        margin-block-end: 0;
        padding:0.15rem 0.5rem;
    }
</style>