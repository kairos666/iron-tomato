import { writable } from 'svelte/store';

type ModalCodes = 'reset'|'task-create';
type ModalTaskCodes = `${'task-detail'|'task-edit'}-${number}`;

export type AppUIState = {
    tasksShown:'todo'|'done'
    viewMode:'list'|'matrix'
    modal:undefined|ModalCodes|ModalTaskCodes // no modal, reset, new task, edit task
    isMobileViewport:boolean // adapt to viewport width (based on pico css breakpoint)
}

const initAppUIState = () => {
    const mediaQueryList:MediaQueryList = window.matchMedia("(min-width: 576px)");

    // initial data
    const initialState:AppUIState = {
        tasksShown: 'todo',
        viewMode: 'list',
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
            update(state => ({ ...state, viewMode: targetViewMode }))
        }
    }
}

export const appUIState = initAppUIState();