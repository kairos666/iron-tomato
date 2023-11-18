import { writable } from 'svelte/store';

type ModalCodes = 'reset'|'task-create';
type ModalTaskCodes = `${'task-detail'|'task-edit'}-${number}`;

export type AppUIState = {
    listView:'todo'|'done'
    modal:undefined|ModalCodes|ModalTaskCodes // no modal, reset, new task, edit task
    isMobileViewport:boolean // adapt to viewport width (based on pico css breakpoint)
}

const initAppUIState = () => {
    const mediaQueryList:MediaQueryList = window.matchMedia("(min-width: 576px)");

    // initial data
    const initialState:AppUIState = {
        listView: 'todo',
        modal: undefined,
        isMobileViewport: !mediaQueryList.matches
    };

    const { subscribe, update } = writable(initialState);

    // react to viewport resize
    mediaQueryList.onchange = evt => update(state => ({ ...state, isMobileViewport: !evt.matches }));

    // Store implementation
    return {
        subscribe,
        setModal: (modalIdData:ModalCodes|ModalTaskCodes) => {
            update(state => ({ ...state, modal:modalIdData }));
        },
        clearModal: () => {
            update(state => ({ ...state, modal: undefined }));
        },
        changeListView: (targetView:'todo'|'done') => {
            update(state => ({ ...state, listView: targetView }));
        }
    }
}

export const appUIState = initAppUIState();