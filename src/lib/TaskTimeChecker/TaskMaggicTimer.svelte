<script lang="ts">
    import { CalendarClock, Coffee } from "lucide-svelte";
    import { onDestroy, onMount } from "svelte";

    type MaggicClockData = {
        workDuration:number
        pauseDuration:number
    }

    type MaggicClockDisplay = {
        sessionTotalDuration:string
        workDuration:string
        pauseDuration:string
        offsetType: 'work'|'pause'
        offsetDuration: string
    }

    export let taskID:string;
    let maggicClockData:MaggicClockData = {
        workDuration: 25 * 60 * 60 * 1000 + 12 * 1000,
        pauseDuration: 5 * 60 *60 * 1000
    }
    let maggicClockDisplay:MaggicClockDisplay = {
        sessionTotalDuration: "30:12",
        workDuration: "25 min",
        pauseDuration: "5 min",
        offsetType: 'pause',
        offsetDuration: "+ 1,34 sec"
    }

    // handle data display

    // handle work log
    onMount(() => {
        console.log('Maggic clock - MOUNTED');
    });

    onDestroy(() => {
        onTriggerWorkLog();
        console.log('Maggic clock - DESTROYED');
    })

    function onTriggerWorkLog() {
        console.log('Maggic clock - log work');
    }
</script>

<svelte:window on:beforeunload={ onTriggerWorkLog } />
<section class="tmt-MaggicClockLayout">
    <button 
        type="button" 
        class="tmt-Btn tmt-Btn-work" 
        disabled={ false } 
        on:click={ () => { console.log('Maggic clock - work'); } }
        data-tooltip="Travailler"
        data-placement="top"
    ><CalendarClock /><span class="sr-only">Imputer</span></button>
    <button 
        type="button" 
        class="tmt-Btn tmt-Btn-pause" 
        disabled={ false } 
        on:click={ () => { console.log('Maggic clock - pause'); } }
        data-tooltip="Faire une pause"
        data-placement="top"
    ><Coffee /><span class="sr-only">Pause</span></button>
    <time class="tmt-SessionTotalDuration" datetime="TODO">{ maggicClockDisplay.sessionTotalDuration }</time>
    <time class="tmt-WorkDuration" datetime="TODO">{ maggicClockDisplay.workDuration }</time>
    <time class="tmt-PauseDuration" datetime="TODO">{ maggicClockDisplay.pauseDuration }</time>
    <figure class="tmt-Ratio">
        <figcaption class="tmt-Ratio_Offset">{ maggicClockDisplay.offsetDuration } {#if maggicClockDisplay.offsetType === 'work'}<CalendarClock />{:else}<Coffee />{/if}</figcaption>
    </figure>
</section>

<style lang="scss">
    .tmt-MaggicClockLayout {
        margin-block-end: 0;
        display:grid;
        gap: calc(var(--spacing) * 0.5);

        @media (max-width:1199px) {
            grid-template-columns: 2fr 2fr 2fr;
            grid-template-rows: 1fr auto auto; 
            grid-template-areas:
                "work-btn session-counter pause-btn"
                "work-counter . pause-counter"
                "ratio-counter ratio-counter ratio-counter";
        }
        @media (min-width: 1200px) {
            grid-template-columns: 2fr 1fr 3fr 1fr 2fr;
            grid-template-rows: 1fr auto auto; 
            grid-template-areas:
                "work-btn . session-counter . pause-btn"
                "work-btn work-counter . pause-counter pause-btn"
                "ratio-counter ratio-counter ratio-counter ratio-counter ratio-counter";
        }
    }

    .tmt-SessionTotalDuration {
        grid-area: session-counter;
        justify-self: center;
        align-self: center;
        font-family: 'Courier New', monospace;
        font-size: 5vi;
    }
    .tmt-WorkDuration {
        grid-area: work-counter;

        @media (max-width:1199px) {
            justify-self: center;
            align-self: end;
        }
        @media (min-width: 1200px) {
            justify-self: start;
            align-self: end;
        }
    }
    .tmt-PauseDuration {
        grid-area: pause-counter;

        @media (max-width:1199px) {
            justify-self: center;
            align-self: end;
        }
        @media (min-width: 1200px) {
            justify-self: end;
            align-self: end;
        }
    }
    .tmt-Ratio {
        grid-area: ratio-counter;
        justify-self: center;
        align-self: end;
        margin-block-end: 0;

        .tmt-Ratio_Offset {
            padding-block: 0;
            font-size: 0.9rem;
        }
    }

    .tmt-Btn {
        margin-block-end: 0;
        border-radius: 50% 50%;
        aspect-ratio:1;

        &.tmt-Btn-work {
            grid-area: work-btn;
            flex:0 1 7.5rem;
        }
        &.tmt-Btn-pause {
            grid-area: pause-btn;
            flex:0 1 7.5rem;
        }
    }
</style>