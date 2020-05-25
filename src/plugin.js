import { Compiler, Plugin } from "webpack";
import react from "react";
import { Provider } from "react-redux";
import { createStore, combineReducers } from 'redux';
import reactSsr from "react-dom/server";
import fs from "fs";
import path from "path";

export const IPluginTemplateOptions = {
    /** @type {ArrayLike<IComponentModule|IComponentWithReduxModule>} */
    templates: [],
    templatePath: "",
    extension: "",
    templateName: ""
}

export const IComponentModule = {
    /** @type{react.Component | react.ReactElement} */
    component: null,
    /** @type {string} */
    name: ""
}

export const IComponentWithReduxModule = {
    /** @type {react.Component | react.ReactElement} */
    component: null,
    /** @type {{[stateName]: reducer}} */
    initialState: null,
    /** @type {Record<string, import("redux").Reducer>} */
    reducers: null,
    /** @type {string} */
    name: ""
}

export default class WebpackTemplatePlugin {

    /**
     * Builds a new plugin instance
     * @param {IPluginTemplateOptions} options the file options 
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * hooks in plugin
     * @param {import('webpack').Compiler} compiler the running compiler to hook into
     */
    apply(compiler) {
        const { outputTemplatePattern, templateName, templatePath, templatePattern, useFilenameForOutput } = this.options;
        compiler.hooks.done.tapPromise(`Build ${this.options.templateName} Template`, (stat) => {
            let ops = [];
            for (let tmp of this.options.templates) {
                let breaker = false;
                /** @type {import("react").ReactElement|import("react").Component} */
                let render = null;

                if (tmp.reducers && tmp.component) {
                    // this is a redux component
                    let store = createStore(combineReducers(...tmp.reducers), tmp.initialState, applyMiddleware());
                    render = react.createElement(Provider, { store }, tmp.component);
                    breaker = true;
                }

                if (!breaker && tmp.component) {
                    // this is a standard react component
                    render = tmp.component
                    breaker = true;
                }

                if (breaker) {
                    ops.push(
                        new Promise((resolve, reject) => {
                            let ouptut = reactSsr.renderToString(render);
                            fs.writeFile(
                                path.resolve(this.options.templatePath, tmp.name, this.options.extension),
                                output,
                                (err) => {
                                    if (err) {
                                        reject(err.message + "\n" + err.stack);
                                    }
                                    resolve();
                                });
                        })
                    );
                }
            }
            return Promise.all(ops);
        });
    }
}