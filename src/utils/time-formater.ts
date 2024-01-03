const sPerMinute = 60;
const sPerHour = sPerMinute * 60;
const sPerDay = sPerHour * 24;
const sPerMonth = sPerDay * 30;
const sPerYear = sPerDay * 365;

export const exactDateFormatter:Intl.DateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
    hour: "numeric",
    minute: "numeric",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

export const relativeDateFormatter:Intl.RelativeTimeFormat = new Intl.RelativeTimeFormat('fr-FR', { style: 'short', numeric: 'auto' });
export const durationFormatter:Intl.RelativeTimeFormat = new Intl.RelativeTimeFormat('fr-FR', { style: 'long', numeric: 'always' });

export const relativeFromToHumanFormater = function(fromTimestamp:number, toTimestamp:number):string {
    const elapsedSecondsSinceCreation:number = (fromTimestamp - toTimestamp) / 1000;

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

export const durationHumanFormater = function(msDuration:number):Intl.RelativeTimeFormatPart[] {
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