import { writable } from 'svelte/store';

const parametersLocalStorageKey:string = 'app-parameters';
/**
 * all parameters in flat object
 * prefixes list:
 * p = pomodoro
 * m = maggic clock
 */
export type ParameterState = {
    minThresholdLoggedWork: number // ms of minimal work duration to be logged
    mRatioWorkPause: number // ratio work / pause 
}

export const defaultParameterState:ParameterState = {
    minThresholdLoggedWork: 1000 * 60 * 5,
    mRatioWorkPause: 5 // 5 minutes work / 1 minute pause (classic pomodoro 25 minutes work / 5 min short pause) => ratio = 5
}

function evaluateInitialState():ParameterState {
    try {
        const localStateString:string|null = localStorage.getItem(parametersLocalStorageKey);
        if(localStateString === null) {
            console.log('No user parameters found, apply defaults');
            return defaultParameterState;
        }
        return JSON.parse(localStateString);
    } catch (error) {
        console.warn('Local storage couldn\'t be read, maybe not valid JSON');
        return defaultParameterState;
    }
}

const initParameterState = () => {
    // fetch locally stored parameters for initiating store
    let initialState:ParameterState = evaluateInitialState();
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
