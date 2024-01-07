<script lang="ts">
    import { durationHumanFormater, durationFormaterToString } from "../utils/time-formater";

    export let msDuration:number;
    export let style:string = '';

    $: timeParts = durationHumanFormater(msDuration);
    $: dateTimeAttribute = durationFormaterToString(msDuration, 'TECH');
</script>

<time class="dd-TimeDisplay" style={ style } datetime={ dateTimeAttribute } >
    {#each timeParts as part}
        <span class:dd-TimeDisplay_Value={ part.type === 'integer' } class:dd-TimeDisplay_Unit={ part.type === 'literal' }>{ part.value }</span>
    {/each}
</time>

<style lang="scss">
    .dd-TimeDisplay {
        line-height: 1;
        .dd-TimeDisplay_Value {
            font-family: 'Courier New', monospace;
            font-size: 8vi;
            @media (min-width:576px) {
                font-size: 6vi;
            }
        }

        .dd-TimeDisplay_Unit { 
            font-family: var(--font-family);
            font-size: 2vi;
            @media (min-width:576px) {
                font-size: 2vi;
            }
        }
    }
</style>