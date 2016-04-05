import { JasmineAsyncEnv } from "../utils/JasmineAsyncEnv";
import { IncomingMessage } from "http";
import { ExtendingObject } from "./ExtendingObject";
export interface ICallConfigParams {
    /** API base url*/
    baseURL?: string;
    /** Only used when auto generating tests using a utility*/
    testName?: string;
    /**
     * Only used when auto generating tests using a utility.
     * Can be used to create xit() && fit() calls
     */
    testModifier?: string;
    /** Call endpoint*/
    endPoint?: string;
    /** Headers array*/
    headers?: any;
    /** Call HTTP method to use, defaults to POST*/
    method?: string;
    /** Amount of time to wait before executing the call*/
    waits?: number;
    /** Status code expected for the response of this call, defaults to 200*/
    status?: number;
    /**
     * Array of functions that will be executed before the config is run
     * Can be used to transform the config as a last stage
     */
    beforeFuncArr?: Array<IBeforeFunc>;
    /** Array of data objects / functions to be sent with the call, either a function that will be evoked to get the result or an object*/
    dataArr?: Array<IDataFunc | any>;
    /** List of functions to run custom assertions for this call*/
    assertFuncArr?: Array<IAssertFunc>;
    /**
     * Array of obfuscation functions, will be called before any logging is done
     * should be used to obfuscate any sensitive data from the log
     */
    obfuscateArr?: Array<IObfuscateFunc>;
    /**
     * Will be called if checkRequestSchema:true
     * It is up to the implementation to complete this method
     * It should return if the schema check passed or not
     */
    checkRequestSchemaFunc?: ISchemaFunc;
    /**
     * Will be called if checkResponseSchema:true
     * It is up to the implementation to complete this method
     * It should return if the schema check passed or not
     */
    checkResponseSchemaFunc?: ISchemaFunc;
    /** If set to true checkRequestSchemaFunc() will be called for the request data*/
    checkRequestSchema?: boolean;
    /** If set to true checkResponseSchemaFunc() will be called for the response data*/
    checkResponseSchema?: boolean;
}
export interface IBeforeFunc {
    (env: JasmineAsyncEnv, call: CallConfig): void;
}
export interface IAssertFunc {
    (env: JasmineAsyncEnv, call: CallConfig, body: any, res: IncomingMessage): void;
}
export interface IDataFunc {
    (env: JasmineAsyncEnv, call: CallConfig): any;
}
export interface IObfuscateFunc {
    (env: JasmineAsyncEnv, call: CallConfig, body: any, res: IncomingMessage): void;
}
export interface ISchemaFunc {
    (env: JasmineAsyncEnv, call: CallConfig, data: any, res: IncomingMessage): boolean;
}
export declare class CallConfig extends ExtendingObject<CallConfig, ICallConfigParams> implements ICallConfigParams {
    baseURL: string;
    testName: string;
    testModifier: string;
    endPoint: string;
    headers: any;
    method: string;
    waits: number;
    status: number;
    beforeFuncArr: Array<IBeforeFunc>;
    dataArr: Array<IDataFunc | any>;
    assertFuncArr: Array<IAssertFunc>;
    obfuscateArr: Array<IObfuscateFunc>;
    checkRequestSchemaFunc: ISchemaFunc;
    checkResponseSchemaFunc: ISchemaFunc;
    checkRequestSchema: boolean;
    checkResponseSchema: boolean;
    constructor(params?: ICallConfigParams);
    /**
     * Proxy for executing the beforeFuncArr calls
     */
    beforeProxy(env: JasmineAsyncEnv): void;
    /**
     * Proxy for executing the dataArr calls
     */
    getDataImpl(env: JasmineAsyncEnv): any;
    /**
     * Proxy for running all assertions
     */
    assertFuncImpl(env: JasmineAsyncEnv, body: any, res: IncomingMessage): void;
    /**
     * Proxy for all obfuscations
     */
    obfuscateFuncImpl(env: JasmineAsyncEnv, body: any, res: IncomingMessage): void;
    /**
     * Proxy for running schema checks
     */
    checkSchemaImpl(env: JasmineAsyncEnv, data: any, isRequest: boolean, res: IncomingMessage): boolean;
    /**
     * Returns the full api url for running the call
     */
    fullURL: string;
    /**
     * Used to generated a new CallConfig instance
     * Properties are cascaded onto the new instance using
     * the current object, then the passed params
     */
    extend(params: ICallConfigParams): CallConfig;
}
export declare class CallRunner {
    defaultConfig: CallConfig;
    timeout: number;
    /**
     * Utility helper method for executing a request package
     * call using a CallConfig and an environment
     */
    run(call: CallConfig, env: JasmineAsyncEnv): void;
    /**
     * Pretty logging for the reporter of the request and repsonse
     */
    logRequestResponse(error: any, res: any, body: any, options: any): void;
}
