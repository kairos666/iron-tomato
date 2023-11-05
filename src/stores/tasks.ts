import { writable } from 'svelte/store';

export type Task = {
    id: string
    label: string
    description?: string
    isActive: boolean
    isUrgent: boolean
    isImportant: boolean
    isDone: boolean
    dateCreated : number
    dateDone?: number
}

const initTasksStore = () => {
    // initial data
    const initialTasks:Task[] = [];

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
        changeTaskOrder: (taskCurrentIndex:number, taskTargetIndex:number) => {
            update(store => {
                const resultTaskArray:Task[] = [...store];
                const taskToBeMoved:Task = resultTaskArray.splice(taskCurrentIndex, 1)[0];
                resultTaskArray.splice(taskTargetIndex, 0, taskToBeMoved);

                return resultTaskArray;
            });
        },
        reset: () => set([])
    }
}

export const tasksStore = initTasksStore();