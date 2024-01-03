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

export const relativeDateFormatter:Intl.RelativeTimeFormat = new Intl.RelativeTimeFormat('fr-FR', { style: 'long', numeric: 'auto' });

export const relativeHumanFormater = function(fromTimestamp:number, toTimestamp:number):string {
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