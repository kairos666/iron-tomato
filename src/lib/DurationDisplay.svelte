<script lang="ts">
    import { durationHumanFormater } from "../utils/time-formater";

    export let msDuration:number;
    export let style:string = '';

    $: timeParts = durationHumanFormater(msDuration);
</script>

<time class="dd-TimeDisplay" style={ style } datetime="pouet" >
    {#each timeParts as part}
        <span class:dd-TimeDisplay_Value={ part.type === 'integer' } class:dd-TimeDisplay_Unit={ part.type === 'literal' }>{ part.value }</span>
    {/each}
</time>

<style lang="scss">
    .dd-TimeDisplay {
        line-height: 1;
        .dd-TimeDisplay_Value {
            font-family: 'Courier New', monospace;
            font-size: 5vi;
        }

        .dd-TimeDisplay_Unit { 
            font-size: 1vi;
            font-family: var(--font-family);
        }
    }
</style>