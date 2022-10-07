const enableInput = (id, value) => {
    const input = document.getElementById(id);
    input.disabled = false;
    document.getElementById(id + 'Button').disabled = false;
    if (value !== undefined) {
        input.value = value;
    };
};

const resetForm = (id, value) => {
    const form = document.getElementById(id);
    if (value !== undefined) {
        input.value = value;
    } else {
        form.reset();
    }
}

const resetInput = (id, value) => {
    if (value !== undefined) {
        document.getElementById(id).value = value;;
    }
}

//
// Constants
//
const MONTH = 'month';
const WEEK = 'week';
const DAY = 'day';
const MONTH_FORM = 'monthForm';
const WEEK_FORM = 'weekForm';
const DAY_FORM = 'dayForm';
const SUBMIT = 'submit';
const FORMDATA = 'formdata';

window.onload = function() {

    let customer;
    let isNew;
    let locked;

    //
    // Type form - For development test purposes only
    //
    const lockedForm = document.getElementById('lockedForm');
    lockedForm.addEventListener(SUBMIT, function(event) {
        event.preventDefault();
        new FormData(lockedForm);
    });
    lockedForm.addEventListener(FORMDATA, event => {
        const data = event.formData;
        const values = [...data.values()];
        locked = values[0];
        if (customer !== undefined && customer.isExistingCustomer) {
            customer.limits.increaseLock = locked !== undefined;
        }
    });

    //
    // Type form - For development test purposes only
    //
    const typeForm = document.getElementById('typeForm');
    typeForm.addEventListener(SUBMIT, function(event) {
        event.preventDefault();
        new FormData(typeForm);
    });
    typeForm.addEventListener(FORMDATA, event => {
        const data = event.formData;
        const values = [...data.values()];
        type = values[0];
        isNew = type == 'new';
        enableInput('age');
    });

    //
    // Age form
    //
    const ageForm = document.getElementById('ageForm');
    ageForm.addEventListener(SUBMIT, function(event) {
        event.preventDefault();
        new FormData(ageForm);
    });
    ageForm.addEventListener(FORMDATA, event => {
        const data = event.formData;
        const values = [...data.values()];
        const age = values[0];
        const increaseLock = locked !== undefined;
        customer = isNew ? 
                    new NewLimitCustomer(age, medianValues, thresholdValues) : 
                    new ExistingLimitCustomer(age, increaseLock, existingLimits, medianValues, thresholdValues);

        if (customer.isExistingCustomer) {
            enableInput(MONTH, customer.limits.monthlyAmount);
            enableInput(WEEK, customer.limits.weeklyAmount);
            enableInput(DAY, customer.limits.dailyAmount);
        } else {
            enableInput(MONTH);
            enableInput(WEEK);
            enableInput(DAY);
        }
        
    });

    //
    // Month form
    //
    const monthForm = document.getElementById(MONTH_FORM);
    monthForm.addEventListener(SUBMIT, function(event) {
        event.preventDefault();
        new FormData(monthForm);
    });
    monthForm.addEventListener(FORMDATA, event => {
        const data = event.formData;
        const values = [...data.values()];
        let input = values[0];
        input = Number(input);

        if (customer.isExistingCustomer && customer.limits.increaseLock && customer.isAmountHigherThanLimit(input, MONTH)) {
            alert('Höjning av gränser låst. Din nuvarande satta gräns är ' + customer.limits.monthlyAmount);
            resetInput(MONTH, customer.limits.monthlyAmount);
        } else {
            customer.limits.setMonthly = input;
            if (!customer.limits.monthlyAmountIsValid) {
                if (customer.limits.weeklyAmount > customer.limits.monthlyAmount) {
                    alert('Din veckogräns är högre än din månadsgräns');
                    //
                    // We do not want to raise monthly limit, instead encourage to lower weekly limit -> Switch validity between month and week
                    //
                    customer.limits.monthlyAmount = input;
                    customer.limits.monthlyAmountIsValid = true;
                    customer.limits.weeklyAmountIsValid = false;

                } else if (input < customer.minAmount) {
                    alert("Minsta belopp är 25");
                } else if (customer.isYoungster) {
                    alert('Eftersom du är under 20 år så är din maxgräns ' + customer.monthlyThresholdAmount);
                } 
            }
            else {
                if (customer.limits.monthlyAmountIsHigherThanMedian) {
                    alert('Tips: De flesta sätter en gräns på ' + customer.limits.medianDepositLimitPerMonth);
                }
                if (customer.limits.areValid) {
                    if (customer.limits.monthlyAmount > customer.monthlyThresholdAmount) {
                        alert('Information om prövning av ekonomisk förmåga: ' + 'vi brukar rekommendera en maxgräns på ' + customer.monthlyThresholdAmount);
                    }
                    document.getElementById('iframe').style.display = 'block';
                    alert('DU VARVADE SPELET! :)');
                    console.log(customer);
                }
            }
            
        }
    });

    //
    // Week form
    //
    const weekForm = document.getElementById(WEEK_FORM);
    weekForm.addEventListener(SUBMIT, function(event) {
        event.preventDefault();
        new FormData(weekForm);
    });
    weekForm.addEventListener(FORMDATA, event => {
        const data = event.formData;
        const values = [...data.values()];
        let input = values[0];
        input = Number(input);

        if (customer.isExistingCustomer && customer.limits.increaseLock && customer.isAmountHigherThanLimit(input, WEEK)) {
            alert('Höjning av gränser låst. Din nuvarande satta gräns är ' + customer.limits.weeklyAmount);
            resetInput(WEEK, customer.limits.weeklyAmount);
        } else {
            customer.limits.setWeekly = input;
            if (!customer.limits.weeklyAmountIsValid) {
                if (customer.limits.weeklyAmount > customer.limits.monthlyAmount) {
                    alert('Din veckogräns är högre än din månadsgräns.');

                } else if (customer.limits.dailyAmount > customer.limits.weeklyAmount) {
                    alert('Din dagsgräns är högre än din veckogräns.');
                    //
                    // We do not want to raise weekly limit, instead encourage to lower daily limit -> Switch validity between week and day
                    //
                    customer.limits.weeklyAmount = input;
                    customer.limits.weeklyAmountIsValid = true;
                    customer.limits.dailyAmountIsValid = false;
                }
            } else {
                if (customer.limits.weeklyAmountIsHigherThanMedian) {
                    alert('Tips: De flesta sätter en gräns på ' + customer.limits.medianDepositLimitPerWeek);
                }
                if (customer.limits.areValid) {
                    if (customer.limits.monthlyAmount > customer.monthlyThresholdAmount) {
                        alert('Information om prövning av ekonomisk förmåga: ' + 'vi brukar rekommendera en maxgräns på ' + customer.monthlyThresholdAmount);
                    }
                    document.getElementById('iframe').style.display = 'block';
                    alert('DU VARVADE SPELET! :)');
                    console.log(customer);
                }
            }
        };
    });

    //
    // Day form
    //
    const dayForm = document.getElementById(DAY_FORM);
    dayForm.addEventListener(SUBMIT, function(event) {
        event.preventDefault();
        new FormData(dayForm);
    });
    dayForm.addEventListener(FORMDATA, event => {
        const data = event.formData;
        const values = [...data.values()];
        let input = values[0];
        input = Number(input);

        if (customer.isExistingCustomer && customer.limits.increaseLock && customer.isAmountHigherThanLimit(input, DAY)) {
            alert('Höjning av gränser låst. Din nuvarande satta gräns är ' + customer.limits.dailyAmount);
            resetInput(DAY, customer.limits.dailyAmount);
        } else {
            customer.limits.setDaily = input;
            if (!customer.limits.dailyAmountIsValid) {
                if (customer.limits.dailyAmount > customer.limits.weeklyAmount) {
                    alert('Din dagsgräns är högre än din veckogräns.');
                }
            } 
            else {
                if (customer.limits.dailyAmountIsHigherThanMedian) {
                    alert('Tips: De flesta sätter en gräns på ' + customer.limits.medianDepositLimitPerDay);
                }
                if (customer.limits.areValid) {
                    if (customer.limits.monthlyAmount > customer.monthlyThresholdAmount) {
                        alert('Information om prövning av ekonomisk förmåga: ' + 'vi brukar rekommendera en maxgräns på ' + customer.monthlyThresholdAmount);
                    }
                    document.getElementById('iframe').style.display = 'block';
                    alert('DU VARVADE SPELET! :)');
                    console.log(customer);
                }
            }
        };        
    });
}