import { ModuleWithProviders } from '@angular/core';
import { GridOption } from './../models/gridOption.interface';
import * as i0 from "@angular/core";
import * as i1 from "../components/angular-slickgrid.component";
import * as i2 from "@angular/common";
import * as i3 from "@ngx-translate/core";
export declare class AngularSlickgridModule {
    static forRoot(config?: GridOption): ModuleWithProviders<AngularSlickgridModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularSlickgridModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AngularSlickgridModule, [typeof i1.AngularSlickgridComponent], [typeof i2.CommonModule, typeof i3.TranslateModule], [typeof i1.AngularSlickgridComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AngularSlickgridModule>;
}
