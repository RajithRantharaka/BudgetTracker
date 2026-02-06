
export const getCycleRange = (currentDate: Date, startDay: number) => {
    let start: Date;
    let end: Date;

    const currentDay = currentDate.getDate();

    if (currentDay >= startDay) {
        // We are in the cycle that started this month on 'startDay'
        // e.g. StartDay = 25, Today = 26th Jan. Cycle = 25th Jan to 24th Feb.
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), startDay);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, startDay - 1);
    } else {
        // We are in the cycle that started last month
        // e.g. StartDay = 25, Today = 5th Feb. Cycle = 25th Jan to 24th Feb.
        start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, startDay);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth(), startDay - 1);
    }

    // Set times to boundary
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

export const formatCycleDisplay = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
};
