<script lang="ts">
    import { BehaviorSubject, type Subscription } from "rxjs";
    import { onDestroy, onMount } from "svelte";
    import { TaskCheckerObservable } from "../utils/TaskCheckerObservable";
    import { CalendarClock, Coffee } from "lucide-svelte";
    import DurationDisplay from "./DurationDisplay.svelte";
    import { taskLogWork, type WorkItem } from "../stores/persistentTasks";

    export let taskID:string;
    let checkTimerSubject:BehaviorSubject<string>|null = null;
    let checkTimerSubscription:Subscription|null = null;
    let timerState:{ checkerState:string, loggedTime:number, start:number, end:number } = { checkerState: 'NOT STARTED', loggedTime: 0, start: -1, end: -1 };
    const minThresholdLoggedWork:number = 1000 * 60 * 5; // 5 minutes minimum otherwise ignored

    function onWorkHandler() {
        if(checkTimerSubject) checkTimerSubject.next('WORK');
    }

    function onPauseHandler() {
        if(checkTimerSubject) checkTimerSubject.next('PAUSE');
    }

    onMount(() => {
        checkTimerSubject = new BehaviorSubject('NOT STARTED');
        checkTimerSubscription = TaskCheckerObservable(checkTimerSubject).subscribe({
            next: timeCheck => { 
                timerState = { checkerState: timeCheck.state, loggedTime: timeCheck.totalDuration - timeCheck.sleepDuration, start: timeCheck.start, end: timeCheck.end };
            }
        });
    })

    onDestroy(() => {
        onTriggerWorkLog();
        if(checkTimerSubscription) checkTimerSubscription.unsubscribe();
        checkTimerSubscription = null;
        checkTimerSubject = null;
    })

    function onTriggerWorkLog() {
        // should trigger for : task achieve (unmount), task edit (unmount), back to dashboard (unmount), close browser tab (page unload), close browser (page unload)
        // leave early (no work logged or inferior to minThresholdLoggedWork)
        if(timerState.checkerState === 'NOT STARTED' || timerState.loggedTime < minThresholdLoggedWork) return;

        // convert to work item
        const workItem:WorkItem = {
            start: timerState.start,
            end: timerState.end,
            duration: timerState.loggedTime
        };
        
        // commit work items to task DB
        taskLogWork(taskID, workItem);
    }
</script>

<svelte:window on:beforeunload={ onTriggerWorkLog } />
<section class="tst-CheckTimerLayout">
    <button 
        type="button" 
        class="tst-Btn tst-Btn-work" 
        disabled={ timerState.checkerState === 'WORK' } 
        on:click={ onWorkHandler }
        data-tooltip="Travailler"
        data-placement="top"
    ><CalendarClock /><span class="sr-only">Imputer</span></button>
    <button 
        type="button" 
        class="tst-Btn tst-Btn-pause" 
        disabled={ timerState.checkerState !== 'WORK' } 
        on:click={ onPauseHandler }
        data-tooltip="Faire une pause"
        data-placement="top"
    ><Coffee /><span class="sr-only">Pause</span></button>
    <DurationDisplay msDuration={ timerState.loggedTime } style="flex:1 1 auto; text-align:right;" />
</section>

<style lang="scss">
    .tst-CheckTimerLayout {
        display:flex;
        gap: var(--spacing);
        justify-content: stretch;
        align-items: flex-end;
        margin-block-end: 0;
    }

    .tst-Btn {
        margin-block-end: 0;
        border-radius: 50% 50%;
        aspect-ratio:1;

        &.tst-Btn-work {
            flex:0 1 10rem;
        }
        &.tst-Btn-pause {
            flex:0 1 5rem;
        }
    }
</style>