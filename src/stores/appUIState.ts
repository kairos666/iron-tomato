import { writable } from 'svelte/store';
import { allPossibleCategories } from '../constants/task-categories';

type ModalCodes = 'reset'|'task-create';
type ModalTaskCodes = `task-delete-${number}`;

export type AppUIState = {
    mainView:'dashboard'|'task-detail'|'parameters-settings'
    activeTask: number|null
    tasksShown:'todo'|'done'
    viewMode:'list'|'matrix'
    categoryFilters:string[]
    modal:undefined|ModalCodes|ModalTaskCodes // no modal, reset, new task, edit task
    isMobileViewport:boolean // adapt to viewport width (based on pico css breakpoint)
}

const initAppUIState = () => {
    const mediaQueryList:MediaQueryList = window.matchMedia("(min-width: 576px)");

    // initial data
    const initialState:AppUIState = {
        mainView: 'dashboard',
        activeTask: null,
        tasksShown: 'todo',
        viewMode: 'list',
        categoryFilters: [],
        modal: undefined,
        isMobileViewport: !mediaQueryList.matches
    };

    const { subscribe, update } = writable(initialState);

    // react to viewport resize
    mediaQueryList.onchange = evt => update(state => {
        const isMobileViewport:boolean = !evt.matches;

        // force list view in mobile
        const viewMode:'list'|'matrix' = (isMobileViewport) ? 'list' : state.viewMode;
        
        return { ...state, viewMode, isMobileViewport }
    });

    // Store implementation
    return {
        subscribe,
        setModal: (modalIdData:ModalCodes|ModalTaskCodes) => {
            update(state => ({ ...state, modal:modalIdData }));
        },
        clearModal: () => {
            update(state => ({ ...state, modal: undefined }));
        },
        changeTasksShown: (targetTasksType:'todo'|'done') => {
            update(state => ({ ...state, tasksShown: targetTasksType }));
        },
        changeViewMode: (targetViewMode:'list'|'matrix') => {
            update(state => ({ ...state, viewMode: targetViewMode }));
        },
        changeCategoryFilters: (filters:string[]) => {
            const hasAllPossibleFilters:boolean = (filters.length >= allPossibleCategories.length);
            update(state => ({ ...state, categoryFilters: (hasAllPossibleFilters) ? [] : filters }));
        },
        clearCategoryFilters: () => {
            update(state => ({ ...state, categoryFilters: [] }));
        },
        changeMainView: (newMainView:'dashboard'|'task-detail'|'parameters-settings', newActiveTask?:number) => {
            if(newMainView === 'task-detail' && typeof newActiveTask !== 'number') {
                console.warn('invalid command : task-detail without active task number');
                return;
            }
            update(state => ({ ...state, mainView: newMainView, activeTask: newActiveTask ?? null }));
        }
    }
}

export const appUIState = initAppUIState();