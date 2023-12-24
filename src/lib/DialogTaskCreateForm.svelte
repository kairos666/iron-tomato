<script lang="ts">
    import { type BaseTask, taskCreate } from "../stores/persistentTasks";
    import { Dialog, DialogOverlay, DialogTitle, DialogDescription, Switch, SwitchGroup, SwitchLabel, Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@rgossiaux/svelte-headlessui";
    import { AlarmClock, PlusCircle, Siren } from "lucide-svelte";
    import { appUIState } from "../stores/appUIState";
    import { tick } from "svelte";

    const { clearModal } = appUIState;
    const taskCategories = [
        { id: 'cat-1', name: "Boulot" },
        { id: 'cat-2', name: "Perso" },
        { id: 'cat-3', name: "projet A" },
        { id: 'cat-4', name: "projet B" },
        { id: 'cat-5', name: "projet C" },
    ];

    // handle pre filled form if edit instead of creation (if statement ensure re-evaluation between openings)
    let formTaskLabel:string = "";
    let formTaskDescription:string = "";
    let formTaskIsUrgent:boolean = false;
    let formTaskIsImportant:boolean = false;
    let formTaskCategory:string|null = null;

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
            <label for="task-cat">Catégorie</label>
            <Listbox bind:value={ formTaskCategory }>
                <ListboxButton>{ taskCategories.find(cat => cat.id === formTaskCategory)?.name ?? 'Sans catégorie' }</ListboxButton>
                <ListboxOptions>
                    {#each taskCategories as taskCategory (taskCategory.id)}
                        <ListboxOption value={ taskCategory.id }>{ taskCategory.name }</ListboxOption>
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