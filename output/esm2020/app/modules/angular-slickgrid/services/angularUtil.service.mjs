import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class AngularUtilService {
    constructor(compFactoryResolver, appRef, injector) {
        this.compFactoryResolver = compFactoryResolver;
        this.appRef = appRef;
        this.injector = injector;
    }
    // ref https://hackernoon.com/angular-pro-tip-how-to-dynamically-create-components-in-body-ba200cc289e6
    createAngularComponent(component) {
        // Create a component reference from the component
        const componentRef = this.compFactoryResolver
            .resolveComponentFactory(component)
            .create(this.injector);
        // Attach component to the appRef so that it's inside the ng component tree
        this.appRef.attachView(componentRef.hostView);
        // Get DOM element from component
        let domElem;
        const viewRef = componentRef.hostView;
        if (viewRef && Array.isArray(viewRef.rootNodes) && viewRef.rootNodes[0]) {
            domElem = viewRef.rootNodes[0];
        }
        return { componentRef, domElement: domElem };
    }
    // ref https://hackernoon.com/angular-pro-tip-how-to-dynamically-create-components-in-body-ba200cc289e6
    createAngularComponentAppendToDom(component, targetElement, clearTargetContent = false) {
        const componentOutput = this.createAngularComponent(component);
        // Append DOM element to the HTML element specified
        if (targetElement && targetElement.appendChild) {
            if (clearTargetContent && targetElement.innerHTML) {
                targetElement.innerHTML = '';
            }
            targetElement.appendChild(componentOutput.domElement);
        }
        else {
            document.body.appendChild(componentOutput.domElement); // when no target provided, we'll simply add it to the HTML Body
        }
        return componentOutput;
    }
}
AngularUtilService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: AngularUtilService, deps: [{ token: i0.ComponentFactoryResolver }, { token: i0.ApplicationRef }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Injectable });
AngularUtilService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: AngularUtilService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: AngularUtilService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i0.ComponentFactoryResolver }, { type: i0.ApplicationRef }, { type: i0.Injector }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhclV0aWwuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9hcHAvbW9kdWxlcy9hbmd1bGFyLXNsaWNrZ3JpZC9zZXJ2aWNlcy9hbmd1bGFyVXRpbC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBNkQsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDOztBQUdoSCxNQUFNLE9BQU8sa0JBQWtCO0lBQzdCLFlBQ1UsbUJBQTZDLEVBQzdDLE1BQXNCLEVBQ3RCLFFBQWtCO1FBRmxCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBMEI7UUFDN0MsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFDdEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtJQUN4QixDQUFDO0lBRUwsdUdBQXVHO0lBQ3ZHLHNCQUFzQixDQUFDLFNBQWM7UUFDbkMsa0RBQWtEO1FBQ2xELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxtQkFBbUI7YUFDMUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDO2FBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFekIsMkVBQTJFO1FBQzNFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU5QyxpQ0FBaUM7UUFDakMsSUFBSSxPQUFPLENBQUM7UUFDWixNQUFNLE9BQU8sR0FBSSxZQUFZLENBQUMsUUFBaUMsQ0FBQztRQUNoRSxJQUFJLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3ZFLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBZ0IsQ0FBQztTQUMvQztRQUVELE9BQU8sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLE9BQXNCLEVBQUUsQ0FBQztJQUM5RCxDQUFDO0lBRUQsdUdBQXVHO0lBQ3ZHLGlDQUFpQyxDQUFDLFNBQWMsRUFBRSxhQUFxQyxFQUFFLGtCQUFrQixHQUFHLEtBQUs7UUFDakgsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRS9ELG1EQUFtRDtRQUNuRCxJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsV0FBVyxFQUFFO1lBQzlDLElBQUksa0JBQWtCLElBQUksYUFBYSxDQUFDLFNBQVMsRUFBRTtnQkFDakQsYUFBYSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7YUFDOUI7WUFDRCxhQUFhLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN2RDthQUFNO1lBQ0wsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsZ0VBQWdFO1NBQ3hIO1FBRUQsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQzs7Z0hBMUNVLGtCQUFrQjtvSEFBbEIsa0JBQWtCOzRGQUFsQixrQkFBa0I7a0JBRDlCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBbmd1bGFyQ29tcG9uZW50T3V0cHV0IH0gZnJvbSAnLi4vbW9kZWxzL2FuZ3VsYXJDb21wb25lbnRPdXRwdXQuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgQXBwbGljYXRpb25SZWYsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgRW1iZWRkZWRWaWV3UmVmLCBJbmplY3RhYmxlLCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgQW5ndWxhclV0aWxTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgY29tcEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxyXG4gICAgcHJpdmF0ZSBhcHBSZWY6IEFwcGxpY2F0aW9uUmVmLFxyXG4gICAgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IsXHJcbiAgKSB7IH1cclxuXHJcbiAgLy8gcmVmIGh0dHBzOi8vaGFja2Vybm9vbi5jb20vYW5ndWxhci1wcm8tdGlwLWhvdy10by1keW5hbWljYWxseS1jcmVhdGUtY29tcG9uZW50cy1pbi1ib2R5LWJhMjAwY2MyODllNlxyXG4gIGNyZWF0ZUFuZ3VsYXJDb21wb25lbnQoY29tcG9uZW50OiBhbnkpOiBBbmd1bGFyQ29tcG9uZW50T3V0cHV0IHtcclxuICAgIC8vIENyZWF0ZSBhIGNvbXBvbmVudCByZWZlcmVuY2UgZnJvbSB0aGUgY29tcG9uZW50XHJcbiAgICBjb25zdCBjb21wb25lbnRSZWYgPSB0aGlzLmNvbXBGYWN0b3J5UmVzb2x2ZXJcclxuICAgICAgLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KGNvbXBvbmVudClcclxuICAgICAgLmNyZWF0ZSh0aGlzLmluamVjdG9yKTtcclxuXHJcbiAgICAvLyBBdHRhY2ggY29tcG9uZW50IHRvIHRoZSBhcHBSZWYgc28gdGhhdCBpdCdzIGluc2lkZSB0aGUgbmcgY29tcG9uZW50IHRyZWVcclxuICAgIHRoaXMuYXBwUmVmLmF0dGFjaFZpZXcoY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcclxuXHJcbiAgICAvLyBHZXQgRE9NIGVsZW1lbnQgZnJvbSBjb21wb25lbnRcclxuICAgIGxldCBkb21FbGVtO1xyXG4gICAgY29uc3Qgdmlld1JlZiA9IChjb21wb25lbnRSZWYuaG9zdFZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPGFueT4pO1xyXG4gICAgaWYgKHZpZXdSZWYgJiYgQXJyYXkuaXNBcnJheSh2aWV3UmVmLnJvb3ROb2RlcykgJiYgdmlld1JlZi5yb290Tm9kZXNbMF0pIHtcclxuICAgICAgZG9tRWxlbSA9IHZpZXdSZWYucm9vdE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7IGNvbXBvbmVudFJlZiwgZG9tRWxlbWVudDogZG9tRWxlbSBhcyBIVE1MRWxlbWVudCB9O1xyXG4gIH1cclxuXHJcbiAgLy8gcmVmIGh0dHBzOi8vaGFja2Vybm9vbi5jb20vYW5ndWxhci1wcm8tdGlwLWhvdy10by1keW5hbWljYWxseS1jcmVhdGUtY29tcG9uZW50cy1pbi1ib2R5LWJhMjAwY2MyODllNlxyXG4gIGNyZWF0ZUFuZ3VsYXJDb21wb25lbnRBcHBlbmRUb0RvbShjb21wb25lbnQ6IGFueSwgdGFyZ2V0RWxlbWVudD86IEhUTUxFbGVtZW50IHwgRWxlbWVudCwgY2xlYXJUYXJnZXRDb250ZW50ID0gZmFsc2UpOiBBbmd1bGFyQ29tcG9uZW50T3V0cHV0IHtcclxuICAgIGNvbnN0IGNvbXBvbmVudE91dHB1dCA9IHRoaXMuY3JlYXRlQW5ndWxhckNvbXBvbmVudChjb21wb25lbnQpO1xyXG5cclxuICAgIC8vIEFwcGVuZCBET00gZWxlbWVudCB0byB0aGUgSFRNTCBlbGVtZW50IHNwZWNpZmllZFxyXG4gICAgaWYgKHRhcmdldEVsZW1lbnQgJiYgdGFyZ2V0RWxlbWVudC5hcHBlbmRDaGlsZCkge1xyXG4gICAgICBpZiAoY2xlYXJUYXJnZXRDb250ZW50ICYmIHRhcmdldEVsZW1lbnQuaW5uZXJIVE1MKSB7XHJcbiAgICAgICAgdGFyZ2V0RWxlbWVudC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgfVxyXG4gICAgICB0YXJnZXRFbGVtZW50LmFwcGVuZENoaWxkKGNvbXBvbmVudE91dHB1dC5kb21FbGVtZW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29tcG9uZW50T3V0cHV0LmRvbUVsZW1lbnQpOyAvLyB3aGVuIG5vIHRhcmdldCBwcm92aWRlZCwgd2UnbGwgc2ltcGx5IGFkZCBpdCB0byB0aGUgSFRNTCBCb2R5XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbXBvbmVudE91dHB1dDtcclxuICB9XHJcbn1cclxuIl19