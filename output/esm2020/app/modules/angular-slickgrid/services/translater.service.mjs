import { Injectable, Optional } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@ngx-translate/core";
/**
 * This is a Translate Service Wrapper for Slickgrid-Universal monorepo lib to work properly,
 * it must implement Slickgrid-Universal TranslaterService interface to work properly
 */
export class TranslaterService {
    constructor(translateService) {
        this.translateService = translateService;
    }
    /**
     * Method to return the current language used by the App
     * @return {string} current language
     */
    getCurrentLanguage() {
        return this.translateService?.currentLang ?? '';
    }
    /**
     * Method to set the language to use in the App and Translate Service
     * @param {string} language
     * @return {Promise} output
     */
    async use(newLang) {
        return this.translateService?.use?.(newLang);
    }
    /**
     * Method which receives a translation key and returns the translated value assigned to that key
     * @param {string} translation key
     * @return {string} translated value
     */
    translate(translationKey) {
        return this.translateService?.instant?.(translationKey || ' ');
    }
}
TranslaterService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: TranslaterService, deps: [{ token: i1.TranslateService, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
TranslaterService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: TranslaterService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: TranslaterService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.TranslateService, decorators: [{
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2FwcC9tb2R1bGVzL2FuZ3VsYXItc2xpY2tncmlkL3NlcnZpY2VzL3RyYW5zbGF0ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBSXJEOzs7R0FHRztBQUVILE1BQU0sT0FBTyxpQkFBaUI7SUFDNUIsWUFBeUMsZ0JBQWtDO1FBQWxDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7SUFBSSxDQUFDO0lBRWhGOzs7T0FHRztJQUNILGtCQUFrQjtRQUNoQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLElBQUksRUFBRSxDQUFDO0lBQ2xELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFlO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxDQUFDLGNBQXNCO1FBQzlCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxDQUFDLGNBQWMsSUFBSSxHQUFHLENBQVcsQ0FBQztJQUMzRSxDQUFDOzsrR0EzQlUsaUJBQWlCO21IQUFqQixpQkFBaUI7NEZBQWpCLGlCQUFpQjtrQkFEN0IsVUFBVTs7MEJBRUksUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFRyYW5zbGF0ZVNlcnZpY2UgfSBmcm9tICdAbmd4LXRyYW5zbGF0ZS9jb3JlJztcclxuaW1wb3J0IHsgVHJhbnNsYXRlclNlcnZpY2UgYXMgVW5pdmVyc2FsVHJhbnNsYXRlU2VydmljZSB9IGZyb20gJ0BzbGlja2dyaWQtdW5pdmVyc2FsL2NvbW1vbic7XHJcblxyXG4vKipcclxuICogVGhpcyBpcyBhIFRyYW5zbGF0ZSBTZXJ2aWNlIFdyYXBwZXIgZm9yIFNsaWNrZ3JpZC1Vbml2ZXJzYWwgbW9ub3JlcG8gbGliIHRvIHdvcmsgcHJvcGVybHksXHJcbiAqIGl0IG11c3QgaW1wbGVtZW50IFNsaWNrZ3JpZC1Vbml2ZXJzYWwgVHJhbnNsYXRlclNlcnZpY2UgaW50ZXJmYWNlIHRvIHdvcmsgcHJvcGVybHlcclxuICovXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFRyYW5zbGF0ZXJTZXJ2aWNlIGltcGxlbWVudHMgVW5pdmVyc2FsVHJhbnNsYXRlU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSB0cmFuc2xhdGVTZXJ2aWNlOiBUcmFuc2xhdGVTZXJ2aWNlKSB7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWV0aG9kIHRvIHJldHVybiB0aGUgY3VycmVudCBsYW5ndWFnZSB1c2VkIGJ5IHRoZSBBcHBcclxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IGN1cnJlbnQgbGFuZ3VhZ2VcclxuICAgKi9cclxuICBnZXRDdXJyZW50TGFuZ3VhZ2UoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZVNlcnZpY2U/LmN1cnJlbnRMYW5nID8/ICcnO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWV0aG9kIHRvIHNldCB0aGUgbGFuZ3VhZ2UgdG8gdXNlIGluIHRoZSBBcHAgYW5kIFRyYW5zbGF0ZSBTZXJ2aWNlXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxhbmd1YWdlXHJcbiAgICogQHJldHVybiB7UHJvbWlzZX0gb3V0cHV0XHJcbiAgICovXHJcbiAgYXN5bmMgdXNlKG5ld0xhbmc6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVTZXJ2aWNlPy51c2U/LihuZXdMYW5nKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ldGhvZCB3aGljaCByZWNlaXZlcyBhIHRyYW5zbGF0aW9uIGtleSBhbmQgcmV0dXJucyB0aGUgdHJhbnNsYXRlZCB2YWx1ZSBhc3NpZ25lZCB0byB0aGF0IGtleVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0cmFuc2xhdGlvbiBrZXlcclxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRyYW5zbGF0ZWQgdmFsdWVcclxuICAgKi9cclxuICB0cmFuc2xhdGUodHJhbnNsYXRpb25LZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVTZXJ2aWNlPy5pbnN0YW50Py4odHJhbnNsYXRpb25LZXkgfHwgJyAnKSBhcyBzdHJpbmc7XHJcbiAgfVxyXG59XHJcbiJdfQ==