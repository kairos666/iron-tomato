<script lang="ts">
    import { CalendarClock, Coffee, Scale } from "lucide-svelte";
    import { formatMsDuration } from "../../utils/time-formater";

    type MaggicRatioData = {
        currentRatioPerc:number
        balancedPerc:number
        offsetType:'WORK'|'PAUSE'|'NONE'
        offsetDuration:string
        offsetSide:'left'|'right'
    }

    export let workDuration:number
    export let pauseDuration:number
    export let targetRatio:number
    export let style:string
    let maggicRatioData:MaggicRatioData = { currentRatioPerc:0, balancedPerc:50, offsetType:'NONE', offsetDuration:"", offsetSide:'left' };
    $: maggicRatioData = evaluateRatioData(workDuration, pauseDuration, targetRatio);

    function evaluateRatioData(workMs:number, pauseMs:number, balancedRatio:number):MaggicRatioData {
        const currentRatio:number = (pauseMs !== 0) ? workMs / pauseMs : Number.POSITIVE_INFINITY;
        const balancedPerc:number = Math.round((1000 * balancedRatio) / (balancedRatio + 1)) / 10; // percentage with 1 decimal accuracy
        const currentRatioPerc:number = (currentRatio !== Number.POSITIVE_INFINITY) ? Math.round((1000 * currentRatio) / (currentRatio + 1)) / 10 : 100;
        const offsetDurationMs:number = (currentRatio < balancedRatio)
            ? Math.abs(balancedRatio * pauseMs - workMs)
            : Math.abs(balancedRatio * pauseMs - workMs)/balancedRatio;
        const offsetDuration:string = formatMsDuration(offsetDurationMs, 'hour');
        const offsetType:'WORK'|'PAUSE'|'NONE' = (currentRatio === Number.POSITIVE_INFINITY || offsetDurationMs < 1000 * 30) // only show offset when at least 30 sec offset exists
            ? 'NONE'
            : (balancedRatio > currentRatio)
            ? 'WORK'
            : (balancedRatio < currentRatio)
            ? 'PAUSE'
            : 'NONE';
        const offsetSide:'left'|'right' = (offsetType === 'WORK' && currentRatioPerc > 25)
            ? 'left'
            : (offsetType === 'PAUSE' && currentRatioPerc < 75)
            ? 'right'
            : (currentRatioPerc <= 25)
            ? 'right'
            : 'left';

        return { currentRatioPerc, balancedPerc, offsetType, offsetDuration, offsetSide };
    }
</script>

<figure class="tmt-Ratio" style={ style } style:--current-ratio={ `${ maggicRatioData.currentRatioPerc / 100 }` } style:--current-ratio-perc={ `${ maggicRatioData.currentRatioPerc }%` } style:--balanced-perc={ `${ maggicRatioData.balancedPerc }%` }>
    <span class="tmt-Ratio_Offset">{#if maggicRatioData.offsetType !== 'NONE'}<span class="inner" class:inner-work={ maggicRatioData.offsetType === 'WORK' } class:inner-pause={ maggicRatioData.offsetType === 'PAUSE' } class:inner-left={ maggicRatioData.offsetSide === 'left' } class:inner-right={ maggicRatioData.offsetSide === 'right' }>{ maggicRatioData.offsetDuration } {#if maggicRatioData.offsetType === 'WORK'}<CalendarClock color="var(--work-color)"/>{:else if maggicRatioData.offsetType === 'PAUSE'}<Coffee color="var(--pause-color)" />{/if}</span>{/if}</span>
    <span class="tmt-Ratio_RatioBar"><span class="tmt-Ratio_RatioInnerBar"></span></span>
    <span class="tmt-Ratio_BalancedRatioThreshold"><span class="inner"><Scale color={ 'var(--muted-color)' } /></span></span>
</figure>

<style lang="scss">
    .tmt-Ratio {
        margin-block-end:0;
        display:flex;
        width:100%;
        flex-direction: column;
        gap: calc(var(--spacing) * 0.5);
        align-items: stretch;

        .tmt-Ratio_Offset {
            font-size: 0.9rem;
            height:1.75rem;

            .inner {
                position:relative;
                display:inline-block;
                left: var(--current-ratio-perc);
                transition: left 0.3s ease;

                &.inner-left {
                    transform: translateX(-100%);
                }
                &.inner-right {
                    transform: translateX(0);
                }
                &.inner-work {
                    color: var(--work-color);
                }
                &.inner-pause {
                    color: var(--pause-color);
                }
            }
        }

        .tmt-Ratio_RatioBar {
            width:100%;
            height: 1rem;
            border-radius: 0.5rem;
            border:1px solid var(--muted-border-color);
            background-color: var(--pause-color);
            overflow:hidden;
            text-align: left;

            .tmt-Ratio_RatioInnerBar {
                display:block;
                height:100%;
                width:100%;
                background-color: var(--work-color);
                transform-origin: 0;
                transform: scaleX(var(--current-ratio));
                transition: transform 0.3s ease;
            }
        }

        .tmt-Ratio_BalancedRatioThreshold {
            height:1.75rem;

            .inner {
                position:relative;
                display:inline-block;
                transform: translateX(-50%);
                left: var(--balanced-perc);

                &:before {
                    content: '';
                    position:absolute;
                    transform: translate(-50%, -50%);
                    left:50%;
                    top:-3px;
                    width: 0px;
                    height: 0px;
                    border-style: solid;
                    border-width: 0 5px 5px 5px;
                    border-color: transparent transparent var(--muted-color) transparent;
                }
            }
        }
    }
</style>