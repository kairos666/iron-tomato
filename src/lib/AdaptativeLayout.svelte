<script lang="ts">
    import { appUIState } from '../stores/appUIState';
    let hasHeader:boolean = $$slots.header;
    let hasFooter:boolean = $$slots.footer;
</script>

<main class="alyt-Container" class:alyt-Container-header={ hasHeader } class:alyt-Container-footer={ hasFooter }>
    {#if hasHeader}
        <header>
            <slot name="header" />
        </header>
    {/if}
    <div class="alyt-Content" class:alyt-Content-xLarge={ $appUIState.mainView === 'dashboard' && $appUIState.viewMode === 'matrix' && $appUIState.tasksShown === 'todo' }>
        <slot />
    </div>
    {#if hasFooter}
        <footer>
            <slot name="footer" />
        </footer>
    {/if}
</main>

<style lang="scss">
    @import "../styles/variables.scss";
    .alyt-Container {
        --nonContentHeight: 0; // case without header or footer
        > header, > footer {
            position: fixed;
            z-index: 9999;
        }
        > header { inset: 0 0 auto 0; height: $header-height; background-color: var(--primary); }
        > footer { inset: auto 0 0 0; height: $footer-height; display:flex; justify-content: center; align-items: center; background-color: rgba(216, 27, 96, 0.80); }
        &.alyt-Container-header { padding-block-start: $header-height; --nonContentHeight: #{$header-height}; }
        &.alyt-Container-footer { padding-block-end: $footer-height; --nonContentHeight: #{$footer-height}; }
        &.alyt-Container-header.alyt-Container-footer { --nonContentHeight: #{$header-height + $footer-height}; }

        width:100%;
        min-height:100vh;
    }

    .alyt-Content {
        @media (max-width:575px) {
            margin: calc(var(--spacing) * 1.25);
        }
        @media (min-width: 576px) and (max-width:1199px) {
            margin: calc(var(--spacing) * 2);
        }
        @media (min-width: 1200px) {
            margin-block: var(--spacing);
            margin-inline: auto;
            max-width: calc(1200px - 3.25 * var(--spacing));
        }

        &.alyt-Content-xLarge {
            @media (max-width:575px) {
                height: calc(100vh - var(--nonContentHeight) - 2*(var(--spacing) * 1.25));
            }
            @media (min-width: 576px) and (max-width:1199px) {
                height: calc(100vh - var(--nonContentHeight) - 2*(var(--spacing) * 2));
            }
            @media (min-width: 1200px) {
                height: calc(100vh - var(--nonContentHeight) - 2* var(--spacing));
                max-width: calc(100vw - 3.25 * var(--spacing));
            }
        }
    }
</style>