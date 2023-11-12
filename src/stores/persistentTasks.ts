import Dexie, { liveQuery, type Table } from 'dexie';

export type BaseTask = {
    label: string
    description?: string
    isActive: boolean
    isUrgent: boolean
    isImportant: boolean
    isDone: boolean
}

export type Task = BaseTask & {
    id: string
    order: number
    dateCreated : number
    dateDone?: number
}

// INDEXDB handler class
class DexieTasks extends Dexie {
    tasks!: Table<Task>;

    constructor() {
        super('iron-tomato-tasks');
        this.version(1).stores({ tasks: '++id, order' });
    }
}
const db = new DexieTasks();

// all tasks stores
export const allTasksList = liveQuery(() => db.tasks.orderBy('order').toArray());
export const doneTasksList = liveQuery(() => db.tasks.orderBy('order').toArray().then(tasks => tasks.filter(task => task.isDone)));
export const unfinishedTasksList = liveQuery(() => db.tasks.orderBy('order').toArray().then(tasks => tasks.filter(task => !task.isDone)));

// task action - CREATE
export async function taskCreate(newTask:BaseTask) {
    try {
        const tasksCount:number = await db.tasks.count();
        const order:number = 1 + tasksCount; // newly created task is always last before reorder
        const dateCreated = new Date().getTime();
        const id = await db.tasks.add(({ ...newTask, dateCreated, order } as Task)); // is base task but id is generated
        console.info(`Task "${ newTask.label }" ADDED (id = ${ id })`);
    } catch (error) {
        throw new Error(`Failed to create new task ${ newTask.label } : ${ error }`);
    }
}

// task action - DELETE
export async function taskDelete(taskID:string) {
    try {
        await db.tasks.delete(taskID);
        console.info(`Task ${ taskID } DELETED`);
    } catch (error) {
        throw new Error(`Failed to delete task ${ taskID } : ${ error }`);
    }
}

// task action - EDIT
export async function taskEdit(editedTask:Task) {
    try {
        await db.tasks.update(editedTask.id, editedTask);
        console.info(`Task ${ editedTask.id } EDITED`);
    } catch (error) {
        throw new Error(`Failed to edit task ${ editedTask.id } : ${ error }`);
    }
}

// task action - ACHIEVE
export async function taskAchieve(taskID:string) {
    try {
        await db.tasks.update(taskID, { isDone : true, dateDone: new Date().getTime() });
        console.info(`Task ${ taskID } marked DONE`);
    } catch (error) {
        throw new Error(`Failed to mark task ${ taskID } done : ${ error }`);
    }
}

// task action - REOPEN
export async function taskReopen(taskID:string) {
    try {
        await db.tasks.update(taskID, { isDone : false, dateDone: undefined });
        console.info(`Task ${ taskID } marked UNDONE`);
    } catch (error) {
        throw new Error(`Failed to mark task ${ taskID } undone : ${ error }`);
    }
}

// task action - REORDER
export async function taskReorder(reorderAssignements:{ id:string, order:number }[]) {
    try {
        await db.tasks.bulkUpdate(reorderAssignements.map(taskPartial => ({ 
            key: taskPartial.id, 
            changes: {
                order: taskPartial.order
            } 
        })));
        console.info(`REORDERED tasks`);
    } catch (error) {
        throw new Error(`Failed to reorder tasks ${ error }`);
    }
}

// task action - RESET
export async function tasksReset() {
    try {
        await db.tasks.clear();
        console.info(`CLEARED all tasks`);
    } catch (error) {
        throw new Error(`Failed to reset tasks collection : ${ error }`);
    }
}