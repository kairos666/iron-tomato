<script lang="ts">
    import { Hammer, Palmtree, Globe2, Grape, Rocket } from 'lucide-svelte';
    export let name:string;
    
    $: Icon = (name === 'hammer')
        ? Hammer
        : (name === 'palmtree')
        ? Palmtree
        : (name === 'globe-2')
        ? Globe2
        : (name === 'grape')
        ? Grape
        : (name === 'rocket')
        ? Rocket
        : null;
</script>
  
{#if Icon !== null}
    <svelte:component this={ Icon } {...$$props} />
{/if}