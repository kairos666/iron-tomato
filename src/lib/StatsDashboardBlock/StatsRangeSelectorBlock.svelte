<script lang="ts">
    import { CalendarDays, CalendarRange, StepBack, StepForward } from "lucide-svelte";
    import { simplifiedDateFormatter } from "../../utils/time-formater";
    import CategoryFilters from "../CategoryFilters.svelte";

    let hiddenDateInput:HTMLInputElement;
    let hiddenWeekInput:HTMLInputElement;
    export let isWeekRange:boolean = false;
    export let targetDate:Date = new Date();
    export let targetCategories:string[];
    $: targetDatetime = datetimeFormater(targetDate);

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

    function triggerNativeDatePicker() { hiddenDateInput.showPicker(); }
    function triggerNativeWeekPicker() { hiddenWeekInput.showPicker(); }
    function onHiddenDateInputChange(evt:any) { 
        const changedValue:string|false = evt?.currentTarget?.value ?? false;
        if(!changedValue) return;

        targetDate = new Date(changedValue);
    }
    function onHiddenWeekInputChange(evt:any) {
        const changedValue:string|false = evt?.currentTarget?.value ?? false;
        if(!changedValue) return;

        // TODO convert week string to Monday Date format received by input YYYY-W99
    }
</script>

<menu class="srs-Block">
    {#if isWeekRange}
    <section class="srs-DateWeekToggler">
        <button class="srs-DateWeekToggleBtn" on:click={ () => isWeekRange = false }><CalendarRange /><span class="sr-only">A la semaine</span></button>
    </section>
    <section class="srs-WeekRange">
        <button class="srs-WeekBtn srs-WeekBtn-previous" on:click={ () => changeTargetDay(-7) }><span class="sr-only">Semaine précédente</span><StepBack /></button>
        <button class="srs-WeekCalendarTrigger" on:click={ triggerNativeWeekPicker }>
            <span class="srs-CurrentWeekDisplay" data-tooltip="Du lundi 27/11 au dimanche 03/12">S52 2024</span>
            <form class="srs-WeekPickingMiniForm">
                <label for="user-week-picking">Semaine ciblée</label>
                <input tabindex="-1" type="week" id="user-week-picking" name="user-week-pickings" value={ 'TODO' } bind:this={ hiddenWeekInput } on:change={ onHiddenWeekInputChange } required />
            </form>
        </button>
        <button class="srs-WeekBtn srs-WeekBtn-next" on:click={ () => changeTargetDay(7) }><span class="sr-only">Semaine suivante</span><StepForward /></button>
    </section>
    {:else}
    <section class="srs-DateWeekToggler">
        <button class="srs-DateWeekToggleBtn" on:click={ () => isWeekRange = true }><CalendarDays /><span class="sr-only">A la journée</span></button>
    </section>
    <section class="srs-DateRange">
        <button class="srs-DayBtn srs-DayBtn-previous" on:click={ () => changeTargetDay(-1) }><span class="sr-only">Jour précédent</span><StepBack /></button>
        <button class="srs-DateCalendarTrigger" on:click={ triggerNativeDatePicker }>
            <time class="srs-CurrentDateDisplay" datetime={ targetDatetime }>{ simplifiedDateFormatter.format(targetDate) }</time>
            <form class="srs-DatePickingMiniForm">
                <label for="user-date-picking">Date ciblée</label>
                <input tabindex="-1" type="date" id="user-date-picking" name="user-date-pickings" value={ targetDatetime } bind:this={ hiddenDateInput } on:change={ onHiddenDateInputChange } required />
            </form>
        </button>
        <button class="srs-DayBtn srs-DayBtn-next" on:click={ () => changeTargetDay(1) }><span class="sr-only">Jour suivant</span><StepForward /></button>
    </section>
    {/if}
    <section class="srs-CategoryRange">
        <CategoryFilters bind:visibleCategories={ targetCategories } />
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

    // DATE/WEEK TOGGLER
    .srs-DateWeekToggler {
        flex:0 0 auto;
        margin-block-end: 0;
        display:flex;
        align-items: center;
    }

    .srs-DateWeekToggleBtn {
        margin-block-end: 0;
    }

    // WEEK RANGE SELECT
    .srs-WeekRange {
        margin-block-end: 0;
        display:flex;
        align-items: center;
        gap: var(--inner-small-spacing);

        @media (max-width:575px) {
            flex:0 0 auto;
        }
        @media (min-width:576px) {
            flex:0 0 19rem;
        }
    }

    .srs-WeekBtn {
        margin-block-end: 0;
        padding: var(--inner-small-spacing);
    }

    .srs-WeekCalendarTrigger {
        margin-block-end: 0;
    }

    .srs-WeekPickingMiniForm {
        margin-block-end: 0;
        height:0;

        label { font-size:0; margin-block-end: 0; }
        input { padding:0; margin-block-end: 0; font-size:0; line-height:0; height:0; border:none; }
    }

    .srs-CurrentWeekDisplay {
        display:inline-block;
        text-align: center;
        color: var(--primary-inverse);
        white-space: nowrap;
        border-bottom:0;
    }

    // DATE RANGE SELECT
    .srs-DateRange {
        flex:0 0 auto;
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
        flex:1 0 auto;
        margin-block-end: 0;
    }
</style>