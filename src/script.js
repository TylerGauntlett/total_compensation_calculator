new Vue({
    el: "#app",
    data: {
        base: 50000,
        sti: 5,
        k401: 4,
        espp: 15,
        esppDiscount: 15,
        stockIncrease: 10,
        rsu: 5000,
        rsuVestingPeriod: 3,
        hsa: 1000,
        pto: 10,
        holidays: 8
    },
    computed: {
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
            const workingHoursInYear = 2080;

            let total = (this.pto + this.holidays) * (this.base / workingHoursInYear)

            return this.format(total);
        },

        // Variables used in total calculation
        bonus() {
            return this.base * this.stiPercent;
        },
        salaryWithoutEspp() {
            return this.base * (1 - (this.esppPercent * (1 + this.stockIncreasePercent)));
        },
        salaryWithEspp() {
            return (this.base * this.esppPercent * (1 + this.stockIncreasePercent)) * (1 + this.esppDiscountPercent) * (1 + this.stockIncreasePercent);
        },
        k401Contribution() {
            return this.base * this.k401Percent;
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
        }
    },
    methods: {
        format(value) {
            let formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            });

            return formatter.format(value);
        }
    }
});
