export const calculateAge=(dob)=> {
    const today = new Date();

    // The DOB is already a Date object, so no need to convert
    let age = today.getFullYear() - dob.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    // Adjust age if the birthday hasn't occurred yet this year
    if (month < dob.getMonth() || (month === dob.getMonth() && day < dob.getDate())) {
        age--;
    }

    return age;
}

// Example usage: