import {doTypeCheck} from "../utils/types";
import {randNormal} from "../utils/random";


/**
 * A linear function y = mx + c.
 */
export class LinearFunction {
    slope; // Number
    intercept; // Number

    constructor(slope, intercept) {
        doTypeCheck(slope, "number");
        doTypeCheck(intercept, "number");

        this.slope = slope;
        this.intercept = intercept;
    }

    get(x) {
        return x * this.slope + this.intercept;
    }

    toJSON() {
        return {
            "slope": this.slope,
            "intercept": this.intercept
        };
    }

    static fromJSON(json) {
        return new LinearFunction(
            json["slope"], json["intercept"]
        );
    }
}

/**
 * Represents a gaussian distribution that is truncated
 * so that no values are generated outside of the range
 * [min, max].
 */
export class TruncatedNormalDistribution {
    mean; // Number
    stdDeviation; // Number
    min; // Number
    max; // Number

    constructor(mean, stdDeviation, min, max) {
        doTypeCheck(mean, "number");
        doTypeCheck(stdDeviation, "number");
        doTypeCheck(min, "number");
        doTypeCheck(max, "number");

        this.mean = mean;
        this.stdDeviation = stdDeviation;
        this.min = min;
        this.max = max;
    }

    /**
     * Randomly samples this distribution.
     */
    sample() {
        if (this.stdDeviation <= 0)
            return this.mean;

        let value;
        do {
            value = this.mean + randNormal() * this.stdDeviation;
        } while (value < this.min || value > this.max);
        return value;
    }

    toJSON() {
        return {
            "mean": this.mean,
            "stdDeviation": this.stdDeviation,
            "min": this.min,
            "max": this.max
        };
    }

    static fromJSON(json) {
        return new TruncatedNormalDistribution(
            json["mean"], json["stdDeviation"],
            json["min"], json["max"]
        );
    }
}
