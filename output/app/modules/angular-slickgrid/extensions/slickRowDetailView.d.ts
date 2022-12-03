import { ApplicationRef, ComponentRef, Type, ViewContainerRef } from '@angular/core';
import { EventSubscription, RxJsFacade, SlickEventHandler, SlickGrid, SlickRowSelectionModel } from '@slickgrid-universal/common';
import { EventPubSubService } from '@slickgrid-universal/event-pub-sub';
import { SlickRowDetailView as UniversalSlickRowDetailView } from '@slickgrid-universal/row-detail-view-plugin';
import { Observable, Subject } from 'rxjs';
import { GridOption, RowDetailView } from '../models/index';
import { AngularUtilService } from '../services/angularUtil.service';
export interface CreatedView {
    id: string | number;
    dataContext: any;
    componentRef?: ComponentRef<any>;
}
export declare class SlickRowDetailView extends UniversalSlickRowDetailView {
    protected readonly angularUtilService: AngularUtilService;
    protected readonly appRef: ApplicationRef;
    protected readonly eventPubSubService: EventPubSubService;
    protected readonly gridContainerElement: HTMLDivElement;
    protected rxjs?: RxJsFacade;
    rowDetailContainer: ViewContainerRef;
    protected _eventHandler: SlickEventHandler;
    protected _preloadComponent: Type<object> | undefined;
    protected _views: CreatedView[];
    protected _viewComponent: Type<object>;
    protected _subscriptions: EventSubscription[];
    protected _userProcessFn: (item: any) => Promise<any> | Observable<any> | Subject<any>;
    constructor(angularUtilService: AngularUtilService, appRef: ApplicationRef, eventPubSubService: EventPubSubService, gridContainerElement: HTMLDivElement, rxjs?: RxJsFacade);
    get addonOptions(): import("@slickgrid-universal/common").RowDetailViewOption;
    protected get datasetIdPropName(): string;
    get eventHandler(): SlickEventHandler;
    set eventHandler(eventHandler: SlickEventHandler);
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    get rowDetailViewOptions(): RowDetailView | undefined;
    addRxJsResource(rxjs: RxJsFacade): void;
    /** Dispose of the RowDetailView Extension */
    dispose(): void;
    /** Dispose of all the opened Row Detail Panels Angular View Components */
    disposeAllViewComponents(): void;
    /** Get the instance of the SlickGrid addon (control or plugin). */
    getAddonInstance(): SlickRowDetailView | null;
    init(grid: SlickGrid): void;
    /**
     * Create the plugin before the Grid creation, else it will behave oddly.
     * Mostly because the column definitions might change after the grid creation
     */
    register(rowSelectionPlugin?: SlickRowSelectionModel): this;
    /** Redraw (re-render) all the expanded row detail View Components */
    redrawAllViewComponents(): void;
    /** Render all the expanded row detail View Components */
    renderAllViewComponents(): void;
    /** Redraw the necessary View Component */
    redrawViewComponent(createdView: CreatedView): void;
    /** Render (or re-render) the View Component (Row Detail) */
    renderPreloadView(): void;
    /** Render (or re-render) the View Component (Row Detail) */
    renderViewModel(item: any): CreatedView | undefined;
    protected disposeViewComponent(expandedView: CreatedView): CreatedView | void;
    /**
     * notify the onAsyncResponse with the "args.item" (required property)
     * the plugin will then use item to populate the row detail panel with the "postTemplate"
     * @param item
     */
    protected notifyTemplate(item: any): void;
    /**
     * On Processing, we will notify the plugin with the new item detail once backend server call completes
     * @param item
     */
    protected onProcessing(item: any): Promise<void>;
    /**
     * Just before the row get expanded or collapsed we will do the following
     * First determine if the row is expanding or collapsing,
     * if it's expanding we will add it to our View Components reference array if we don't already have it
     * or if it's collapsing we will remove it from our View Components reference array
     */
    protected handleOnBeforeRowDetailToggle(e: Event, args: {
        grid: SlickGrid;
        item: any;
    }): void;
    /** When Row comes back to Viewport Range, we need to redraw the View */
    protected handleOnRowBackToViewportRange(e: Event, args: {
        grid: SlickGrid;
        item: any;
        rowId: number;
        rowIndex: number;
        expandedRows: any[];
        rowIdsOutOfViewport: number[];
    }): void;
}
