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
            if (customer.limits.monthlyAmountIsValid) {
                if (customer.limits.monthlyAmountIsHigherThanMedian) {
                    alert('Du har satt ett högre värden än medianvärdet som är ' + customer.limits.medianDepositLimitPerMonth + '   AVBRYT  //  JAG ÄR SÄKER');
                    //
                    // TO DO: Avbryt / Jag är säker
                    // if (jag är säker) this.setMonthlyIsValid(true); else ;
                    //
                }
                enableInput(WEEK);
            } else if (input < customer.minAmount) {
                alert("Minsta belopp är 25");
                resetForm(MONTH_FORM);
            } else if (customer.isYoungster) {
                alert('Eftersom du är under 20 år så är din maxgräns ' + customer.monthlyThresholdAmount);
                resetForm(MONTH_FORM);
            } else {
                alert('Information om prövning av ekonomisk förmåga: ' + 'vi brukar rekommendera en maxgräns på ' + customer.monthlyThresholdAmount + '   AVBRYT  //  JAG ÄR SÄKER');
                //
                // TO DO: Avbryt / Jag är säker
                // if (Avbryt) this.setMonthlyIsValid(false); else ;
                //
                customer.limits.setMonthlyIsValid = true;
                enableInput(WEEK);
                //
                // Unlock weekly --> atom state for weekly input: disabled = false
                //
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
                if (customer.isExistingCustomer) {
                    alert('Din veckogräns är högre än din månadsgräns. Vill du ändra månadsgräns?    AVBRYT  //  JAJJEMÄN');
                    //
                    // TO DO: Avbryt / Jag är säker
                    // if (jag är säker) this.setWeeklyIsValid(true); ÄNDRA OCKSÅ MÅNADSGRÄNS!!
                    //
                } else {
                    alert('välj en gräns mellan ' + customer.minAmount + ' och ' + customer.limits.monthlyAmount);
                    resetForm(WEEK_FORM);
                }
            } else {
                if (customer.limits.weeklyAmountIsHigherThanMedian) {
                    alert('Du har satt ett högre värden än medianvärdet som är ' + customer.limits.medianDepositLimitPerWeek + '   AVBRYT  //  JAG ÄR SÄKER');
                }
                enableInput(DAY);
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
                if (customer.isExistingCustomer) {
                    alert('Din dagsgräns är högre än din veckogräns. Vill du ändra veckogräns?    AVBRYT  //  JAJJEMÄN');
                    //
                    // TO DO: Avbryt / Jag är säker
                    // if (jag är säker) this.setWeeklyIsValid(true); ÄNDRA OCKSÅ VECKOGRÄNS!!
                    //
                } else {
                    alert('välj en gräns mellan ' + customer.minAmount + ' och ' + customer.limits.weeklyAmount);
                    resetForm(DAY_FORM);
                }
            } else if (customer.limits.areValid) {
                if (customer.limits.dailyAmountIsHigherThanMedian) {
                    alert('Du har satt ett högre värden än medianvärdet som är ' + customer.limits.medianDepositLimitPerDay + '   AVBRYT  //  JAG ÄR SÄKER');
                }
                document.getElementById('iframe').style.display = 'block';
                alert('DU VARVADE SPELET! :)');
                console.log(customer);
            } else {
                alert('Nåt är inte rätt... sparka på stoffe så han fixar buggen :/');
            };
        };        
    });
}