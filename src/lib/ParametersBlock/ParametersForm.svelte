<script lang="ts">
    import { Save, X } from "lucide-svelte";

    function onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        alert('TODO parameters submit');
    }
</script>

<form class="pf-Form" on:submit={ onSubmit }>
    <article class="pf-ParamBlock">
        <header>
            <h2>Paramètres liste de tâches et matrice d'Eisenhower</h2>
        </header>
    </article>
    <article class="pf-ParamBlock">
        <header>
            <h2>Paramètres imputation du temps de travail</h2>
        </header>
    </article>
    <article class="pf-ParamBlock">
        <header>
            <h2>Paramètres POMODORO</h2>
        </header>
    </article>
    <footer class="pf-ParamFormActions">
        <button type="reset" class="secondary outline" disabled><X color="var(--secondary)" /> Annuler</button>
        <button type="submit" class="primary" disabled><Save color="var(--primary-inverse)" /> Appliquer les modifications</button>
    </footer>
</form>

<style lang="scss">

</style>