import Dexie, { liveQuery, type Table } from 'dexie';

export type BaseTask = {
    label: string
    description?: string
    isUrgent: boolean
    isImportant: boolean
    isDone: boolean
    category: string|null
}

export type WorkItem = {
    start: number
    end: number
    wDuration: number
    pDuration: number
}

export type Task = BaseTask & {
    id: string
    order: number
    dateCreated : number
    dateDone?: number
    workHistory?: WorkItem[]
}

// INDEXDB handler class
class DexieTasks extends Dexie {
    tasks!: Table<Task>;

    constructor() {
        super('iron-tomato-tasks');
        this.version(2).stores({ tasks: '++id, order' });
    }
}
const db = new DexieTasks();

// all tasks stores
export const allTasksList = liveQuery(() => db.tasks.orderBy('order').toArray());
export const doneTasksList = liveQuery(() => db.tasks.orderBy('order').toArray().then(tasks => tasks.filter(task => task.isDone)));
export const unfinishedTasksList = liveQuery(() => db.tasks.orderBy('order').toArray().then(tasks => tasks.filter(task => !task.isDone)));

// custom live query for specific task
export const getLiveQueryForTaskId = (taskID:string) => liveQuery(() => db.tasks.get(parseInt(taskID)));

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
        await db.tasks.delete(parseInt(taskID));
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
        await db.tasks.update(parseInt(taskID), { isDone : true, dateDone: new Date().getTime() });
        console.info(`Task ${ taskID } marked DONE`);
    } catch (error) {
        throw new Error(`Failed to mark task ${ taskID } done : ${ error }`);
    }
}

// task action - REOPEN
export async function taskReopen(taskID:string) {
    try {
        const tasksCount:number = await db.tasks.count();
        const order:number = 1 + tasksCount; // reopen task should be last
        await db.tasks.update(parseInt(taskID), { isDone : false, dateDone: undefined, order });
        console.info(`Task ${ taskID } marked UNDONE`);
    } catch (error) {
        throw new Error(`Failed to mark task ${ taskID } undone : ${ error }`);
    }
}

// task action - REORDER
export async function taskReorder(reorderAssignements:{ id:string, order:number, isImportant?:boolean, isUrgent?:boolean }[]) {
    try {
        await db.tasks.bulkUpdate(reorderAssignements.map(taskPartial => {
            const key:string = taskPartial.id;

            const changes:any = { order: taskPartial.order };
            if(taskPartial.isImportant !== undefined) changes.isImportant = taskPartial.isImportant;
            if(taskPartial.isUrgent !== undefined) changes.isUrgent = taskPartial.isUrgent;

            return { key, changes };
        }));
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

// task action - CLEAR all done tasks
export async function tasksDoneReset() {
    try {
        const deletionTargetsIds = await db.tasks.toArray()
            .then(allTasks => allTasks.filter(task => task.isDone))         // filter only done tasks
            .then(allDoneTasks => allDoneTasks.map(task => task.id));       // array of IDs to be deleted
        if(deletionTargetsIds.length > 0) await db.tasks.bulkDelete(deletionTargetsIds);
        console.info(`CLEARED all done tasks`);
    } catch (error) {
        throw new Error(`Failed to reset done tasks collection : ${ error }`);
    }
}

// task action - GET by ID
export async function taskById(taskId:string) {
    try {
        const result = await db.tasks.get(parseInt(taskId));
        if(result === undefined) throw new Error('task not found in DB');
        console.info(`fetched task with id#${ taskId }`);

        return result;
    } catch (error) {
        throw new Error(`Failed to get task with id#${ taskId } : ${ error }`);
    }
}

// task action - log work duration to history
export async function taskLogWork(taskId:string, workItems:WorkItem|WorkItem[]) {
    const taskID:number = parseInt(taskId);
    const isMonoWorkSession:boolean = !Array.isArray(workItems);
    const targetTask = await db.tasks.get(taskID);

    if(isNaN(taskID)) throw new Error(`task ID : ${ taskId } not recognized`);
    if(targetTask === undefined) throw new Error('task not found in DB');

    // deep clone targeted task + add workHistory init
    const deepCloneWorkHistory:WorkItem[] = (targetTask.workHistory)
        ? JSON.parse(JSON.stringify(targetTask.workHistory))
        : [];
    let result:Task = { ...targetTask, workHistory: deepCloneWorkHistory };

    // process task update
    if(isMonoWorkSession) {
        result.workHistory?.push((workItems as WorkItem));
    } else {
        result.workHistory?.push(...(workItems as WorkItem[]));
    }

    try {
        await db.tasks.update(taskID, result);
        console.info(`Task ${ taskId } WORK LOGGED (${ (workItems as WorkItem[])?.length ?? 1 }x work items)`);
    } catch (error) {
        throw new Error(`Failed to log work on task ${ taskId } : ${ error }`);
    }
}