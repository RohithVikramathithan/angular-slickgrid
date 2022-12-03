import { ContainerInstance, ContainerService as UniversalContainerService } from '@slickgrid-universal/common';
import * as i0 from "@angular/core";
export declare class ContainerService implements UniversalContainerService {
    dependencies: ContainerInstance[];
    constructor();
    get<T = any>(key: string): T | null;
    dispose(): void;
    registerInstance(key: string, instance: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContainerService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ContainerService>;
}
