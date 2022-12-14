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

    if (customer.isYoungster) {
        if (customer.limits.dailyAmountIsHigherThanThreshold) {
            dayInput.classList.add(ERROR_CSS_CLASS);
        }
        if (customer.limits.weeklyAmountIsHigherThanThreshold) {
            weekInput.classList.add(ERROR_CSS_CLASS);
        }
        if (customer.limits.monthlyAmountIsHigherThanThreshold) {
            monthInput.classList.add(ERROR_CSS_CLASS);
        }
    }
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
        alert("Minsta belopp ??r 25");
        return;
    }
    //
    // H??gre ??n maxgr??ns f??r youngster
    //
    if (customer.isYoungster) {
        if (customer.limits.monthlyAmountIsHigherThanThreshold) {
            alert("M??nadsgr??ns ??r h??gre ??n maxgr??ns p?? " + customer.monthlyThresholdAmount);
        }
        if (customer.limits.weeklyAmountIsHigherThanThreshold) {
            alert("Veckogr??ns ??r h??gre ??n maxgr??ns p?? " + customer.monthlyThresholdAmount);
        }
        if (customer.limits.dailyAmountIsHigherThanThreshold) {
            alert("Dagsgr??ns ??r h??gre ??n maxgr??ns p?? " + customer.monthlyThresholdAmount);
        }
        
    } else {
        //
        // H??gre ??n median f??r vuxna
        //
        if (inputType === MONTH && customer.limits.monthlyAmountIsHigherThanMedian) {
            alert('M??nad -- Tips: De flesta s??tter en gr??ns p?? ' + customer.limits.medianDepositLimitPerMonth);
        }
        if (inputType === WEEK && customer.limits.weeklyAmountIsHigherThanMedian) {
            alert('Vecka -- Tips: De flesta s??tter en gr??ns p?? ' + customer.limits.medianDepositLimitPerWeek);
        }
        if (inputType === DAY && customer.limits.dailyAmountIsHigherThanMedian) {
            alert('Dag -- Tips: De flesta s??tter en gr??ns p?? ' + customer.limits.medianDepositLimitPerDay);
        }
    }
    
    //
    // Ny kund
    //
    if (!customer.isExistingCustomer ) {
        if (customer.limits.dailyAmountIsChanged && !customer.limits.dailyAmountIsValid) {
            if (customer.limits.weeklyAmountIsChanged && customer.limits.dailyAmount > customer.limits.weeklyAmount) {
                alert('Din dagsgr??ns ??r h??gre ??n din veckogr??ns.');
            }
        }
        if (customer.limits.weeklyAmountIsChanged && !customer.limits.weeklyAmountIsValid) {
            if (customer.limits.monthlyAmountIsChanged && customer.limits.weeklyAmount > customer.limits.monthlyAmount) {
                alert('Din veckogr??ns ??r h??gre ??n din m??nadsgr??ns');
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
            alert('Din dagsgr??ns ??r h??gre ??n din veckogr??ns.');
        }
        if (customer.limits.weeklyAmount > customer.limits.monthlyAmount) {
            alert('Din veckogr??ns ??r h??gre ??n din m??nadsgr??ns');
        }
    }
        //if (!customer.limits.monthlyAmountIsValid) {
          //  monthInput.classList.add(ERROR_CSS_CLASS);
        //}
};

const renderWinMessage = (thresholdBreak) => {
    if (thresholdBreak) {
        alert('Du vill br??nna svinmycket pengar s?? vi kommer kolla om du ??r god f??r det.');
    }
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
            alert('H??jning av gr??nser l??st. Din nuvarande satta gr??ns ??r ' + customer.limits.monthlyAmount);
            resetInput(MONTH, customer.limits.monthlyAmount);
        } else {
            customer.limits.setMonthly = input;
            if (customer.limits.areValid) {
                renderWinMessage(customer.limits.monthlyAmountIsHigherThanThreshold || customer.limits.weeklyAmountIsHigherThanThreshold || customer.dailyAmountIsHigherThanThreshold);
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
            alert('H??jning av gr??nser l??st. Din nuvarande satta gr??ns ??r ' + customer.limits.weeklyAmount);
            resetInput(WEEK, customer.limits.weeklyAmount);
        } else {
            customer.limits.setWeekly = input;
            if (customer.limits.areValid) {
                renderWinMessage(customer.limits.monthlyAmountIsHigherThanThreshold || customer.limits.weeklyAmountIsHigherThanThreshold || customer.dailyAmountIsHigherThanThreshold);
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
            alert('H??jning av gr??nser l??st. Din nuvarande satta gr??ns ??r ' + customer.limits.dailyAmount);
            resetInput(DAY, customer.limits.dailyAmount);
        } else {
            customer.limits.setDaily = input;
            if (customer.limits.areValid) {
                renderWinMessage(customer.limits.monthlyAmountIsHigherThanThreshold || customer.limits.weeklyAmountIsHigherThanThreshold || customer.dailyAmountIsHigherThanThreshold);
            }
        };
            
        renderMessage(customer, input, DAY);
        renderInputError(customer, input, DAY);
        renderObject(customer); 
    });
}