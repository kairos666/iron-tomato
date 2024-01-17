<script lang="ts">
    import { Save, X } from "lucide-svelte";

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        alert('TODO parameters submit');
    }
</script>

<form class="pf-Form" on:submit={ onSubmit }>
    <fieldset class="pf-ParamBlock">
        <legend>Paramètres liste de tâches et matrice d'Eisenhower</legend>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
    </fieldset>
    <fieldset class="pf-ParamBlock">
        <legend>Paramètres imputation du temps de travail</legend>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
    </fieldset>
    <fieldset class="pf-ParamBlock">
        <legend>Paramètres MAGGIC clock</legend>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
    </fieldset>
    <fieldset class="pf-ParamBlock">
        <legend>Paramètres POMODORO</legend>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
    </fieldset>
    <menu class="pf-ParamFormActions">
        <button type="reset" class="secondary outline" disabled><X color="var(--secondary)" /> Annuler</button>
        <button type="submit" class="primary" disabled><Save color="var(--primary-inverse)" /> Appliquer les modifications</button>
    </menu>
</form>

<style lang="scss">
    @import "../../styles/variables.scss";
    .pf-Form {
        margin-block-end: 0;
        display:grid;
        gap: var(--spacing);

        @media (max-width:1199px) {
            grid-template-columns: 1fr;
            grid-auto-rows: auto; 
        }
        @media (min-width: 1200px) {
            grid-template-columns: 5fr 3fr;
            grid-template-rows: repeat(4, auto);
        }
    }
    .pf-ParamBlock {
        margin-block: 0;
    }
    .pf-ParamFormActions {
        padding-inline-start: 0;
        margin-block: 0;
        @media (max-width:1199px) {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing);

            > button { flex:1 1 calc(50% - var(--spacing) * 0.5); margin-block-end: 0; }
        }
        @media (min-width: 1200px) {
            position: sticky;
            top: calc(var(--spacing) + $header-height);
            align-self: start;
            grid-column: 2 / 3;
            grid-row: 1 / 5;

            button { margin-block-end: var(--spacing); }
        }
    }
</style>