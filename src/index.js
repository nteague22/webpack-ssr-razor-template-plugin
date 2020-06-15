import { Compiler, Plugin } from "webpack";
import React, { Component, createElement } from "react";
import { Provider } from "react-redux";
import { createStore, combineReducers, applyMiddleware } from 'redux';
import reactSsr from "react-dom/server";
import fs from "fs";
import path from "path";
import util from "util";

/**
 * Plugin options for each template type to build
 */
export const IPluginTemplateOptions = {
    /** @type {ComponentWithReduxModule[]} */
    templates: [],
    /** @type {ComponentModule[]} */
    basicTemplates: [],
    templatePath: "",
    templateExtension: "",
    templateName: "",
    modelPath: "",
    modelName: "",
    modelNamespace: ""
}

/**
 * A component module that is simple and does not need redux or state
 */
export class ComponentModule {
    constructor({ component = null, name = "" }) {
        /** @type{React.Component | React.ReactElement} */
        this.component = component;
        /** @type {string} */
        this.name = name;
    }
}

/**
 * A component module that uses redux and needs the initial state to reliably generate the SSR output
 */
export class ComponentWithReduxModule {
    constructor({ component = null, model = {}, reducers = {}, name = "" }) {
        /** @type {import("react").ReactElement|Component} */
        this.component = component;
        this.model = model;
        /** @type {import("redux").ReducersMapObject} */
        this.reducers = reducers;
        /** @type {string} */
        this.name = name;
    }
}

export class WebpackTemplatePlugin {

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
        compiler.hooks.done.tapPromise(`Building ${this.options.templateName} Template`, (stat) => {
            let ops = [];
            for (let tmp of this.options.templates || []) {
                if (tmp) {
                    let redcr = combineReducers(tmp.reducers);
                    let store = createStore(redcr, redcr(), applyMiddleware());
                    let render = <Provider store={store}>{tmp.component}</Provider>;

                    // for a redux backed template, we build out the razor template as well as the view model
                    ops.push(
                        new Promise((resolve, reject) => {
                            fs.writeFile(
                                path.resolve(this.options.templatePath, `${tmp.name}${this.options.templateExtension}`),
                                reactSsr.renderToString(render),
                                (err) => {
                                    if (err) {
                                        reject(err.message + "\n" + err.stack);
                                    }
                                    resolve();
                                });
                        })
                    );

                    // Using the generated suffix to ensure developer expectations for created files
                    ops.push(new Promise((resolve, reject) => {
                        fs.writeFile(
                            path.resolve(this.options.modelPath, `${this.options.modelName.replace('[name]', tmp.name)}.generated.cs`),
                            this.buildComponentPropsToViewModel(tmp.model, this.options.modelName.replace('[name]', tmp.name), this.options.modelNamespace),
                            (err) => {
                                if (err) {
                                    reject(`${err.message}\n${err.stack}`);
                                }
                                resolve();
                            }
                        );
                    }));
                }
            }

            for (let basic of this.options.basicTemplates || []) {
                if (basic) {
                    let outputComp = createElement(basic.component);
                    ops.push(new Promise((resolve, reject) => {
                        fs.writeFile(
                            path.resolve(this.options.templatePath, basic.name, this.options.templateExtension),
                            reactSsr.renderToString(outputComp),
                            err => {
                                if (err) {
                                    reject(err.message + '\n' + err.stack);
                                }
                                resolve();
                            }
                        );
                    }));
                }
            }
            return Promise.all(ops);
        });

    }

    buildComponentPropsToViewModel(jsModel, viewModelName, namespace) {
        let propertyDefs = [];
        let constructorLines = [];
        for (let pr of Object.keys(jsModel)) {
            let prType = this.getPropertyType(jsModel[pr]);
            let prName = pr;
            prName = prName.replace(/([a-zA-Z])\-([a-zA-Z])/, "$1$2");

            if (prType.startsWith("IEnumerable")) {
                constructorLines.push(`${prName} = new List<${prType.replace(/^IEnumerable\<(.*)\>$/, "$1")}>();\n`);
            }

            propertyDefs.push(`public ${prType} ${prName} { get; set; }`);
        }
        let outPut = "using System;\nusing System.Collections.Generic;\nusing System.Linq;\n";
        if (namespace) {
            outPut += `namespace ${namespace} {\n`;
        }
        outPut += `public class ${viewModelName} {\n ${propertyDefs.join("\n")}\npublic ${viewModelName}() {\n${constructorLines.join('\n')}\n}\n}`;
        if (namespace) {
            outPut += `\n}\n`;
        }
        return outPut;
    }

    /**
     * Gets the named type of a js model property in .net
     * @param {any} prop The property to check
     * @returns {string}
     */
    getPropertyType(prop) {
        switch (typeof prop) {
            case "string":
                return "string";

            case "boolean":
                return "bool";

            case "number":
                if (prop.toString().indexOf('.') !== -1) {
                    return "decimal";
                }
                return "int";

            case "object":
                if (util.types.isDate(prop)) {
                    return "DateTime";
                }

                if (Array.isArray(prop)) {
                    return `IEnumerable<${this.getPropertyType(prop[0])}>`;
                }

                return "Object";

            default:
                return "Object";
        }
    }
}