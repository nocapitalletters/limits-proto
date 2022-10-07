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
            monthlyAmountIsValid: false,
            monthlyAmountIsHigherThanMedian: false,
            weeklyAmount: 0,
            weeklyAmountIsValid: false,
            weeklyAmountIsHigherThanMedian: false,
            dailyAmount: 0,
            dailyAmountIsValid: false,
            dailyAmountIsHigherThanMedian: false,
            areValid: false,
            /**
             * @param {number} inputMonthlyAmount
             */
            set setMonthly(inputMonthlyAmount) {
                let validity = false;
                if (this.validateAgainstMin(inputMonthlyAmount) && this.isLessOrEqualToMonthlyThreshold(inputMonthlyAmount)) {
                    this.monthlyAmount = inputMonthlyAmount;
                    this.setMonthlyIsHigherThanMedian();
                    validity = true;
                }
                this.setMonthlyIsValid = validity;
            },
            /**
             * @param {number} inputWeeklyAmount
             */
            set setWeekly(inputWeeklyAmount) {
                let validity = false;
                if (this.validateAgainstMin(inputWeeklyAmount) && this.isLessThanMonthlyAmount(inputWeeklyAmount)) {
                    this.weeklyAmount = inputWeeklyAmount;
                    this.setWeeklyIsHigherThanMedian();
                    validity = true;
                    
                }
                this.setWeeklyIsValid = validity;
            },
            /**
             * @param {number} inputDailyAmount
             */
            set setDaily(inputDailyAmount) {
                let validity = false;
                if (this.validateAgainstMin(inputDailyAmount) && this.isLessThanWeeklyAmount(inputDailyAmount)) {
                    this.dailyAmount = inputDailyAmount;
                    this.setDailyIsHigherThanMedian();
                    validity = true;
                }
                this.setDailyIsValid = validity;
            },
            /**
             * @param {boolean} isValid
             */
            set setMonthlyIsValid(isValid) {
                this.monthlyAmountIsValid = isValid;
                this.setAreValid();
            },
            /**
             * @param {boolean} isValid
             */
            set setWeeklyIsValid(isValid) {
                this.weeklyAmountIsValid = isValid;
                this.setAreValid();
            },
            /**
             * @param {boolean} isValid
             */
            set setDailyIsValid(isValid) {
                this.dailyAmountIsValid = isValid;
                this.setAreValid();
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
            setAreValid: () => {
                this.limits.areValid =
                    this.limits.monthlyAmountIsValid &&
                    this.limits.weeklyAmountIsValid &&
                    this.limits.dailyAmountIsValid;
            },
            /**
             * @param {number} amountToValidate
             */
            validateAgainstMin: (amountToValidate) => amountToValidate > this.minAmount,
            /**
             * @param {number} amountToValidate
             */
            isLessOrEqualToMonthlyThreshold: (amountToValidate) => amountToValidate <= this.monthlyThresholdAmount,
            /**
             * @param {number} amountToValidate
             */
            isLessThanMonthlyAmount: (amountToValidate) =>  this.limits.monthlyAmountIsValid && amountToValidate < this.limits.monthlyAmount,
            /**
             * @param {number} amountToValidate
             */
            isLessThanWeeklyAmount: (amountToValidate) =>  this.limits.weeklyAmountIsValid && amountToValidate < this.limits.weeklyAmount
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