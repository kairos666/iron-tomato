<script lang="ts">
    import { StepBack, StepForward } from "lucide-svelte";
    import { taskCategories } from '../../constants/task-categories';
    import TaskCategoryIcon from "../TaskCategoryIcon.svelte";
    import { simplifiedDateFormatter } from "../../utils/time-formater";

    const allTargetCategories = [
        { id: "none", name: "Sans catégories", icon: "ban" , color: "#1b2832" },
        ...taskCategories
    ];
    let hiddenInput:HTMLInputElement;
    export let targetDate:Date = new Date();
    export let targetCategories:string[] = allTargetCategories.map(catItem => catItem.id);
    $: targetDatetime = datetimeFormater(targetDate);
    $: targetCatsToggles = allTargetCategories.map(defaultCatItem => ({ ...defaultCatItem, isToggled: targetCategories.includes(defaultCatItem.id)}));

    function datetimeFormater(date:Date):string {
        const year:number = date.getFullYear();
        const month:number = date.getMonth() + 1;
        const day:number = date.getDate();

        return `${year}-${ (month >= 10) ? month : `0${ month }` }-${ (day >= 10) ? day : `0${ day }` }`;
    }

    function changeTargetDay(changeAmplitude:number) {
        if(!Number.isInteger(changeAmplitude)) throw new Error('provide only integer changeAmplitude value');

        targetDate = new Date(targetDate.getTime() + changeAmplitude * (1000 * 60 * 60 * 24));
    }

    function triggerNativeDatePicker() { hiddenInput.showPicker(); }
    function onHiddenInputChange(evt:any) { 
        const changedValue:string|false = evt?.currentTarget?.value ?? false;
        if(!changedValue) return;

        targetDate = new Date(changedValue);
    }

    function onCatToggle(catToggled:string) {
        const hasCat:boolean = targetCategories.includes(catToggled);

        switch(true) {
            case (hasCat && targetCategories.length === 1):
                // toggle ALL ON
                targetCategories = allTargetCategories.map(catItem => catItem.id);
                break;
            case hasCat:
                // toggle OFF
                targetCategories = targetCategories.filter(cat => (cat !== catToggled));
                break;
            default:
                // toggle ON
                targetCategories = [...targetCategories, catToggled];
        }
    }
</script>

<menu class="srs-Block">
    <section class="srs-DateRange">
        <button class="srs-DayBtn srs-DayBtn-previous" on:click={ () => changeTargetDay(-1) }><span class="sr-only">Jour précédent</span><StepBack /></button>
        <button class="srs-DateCalendarTrigger" on:click={ triggerNativeDatePicker }>
            <time class="srs-CurrentDateDisplay" datetime={ targetDatetime }>{ simplifiedDateFormatter.format(targetDate) }</time>
            <form class="srs-DatePickingMiniForm">
                <label for="user-date-picking">Date ciblée</label>
                <input tabindex="-1" type="date" id="user-date-picking" name="user-date-pickings" value={ targetDatetime } bind:this={ hiddenInput } on:change={ onHiddenInputChange } required />
            </form>
        </button>
        <button class="srs-DayBtn srs-DayBtn-next" on:click={ () => changeTargetDay(1) }><span class="sr-only">Jour suivant</span><StepForward /></button>
    </section>
    <section class="srs-CategoryRange">
        {#each targetCatsToggles as cat (cat.id)}
            <button class="srs-CatBtn" aria-pressed={ cat.isToggled } on:click={ () => onCatToggle(cat.id) } style={ `--cat-color:${ cat.color };` }>
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

    .srs-DateCalendarTrigger {
        margin-block-end: 0;
    }

    .srs-DatePickingMiniForm {
        margin-block-end: 0;
        height:0;

        label { font-size:0; margin-block-end: 0; }
        input { padding:0; margin-block-end: 0; font-size:0; line-height:0; height:0; border:none; }
    }

    .srs-CurrentDateDisplay {
        display:inline-block;
        min-width: 11.25rem;
        text-align: center;
        color: var(--primary-inverse);
        white-space: nowrap;

        &::first-letter { text-transform: uppercase; }
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

        &[aria-pressed="false"] {
            --cat-ins-color: var(--primary-inverse);
            border-color: var(--primary-inverse);
            background-color: transparent;

            &:hover {
                --cat-ins-color: var(--cat-color);
                border-color: var(--cat-color);
            }
        }

        &[aria-pressed="true"] {
            --cat-ins-color: var(--primary-inverse);
            border-color: var(--cat-color);
            background-color: var(--cat-color);

            &:hover {
                --cat-ins-color: var(--cat-color);
                background-color: transparent;
            }
        }
    }
</style>