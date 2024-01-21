<script lang="ts">
    import { type WorkItem } from "../../stores/persistentTasks";
    import { simplifiedDateFormatter, exactDateShortFormatter, genericDayTimestamp } from "../../utils/time-formater";
    
    type weekDayItem = {
        dateTimestamp: number
        duration: number
        isWeekEndDay: boolean
    }

    type weekDayItemExtended = weekDayItem & {
        humanDate: string
        datetime: string
        hoursDuration: number // duration of effective work converted in hours (rounded)
    }

    export let taskHistory:WorkItem[];
    let weekDayHistory:weekDayItemExtended[] = [];
    let weekDayStartAndEnd:{ start:number, end:number } = { start:0, end:0 };

    /**
     * Generate empty WeekDayItems for all consecutive week days in range
     * @param start start of first session
     * @param end start of last session
     */
    function allWeekDayItemInRange(start:number, end:number):weekDayItem[] {
        let currentTimestamp:number = genericDayTimestamp(start);
        const endTimestamp:number = genericDayTimestamp(end);
        const daysArray:number[] = [];

        while(currentTimestamp < endTimestamp) {
            daysArray.push(currentTimestamp);
            currentTimestamp = new Date(currentTimestamp + 1000 * 60 * 60 * 24).getTime();
        }
        daysArray.push(endTimestamp);

        return daysArray
            .map(timestamp => {
                const currWeekDayNumber:number = new Date(timestamp).getDay();

                return {
                    dateTimestamp: timestamp,
                    duration: 0,
                    isWeekEndDay: (currWeekDayNumber === 0 || currWeekDayNumber === 6)
                }
            });
    }

    /**
     * reducer that distribute work session duration between calendar days in the range
     * @param acc all week days
     * @param curr 
     */
    function distributeWorkonWeekDays(acc:weekDayItem[], curr:WorkItem) {
        const currWorkSessionGenericDayTimestamp:number = genericDayTimestamp(curr.start);
        const matchingWeekDay:weekDayItem|undefined = acc.find(item => (item.dateTimestamp === currWorkSessionGenericDayTimestamp));

        if(matchingWeekDay) {
            matchingWeekDay.duration += curr.wDuration;
        } else {
            console.warn(`work distribution in calendar error : ${ new Date(currWorkSessionGenericDayTimestamp) } does not fit, was ignored`);
        }

        return acc;
    }

    /**
     * extend WeekDayItem for display in component
     * @param item
     */
    function mapForCalendarDisplay(item:weekDayItem):weekDayItemExtended {
        return {
            ...item,
            humanDate: simplifiedDateFormatter.format(item.dateTimestamp),
            datetime: exactDateShortFormatter.format(item.dateTimestamp),
            hoursDuration: translateMstoHours(item.duration)
        }
    }

    /**
     * Duration in hours (floored)
     * @param msDuration
     */
    function translateMstoHours(msDuration:number):number {
        return Math.round(msDuration / (1000 * 60 * 60));
    }

    $: weekDayStartAndEnd = taskHistory.reduce((acc, curr) => ({ start: Math.min(acc.start, curr.start), end: Math.max(acc.end, curr.start) }), { start:Infinity, end:-1 });
    $: weekDayHistory = taskHistory.reduce(distributeWorkonWeekDays, allWeekDayItemInRange(weekDayStartAndEnd.start, weekDayStartAndEnd.end)).map(mapForCalendarDisplay);
</script>

<ol class="twc-Calendar">
{#each weekDayHistory as weekDay}
    <li class="twc-CalendarDay" class:twc-CalendarDay-weekend={ weekDay.isWeekEndDay } class:twc-CalendarDay-worked={ weekDay.hoursDuration >= 1 }>
        <time datetime={ weekDay.datetime } data-tooltip={ weekDay.humanDate } data-placement="top">
            <span class="sr-only">{ weekDay.humanDate }</span>
            {#if (weekDay.hoursDuration >= 1)}<span class="twc-CalendarDay_Duration">{ translateMstoHours(weekDay.duration) }H</span>{/if}
        </time>
    </li>
{/each}
</ol>

<style lang="scss">
    .twc-Calendar {
        padding-inline-start: 0;
        margin-block-end: 0;
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: center;
        gap: calc(var(--spacing) * 0.75);
    }

    .twc-CalendarDay {
        width: 1.5rem;
        height: 1.5rem;
        border:1px solid var(--secondary);
        border-radius: var(--border-radius);
        font-size: 0.8rem;
        text-align:center;
        line-height: 1.5rem;

        &.twc-CalendarDay-weekend { border-color:var(--muted-border-color); }
        &.twc-CalendarDay-worked { background-color: var(--primary); color: var(--background-color); }
        time { display:block; width:100%; height: 100%; border-bottom: none; }
    }
</style>