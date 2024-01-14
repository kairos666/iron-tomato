import { writable } from 'svelte/store';

const parametersLocalStorageKey:string = 'app-parameters';
/**
 * all parameters in flat object
 * prefixes list:
 * p = pomodoro
 */
export type ParameterState = {
    pWorkDuration: number // ms of work session for pomodoro
    pShortPauseDuration: number // ms of short pause session for pomodoro
    pLongPauseDuration: number // ms of long pause session for pomodoro
    pLongPauseFrequency: number // long pause every N pause
    pAutoFlow: boolean // auto switch from state, or manual
    pPlaySound: boolean // play sounds or not
}

export const defaultParameterState:ParameterState = {
    pWorkDuration: 1000 * 60 * 60 * 25,
    pShortPauseDuration: 1000 * 60 * 60 * 5,
    pLongPauseDuration: 1000 * 60 * 60 * 15,
    pLongPauseFrequency: 4,
    pAutoFlow: false,
    pPlaySound: false
}

const initParameterState = () => {
    // fetch locally stored parameters for initiating store
    let initialState:ParameterState = defaultParameterState;
    try {
        const localStateString:string|null = localStorage.getItem(parametersLocalStorageKey);
        if(localStateString === null) return;
        initialState = JSON.parse(localStateString);
    } catch (error) {
        console.warn('Local storage couldn\'t be read, maybe not valid JSON');
        initialState = defaultParameterState;
    }

    const { subscribe, update } = writable(initialState);

    return {
        subscribe,
        changeParameters: function(newPropertiesObj:Partial<ParameterState>) {
            update(state => ({ ...state, ...newPropertiesObj }));
        }
    }
}

export const parameterState = initParameterState();

/**
 * Auto subscribe and store parameters for each change
 * state must be serializable in JSON
 */
 parameterState?.subscribe(stateObj => localStorage.setItem(parametersLocalStorageKey, JSON.stringify(stateObj)));