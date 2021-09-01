import {Component, Fragment} from "react";
import ErrorIcon from "@material-ui/icons/Error";
import {CircularProgress} from "@material-ui/core";
import DoneIcon from "@material-ui/icons/Done";
import WarningIcon from "@material-ui/icons/Warning";
import {doNullableTypeCheck, isOfType} from "../utils/types";

/**
 * A label that generates <span> elements from an array of strings and components.
 */
class LabelSpan extends Component {
    renderSingle(value) {
        if (!value) {
            value = this.props.defaultValue;
            if (!value)
                return null;
        }

        return (
            <span key={value.toString()} className={"mr-1 " + (this.props.className || "")}>
                {value}
            </span>
        );
    }

    render() {
        if (!isOfType(this.props.value, Array))
            return this.renderSingle(this.props.value);

        return this.props.value.map((value) => this.renderSingle(value));
    }
}

/**
 * A label to represent progress of an action.
 */
export class ProgressLabel extends Component {
    render() {
        return (
            <div className={"flex flex-wrap text-blue-600 text-lg " + (this.props.className || "")}>
                <span className="mr-3"><CircularProgress size={24} /></span>
                <LabelSpan value={this.props.value} defaultValue="Working..." />
            </div>
        );
    }
}

/**
 * A label to represent that an action has succeeded.
 */
export class SuccessLabel extends Component {
    render() {
        return (
            <div className={"flex flex-wrap text-green-600 text-lg " + (this.props.className || "")}>
                <span className="mr-1 text-green-500"><DoneIcon /></span>
                <LabelSpan value={this.props.value} defaultValue="Success" className="pt-0.5" />
            </div>
        );
    }
}

/**
 * A label to represent a warning about an action.
 */
export class WarningLabel extends Component {
    render() {
        return (
            <div className={"flex flex-wrap text-yellow-600 text-lg " + (this.props.className || "")}>
                <span className="mr-1 text-yellow-400"><WarningIcon /></span>
                <LabelSpan value={this.props.value} defaultValue="Warning" className="pt-0.5" />
            </div>
        );
    }
}

/**
 * A label to represent an error in an action.
 */
export class ErrorLabel extends Component {
    render() {
        return (
            <div className={"flex flex-wrap text-red-600 text-lg " + (this.props.className || "")}>
                <span className="mr-1"><ErrorIcon /></span>
                <LabelSpan value={this.props.value} defaultValue="Error" className="pt-0.5" />
            </div>
        );
    }
}

/**
 * The status of an action to be presented to the user.
 */
export class Status {
    // All of these can be null, a simple String,
    // a DOM Component, or an array of DOM Components
    // and Strings.
    progress;
    success;
    warning;
    error;

    constructor(progress, success, warning, error) {
        doNullableTypeCheck(progress, ["string", Component, Array]);
        this.progress = progress;
        this.success = success;
        this.warning = warning;
        this.error = error;
    }

    static none() {
        return new Status(null, null, null, null);
    }

    static progress(message) {
        return new Status(message, null, null, null);
    }

    static success(message) {
        return new Status(null, message, null, null);
    }

    static warning(message) {
        return new Status(null, null, message, null);
    }

    static error(message) {
        return new Status(null, null, null, message);
    }
}

/**
 * A label to display the status of an action.
 */
export default class StatusLabel extends Component {
    render() {
        if (!this.props.status)
            return null;

        const status = this.props.status;
        return (
            <div className={this.props.className || ""}>
                {status.progress && <ProgressLabel value={status.progress} />}
                {status.success && <SuccessLabel value={status.success} />}
                {status.warning && <WarningLabel value={status.warning} />}
                {status.error && <ErrorLabel value={status.error} />}
            </div>
        );
    }
}
