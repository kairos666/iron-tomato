<script lang="ts">
    import { StepBack, StepForward } from "lucide-svelte";
    import { taskCategories } from '../../constants/task-categories';
    import TaskCategoryIcon from "../TaskCategoryIcon.svelte";
</script>

<menu class="srs-Block">
    <section class="srs-DateRange">
        <button class="srs-DayBtn srs-DayBtn-previous"><span class="sr-only">Jour précédent</span><StepBack /></button>
        <time  class="srs-CurrentDateDisplay" datetime="2024-01-27">Samedi 27/01/2024</time>
        <button class="srs-DayBtn srs-DayBtn-next"><span class="sr-only">Jour suivant</span><StepForward /></button>
    </section>
    <section class="srs-CategoryRange">
        {#each taskCategories as cat (cat.id)}
            <button class="srs-CatBtn" style={ `--cat-color:${ cat.color };` }>
                <span class="sr-only">{ cat.name }</span>
                <TaskCategoryIcon name={ cat.icon } stroke-width="1" size="20" color="var(--cat-ins-color)" />
            </button>
        {/each}
    </section>
</menu>

<style lang="scss">
    .srs-Block {
        display: flex;
        background-color: var(--primary);
        border-radius: var(--border-radius);
        gap: var(--outer-large-spacing);
        padding: var(--outer-small-spacing);
        margin: var(--outer-large-spacing) 0;

        @media (max-width:575px) {
            flex-direction: column;
            justify-content: center;
        }
        @media (min-width:576px) {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-between;
        }
    }

    // DATE RANGE SELECT
    .srs-DateRange {
        margin-block-end: 0;
        display:flex;
        align-items: center;
        gap: var(--inner-small-spacing);
    }

    .srs-DayBtn {
        margin-block-end: 0;
        padding: var(--inner-small-spacing);
    }

    .srs-CurrentDateDisplay {
        color: var(--primary-inverse);
        white-space: nowrap;
    }

    // CATEGORY RANGE SELECT
    .srs-CategoryRange {
        margin-block-end: 0;
        display:flex;
        gap: var(--inner-small-spacing);
    }

    .srs-CatBtn {
        // default non active filter (no filters or not)
        margin-block-end: 0;
        --cat-ins-color: var(--muted-border-color);
        box-shadow: none;
        border-radius: 50% 50%;
        border: 2px solid var(--muted-border-color);
        background-color: transparent;
        font-size:0;
        line-height:20px;
        aspect-ratio: 1;

        &:hover {
            // click to activate filter
            --cat-ins-color: var(--cat-color);
            border-color: var(--cat-color);
            background-color: transparent;
        }

        &:focus, &:active {
            border-color: var(--contrast) !important;
        }

        // &.fltr-Btn-no-filters {
        //     // default no filters
        //     --cat-ins-color: #fff;
        //     border-color: var(--cat-color);
        //     background-color: var(--cat-color);
        // }

        // &.fltr-Btn-active-filter {
        //     // active filter and visible category
        //     --cat-ins-color: #fff;
        //     border-color: var(--cat-color);
        //     background-color: var(--cat-color);
        // }

        // &:hover.fltr-Btn-no-filters {
        //     // click to activate filters with this one only
        //     --cat-ins-color: var(--cat-color);
        //     border-color: var(--cat-color);
        //     background-color: transparent;
        // }
        // &:hover.fltr-Btn-active-filter {
        //     // click to deactivate filter
        //     --cat-ins-color: var(--muted-border-color);
        //     border-color: var(--muted-border-color);
        //     background-color: transparent;
        // }
    }
</style>