import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class ContainerService {
    constructor() {
        this.dependencies = [];
    }
    get(key) {
        const dependency = this.dependencies.find(dep => dep.key === key);
        if (dependency?.instance) {
            return dependency.instance;
        }
        return null;
    }
    dispose() {
        this.dependencies = [];
    }
    registerInstance(key, instance) {
        const dependency = this.dependencies.some(dep => dep.key === key);
        if (!dependency) {
            this.dependencies.push({ key, instance });
        }
    }
}
ContainerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: ContainerService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ContainerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: ContainerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: ContainerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBwL21vZHVsZXMvYW5ndWxhci1zbGlja2dyaWQvc2VydmljZXMvY29udGFpbmVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFJM0MsTUFBTSxPQUFPLGdCQUFnQjtJQUczQjtRQUZBLGlCQUFZLEdBQXdCLEVBQUUsQ0FBQztJQUV2QixDQUFDO0lBRWpCLEdBQUcsQ0FBVSxHQUFXO1FBQ3RCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNsRSxJQUFJLFVBQVUsRUFBRSxRQUFRLEVBQUU7WUFDeEIsT0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsUUFBYTtRQUN6QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDM0M7SUFDSCxDQUFDOzs4R0F0QlUsZ0JBQWdCO2tIQUFoQixnQkFBZ0I7NEZBQWhCLGdCQUFnQjtrQkFENUIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQ29udGFpbmVySW5zdGFuY2UsIENvbnRhaW5lclNlcnZpY2UgYXMgVW5pdmVyc2FsQ29udGFpbmVyU2VydmljZSB9IGZyb20gJ0BzbGlja2dyaWQtdW5pdmVyc2FsL2NvbW1vbic7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBDb250YWluZXJTZXJ2aWNlIGltcGxlbWVudHMgVW5pdmVyc2FsQ29udGFpbmVyU2VydmljZSB7XHJcbiAgZGVwZW5kZW5jaWVzOiBDb250YWluZXJJbnN0YW5jZVtdID0gW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkgeyB9XHJcblxyXG4gIGdldDxUID0gYW55PihrZXk6IHN0cmluZyk6IFQgfCBudWxsIHtcclxuICAgIGNvbnN0IGRlcGVuZGVuY3kgPSB0aGlzLmRlcGVuZGVuY2llcy5maW5kKGRlcCA9PiBkZXAua2V5ID09PSBrZXkpO1xyXG4gICAgaWYgKGRlcGVuZGVuY3k/Lmluc3RhbmNlKSB7XHJcbiAgICAgIHJldHVybiBkZXBlbmRlbmN5Lmluc3RhbmNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBbXTtcclxuICB9XHJcblxyXG4gIHJlZ2lzdGVySW5zdGFuY2Uoa2V5OiBzdHJpbmcsIGluc3RhbmNlOiBhbnkpIHtcclxuICAgIGNvbnN0IGRlcGVuZGVuY3kgPSB0aGlzLmRlcGVuZGVuY2llcy5zb21lKGRlcCA9PiBkZXAua2V5ID09PSBrZXkpO1xyXG4gICAgaWYgKCFkZXBlbmRlbmN5KSB7XHJcbiAgICAgIHRoaXMuZGVwZW5kZW5jaWVzLnB1c2goeyBrZXksIGluc3RhbmNlIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=