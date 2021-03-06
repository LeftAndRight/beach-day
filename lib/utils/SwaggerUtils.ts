import * as path from "path";
import * as fs from "fs";

function loopObject(currObject, callback){
    // Run through the entire object and update the type of all schemas to include null if x-isnullable is set to true
    for (var propName in currObject){
        var value = currObject[propName];
        if (typeof value == "object"){
            loopObject(value, callback);
        }
        callback(propName, currObject, value);
    }
    return currObject;
}

function convertXIsNullable(propName, currObject, value){
    // Shift this property
    if (propName == "x-isnullable" && value === true && currObject.hasOwnProperty("type")){
        currObject.type = [currObject.type, "null"];
    }
    return value;
}

function convertNullableBasedOnRequired(sourcePropName, currObject, value){
    // Update the non required properties to be nullable
    if (sourcePropName == "properties"){
        // First create a hash of required props
        var requiredHash    = {};
        // Get the required props or an empty array if not populated to generate the hash
        var required        = currObject["required"] || [];
        for (var i = 0; i < required.length; i++) {
            requiredHash[required[i]] = true;
        }

        // Now run through all the properties of the
        // current object and make non required nullable
        var properties  = value;

        for (var propName in properties){
            var type    = properties[propName].type;

            // Determine if the property already has null
            var hasNull = false;
            if (type instanceof Array){
                for (var i = 0; i < type.length; i++){
                    if (type[i] === "null"){
                        hasNull = true;
                        break;
                    }
                }
            }

            // If is required add null into the
            if (requiredHash[propName] == undefined){
                // If already an array, look for null
                if (type instanceof Array){
                    if (!hasNull) type.push("null");
                }
                // Otherwise just convert to array and add null
                else{
                    properties[propName].type = [properties[propName].type, "null"];
                }

                // for the enum we also have to add an option of null to the list
                if (properties[propName].hasOwnProperty("enum")){
                    var enumList:Array<any> = properties[propName]["enum"];
                    if (enumList.length > 0 && enumList[enumList.length - 1] != null){
                        properties[propName]["enum"].push(null);
                    }
                }
            }
            // If not required then make sure there is no null in the type definition
            else if (type instanceof Array && hasNull){
                for (var i = 0; i < type.length; i++){
                    if (type[i] == "null"){
                        type.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
    return value;
}




export class SwaggerUtils {
    /**
     * Utility to load and parse a swagger JSON file
     * Note this method updates the swagger object by looking for schema keys of 'x-isnullable'
     * Then updating the object type to to be an array or original type and null
     * This allows you to support null schema checks using tv4 framework
     * e.g.: "type": "string" becomes "type":["string", null]
     *
     * @param swaggerJSONPath {Object} The path the the JSON file
     * @param doNullableConversions {Object} Weather or not to do the nullable conversions, defaults to true
     * @returns {*}
     */
    public static parseSwaggerJSON(swaggerJSONPath:string, doNullableConversions:boolean = true){
        // Load the swagger file
        var swaggerJSONStr = fs.readFileSync(swaggerJSONPath, {encoding:"utf-8"});
        // Parse file from JSON
        var swaggerObj = JSON.parse(swaggerJSONStr);

        // Process and return
        if (doNullableConversions === true){
            swaggerObj = SwaggerUtils.recurseSwagger(swaggerObj);
        }

        return swaggerObj
    }

    public static recurseSwagger(swaggerObj:any):any {
        // Process and return
        swaggerObj = loopObject(swaggerObj, convertXIsNullable);
        swaggerObj = loopObject(swaggerObj, convertNullableBasedOnRequired);

        return swaggerObj
    }
}