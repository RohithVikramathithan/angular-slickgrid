import 'slickgrid/dist/slick.core.min';
import 'slickgrid/dist/slick.interactions.min';
import 'slickgrid/dist/slick.grid.min';
import 'slickgrid/dist/slick.dataview.min';
import { AfterViewInit, ApplicationRef, ChangeDetectorRef, ElementRef, EventEmitter, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BackendServiceApi, Column, EventSubscription, ExternalResource, Locale, Metrics, Pagination, ServicePagination, SlickDataView, SlickEventHandler, SlickGrid, BackendUtilityService, CollectionService, ExtensionService, ExtensionUtility, FilterFactory, FilterService, GridEventService, GridService, GridStateService, GroupingAndColspanService, PaginationService, ResizerService, RxJsFacade, SharedService, SlickGroupItemMetadataProvider, SortService, TreeDataService } from '@slickgrid-universal/common';
import { SlickEmptyWarningComponent } from '@slickgrid-universal/empty-warning-component';
import { SlickFooterComponent } from '@slickgrid-universal/custom-footer-component';
import { SlickPaginationComponent } from '@slickgrid-universal/pagination-component';
import { ExternalTestingDependencies, GridOption } from './../models/index';
import { TranslaterService } from '../services/translater.service';
import { AngularUtilService } from '../services/angularUtil.service';
import { SlickRowDetailView } from '../extensions/slickRowDetailView';
import { ContainerService } from '../services/container.service';
import * as i0 from "@angular/core";
export declare class AngularSlickgridComponent implements AfterViewInit, OnDestroy {
    private readonly angularUtilService;
    private readonly appRef;
    private readonly cd;
    private readonly containerService;
    private readonly elm;
    private readonly translate;
    private readonly translaterService;
    private forRootConfig;
    private _dataset?;
    private _columnDefinitions;
    private _currentDatasetLength;
    private _eventHandler;
    private _eventPubSubService;
    private _angularGridInstances;
    private _hideHeaderRowAfterPageLoad;
    private _isGridInitialized;
    private _isDatasetInitialized;
    private _isDatasetHierarchicalInitialized;
    private _isPaginationInitialized;
    private _isLocalGrid;
    private _paginationOptions;
    private _registeredResources;
    dataView: SlickDataView;
    slickGrid: SlickGrid;
    groupingDefinition: any;
    groupItemMetadataProvider?: SlickGroupItemMetadataProvider;
    backendServiceApi?: BackendServiceApi;
    locales: Locale;
    metrics?: Metrics;
    showPagination: boolean;
    serviceList: any[];
    totalItems: number;
    paginationData?: {
        gridOptions: GridOption;
        paginationService: PaginationService;
    };
    subscriptions: EventSubscription[];
    slickEmptyWarning?: SlickEmptyWarningComponent;
    slickFooter?: SlickFooterComponent;
    slickPagination?: SlickPaginationComponent;
    slickRowDetailView?: SlickRowDetailView;
    backendUtilityService: BackendUtilityService;
    collectionService: CollectionService;
    extensionService: ExtensionService;
    extensionUtility: ExtensionUtility;
    filterFactory: FilterFactory;
    filterService: FilterService;
    gridEventService: GridEventService;
    gridService: GridService;
    gridStateService: GridStateService;
    groupingService: GroupingAndColspanService;
    paginationService: PaginationService;
    resizerService: ResizerService;
    rxjs?: RxJsFacade;
    sharedService: SharedService;
    sortService: SortService;
    treeDataService: TreeDataService;
    customDataView: any;
    gridId: string;
    gridOptions: GridOption;
    get paginationOptions(): Pagination | undefined;
    set paginationOptions(newPaginationOptions: Pagination | undefined);
    set columnDefinitions(columnDefinitions: Column[]);
    get columnDefinitions(): Column[];
    columnDefinitionsChange: EventEmitter<any>;
    get dataset(): any[];
    set dataset(newDataset: any[]);
    get datasetHierarchical(): any[] | undefined;
    set datasetHierarchical(newHierarchicalDataset: any[] | undefined);
    get elementRef(): ElementRef;
    get eventHandler(): SlickEventHandler;
    get gridContainerElement(): HTMLElement | null;
    /** GETTER to know if dataset was initialized or not */
    get isDatasetInitialized(): boolean;
    /** SETTER to change if dataset was initialized or not (stringly used for unit testing purposes) */
    set isDatasetInitialized(isInitialized: boolean);
    set isDatasetHierarchicalInitialized(isInitialized: boolean);
    get registeredResources(): ExternalResource[];
    constructor(angularUtilService: AngularUtilService, appRef: ApplicationRef, cd: ChangeDetectorRef, containerService: ContainerService, elm: ElementRef, translate: TranslateService, translaterService: TranslaterService, forRootConfig: GridOption, externalServices: ExternalTestingDependencies);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    destroy(shouldEmptyDomElementContainer?: boolean): void;
    emptyGridContainerElm(): void;
    /**
     * Define our internal Post Process callback, it will execute internally after we get back result from the Process backend call
     * For now, this is GraphQL Service ONLY feature and it will basically refresh the Dataset & Pagination without having the user to create his own PostProcess every time
     */
    createBackendApiInternalPostProcessCallback(gridOptions: GridOption): void;
    initialization(eventHandler: SlickEventHandler): void;
    /**
     * On a Pagination changed, we will trigger a Grid State changed with the new pagination info
     * Also if we use Row Selection or the Checkbox Selector, we need to reset any selection
     */
    paginationChanged(pagination: ServicePagination): void;
    /**
     * When dataset changes, we need to refresh the entire grid UI & possibly resize it as well
     * @param dataset
     */
    refreshGridData(dataset: any[], totalCount?: number): void;
    /**
     * Check if there's any Pagination Presets defined in the Grid Options,
     * if there are then load them in the paginationOptions object
     */
    setPaginationOptionsWhenPresetDefined(gridOptions: GridOption, paginationOptions: Pagination): Pagination;
    /**
     * Dynamically change or update the column definitions list.
     * We will re-render the grid so that the new header and data shows up correctly.
     * If using i18n, we also need to trigger a re-translate of the column headers
     */
    updateColumnDefinitionsList(newColumnDefinitions: Column[]): void;
    /**
     * Show the filter row displayed on first row, we can optionally pass false to hide it.
     * @param showing
     */
    showHeaderRow(showing?: boolean): boolean;
    /**
     * Loop through all column definitions and copy the original optional `width` properties optionally provided by the user.
     * We will use this when doing a resize by cell content, if user provided a `width` it won't override it.
     */
    private copyColumnWidthsReference;
    private displayEmptyDataWarning;
    private bindDifferentHooks;
    private bindBackendCallbackFunctions;
    private bindResizeHook;
    private executeAfterDataviewCreated;
    /** When data changes in the DataView, we'll refresh the metrics and/or display a warning if the dataset is empty */
    private handleOnItemCountChanged;
    private initializePaginationService;
    /** Load the Editor Collection asynchronously and replace the "collection" property when Observable resolves */
    private loadEditorCollectionAsync;
    /** Load any possible Columns Grid Presets */
    private loadColumnPresetsWhenDatasetInitialized;
    /** Load any possible Filters Grid Presets */
    private loadFilterPresetsWhenDatasetInitialized;
    /**
     * local grid, check if we need to show the Pagination
     * if so then also check if there's any presets and finally initialize the PaginationService
     * a local grid with Pagination presets will potentially have a different total of items, we'll need to get it from the DataView and update our total
     */
    private loadLocalGridPagination;
    /** Load any Row Selections into the DataView that were presets by the user */
    private loadRowSelectionPresetWhenExists;
    private mergeGridOptions;
    /** Pre-Register any Resource that don't require SlickGrid to be instantiated (for example RxJS Resource & RowDetail) */
    private preRegisterResources;
    private registerResources;
    /** Register the RxJS Resource in all necessary services which uses */
    private registerRxJsResource;
    /**
     * Render (or dispose) the Pagination Component, user can optionally provide False (to not show it) which will in term dispose of the Pagination,
     * also while disposing we can choose to omit the disposable of the Pagination Service (if we are simply toggling the Pagination, we want to keep the Service alive)
     * @param {Boolean} showPagination - show (new render) or not (dispose) the Pagination
     * @param {Boolean} shouldDisposePaginationService - when disposing the Pagination, do we also want to dispose of the Pagination Service? (defaults to True)
     */
    private renderPagination;
    /**
     * Takes a flat dataset with parent/child relationship, sort it (via its tree structure) and return the sorted flat array
     * @param {Array<Object>} flatDatasetInput - flat dataset input
     * @param {Boolean} forceGridRefresh - optionally force a full grid refresh
     * @returns {Array<Object>} sort flat parent/child dataset
     */
    private sortTreeDataset;
    /**
     * For convenience to the user, we provide the property "editor" as an Angular-Slickgrid editor complex object
     * however "editor" is used internally by SlickGrid for it's own Editor Factory
     * so in our lib we will swap "editor" and copy it into a new property called "internalColumnEditor"
     * then take back "editor.model" and make it the new "editor" so that SlickGrid Editor Factory still works
     */
    private swapInternalEditorToSlickGridFactoryEditor;
    private translateColumnHeaderTitleKeys;
    private translateColumnGroupKeys;
    /**
     * Update the "internalColumnEditor.collection" property.
     * Since this is called after the async call resolves, the pointer will not be the same as the "column" argument passed.
     * Once we found the new pointer, we will reassign the "editor" and "collection" to the "internalColumnEditor" so it has newest collection
     */
    private updateEditorCollection;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularSlickgridComponent, [null, null, null, null, null, { optional: true; }, { optional: true; }, null, null]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AngularSlickgridComponent, "angular-slickgrid", never, { "customDataView": "customDataView"; "gridId": "gridId"; "gridOptions": "gridOptions"; "paginationOptions": "paginationOptions"; "columnDefinitions": "columnDefinitions"; "dataset": "dataset"; "datasetHierarchical": "datasetHierarchical"; }, { "columnDefinitionsChange": "columnDefinitionsChange"; }, never, never, false>;
}
