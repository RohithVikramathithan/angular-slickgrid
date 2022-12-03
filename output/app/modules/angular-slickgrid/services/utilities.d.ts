import { Subscription } from 'rxjs';
/**
 * Unsubscribe all Observables Subscriptions
 * It will return an empty array if it all went well
 * @param subscriptions
 */
export declare function unsubscribeAllObservables(subscriptions: Subscription[]): Subscription[];
