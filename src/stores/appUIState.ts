import { writable } from 'svelte/store';
import { type Task } from './persistentTasks';

export type AppUIState = {
    listView:'todo'|'done'
    modal:undefined|'reset'|'task'|Task // no modal, reset, new task, edit task
}

const initAppUIState = () => {
    // initial data
    const initialState:AppUIState = {
        listView: 'todo',
        modal: undefined
    };

    const { subscribe, update } = writable(initialState);

    // Store implementation
    return {
        subscribe,
        setModal: (modalIdData:'reset'|'task'|Task) => {
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