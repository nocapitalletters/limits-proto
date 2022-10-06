const thresholdValues = {
    minAmount: 25,
    threshold: 10000,
    thresholdYoungster: 1000
};

const medianValues = {
    medianMonth: 5000,
    medianWeek: 2000,
    medianDay: 500
};

const existingLimits = {
    monthlyAmount: 1001,
    monthlyAmountIsValid: true,
    weeklyAmount: 560,
    weeklyAmountIsValid: true,
    dailyAmount: 400,
    dailyAmountIsValid: true,
    areValid: true
};

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
const EXISTING_LIMIT_CUSTOMER = 'ExistingLimitCustomer';
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
    // Type form
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
        if (customer !== undefined && customer.type == EXISTING_LIMIT_CUSTOMER) {
            customer.limits.areLocked = locked !== undefined;
        }
    });

    //
    // Type form
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
        const areLocked = locked !== undefined;
        customer = isNew ? 
                    new NewLimitCustomer(age, medianValues, thresholdValues) : 
                    new ExistingLimitCustomer(age, areLocked, existingLimits, medianValues, thresholdValues);

        if (customer.type == EXISTING_LIMIT_CUSTOMER) {
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

        if (customer.type == EXISTING_LIMIT_CUSTOMER && customer.limits.areLocked && customer.isAmountHigherThanLimit(input, MONTH)) {
            alert('Höjning av gränser låst. Din nuvarande satta gräns är ' + customer.limits.monthlyAmount);
            resetInput(MONTH, customer.limits.monthlyAmount);
        } else {
            customer.limits.setMonthly = input;
            if (customer.limits.monthlyAmountIsValid) {
                if (customer.limits.monthlyAmountIsHigherThanMedian) {
                    alert('Du har satt ett högre värden än medianvärdet som är ' + customer.limits.medianMonth + '   AVBRYT  //  JAG ÄR SÄKER');
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

        if (customer.type == EXISTING_LIMIT_CUSTOMER && customer.limits.areLocked && customer.isAmountHigherThanLimit(input, WEEK)) {
            alert('Höjning av gränser låst. Din nuvarande satta gräns är ' + customer.limits.weeklyAmount);
            resetInput(WEEK, customer.limits.weeklyAmount);
        } else {
            customer.limits.setWeekly = input;
            if (!customer.limits.weeklyAmountIsValid) {
                if (customer.type == EXISTING_LIMIT_CUSTOMER) {
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
                    alert('Du har satt ett högre värden än medianvärdet som är ' + customer.limits.medianWeek + '   AVBRYT  //  JAG ÄR SÄKER');
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

        if (customer.type == EXISTING_LIMIT_CUSTOMER && customer.limits.areLocked && customer.isAmountHigherThanLimit(input, DAY)) {
            alert('Höjning av gränser låst. Din nuvarande satta gräns är ' + customer.limits.dailyAmount);
            resetInput(DAY, customer.limits.dailyAmount);
        } else {
            customer.limits.setDaily = input;
            if (!customer.limits.dailyAmountIsValid) {
                if (customer.type == EXISTING_LIMIT_CUSTOMER) {
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
                    alert('Du har satt ett högre värden än medianvärdet som är ' + customer.limits.medianDay + '   AVBRYT  //  JAG ÄR SÄKER');
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