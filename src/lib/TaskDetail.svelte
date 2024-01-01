<script lang="ts">
    import { AlarmClock, Ban, CheckCircle, Eraser, Pencil, Save, Siren, X } from "lucide-svelte";
    import { taskCategories } from "../constants/task-categories";
    import { type Task, taskEdit, taskById } from "../stores/persistentTasks";
    import TaskCategoryIcon from "./TaskCategoryIcon.svelte";
    import { exactDateFormatter, relativeHumanFormater } from "../constants/time-formater";
    import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions, Switch, SwitchGroup, SwitchLabel } from "@rgossiaux/svelte-headlessui";

    export let taskID:string
    let detailState:'show'|'edit' = 'show';
    let initialTask:Task|undefined = undefined;
    let creationDateHuman:{ exact:string, relative:string }|undefined = undefined;

    // handle pre filled form (if statement ensure re-evaluation between openings)
    let formTaskLabel:string = "";
    let formTaskDescription:string = "";
    let formTaskIsUrgent:boolean = false;
    let formTaskIsImportant:boolean = false;
    let formTaskCategory:string|null = null;

    // assign function necessary to avoid reactively updating when user change value in form
    function assignDefaultValue(initialData:Task|undefined, targetProperty:'label'|'description'|'isUrgent'|'isImportant'|'category') {
        switch(targetProperty) {
            case 'label': formTaskLabel = initialData?.label ?? ""; break;
            case 'description': formTaskDescription = initialTask?.description ?? ""; break;
            case 'isUrgent': formTaskIsUrgent = initialTask?.isUrgent ?? false; break;
            case 'isImportant': formTaskIsImportant = initialTask?.isImportant ?? false; break;
            case 'category': formTaskCategory = initialTask?.category ?? null; break;
        }
    }

    function loadTaskData() {
        taskById(taskID).then(task => { 
            // update task each time taskID is updated
            initialTask = task;
            // format dates for humans  
            creationDateHuman = {
                exact: exactDateFormatter.format(task.dateCreated),
                relative: relativeHumanFormater(task.dateCreated, new Date().getTime())
            };
        });
    }

    // handle initial loading of task data
    $: if(taskID) loadTaskData();
    $: categoryObj = taskCategories.find(taskCat => (taskCat.id === initialTask?.category)) ?? null; // get real task category info if necessary otherwise null

    // EDIT task
    $: if(detailState === 'edit') {
        assignDefaultValue(initialTask, 'label');
        assignDefaultValue(initialTask, 'description');
        assignDefaultValue(initialTask, 'isUrgent');
        assignDefaultValue(initialTask, 'isImportant');
        assignDefaultValue(initialTask, 'category');
    }
    $: editedCategory = taskCategories.find(cat => cat.id === formTaskCategory) ?? null;

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        const submittedFormData = new FormData((evt.target as HTMLFormElement));
        const resultLabel = submittedFormData.get('task-label');
        const resultDescription = submittedFormData.get('task-description');
        if(resultLabel === null || typeof resultLabel !== 'string' || resultDescription === null || typeof resultDescription !== 'string') throw new Error('TaskDetail edit - problem with retrieving form values');

        // format new task
        const editedTask:Task = { 
                ...(initialTask as Task),
                label: resultLabel, 
                description: (resultDescription !== "") ? resultDescription : undefined,
                isUrgent: formTaskIsUrgent,
                isImportant: formTaskIsImportant,
                category: formTaskCategory
        };

        // commit changes, reload updated task
        taskEdit(editedTask).then(() => loadTaskData());
        detailState = 'show'; // back to display in the meantime
    }
</script>

{#if detailState === 'show' && initialTask !== undefined}
    <div class="tskdtl-ShowLayout">
        <article class="tskdtl-Task">
            <header>
                <h2>{#if categoryObj !== null }<TaskCategoryIcon class="tskdtl-Cat" name={ categoryObj.icon } stroke-width="1" size="30" color={ categoryObj.color } /> {/if}{ initialTask.label }</h2>
                {#if initialTask.isImportant }<span class="tskdtl-ImportantBadge"><Siren stroke-width="1" size="15" color="var(--primary-inverse)" /> Important</span>{/if}
                {#if initialTask.isUrgent }<span class="tskdtl-UrgentBadge"><AlarmClock stroke-width="1" size="15" color="var(--primary-inverse)" /> Urgent</span>{/if}
                {#if creationDateHuman }<span class="tskdtl-TimeBadge">Créée <time datetime={ creationDateHuman.exact } data-tooltip={ creationDateHuman.exact } data-placement="top">{ creationDateHuman.relative }</time></span>{/if}
            </header>
            {#if initialTask.description}
                <p>{ initialTask.description }</p>
            {:else}
                <p><i>Pas de description pour cette tâche.</i></p>
            {/if}
        </article>
        <menu class="tskdtl-Actions">
            <button type="button" class="primary"><CheckCircle color="var(--primary-inverse)" /> Achever</button>
            <button type="button" class="outline" on:click={ () => detailState = 'edit' }><Pencil color="var(--primary)" /> Modifier</button>
            <button type="button" class="secondary outline"><Eraser color="var(--secondary)" /> Supprimer</button>
        </menu>
    </div>
{:else if detailState === 'edit' && initialTask !== undefined}
    <form class="tskdtl-EditLayout" on:submit={ onSubmit }>
        <article class="tskdtl-TaskEdit">
            <header>
                <label for="task-label">Libellé</label>
                <input type="text" id="task-label" name="task-label" placeholder="Intitulé de la tâche" value={ formTaskLabel } required />
                {#if creationDateHuman }<span class="tskdtl-TimeBadge">Créée <time datetime={ creationDateHuman.exact } data-tooltip={ creationDateHuman.exact } data-placement="top">{ creationDateHuman.relative }</time></span>{/if}
            </header>
            <label for="task-description">Description</label>
            <textarea id="task-description" name="task-description" placeholder="Descriptif détaillé optionnel de la tâche" value={ formTaskDescription } />
            <Listbox class="tlbx-Listbox" bind:value={ formTaskCategory }>
                <ListboxLabel>Catégorie</ListboxLabel>
                <ListboxButton class="tlbx-Button">
                    {#if (editedCategory !== null)}
                        <TaskCategoryIcon name={ editedCategory.icon } stroke-width="1" size="20" color="var(--icon-color)"/> { editedCategory.name }
                    {:else}
                        <Ban stroke-width="1" size="20" color="var(--icon-color)" /> sans catégorie
                    {/if}
                </ListboxButton>
                <ListboxOptions class="tlbx-OptionsList">
                    <ListboxOption class="tlbx-Option" value={ null }><Ban stroke-width="1" size="20" color="var(--icon-color)" /> sans catégorie</ListboxOption>
                    {#each taskCategories as taskCategory (taskCategory.id)}
                        <ListboxOption class="tlbx-Option" value={ taskCategory.id }><TaskCategoryIcon name={ taskCategory.icon } stroke-width="1" size="20" color="var(--icon-color)"/> { taskCategory.name }</ListboxOption>
                    {/each}
                </ListboxOptions>
            </Listbox>
            <div class="tlbx-SwitchesLayout">
                <SwitchGroup class="switch-group" style="flex:1 0 calc(50% - var(--spacing) * 0.5);">
                    <SwitchLabel class="switch-label"><AlarmClock /> Marquer urgent</SwitchLabel>
                    <Switch bind:checked={formTaskIsUrgent} class={formTaskIsUrgent ? "switch switch-enabled" : "switch switch-disabled"}>
                        <span class="sr-only">Marquer urgent</span>
                        <span class="toggle" class:toggle-on={ formTaskIsUrgent } class:toggle-off={ !formTaskIsUrgent } />
                    </Switch>
                </SwitchGroup>
                <SwitchGroup class="switch-group" style="flex:1 0 calc(50% - var(--spacing) * 0.5);">
                    <SwitchLabel class="switch-label"><Siren /> Marquer important</SwitchLabel>
                    <Switch bind:checked={formTaskIsImportant} class={formTaskIsImportant ? "switch switch-enabled" : "switch switch-disabled"}>
                        <span class="sr-only">Marquer important</span>
                        <span class="toggle" class:toggle-on={ formTaskIsImportant } class:toggle-off={ !formTaskIsImportant } />
                    </Switch>
                </SwitchGroup>
            </div>
            <footer class="tskdtl-EditActionsMenu">
                <button type="reset" class="secondary outline" on:click={ () => detailState = 'show' }><X color="var(--secondary)" /> Annuler</button>
                <button type="submit" class="primary"><Save color="var(--primary-inverse)" /> Appliquer les modifications</button>
            </footer>
        </article>
    </form>
{:else}
    <p class="empty-state-emphasized" aria-busy="true">Chargement de la tâche N°{ taskID }</p>
{/if}

<style lang="scss">
    // show
    .tskdtl-ShowLayout {
        display:grid;
        width: 100%;
        height: 100%;
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
        grid-template-areas: 
            "actions"
            "task";
        column-gap: var(--spacing);
        row-gap: var(--spacing);

        @media (min-width:576px) {
            grid-template-columns: 3fr 1fr;
            grid-template-rows: auto;
            grid-template-areas: 
                "task actions";
        }
    }

    .tskdtl-Task { 
        grid-area: task;
        padding: var(--spacing);
        margin:0;

        header {
            padding: var(--spacing);
            margin:calc(var(--spacing) * -1) calc(var(--spacing) * -1) var(--spacing);
        }
        header h2 {
            margin-block-end: 0;
        }
    }
    .tskdtl-Actions { 
        grid-area: actions;
        margin:0;
        padding-inline-start: 0;

        @media (max-width:575px) {
            display: flex;
            gap: var(--spacing);

            button {
                margin-block-end: 0;
                padding: calc(var(--spacing) * 0.5);
            }
        }
    }

    // edit
    .tskdtl-TaskEdit {
        padding: var(--spacing);
        margin:0;

        header {
            padding: var(--spacing);
            margin:calc(var(--spacing) * -1) calc(var(--spacing) * -1) var(--spacing);
        }

        footer {
            padding: var(--spacing);
            margin: var(--spacing) calc(var(--spacing) * -1) calc(var(--spacing) * -1);
        }
    }

    .tskdtl-EditActionsMenu {
        display:flex;
        gap: var(--spacing);

        button {
            margin-block-end: 0;

            @media (max-width:575px) {
                padding: calc(var(--spacing) * 0.5);
            }
        }
    }

    .tlbx-SwitchesLayout {
        margin-block-start: calc(var(--spacing) * 2);

        @media (min-width:576px) {
            display:flex;
            flex-wrap: wrap;
            gap: var(--spacing);
        }
    }

    // transverse
    .tskdtl-UrgentBadge, .tskdtl-ImportantBadge {
        padding: 1px 6px;
        font-weight: 400;
        border-radius: var(--border-radius);
        color: var(--primary-inverse);
    }
    .tskdtl-UrgentBadge {
        background-color: var(--urgent-color);
    } 
    .tskdtl-ImportantBadge {
        background-color: var(--important-color);
    }
    .tskdtl-TimeBadge {
        padding: 1px 6px;
        font-weight: 400;
        border-radius: var(--border-radius);
        color: var(--primary-inverse);
        background-color: var(--muted-color);

        time { border: none }
    }
</style>