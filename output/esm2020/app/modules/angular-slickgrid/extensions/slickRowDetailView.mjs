import { addToArrayWhenNotExists, castObservableToPromise, SlickRowSelectionModel, unsubscribeAll, } from '@slickgrid-universal/common';
import { SlickRowDetailView as UniversalSlickRowDetailView } from '@slickgrid-universal/row-detail-view-plugin';
import { Observable } from 'rxjs';
import * as DOMPurify from 'dompurify';
const ROW_DETAIL_CONTAINER_PREFIX = 'container_';
const PRELOAD_CONTAINER_PREFIX = 'container_loading';
export class SlickRowDetailView extends UniversalSlickRowDetailView {
    constructor(angularUtilService, appRef, eventPubSubService, gridContainerElement, rxjs) {
        super(eventPubSubService);
        this.angularUtilService = angularUtilService;
        this.appRef = appRef;
        this.eventPubSubService = eventPubSubService;
        this.gridContainerElement = gridContainerElement;
        this.rxjs = rxjs;
        this._views = [];
        this._subscriptions = [];
    }
    get addonOptions() {
        return this.getOptions();
    }
    get datasetIdPropName() {
        return this.gridOptions.datasetIdPropertyName || 'id';
    }
    get eventHandler() {
        return this._eventHandler;
    }
    set eventHandler(eventHandler) {
        this._eventHandler = eventHandler;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        return (this._grid?.getOptions() || {});
    }
    get rowDetailViewOptions() {
        return this.gridOptions.rowDetailView;
    }
    addRxJsResource(rxjs) {
        this.rxjs = rxjs;
    }
    /** Dispose of the RowDetailView Extension */
    dispose() {
        this.disposeAllViewComponents();
        this._subscriptions = unsubscribeAll(this._subscriptions); // also unsubscribe all RxJS subscriptions
        super.dispose();
    }
    /** Dispose of all the opened Row Detail Panels Angular View Components */
    disposeAllViewComponents() {
        this._views.forEach((compRef) => this.disposeViewComponent(compRef));
        this._views = [];
    }
    /** Get the instance of the SlickGrid addon (control or plugin). */
    getAddonInstance() {
        return this;
    }
    init(grid) {
        this._grid = grid;
        super.init(this._grid);
        this.register(grid?.getSelectionModel());
    }
    /**
     * Create the plugin before the Grid creation, else it will behave oddly.
     * Mostly because the column definitions might change after the grid creation
     */
    register(rowSelectionPlugin) {
        if (typeof this.gridOptions.rowDetailView?.process === 'function') {
            // we need to keep the user "process" method and replace it with our own execution method
            // we do this because when we get the item detail, we need to call "onAsyncResponse.notify" for the plugin to work
            this._userProcessFn = this.gridOptions.rowDetailView.process; // keep user's process method
            this.gridOptions.rowDetailView.process = (item) => this.onProcessing(item); // replace process method & run our internal one
        }
        else {
            throw new Error('[Angular-Slickgrid] You need to provide a "process" function for the Row Detail Extension to work properly');
        }
        if (this._grid && this.gridOptions?.rowDetailView) {
            // load the Preload & RowDetail Templates (could be straight HTML or Angular View/ViewModel)
            // when those are Angular View/ViewModel, we need to create View Component & provide the html containers to the Plugin (preTemplate/postTemplate methods)
            if (!this.gridOptions.rowDetailView.preTemplate) {
                this._preloadComponent = this.gridOptions?.rowDetailView?.preloadComponent;
                this.gridOptions.rowDetailView.preTemplate = () => DOMPurify.sanitize(`<div class="${PRELOAD_CONTAINER_PREFIX}"></div>`);
            }
            if (!this.gridOptions.rowDetailView.postTemplate) {
                this._viewComponent = this.gridOptions?.rowDetailView?.viewComponent;
                this.gridOptions.rowDetailView.postTemplate = (itemDetail) => DOMPurify.sanitize(`<div class="${ROW_DETAIL_CONTAINER_PREFIX}${itemDetail[this.datasetIdPropName]}"></div>`);
            }
            // this also requires the Row Selection Model to be registered as well
            if (!rowSelectionPlugin || !this._grid.getSelectionModel()) {
                rowSelectionPlugin = new SlickRowSelectionModel(this.gridOptions.rowSelectionOptions || { selectActiveRow: true });
                this._grid.setSelectionModel(rowSelectionPlugin);
            }
            // hook all events
            if (this._grid && this.rowDetailViewOptions) {
                if (this.rowDetailViewOptions.onExtensionRegistered) {
                    this.rowDetailViewOptions.onExtensionRegistered(this);
                }
                if (this.onAsyncResponse) {
                    this._eventHandler.subscribe(this.onAsyncResponse, (event, args) => {
                        if (this.rowDetailViewOptions && typeof this.rowDetailViewOptions.onAsyncResponse === 'function') {
                            this.rowDetailViewOptions.onAsyncResponse(event, args);
                        }
                    });
                }
                if (this.onAsyncEndUpdate) {
                    this._eventHandler.subscribe(this.onAsyncEndUpdate, (e, args) => {
                        // triggers after backend called "onAsyncResponse.notify()"
                        this.renderViewModel(args?.item);
                        if (this.rowDetailViewOptions && typeof this.rowDetailViewOptions.onAsyncEndUpdate === 'function') {
                            this.rowDetailViewOptions.onAsyncEndUpdate(e, args);
                        }
                    });
                }
                if (this.onAfterRowDetailToggle) {
                    this._eventHandler.subscribe(this.onAfterRowDetailToggle, (e, args) => {
                        // display preload template & re-render all the other Detail Views after toggling
                        // the preload View will eventually go away once the data gets loaded after the "onAsyncEndUpdate" event
                        this.renderPreloadView();
                        this.renderAllViewComponents();
                        if (this.rowDetailViewOptions && typeof this.rowDetailViewOptions.onAfterRowDetailToggle === 'function') {
                            this.rowDetailViewOptions.onAfterRowDetailToggle(e, args);
                        }
                    });
                }
                if (this.onBeforeRowDetailToggle) {
                    this._eventHandler.subscribe(this.onBeforeRowDetailToggle, (e, args) => {
                        // before toggling row detail, we need to create View Component if it doesn't exist
                        this.handleOnBeforeRowDetailToggle(e, args);
                        if (this.rowDetailViewOptions && typeof this.rowDetailViewOptions.onBeforeRowDetailToggle === 'function') {
                            this.rowDetailViewOptions.onBeforeRowDetailToggle(e, args);
                        }
                    });
                }
                if (this.onRowBackToViewportRange) {
                    this._eventHandler.subscribe(this.onRowBackToViewportRange, (e, args) => {
                        // when row is back to viewport range, we will re-render the View Component(s)
                        this.handleOnRowBackToViewportRange(e, args);
                        if (this.rowDetailViewOptions && typeof this.rowDetailViewOptions.onRowBackToViewportRange === 'function') {
                            this.rowDetailViewOptions.onRowBackToViewportRange(e, args);
                        }
                    });
                }
                if (this.onRowOutOfViewportRange) {
                    this._eventHandler.subscribe(this.onRowOutOfViewportRange, (e, args) => {
                        if (this.rowDetailViewOptions && typeof this.rowDetailViewOptions.onRowOutOfViewportRange === 'function') {
                            this.rowDetailViewOptions.onRowOutOfViewportRange(e, args);
                        }
                    });
                }
                // --
                // hook some events needed by the Plugin itself
                // we need to redraw the open detail views if we change column position (column reorder)
                this._eventHandler.subscribe(this._grid.onColumnsReordered, this.redrawAllViewComponents.bind(this));
                // on row selection changed, we also need to redraw
                if (this.gridOptions.enableRowSelection || this.gridOptions.enableCheckboxSelector) {
                    this._eventHandler.subscribe(this._grid.onSelectedRowsChanged, this.redrawAllViewComponents.bind(this));
                }
                // on sort, all row detail are collapsed so we can dispose of all the Views as well
                this._eventHandler.subscribe(this._grid.onSort, this.disposeAllViewComponents.bind(this));
                // on filter changed, we need to re-render all Views
                this._subscriptions.push(this.eventPubSubService?.subscribe('onFilterChanged', this.redrawAllViewComponents.bind(this)), this.eventPubSubService?.subscribe('onGridMenuClearAllFilters', () => setTimeout(() => this.redrawAllViewComponents())), this.eventPubSubService?.subscribe('onGridMenuClearAllSorting', () => setTimeout(() => this.redrawAllViewComponents())));
            }
        }
        return this;
    }
    /** Redraw (re-render) all the expanded row detail View Components */
    redrawAllViewComponents() {
        this._views.forEach((compRef) => {
            this.redrawViewComponent(compRef);
        });
    }
    /** Render all the expanded row detail View Components */
    renderAllViewComponents() {
        this._views.forEach((view) => {
            if (view && view.dataContext) {
                this.renderViewModel(view.dataContext);
            }
        });
    }
    /** Redraw the necessary View Component */
    redrawViewComponent(createdView) {
        const containerElements = this.gridContainerElement.getElementsByClassName(`${ROW_DETAIL_CONTAINER_PREFIX}${createdView.id}`);
        if (containerElements && containerElements.length >= 0) {
            this.renderViewModel(createdView.dataContext);
        }
    }
    /** Render (or re-render) the View Component (Row Detail) */
    renderPreloadView() {
        const containerElements = this.gridContainerElement.getElementsByClassName(`${PRELOAD_CONTAINER_PREFIX}`);
        if (containerElements && containerElements.length >= 0) {
            this.angularUtilService.createAngularComponentAppendToDom(this._preloadComponent, containerElements[containerElements.length - 1], true);
        }
    }
    /** Render (or re-render) the View Component (Row Detail) */
    renderViewModel(item) {
        const containerElements = this.gridContainerElement.getElementsByClassName(`${ROW_DETAIL_CONTAINER_PREFIX}${item[this.datasetIdPropName]}`);
        if (containerElements && containerElements.length > 0) {
            const componentOutput = this.angularUtilService.createAngularComponentAppendToDom(this._viewComponent, containerElements[containerElements.length - 1], true);
            if (componentOutput && componentOutput.componentRef && componentOutput.componentRef.instance) {
                // pass a few properties to the Row Detail template component
                Object.assign(componentOutput.componentRef.instance, {
                    model: item,
                    addon: this,
                    grid: this._grid,
                    dataView: this.dataView,
                    parent: this.rowDetailViewOptions && this.rowDetailViewOptions.parent,
                });
                const viewObj = this._views.find(obj => obj.id === item[this.datasetIdPropName]);
                if (viewObj) {
                    viewObj.componentRef = componentOutput.componentRef;
                }
                return viewObj;
            }
        }
        return undefined;
    }
    // --
    // protected functions
    // ------------------
    disposeViewComponent(expandedView) {
        const compRef = expandedView?.componentRef;
        if (compRef) {
            this.appRef.detachView(compRef.hostView);
            if (compRef?.destroy) {
                compRef.destroy();
            }
            return expandedView;
        }
    }
    /**
     * notify the onAsyncResponse with the "args.item" (required property)
     * the plugin will then use item to populate the row detail panel with the "postTemplate"
     * @param item
     */
    notifyTemplate(item) {
        if (this.onAsyncResponse) {
            this.onAsyncResponse.notify({ item }, undefined, this);
        }
    }
    /**
     * On Processing, we will notify the plugin with the new item detail once backend server call completes
     * @param item
     */
    async onProcessing(item) {
        if (item && typeof this._userProcessFn === 'function') {
            let awaitedItemDetail;
            const userProcessFn = this._userProcessFn(item);
            // wait for the "userProcessFn", once resolved we will save it into the "collection"
            const response = await userProcessFn;
            if (response.hasOwnProperty(this.datasetIdPropName)) {
                awaitedItemDetail = response; // from Promise
            }
            else if (response && response instanceof Observable || response instanceof Promise) {
                awaitedItemDetail = await castObservableToPromise(this.rxjs, response); // from Angular-http-client
            }
            if (!awaitedItemDetail || !awaitedItemDetail.hasOwnProperty(this.datasetIdPropName)) {
                throw new Error(`[Angular-Slickgrid] could not process the Row Detail, you must make sure that your "process" callback
          (a Promise or an HttpClient call returning an Observable) returns an item object that has an "${this.datasetIdPropName}" property`);
            }
            // notify the plugin with the new item details
            this.notifyTemplate(awaitedItemDetail || {});
        }
    }
    /**
     * Just before the row get expanded or collapsed we will do the following
     * First determine if the row is expanding or collapsing,
     * if it's expanding we will add it to our View Components reference array if we don't already have it
     * or if it's collapsing we will remove it from our View Components reference array
     */
    handleOnBeforeRowDetailToggle(e, args) {
        // expanding
        if (args && args.item && args.item.__collapsed) {
            // expanding row detail
            const viewInfo = {
                id: args.item[this.datasetIdPropName],
                dataContext: args.item
            };
            const idPropName = this.gridOptions.datasetIdPropertyName || 'id';
            addToArrayWhenNotExists(this._views, viewInfo, idPropName);
        }
        else {
            // collapsing, so dispose of the View/Component
            const foundViewIndex = this._views.findIndex((view) => view.id === args.item[this.datasetIdPropName]);
            if (foundViewIndex >= 0 && this._views.hasOwnProperty(foundViewIndex)) {
                const compRef = this._views[foundViewIndex].componentRef;
                if (compRef) {
                    this.appRef.detachView(compRef.hostView);
                    compRef.destroy();
                }
                this._views.splice(foundViewIndex, 1);
            }
        }
    }
    /** When Row comes back to Viewport Range, we need to redraw the View */
    handleOnRowBackToViewportRange(e, args) {
        if (args?.item) {
            this.redrawAllViewComponents();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2tSb3dEZXRhaWxWaWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2FwcC9tb2R1bGVzL2FuZ3VsYXItc2xpY2tncmlkL2V4dGVuc2lvbnMvc2xpY2tSb3dEZXRhaWxWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsdUJBQXVCLEVBS3ZCLHNCQUFzQixFQUN0QixjQUFjLEdBQ2YsTUFBTSw2QkFBNkIsQ0FBQztBQUVyQyxPQUFPLEVBQUUsa0JBQWtCLElBQUksMkJBQTJCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUNoSCxPQUFPLEVBQUUsVUFBVSxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sS0FBSyxTQUFTLE1BQU0sV0FBVyxDQUFDO0FBS3ZDLE1BQU0sMkJBQTJCLEdBQUcsWUFBWSxDQUFDO0FBQ2pELE1BQU0sd0JBQXdCLEdBQUcsbUJBQW1CLENBQUM7QUFRckQsTUFBTSxPQUFPLGtCQUFtQixTQUFRLDJCQUEyQjtJQVNqRSxZQUNxQixrQkFBc0MsRUFDdEMsTUFBc0IsRUFDdEIsa0JBQXNDLEVBQ3RDLG9CQUFvQyxFQUM3QyxJQUFpQjtRQUUzQixLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQU5QLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFDdEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUN0Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQWdCO1FBQzdDLFNBQUksR0FBSixJQUFJLENBQWE7UUFWbkIsV0FBTSxHQUFrQixFQUFFLENBQUM7UUFFM0IsbUJBQWMsR0FBd0IsRUFBRSxDQUFDO0lBV25ELENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsSUFBYyxpQkFBaUI7UUFDN0Is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QUMsSUFBaUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDbkgsSUFBSSxjQUFjLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUNyRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFlBQVksQ0FBQztnQkFDekQsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN6QyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQ25CO2dCQUNELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN2QztTQUNGO0lBQ0gsQ0FBQztJQUVELHdFQUF3RTtJQUM5RCw4QkFBOEIsQ0FBQyxDQUFRLEVBQUUsSUFBMEg7UUFDM0ssSUFBSSxJQUFJLEVBQUUsSUFBSSxFQUFFO1lBQ2QsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7U0FDaEM7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBsaWNhdGlvblJlZiwgQ29tcG9uZW50UmVmLCBUeXBlLCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7XHJcbiAgYWRkVG9BcnJheVdoZW5Ob3RFeGlzdHMsXHJcbiAgY2FzdE9ic2VydmFibGVUb1Byb21pc2UsXHJcbiAgRXZlbnRTdWJzY3JpcHRpb24sXHJcbiAgUnhKc0ZhY2FkZSxcclxuICBTbGlja0V2ZW50SGFuZGxlcixcclxuICBTbGlja0dyaWQsXHJcbiAgU2xpY2tSb3dTZWxlY3Rpb25Nb2RlbCxcclxuICB1bnN1YnNjcmliZUFsbCxcclxufSBmcm9tICdAc2xpY2tncmlkLXVuaXZlcnNhbC9jb21tb24nO1xyXG5pbXBvcnQgeyBFdmVudFB1YlN1YlNlcnZpY2UgfSBmcm9tICdAc2xpY2tncmlkLXVuaXZlcnNhbC9ldmVudC1wdWItc3ViJztcclxuaW1wb3J0IHsgU2xpY2tSb3dEZXRhaWxWaWV3IGFzIFVuaXZlcnNhbFNsaWNrUm93RGV0YWlsVmlldyB9IGZyb20gJ0BzbGlja2dyaWQtdW5pdmVyc2FsL3Jvdy1kZXRhaWwtdmlldy1wbHVnaW4nO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCAqIGFzIERPTVB1cmlmeSBmcm9tICdkb21wdXJpZnknO1xyXG5cclxuaW1wb3J0IHsgR3JpZE9wdGlvbiwgUm93RGV0YWlsVmlldyB9IGZyb20gJy4uL21vZGVscy9pbmRleCc7XHJcbmltcG9ydCB7IEFuZ3VsYXJVdGlsU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2FuZ3VsYXJVdGlsLnNlcnZpY2UnO1xyXG5cclxuY29uc3QgUk9XX0RFVEFJTF9DT05UQUlORVJfUFJFRklYID0gJ2NvbnRhaW5lcl8nO1xyXG5jb25zdCBQUkVMT0FEX0NPTlRBSU5FUl9QUkVGSVggPSAnY29udGFpbmVyX2xvYWRpbmcnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDcmVhdGVkVmlldyB7XHJcbiAgaWQ6IHN0cmluZyB8IG51bWJlcjtcclxuICBkYXRhQ29udGV4dDogYW55O1xyXG4gIGNvbXBvbmVudFJlZj86IENvbXBvbmVudFJlZjxhbnk+O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2xpY2tSb3dEZXRhaWxWaWV3IGV4dGVuZHMgVW5pdmVyc2FsU2xpY2tSb3dEZXRhaWxWaWV3IHtcclxuICByb3dEZXRhaWxDb250YWluZXIhOiBWaWV3Q29udGFpbmVyUmVmO1xyXG4gIHByb3RlY3RlZCBfZXZlbnRIYW5kbGVyITogU2xpY2tFdmVudEhhbmRsZXI7XHJcbiAgcHJvdGVjdGVkIF9wcmVsb2FkQ29tcG9uZW50OiBUeXBlPG9iamVjdD4gfCB1bmRlZmluZWQ7XHJcbiAgcHJvdGVjdGVkIF92aWV3czogQ3JlYXRlZFZpZXdbXSA9IFtdO1xyXG4gIHByb3RlY3RlZCBfdmlld0NvbXBvbmVudCE6IFR5cGU8b2JqZWN0PjtcclxuICBwcm90ZWN0ZWQgX3N1YnNjcmlwdGlvbnM6IEV2ZW50U3Vic2NyaXB0aW9uW10gPSBbXTtcclxuICBwcm90ZWN0ZWQgX3VzZXJQcm9jZXNzRm4hOiAoaXRlbTogYW55KSA9PiBQcm9taXNlPGFueT4gfCBPYnNlcnZhYmxlPGFueT4gfCBTdWJqZWN0PGFueT47XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGFuZ3VsYXJVdGlsU2VydmljZTogQW5ndWxhclV0aWxTZXJ2aWNlLFxyXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGFwcFJlZjogQXBwbGljYXRpb25SZWYsXHJcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZXZlbnRQdWJTdWJTZXJ2aWNlOiBFdmVudFB1YlN1YlNlcnZpY2UsXHJcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZ3JpZENvbnRhaW5lckVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50LFxyXG4gICAgcHJvdGVjdGVkIHJ4anM/OiBSeEpzRmFjYWRlLFxyXG4gICkge1xyXG4gICAgc3VwZXIoZXZlbnRQdWJTdWJTZXJ2aWNlKTtcclxuICB9XHJcblxyXG4gIGdldCBhZGRvbk9wdGlvbnMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRPcHRpb25zKCk7XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgZ2V0IGRhdGFzZXRJZFByb3BOYW1lKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5kYXRhc2V0SWRQcm9wZXJ0eU5hbWUgfHwgJ2lkJztcclxuICB9XHJcblxyXG4gIGdldCBldmVudEhhbmRsZXIoKTogU2xpY2tFdmVudEhhbmRsZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50SGFuZGxlcjtcclxuICB9XHJcbiAgc2V0IGV2ZW50SGFuZGxlcihldmVudEhhbmRsZXI6IFNsaWNrRXZlbnRIYW5kbGVyKSB7XHJcbiAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBldmVudEhhbmRsZXI7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0dGVyIGZvciB0aGUgR3JpZCBPcHRpb25zIHB1bGxlZCB0aHJvdWdoIHRoZSBHcmlkIE9iamVjdCAqL1xyXG4gIGdldCBncmlkT3B0aW9ucygpOiBHcmlkT3B0aW9uIHtcclxuICAgIHJldHVybiAodGhpcy5fZ3JpZD8uZ2V0T3B0aW9ucygpIHx8IHt9KSBhcyBHcmlkT3B0aW9uO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHJvd0RldGFpbFZpZXdPcHRpb25zKCk6IFJvd0RldGFpbFZpZXcgfCB1bmRlZmluZWQge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93RGV0YWlsVmlldztcclxuICB9XHJcblxyXG4gIGFkZFJ4SnNSZXNvdXJjZShyeGpzOiBSeEpzRmFjYWRlKSB7XHJcbiAgICB0aGlzLnJ4anMgPSByeGpzO1xyXG4gIH1cclxuXHJcbiAgLyoqIERpc3Bvc2Ugb2YgdGhlIFJvd0RldGFpbFZpZXcgRXh0ZW5zaW9uICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZUFsbFZpZXdDb21wb25lbnRzKCk7XHJcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gdW5zdWJzY3JpYmVBbGwodGhpcy5fc3Vic2NyaXB0aW9ucyk7IC8vIGFsc28gdW5zdWJzY3JpYmUgYWxsIFJ4SlMgc3Vic2NyaXB0aW9uc1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIERpc3Bvc2Ugb2YgYWxsIHRoZSBvcGVuZWQgUm93IERldGFpbCBQYW5lbHMgQW5ndWxhciBWaWV3IENvbXBvbmVudHMgKi9cclxuICBkaXNwb3NlQWxsVmlld0NvbXBvbmVudHMoKSB7XHJcbiAgICB0aGlzLl92aWV3cy5mb3JFYWNoKChjb21wUmVmKSA9PiB0aGlzLmRpc3Bvc2VWaWV3Q29tcG9uZW50KGNvbXBSZWYpKTtcclxuICAgIHRoaXMuX3ZpZXdzID0gW107XHJcbiAgfVxyXG5cclxuICAvKiogR2V0IHRoZSBpbnN0YW5jZSBvZiB0aGUgU2xpY2tHcmlkIGFkZG9uIChjb250cm9sIG9yIHBsdWdpbikuICovXHJcbiAgZ2V0QWRkb25JbnN0YW5jZSgpOiBTbGlja1Jvd0RldGFpbFZpZXcgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgaW5pdChncmlkOiBTbGlja0dyaWQpIHtcclxuICAgIHRoaXMuX2dyaWQgPSBncmlkO1xyXG4gICAgc3VwZXIuaW5pdCh0aGlzLl9ncmlkKTtcclxuICAgIHRoaXMucmVnaXN0ZXIoZ3JpZD8uZ2V0U2VsZWN0aW9uTW9kZWwoKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgdGhlIHBsdWdpbiBiZWZvcmUgdGhlIEdyaWQgY3JlYXRpb24sIGVsc2UgaXQgd2lsbCBiZWhhdmUgb2RkbHkuXHJcbiAgICogTW9zdGx5IGJlY2F1c2UgdGhlIGNvbHVtbiBkZWZpbml0aW9ucyBtaWdodCBjaGFuZ2UgYWZ0ZXIgdGhlIGdyaWQgY3JlYXRpb25cclxuICAgKi9cclxuICByZWdpc3Rlcihyb3dTZWxlY3Rpb25QbHVnaW4/OiBTbGlja1Jvd1NlbGVjdGlvbk1vZGVsKSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnMucm93RGV0YWlsVmlldz8ucHJvY2VzcyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAvLyB3ZSBuZWVkIHRvIGtlZXAgdGhlIHVzZXIgXCJwcm9jZXNzXCIgbWV0aG9kIGFuZCByZXBsYWNlIGl0IHdpdGggb3VyIG93biBleGVjdXRpb24gbWV0aG9kXHJcbiAgICAgIC8vIHdlIGRvIHRoaXMgYmVjYXVzZSB3aGVuIHdlIGdldCB0aGUgaXRlbSBkZXRhaWwsIHdlIG5lZWQgdG8gY2FsbCBcIm9uQXN5bmNSZXNwb25zZS5ub3RpZnlcIiBmb3IgdGhlIHBsdWdpbiB0byB3b3JrXHJcbiAgICAgIHRoaXMuX3VzZXJQcm9jZXNzRm4gPSB0aGlzLmdyaWRPcHRpb25zLnJvd0RldGFpbFZpZXcucHJvY2VzcyBhcyAoaXRlbTogYW55KSA9PiBQcm9taXNlPGFueT47ICAgICAgICAgICAgICAgIC8vIGtlZXAgdXNlcidzIHByb2Nlc3MgbWV0aG9kXHJcbiAgICAgIHRoaXMuZ3JpZE9wdGlvbnMucm93RGV0YWlsVmlldy5wcm9jZXNzID0gKGl0ZW0pID0+IHRoaXMub25Qcm9jZXNzaW5nKGl0ZW0pOyAgLy8gcmVwbGFjZSBwcm9jZXNzIG1ldGhvZCAmIHJ1biBvdXIgaW50ZXJuYWwgb25lXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tBbmd1bGFyLVNsaWNrZ3JpZF0gWW91IG5lZWQgdG8gcHJvdmlkZSBhIFwicHJvY2Vzc1wiIGZ1bmN0aW9uIGZvciB0aGUgUm93IERldGFpbCBFeHRlbnNpb24gdG8gd29yayBwcm9wZXJseScpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLl9ncmlkICYmIHRoaXMuZ3JpZE9wdGlvbnM/LnJvd0RldGFpbFZpZXcpIHtcclxuICAgICAgLy8gbG9hZCB0aGUgUHJlbG9hZCAmIFJvd0RldGFpbCBUZW1wbGF0ZXMgKGNvdWxkIGJlIHN0cmFpZ2h0IEhUTUwgb3IgQW5ndWxhciBWaWV3L1ZpZXdNb2RlbClcclxuICAgICAgLy8gd2hlbiB0aG9zZSBhcmUgQW5ndWxhciBWaWV3L1ZpZXdNb2RlbCwgd2UgbmVlZCB0byBjcmVhdGUgVmlldyBDb21wb25lbnQgJiBwcm92aWRlIHRoZSBodG1sIGNvbnRhaW5lcnMgdG8gdGhlIFBsdWdpbiAocHJlVGVtcGxhdGUvcG9zdFRlbXBsYXRlIG1ldGhvZHMpXHJcbiAgICAgIGlmICghdGhpcy5ncmlkT3B0aW9ucy5yb3dEZXRhaWxWaWV3LnByZVRlbXBsYXRlKSB7XHJcbiAgICAgICAgdGhpcy5fcHJlbG9hZENvbXBvbmVudCA9IHRoaXMuZ3JpZE9wdGlvbnM/LnJvd0RldGFpbFZpZXc/LnByZWxvYWRDb21wb25lbnQ7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5yb3dEZXRhaWxWaWV3LnByZVRlbXBsYXRlID0gKCkgPT4gRE9NUHVyaWZ5LnNhbml0aXplKGA8ZGl2IGNsYXNzPVwiJHtQUkVMT0FEX0NPTlRBSU5FUl9QUkVGSVh9XCI+PC9kaXY+YCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zLnJvd0RldGFpbFZpZXcucG9zdFRlbXBsYXRlKSB7XHJcbiAgICAgICAgdGhpcy5fdmlld0NvbXBvbmVudCA9IHRoaXMuZ3JpZE9wdGlvbnM/LnJvd0RldGFpbFZpZXc/LnZpZXdDb21wb25lbnQ7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5yb3dEZXRhaWxWaWV3LnBvc3RUZW1wbGF0ZSA9IChpdGVtRGV0YWlsOiBhbnkpID0+IERPTVB1cmlmeS5zYW5pdGl6ZShgPGRpdiBjbGFzcz1cIiR7Uk9XX0RFVEFJTF9DT05UQUlORVJfUFJFRklYfSR7aXRlbURldGFpbFt0aGlzLmRhdGFzZXRJZFByb3BOYW1lXX1cIj48L2Rpdj5gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdGhpcyBhbHNvIHJlcXVpcmVzIHRoZSBSb3cgU2VsZWN0aW9uIE1vZGVsIHRvIGJlIHJlZ2lzdGVyZWQgYXMgd2VsbFxyXG4gICAgICBpZiAoIXJvd1NlbGVjdGlvblBsdWdpbiB8fCAhdGhpcy5fZ3JpZC5nZXRTZWxlY3Rpb25Nb2RlbCgpKSB7XHJcbiAgICAgICAgcm93U2VsZWN0aW9uUGx1Z2luID0gbmV3IFNsaWNrUm93U2VsZWN0aW9uTW9kZWwodGhpcy5ncmlkT3B0aW9ucy5yb3dTZWxlY3Rpb25PcHRpb25zIHx8IHsgc2VsZWN0QWN0aXZlUm93OiB0cnVlIH0pO1xyXG4gICAgICAgIHRoaXMuX2dyaWQuc2V0U2VsZWN0aW9uTW9kZWwocm93U2VsZWN0aW9uUGx1Z2luKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaG9vayBhbGwgZXZlbnRzXHJcbiAgICAgIGlmICh0aGlzLl9ncmlkICYmIHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMpIHtcclxuICAgICAgICBpZiAodGhpcy5yb3dEZXRhaWxWaWV3T3B0aW9ucy5vbkV4dGVuc2lvblJlZ2lzdGVyZWQpIHtcclxuICAgICAgICAgIHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMub25FeHRlbnNpb25SZWdpc3RlcmVkKHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMub25Bc3luY1Jlc3BvbnNlKSB7XHJcbiAgICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXIuc3Vic2NyaWJlKHRoaXMub25Bc3luY1Jlc3BvbnNlLCAoZXZlbnQsIGFyZ3MpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMgJiYgdHlwZW9mIHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMub25Bc3luY1Jlc3BvbnNlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5yb3dEZXRhaWxWaWV3T3B0aW9ucy5vbkFzeW5jUmVzcG9uc2UoZXZlbnQsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9uQXN5bmNFbmRVcGRhdGUpIHtcclxuICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlci5zdWJzY3JpYmUodGhpcy5vbkFzeW5jRW5kVXBkYXRlLCAoZTogYW55LCBhcmdzOiB7IGdyaWQ6IFNsaWNrR3JpZDsgaXRlbTogYW55OyB9KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIHRyaWdnZXJzIGFmdGVyIGJhY2tlbmQgY2FsbGVkIFwib25Bc3luY1Jlc3BvbnNlLm5vdGlmeSgpXCJcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJWaWV3TW9kZWwoYXJncz8uaXRlbSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5yb3dEZXRhaWxWaWV3T3B0aW9ucyAmJiB0eXBlb2YgdGhpcy5yb3dEZXRhaWxWaWV3T3B0aW9ucy5vbkFzeW5jRW5kVXBkYXRlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5yb3dEZXRhaWxWaWV3T3B0aW9ucy5vbkFzeW5jRW5kVXBkYXRlKGUsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9uQWZ0ZXJSb3dEZXRhaWxUb2dnbGUpIHtcclxuICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlci5zdWJzY3JpYmUodGhpcy5vbkFmdGVyUm93RGV0YWlsVG9nZ2xlLCAoZTogYW55LCBhcmdzOiB7IGdyaWQ6IFNsaWNrR3JpZDsgaXRlbTogYW55OyBleHBhbmRlZFJvd3M6IG51bWJlcltdOyB9KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGRpc3BsYXkgcHJlbG9hZCB0ZW1wbGF0ZSAmIHJlLXJlbmRlciBhbGwgdGhlIG90aGVyIERldGFpbCBWaWV3cyBhZnRlciB0b2dnbGluZ1xyXG4gICAgICAgICAgICAvLyB0aGUgcHJlbG9hZCBWaWV3IHdpbGwgZXZlbnR1YWxseSBnbyBhd2F5IG9uY2UgdGhlIGRhdGEgZ2V0cyBsb2FkZWQgYWZ0ZXIgdGhlIFwib25Bc3luY0VuZFVwZGF0ZVwiIGV2ZW50XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyUHJlbG9hZFZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJBbGxWaWV3Q29tcG9uZW50cygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMgJiYgdHlwZW9mIHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMub25BZnRlclJvd0RldGFpbFRvZ2dsZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgIHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMub25BZnRlclJvd0RldGFpbFRvZ2dsZShlLCBhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5vbkJlZm9yZVJvd0RldGFpbFRvZ2dsZSkge1xyXG4gICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyLnN1YnNjcmliZSh0aGlzLm9uQmVmb3JlUm93RGV0YWlsVG9nZ2xlLCAoZSwgYXJncykgPT4ge1xyXG4gICAgICAgICAgICAvLyBiZWZvcmUgdG9nZ2xpbmcgcm93IGRldGFpbCwgd2UgbmVlZCB0byBjcmVhdGUgVmlldyBDb21wb25lbnQgaWYgaXQgZG9lc24ndCBleGlzdFxyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZU9uQmVmb3JlUm93RGV0YWlsVG9nZ2xlKGUsIGFyZ3MpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMgJiYgdHlwZW9mIHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMub25CZWZvcmVSb3dEZXRhaWxUb2dnbGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICB0aGlzLnJvd0RldGFpbFZpZXdPcHRpb25zLm9uQmVmb3JlUm93RGV0YWlsVG9nZ2xlKGUsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9uUm93QmFja1RvVmlld3BvcnRSYW5nZSkge1xyXG4gICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyLnN1YnNjcmliZSh0aGlzLm9uUm93QmFja1RvVmlld3BvcnRSYW5nZSwgKGU6IGFueSwgYXJnczogeyBncmlkOiBTbGlja0dyaWQ7IGl0ZW06IGFueTsgcm93SWQ6IG51bWJlcjsgcm93SW5kZXg6IG51bWJlcjsgZXhwYW5kZWRSb3dzOiBhbnlbXTsgcm93SWRzT3V0T2ZWaWV3cG9ydDogbnVtYmVyW107IH0pID0+IHtcclxuICAgICAgICAgICAgLy8gd2hlbiByb3cgaXMgYmFjayB0byB2aWV3cG9ydCByYW5nZSwgd2Ugd2lsbCByZS1yZW5kZXIgdGhlIFZpZXcgQ29tcG9uZW50KHMpXHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlT25Sb3dCYWNrVG9WaWV3cG9ydFJhbmdlKGUsIGFyZ3MpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMgJiYgdHlwZW9mIHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMub25Sb3dCYWNrVG9WaWV3cG9ydFJhbmdlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5yb3dEZXRhaWxWaWV3T3B0aW9ucy5vblJvd0JhY2tUb1ZpZXdwb3J0UmFuZ2UoZSwgYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMub25Sb3dPdXRPZlZpZXdwb3J0UmFuZ2UpIHtcclxuICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlci5zdWJzY3JpYmUodGhpcy5vblJvd091dE9mVmlld3BvcnRSYW5nZSwgKGU6IGFueSwgYXJnczogeyBncmlkOiBTbGlja0dyaWQ7IGl0ZW06IGFueTsgcm93SWQ6IG51bWJlcjsgcm93SW5kZXg6IG51bWJlcjsgZXhwYW5kZWRSb3dzOiBhbnlbXTsgcm93SWRzT3V0T2ZWaWV3cG9ydDogbnVtYmVyW107IH0pID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMgJiYgdHlwZW9mIHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMub25Sb3dPdXRPZlZpZXdwb3J0UmFuZ2UgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICB0aGlzLnJvd0RldGFpbFZpZXdPcHRpb25zLm9uUm93T3V0T2ZWaWV3cG9ydFJhbmdlKGUsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIC0tXHJcbiAgICAgICAgLy8gaG9vayBzb21lIGV2ZW50cyBuZWVkZWQgYnkgdGhlIFBsdWdpbiBpdHNlbGZcclxuXHJcbiAgICAgICAgLy8gd2UgbmVlZCB0byByZWRyYXcgdGhlIG9wZW4gZGV0YWlsIHZpZXdzIGlmIHdlIGNoYW5nZSBjb2x1bW4gcG9zaXRpb24gKGNvbHVtbiByZW9yZGVyKVxyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlci5zdWJzY3JpYmUodGhpcy5fZ3JpZC5vbkNvbHVtbnNSZW9yZGVyZWQsIHRoaXMucmVkcmF3QWxsVmlld0NvbXBvbmVudHMuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIC8vIG9uIHJvdyBzZWxlY3Rpb24gY2hhbmdlZCwgd2UgYWxzbyBuZWVkIHRvIHJlZHJhd1xyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmVuYWJsZVJvd1NlbGVjdGlvbiB8fCB0aGlzLmdyaWRPcHRpb25zLmVuYWJsZUNoZWNrYm94U2VsZWN0b3IpIHtcclxuICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlci5zdWJzY3JpYmUodGhpcy5fZ3JpZC5vblNlbGVjdGVkUm93c0NoYW5nZWQsIHRoaXMucmVkcmF3QWxsVmlld0NvbXBvbmVudHMuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbiBzb3J0LCBhbGwgcm93IGRldGFpbCBhcmUgY29sbGFwc2VkIHNvIHdlIGNhbiBkaXNwb3NlIG9mIGFsbCB0aGUgVmlld3MgYXMgd2VsbFxyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlci5zdWJzY3JpYmUodGhpcy5fZ3JpZC5vblNvcnQsIHRoaXMuZGlzcG9zZUFsbFZpZXdDb21wb25lbnRzLmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAvLyBvbiBmaWx0ZXIgY2hhbmdlZCwgd2UgbmVlZCB0byByZS1yZW5kZXIgYWxsIFZpZXdzXHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICAgICAgdGhpcy5ldmVudFB1YlN1YlNlcnZpY2U/LnN1YnNjcmliZSgnb25GaWx0ZXJDaGFuZ2VkJywgdGhpcy5yZWRyYXdBbGxWaWV3Q29tcG9uZW50cy5iaW5kKHRoaXMpKSxcclxuICAgICAgICAgIHRoaXMuZXZlbnRQdWJTdWJTZXJ2aWNlPy5zdWJzY3JpYmUoJ29uR3JpZE1lbnVDbGVhckFsbEZpbHRlcnMnLCAoKSA9PiBzZXRUaW1lb3V0KCgpID0+IHRoaXMucmVkcmF3QWxsVmlld0NvbXBvbmVudHMoKSkpLFxyXG4gICAgICAgICAgdGhpcy5ldmVudFB1YlN1YlNlcnZpY2U/LnN1YnNjcmliZSgnb25HcmlkTWVudUNsZWFyQWxsU29ydGluZycsICgpID0+IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5yZWRyYXdBbGxWaWV3Q29tcG9uZW50cygpKSksXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKiogUmVkcmF3IChyZS1yZW5kZXIpIGFsbCB0aGUgZXhwYW5kZWQgcm93IGRldGFpbCBWaWV3IENvbXBvbmVudHMgKi9cclxuICByZWRyYXdBbGxWaWV3Q29tcG9uZW50cygpIHtcclxuICAgIHRoaXMuX3ZpZXdzLmZvckVhY2goKGNvbXBSZWYpID0+IHtcclxuICAgICAgdGhpcy5yZWRyYXdWaWV3Q29tcG9uZW50KGNvbXBSZWYpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKiogUmVuZGVyIGFsbCB0aGUgZXhwYW5kZWQgcm93IGRldGFpbCBWaWV3IENvbXBvbmVudHMgKi9cclxuICByZW5kZXJBbGxWaWV3Q29tcG9uZW50cygpIHtcclxuICAgIHRoaXMuX3ZpZXdzLmZvckVhY2goKHZpZXcpID0+IHtcclxuICAgICAgaWYgKHZpZXcgJiYgdmlldy5kYXRhQ29udGV4dCkge1xyXG4gICAgICAgIHRoaXMucmVuZGVyVmlld01vZGVsKHZpZXcuZGF0YUNvbnRleHQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKiBSZWRyYXcgdGhlIG5lY2Vzc2FyeSBWaWV3IENvbXBvbmVudCAqL1xyXG4gIHJlZHJhd1ZpZXdDb21wb25lbnQoY3JlYXRlZFZpZXc6IENyZWF0ZWRWaWV3KSB7XHJcbiAgICBjb25zdCBjb250YWluZXJFbGVtZW50cyA9IHRoaXMuZ3JpZENvbnRhaW5lckVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShgJHtST1dfREVUQUlMX0NPTlRBSU5FUl9QUkVGSVh9JHtjcmVhdGVkVmlldy5pZH1gKTtcclxuICAgIGlmIChjb250YWluZXJFbGVtZW50cyAmJiBjb250YWluZXJFbGVtZW50cy5sZW5ndGggPj0gMCkge1xyXG4gICAgICB0aGlzLnJlbmRlclZpZXdNb2RlbChjcmVhdGVkVmlldy5kYXRhQ29udGV4dCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUmVuZGVyIChvciByZS1yZW5kZXIpIHRoZSBWaWV3IENvbXBvbmVudCAoUm93IERldGFpbCkgKi9cclxuICByZW5kZXJQcmVsb2FkVmlldygpIHtcclxuICAgIGNvbnN0IGNvbnRhaW5lckVsZW1lbnRzID0gdGhpcy5ncmlkQ29udGFpbmVyRWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGAke1BSRUxPQURfQ09OVEFJTkVSX1BSRUZJWH1gKTtcclxuICAgIGlmIChjb250YWluZXJFbGVtZW50cyAmJiBjb250YWluZXJFbGVtZW50cy5sZW5ndGggPj0gMCkge1xyXG4gICAgICB0aGlzLmFuZ3VsYXJVdGlsU2VydmljZS5jcmVhdGVBbmd1bGFyQ29tcG9uZW50QXBwZW5kVG9Eb20odGhpcy5fcHJlbG9hZENvbXBvbmVudCwgY29udGFpbmVyRWxlbWVudHNbY29udGFpbmVyRWxlbWVudHMubGVuZ3RoIC0gMV0sIHRydWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFJlbmRlciAob3IgcmUtcmVuZGVyKSB0aGUgVmlldyBDb21wb25lbnQgKFJvdyBEZXRhaWwpICovXHJcbiAgcmVuZGVyVmlld01vZGVsKGl0ZW06IGFueSk6IENyZWF0ZWRWaWV3IHwgdW5kZWZpbmVkIHtcclxuICAgIGNvbnN0IGNvbnRhaW5lckVsZW1lbnRzID0gdGhpcy5ncmlkQ29udGFpbmVyRWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGAke1JPV19ERVRBSUxfQ09OVEFJTkVSX1BSRUZJWH0ke2l0ZW1bdGhpcy5kYXRhc2V0SWRQcm9wTmFtZV19YCk7XHJcbiAgICBpZiAoY29udGFpbmVyRWxlbWVudHMgJiYgY29udGFpbmVyRWxlbWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBjb21wb25lbnRPdXRwdXQgPSB0aGlzLmFuZ3VsYXJVdGlsU2VydmljZS5jcmVhdGVBbmd1bGFyQ29tcG9uZW50QXBwZW5kVG9Eb20odGhpcy5fdmlld0NvbXBvbmVudCwgY29udGFpbmVyRWxlbWVudHNbY29udGFpbmVyRWxlbWVudHMubGVuZ3RoIC0gMV0sIHRydWUpO1xyXG4gICAgICBpZiAoY29tcG9uZW50T3V0cHV0ICYmIGNvbXBvbmVudE91dHB1dC5jb21wb25lbnRSZWYgJiYgY29tcG9uZW50T3V0cHV0LmNvbXBvbmVudFJlZi5pbnN0YW5jZSkge1xyXG4gICAgICAgIC8vIHBhc3MgYSBmZXcgcHJvcGVydGllcyB0byB0aGUgUm93IERldGFpbCB0ZW1wbGF0ZSBjb21wb25lbnRcclxuICAgICAgICBPYmplY3QuYXNzaWduKGNvbXBvbmVudE91dHB1dC5jb21wb25lbnRSZWYuaW5zdGFuY2UsIHtcclxuICAgICAgICAgIG1vZGVsOiBpdGVtLFxyXG4gICAgICAgICAgYWRkb246IHRoaXMsXHJcbiAgICAgICAgICBncmlkOiB0aGlzLl9ncmlkLFxyXG4gICAgICAgICAgZGF0YVZpZXc6IHRoaXMuZGF0YVZpZXcsXHJcbiAgICAgICAgICBwYXJlbnQ6IHRoaXMucm93RGV0YWlsVmlld09wdGlvbnMgJiYgdGhpcy5yb3dEZXRhaWxWaWV3T3B0aW9ucy5wYXJlbnQsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdPYmogPSB0aGlzLl92aWV3cy5maW5kKG9iaiA9PiBvYmouaWQgPT09IGl0ZW1bdGhpcy5kYXRhc2V0SWRQcm9wTmFtZV0pO1xyXG4gICAgICAgIGlmICh2aWV3T2JqKSB7XHJcbiAgICAgICAgICB2aWV3T2JqLmNvbXBvbmVudFJlZiA9IGNvbXBvbmVudE91dHB1dC5jb21wb25lbnRSZWY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2aWV3T2JqO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgLy8gLS1cclxuICAvLyBwcm90ZWN0ZWQgZnVuY3Rpb25zXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIHByb3RlY3RlZCBkaXNwb3NlVmlld0NvbXBvbmVudChleHBhbmRlZFZpZXc6IENyZWF0ZWRWaWV3KTogQ3JlYXRlZFZpZXcgfCB2b2lkIHtcclxuICAgIGNvbnN0IGNvbXBSZWYgPSBleHBhbmRlZFZpZXc/LmNvbXBvbmVudFJlZjtcclxuICAgIGlmIChjb21wUmVmKSB7XHJcbiAgICAgIHRoaXMuYXBwUmVmLmRldGFjaFZpZXcoY29tcFJlZi5ob3N0Vmlldyk7XHJcbiAgICAgIGlmIChjb21wUmVmPy5kZXN0cm95KSB7XHJcbiAgICAgICAgY29tcFJlZi5kZXN0cm95KCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGV4cGFuZGVkVmlldztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG5vdGlmeSB0aGUgb25Bc3luY1Jlc3BvbnNlIHdpdGggdGhlIFwiYXJncy5pdGVtXCIgKHJlcXVpcmVkIHByb3BlcnR5KVxyXG4gICAqIHRoZSBwbHVnaW4gd2lsbCB0aGVuIHVzZSBpdGVtIHRvIHBvcHVsYXRlIHRoZSByb3cgZGV0YWlsIHBhbmVsIHdpdGggdGhlIFwicG9zdFRlbXBsYXRlXCJcclxuICAgKiBAcGFyYW0gaXRlbVxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBub3RpZnlUZW1wbGF0ZShpdGVtOiBhbnkpIHtcclxuICAgIGlmICh0aGlzLm9uQXN5bmNSZXNwb25zZSkge1xyXG4gICAgICB0aGlzLm9uQXN5bmNSZXNwb25zZS5ub3RpZnkoeyBpdGVtIH0sIHVuZGVmaW5lZCwgdGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPbiBQcm9jZXNzaW5nLCB3ZSB3aWxsIG5vdGlmeSB0aGUgcGx1Z2luIHdpdGggdGhlIG5ldyBpdGVtIGRldGFpbCBvbmNlIGJhY2tlbmQgc2VydmVyIGNhbGwgY29tcGxldGVzXHJcbiAgICogQHBhcmFtIGl0ZW1cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgYXN5bmMgb25Qcm9jZXNzaW5nKGl0ZW06IGFueSkge1xyXG4gICAgaWYgKGl0ZW0gJiYgdHlwZW9mIHRoaXMuX3VzZXJQcm9jZXNzRm4gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgbGV0IGF3YWl0ZWRJdGVtRGV0YWlsOiBhbnk7XHJcbiAgICAgIGNvbnN0IHVzZXJQcm9jZXNzRm4gPSB0aGlzLl91c2VyUHJvY2Vzc0ZuKGl0ZW0pO1xyXG5cclxuICAgICAgLy8gd2FpdCBmb3IgdGhlIFwidXNlclByb2Nlc3NGblwiLCBvbmNlIHJlc29sdmVkIHdlIHdpbGwgc2F2ZSBpdCBpbnRvIHRoZSBcImNvbGxlY3Rpb25cIlxyXG4gICAgICBjb25zdCByZXNwb25zZTogYW55IHwgYW55W10gPSBhd2FpdCB1c2VyUHJvY2Vzc0ZuO1xyXG5cclxuICAgICAgaWYgKHJlc3BvbnNlLmhhc093blByb3BlcnR5KHRoaXMuZGF0YXNldElkUHJvcE5hbWUpKSB7XHJcbiAgICAgICAgYXdhaXRlZEl0ZW1EZXRhaWwgPSByZXNwb25zZTsgLy8gZnJvbSBQcm9taXNlXHJcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UgaW5zdGFuY2VvZiBPYnNlcnZhYmxlIHx8IHJlc3BvbnNlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgIGF3YWl0ZWRJdGVtRGV0YWlsID0gYXdhaXQgY2FzdE9ic2VydmFibGVUb1Byb21pc2UodGhpcy5yeGpzIGFzIFJ4SnNGYWNhZGUsIHJlc3BvbnNlKTsgLy8gZnJvbSBBbmd1bGFyLWh0dHAtY2xpZW50XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghYXdhaXRlZEl0ZW1EZXRhaWwgfHwgIWF3YWl0ZWRJdGVtRGV0YWlsLmhhc093blByb3BlcnR5KHRoaXMuZGF0YXNldElkUHJvcE5hbWUpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbQW5ndWxhci1TbGlja2dyaWRdIGNvdWxkIG5vdCBwcm9jZXNzIHRoZSBSb3cgRGV0YWlsLCB5b3UgbXVzdCBtYWtlIHN1cmUgdGhhdCB5b3VyIFwicHJvY2Vzc1wiIGNhbGxiYWNrXHJcbiAgICAgICAgICAoYSBQcm9taXNlIG9yIGFuIEh0dHBDbGllbnQgY2FsbCByZXR1cm5pbmcgYW4gT2JzZXJ2YWJsZSkgcmV0dXJucyBhbiBpdGVtIG9iamVjdCB0aGF0IGhhcyBhbiBcIiR7dGhpcy5kYXRhc2V0SWRQcm9wTmFtZX1cIiBwcm9wZXJ0eWApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBub3RpZnkgdGhlIHBsdWdpbiB3aXRoIHRoZSBuZXcgaXRlbSBkZXRhaWxzXHJcbiAgICAgIHRoaXMubm90aWZ5VGVtcGxhdGUoYXdhaXRlZEl0ZW1EZXRhaWwgfHwge30pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSnVzdCBiZWZvcmUgdGhlIHJvdyBnZXQgZXhwYW5kZWQgb3IgY29sbGFwc2VkIHdlIHdpbGwgZG8gdGhlIGZvbGxvd2luZ1xyXG4gICAqIEZpcnN0IGRldGVybWluZSBpZiB0aGUgcm93IGlzIGV4cGFuZGluZyBvciBjb2xsYXBzaW5nLFxyXG4gICAqIGlmIGl0J3MgZXhwYW5kaW5nIHdlIHdpbGwgYWRkIGl0IHRvIG91ciBWaWV3IENvbXBvbmVudHMgcmVmZXJlbmNlIGFycmF5IGlmIHdlIGRvbid0IGFscmVhZHkgaGF2ZSBpdFxyXG4gICAqIG9yIGlmIGl0J3MgY29sbGFwc2luZyB3ZSB3aWxsIHJlbW92ZSBpdCBmcm9tIG91ciBWaWV3IENvbXBvbmVudHMgcmVmZXJlbmNlIGFycmF5XHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGhhbmRsZU9uQmVmb3JlUm93RGV0YWlsVG9nZ2xlKGU6IEV2ZW50LCBhcmdzOiB7IGdyaWQ6IFNsaWNrR3JpZDsgaXRlbTogYW55OyB9KSB7XHJcbiAgICAvLyBleHBhbmRpbmdcclxuICAgIGlmIChhcmdzICYmIGFyZ3MuaXRlbSAmJiBhcmdzLml0ZW0uX19jb2xsYXBzZWQpIHtcclxuICAgICAgLy8gZXhwYW5kaW5nIHJvdyBkZXRhaWxcclxuICAgICAgY29uc3Qgdmlld0luZm86IENyZWF0ZWRWaWV3ID0ge1xyXG4gICAgICAgIGlkOiBhcmdzLml0ZW1bdGhpcy5kYXRhc2V0SWRQcm9wTmFtZV0sXHJcbiAgICAgICAgZGF0YUNvbnRleHQ6IGFyZ3MuaXRlbVxyXG4gICAgICB9O1xyXG4gICAgICBjb25zdCBpZFByb3BOYW1lID0gdGhpcy5ncmlkT3B0aW9ucy5kYXRhc2V0SWRQcm9wZXJ0eU5hbWUgfHwgJ2lkJztcclxuICAgICAgYWRkVG9BcnJheVdoZW5Ob3RFeGlzdHModGhpcy5fdmlld3MsIHZpZXdJbmZvLCBpZFByb3BOYW1lKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIGNvbGxhcHNpbmcsIHNvIGRpc3Bvc2Ugb2YgdGhlIFZpZXcvQ29tcG9uZW50XHJcbiAgICAgIGNvbnN0IGZvdW5kVmlld0luZGV4ID0gdGhpcy5fdmlld3MuZmluZEluZGV4KCh2aWV3OiBDcmVhdGVkVmlldykgPT4gdmlldy5pZCA9PT0gYXJncy5pdGVtW3RoaXMuZGF0YXNldElkUHJvcE5hbWVdKTtcclxuICAgICAgaWYgKGZvdW5kVmlld0luZGV4ID49IDAgJiYgdGhpcy5fdmlld3MuaGFzT3duUHJvcGVydHkoZm91bmRWaWV3SW5kZXgpKSB7XHJcbiAgICAgICAgY29uc3QgY29tcFJlZiA9IHRoaXMuX3ZpZXdzW2ZvdW5kVmlld0luZGV4XS5jb21wb25lbnRSZWY7XHJcbiAgICAgICAgaWYgKGNvbXBSZWYpIHtcclxuICAgICAgICAgIHRoaXMuYXBwUmVmLmRldGFjaFZpZXcoY29tcFJlZi5ob3N0Vmlldyk7XHJcbiAgICAgICAgICBjb21wUmVmLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdmlld3Muc3BsaWNlKGZvdW5kVmlld0luZGV4LCAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFdoZW4gUm93IGNvbWVzIGJhY2sgdG8gVmlld3BvcnQgUmFuZ2UsIHdlIG5lZWQgdG8gcmVkcmF3IHRoZSBWaWV3ICovXHJcbiAgcHJvdGVjdGVkIGhhbmRsZU9uUm93QmFja1RvVmlld3BvcnRSYW5nZShlOiBFdmVudCwgYXJnczogeyBncmlkOiBTbGlja0dyaWQ7IGl0ZW06IGFueTsgcm93SWQ6IG51bWJlcjsgcm93SW5kZXg6IG51bWJlcjsgZXhwYW5kZWRSb3dzOiBhbnlbXTsgcm93SWRzT3V0T2ZWaWV3cG9ydDogbnVtYmVyW107IH0pIHtcclxuICAgIGlmIChhcmdzPy5pdGVtKSB7XHJcbiAgICAgIHRoaXMucmVkcmF3QWxsVmlld0NvbXBvbmVudHMoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19