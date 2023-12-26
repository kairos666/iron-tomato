<script lang="ts">
    import { type BaseTask, taskCreate } from "../stores/persistentTasks";
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription, Switch, SwitchGroup, SwitchLabel, Listbox, ListboxButton, ListboxOptions, ListboxOption, ListboxLabel } from "@rgossiaux/svelte-headlessui";
    import { AlarmClock, Ban, PlusCircle, Siren } from "lucide-svelte";
    import { appUIState } from "../stores/appUIState";
    import { tick } from "svelte";
    import TaskCategoryIcon from "./TaskCategoryIcon.svelte";
    import { taskCategories } from "../constants/task-categories";

    const { clearModal } = appUIState;

    // handle pre filled form if edit instead of creation (if statement ensure re-evaluation between openings)
    let formTaskLabel:string = "";
    let formTaskDescription:string = "";
    let formTaskIsUrgent:boolean = false;
    let formTaskIsImportant:boolean = false;
    let formTaskCategory:string|null = null;

    $: currentCategory = taskCategories.find(cat => cat.id === formTaskCategory) ?? null;

    // reset values for each new form
    function resetFields() {
        formTaskLabel = "";
        formTaskDescription = "";
        formTaskIsUrgent = false;
        formTaskIsImportant = false;
        formTaskCategory = null;
    }

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        const submittedFormData = new FormData((evt.target as HTMLFormElement));
        const resultLabel = submittedFormData.get('task-label');
        const resultDescription = submittedFormData.get('task-description');
        if(resultLabel === null || typeof resultLabel !== 'string' || resultDescription === null || typeof resultDescription !== 'string') throw new Error('DialogTaskForm - problem with retrieving form values');
        
        // format new task
        const newTask:BaseTask = {
            label: resultLabel,
            description: (resultDescription !== "") ? resultDescription : undefined, 
            isActive: false,
            isUrgent: formTaskIsUrgent,
            isImportant: formTaskIsImportant,
            isDone: false,
            category: formTaskCategory
        }

        // commit changes, reset and close
        taskCreate(newTask).then(scrollToBottomOfPage);
        resetFields();
        clearModal();
    }

    function onClose() {
        // reset and close
        resetFields();
        clearModal();
    }

    // ensure bottom of page to enable chaining task creation
    async function scrollToBottomOfPage() {
        await tick();
        window.scrollTo(0, document.body.scrollHeight);
    }
</script>

<Dialog open={ ($appUIState.modal === 'task-create') } on:close={ onClose }>
    <DialogOverlay class="dlg-Overlay" />
    <article class="dlg-Container">
        <hgroup>
            <DialogTitle><PlusCircle size={ 32 } /> Créer une tâche</DialogTitle>
            <DialogDescription>Définir et ajouter une nouvelle tâche à la liste.</DialogDescription>
        </hgroup>
        <form on:submit={ onSubmit }>
            <label for="task-label">Libellé</label>
            <input type="text" id="task-label" name="task-label" placeholder="Intitulé de la tâche" value={ formTaskLabel } required />
            <label for="task-description">Description</label>
            <textarea id="task-description" name="task-description" placeholder="Descriptif détaillé optionnel de la tâche" value={ formTaskDescription } />
            <Listbox class="tlbx-Listbox" bind:value={ formTaskCategory }>
                <ListboxLabel>Catégorie</ListboxLabel>
                <ListboxButton class="tlbx-Button">
                    {#if (currentCategory !== null)}
                        <TaskCategoryIcon name={ currentCategory.icon } stroke-width="1" size="20" color="var(--icon-color)"/> { currentCategory.name }
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
            <SwitchGroup class="switch-group">
                <SwitchLabel class="switch-label"><AlarmClock /> Marquer urgent</SwitchLabel>
                <Switch bind:checked={formTaskIsUrgent} class={formTaskIsUrgent ? "switch switch-enabled" : "switch switch-disabled"}>
                    <span class="sr-only">Marquer urgent</span>
                    <span class="toggle" class:toggle-on={ formTaskIsUrgent } class:toggle-off={ !formTaskIsUrgent } />
                </Switch>
            </SwitchGroup>
            <SwitchGroup class="switch-group">
                <SwitchLabel class="switch-label"><Siren /> Marquer important</SwitchLabel>
                <Switch bind:checked={formTaskIsImportant} class={formTaskIsImportant ? "switch switch-enabled" : "switch switch-disabled"}>
                    <span class="sr-only">Marquer important</span>
                    <span class="toggle" class:toggle-on={ formTaskIsImportant } class:toggle-off={ !formTaskIsImportant } />
                </Switch>
            </SwitchGroup>
            <menu class="dlg-Container_ActionsMenu">
                <button type="reset" class="secondary outline" on:click={ onClose }>Annuler</button>
                <button type="submit">Créer la tâche</button>
            </menu>
        </form>
    </article>
</Dialog> 