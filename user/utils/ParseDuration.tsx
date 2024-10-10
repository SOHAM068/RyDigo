export const ParseDuration = (durationText: string) => {
    const regex = /(\d+)\s*(hour|hours|h|minute|minutes|min|mins)?/g;
    let match;
    let totalMinutes = 0;

    while ((match = regex.exec(durationText)) !== null) {
        const value = parseInt(match[1], 10);
        
        // Check if a time unit was provided
        if (match[2]) {
            if (match[2].startsWith("hour")) {
                totalMinutes += value * 60; // Convert hours to minutes
            } else {
                totalMinutes += value; // Minutes are already in minutes
            }
        } else {
            // If no unit is specified, assume it's minutes
            totalMinutes += value;
        }
    }
    
    return totalMinutes;
};
