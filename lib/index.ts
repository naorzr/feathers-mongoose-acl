import { Hook, HookContext, HookMap } from "@feathersjs/feathers";
import {
  iff,
  isProvider,
  preventChanges
} from "feathers-hooks-common";
import { Forbidden } from "@feathersjs/errors";

type specificServiceMethods = keyof Omit<HookMap, "all">;

/**
 * Mongoose criteria, e.g $and $or etc
 */
type criteria = any;


/**
 * Access Layer Hook -
 * Handles Document access and field level access, per role per method
 * Accepts roles or generic * asterisk for all the rest of the roles not specified
 * @default access denied
 * @param userRole
 * @param permissions
 * @constructor
 */
const AccessLayerHook = <T extends { [role: string]: any }, K extends keyof T>(
  userRoleFromContext: (context: HookContext) => K,permissions: ACCESS_LAYER<T, K>): Hook => context => {
  const userRole = userRoleFromContext(context)
  const methodRules =
    permissions.DOC_ACCESS[context.method as specificServiceMethods];
  if(!methodRules){
    throw new Forbidden("Not allowed to perform this request");
  }

  const rules = methodRules[userRole] || methodRules["*"];
  let criteria = {};
  // If rules exist, get the query criterias for them
  if (typeof rules !== "undefined") {
    // Rules can be query rules or boolean, if boolean, no need to get criteria for them
    if (typeof rules === "boolean" && rules === false) {
      throw new Forbidden("Not allowed to perform this request");
    } else if (typeof rules !== "boolean") {
      criteria = rules(context);
    }
  } else {
    throw new Forbidden("Not allowed to perform this request");
  }
  console.log("criteria", criteria);
  context.params.query = {
    ...context.params.query,
    ...criteria
  };
  if (context.method === "patch" && permissions.NONE_PATCHABLE_FIELDS) {
    const preventChangesData =
      permissions.NONE_PATCHABLE_FIELDS[userRole] ||
      permissions.NONE_PATCHABLE_FIELDS["*"] ||
      ({} as any);
    const { fields, throw: shouldThrow } = preventChangesData;
    if (fields) {
      return preventChanges(shouldThrow, ...fields)(context);
    }
  }
  return context;
};

/**
 * Only execute access layer protection for external transports
 * @param userRole
 * @param acessLayer
 * @constructor
 */
const AccessLayerHookExternal = <T extends { [role: string]: any }, K extends keyof T>(userRoleFromContext: (context: HookContext) => K,acessLayer: ACCESS_LAYER<T,K>) =>
  iff(isProvider("external"), AccessLayerHook(userRoleFromContext, acessLayer));

/**
 * Declarative Function for creating mongoose queries in the permission object
 * @example AND(predicateFN1, predicateFN2, predicateFN3, ...)
 * @param {(context: feathers.HookContext) => {}} args
 * @returns {(context: feathers.HookContext) => {$and: any}}
 * @constructor
 */
const AND = (...args: Array<(context: HookContext) => {}>) => (
  context: HookContext
) => {
  return { $and: args.map(funcs => funcs(context)) };
};

/**
 * Declarative Function for creating mongoose queries in the permission object
 * @example OR(predicateFN1, AND(predicateFN2, predicateFN3))
 * @param {(context: feathers.HookContext) => {}} args
 * @returns {(context: feathers.HookContext) => {$or: any}}
 * @constructor
 */
const OR = (...args: Array<(context: HookContext) => {}>) => (
  context: HookContext
) => {
  return { $or: args.map(funcs => funcs(context)) };
};


/**
 * Access Layer structure
 */
export interface ACCESS_LAYER<
  T extends { [role: string]: any },
  K extends keyof T
> {
  DOC_ACCESS: {
    [key in Partial<specificServiceMethods>]: {
      [key in K | "*"]?: ((context: HookContext) => criteria) | boolean;
    };
  };
  NONE_PATCHABLE_FIELDS?: {
    [key in K | "*"]?: { fields: string[]; throw: boolean } | {}
  };
}
export { AccessLayerHook, AND, OR, AccessLayerHookExternal };
