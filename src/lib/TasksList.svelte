<script lang="ts">
    import { tasksStore } from '../stores/tasks';
    import { onDestroy, afterUpdate } from 'svelte';
    import Sortable from 'sortablejs';

    let todosListElt:HTMLElement;

    // DRAG N DROP handling
    function initDragAndSort(todosList:HTMLElement) {
        // run once on mount
        const sortable = new Sortable(todosList, {
            group: "todos-list",
            chosenClass: "sortable-chosen",
            handle: ".sortable-handle",
            swap: true,
            animation: 200,
            onEnd(event) {
                if(event.newIndex === undefined || event.oldIndex === undefined) return;
                tasksStore.changeTaskOrder(event.oldIndex, event.newIndex)
            }
        });

        // lifecycle hooks
        afterUpdate(() => {
            // activate/deactivate depending on list size
            const itemsCount:number = todosListElt.children.length;
            sortable.option('disabled', (itemsCount <= 1));
        });
        onDestroy(() => sortable.destroy());
    }
</script>

<div use:initDragAndSort bind:this={ todosListElt } role="list">
    <slot />
</div>