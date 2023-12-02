<script lang="ts">
    let hasHeader:boolean = $$slots.header;
    let hasFooter:boolean = $$slots.footer;
</script>

<main class="alyt-Container" class:alyt-Container-header={ hasHeader } class:alyt-Container-footer={ hasFooter }>
    {#if hasHeader}
        <header>
            <slot name="header" />
        </header>
    {/if}
    <div class="alyt-Content">
        <slot />
    </div>
    {#if hasFooter}
        <footer>
            <slot name="footer" />
        </footer>
    {/if}
</main>

<style lang="scss">
    $header-height: 2.5rem;
    $footer-height: 3rem;
    .alyt-Container {
        > header, > footer {
            position: fixed;
            z-index: 9999;
        }
        > header { inset: 0 0 auto 0; height: $header-height; background-color: var(--primary); }
        > footer { inset: auto 0 0 0; height: $footer-height; display:flex; justify-content: center; align-items: center; background-color: rgba(216, 27, 96, 0.80); }
        &.alyt-Container-header { padding-block-start: $header-height; }
        &.alyt-Container-footer { padding-block-end: $footer-height; }

        width:100%;
        min-height:100vh;
    }

    .alyt-Content {
        margin: calc(var(--spacing) * 0.5);

        @media (min-width: 576px) and (max-width:1199px) {
            margin: var(--spacing);
        }
        @media (min-width: 1200px) {
            margin-block: var(--spacing);
            margin-inline: auto;
            max-width: calc(1200px - 2 * var(--spacing));
        }
    }
</style>