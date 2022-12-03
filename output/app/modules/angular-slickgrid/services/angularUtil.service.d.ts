import { AngularComponentOutput } from '../models/angularComponentOutput.interface';
import { ApplicationRef, ComponentFactoryResolver, Injector } from '@angular/core';
import * as i0 from "@angular/core";
export declare class AngularUtilService {
    private compFactoryResolver;
    private appRef;
    private injector;
    constructor(compFactoryResolver: ComponentFactoryResolver, appRef: ApplicationRef, injector: Injector);
    createAngularComponent(component: any): AngularComponentOutput;
    createAngularComponentAppendToDom(component: any, targetElement?: HTMLElement | Element, clearTargetContent?: boolean): AngularComponentOutput;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularUtilService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularUtilService>;
}
