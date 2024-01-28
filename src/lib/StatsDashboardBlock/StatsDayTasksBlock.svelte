<script lang="ts">
    import { CheckCircle, Star } from "lucide-svelte";
    import { appUIState } from "../../stores/appUIState";
    import TaskCategoryIcon from "../TaskCategoryIcon.svelte";
    import PieChart from "../PieChart.svelte";

    const dayTaskStats = [
        { label: `Tâche label A`, percent: 43, color: "red" },
        { label: `Tâche label B`, percent: 21, color: "green" },
        { label: `Tâche label C`, percent: 19, color: "blue" },
        { label: `Tâche label D`, percent: 19, color: "aquamarine" }
    ];
</script>

<article class="sdt-Block">
    <header>
        <h2>Activité du jour par tâche</h2>
    </header>
    <menu class="sdt-DayTasks" class:sdt-DayTasks-lite={ $appUIState.isMobileViewport }>
        {#if !$appUIState.isMobileViewport}
        <div class="sdt-TasksDistrib">
            <PieChart statistics={ dayTaskStats } baseSize={ 200 } holeSize={ 75 } />
        </div>
        {/if}
        <button class="sdt-TaskBtn">
            <h3 class="sdt-TaskBtn_Title">Tâche label A</h3>
            <p class="sdt-TaskBtn_Desc">01h02 travail, 00h14 pause</p>
            <span class="sdt-TaskBtn_Cat"><TaskCategoryIcon name="hammer" stroke-width="1" size="20" color="var(--h6-color)" /></span>
            <span class="sdt-TaskBtn_Done"><CheckCircle size="20" color="var(--h6-color)" /></span>
        </button>
        <button class="sdt-TaskBtn">
            <h3 class="sdt-TaskBtn_Title">Tâche label B</h3>
            <p class="sdt-TaskBtn_Desc">01h02 travail, 00h14 pause</p>
            <span class="sdt-TaskBtn_Cat"><TaskCategoryIcon name="grape" stroke-width="1" size="20" color="var(--h6-color)" /></span>
        </button>
        <button class="sdt-TaskBtn">
            <h3 class="sdt-TaskBtn_Title">Tâche label C</h3>
            <p class="sdt-TaskBtn_Desc">01h02 travail, 00h14 pause</p>
            <span class="sdt-TaskBtn_Cat"><TaskCategoryIcon name="hammer" stroke-width="1" size="20" color="var(--h6-color)" /></span>
            <span class="sdt-TaskBtn_Done"><CheckCircle size="20" color="var(--h6-color)" /></span>
            <span class="sdt-TaskBtn_New"><Star size="20" color="var(--h6-color)" /></span>
        </button>
        <button class="sdt-TaskBtn">
            <h3 class="sdt-TaskBtn_Title">Tâche label D</h3>
            <p class="sdt-TaskBtn_Desc">01h02 travail, 00h14 pause</p>
            <span class="sdt-TaskBtn_New"><Star size="20" color="var(--h6-color)" /></span>
        </button>
    </menu>
</article>

<style lang="scss">
    @import "../../styles/page-detail-block";

    .sdt-Block {
        @include pdb_BlockStyle(h2, false);
        margin: var(--outer-large-spacing) 0;
        overflow: hidden;
    }

    .sdt-DayTasks {
        padding:0;
        margin:calc(var(--spacing) * -1);

        @media (max-width:575px) {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }
        @media (min-width:576px) {
            display: grid;
            grid-template-columns: 1fr 2fr;
            grid-auto-rows: auto;
        }
    }

    .sdt-TasksDistrib { 
        grid-column: 1 / 2; 
        grid-row: 1 / 666;
        justify-self: center;
        align-self: center;
    }

    .sdt-TaskBtn {
        grid-column: 2 / 3;
        margin-block-end: 0;
        padding: 10px;
        border-radius: 0;
        background-color: transparent;
        border: none;
        display: grid;
        gap: 10px;
        grid-template-columns: 20px 1fr 20px 20px;
        grid-template-rows: auto auto;
        grid-template-areas: 
            "cat title done created"
            "cat desc desc desc";

        &:hover, &:focus, &:active {
            background-color: var(--primary-focus);
        }

        @media (min-width:576px) {
            border-left:1px solid var(--card-border-color);
        }

        .sdt-TaskBtn_Title { 
            grid-area: title;
            color: var(--h1-color);
            text-align: left;
            margin-block-end: 0;
        }
        .sdt-TaskBtn_Desc { 
            grid-area: desc; 
            color: var(--h6-color);
            text-align: left;
            margin-block-end: 0;
        }

        .sdt-TaskBtn_Cat {
            grid-area: cat;
            align-self: center;
        }
        .sdt-TaskBtn_Done {
            grid-area: done;
        }
        .sdt-TaskBtn_New {
            grid-area: created;
        }

        & + .sdt-TaskBtn {
            border-top:1px solid var(--card-border-color);
        }
    }
</style>