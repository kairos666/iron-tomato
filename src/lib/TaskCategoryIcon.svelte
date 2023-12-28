<script lang="ts">
    import { Hammer, Palmtree, Globe2, Grape, Rocket, Ban } from 'lucide-svelte';
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
        : (name === 'ban')
        ? Ban
        : null;
</script>
  
{#if Icon !== null}
    <svelte:component this={ Icon } {...$$props} />
{/if}