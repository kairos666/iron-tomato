<script lang="ts">
    import { BehaviorSubject, type Subscription } from "rxjs";
    import { onDestroy, onMount } from "svelte";
    import { TaskCheckerObservable } from "../utils/TaskCheckerObservable";
    import { CalendarClock, Coffee } from "lucide-svelte";
    import DurationDisplay from "./DurationDisplay.svelte";

    export let taskID:string;
    let checkTimerSubject:BehaviorSubject<string>|null = null;
    let checkTimerSubscription:Subscription|null = null;
    let timerState:{ checkerState:string, loggedTime:number } = { checkerState: 'NOT STARTED', loggedTime: 0 };   

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
                timerState = { checkerState: timeCheck.state, loggedTime: timeCheck.totalDuration - timeCheck.sleepDuration };
            }
        });
    })

    onDestroy(() => {
        if(checkTimerSubscription) checkTimerSubscription.unsubscribe();
        checkTimerSubscription = null;
        checkTimerSubject = null;
    })
</script>

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
    }

    .tst-Btn {
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