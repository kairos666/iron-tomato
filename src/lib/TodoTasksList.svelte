<script lang="ts">
    import { PartyPopper } from 'lucide-svelte';
    import { unfinishedTasksList, taskReorder, type Task as TaskType } from '../stores/persistentTasks';
    import { appUIState } from '../stores/appUIState';
    import Sortable from 'sortablejs';
    import Task from './Task.svelte';
    
    let todosUrImListElt:HTMLElement;
    let todosImListElt:HTMLElement;
    let todosUrListElt:HTMLElement;
    let todosListElt:HTMLElement;
    let urgentAndImportantTasks:TaskType[] = [];
    let importantTasks:TaskType[] = [];
    let urgentTasks:TaskType[] = [];
    let backburnerTasks:TaskType[] = [];

    $: isReady = (appUIState !== undefined && $unfinishedTasksList !== undefined)
    $: if(isReady) {
        // category filtering
        const currentFilters = [...$appUIState.categoryFilters];
        const filterFunction = (currentFilters.length === 0)
            ? () => true // everyhting pass
            : (task:TaskType) => currentFilters.includes(task.category ?? 'none'); // only registered filters

        const result:TaskType[][] = $unfinishedTasksList.filter(filterFunction).reduce((arr, task) => {
            switch(true) {
                case (task.isImportant && task.isUrgent): arr[0].push(task); break;
                case (task.isImportant && !task.isUrgent): arr[1].push(task); break;
                case (!task.isImportant && task.isUrgent): arr[2].push(task); break;
                default:
                    arr[3].push(task);
            }

            return arr;
        }, [([] as TaskType[]), ([] as TaskType[]), ([] as TaskType[]), ([] as TaskType[])]);
        urgentAndImportantTasks = result[0]; // already sorted in store
        importantTasks = result[1]; // already sorted in store
        urgentTasks = result[2]; // already sorted in store
        backburnerTasks = result[3]; // already sorted in store
    }

    function findListById(listID:string) {
        switch (listID) {
            case "important-and-urgent": return urgentAndImportantTasks;
            case "important": return importantTasks;
            case "urgent": return urgentTasks;
            case "backburner": return backburnerTasks;
            default:
                console.warn(`unknwon tasks list: ${ listID }`);
                return [];
        }
    }

    function reorderFromSameList(oldIndex:number, newIndex:number, listID:string) {
        // concerned list
        const tasksList:TaskType[] = findListById(listID);

        // replicate reordering
        const workTaskArray:{ id:string, order:number }[] = tasksList.map(task => ({ id: task.id, order: task.order }));
        const taskToBeMoved:{ id:string, order:number } = workTaskArray.splice(oldIndex, 1)[0];
        workTaskArray.splice(newIndex, 0, taskToBeMoved);

        // reassign order values
        const resultTaskArray = workTaskArray.map((taskPartial, index) => ({ id: taskPartial.id, order: index + 1 }));

        taskReorder(resultTaskArray);
    }

    function reorderFromDifferentLists(oldIndex:number, newIndex:number, fromlistID:string, toListID:string) {
        // concerned list
        const fromTasksList:TaskType[] = findListById(fromlistID);
        const toTasksList:TaskType[] = findListById(toListID);

        // extract moved task (from list)
        const movedTask:TaskType = fromTasksList[oldIndex];

        // inject in temp list (to list clone)
        const newTargetTaskArray:TaskType[] = [...toTasksList];
        newTargetTaskArray.splice(newIndex, 0, movedTask);

        // reassign values
        const isImportant:boolean = (toListID === "important-and-urgent" || toListID === "important");
        const isUrgent:boolean = (toListID === "important-and-urgent" || toListID === "urgent");
        const resultTaskArray = newTargetTaskArray.map((taskPartial, index) => ({ 
            id: taskPartial.id, 
            order: index + 1,
            isImportant,
            isUrgent
        }));

        taskReorder(resultTaskArray);
    }

    // DRAG N DROP handling
    function initDragAndSort(list:HTMLElement) {
        // run once on mount
        const sortable = new Sortable(list, {
            group: "todos-list",
            chosenClass: "sortable-chosen",
            handle: ".sortable-handle",
            filter: '.filtered',
            scroll: true,
            forceAutoScrollFallback: true,
            bubbleScroll: false,
            scrollSensitivity: 50,
            animation: 200,
            onEnd(event) {
                if(event.newIndex === undefined || event.oldIndex === undefined || event.from === undefined || event.to === undefined) {
                    console.warn(`can't reorder tasks from index: ${ event.oldIndex } to index: ${ event.newIndex }`);
                    return
                };

                const { from, to, oldIndex, newIndex } = event;
                const isSameListReorder:boolean = (from === to);
                const fromListID:string = (from as HTMLElement).getAttribute("data-list") ?? "unknown-list";
                const toListID:string = (to as HTMLElement).getAttribute("data-list") ?? "unknown-list";
                if(isSameListReorder) {
                    reorderFromSameList(oldIndex, newIndex, fromListID);
                } else {
                    reorderFromDifferentLists(oldIndex, newIndex, fromListID, toListID);
                }
            }
        });

        // lifecycle hooks
        return {
            update() {
                // activate/deactivate depending on list size
                const itemsCount:number = todosListElt?.children?.length ?? 0;
                sortable.option('disabled', (itemsCount <= 1));
            },
            destroy() { sortable.destroy() }
        }
    }
</script>

{#if !isReady}
    <div role="list">
        <p class="empty-state-emphasized" aria-busy="true">Chargement des tâches</p>
    </div>
{:else}
    <div class="lst-Container" class:lst-Container-matrix={ ($appUIState.viewMode === 'matrix') }>
        <h3 class="lst-ListHeader" data-header="important-and-urgent">
            <span class="lst-ListHeader_Label">A faire en premier</span>
            <span class="lst-ImportantBadge">Important</span>
            <span class="lst-UrgentBadge">Urgent</span>
        </h3>
        <div use:initDragAndSort bind:this={ todosUrImListElt } class="lst-List" role="list" data-list="important-and-urgent">
            {#each urgentAndImportantTasks as task (task.id)}
                <Task data={ task } />
            {/each}
            <p class="lst-empty-state filtered"><PartyPopper size="15" strokeWidth="1" /> Aucune tâche importante et urgente</p>
        </div>
        <h3 class="lst-ListHeader" data-header="important">
            <span class="lst-ListHeader_Label">A faire, mais moins urgent</span>
            <span class="lst-ImportantBadge">Important</span>
        </h3>
        <div use:initDragAndSort bind:this={ todosImListElt } class="lst-List" role="list" data-list="important">
            {#each importantTasks as task (task.id)}
                <Task data={ task } />
            {/each}
            <p class="lst-empty-state filtered"><PartyPopper size="15" strokeWidth="1" /> Aucune tâche importante</p>
        </div>
        <h3 class="lst-ListHeader" data-header="urgent">
            <span class="lst-ListHeader_Label">A déléguer ou planifier</span>
            <span class="lst-UrgentBadge">Urgent</span>
        </h3>
        <div use:initDragAndSort bind:this={ todosUrListElt } class="lst-List" role="list" data-list="urgent">
            {#each urgentTasks as task (task.id)}
                <Task data={ task } />
            {/each}
            <p class="lst-empty-state filtered"><PartyPopper size="15" strokeWidth="1" /> Aucune tâche urgente</p>
        </div>
        <h3 class="lst-ListHeader" data-header="backburner"><span class="lst-ListHeader_Label">A ne pas oublier, mais ça peut attendre</span></h3>
        <div use:initDragAndSort bind:this={ todosListElt } class="lst-List" role="list" data-list="backburner">
            {#each backburnerTasks as task (task.id)}
                <Task data={ task } />
            {/each}
            <p class="lst-empty-state filtered"><PartyPopper size="15" strokeWidth="1" /> Aucune tâche</p>
        </div>
    </div>
{/if}

<style lang="scss">
    .lst-Container {
        &.lst-Container-matrix {
            display:grid;
            width: 100%;
            height: 100%;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto 1fr var(--spacing) auto 1fr;
            grid-template-areas: 
                "iu-header i-header"
                "iu-list i-list"
                ". ."
                "u-header b-header"
                "u-list b-list";
            column-gap: var(--spacing);
            row-gap: 0;
        }

        [data-header="important-and-urgent"] { grid-area: iu-header; }
        [data-header="important"] { grid-area: i-header; }
        [data-header="urgent"] { grid-area: u-header; }
        [data-header="backburner"] { grid-area: b-header; }
        [data-list="important-and-urgent"] { grid-area: iu-list; }
        [data-list="important"] { grid-area: i-list; }
        [data-list="urgent"] { grid-area: u-list; }
        [data-list="backburner"] { grid-area: b-list; }
    }
    .lst-ListHeader {
        margin-block: 0 var(--task-spacing);
        padding-inline: var(--task-spacing);
        font-size: var(--task-font-size);
        display:grid;
        grid-template-columns: [important-start] 1fr [important-end title-start] 4fr [title-end urgent-start] 1fr [urgent-end];
        grid-template-rows: auto;
        align-items: center;
        gap: var(--task-spacing);

        .lst-ListHeader_Label { 
            grid-area: title;
            text-align: center;
        }
    }

    .lst-UrgentBadge, .lst-ImportantBadge {
        padding: 1px 4px;
        font-weight: 400;
        border-radius: var(--border-radius);
        color: var(--primary-inverse);
    }
    .lst-UrgentBadge {
        grid-area: urgent;
        justify-self: end;
        background-color: var(--urgent-color);
    } 
    .lst-ImportantBadge {
        grid-area: important;
        justify-self: start;
        background-color: var(--important-color);
    }
    .lst-empty-state {
        display: none;
        margin: var(--task-spacing) 0;
        padding: calc(var(--task-spacing) * 2) var(--block-spacing-horizontal);
        border-radius: var(--border-radius);
        background: var(--blockquote-border-color);
        font-size: var(--task-font-size);

        &:only-child { display: block; }

        .lst-Container-matrix &:only-child {
            position:absolute;
            inset: 5px 0;
            border: 3px dashed var(--muted-color);
            display:flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin-block: 0;
        }
    }
    
    .lst-List {
        display: flex;
        flex-direction: column;
        gap: var(--task-spacing);

        .lst-Container-matrix & { 
            position:relative;
            min-height: 1rem;
            overflow-y: auto;
            overflow-x: hidden;
        }
    }
</style>