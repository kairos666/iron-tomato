<script lang="ts">
    //import svelteLogo from '../assets/svelte.svg';
    import appLogo from '/tomacco-logo.png';
</script>

<nav class="hdr-Container">
    <h1 class="hdr-Title">Iron tomato</h1>
    <img src={appLogo} class="hdr-Logo" alt="Tomacco Logo" />
</nav>

<style lang="scss">
    .hdr-Container {
        background-color: var(--primary);
        padding: calc(var(--spacing) / 4) var(--spacing);
        margin-block-end: var(--typography-spacing-vertical);
    }

    .hdr-Title { 
        margin-block-end: 0;
        color: var(--primary-inverse);
    }

    .hdr-Logo {
        height: 3rem;
    }
</style>