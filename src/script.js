const workingHoursInYear = 2080;

new Vue({
    el: "#app",
    data: {
        base: 50000,
        baseMode: 'salary',
        sti: 5,
        k401: 4,
        espp: 15,
        esppDiscount: 15,
        stockIncrease: 10,
        rsu: 5000,
        rsuVestingPeriod: 3,
        hsa: 1000,
        pto: 10,
        holidays: 8,

        // Stores all values above in a running copy
        // to reset defaults
        _defaults: {}
    },
    computed: {
        // Final end user output
        total() {
            let total = this.bonus
                + this.salaryWithoutEspp
                + this.salaryWithEspp
                + this.k401Contribution
                + this.rsuContribution
                + this.hsa;

            return this.format(total);
        },
        paidVacation() {
            let total = (this.pto + this.holidays) * (this.normalizedBase / workingHoursInYear);

            return this.format(total);
        },

        // Variables used in total calculation
        normalizedBase() {
            if (this.baseMode === 'salary') {
                return this.base
            }

            return this.base * workingHoursInYear;
        },
        bonus() {
            return this.normalizedBase * this.stiPercent;
        },
        salaryWithoutEspp() {
            return this.normalizedBase * (1 - (this.esppPercent * (1 + this.stockIncreasePercent)));
        },
        salaryWithEspp() {
            return (this.normalizedBase * this.esppPercent * (1 + this.stockIncreasePercent)) * (1 + this.esppDiscountPercent) * (1 + this.stockIncreasePercent);
        },
        k401Contribution() {
            return this.normalizedBase * this.k401Percent;
        },
        rsuContribution() {
            if (this.rsuVestingPeriod === 0) {
                return this.rsu;
            }

            if (this.rsuVestingPeriod === 1) {
                return (1 + this.stockIncreasePercent) * this.rsu;
            }

            if (this.rsuVestingPeriod > 1) {
                let remainder = this.rsuVestingPeriod - 1;

                return remainder * (this.rsu / this.rsuVestingPeriod)
                    + ((1 + this.stockIncreasePercent) * this.rsu / this.rsuVestingPeriod);
            }

            return 0;
        },

        // Percent helpers
        stiPercent() {
            return this.sti / 100;
        },
        esppPercent() {
            return this.espp / 100;
        },
        esppDiscountPercent() {
            return this.esppDiscount / 100;
        },
        stockIncreasePercent() {
            return this.stockIncrease / 100;
        },
        k401Percent() {
            return this.k401 / 100;
        },

        // Storage helpers
        hasStorage() {
            return !!this.getStorage();
        }
    },
    methods: {
        format(value) {
            let formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            });

            return formatter.format(value);
        },

        // State methods
        toggleBase() {
            // Toggle the base mode
            this.baseMode = this.baseMode === 'salary' ? 'hourly' : 'salary';

            // Update base to convert between types
            this.base = this.baseMode === 'salary' ? (this.base * workingHoursInYear) : Math.floor(this.base / workingHoursInYear)
        },

        // Save methods
        setStorage(data) {
            localStorage.setItem('data', JSON.stringify(data));
        },
        getStorage() {
            return JSON.parse(localStorage.getItem('data'));
        },
        setDataProperties(data) {
            // Load _data properties on instance
            _.each(data, (value, key) => {
                // __default is used to store the initial data props
                if (key !== '_default') {
                    this[key] = value;
                }
            });
        },
        save() {
            this.setStorage(this._data);
        },
        clear() {
            // Clear storage
            localStorage.removeItem('data');

            // Reset properties on clear
            this.setDataProperties(_.clone(this._defaults));
        },

        initialize() {
            // Get all data properties
            let defaults = _.clone(this._data);

            // Use local storage or defaults
            let data = this.hasStorage ? this.getStorage() : defaults;

            this.setDataProperties(_.clone(data));

            // Re-set runtime with all _data properties on mount
            this._defaults = defaults;
        }
    },
    beforeMount() {
        this.initialize();
    }
});
