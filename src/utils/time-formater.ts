const sPerMinute = 60;
const sPerHour = sPerMinute * 60;
const sPerDay = sPerHour * 24;
const sPerMonth = sPerDay * 30;
const sPerYear = sPerDay * 365;
const language:string = 'fr-FR';

export const exactDateFormatter:Intl.DateTimeFormat = new Intl.DateTimeFormat(language, {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric"
});

export const exactDateShortFormatter:Intl.DateTimeFormat = new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "numeric",
    year: "numeric"
});

export const exactDurationFormater:Intl.DateTimeFormat = new Intl.DateTimeFormat(language, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
});

export const simplifiedDateFormatter:Intl.DateTimeFormat = new Intl.DateTimeFormat(language, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

export const relativeFromToHumanFormater = function(fromTimestamp:number, toTimestamp:number, formatterOpts:Intl.RelativeTimeFormatOptions = { style: 'short', numeric: 'auto' }):string {
    const elapsedSecondsSinceCreation:number = (fromTimestamp - toTimestamp) / 1000;
    const relativeDateFormatter:Intl.RelativeTimeFormat = new Intl.RelativeTimeFormat(language, formatterOpts);

    return (Math.abs(elapsedSecondsSinceCreation) > sPerYear)
        ? relativeDateFormatter.format(Math.floor(elapsedSecondsSinceCreation / sPerYear), 'years')
        : (Math.abs(elapsedSecondsSinceCreation) > sPerMonth)
        ? relativeDateFormatter.format(Math.floor(elapsedSecondsSinceCreation / sPerMonth), 'months')
        : (Math.abs(elapsedSecondsSinceCreation) > sPerDay)
        ? relativeDateFormatter.format(Math.floor(elapsedSecondsSinceCreation / sPerDay), 'days')
        : (Math.abs(elapsedSecondsSinceCreation) > sPerHour)
        ? relativeDateFormatter.format(Math.floor(elapsedSecondsSinceCreation / sPerHour), 'hours')
        : relativeDateFormatter.format(Math.floor(elapsedSecondsSinceCreation / sPerMinute), 'minutes')
}

export const durationHumanFormater = function(msDuration:number, formatterOpts:Intl.RelativeTimeFormatOptions = { style: 'long', numeric: 'always' }):Intl.RelativeTimeFormatPart[] {
    const durationFormatter:Intl.RelativeTimeFormat = new Intl.RelativeTimeFormat(language, formatterOpts);
    let secondsDuration:number = (msDuration >= 0) 
        ? Math.floor(msDuration / 1000)
        : 0;

    // if 0 leave early
    if(secondsDuration === 0) {
        const emptySecondsParts = durationFormatter.formatToParts(0, 'second').slice(1);
        emptySecondsParts[0].value = '00'; // 2 digit value
        return emptySecondsParts;
    } 

    let partsResult:Intl.RelativeTimeFormatPart[] = [];
    switch(true) {
        case (secondsDuration >= sPerDay):
            const daysCount:number = Math.floor(secondsDuration / sPerDay);
            const daysParts = durationFormatter.formatToParts(daysCount, 'day').slice(1); // remove first part 'in', 'ago'
            partsResult.push(...daysParts);
            secondsDuration = secondsDuration % sPerDay; // remainder seconds for next case to evaluate

        case (secondsDuration >= sPerHour):
            const hoursCount:number = Math.floor(secondsDuration / sPerHour);
            const hoursParts = durationFormatter.formatToParts(hoursCount, 'hour').slice(1);
            if(0 < hoursCount && hoursCount < 10) hoursParts[0].value = `0${ hoursCount }`; // 2 digit value
            if(hoursCount > 0) partsResult.push(...hoursParts); // in case there 1 day and 2 seconds (no minutes, no hours)
            secondsDuration = secondsDuration % sPerHour;

        case (secondsDuration >= sPerMinute):
            const minutesCount:number = Math.floor(secondsDuration / sPerMinute);
            const minutesParts = durationFormatter.formatToParts(minutesCount, 'minute').slice(1);
            if(0 < minutesCount && minutesCount < 10) minutesParts[0].value = `0${ minutesCount }`; // 2 digit value
            if(minutesCount > 0) partsResult.push(...minutesParts);
            secondsDuration = secondsDuration % sPerMinute;

        default:
            const secondsParts = durationFormatter.formatToParts(secondsDuration, 'second').slice(1);
            if(0 < secondsDuration && secondsDuration < 10) secondsParts[0].value = `0${ secondsDuration }`; // 2 digit value
            if(secondsDuration > 0) partsResult.push(...secondsParts);
    }

    return partsResult;
}

export const durationFormaterToString = function(msDuration:number, type:'TECH'|'HUMAN', formatterOpts:Intl.RelativeTimeFormatOptions = { style: 'long', numeric: 'always' }):string {
    const parts:Intl.RelativeTimeFormatPart[] = durationHumanFormater(msDuration, formatterOpts);
    function techUnitConverter(unit:string) {
        switch(unit) {
            case "second": return "S";
            case "minute": return "M";
            case "hour": return "H";
            case "day": return "D";
            default: return "";
        }
    }

    if (type === 'TECH') {
        return parts.reduce((acc, curr) => {
            return (curr.type === "integer")
                ? acc + curr.value + techUnitConverter(curr.unit ?? "no unit")
                : acc;
        }, "");
    }
    if (type === 'HUMAN') {
        return parts.reduce((acc, curr) => {
            return (curr.type === "integer")
                ? acc + " " + String(curr.value).trim()
                : (curr.type === "literal")
                ? acc + String(curr.value).trim()
                : acc;
        }, "");
    }
    throw new Error(`Wrong type: ${ type }, for duration in durationFormaterToString function`);
}

export const durationParts = function(msDuration:number, maxUnit:'year'|'month'|'day'|'hour'|'minute'|'second'):{ value:number, unit:string }[] {
    const allUnits:string[] = ['year', 'month', 'day', 'hour', 'minute', 'second'];
    const targetUnits:string[] = allUnits.slice(allUnits.findIndex(unit => unit === maxUnit));

    return targetUnits.reduce((acc, unit) => {
        const msPerUnit:number = (unit === 'year')
            ? sPerYear * 1000
            : (unit === 'month')
            ? sPerMonth * 1000
            : (unit === 'day')
            ? sPerDay * 1000
            : (unit === 'hour')
            ? sPerHour * 1000
            : (unit === 'minute')
            ? sPerMinute * 1000
            : 1000; // ms in seconds

        const currentUnitCount:number = Math.floor(acc.remainderMs / msPerUnit);
        const newRemainderMS:number = acc.remainderMs % msPerUnit;
        const newResultItem:{ value:number, unit:string } = { value: currentUnitCount, unit };

        return { remainderMs: newRemainderMS, results: [...acc.results, newResultItem] };
    }, { remainderMs: msDuration, results: ([] as { value:number, unit:string }[]) }).results;
}

export const formatMsDuration = function(msDuration:number, maxUnit:'hour'|'minute'):string {
    const parts = durationParts(msDuration, maxUnit);
    function doubleDigitString(count:number):string { return (0 <= count && count <= 9) ? `0${ count }` : String(count) }
    
    return (maxUnit === 'hour' && parts[0].value > 0)
        ? `${ doubleDigitString(parts[0].value) }H ${ doubleDigitString(parts[1].value) }:${ doubleDigitString(parts[2].value) }`
        : (maxUnit === 'hour' && parts[0].value === 0)
        ? `${ doubleDigitString(parts[1].value) }:${ doubleDigitString(parts[2].value) }`
        : (maxUnit === 'minute')
        ? `${ doubleDigitString(parts[0].value) }:${ doubleDigitString(parts[1].value) }`
        : "";
}

export const genericDayTimestamp = function(preciseTimestamp:number):number {
    // convert precise timestamp to comparable timestamp (same day, same month, same year BUT 0 hours, 0 minutes, 0 milliseconds)
    const preciseDate:Date = new Date(preciseTimestamp);
    // 00:00 set to midnight
    preciseDate.setMilliseconds(0);
    preciseDate.setSeconds(0);
    preciseDate.setMinutes(0);
    preciseDate.setHours(0);

    return preciseDate.getTime();
}