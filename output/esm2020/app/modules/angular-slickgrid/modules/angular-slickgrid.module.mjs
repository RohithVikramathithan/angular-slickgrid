import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSlickgridComponent } from './../components/angular-slickgrid.component';
import { AngularUtilService } from '../services/angularUtil.service';
import { ContainerService } from '../services/container.service';
import * as i0 from "@angular/core";
export class AngularSlickgridModule {
    static forRoot(config = {}) {
        return {
            ngModule: AngularSlickgridModule,
            providers: [
                { provide: 'config', useValue: config },
                { provide: 'externalService', useValue: null },
                AngularUtilService,
                ContainerService,
            ]
        };
    }
}
AngularSlickgridModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: AngularSlickgridModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AngularSlickgridModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.12", ngImport: i0, type: AngularSlickgridModule, declarations: [AngularSlickgridComponent], imports: [CommonModule,
        TranslateModule], exports: [AngularSlickgridComponent] });
AngularSlickgridModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: AngularSlickgridModule, imports: [CommonModule,
        TranslateModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: AngularSlickgridModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        TranslateModule
                    ],
                    declarations: [
                        AngularSlickgridComponent,
                    ],
                    exports: [
                        AngularSlickgridComponent,
                    ]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1zbGlja2dyaWQubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2FwcC9tb2R1bGVzL2FuZ3VsYXItc2xpY2tncmlkL21vZHVsZXMvYW5ndWxhci1zbGlja2dyaWQubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQXVCLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFdEQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFFeEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDckUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sK0JBQStCLENBQUM7O0FBY2pFLE1BQU0sT0FBTyxzQkFBc0I7SUFDakMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFxQixFQUFFO1FBQ3BDLE9BQU87WUFDTCxRQUFRLEVBQUUsc0JBQXNCO1lBQ2hDLFNBQVMsRUFBRTtnQkFDVCxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRTtnQkFDdkMsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtnQkFDOUMsa0JBQWtCO2dCQUNsQixnQkFBZ0I7YUFDakI7U0FDRixDQUFDO0lBQ0osQ0FBQzs7b0hBWFUsc0JBQXNCO3FIQUF0QixzQkFBc0IsaUJBTi9CLHlCQUF5QixhQUp6QixZQUFZO1FBQ1osZUFBZSxhQU1mLHlCQUF5QjtxSEFHaEIsc0JBQXNCLFlBVi9CLFlBQVk7UUFDWixlQUFlOzRGQVNOLHNCQUFzQjtrQkFabEMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsWUFBWTt3QkFDWixlQUFlO3FCQUNoQjtvQkFDRCxZQUFZLEVBQUU7d0JBQ1oseUJBQXlCO3FCQUMxQjtvQkFDRCxPQUFPLEVBQUU7d0JBQ1AseUJBQXlCO3FCQUMxQjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFRyYW5zbGF0ZU1vZHVsZSB9IGZyb20gJ0BuZ3gtdHJhbnNsYXRlL2NvcmUnO1xyXG5cclxuaW1wb3J0IHsgQW5ndWxhclNsaWNrZ3JpZENvbXBvbmVudCB9IGZyb20gJy4vLi4vY29tcG9uZW50cy9hbmd1bGFyLXNsaWNrZ3JpZC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBHcmlkT3B0aW9uIH0gZnJvbSAnLi8uLi9tb2RlbHMvZ3JpZE9wdGlvbi5pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBBbmd1bGFyVXRpbFNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9hbmd1bGFyVXRpbC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29udGFpbmVyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2NvbnRhaW5lci5zZXJ2aWNlJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgaW1wb3J0czogW1xyXG4gICAgQ29tbW9uTW9kdWxlLFxyXG4gICAgVHJhbnNsYXRlTW9kdWxlXHJcbiAgXSxcclxuICBkZWNsYXJhdGlvbnM6IFtcclxuICAgIEFuZ3VsYXJTbGlja2dyaWRDb21wb25lbnQsXHJcbiAgXSxcclxuICBleHBvcnRzOiBbXHJcbiAgICBBbmd1bGFyU2xpY2tncmlkQ29tcG9uZW50LFxyXG4gIF1cclxufSlcclxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJTbGlja2dyaWRNb2R1bGUge1xyXG4gIHN0YXRpYyBmb3JSb290KGNvbmZpZzogR3JpZE9wdGlvbiA9IHt9KTogTW9kdWxlV2l0aFByb3ZpZGVyczxBbmd1bGFyU2xpY2tncmlkTW9kdWxlPiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuZ01vZHVsZTogQW5ndWxhclNsaWNrZ3JpZE1vZHVsZSxcclxuICAgICAgcHJvdmlkZXJzOiBbXHJcbiAgICAgICAgeyBwcm92aWRlOiAnY29uZmlnJywgdXNlVmFsdWU6IGNvbmZpZyB9LFxyXG4gICAgICAgIHsgcHJvdmlkZTogJ2V4dGVybmFsU2VydmljZScsIHVzZVZhbHVlOiBudWxsIH0sXHJcbiAgICAgICAgQW5ndWxhclV0aWxTZXJ2aWNlLFxyXG4gICAgICAgIENvbnRhaW5lclNlcnZpY2UsXHJcbiAgICAgIF1cclxuICAgIH07XHJcbiAgfVxyXG59XHJcbiJdfQ==