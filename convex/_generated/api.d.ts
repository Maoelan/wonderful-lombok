/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminStore from "../adminStore.js";
import type * as bookingData from "../bookingData.js";
import type * as bookingStore from "../bookingStore.js";
import type * as bookings from "../bookings.js";
import type * as catalog from "../catalog.js";
import type * as catalogStore from "../catalogStore.js";
import type * as files from "../files.js";
import type * as media from "../media.js";
import type * as serverAuth from "../serverAuth.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminStore: typeof adminStore;
  bookingData: typeof bookingData;
  bookingStore: typeof bookingStore;
  bookings: typeof bookings;
  catalog: typeof catalog;
  catalogStore: typeof catalogStore;
  files: typeof files;
  media: typeof media;
  serverAuth: typeof serverAuth;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
