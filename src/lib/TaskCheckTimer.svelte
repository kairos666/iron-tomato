<script lang="ts">
    import { BehaviorSubject, type Subscription } from "rxjs";
    import { onDestroy, onMount } from "svelte";
    import { TaskCheckerObservable } from "../utils/TaskCheckerObservable";
    import { CalendarClock, Coffee } from "lucide-svelte";

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
                console.info(`sleepState : ${ timeCheck.sleepState } - (total: ${ timeCheck.totalDuration }, sleep: ${ timeCheck.sleepDuration }, non sleep work duration: ${ timeCheck.totalDuration - timeCheck.sleepDuration })`, new Date());
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
    <time class="tst-SessionWorkTime" datetime="14:12" >{ timerState.loggedTime / 1000 }<span class="tst-SessionWorkTime_Units">secondes</span></time>
</section>

<style lang="scss">
    .tst-CheckTimerLayout {
        display:flex;
        gap: var(--spacing);
        justify-content: stretch;
        align-items: flex-end;
    }

    .tst-SessionWorkTime {
        flex:1 1 auto;
        font-family: 'Courier New', monospace;
        font-size: 8vi;
        line-height: 1;
        text-align: right;

        .tst-SessionWorkTime_Units { 
            font-size: 2vi;
            font-family: var(--font-family);
        }
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