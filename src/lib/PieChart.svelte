<script lang="ts">
    export let statistics:{ label:string, percent:number, color:string }[];
    export let baseSize:number = 100;
    export let bgColor:string = 'transparent';
    export let holeSize:number = 0;
    let statisticsExtended:{ label:string, percent:number, color:string, dashArray:string, offsetRotation:string }[] = [];

    $: statisticsExtended = statistics.map((arc, index, array) => {
        const circumference:number = 2 * Math.PI * (baseSize / 4);
        const previousCumulatedPercents:number = array.slice(0, index).reduce((acc, curr) => acc + curr.percent, 0);

        return {
            ...arc,
            dashArray: `${ circumference * (arc.percent / 100) } ${ circumference * ((100 - arc.percent) / 100) }`,
            offsetRotation: `${ 360 * (previousCumulatedPercents / 100) }deg`
        }
    })
    $: {
        const cumulatedArcs:number = statistics.reduce((acc, curr) => acc + curr.percent, 0);
        if(cumulatedArcs > 100) console.warn(`more than 100% cumulated arcs provided in PieChart`);
    }
</script>

<svg width={ baseSize } height={ baseSize }>
    {#each statisticsExtended as arc }
        <circle 
            r={ baseSize / 4 } 
            cx={ baseSize / 2 } 
            cy={ baseSize / 2 } 
            style:stroke-width={ (baseSize / 2) - holeSize }
            style:stroke={ arc.color }
            style:stroke-dasharray={ arc.dashArray }
            style:transform={ `rotate(${ arc.offsetRotation })` }
            fill={ bgColor } 
        />
    {/each}
</svg>

<style lang="scss">
    svg {
        transform: rotate(-90deg);
        border-radius: 50%;
    }

    circle {
        transform-origin: center;
    }
</style>