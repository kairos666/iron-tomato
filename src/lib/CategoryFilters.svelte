<script lang="ts">
    import { taskCategories } from '../constants/task-categories';
    import TaskCategoryIcon from './TaskCategoryIcon.svelte';

    type CatExtended = {
        id:string
        name:string
        icon:string
        color:string
        isFilterActive:boolean
    }

    let isNoFilters:boolean = true;
    let catFiltersState:CatExtended[] = [
        { id: "none", name: "Sans catégories", icon: "ban" , color: "#1b2832", isFilterActive: true }, 
        ...taskCategories.map(catEntry => ({ ...catEntry, isFilterActive: true } as CatExtended))
    ];
    export let visibleCategories:string[] = catFiltersState.map(catEntry => catEntry.id);

    function changeCategorySetup(toggledCat:string) {
        const tempResult:CatExtended[] = [...catFiltersState.map(entry => ({ ...entry }))]; // clone state

        switch(true) {
            case (tempResult.every(catEntry => catEntry.isFilterActive)):
                // handle extreme cases - all active before toggle, keep on only clicked filter
                catFiltersState = tempResult.map(catEntry => {
                    if(catEntry.id === toggledCat) {
                        catEntry.isFilterActive = true;
                    } else {
                        catEntry.isFilterActive = false;
                    }

                    return catEntry
                });
                isNoFilters = false;
                break;
            case (tempResult.every(catEntry => (catEntry.id === toggledCat) ? catEntry.isFilterActive : !catEntry.isFilterActive)):
                // handle extreme cases - no more filters active after toggle off = all active
                catFiltersState = tempResult.map(catEntry => { catEntry.isFilterActive = true; return catEntry });
                isNoFilters = true;
                break;
            default:
                // toggle filter
                catFiltersState = tempResult.map(catEntry => {
                    if(catEntry.id === toggledCat) catEntry.isFilterActive = !catEntry.isFilterActive;
                    return catEntry
                });
        }

        // update exported state
        visibleCategories = catFiltersState.filter(catEntry => catEntry.isFilterActive).map(catEntry => catEntry.id);
    }
</script>

<ul class="fltr-Menu_ItemList" role="menu">
    {#each catFiltersState as cat (cat.id)}
        <li class="fltr-Menu_Item" role="menuitem">
            <button class="fltr-Btn" class:fltr-Btn-no-filters={ isNoFilters } class:fltr-Btn-active-filter={ !isNoFilters && cat.isFilterActive } style={ `--cat-color:${ cat.color };` } on:click={ () => changeCategorySetup(cat.id) }>
                <TaskCategoryIcon name={ cat.icon } stroke-width="1" size="20" color="var(--cat-ins-color)" />
            </button>
        </li>
    {/each}
</ul>

<style lang="scss">
    .fltr-Menu_ItemList {
        padding-inline:0;
        margin-block-end: 0;
        display:flex;
        gap: calc(var(--spacing) * 0.5);
    }
    .fltr-Menu_Item {
        padding:0;
        margin-block-end: 0;
        list-style: none;
    }

    .fltr-Btn {
        // default non active filter (no filters or not)
        --cat-ins-color: var(--muted-border-color);
        box-shadow: none;
        border-radius: 50% 50%;
        border: 2px solid var(--muted-border-color);
        background-color: transparent;
        padding:7.5px;
        font-size:0;
        line-height:20px;
        margin-block-end: 0;

        &:hover {
            // click to activate filter
            --cat-ins-color: var(--cat-color);
            border-color: var(--cat-color);
            background-color: transparent;
        }

        &:focus, &:active {
            border-color: var(--contrast) !important;
        }

        &.fltr-Btn-no-filters {
            // default no filters
            --cat-ins-color: #fff;
            border-color: var(--cat-color);
            background-color: var(--cat-color);
        }

        &.fltr-Btn-active-filter {
            // active filter and visible category
            --cat-ins-color: #fff;
            border-color: var(--cat-color);
            background-color: var(--cat-color);
        }

        &:hover.fltr-Btn-no-filters {
            // click to activate filters with this one only
            --cat-ins-color: var(--cat-color);
            border-color: var(--cat-color);
            background-color: transparent;
        }
        &:hover.fltr-Btn-active-filter {
            // click to deactivate filter
            --cat-ins-color: var(--muted-border-color);
            border-color: var(--muted-border-color);
            background-color: transparent;
        }
    }
</style>