<script lang="ts">
    import { Sliders, CircleDashed, FilterX, Grid2X2, List, Trash2 } from 'lucide-svelte';
    import { Popover, PopoverButton, PopoverPanel, RadioGroup, RadioGroupLabel, RadioGroupOption } from "@rgossiaux/svelte-headlessui";
    import appLogo from '/tomacco-logo.png';
    import { appUIState } from '../stores/appUIState';
    import { tasksDoneReset } from '../stores/persistentTasks';
    import { tick } from 'svelte';
    import TaskCategoryIcon from './TaskCategoryIcon.svelte';
    import { taskCategories } from '../constants/task-categories';

    const { setModal, changeTasksShown, changeViewMode, changeCategoryFilters, clearCategoryFilters, changeMainView } = appUIState;
    let tempViewMode:'list'|'matrix' = $appUIState.viewMode;
    let tempTasksShown:'todo'|'done' = $appUIState.tasksShown;
    let catFiltersState:{ id:string, name:string, icon:string, color:string, isFilterActive:boolean, isNoFilters:boolean }[] = [];

    $: changeTasksShown(tempTasksShown); // react to switch change
    $: if(tempTasksShown !== $appUIState.tasksShown) tick().then(() => { tempTasksShown = $appUIState.tasksShown; }) // react to outside change
    $: changeViewMode(tempViewMode); // react to switch change
    $: if(tempViewMode !== $appUIState.viewMode) tick().then(() => { tempViewMode = $appUIState.viewMode; }) // react to outside change
    $: {
        const isNoFilters:boolean = ($appUIState.categoryFilters.length === 0);
        const isFilterBanActive:boolean = $appUIState.categoryFilters.includes("none");

        catFiltersState = taskCategories.map(taskCat => {
            const isFilterActive:boolean = $appUIState.categoryFilters.includes(taskCat.id);
            return {
                ...taskCat,
                isFilterActive,
                isNoFilters
            }
        });

        catFiltersState = [
            { id: "none", name: "Sans catégories", icon: "ban" , color: "#1b2832", isFilterActive: isFilterBanActive, isNoFilters },
            ...catFiltersState
        ]
    }

    function changeCategorySetup(toggledCat:string) {
        const toggleON:boolean = !$appUIState.categoryFilters.includes(toggledCat);
        let result:string[];

        if(toggleON) {
            // add cat
            result = [...$appUIState.categoryFilters, toggledCat];
        } else {
            // remove cat
            result = $appUIState.categoryFilters.filter(cat => (cat !== toggledCat));
        }

        changeCategoryFilters(result);
    }
</script>

<nav class="hdr-Container">
    <div class="hdr-TitleWrapper">
        <img src={appLogo} class="hdr-Logo" alt="Tomacco Logo" />
        <h1 class="hdr-Title">Iron tomato</h1>
    </div>
    {#if !$appUIState.isMobileViewport && $appUIState.tasksShown === 'todo'}
        <RadioGroup class="tv-Wrapper" bind:value={ tempViewMode }>
            <RadioGroupLabel class="sr-only">Affichage de la liste des tâches</RadioGroupLabel>
            <RadioGroupOption class="tv-Option" value="list" let:checked>
                <span class:checked><List /> Liste</span>
            </RadioGroupOption>
            <RadioGroupOption class="tv-Option" value="matrix" let:checked>
                <span class:checked><Grid2X2 /> Matrice</span>
            </RadioGroupOption>
        </RadioGroup>
    {/if}
    <Popover class="pop-Wrapper">
        <PopoverButton class="pop-TriggerBtn">Plus d'options</PopoverButton>
        <PopoverPanel class="pop-Panel">
            <RadioGroup class="vslct-Wrapper" bind:value={ tempTasksShown }>
                <RadioGroupLabel class="vslct-Label">Affichage liste de tâches</RadioGroupLabel>
                <RadioGroupOption class="vslct-Option" value="todo" let:checked>
                  <span class:checked>Tâches à faire</span>
                </RadioGroupOption>
                <RadioGroupOption class="vslct-Option" value="done" let:checked>
                  <span class:checked>Tâches achevées</span>
                </RadioGroupOption>
            </RadioGroup>
            <span class="pop-Separator"></span>
            <div id="filter-menu" class="fltr-Menu" role="menubar">
                <label class="fltr-Menu_Label" for="filter-menu">Catégories visibles</label>
                <ul class="fltr-Menu_ItemList" role="menu">
                    {#each catFiltersState as cat (cat.id)}
                        <li class="fltr-Menu_Item" role="menuitem">
                            <button class="fltr-Btn" class:fltr-Btn-no-filters={ cat.isNoFilters } class:fltr-Btn-active-filter={ !cat.isNoFilters && cat.isFilterActive } style={ `--cat-color:${ cat.color };` } on:click={ () => changeCategorySetup(cat.id) }>
                                <TaskCategoryIcon name={ cat.icon } stroke-width="1" size="20" color="var(--cat-ins-color)" />
                            </button>
                        </li>
                    {/each}
                </ul>
                <button class="pop-ItemBtn" disabled={ ($appUIState.categoryFilters.length === 0) } on:click={ () => clearCategoryFilters() }><FilterX />Ne pas filtrer</button>
            </div>
            <span class="pop-Separator"></span>
            <button class="pop-ItemBtn" on:click={ () => tasksDoneReset() }><CircleDashed /><span>Nettoyage des tâches terminées</span></button>
            <button class="pop-ItemBtn" on:click={ () => setModal('reset') }><Trash2 /><span>Remise à zéro de la liste de tâches</span></button>
            <span class="pop-Separator"></span>
            <button class="pop-ItemBtn" on:click={ () => changeMainView('parameters-settings') }><Sliders /><span>Paramètres</span></button>
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

    .fltr-Menu_Label {
        padding-inline: calc(var(--spacing) * 0.5);
    }
    .fltr-Menu_ItemList {
        margin-inline:0;
        margin-block-end: calc(var(--spacing) * 0.25);
        padding-inline: calc(var(--spacing) * 0.5);
        display:flex;
        gap: calc(var(--spacing) * 0.5);
    }
    .fltr-Menu_Item {
        padding:0;
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