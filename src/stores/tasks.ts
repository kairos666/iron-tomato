import { writable } from 'svelte/store';

export type Task = {
    id: string
    label: string
    description?: string
    isActive: boolean
    isUrgent: boolean
    isImportant: boolean
    dateCreated : number
    dateDone?: number
}

// MOCK TASK BUILDER
const mockTask:() => Task = () => {
    const timestamp = new Date().getTime();
    const id = String(Math.round(timestamp / (Math.random() * 10000000)));

    const result:Task = {
        id,
        label: `Tâche factice ${ id }`,
        isActive : false,
        isUrgent : false,
        isImportant : false,
        dateCreated : timestamp
    }

    if((Math.random() - 0.5) > 0)  {
        result.description = `description d'une tâche factice`;
    }

    return result;
}

const initTasksStore = () => {
    // initial data
    const initialTasks:Task[] = [ mockTask(), mockTask(), mockTask() ];

    const { subscribe, set, update } = writable(initialTasks);

    // Store implementation
    return {
        subscribe,
        createTask: (newTask:Task) => {
            update(store => [...store, newTask]);
        },
        deleteTask: (taskID2Delete:string) => {
            update(store => store.filter(task => task.id !== taskID2Delete));
        },
        editTask: (newlyEditedTask:Task) => {
            update(store => store.map(task => (task.id === newlyEditedTask.id) ? newlyEditedTask : task));
        },
        achieveTask: (taskID2Achieve:string) => {
            update(store => store.map(task => (task.id === taskID2Achieve) ? { ...task, isDone : true } : task));
        },
        reopenTask: (taskID2Reopen:string) => {
            update(store => store.map(task => (task.id === taskID2Reopen) ? { ...task, isDone : false } : task));
        },
        reset: () => set([])
    }
}

export const tasksStore = initTasksStore();