class BaseLimitCustomer {
    /**
     * @param {number} age
     * @param {object} medianValues
     * @param {object} thresholdValues
    */
    constructor(age, medianValues, thresholdValues) {
        this.minAmount = thresholdValues.minAmount,
        this.isYoungster = age < 20,
        this.monthlyThresholdAmount = this.isYoungster ? thresholdValues.thresholdYoungster : thresholdValues.threshold,
        this.type = this.constructor.name,
        this.isExistingCustomer = this.constructor.name === "ExistingLimitCustomer",
        this.limits = {
            medianDepositLimitPerDay: medianValues.medianDepositLimitPerDay,
            medianDepositLimitPerWeek: medianValues.medianDepositLimitPerWeek,
            medianDepositLimitPerMonth: medianValues.medianDepositLimitPerMonth,
            medianTimeLimitPerDay: medianValues.medianTimeLimitPerDay,
            medianTimeLimitPerWeek: medianValues.medianTimeLimitPerWeek,
            medianTimeLimitPerMonth: medianValues.medianTimeLimitPerMonth,
            monthlyAmount: 0,
            monthlyAmountIsChanged: false,
            monthlyAmountIsValid: false,
            monthlyAmountIsHigherThanMedian: false,
            weeklyAmount: 0,
            weeklyAmountIsChanged: false,
            weeklyAmountIsValid: false,
            weeklyAmountIsHigherThanMedian: false,
            dailyAmount: 0,
            dailyAmountIsChanged: false,
            dailyAmountIsValid: false,
            dailyAmountIsHigherThanMedian: false,
            areValid: false,
            /**
             * @param {number} inputMonthlyAmount
             */
            set setMonthly(inputMonthlyAmount) {
                this.monthlyAmount = inputMonthlyAmount;
                this.monthlyAmountIsChanged = true;
                this.setMonthlyIsHigherThanMedian();
                this.monthlyAmountIsValid = this.validateMonth(this.monthlyAmount);
                this.validateAll();
            },
            /**
             * @param {number} inputWeeklyAmount
             */
            set setWeekly(inputWeeklyAmount) {
                this.weeklyAmount = inputWeeklyAmount;
                this.weeklyAmountIsChanged = true;
                this.setWeeklyIsHigherThanMedian();
                this.weeklyAmountIsValid = this.validateWeek(this.weeklyAmount);
                this.validateAll();
            },
            /**
             * @param {number} inputDailyAmount
             */
            set setDaily(inputDailyAmount) {
                this.dailyAmount = inputDailyAmount;
                this.dailyAmountIsChanged = true;
                this.setDailyIsHigherThanMedian();
                this.dailyAmountIsValid = this.validateDay(this.dailyAmount);
                this.validateAll();
            },
            setMonthlyIsHigherThanMedian() {
                this.monthlyAmountIsHigherThanMedian = this.monthlyAmount > this.medianDepositLimitPerMonth;
            },
            setWeeklyIsHigherThanMedian() {
                this.weeklyAmountIsHigherThanMedian = this.weeklyAmount > this.medianDepositLimitPerWeek;
            },
            setDailyIsHigherThanMedian() {
                this.dailyAmountIsHigherThanMedian = this.dailyAmount > this.medianDepositLimitPerDay;
            },
            setLimitsAreValid: () => {
                this.limits.areValid =
                    this.limits.monthlyAmountIsValid &&
                    this.limits.weeklyAmountIsValid &&
                    this.limits.dailyAmountIsValid;
            },
            /**
             * @param {number} amountToValidate
             */
            validateAgainstMin: (amountToValidate) => amountToValidate > this.minAmount,
            validateAll: () => {
                this.limits.monthlyAmountIsValid = this.limits.validateMonth(this.limits.monthlyAmount);
                this.limits.weeklyAmountIsValid = this.limits.validateWeek(this.limits.weeklyAmount);
                this.limits.dailyAmountIsValid = this.limits.validateDay(this.limits.dailyAmount);
                this.limits.setLimitsAreValid();
            },
            validateMonth: (monthlyAmount) => {
                return this.limits.validateAgainstMin(monthlyAmount) && 
                this.limits.isLessOrEqualToMonthlyThreshold(monthlyAmount) && 
                this.limits.isMoreOrEqualToWeeklyAmount(monthlyAmount) && 
                this.limits.isMoreOrEqualToDailyAmount(monthlyAmount);
            },
            validateWeek: (weeklyAmount) => {
                return this.limits.validateAgainstMin(weeklyAmount) && 
                this.limits.isLessOrEqualToMonthlyThreshold(weeklyAmount) && 
                this.limits.isLessOrEqualToMonthlyAmount(weeklyAmount) && 
                this.limits.isMoreOrEqualToDailyAmount(weeklyAmount)
            },
            validateDay: (dailyAmount) => {
                return this.limits.validateAgainstMin(dailyAmount) && 
                this.limits.isLessOrEqualToMonthlyThreshold(dailyAmount) && 
                this.limits.isLessOrEqualToMonthlyAmount(dailyAmount) && 
                this.limits.isLessOrEqualToWeeklyAmount(dailyAmount)
            },
            /**
             * @param {number} amountToValidate
             */
            isLessOrEqualToMonthlyThreshold: (amountToValidate) => amountToValidate <= this.monthlyThresholdAmount,
            /**
             * @param {number} amountToValidate
             */
            isLessOrEqualToMonthlyAmount: (amountToValidate) =>  {
                //
                // If no monthly amount is set and customer is new, validate to true
                //
                if (!this.isExistingCustomer && !this.limits.monthlyAmountIsChanged) {
                    return true;
                } else {
                    return amountToValidate <= this.limits.monthlyAmount;
                }
            },
            /**
             * @param {number} amountToValidate
             */
            isLessOrEqualToWeeklyAmount: (amountToValidate) =>  {
                //
                // If no weekly amount is set and customer is new, validate to true
                //
                if (!this.isExistingCustomer && !this.limits.weeklyAmountIsChanged) { 
                    return true;
                } else {
                    return amountToValidate <= this.limits.weeklyAmount
                }
            },
            /**
             * @param {number} amountToValidate
             */
            isMoreOrEqualToDailyAmount: (amountToValidate) => amountToValidate >= this.limits.dailyAmount,
            /**
             * @param {number} amountToValidate
             */
            isMoreOrEqualToWeeklyAmount: (amountToValidate) => amountToValidate >= this.limits.weeklyAmount
        }
    };
}

class NewLimitCustomer extends BaseLimitCustomer {};

class ExistingLimitCustomer extends BaseLimitCustomer {
    /**
     * @param {number} age
     * @param {boolean} increaseLock
     * @param {object} existingLimits
     * @param {object} medianValues
     * @param {object} thresholdValues
    */
    constructor(age, increaseLock, existingLimits, medianValues, thresholdValues) {
        super(age, medianValues, thresholdValues);
        this.limits.monthlyAmount = existingLimits.monthlyAmount,
        this.limits.monthlyAmountIsValid = existingLimits.monthlyAmountIsValid,
        this.limits.weeklyAmount = existingLimits.weeklyAmount,
        this.limits.weeklyAmountIsValid = existingLimits.weeklyAmountIsValid,
        this.limits.dailyAmount = existingLimits.dailyAmount,
        this.limits.dailyAmountIsValid = existingLimits.dailyAmountIsValid,
        this.limits.areValid = existingLimits.areValid,
        this.limits.increaseLock = increaseLock,

        this.isAmountHigherThanLimit = (amount, limitType) => {
            switch (limitType) {
                case 'month': 
                    return amount > this.limits.monthlyAmount;
                case 'week': 
                    return amount > this.limits.weeklyAmount;
                case 'day': 
                    return amount > this.limits.dailyAmount;
                default:
                    return true;
            }
        }; 
    }
};