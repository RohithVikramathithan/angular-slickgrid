import { TranslateService } from '@ngx-translate/core';
import { TranslaterService as UniversalTranslateService } from '@slickgrid-universal/common';
import * as i0 from "@angular/core";
/**
 * This is a Translate Service Wrapper for Slickgrid-Universal monorepo lib to work properly,
 * it must implement Slickgrid-Universal TranslaterService interface to work properly
 */
export declare class TranslaterService implements UniversalTranslateService {
    private readonly translateService;
    constructor(translateService: TranslateService);
    /**
     * Method to return the current language used by the App
     * @return {string} current language
     */
    getCurrentLanguage(): string;
    /**
     * Method to set the language to use in the App and Translate Service
     * @param {string} language
     * @return {Promise} output
     */
    use(newLang: string): Promise<any>;
    /**
     * Method which receives a translation key and returns the translated value assigned to that key
     * @param {string} translation key
     * @return {string} translated value
     */
    translate(translationKey: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TranslaterService, [{ optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TranslaterService>;
}
