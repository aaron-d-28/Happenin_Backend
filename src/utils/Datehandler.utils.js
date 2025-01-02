export const toCurrentAge=(old_date)=> {
    const current = new Date();

// Parse the ISO date string into a Date object
    const parsedDate = new Date(old_date);

// Calculate the difference in milliseconds
    const timeDifference = current - parsedDate;

// Define constants for time calculations
    const millisecondsInSecond = 1000;
    const millisecondsInMinute = 60 * millisecondsInSecond;
    const millisecondsInHour = 60 * millisecondsInMinute;
    const millisecondsInDay = 24 * millisecondsInHour;
    const millisecondsInMonth = 30 * millisecondsInDay; // Rough estimate (not accounting for varying month lengths)
    const millisecondsInYear = 365 * millisecondsInDay; // Rough estimate (not accounting for leap years)

// Calculate the difference in years
    const years = Math.floor(timeDifference / millisecondsInYear);
    let remainingTime = timeDifference % millisecondsInYear;

// Calculate the difference in months (assuming 30 days in a month)
    const months = Math.floor(remainingTime / millisecondsInMonth);
    remainingTime = remainingTime % millisecondsInMonth;

// Calculate the difference in days
    const days = Math.floor(remainingTime / millisecondsInDay);
    remainingTime = remainingTime % millisecondsInDay;

// Calculate the difference in seconds
    const seconds = Math.floor(remainingTime / millisecondsInSecond);

// Display the result
    return {years,months,days,seconds,};
}