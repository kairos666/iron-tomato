import { writable } from 'svelte/store';

export type Task = {
    id: string
    label: string
    description?: string
    isActive: boolean
    isUrgent: boolean
    isImportant: boolean
}

const initTasksStore = () => {
    // initial data
    const initialTasks:Task[] = [
        { id: '1', label: 'faire une pizza', description: 'Sans anchois', isActive: true, isUrgent: false, isImportant: false },
        { id: '2', label: 'faire des gyozas', description: 'Sans les brûler', isActive: false, isUrgent: false, isImportant: false },
        { id: '3', label: 'faire des pâtes', isActive: false, isUrgent: false, isImportant: false }
    ];

    const { subscribe, set, update } = writable(initialTasks);

    // Store implementation
    return {
        subscribe,
        addTask: (newTask:Task) => {
            update(store => [...store, newTask]);
        },
        removeTask: (taskID2Delete:string) => {
            update(store => store.filter(task => task.id !== taskID2Delete));
        },
        editTask: (newlyEditedTask:Task) => {
            update(store => store.map(task => (task.id === newlyEditedTask.id) ? newlyEditedTask : task));
        },
        reset: () => set([])
    }
}

export const tasksStore = initTasksStore();