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
const ERROR_CSS_CLASS = 'error';

const enableInput = (id, value) => {
    const input = document.getElementById(id);
    input.disabled = false;
    document.getElementById(id + 'Button').disabled = false;
    if (value !== undefined) {
        input.value = value;
    };
};

const renderInputError = (customer, input, inputType) => {
    const dayInput = document.getElementById(DAY);
    const weekInput = document.getElementById(WEEK);
    const monthInput = document.getElementById(MONTH);
    dayInput.classList.remove(ERROR_CSS_CLASS);
    weekInput.classList.remove(ERROR_CSS_CLASS);
    monthInput.classList.remove(ERROR_CSS_CLASS);

    //
    // Ny kund
    //
    if (!customer.isExistingCustomer) {
        if (inputType === DAY && customer.limits.dailyAmountIsChanged && !customer.limits.dailyAmountIsValid) {
            dayInput.classList.add(ERROR_CSS_CLASS);
        }
        if (inputType === WEEK && customer.limits.weeklyAmountIsChanged && !customer.limits.weeklyAmountIsValid) {
            weekInput.classList.add(ERROR_CSS_CLASS);
        }
        if (inputType === MONTH && customer.limits.monthlyAmountIsChanged && !customer.limits.monthlyAmountIsValid && customer.isYoungster) { 
           monthInput.classList.add(ERROR_CSS_CLASS);
        }
    } 
    //
    // Existerande kund
    //
    else {
        if (!customer.limits.dailyAmountIsValid) {
            dayInput.classList.add(ERROR_CSS_CLASS);
        }
        if (!customer.limits.weeklyAmountIsValid) {
            weekInput.classList.add(ERROR_CSS_CLASS);
        }
        //if (!customer.limits.monthlyAmountIsValid) {
          //  monthInput.classList.add(ERROR_CSS_CLASS);
        //}
    }
};

const renderMessage = (customer, input, inputType) => {
    if (input < customer.minAmount) {
        alert("Minsta belopp är 25");
        return;
    }
    //
    // Högre än maxgräns för youngster
    //
    if (customer.isYoungster) {
        if (inputType === MONTH && customer.limits.monthlyAmountIsHigherThanThreshold) {
            alert("Månadsgräns är högre än maxgräns på " + customer.monthlyThresholdAmount);
        }
        if (inputType === WEEK && customer.limits.weeklyAmountIsHigherThanThreshold) {
            alert("Veckogräns är högre än maxgräns på " + customer.monthlyThresholdAmount);
        }
        if (inputType === DAY && customer.limits.dailyAmountIsHigherThanThreshold) {
            alert("Dagsgräns är högre än maxgräns på " + customer.monthlyThresholdAmount);
        }
        
    } else {
        //
        // Högre än median för vuxna
        //
        if (inputType === MONTH && customer.limits.monthlyAmountIsHigherThanMedian) {
            alert('Månad -- Tips: De flesta sätter en gräns på ' + customer.limits.medianDepositLimitPerMonth);
        }
        if (inputType === WEEK && customer.limits.weeklyAmountIsHigherThanMedian) {
            alert('Vecka -- Tips: De flesta sätter en gräns på ' + customer.limits.medianDepositLimitPerWeek);
        }
        if (inputType === DAY && customer.limits.dailyAmountIsHigherThanMedian) {
            alert('Dag -- Tips: De flesta sätter en gräns på ' + customer.limits.medianDepositLimitPerDay);
        }
    }
    
    //
    // Ny kund
    //
    if (!customer.isExistingCustomer ) {
        if (customer.limits.dailyAmountIsChanged && !customer.limits.dailyAmountIsValid) {
            if (customer.limits.weeklyAmountIsChanged && customer.limits.dailyAmount > customer.limits.weeklyAmount) {
                alert('Din dagsgräns är högre än din veckogräns.');
            }
        }
        if (customer.limits.weeklyAmountIsChanged && !customer.limits.weeklyAmountIsValid) {
            if (customer.limits.monthlyAmountIsChanged && customer.limits.weeklyAmount > customer.limits.monthlyAmount) {
                alert('Din veckogräns är högre än din månadsgräns');
            }
        }
        //if (customer.limits.monthlyAmountIsChanged && !customer.limits.monthlyAmountIsValid) {
           // monthInput.classList.add(ERROR_CSS_CLASS);
        //}
    } 
    //
    // Existerande kund
    //
    else {
        if (customer.limits.dailyAmount > customer.limits.weeklyAmount) {
            alert('Din dagsgräns är högre än din veckogräns.');
        }
        if (customer.limits.weeklyAmount > customer.limits.monthlyAmount) {
            alert('Din veckogräns är högre än din månadsgräns');
        }
    }
        //if (!customer.limits.monthlyAmountIsValid) {
          //  monthInput.classList.add(ERROR_CSS_CLASS);
        //}
};

const renderWinMessage = () => {
    document.getElementById('iframe').style.display = 'block';
    alert('DU VARVADE SPELET! :)');
};

const resetInput = (id, value) => {
    if (value !== undefined) {
        document.getElementById(id).value = value;;
    }
}

const renderObject = (customer) => {
    document.getElementById("customerObject").innerHTML = JSON.stringify(customer);
}

window.onload = function() {

    let customer = {};
    let isNew;
    let locked;

    renderObject(customer);

    //
    // Locked form - For development test purposes only
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
        renderObject(customer);
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
            if (customer.limits.areValid) {
                renderWinMessage();
            }
        }
        renderMessage(customer, input, MONTH);
        renderInputError(customer, input, MONTH);
        renderObject(customer);
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
            if (customer.limits.areValid) {
                renderWinMessage();
            }
        }
        renderMessage(customer, input, WEEK);
        renderInputError(customer, input, WEEK);
        renderObject(customer);
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
            if (customer.limits.areValid) {
                renderWinMessage();
            }
        };
            
        renderMessage(customer, input, DAY);
        renderInputError(customer, input, DAY);
        renderObject(customer); 
    });
}