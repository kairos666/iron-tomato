<script lang="ts">
    import { BehaviorSubject, Subscription } from "rxjs";
    import { CalendarClock, Coffee } from "lucide-svelte";
    import { onDestroy, onMount } from "svelte";
    import { taskLogWork, type WorkItem } from "../../stores/persistentTasks";
    import { TaskMaggicCheckerObservable } from "../../utils/TaskMaggicCheckerObservable";
    import { durationFormaterToString, formatMsDuration } from "../../utils/time-formater";
    import MaggicRatio from "./MaggicRatio.svelte";
    import { parameterState } from "../../stores/parametersState";

    type MaggicClockDisplay = {
        sessionTotalDuration:string
        datetimeSessionTotalDuration:string
        workDuration:string
        datetimeWorkDuration:string
        pauseDuration:string
        datetimePauseDuration:string
    }

    export let taskID:string;
    let maggicTimerSubject:BehaviorSubject<string>|null = null;
    let maggicTimerSubscription:Subscription|null = null;
    let timerState:{ checkerState:string, sleepDuration:number, workDuration:number, pauseDuration:number, start:number, end:number } = { checkerState: 'NOT STARTED', sleepDuration: 0, workDuration: 0, pauseDuration: 0, start: -1, end: -1 };
    let maggicClockDisplay:MaggicClockDisplay = {
        sessionTotalDuration: "",
        datetimeSessionTotalDuration: "0",
        workDuration: "",
        datetimeWorkDuration: "0",
        pauseDuration: "",
        datetimePauseDuration: "0"
    }

    // GUI interactivity
    function onWorkHandler() {
        if(maggicTimerSubject) maggicTimerSubject.next('WORK');
    }

    function onPauseHandler() {
        if(maggicTimerSubject) maggicTimerSubject.next('PAUSE');
    }

    // handle work log
    onMount(() => {
        maggicTimerSubject = new BehaviorSubject('NOT STARTED');
        maggicTimerSubscription = TaskMaggicCheckerObservable(maggicTimerSubject).subscribe({
            next: timeCheck => { 
                const { state: checkerState, sleepDuration, workDuration, pauseDuration, start, end } = timeCheck;
                // hard data
                timerState = { checkerState, sleepDuration, workDuration, pauseDuration, start, end };
                // human display data
                const sessionDuration:number = workDuration + pauseDuration;
                maggicClockDisplay = {
                    sessionTotalDuration: (sessionDuration === 0) ? "" : formatMsDuration(sessionDuration, 'hour'),
                    datetimeSessionTotalDuration: durationFormaterToString(workDuration + pauseDuration, 'TECH'),
                    workDuration: (workDuration === 0) ? "" : formatMsDuration(workDuration, 'minute'),
                    datetimeWorkDuration: durationFormaterToString(workDuration, 'TECH'),
                    pauseDuration: (pauseDuration === 0) ? "" : formatMsDuration(pauseDuration, 'minute'),
                    datetimePauseDuration: durationFormaterToString(pauseDuration, 'TECH')
                }
            }
        });
    });

    onDestroy(() => {
        onTriggerWorkLog();
        if(maggicTimerSubscription) maggicTimerSubscription.unsubscribe();
        maggicTimerSubscription = null;
        maggicTimerSubject = null;
    })

    function onTriggerWorkLog() {
        // should trigger for : task achieve (unmount), task edit (unmount), back to dashboard (unmount), close browser tab (page unload), close browser (page unload)
        // leave early (no work logged or inferior to minThresholdLoggedWork)
        if(timerState.checkerState === 'NOT STARTED' || timerState.workDuration < $parameterState.minThresholdLoggedWork) return;

        // convert to work item
        const workItem:WorkItem = {
            start: timerState.start,
            end: timerState.end,
            duration: timerState.workDuration
        };
        
        // commit work items to task DB
        taskLogWork(taskID, workItem);
    }
</script>

<svelte:window on:beforeunload={ onTriggerWorkLog } />
<section class="tmt-MaggicClockLayout">
    <button 
        type="button" 
        class="tmt-Btn tmt-Btn-work" 
        disabled={ timerState.checkerState === 'WORK' }
        on:click={ onWorkHandler }
        data-tooltip="Travailler"
        data-placement="top"
    ><CalendarClock /><span class="sr-only">Imputer</span></button>
    <button 
        type="button" 
        class="tmt-Btn tmt-Btn-pause" 
        disabled={ timerState.checkerState !== 'WORK' }
        on:click={ onPauseHandler }
        data-tooltip="Faire une pause"
        data-placement="top"
    ><Coffee /><span class="sr-only">Pause</span></button>
    <time class="tmt-SessionTotalDuration" datetime={ maggicClockDisplay.datetimeSessionTotalDuration }>{ maggicClockDisplay.sessionTotalDuration }</time>
    <time class="tmt-WorkDuration" datetime={ maggicClockDisplay.datetimeWorkDuration }>{ maggicClockDisplay.workDuration }</time>
    <time class="tmt-PauseDuration" datetime={ maggicClockDisplay.datetimePauseDuration }>{ maggicClockDisplay.pauseDuration }</time>
    <MaggicRatio workDuration={ timerState.workDuration } pauseDuration={ timerState.pauseDuration } targetRatio={ $parameterState.mRatioWorkPause } style="grid-area:ratio-counter;justify-self:center;align-self:end;" />
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