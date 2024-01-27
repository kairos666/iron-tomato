<script lang="ts">
    import { BehaviorSubject, Subscription } from "rxjs";
    import { CalendarClock, Coffee } from "lucide-svelte";
    import { onDestroy, onMount } from "svelte";
    import { taskLogWork, type WorkItem } from "../../stores/persistentTasks";
    import { maggicCheckerObservableBuilder, type MaggicCheck } from "../../utils/maggicCheckerObservable";
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
    export let startedSession:boolean = false;
    export const resetSession = () => { dismantleTimerSession(); setupTimerSession(); }
    const initialMaggicState:MaggicCheck = { state: 'NOT STARTED', workDuration: 0, pauseDuration: 0, start: -1, end: -1 };
    const initialMaggicClockDisplay:MaggicClockDisplay = { sessionTotalDuration: "", datetimeSessionTotalDuration: "0", workDuration: "", datetimeWorkDuration: "0", pauseDuration: "", datetimePauseDuration: "0" };
    let maggicTimerSubject:BehaviorSubject<'NOT STARTED'|'WORK'|'PAUSE'>|null = null;
    let maggicTimerSubscription:Subscription|null = null;
    let timerState:MaggicCheck;
    let maggicClockDisplay:MaggicClockDisplay;

    // GUI interactivity
    function onWorkHandler() { if(maggicTimerSubject) maggicTimerSubject.next('WORK'); }
    function onPauseHandler() { if(maggicTimerSubject) maggicTimerSubject.next('PAUSE'); }

    // update timer state
    function onTimerUpdate(timeCheck:MaggicCheck) {
        // hard data
        const { state, workDuration, pauseDuration } = timerState = timeCheck;
                
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

        // update session status
        startedSession = (state !== 'NOT STARTED');
    }

    
    function setupTimerSession() {
        timerState = { ...initialMaggicState };
        maggicClockDisplay = { ...initialMaggicClockDisplay };
        maggicTimerSubject = (new BehaviorSubject('NOT STARTED') as BehaviorSubject<'NOT STARTED'|'WORK'|'PAUSE'>);
        maggicTimerSubscription = maggicCheckerObservableBuilder(maggicTimerSubject, { ...initialMaggicState }, 500).subscribe({ next: onTimerUpdate });
    }

    function dismantleTimerSession() {
        onTriggerWorkLog();
        if(maggicTimerSubscription) maggicTimerSubscription.unsubscribe();
        maggicTimerSubscription = null;
        maggicTimerSubject = null;
    }

    // handle work log
    function onTriggerWorkLog() {
        // should trigger for : task achieve (unmount), task edit (unmount), back to dashboard (unmount), close browser tab (page unload), close browser (page unload)
        // leave early (no work logged or inferior to minThresholdLoggedWork)
        if(timerState.state === 'NOT STARTED' || timerState.workDuration < $parameterState.minThresholdLoggedWork) return;

        // convert to work item
        const workItem:WorkItem = {
            start: timerState.start,
            end: timerState.end,
            wDuration: timerState.workDuration,
            pDuration: timerState.pauseDuration
        };
        
        // commit work items to task DB
        taskLogWork(taskID, workItem);
    }

    // LIFECYCLE actions
    onMount(setupTimerSession);
    onDestroy(dismantleTimerSession);
</script>

<svelte:window on:beforeunload={ evt => { evt.preventDefault(); evt.returnValue = "Enregistrer la session de travail avant de quitter ?"; onTriggerWorkLog(); } } />
<section class="tmt-MaggicClockLayout">
    {#if (timerState && maggicClockDisplay)}
    <button 
        type="button" 
        class="tmt-Btn tmt-Btn-work" 
        disabled={ timerState.state === 'WORK' }
        aria-pressed={ timerState.state === 'WORK' }
        on:click={ onWorkHandler }
        data-tooltip="Travailler"
        data-placement="top"
    ><span class="tmt-Btn_IconWrapper"><CalendarClock size="30%" absoluteStrokeWidth={ true } color="var(--icon-color)" /></span><span class="sr-only">Imputer</span></button>
    <button 
        type="button" 
        class="tmt-Btn tmt-Btn-pause" 
        disabled={ timerState.state !== 'WORK' }
        aria-pressed={ timerState.state === 'PAUSE' }
        on:click={ onPauseHandler }
        data-tooltip="Faire une pause"
        data-placement="top"
    ><span class="tmt-Btn_IconWrapper"><Coffee size="30%" absoluteStrokeWidth={ true } color="var(--icon-color)" /></span><span class="sr-only">Pause</span></button>
    <time class="tmt-SessionTotalDuration" datetime={ maggicClockDisplay.datetimeSessionTotalDuration }>{ maggicClockDisplay.sessionTotalDuration }</time>
    <time class="tmt-WorkDuration" datetime={ maggicClockDisplay.datetimeWorkDuration }>{ maggicClockDisplay.workDuration }</time>
    <time class="tmt-PauseDuration" datetime={ maggicClockDisplay.datetimePauseDuration }>{ maggicClockDisplay.pauseDuration }</time>
    <MaggicRatio workDuration={ timerState.workDuration } pauseDuration={ timerState.pauseDuration } targetRatio={ $parameterState.mRatioWorkPause } style="grid-area:ratio-counter;justify-self:center;align-self:end;" />
    {/if}
</section>

<style lang="scss">
    @import "../../styles/heart-beat-animation";
    @import "../../styles/wobble-animation";
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
        font-weight: 700;
        text-align: center;
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

        .tmt-Btn_IconWrapper { display:inline-block; }

        &.tmt-Btn-work {
            --icon-color: #fff;
            grid-area: work-btn;
            flex:0 1 7.5rem;
            background-color: var(--work-color);
            border-color: var(--work-color);

            &:disabled {
                --icon-color: var(--work-color);
                background-color: var(--muted-border-color);
            }
        }
        &.tmt-Btn-pause {
            --icon-color: #fff;
            grid-area: pause-btn;
            flex:0 1 7.5rem;
            background-color: var(--pause-color);
            border-color: var(--pause-color);

            &:disabled {
                --icon-color: var(--pause-color);
                background-color: var(--muted-border-color);
            }
        }

        &[aria-pressed="true"] {
            animation-name: heartBeat;
            animation-duration: 0.5s;
            animation-timing-function: ease-in-out;

            .tmt-Btn_IconWrapper {
                animation-name: wobble;
                animation-duration: 3s;
                animation-timing-function: ease-in-out;
                animation-iteration-count: infinite;
            }
        }
    }
</style>