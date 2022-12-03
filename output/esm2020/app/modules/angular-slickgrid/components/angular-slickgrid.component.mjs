// import 3rd party vendor libs
import 'slickgrid/dist/slick.core.min';
import 'slickgrid/dist/slick.interactions.min';
import 'slickgrid/dist/slick.grid.min';
import 'slickgrid/dist/slick.dataview.min';
// ...then everything else...
import { ApplicationRef, Component, EventEmitter, Inject, Input, Optional, Output, } from '@angular/core';
import { Observable } from 'rxjs';
import { ExtensionName, 
// services
BackendUtilityService, CollectionService, EventNamingStyle, ExtensionService, ExtensionUtility, FilterFactory, FilterService, GridEventService, GridService, GridStateService, GroupingAndColspanService, PaginationService, ResizerService, SharedService, SlickgridConfig, SlickGroupItemMetadataProvider, SortService, TreeDataService, 
// utilities
autoAddEditorFormatterToColumnsWithEditor, emptyElement, GridStateType, unsubscribeAll, } from '@slickgrid-universal/common';
import { EventPubSubService } from '@slickgrid-universal/event-pub-sub';
import { SlickEmptyWarningComponent } from '@slickgrid-universal/empty-warning-component';
import { SlickFooterComponent } from '@slickgrid-universal/custom-footer-component';
import { SlickPaginationComponent } from '@slickgrid-universal/pagination-component';
import { RxJsResource } from '@slickgrid-universal/rxjs-observable';
import { dequal } from 'dequal/lite';
import { Constants } from '../constants';
import { GlobalGridOptions } from './../global-grid-options';
import { TranslaterService } from '../services/translater.service';
// Services
import { AngularUtilService } from '../services/angularUtil.service';
import { SlickRowDetailView } from '../extensions/slickRowDetailView';
import * as i0 from "@angular/core";
import * as i1 from "../services/angularUtil.service";
import * as i2 from "../services/container.service";
import * as i3 from "@ngx-translate/core";
import * as i4 from "../services/translater.service";
export class AngularSlickgridComponent {
    constructor(angularUtilService, appRef, cd, containerService, elm, translate, translaterService, forRootConfig, externalServices) {
        this.angularUtilService = angularUtilService;
        this.appRef = appRef;
        this.cd = cd;
        this.containerService = containerService;
        this.elm = elm;
        this.translate = translate;
        this.translaterService = translaterService;
        this.forRootConfig = forRootConfig;
        this._currentDatasetLength = 0;
        this._eventHandler = new Slick.EventHandler();
        this._hideHeaderRowAfterPageLoad = false;
        this._isGridInitialized = false;
        this._isDatasetInitialized = false;
        this._isDatasetHierarchicalInitialized = false;
        this._isPaginationInitialized = false;
        this._isLocalGrid = true;
        this._registeredResources = [];
        this.groupingDefinition = {};
        this.showPagination = false;
        this.serviceList = [];
        this.totalItems = 0;
        this.subscriptions = [];
        this.gridId = '';
        // make the columnDefinitions a 2-way binding so that plugin adding cols
        // are synched on user's side as well (RowMove, RowDetail, RowSelections)
        this.columnDefinitionsChange = new EventEmitter(true);
        const slickgridConfig = new SlickgridConfig();
        // initialize and assign all Service Dependencies
        this._eventPubSubService = externalServices?.eventPubSubService ?? new EventPubSubService(this.elm.nativeElement);
        this._eventPubSubService.eventNamingStyle = EventNamingStyle.camelCase;
        this.backendUtilityService = externalServices?.backendUtilityService ?? new BackendUtilityService();
        this.gridEventService = externalServices?.gridEventService ?? new GridEventService();
        this.sharedService = externalServices?.sharedService ?? new SharedService();
        this.collectionService = externalServices?.collectionService ?? new CollectionService(this.translaterService);
        this.extensionUtility = externalServices?.extensionUtility ?? new ExtensionUtility(this.sharedService, this.backendUtilityService, this.translaterService);
        this.filterFactory = new FilterFactory(slickgridConfig, this.translaterService, this.collectionService);
        this.filterService = externalServices?.filterService ?? new FilterService(this.filterFactory, this._eventPubSubService, this.sharedService, this.backendUtilityService);
        this.resizerService = externalServices?.resizerService ?? new ResizerService(this._eventPubSubService);
        this.sortService = externalServices?.sortService ?? new SortService(this.sharedService, this._eventPubSubService, this.backendUtilityService);
        this.treeDataService = externalServices?.treeDataService ?? new TreeDataService(this._eventPubSubService, this.sharedService, this.sortService);
        this.paginationService = externalServices?.paginationService ?? new PaginationService(this._eventPubSubService, this.sharedService, this.backendUtilityService);
        this.extensionService = externalServices?.extensionService ?? new ExtensionService(this.extensionUtility, this.filterService, this._eventPubSubService, this.sharedService, this.sortService, this.treeDataService, this.translaterService);
        this.gridStateService = externalServices?.gridStateService ?? new GridStateService(this.extensionService, this.filterService, this._eventPubSubService, this.sharedService, this.sortService, this.treeDataService);
        this.gridService = externalServices?.gridService ?? new GridService(this.gridStateService, this.filterService, this._eventPubSubService, this.paginationService, this.sharedService, this.sortService, this.treeDataService);
        this.groupingService = externalServices?.groupingAndColspanService ?? new GroupingAndColspanService(this.extensionUtility, this._eventPubSubService);
        this.serviceList = [
            this.containerService,
            this.extensionService,
            this.filterService,
            this.gridEventService,
            this.gridService,
            this.gridStateService,
            this.groupingService,
            this.paginationService,
            this.resizerService,
            this.sortService,
            this.treeDataService,
        ];
        // register all Service instances in the container
        this.containerService.registerInstance('ExtensionUtility', this.extensionUtility);
        this.containerService.registerInstance('FilterService', this.filterService);
        this.containerService.registerInstance('CollectionService', this.collectionService);
        this.containerService.registerInstance('ExtensionService', this.extensionService);
        this.containerService.registerInstance('GridEventService', this.gridEventService);
        this.containerService.registerInstance('GridService', this.gridService);
        this.containerService.registerInstance('GridStateService', this.gridStateService);
        this.containerService.registerInstance('GroupingAndColspanService', this.groupingService);
        this.containerService.registerInstance('PaginationService', this.paginationService);
        this.containerService.registerInstance('ResizerService', this.resizerService);
        this.containerService.registerInstance('SharedService', this.sharedService);
        this.containerService.registerInstance('SortService', this.sortService);
        this.containerService.registerInstance('EventPubSubService', this._eventPubSubService);
        this.containerService.registerInstance('PubSubService', this._eventPubSubService);
        this.containerService.registerInstance('TranslaterService', this.translaterService);
        this.containerService.registerInstance('TreeDataService', this.treeDataService);
    }
    get paginationOptions() {
        return this._paginationOptions;
    }
    set paginationOptions(newPaginationOptions) {
        if (newPaginationOptions && this._paginationOptions) {
            this._paginationOptions = { ...this.gridOptions.pagination, ...this._paginationOptions, ...newPaginationOptions };
        }
        else {
            this._paginationOptions = newPaginationOptions;
        }
        this.gridOptions.pagination = this._paginationOptions ?? this.gridOptions.pagination;
        this.paginationService.updateTotalItems(this.gridOptions.pagination?.totalItems ?? 0, true);
    }
    set columnDefinitions(columnDefinitions) {
        this._columnDefinitions = columnDefinitions;
        if (this._isGridInitialized) {
            this.updateColumnDefinitionsList(columnDefinitions);
        }
        if (columnDefinitions.length > 0) {
            this.copyColumnWidthsReference(columnDefinitions);
        }
    }
    get columnDefinitions() {
        return this._columnDefinitions;
    }
    get dataset() {
        return (this.customDataView ? this.slickGrid?.getData?.() : this.dataView?.getItems?.()) || [];
    }
    set dataset(newDataset) {
        const prevDatasetLn = this._currentDatasetLength;
        const isDatasetEqual = dequal(newDataset, this._dataset || []);
        let data = newDataset;
        // when Tree Data is enabled and we don't yet have the hierarchical dataset filled, we can force a convert+sort of the array
        if (this.slickGrid && this.gridOptions?.enableTreeData && Array.isArray(newDataset) && (newDataset.length > 0 || newDataset.length !== prevDatasetLn || !isDatasetEqual)) {
            this._isDatasetHierarchicalInitialized = false;
            data = this.sortTreeDataset(newDataset, !isDatasetEqual); // if dataset changed, then force a refresh anyway
        }
        this._dataset = data;
        this.refreshGridData(data || []);
        this._currentDatasetLength = (newDataset || []).length;
        // expand/autofit columns on first page load
        // we can assume that if the prevDataset was empty then we are on first load
        if (this.gridOptions?.autoFitColumnsOnFirstLoad && prevDatasetLn === 0) {
            this.slickGrid.autosizeColumns();
        }
    }
    get datasetHierarchical() {
        return this.sharedService.hierarchicalDataset;
    }
    set datasetHierarchical(newHierarchicalDataset) {
        const isDatasetEqual = dequal(newHierarchicalDataset, this.sharedService?.hierarchicalDataset ?? []);
        const prevFlatDatasetLn = this._currentDatasetLength;
        this.sharedService.hierarchicalDataset = newHierarchicalDataset;
        if (newHierarchicalDataset && this.columnDefinitions && this.filterService?.clearFilters) {
            this.filterService.clearFilters();
        }
        // when a hierarchical dataset is set afterward, we can reset the flat dataset and call a tree data sort that will overwrite the flat dataset
        if (newHierarchicalDataset && this.slickGrid && this.sortService?.processTreeDataInitialSort) {
            this.dataView.setItems([], this.gridOptions.datasetIdPropertyName ?? 'id');
            this.sortService.processTreeDataInitialSort();
            // we also need to reset/refresh the Tree Data filters because if we inserted new item(s) then it might not show up without doing this refresh
            // however we need 1 cpu cycle before having the DataView refreshed, so we need to wrap this check in a setTimeout
            setTimeout(() => {
                const flatDatasetLn = this.dataView.getItemCount();
                if (flatDatasetLn > 0 && (flatDatasetLn !== prevFlatDatasetLn || !isDatasetEqual)) {
                    this.filterService.refreshTreeDataFilters();
                }
            });
            this._isDatasetHierarchicalInitialized = true;
        }
    }
    get elementRef() {
        return this.elm;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    get gridContainerElement() {
        return document.querySelector(`#${this.gridOptions.gridContainerId || ''}`);
    }
    /** GETTER to know if dataset was initialized or not */
    get isDatasetInitialized() {
        return this._isDatasetInitialized;
    }
    /** SETTER to change if dataset was initialized or not (stringly used for unit testing purposes) */
    set isDatasetInitialized(isInitialized) {
        this._isDatasetInitialized = isInitialized;
    }
    set isDatasetHierarchicalInitialized(isInitialized) {
        this._isDatasetHierarchicalInitialized = isInitialized;
    }
    get registeredResources() {
        return this._registeredResources;
    }
    ngAfterViewInit() {
        if (!this.gridOptions || !this.columnDefinitions) {
            throw new Error('Using `<angular-slickgrid>` requires [gridOptions] and [columnDefinitions], it seems that you might have forgot to provide them since at least of them is undefined.');
        }
        this.initialization(this._eventHandler);
        this._isGridInitialized = true;
        // recheck the empty warning message after grid is shown so that it works in every use case
        if (this.gridOptions && this.gridOptions.enableEmptyDataWarningMessage && Array.isArray(this.dataset)) {
            const finalTotalCount = this.dataset.length;
            this.displayEmptyDataWarning(finalTotalCount < 1);
        }
    }
    ngOnDestroy() {
        this._eventPubSubService.publish('onBeforeGridDestroy', this.slickGrid);
        this.destroy();
        this._eventPubSubService.publish('onAfterGridDestroyed', true);
    }
    destroy(shouldEmptyDomElementContainer = false) {
        // dispose of all Services
        this.serviceList.forEach((service) => {
            if (service && service.dispose) {
                service.dispose();
            }
        });
        this.serviceList = [];
        // dispose all registered external resources
        if (Array.isArray(this._registeredResources)) {
            while (this._registeredResources.length > 0) {
                const resource = this._registeredResources.pop();
                if (resource?.dispose) {
                    resource.dispose();
                }
            }
            this._registeredResources = [];
        }
        // dispose the Components
        this.slickEmptyWarning?.dispose();
        this.slickFooter?.dispose();
        this.slickPagination?.dispose();
        if (this._eventHandler?.unsubscribeAll) {
            this._eventHandler.unsubscribeAll();
        }
        this._eventPubSubService?.unsubscribeAll();
        if (this.dataView) {
            if (this.dataView?.setItems) {
                this.dataView.setItems([]);
            }
            if (this.dataView.destroy) {
                this.dataView.destroy();
            }
        }
        if (this.slickGrid?.destroy) {
            this.slickGrid.destroy(shouldEmptyDomElementContainer);
        }
        if (this.backendServiceApi) {
            for (const prop of Object.keys(this.backendServiceApi)) {
                delete this.backendServiceApi[prop];
            }
            this.backendServiceApi = undefined;
        }
        for (const prop of Object.keys(this.columnDefinitions)) {
            this.columnDefinitions[prop] = null;
        }
        for (const prop of Object.keys(this.sharedService)) {
            this.sharedService[prop] = null;
        }
        // we could optionally also empty the content of the grid container DOM element
        if (shouldEmptyDomElementContainer) {
            this.emptyGridContainerElm();
        }
        // also unsubscribe all RxJS subscriptions
        this.subscriptions = unsubscribeAll(this.subscriptions);
        this._dataset = null;
        this.datasetHierarchical = undefined;
        this._columnDefinitions = [];
        this._angularGridInstances = undefined;
        this.slickGrid = undefined;
    }
    emptyGridContainerElm() {
        const gridContainerId = this.gridOptions?.gridContainerId ?? 'grid1';
        const gridContainerElm = document.querySelector(`#${gridContainerId}`);
        emptyElement(gridContainerElm);
    }
    /**
     * Define our internal Post Process callback, it will execute internally after we get back result from the Process backend call
     * For now, this is GraphQL Service ONLY feature and it will basically refresh the Dataset & Pagination without having the user to create his own PostProcess every time
     */
    createBackendApiInternalPostProcessCallback(gridOptions) {
        const backendApi = gridOptions && gridOptions.backendServiceApi;
        if (backendApi && backendApi.service) {
            const backendApiService = backendApi.service;
            // internalPostProcess only works (for now) with a GraphQL Service, so make sure it is of that type
            if (typeof backendApiService.getDatasetName === 'function') {
                backendApi.internalPostProcess = (processResult) => {
                    const datasetName = (backendApi && backendApiService && typeof backendApiService.getDatasetName === 'function') ? backendApiService.getDatasetName() : '';
                    if (processResult?.data[datasetName]) {
                        const data = processResult.data[datasetName].hasOwnProperty('nodes') ? processResult.data[datasetName].nodes : processResult.data[datasetName];
                        const totalCount = processResult.data[datasetName].hasOwnProperty('totalCount') ? processResult.data[datasetName].totalCount : processResult.data[datasetName].length;
                        this.refreshGridData(data, totalCount || 0);
                    }
                };
            }
        }
    }
    initialization(eventHandler) {
        this.gridOptions.translater = this.translaterService;
        this._eventHandler = eventHandler;
        // when detecting a frozen grid, we'll automatically enable the mousewheel scroll handler so that we can scroll from both left/right frozen containers
        if (this.gridOptions && ((this.gridOptions.frozenRow !== undefined && this.gridOptions.frozenRow >= 0) || this.gridOptions.frozenColumn !== undefined && this.gridOptions.frozenColumn >= 0) && this.gridOptions.enableMouseWheelScrollHandler === undefined) {
            this.gridOptions.enableMouseWheelScrollHandler = true;
        }
        this._eventPubSubService.eventNamingStyle = this.gridOptions?.eventNamingStyle ?? EventNamingStyle.camelCase;
        this._eventPubSubService.publish('onBeforeGridCreate', true);
        // make sure the dataset is initialized (if not it will throw an error that it cannot getLength of null)
        this._dataset = this._dataset || [];
        this.gridOptions = this.mergeGridOptions(this.gridOptions);
        this._paginationOptions = this.gridOptions?.pagination;
        this.locales = this.gridOptions?.locales ?? Constants.locales;
        this.backendServiceApi = this.gridOptions?.backendServiceApi;
        this._isLocalGrid = !this.backendServiceApi; // considered a local grid if it doesn't have a backend service set
        this.createBackendApiInternalPostProcessCallback(this.gridOptions);
        if (!this.customDataView) {
            const dataviewInlineFilters = this.gridOptions.dataView && this.gridOptions.dataView.inlineFilters || false;
            let dataViewOptions = { inlineFilters: dataviewInlineFilters };
            if (this.gridOptions.draggableGrouping || this.gridOptions.enableGrouping) {
                this.groupItemMetadataProvider = new SlickGroupItemMetadataProvider();
                this.sharedService.groupItemMetadataProvider = this.groupItemMetadataProvider;
                dataViewOptions = { ...dataViewOptions, groupItemMetadataProvider: this.groupItemMetadataProvider };
            }
            this.dataView = new Slick.Data.DataView(dataViewOptions);
            this._eventPubSubService.publish('onDataviewCreated', this.dataView);
        }
        // get any possible Services that user want to register which don't require SlickGrid to be instantiated
        // RxJS Resource is in this lot because it has to be registered before anything else and doesn't require SlickGrid to be initialized
        this.preRegisterResources();
        // for convenience to the user, we provide the property "editor" as an Angular-Slickgrid editor complex object
        // however "editor" is used internally by SlickGrid for it's own Editor Factory
        // so in our lib we will swap "editor" and copy it into a new property called "internalColumnEditor"
        // then take back "editor.model" and make it the new "editor" so that SlickGrid Editor Factory still works
        this._columnDefinitions = this.swapInternalEditorToSlickGridFactoryEditor(this._columnDefinitions);
        // if the user wants to automatically add a Custom Editor Formatter, we need to call the auto add function again
        if (this.gridOptions.autoAddCustomEditorFormatter) {
            autoAddEditorFormatterToColumnsWithEditor(this._columnDefinitions, this.gridOptions.autoAddCustomEditorFormatter);
        }
        // save reference for all columns before they optionally become hidden/visible
        this.sharedService.allColumns = this._columnDefinitions;
        this.sharedService.visibleColumns = this._columnDefinitions;
        // before certain extentions/plugins potentially adds extra columns not created by the user itself (RowMove, RowDetail, RowSelections)
        // we'll subscribe to the event and push back the change to the user so they always use full column defs array including extra cols
        this.subscriptions.push(this._eventPubSubService.subscribe('onPluginColumnsChanged', data => {
            this._columnDefinitions = data.columns;
            this.columnDefinitionsChange.emit(this._columnDefinitions);
        }));
        // after subscribing to potential columns changed, we are ready to create these optional extensions
        // when we did find some to create (RowMove, RowDetail, RowSelections), it will automatically modify column definitions (by previous subscribe)
        this.extensionService.createExtensionsBeforeGridCreation(this._columnDefinitions, this.gridOptions);
        // if user entered some Pinning/Frozen "presets", we need to apply them in the grid options
        if (this.gridOptions.presets?.pinning) {
            this.gridOptions = { ...this.gridOptions, ...this.gridOptions.presets.pinning };
        }
        // build SlickGrid Grid, also user might optionally pass a custom dataview (e.g. remote model)
        this.slickGrid = new Slick.Grid(`#${this.gridId}`, this.customDataView || this.dataView, this._columnDefinitions, this.gridOptions);
        this.sharedService.dataView = this.dataView;
        this.sharedService.slickGrid = this.slickGrid;
        this.sharedService.gridContainerElement = this.elm.nativeElement;
        this.extensionService.bindDifferentExtensions();
        this.bindDifferentHooks(this.slickGrid, this.gridOptions, this.dataView);
        // when it's a frozen grid, we need to keep the frozen column id for reference if we ever show/hide column from ColumnPicker/GridMenu afterward
        const frozenColumnIndex = this.gridOptions.frozenColumn !== undefined ? this.gridOptions.frozenColumn : -1;
        if (frozenColumnIndex >= 0 && frozenColumnIndex <= this._columnDefinitions.length) {
            this.sharedService.frozenVisibleColumnId = this._columnDefinitions[frozenColumnIndex].id || '';
        }
        // get any possible Services that user want to register
        this.registerResources();
        // initialize the SlickGrid grid
        this.slickGrid.init();
        // initialized the resizer service only after SlickGrid is initialized
        // if we don't we end up binding our resize to a grid element that doesn't yet exist in the DOM and the resizer service will fail silently (because it has a try/catch that unbinds the resize without throwing back)
        if (this.gridContainerElement) {
            this.resizerService.init(this.slickGrid, this.gridContainerElement);
        }
        // user could show a custom footer with the data metrics (dataset length and last updated timestamp)
        if (!this.gridOptions.enablePagination && this.gridOptions.showCustomFooter && this.gridOptions.customFooterOptions && this.gridContainerElement) {
            this.slickFooter = new SlickFooterComponent(this.slickGrid, this.gridOptions.customFooterOptions, this._eventPubSubService, this.translaterService);
            this.slickFooter.renderFooter(this.gridContainerElement);
        }
        if (!this.customDataView && this.dataView) {
            // load the data in the DataView (unless it's a hierarchical dataset, if so it will be loaded after the initial tree sort)
            const initialDataset = this.gridOptions?.enableTreeData ? this.sortTreeDataset(this._dataset) : this._dataset;
            this.dataView.beginUpdate();
            this.dataView.setItems(initialDataset || [], this.gridOptions.datasetIdPropertyName ?? 'id');
            this.dataView.endUpdate();
            // if you don't want the items that are not visible (due to being filtered out or being on a different page)
            // to stay selected, pass 'false' to the second arg
            if (this.slickGrid?.getSelectionModel() && this.gridOptions && this.gridOptions.dataView && this.gridOptions.dataView.hasOwnProperty('syncGridSelection')) {
                // if we are using a Backend Service, we will do an extra flag check, the reason is because it might have some unintended behaviors
                // with the BackendServiceApi because technically the data in the page changes the DataView on every page change.
                let preservedRowSelectionWithBackend = false;
                if (this.gridOptions.backendServiceApi && this.gridOptions.dataView.hasOwnProperty('syncGridSelectionWithBackendService')) {
                    preservedRowSelectionWithBackend = this.gridOptions.dataView.syncGridSelectionWithBackendService;
                }
                const syncGridSelection = this.gridOptions.dataView.syncGridSelection;
                if (typeof syncGridSelection === 'boolean') {
                    let preservedRowSelection = syncGridSelection;
                    if (!this._isLocalGrid) {
                        // when using BackendServiceApi, we'll be using the "syncGridSelectionWithBackendService" flag BUT "syncGridSelection" must also be set to True
                        preservedRowSelection = syncGridSelection && preservedRowSelectionWithBackend;
                    }
                    this.dataView.syncGridSelection(this.slickGrid, preservedRowSelection);
                }
                else if (typeof syncGridSelection === 'object') {
                    this.dataView.syncGridSelection(this.slickGrid, syncGridSelection.preserveHidden, syncGridSelection.preserveHiddenOnSelectionChange);
                }
            }
            const datasetLn = this.dataView.getLength() || this._dataset && this._dataset.length || 0;
            if (datasetLn > 0) {
                if (!this._isDatasetInitialized && (this.gridOptions.enableCheckboxSelector || this.gridOptions.enableRowSelection)) {
                    this.loadRowSelectionPresetWhenExists();
                }
                this.loadFilterPresetsWhenDatasetInitialized();
                this._isDatasetInitialized = true;
            }
        }
        // user might want to hide the header row on page load but still have `enableFiltering: true`
        // if that is the case, we need to hide the headerRow ONLY AFTER all filters got created & dataView exist
        if (this._hideHeaderRowAfterPageLoad) {
            this.showHeaderRow(false);
            this.sharedService.hideHeaderRowAfterPageLoad = this._hideHeaderRowAfterPageLoad;
        }
        // publish & dispatch certain events
        this._eventPubSubService.publish('onGridCreated', this.slickGrid);
        // after the DataView is created & updated execute some processes
        if (!this.customDataView) {
            this.executeAfterDataviewCreated(this.slickGrid, this.gridOptions);
        }
        // bind resize ONLY after the dataView is ready
        this.bindResizeHook(this.slickGrid, this.gridOptions);
        // bind the Backend Service API callback functions only after the grid is initialized
        // because the preProcess() and onInit() might get triggered
        if (this.gridOptions?.backendServiceApi) {
            this.bindBackendCallbackFunctions(this.gridOptions);
        }
        // local grid, check if we need to show the Pagination
        // if so then also check if there's any presets and finally initialize the PaginationService
        // a local grid with Pagination presets will potentially have a different total of items, we'll need to get it from the DataView and update our total
        if (this.gridOptions?.enablePagination && this._isLocalGrid) {
            this.showPagination = true;
            this.loadLocalGridPagination(this.dataset);
        }
        this._angularGridInstances = {
            // Slick Grid & DataView objects
            dataView: this.dataView,
            slickGrid: this.slickGrid,
            extensions: this.extensionService?.extensionList,
            // public methods
            destroy: this.destroy.bind(this),
            // return all available Services (non-singleton)
            backendService: this.gridOptions?.backendServiceApi?.service,
            eventPubSubService: this._eventPubSubService,
            filterService: this.filterService,
            gridEventService: this.gridEventService,
            gridStateService: this.gridStateService,
            gridService: this.gridService,
            groupingService: this.groupingService,
            extensionService: this.extensionService,
            paginationService: this.paginationService,
            resizerService: this.resizerService,
            sortService: this.sortService,
            treeDataService: this.treeDataService,
        };
        // all instances (SlickGrid, DataView & all Services)
        this._eventPubSubService.publish('onAngularGridCreated', this._angularGridInstances);
    }
    /**
     * On a Pagination changed, we will trigger a Grid State changed with the new pagination info
     * Also if we use Row Selection or the Checkbox Selector, we need to reset any selection
     */
    paginationChanged(pagination) {
        const isSyncGridSelectionEnabled = this.gridStateService?.needToPreserveRowSelection() ?? false;
        if (!isSyncGridSelectionEnabled && (this.gridOptions.enableRowSelection || this.gridOptions.enableCheckboxSelector)) {
            this.slickGrid.setSelectedRows([]);
        }
        const { pageNumber, pageSize } = pagination;
        if (this.sharedService) {
            if (pageSize !== undefined && pageNumber !== undefined) {
                this.sharedService.currentPagination = { pageNumber, pageSize };
            }
        }
        this._eventPubSubService.publish('onGridStateChanged', {
            change: { newValues: { pageNumber, pageSize }, type: GridStateType.pagination },
            gridState: this.gridStateService.getCurrentGridState()
        });
        this.cd.markForCheck();
    }
    /**
     * When dataset changes, we need to refresh the entire grid UI & possibly resize it as well
     * @param dataset
     */
    refreshGridData(dataset, totalCount) {
        if (this.gridOptions && this.gridOptions.enableEmptyDataWarningMessage && Array.isArray(dataset)) {
            const finalTotalCount = totalCount || dataset.length;
            this.displayEmptyDataWarning(finalTotalCount < 1);
        }
        if (Array.isArray(dataset) && this.slickGrid && this.dataView?.setItems) {
            this.dataView.setItems(dataset, this.gridOptions.datasetIdPropertyName ?? 'id');
            if (!this.gridOptions.backendServiceApi && !this.gridOptions.enableTreeData) {
                this.dataView.reSort();
            }
            if (dataset.length > 0) {
                if (!this._isDatasetInitialized) {
                    this.loadFilterPresetsWhenDatasetInitialized();
                    if (this.gridOptions.enableCheckboxSelector) {
                        this.loadRowSelectionPresetWhenExists();
                    }
                }
                this._isDatasetInitialized = true;
            }
            if (dataset) {
                this.slickGrid.invalidate();
            }
            // display the Pagination component only after calling this refresh data first, we call it here so that if we preset pagination page number it will be shown correctly
            this.showPagination = (this.gridOptions && (this.gridOptions.enablePagination || (this.gridOptions.backendServiceApi && this.gridOptions.enablePagination === undefined))) ? true : false;
            if (this._paginationOptions && this.gridOptions?.pagination && this.gridOptions?.backendServiceApi) {
                const paginationOptions = this.setPaginationOptionsWhenPresetDefined(this.gridOptions, this._paginationOptions);
                // when we have a totalCount use it, else we'll take it from the pagination object
                // only update the total items if it's different to avoid refreshing the UI
                const totalRecords = (totalCount !== undefined) ? totalCount : (this.gridOptions?.pagination?.totalItems);
                if (totalRecords !== undefined && totalRecords !== this.totalItems) {
                    this.totalItems = +totalRecords;
                }
                // initialize the Pagination Service with new pagination options (which might have presets)
                if (!this._isPaginationInitialized) {
                    this.initializePaginationService(paginationOptions);
                }
                else {
                    // update the pagination service with the new total
                    this.paginationService.updateTotalItems(this.totalItems);
                }
            }
            // resize the grid inside a slight timeout, in case other DOM element changed prior to the resize (like a filter/pagination changed)
            if (this.slickGrid && this.gridOptions.enableAutoResize) {
                const delay = this.gridOptions.autoResize && this.gridOptions.autoResize.delay;
                this.resizerService.resizeGrid(delay || 10);
            }
        }
    }
    /**
     * Check if there's any Pagination Presets defined in the Grid Options,
     * if there are then load them in the paginationOptions object
     */
    setPaginationOptionsWhenPresetDefined(gridOptions, paginationOptions) {
        if (gridOptions.presets?.pagination && paginationOptions && !this._isPaginationInitialized) {
            paginationOptions.pageSize = gridOptions.presets.pagination.pageSize;
            paginationOptions.pageNumber = gridOptions.presets.pagination.pageNumber;
        }
        return paginationOptions;
    }
    /**
     * Dynamically change or update the column definitions list.
     * We will re-render the grid so that the new header and data shows up correctly.
     * If using i18n, we also need to trigger a re-translate of the column headers
     */
    updateColumnDefinitionsList(newColumnDefinitions) {
        // map/swap the internal library Editor to the SlickGrid Editor factory
        newColumnDefinitions = this.swapInternalEditorToSlickGridFactoryEditor(newColumnDefinitions);
        if (this.gridOptions.enableTranslate) {
            this.extensionService.translateColumnHeaders(false, newColumnDefinitions);
        }
        else {
            this.extensionService.renderColumnHeaders(newColumnDefinitions, true);
        }
        if (this.gridOptions?.enableAutoSizeColumns) {
            this.slickGrid.autosizeColumns();
        }
        else if (this.gridOptions?.enableAutoResizeColumnsByCellContent && this.resizerService?.resizeColumnsByCellContent) {
            this.resizerService.resizeColumnsByCellContent();
        }
    }
    /**
     * Show the filter row displayed on first row, we can optionally pass false to hide it.
     * @param showing
     */
    showHeaderRow(showing = true) {
        this.slickGrid.setHeaderRowVisibility(showing, false);
        if (showing === true && this._isGridInitialized) {
            this.slickGrid.setColumns(this.columnDefinitions);
        }
        return showing;
    }
    //
    // private functions
    // ------------------
    /**
     * Loop through all column definitions and copy the original optional `width` properties optionally provided by the user.
     * We will use this when doing a resize by cell content, if user provided a `width` it won't override it.
     */
    copyColumnWidthsReference(columnDefinitions) {
        columnDefinitions.forEach(col => col.originalWidth = col.width);
    }
    displayEmptyDataWarning(showWarning = true) {
        this.slickEmptyWarning?.showEmptyDataMessage(showWarning);
    }
    bindDifferentHooks(grid, gridOptions, dataView) {
        // on locale change, we have to manually translate the Headers, GridMenu
        if (this.translate?.onLangChange) {
            // translate some of them on first load, then on each language change
            if (gridOptions.enableTranslate) {
                this.extensionService.translateAllExtensions();
                this.translateColumnHeaderTitleKeys();
                this.translateColumnGroupKeys();
            }
            this.subscriptions.push(this.translate.onLangChange.subscribe(() => {
                // publish event of the same name that Slickgrid-Universal uses on a language change event
                this._eventPubSubService.publish('onLanguageChange');
                if (gridOptions.enableTranslate) {
                    this.extensionService.translateAllExtensions();
                    this.translateColumnHeaderTitleKeys();
                    this.translateColumnGroupKeys();
                    if (gridOptions.createPreHeaderPanel && !gridOptions.enableDraggableGrouping) {
                        this.groupingService.translateGroupingAndColSpan();
                    }
                }
            }));
        }
        // if user set an onInit Backend, we'll run it right away (and if so, we also need to run preProcess, internalPostProcess & postProcess)
        if (gridOptions.backendServiceApi) {
            const backendApi = gridOptions.backendServiceApi;
            if (backendApi?.service?.init) {
                backendApi.service.init(backendApi.options, gridOptions.pagination, this.slickGrid, this.sharedService);
            }
        }
        if (dataView && grid) {
            const slickgridEventPrefix = this.gridOptions?.defaultSlickgridEventPrefix ?? '';
            // expose all Slick Grid Events through dispatch
            for (const prop in grid) {
                if (grid.hasOwnProperty(prop) && prop.startsWith('on')) {
                    const gridEventName = this._eventPubSubService.getEventNameByNamingConvention(prop, slickgridEventPrefix);
                    this._eventHandler.subscribe(grid[prop], (event, args) => {
                        return this._eventPubSubService.dispatchCustomEvent(gridEventName, { eventData: event, args });
                    });
                }
            }
            // expose all Slick DataView Events through dispatch
            for (const prop in dataView) {
                if (dataView.hasOwnProperty(prop) && prop.startsWith('on')) {
                    this._eventHandler.subscribe(dataView[prop], (event, args) => {
                        const dataViewEventName = this._eventPubSubService.getEventNameByNamingConvention(prop, slickgridEventPrefix);
                        return this._eventPubSubService.dispatchCustomEvent(dataViewEventName, { eventData: event, args });
                    });
                }
            }
            // on cell click, mainly used with the columnDef.action callback
            this.gridEventService.bindOnCellChange(grid);
            this.gridEventService.bindOnClick(grid);
            if (dataView && grid) {
                // bind external sorting (backend) when available or default onSort (dataView)
                if (gridOptions.enableSorting) {
                    // bind external sorting (backend) unless specified to use the local one
                    if (gridOptions.backendServiceApi && !gridOptions.backendServiceApi.useLocalSorting) {
                        this.sortService.bindBackendOnSort(grid);
                    }
                    else {
                        this.sortService.bindLocalOnSort(grid);
                    }
                }
                // bind external filter (backend) when available or default onFilter (dataView)
                if (gridOptions.enableFiltering) {
                    this.filterService.init(grid);
                    // bind external filter (backend) unless specified to use the local one
                    if (gridOptions.backendServiceApi && !gridOptions.backendServiceApi.useLocalFiltering) {
                        this.filterService.bindBackendOnFilter(grid);
                    }
                    else {
                        this.filterService.bindLocalOnFilter(grid);
                    }
                }
                // load any presets if any (after dataset is initialized)
                this.loadColumnPresetsWhenDatasetInitialized();
                this.loadFilterPresetsWhenDatasetInitialized();
                // When data changes in the DataView, we need to refresh the metrics and/or display a warning if the dataset is empty
                this._eventHandler.subscribe(dataView.onRowCountChanged, () => {
                    grid.invalidate();
                    this.handleOnItemCountChanged(dataView.getFilteredItemCount() || 0, dataView.getItemCount() || 0);
                });
                this._eventHandler.subscribe(dataView.onSetItemsCalled, (_e, args) => {
                    this.handleOnItemCountChanged(dataView.getFilteredItemCount() || 0, args.itemCount);
                    // when user has resize by content enabled, we'll force a full width calculation since we change our entire dataset
                    if (args.itemCount > 0 && (this.gridOptions.autosizeColumnsByCellContentOnFirstLoad || this.gridOptions.enableAutoResizeColumnsByCellContent)) {
                        this.resizerService.resizeColumnsByCellContent(!this.gridOptions?.resizeByContentOnlyOnFirstLoad);
                    }
                });
                if (gridOptions?.enableFiltering && !gridOptions.enableRowDetailView) {
                    this._eventHandler.subscribe(dataView.onRowsChanged, (_e, args) => {
                        // filtering data with local dataset will not always show correctly unless we call this updateRow/render
                        // also don't use "invalidateRows" since it destroys the entire row and as bad user experience when updating a row
                        // see commit: https://github.com/ghiscoding/aurelia-slickgrid/commit/8c503a4d45fba11cbd8d8cc467fae8d177cc4f60
                        if (args?.rows && Array.isArray(args.rows)) {
                            args.rows.forEach((row) => grid.updateRow(row));
                            grid.render();
                        }
                    });
                }
            }
        }
        // did the user add a colspan callback? If so, hook it into the DataView getItemMetadata
        if (gridOptions && gridOptions.colspanCallback && dataView && dataView.getItem && dataView.getItemMetadata) {
            dataView.getItemMetadata = (rowNumber) => {
                let callbackResult = null;
                if (gridOptions.colspanCallback && gridOptions.colspanCallback) {
                    callbackResult = gridOptions.colspanCallback(dataView.getItem(rowNumber));
                }
                return callbackResult;
            };
        }
    }
    bindBackendCallbackFunctions(gridOptions) {
        const backendApi = gridOptions.backendServiceApi;
        const backendApiService = backendApi && backendApi.service;
        const serviceOptions = backendApiService?.options ?? {};
        const isExecuteCommandOnInit = (!serviceOptions) ? false : ((serviceOptions && serviceOptions.hasOwnProperty('executeProcessCommandOnInit')) ? serviceOptions['executeProcessCommandOnInit'] : true);
        if (backendApiService) {
            // update backend filters (if need be) BEFORE the query runs (via the onInit command a few lines below)
            // if user entered some any "presets", we need to reflect them all in the grid
            if (gridOptions && gridOptions.presets) {
                // Filters "presets"
                if (backendApiService.updateFilters && Array.isArray(gridOptions.presets.filters) && gridOptions.presets.filters.length > 0) {
                    backendApiService.updateFilters(gridOptions.presets.filters, true);
                }
                // Sorters "presets"
                if (backendApiService.updateSorters && Array.isArray(gridOptions.presets.sorters) && gridOptions.presets.sorters.length > 0) {
                    // when using multi-column sort, we can have multiple but on single sort then only grab the first sort provided
                    const sortColumns = this.gridOptions.multiColumnSort ? gridOptions.presets.sorters : gridOptions.presets.sorters.slice(0, 1);
                    backendApiService.updateSorters(undefined, sortColumns);
                }
                // Pagination "presets"
                if (backendApiService.updatePagination && gridOptions.presets.pagination) {
                    const { pageNumber, pageSize } = gridOptions.presets.pagination;
                    backendApiService.updatePagination(pageNumber, pageSize);
                }
            }
            else {
                const columnFilters = this.filterService.getColumnFilters();
                if (columnFilters && backendApiService.updateFilters) {
                    backendApiService.updateFilters(columnFilters, false);
                }
            }
            // execute onInit command when necessary
            if (backendApi && backendApiService && (backendApi.onInit || isExecuteCommandOnInit)) {
                const query = (typeof backendApiService.buildQuery === 'function') ? backendApiService.buildQuery() : '';
                const process = (isExecuteCommandOnInit) ? (backendApi.process && backendApi.process(query) || null) : (backendApi.onInit && backendApi.onInit(query) || null);
                // wrap this inside a setTimeout to avoid timing issue since the gridOptions needs to be ready before running this onInit
                setTimeout(() => {
                    const backendUtilityService = this.backendUtilityService;
                    // keep start time & end timestamps & return it after process execution
                    const startTime = new Date();
                    // run any pre-process, if defined, for example a spinner
                    if (backendApi.preProcess) {
                        backendApi.preProcess();
                    }
                    // the processes can be a Promise (like Http)
                    const totalItems = this.gridOptions?.pagination?.totalItems ?? 0;
                    if (process instanceof Promise) {
                        process
                            .then((processResult) => backendUtilityService.executeBackendProcessesCallback(startTime, processResult, backendApi, totalItems))
                            .catch((error) => backendUtilityService.onBackendError(error, backendApi));
                    }
                    else if (process && this.rxjs?.isObservable(process)) {
                        this.subscriptions.push(process.subscribe({
                            next: (processResult) => backendUtilityService.executeBackendProcessesCallback(startTime, processResult, backendApi, totalItems),
                            error: (error) => backendUtilityService.onBackendError(error, backendApi)
                        }));
                    }
                });
            }
        }
    }
    bindResizeHook(grid, options) {
        if ((options.autoFitColumnsOnFirstLoad && options.autosizeColumnsByCellContentOnFirstLoad) || (options.enableAutoSizeColumns && options.enableAutoResizeColumnsByCellContent)) {
            throw new Error(`[Angular-Slickgrid] You cannot enable both autosize/fit viewport & resize by content, you must choose which resize technique to use. You can enable these 2 options ("autoFitColumnsOnFirstLoad" and "enableAutoSizeColumns") OR these other 2 options ("autosizeColumnsByCellContentOnFirstLoad" and "enableAutoResizeColumnsByCellContent").`);
        }
        // expand/autofit columns on first page load
        if (grid && options.autoFitColumnsOnFirstLoad && options.enableAutoSizeColumns) {
            grid.autosizeColumns();
        }
        // auto-resize grid on browser resize
        if (options.gridHeight || options.gridWidth) {
            this.resizerService.resizeGrid(0, { height: options.gridHeight, width: options.gridWidth });
        }
        else {
            this.resizerService.resizeGrid();
        }
        if (options.enableAutoResize) {
            if (grid && options.autoFitColumnsOnFirstLoad && options.enableAutoSizeColumns) {
                grid.autosizeColumns();
            }
        }
    }
    executeAfterDataviewCreated(_grid, gridOptions) {
        // if user entered some Sort "presets", we need to reflect them all in the DOM
        if (gridOptions.enableSorting) {
            if (gridOptions.presets && Array.isArray(gridOptions.presets.sorters)) {
                // when using multi-column sort, we can have multiple but on single sort then only grab the first sort provided
                const sortColumns = this.gridOptions.multiColumnSort ? gridOptions.presets.sorters : gridOptions.presets.sorters.slice(0, 1);
                this.sortService.loadGridSorters(sortColumns);
            }
        }
    }
    /** When data changes in the DataView, we'll refresh the metrics and/or display a warning if the dataset is empty */
    handleOnItemCountChanged(currentPageRowItemCount, totalItemCount) {
        this._currentDatasetLength = totalItemCount;
        this.metrics = {
            startTime: new Date(),
            endTime: new Date(),
            itemCount: currentPageRowItemCount,
            totalItemCount
        };
        // if custom footer is enabled, then we'll update its metrics
        if (this.slickFooter) {
            this.slickFooter.metrics = this.metrics;
        }
        // when using local (in-memory) dataset, we'll display a warning message when filtered data is empty
        if (this._isLocalGrid && this.gridOptions?.enableEmptyDataWarningMessage) {
            this.displayEmptyDataWarning(currentPageRowItemCount === 0);
        }
    }
    initializePaginationService(paginationOptions) {
        if (this.gridOptions) {
            this.paginationData = {
                gridOptions: this.gridOptions,
                paginationService: this.paginationService,
            };
            this.paginationService.totalItems = this.totalItems;
            this.paginationService.init(this.slickGrid, paginationOptions, this.backendServiceApi);
            this.subscriptions.push(this._eventPubSubService.subscribe('onPaginationChanged', (paginationChanges) => {
                this.paginationChanged(paginationChanges);
            }), this._eventPubSubService.subscribe('onPaginationVisibilityChanged', (visibility) => {
                this.showPagination = visibility?.visible ?? false;
                if (this.gridOptions?.backendServiceApi) {
                    this.backendUtilityService?.refreshBackendDataset(this.gridOptions);
                }
                this.renderPagination(this.showPagination);
            }));
            // also initialize (render) the pagination component
            this.renderPagination();
            this._isPaginationInitialized = true;
        }
        this.cd.detectChanges();
    }
    /** Load the Editor Collection asynchronously and replace the "collection" property when Observable resolves */
    loadEditorCollectionAsync(column) {
        const collectionAsync = column && column.editor && column.editor.collectionAsync;
        if (collectionAsync instanceof Observable) {
            this.subscriptions.push(collectionAsync.subscribe((resolvedCollection) => this.updateEditorCollection(column, resolvedCollection)));
        }
        else if (collectionAsync instanceof Promise) {
            // wait for the "collectionAsync", once resolved we will save it into the "collection"
            // the collectionAsync can be of 3 types HttpClient, HttpFetch or a Promise
            collectionAsync.then((response) => {
                if (Array.isArray(response)) {
                    this.updateEditorCollection(column, response); // from Promise
                }
            });
        }
    }
    /** Load any possible Columns Grid Presets */
    loadColumnPresetsWhenDatasetInitialized() {
        // if user entered some Columns "presets", we need to reflect them all in the grid
        if (this.gridOptions.presets && Array.isArray(this.gridOptions.presets.columns) && this.gridOptions.presets.columns.length > 0) {
            const gridColumns = this.gridStateService.getAssociatedGridColumns(this.slickGrid, this.gridOptions.presets.columns);
            if (gridColumns && Array.isArray(gridColumns) && gridColumns.length > 0) {
                // make sure that the checkbox selector is also visible if it is enabled
                if (this.gridOptions.enableCheckboxSelector) {
                    const checkboxColumn = (Array.isArray(this._columnDefinitions) && this._columnDefinitions.length > 0) ? this._columnDefinitions[0] : null;
                    if (checkboxColumn && checkboxColumn.id === '_checkbox_selector' && gridColumns[0].id !== '_checkbox_selector') {
                        gridColumns.unshift(checkboxColumn);
                    }
                }
                // keep copy the original optional `width` properties optionally provided by the user.
                // We will use this when doing a resize by cell content, if user provided a `width` it won't override it.
                gridColumns.forEach(col => col.originalWidth = col.width);
                // finally set the new presets columns (including checkbox selector if need be)
                this.slickGrid.setColumns(gridColumns);
                this.sharedService.visibleColumns = gridColumns;
            }
        }
    }
    /** Load any possible Filters Grid Presets */
    loadFilterPresetsWhenDatasetInitialized() {
        if (this.gridOptions && !this.customDataView) {
            // if user entered some Filter "presets", we need to reflect them all in the DOM
            // also note that a presets of Tree Data Toggling will also call this method because Tree Data toggling does work with data filtering
            // (collapsing a parent will basically use Filter for hidding (aka collapsing) away the child underneat it)
            if (this.gridOptions.presets && (Array.isArray(this.gridOptions.presets.filters) || Array.isArray(this.gridOptions.presets?.treeData?.toggledItems))) {
                this.filterService.populateColumnFilterSearchTermPresets(this.gridOptions.presets?.filters || []);
            }
        }
    }
    /**
     * local grid, check if we need to show the Pagination
     * if so then also check if there's any presets and finally initialize the PaginationService
     * a local grid with Pagination presets will potentially have a different total of items, we'll need to get it from the DataView and update our total
     */
    loadLocalGridPagination(dataset) {
        if (this.gridOptions && this._paginationOptions) {
            this.totalItems = Array.isArray(dataset) ? dataset.length : 0;
            if (this._paginationOptions && this.dataView?.getPagingInfo) {
                const slickPagingInfo = this.dataView.getPagingInfo();
                if (slickPagingInfo?.hasOwnProperty('totalRows') && this._paginationOptions.totalItems !== slickPagingInfo.totalRows) {
                    this.totalItems = slickPagingInfo.totalRows || 0;
                }
            }
            this._paginationOptions.totalItems = this.totalItems;
            const paginationOptions = this.setPaginationOptionsWhenPresetDefined(this.gridOptions, this._paginationOptions);
            this.initializePaginationService(paginationOptions);
        }
    }
    /** Load any Row Selections into the DataView that were presets by the user */
    loadRowSelectionPresetWhenExists() {
        // if user entered some Row Selections "presets"
        const presets = this.gridOptions?.presets;
        const enableRowSelection = this.gridOptions && (this.gridOptions.enableCheckboxSelector || this.gridOptions.enableRowSelection);
        if (enableRowSelection && this.slickGrid?.getSelectionModel() && presets?.rowSelection && (Array.isArray(presets.rowSelection.gridRowIndexes) || Array.isArray(presets.rowSelection.dataContextIds))) {
            let dataContextIds = presets.rowSelection.dataContextIds;
            let gridRowIndexes = presets.rowSelection.gridRowIndexes;
            // maps the IDs to the Grid Rows and vice versa, the "dataContextIds" has precedence over the other
            if (Array.isArray(dataContextIds) && dataContextIds.length > 0) {
                gridRowIndexes = this.dataView.mapIdsToRows(dataContextIds) || [];
            }
            else if (Array.isArray(gridRowIndexes) && gridRowIndexes.length > 0) {
                dataContextIds = this.dataView.mapRowsToIds(gridRowIndexes) || [];
            }
            this.gridStateService.selectedRowDataContextIds = dataContextIds;
            // change the selected rows except UNLESS it's a Local Grid with Pagination
            // local Pagination uses the DataView and that also trigger a change/refresh
            // and we don't want to trigger 2 Grid State changes just 1
            if ((this._isLocalGrid && !this.gridOptions.enablePagination) || !this._isLocalGrid) {
                setTimeout(() => {
                    if (this.slickGrid && Array.isArray(gridRowIndexes)) {
                        this.slickGrid.setSelectedRows(gridRowIndexes);
                    }
                });
            }
        }
    }
    mergeGridOptions(gridOptions) {
        gridOptions.gridId = this.gridId;
        gridOptions.gridContainerId = `slickGridContainer-${this.gridId}`;
        // if we have a backendServiceApi and the enablePagination is undefined, we'll assume that we do want to see it, else get that defined value
        gridOptions.enablePagination = ((gridOptions.backendServiceApi && gridOptions.enablePagination === undefined) ? true : gridOptions.enablePagination) || false;
        // use jquery extend to deep merge & copy to avoid immutable properties being changed in GlobalGridOptions after a route change
        const options = $.extend(true, {}, GlobalGridOptions, this.forRootConfig, gridOptions);
        // using jQuery extend to do a deep clone has an unwanted side on objects and pageSizes but ES6 spread has other worst side effects
        // so we will just overwrite the pageSizes when needed, this is the only one causing issues so far.
        // jQuery wrote this on their docs:: On a deep extend, Object and Array are extended, but object wrappers on primitive types such as String, Boolean, and Number are not.
        if (options?.pagination && (gridOptions.enablePagination || gridOptions.backendServiceApi) && (this.forRootConfig.pagination || gridOptions.pagination)) {
            options.pagination.pageSize = gridOptions.pagination?.pageSize ?? this.forRootConfig.pagination?.pageSize ?? GlobalGridOptions.pagination.pageSize;
            options.pagination.pageSizes = gridOptions.pagination?.pageSizes ?? this.forRootConfig.pagination?.pageSizes ?? GlobalGridOptions.pagination.pageSizes;
        }
        // also make sure to show the header row if user have enabled filtering
        this._hideHeaderRowAfterPageLoad = (options.showHeaderRow === false);
        if (options.enableFiltering && !options.showHeaderRow) {
            options.showHeaderRow = options.enableFiltering;
        }
        // when we use Pagination on Local Grid, it doesn't seem to work without enableFiltering
        // so we'll enable the filtering but we'll keep the header row hidden
        if (options && !options.enableFiltering && options.enablePagination && this._isLocalGrid) {
            options.enableFiltering = true;
            options.showHeaderRow = false;
            this._hideHeaderRowAfterPageLoad = true;
            if (this.sharedService) {
                this.sharedService.hideHeaderRowAfterPageLoad = true;
            }
        }
        return options;
    }
    /** Pre-Register any Resource that don't require SlickGrid to be instantiated (for example RxJS Resource & RowDetail) */
    preRegisterResources() {
        this._registeredResources = this.gridOptions.registerExternalResources || [];
        // Angular-Slickgrid requires RxJS, so we'll register it as the first resource
        this.registerRxJsResource(new RxJsResource());
        if (this.gridOptions.enableRowDetailView) {
            this.slickRowDetailView = new SlickRowDetailView(this.angularUtilService, this.appRef, this._eventPubSubService, this.elm.nativeElement, this.rxjs);
            this.slickRowDetailView.create(this.columnDefinitions, this.gridOptions);
            this._registeredResources.push(this.slickRowDetailView);
            this.extensionService.addExtensionToList(ExtensionName.rowDetailView, { name: ExtensionName.rowDetailView, instance: this.slickRowDetailView });
        }
    }
    registerResources() {
        // at this point, we consider all the registered services as external services, anything else registered afterward aren't external
        if (Array.isArray(this._registeredResources)) {
            this.sharedService.externalRegisteredResources = this._registeredResources;
        }
        // push all other Services that we want to be registered
        this._registeredResources.push(this.gridService, this.gridStateService);
        // when using Grouping/DraggableGrouping/Colspan register its Service
        if (this.gridOptions.createPreHeaderPanel && !this.gridOptions.enableDraggableGrouping) {
            this._registeredResources.push(this.groupingService);
        }
        // when using Tree Data View, register its Service
        if (this.gridOptions.enableTreeData) {
            this._registeredResources.push(this.treeDataService);
        }
        // when user enables translation, we need to translate Headers on first pass & subsequently in the bindDifferentHooks
        if (this.gridOptions.enableTranslate) {
            this.extensionService.translateColumnHeaders();
        }
        // also initialize (render) the empty warning component
        this.slickEmptyWarning = new SlickEmptyWarningComponent();
        this._registeredResources.push(this.slickEmptyWarning);
        // bind & initialize all Components/Services that were tagged as enabled
        // register all services by executing their init method and providing them with the Grid object
        if (Array.isArray(this._registeredResources)) {
            for (const resource of this._registeredResources) {
                if (this.slickGrid && typeof resource.init === 'function') {
                    resource.init(this.slickGrid, this.containerService);
                }
            }
        }
    }
    /** Register the RxJS Resource in all necessary services which uses */
    registerRxJsResource(resource) {
        this.rxjs = resource;
        this.backendUtilityService.addRxJsResource(this.rxjs);
        this.filterFactory.addRxJsResource(this.rxjs);
        this.filterService.addRxJsResource(this.rxjs);
        this.sortService.addRxJsResource(this.rxjs);
        this.paginationService.addRxJsResource(this.rxjs);
        this.containerService.registerInstance('RxJsResource', this.rxjs);
    }
    /**
     * Render (or dispose) the Pagination Component, user can optionally provide False (to not show it) which will in term dispose of the Pagination,
     * also while disposing we can choose to omit the disposable of the Pagination Service (if we are simply toggling the Pagination, we want to keep the Service alive)
     * @param {Boolean} showPagination - show (new render) or not (dispose) the Pagination
     * @param {Boolean} shouldDisposePaginationService - when disposing the Pagination, do we also want to dispose of the Pagination Service? (defaults to True)
     */
    renderPagination(showPagination = true) {
        if (this.gridOptions?.enablePagination && !this._isPaginationInitialized && showPagination) {
            this.slickPagination = new SlickPaginationComponent(this.paginationService, this._eventPubSubService, this.sharedService, this.translaterService);
            this.slickPagination.renderPagination(this.gridContainerElement);
            this._isPaginationInitialized = true;
        }
        else if (!showPagination) {
            if (this.slickPagination) {
                this.slickPagination.dispose();
            }
            this._isPaginationInitialized = false;
        }
    }
    /**
     * Takes a flat dataset with parent/child relationship, sort it (via its tree structure) and return the sorted flat array
     * @param {Array<Object>} flatDatasetInput - flat dataset input
     * @param {Boolean} forceGridRefresh - optionally force a full grid refresh
     * @returns {Array<Object>} sort flat parent/child dataset
     */
    sortTreeDataset(flatDatasetInput, forceGridRefresh = false) {
        const prevDatasetLn = this._currentDatasetLength;
        let sortedDatasetResult;
        let flatDatasetOutput = [];
        // if the hierarchical dataset was already initialized then no need to re-convert it, we can use it directly from the shared service ref
        if (this._isDatasetHierarchicalInitialized && this.datasetHierarchical) {
            sortedDatasetResult = this.treeDataService.sortHierarchicalDataset(this.datasetHierarchical);
            flatDatasetOutput = sortedDatasetResult.flat;
        }
        else if (Array.isArray(flatDatasetInput) && flatDatasetInput.length > 0) {
            if (this.gridOptions?.treeDataOptions?.initialSort) {
                // else we need to first convert the flat dataset to a hierarchical dataset and then sort
                sortedDatasetResult = this.treeDataService.convertFlatParentChildToTreeDatasetAndSort(flatDatasetInput, this._columnDefinitions, this.gridOptions);
                this.sharedService.hierarchicalDataset = sortedDatasetResult.hierarchical;
                flatDatasetOutput = sortedDatasetResult.flat;
            }
            else {
                // else we assume that the user provided an array that is already sorted (user's responsability)
                // and so we can simply convert the array to a tree structure and we're done, no need to sort
                this.sharedService.hierarchicalDataset = this.treeDataService.convertFlatParentChildToTreeDataset(flatDatasetInput, this.gridOptions);
                flatDatasetOutput = flatDatasetInput || [];
            }
        }
        // if we add/remove item(s) from the dataset, we need to also refresh our tree data filters
        if (flatDatasetInput.length > 0 && (forceGridRefresh || flatDatasetInput.length !== prevDatasetLn)) {
            this.filterService.refreshTreeDataFilters(flatDatasetOutput);
        }
        return flatDatasetOutput;
    }
    /**
     * For convenience to the user, we provide the property "editor" as an Angular-Slickgrid editor complex object
     * however "editor" is used internally by SlickGrid for it's own Editor Factory
     * so in our lib we will swap "editor" and copy it into a new property called "internalColumnEditor"
     * then take back "editor.model" and make it the new "editor" so that SlickGrid Editor Factory still works
     */
    swapInternalEditorToSlickGridFactoryEditor(columnDefinitions) {
        if (columnDefinitions.some(col => `${col.id}`.includes('.'))) {
            console.error('[Angular-Slickgrid] Make sure that none of your Column Definition "id" property includes a dot in its name because that will cause some problems with the Editors. For example if your column definition "field" property is "user.firstName" then use "firstName" as the column "id".');
        }
        return columnDefinitions.map((column) => {
            // on every Editor that have a "collectionAsync", resolve the data and assign it to the "collection" property
            if (column && column.editor && column.editor.collectionAsync) {
                this.loadEditorCollectionAsync(column);
            }
            return { ...column, editor: column.editor && column.editor.model, internalColumnEditor: { ...column.editor } };
        });
    }
    translateColumnHeaderTitleKeys() {
        // translate all columns (including hidden columns)
        this.extensionUtility.translateItems(this.sharedService.allColumns, 'nameKey', 'name');
    }
    translateColumnGroupKeys() {
        // translate all column groups (including hidden columns)
        this.extensionUtility.translateItems(this.sharedService.allColumns, 'columnGroupKey', 'columnGroup');
    }
    /**
     * Update the "internalColumnEditor.collection" property.
     * Since this is called after the async call resolves, the pointer will not be the same as the "column" argument passed.
     * Once we found the new pointer, we will reassign the "editor" and "collection" to the "internalColumnEditor" so it has newest collection
     */
    updateEditorCollection(column, newCollection) {
        column.editor.collection = newCollection;
        column.editor.disabled = false;
        // find the new column reference pointer & re-assign the new editor to the internalColumnEditor
        if (Array.isArray(this.columnDefinitions)) {
            const columnRef = this.columnDefinitions.find((col) => col.id === column.id);
            if (columnRef) {
                columnRef.internalColumnEditor = column.editor;
            }
        }
        // get current Editor, remove it from the DOM then re-enable it and re-render it with the new collection.
        const currentEditor = this.slickGrid.getCellEditor();
        if (currentEditor?.disable && currentEditor?.renderDomElement) {
            currentEditor.destroy();
            currentEditor.disable(false);
            currentEditor.renderDomElement(newCollection);
        }
    }
}
AngularSlickgridComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: AngularSlickgridComponent, deps: [{ token: i1.AngularUtilService }, { token: i0.ApplicationRef }, { token: i0.ChangeDetectorRef }, { token: i2.ContainerService }, { token: i0.ElementRef }, { token: i3.TranslateService, optional: true }, { token: i4.TranslaterService, optional: true }, { token: 'config' }, { token: 'externalService' }], target: i0.ɵɵFactoryTarget.Component });
AngularSlickgridComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: AngularSlickgridComponent, selector: "angular-slickgrid", inputs: { customDataView: "customDataView", gridId: "gridId", gridOptions: "gridOptions", paginationOptions: "paginationOptions", columnDefinitions: "columnDefinitions", dataset: "dataset", datasetHierarchical: "datasetHierarchical" }, outputs: { columnDefinitionsChange: "columnDefinitionsChange" }, providers: [
        // make everything transient (non-singleton)
        AngularUtilService,
        ApplicationRef,
        TranslaterService,
    ], ngImport: i0, template: "<div id=\"slickGridContainer-{{gridId}}\" class=\"gridPane\">\r\n  <div attr.id='{{gridId}}' class=\"slickgrid-container\" style=\"width: 100%\">\r\n  </div>\r\n</div>" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: AngularSlickgridComponent, decorators: [{
            type: Component,
            args: [{ selector: 'angular-slickgrid', providers: [
                        // make everything transient (non-singleton)
                        AngularUtilService,
                        ApplicationRef,
                        TranslaterService,
                    ], template: "<div id=\"slickGridContainer-{{gridId}}\" class=\"gridPane\">\r\n  <div attr.id='{{gridId}}' class=\"slickgrid-container\" style=\"width: 100%\">\r\n  </div>\r\n</div>" }]
        }], ctorParameters: function () { return [{ type: i1.AngularUtilService }, { type: i0.ApplicationRef }, { type: i0.ChangeDetectorRef }, { type: i2.ContainerService }, { type: i0.ElementRef }, { type: i3.TranslateService, decorators: [{
                    type: Optional
                }] }, { type: i4.TranslaterService, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: ['config']
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: ['externalService']
                }] }]; }, propDecorators: { customDataView: [{
                type: Input
            }], gridId: [{
                type: Input
            }], gridOptions: [{
                type: Input
            }], paginationOptions: [{
                type: Input
            }], columnDefinitions: [{
                type: Input
            }], columnDefinitionsChange: [{
                type: Output
            }], dataset: [{
                type: Input
            }], datasetHierarchical: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1zbGlja2dyaWQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2FwcC9tb2R1bGVzL2FuZ3VsYXItc2xpY2tncmlkL2NvbXBvbmVudHMvYW5ndWxhci1zbGlja2dyaWQuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2FwcC9tb2R1bGVzL2FuZ3VsYXItc2xpY2tncmlkL2NvbXBvbmVudHMvYW5ndWxhci1zbGlja2dyaWQuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLE9BQU8sK0JBQStCLENBQUM7QUFDdkMsT0FBTyx1Q0FBdUMsQ0FBQztBQUMvQyxPQUFPLCtCQUErQixDQUFDO0FBQ3ZDLE9BQU8sbUNBQW1DLENBQUM7QUFFM0MsNkJBQTZCO0FBQzdCLE9BQU8sRUFBaUIsY0FBYyxFQUFxQixTQUFTLEVBQWMsWUFBWSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQWEsUUFBUSxFQUFFLE1BQU0sR0FBRyxNQUFNLGVBQWUsQ0FBQztBQUVuSyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRWxDLE9BQU8sRUFTTCxhQUFhO0FBWWIsV0FBVztBQUNYLHFCQUFxQixFQUNyQixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLGdCQUFnQixFQUNoQixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLGFBQWEsRUFDYixnQkFBZ0IsRUFDaEIsV0FBVyxFQUNYLGdCQUFnQixFQUNoQix5QkFBeUIsRUFDekIsaUJBQWlCLEVBQ2pCLGNBQWMsRUFFZCxhQUFhLEVBQ2IsZUFBZSxFQUNmLDhCQUE4QixFQUM5QixXQUFXLEVBQ1gsZUFBZTtBQUVmLFlBQVk7QUFDWix5Q0FBeUMsRUFDekMsWUFBWSxFQUNaLGFBQWEsRUFDYixjQUFjLEdBQ2YsTUFBTSw2QkFBNkIsQ0FBQztBQUNyQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN4RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUMxRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUNwRixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUNyRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDcEUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUVyQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRXpDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzdELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRW5FLFdBQVc7QUFDWCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNyRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQzs7Ozs7O0FBZ0J0RSxNQUFNLE9BQU8seUJBQXlCO0lBOEtwQyxZQUNtQixrQkFBc0MsRUFDdEMsTUFBc0IsRUFDdEIsRUFBcUIsRUFDckIsZ0JBQWtDLEVBQ2xDLEdBQWUsRUFDSCxTQUEyQixFQUMzQixpQkFBb0MsRUFDdkMsYUFBeUIsRUFDeEIsZ0JBQTZDO1FBUnZELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFDdEIsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFDckIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxRQUFHLEdBQUgsR0FBRyxDQUFZO1FBQ0gsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFDM0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtRQUN2QyxrQkFBYSxHQUFiLGFBQWEsQ0FBWTtRQW5MN0MsMEJBQXFCLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLGtCQUFhLEdBQXNCLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRzVELGdDQUEyQixHQUFHLEtBQUssQ0FBQztRQUNwQyx1QkFBa0IsR0FBRyxLQUFLLENBQUM7UUFDM0IsMEJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBQzlCLHNDQUFpQyxHQUFHLEtBQUssQ0FBQztRQUMxQyw2QkFBd0IsR0FBRyxLQUFLLENBQUM7UUFDakMsaUJBQVksR0FBRyxJQUFJLENBQUM7UUFFcEIseUJBQW9CLEdBQXVCLEVBQUUsQ0FBQztRQUd0RCx1QkFBa0IsR0FBUSxFQUFFLENBQUM7UUFLN0IsbUJBQWMsR0FBRyxLQUFLLENBQUM7UUFDdkIsZ0JBQVcsR0FBVSxFQUFFLENBQUM7UUFDeEIsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUtmLGtCQUFhLEdBQXdCLEVBQUUsQ0FBQztRQTJCL0IsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQStCN0Isd0VBQXdFO1FBQ3hFLHlFQUF5RTtRQUMvRCw0QkFBdUIsR0FBRyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWdHekQsTUFBTSxlQUFlLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUU5QyxpREFBaUQ7UUFDakQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLGdCQUFnQixFQUFFLGtCQUFrQixJQUFJLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNsSCxJQUFJLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDO1FBRXZFLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxnQkFBZ0IsRUFBRSxxQkFBcUIsSUFBSSxJQUFJLHFCQUFxQixFQUFFLENBQUM7UUFDcEcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixFQUFFLGdCQUFnQixJQUFJLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztRQUNyRixJQUFJLENBQUMsYUFBYSxHQUFHLGdCQUFnQixFQUFFLGFBQWEsSUFBSSxJQUFJLGFBQWEsRUFBRSxDQUFDO1FBQzVFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsRUFBRSxpQkFBaUIsSUFBSSxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzlHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsRUFBRSxnQkFBZ0IsSUFBSSxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzNKLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN4RyxJQUFJLENBQUMsYUFBYSxHQUFHLGdCQUFnQixFQUFFLGFBQWEsSUFBSSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBb0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUMvSyxJQUFJLENBQUMsY0FBYyxHQUFHLGdCQUFnQixFQUFFLGNBQWMsSUFBSSxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUN2RyxJQUFJLENBQUMsV0FBVyxHQUFHLGdCQUFnQixFQUFFLFdBQVcsSUFBSSxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUM5SSxJQUFJLENBQUMsZUFBZSxHQUFHLGdCQUFnQixFQUFFLGVBQWUsSUFBSSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEosSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixFQUFFLGlCQUFpQixJQUFJLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFFaEssSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixFQUFFLGdCQUFnQixJQUFJLElBQUksZ0JBQWdCLENBQ2hGLElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDLGFBQWEsRUFDbEIsSUFBSSxDQUFDLG1CQUFtQixFQUN4QixJQUFJLENBQUMsYUFBYSxFQUNsQixJQUFJLENBQUMsV0FBVyxFQUNoQixJQUFJLENBQUMsZUFBZSxFQUNwQixJQUFJLENBQUMsaUJBQWlCLENBQ3ZCLENBQUM7UUFFRixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLEVBQUUsZ0JBQWdCLElBQUksSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNwTixJQUFJLENBQUMsV0FBVyxHQUFHLGdCQUFnQixFQUFFLFdBQVcsSUFBSSxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDN04sSUFBSSxDQUFDLGVBQWUsR0FBRyxnQkFBZ0IsRUFBRSx5QkFBeUIsSUFBSSxJQUFJLHlCQUF5QixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUVySixJQUFJLENBQUMsV0FBVyxHQUFHO1lBQ2pCLElBQUksQ0FBQyxnQkFBZ0I7WUFDckIsSUFBSSxDQUFDLGdCQUFnQjtZQUNyQixJQUFJLENBQUMsYUFBYTtZQUNsQixJQUFJLENBQUMsZ0JBQWdCO1lBQ3JCLElBQUksQ0FBQyxXQUFXO1lBQ2hCLElBQUksQ0FBQyxnQkFBZ0I7WUFDckIsSUFBSSxDQUFDLGVBQWU7WUFDcEIsSUFBSSxDQUFDLGlCQUFpQjtZQUN0QixJQUFJLENBQUMsY0FBYztZQUNuQixJQUFJLENBQUMsV0FBVztZQUNoQixJQUFJLENBQUMsZUFBZTtTQUNyQixDQUFDO1FBRUYsa0RBQWtEO1FBQ2xELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNsRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNsRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLDJCQUEyQixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMxRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDdkYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNsRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNsRixDQUFDO0lBN0xELElBQ0ksaUJBQWlCO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0lBQ2pDLENBQUM7SUFDRCxJQUFJLGlCQUFpQixDQUFDLG9CQUE0QztRQUNoRSxJQUFJLG9CQUFvQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUNuRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztTQUNuSDthQUFNO1lBQ0wsSUFBSSxDQUFDLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDO1NBQ2hEO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDO1FBQ3JGLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxVQUFVLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFRCxJQUNJLGlCQUFpQixDQUFDLGlCQUEyQjtRQUMvQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUM7UUFDNUMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDM0IsSUFBSSxDQUFDLDJCQUEyQixDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDckQ7UUFDRCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDbkQ7SUFDSCxDQUFDO0lBQ0QsSUFBSSxpQkFBaUI7UUFDbkIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7SUFDakMsQ0FBQztJQU1ELElBQ0ksT0FBTztRQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqRyxDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsVUFBaUI7UUFDM0IsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDO1FBQ2pELE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMvRCxJQUFJLElBQUksR0FBRyxVQUFVLENBQUM7UUFFdEIsNEhBQTRIO1FBQzVILElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLGNBQWMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxhQUFhLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN4SyxJQUFJLENBQUMsaUNBQWlDLEdBQUcsS0FBSyxDQUFDO1lBQy9DLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsa0RBQWtEO1NBQzdHO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUV2RCw0Q0FBNEM7UUFDNUMsNEVBQTRFO1FBQzVFLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSx5QkFBeUIsSUFBSSxhQUFhLEtBQUssQ0FBQyxFQUFFO1lBQ3RFLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDbEM7SUFDSCxDQUFDO0lBRUQsSUFDSSxtQkFBbUI7UUFDckIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDO0lBQ2hELENBQUM7SUFDRCxJQUFJLG1CQUFtQixDQUFDLHNCQUF5QztRQUMvRCxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxtQkFBbUIsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNyRyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztRQUNyRCxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixHQUFHLHNCQUFzQixDQUFDO1FBRWhFLElBQUksc0JBQXNCLElBQUksSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFO1lBQ3hGLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDbkM7UUFFRCw2SUFBNkk7UUFDN0ksSUFBSSxzQkFBc0IsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsMEJBQTBCLEVBQUU7WUFDNUYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMscUJBQXFCLElBQUksSUFBSSxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLFdBQVcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1lBRTlDLDhJQUE4STtZQUM5SSxrSEFBa0g7WUFDbEgsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDZCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNuRCxJQUFJLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssaUJBQWlCLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTtvQkFDakYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2lCQUM3QztZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGlDQUFpQyxHQUFHLElBQUksQ0FBQztTQUMvQztJQUNILENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDbEIsQ0FBQztJQUVELElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBRUQsSUFBSSxvQkFBb0I7UUFDdEIsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRUQsdURBQXVEO0lBQ3ZELElBQUksb0JBQW9CO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDO0lBQ3BDLENBQUM7SUFDRCxtR0FBbUc7SUFDbkcsSUFBSSxvQkFBb0IsQ0FBQyxhQUFzQjtRQUM3QyxJQUFJLENBQUMscUJBQXFCLEdBQUcsYUFBYSxDQUFDO0lBQzdDLENBQUM7SUFDRCxJQUFJLGdDQUFnQyxDQUFDLGFBQXNCO1FBQ3pELElBQUksQ0FBQyxpQ0FBaUMsR0FBRyxhQUFhLENBQUM7SUFDekQsQ0FBQztJQUVELElBQUksbUJBQW1CO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDO0lBQ25DLENBQUM7SUE4RUQsZUFBZTtRQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ2hELE1BQU0sSUFBSSxLQUFLLENBQUMsc0tBQXNLLENBQUMsQ0FBQztTQUN6TDtRQUNELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFFL0IsMkZBQTJGO1FBQzNGLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLDZCQUE2QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3JHLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQzVDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDbkQ7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELE9BQU8sQ0FBQyw4QkFBOEIsR0FBRyxLQUFLO1FBQzVDLDBCQUEwQjtRQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQVksRUFBRSxFQUFFO1lBQ3hDLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7Z0JBQzlCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNuQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFFdEIsNENBQTRDO1FBQzVDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRTtZQUM1QyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMzQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2pELElBQUksUUFBUSxFQUFFLE9BQU8sRUFBRTtvQkFDckIsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2lCQUNwQjthQUNGO1lBQ0QsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztTQUNoQztRQUVELHlCQUF5QjtRQUN6QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsZUFBZSxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBRWhDLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUU7WUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUNyQztRQUNELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxjQUFjLEVBQUUsQ0FBQztRQUMzQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDakIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDNUI7WUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO2dCQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3pCO1NBQ0Y7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFO1lBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7U0FDeEQ7UUFFRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUMxQixLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7Z0JBQ3RELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQStCLENBQUMsQ0FBQzthQUNoRTtZQUNELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7U0FDcEM7UUFDRCxLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDckQsSUFBSSxDQUFDLGlCQUF5QixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztTQUM5QztRQUNELEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDakQsSUFBSSxDQUFDLGFBQXFCLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQzFDO1FBRUQsK0VBQStFO1FBQy9FLElBQUksOEJBQThCLEVBQUU7WUFDbEMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7U0FDOUI7UUFFRCwwQ0FBMEM7UUFDMUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXhELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLENBQUM7UUFDckMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMscUJBQXFCLEdBQUcsU0FBUyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBZ0IsQ0FBQztJQUNwQyxDQUFDO0lBRUQscUJBQXFCO1FBQ25CLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsZUFBZSxJQUFJLE9BQU8sQ0FBQztRQUNyRSxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxlQUFlLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7O09BR0c7SUFDSCwyQ0FBMkMsQ0FBQyxXQUF1QjtRQUNqRSxNQUFNLFVBQVUsR0FBRyxXQUFXLElBQUksV0FBVyxDQUFDLGlCQUFpQixDQUFDO1FBQ2hFLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUU7WUFDcEMsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1lBRTdDLG1HQUFtRztZQUNuRyxJQUFJLE9BQU8saUJBQWlCLENBQUMsY0FBYyxLQUFLLFVBQVUsRUFBRTtnQkFDMUQsVUFBVSxDQUFDLG1CQUFtQixHQUFHLENBQUMsYUFBa0IsRUFBRSxFQUFFO29CQUN0RCxNQUFNLFdBQVcsR0FBRyxDQUFDLFVBQVUsSUFBSSxpQkFBaUIsSUFBSSxPQUFPLGlCQUFpQixDQUFDLGNBQWMsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDMUosSUFBSSxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO3dCQUNwQyxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUUsYUFBcUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBRSxhQUFxQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDakssTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFFLGFBQXFCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUUsYUFBcUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDO3dCQUN4TCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUM7cUJBQzdDO2dCQUNILENBQUMsQ0FBQzthQUNIO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsY0FBYyxDQUFDLFlBQStCO1FBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUNyRCxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUVsQyxzSkFBc0o7UUFDdEosSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsNkJBQTZCLEtBQUssU0FBUyxFQUFFO1lBQzVQLElBQUksQ0FBQyxXQUFXLENBQUMsNkJBQTZCLEdBQUcsSUFBSSxDQUFDO1NBQ3ZEO1FBRUQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsU0FBUyxDQUFDO1FBQzdHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFN0Qsd0dBQXdHO1FBQ3hHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQztRQUN2RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFDOUQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUM7UUFDN0QsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLG1FQUFtRTtRQUVoSCxJQUFJLENBQUMsMkNBQTJDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRW5FLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3hCLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQztZQUM1RyxJQUFJLGVBQWUsR0FBbUIsRUFBRSxhQUFhLEVBQUUscUJBQXFCLEVBQUUsQ0FBQztZQUUvRSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUU7Z0JBQ3pFLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLDhCQUE4QixFQUFFLENBQUM7Z0JBQ3RFLElBQUksQ0FBQyxhQUFhLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDO2dCQUM5RSxlQUFlLEdBQUcsRUFBRSxHQUFHLGVBQWUsRUFBRSx5QkFBeUIsRUFBRSxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQzthQUNyRztZQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN0RTtRQUVELHdHQUF3RztRQUN4RyxvSUFBb0k7UUFDcEksSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFFNUIsOEdBQThHO1FBQzlHLCtFQUErRTtRQUMvRSxvR0FBb0c7UUFDcEcsMEdBQTBHO1FBQzFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsMENBQTBDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFbkcsZ0hBQWdIO1FBQ2hILElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyw0QkFBNEIsRUFBRTtZQUNqRCx5Q0FBeUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQ25IO1FBRUQsOEVBQThFO1FBQzlFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUN4RCxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFFNUQsc0lBQXNJO1FBQ3RJLG1JQUFtSTtRQUNuSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FDckIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBeUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDMUcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDdkMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM3RCxDQUFDLENBQUMsQ0FDSCxDQUFDO1FBRUYsbUdBQW1HO1FBQ25HLCtJQUErSTtRQUMvSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsa0NBQWtDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVwRywyRkFBMkY7UUFDM0YsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7WUFDckMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ2pGO1FBRUQsOEZBQThGO1FBQzlGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3BJLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDNUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM5QyxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBK0IsQ0FBQztRQUVuRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUNoRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV6RSwrSUFBK0k7UUFDL0ksTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRyxJQUFJLGlCQUFpQixJQUFJLENBQUMsSUFBSSxpQkFBaUIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFO1lBQ2pGLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztTQUNoRztRQUVELHVEQUF1RDtRQUN2RCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUV6QixnQ0FBZ0M7UUFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV0QixzRUFBc0U7UUFDdEUscU5BQXFOO1FBQ3JOLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQzdCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLG9CQUFzQyxDQUFDLENBQUM7U0FDdkY7UUFFRCxvR0FBb0c7UUFDcEcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUNoSixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNwSixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUMxRDtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDekMsMEhBQTBIO1lBQzFILE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM5RyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGNBQWMsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUM3RixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRTFCLDRHQUE0RztZQUM1RyxtREFBbUQ7WUFDbkQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUFFLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsRUFBRTtnQkFDekosbUlBQW1JO2dCQUNuSSxpSEFBaUg7Z0JBQ2pILElBQUksZ0NBQWdDLEdBQUcsS0FBSyxDQUFDO2dCQUM3QyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLHFDQUFxQyxDQUFDLEVBQUU7b0JBQ3pILGdDQUFnQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLG1DQUE4QyxDQUFDO2lCQUM3RztnQkFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDO2dCQUN0RSxJQUFJLE9BQU8saUJBQWlCLEtBQUssU0FBUyxFQUFFO29CQUMxQyxJQUFJLHFCQUFxQixHQUFHLGlCQUFpQixDQUFDO29CQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTt3QkFDdEIsK0lBQStJO3dCQUMvSSxxQkFBcUIsR0FBRyxpQkFBaUIsSUFBSSxnQ0FBZ0MsQ0FBQztxQkFDL0U7b0JBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7aUJBQ3hFO3FCQUFNLElBQUksT0FBTyxpQkFBaUIsS0FBSyxRQUFRLEVBQUU7b0JBQ2hELElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsaUJBQWlCLENBQUMsK0JBQStCLENBQUMsQ0FBQztpQkFDdEk7YUFDRjtZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7WUFDMUYsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFO2dCQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLEVBQUU7b0JBQ25ILElBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDO2lCQUN6QztnQkFDRCxJQUFJLENBQUMsdUNBQXVDLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQzthQUNuQztTQUNGO1FBRUQsNkZBQTZGO1FBQzdGLHlHQUF5RztRQUN6RyxJQUFJLElBQUksQ0FBQywyQkFBMkIsRUFBRTtZQUNwQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDO1NBQ2xGO1FBRUQsb0NBQW9DO1FBQ3BDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVsRSxpRUFBaUU7UUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDeEIsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3BFO1FBRUQsK0NBQStDO1FBQy9DLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdEQscUZBQXFGO1FBQ3JGLDREQUE0RDtRQUM1RCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUU7WUFDdkMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNyRDtRQUVELHNEQUFzRDtRQUN0RCw0RkFBNEY7UUFDNUYscUpBQXFKO1FBQ3JKLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQzNELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzNCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUM7UUFFRCxJQUFJLENBQUMscUJBQXFCLEdBQUc7WUFDM0IsZ0NBQWdDO1lBQ2hDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDekIsVUFBVSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxhQUFhO1lBRWhELGlCQUFpQjtZQUNqQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBRWhDLGdEQUFnRDtZQUNoRCxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxPQUFPO1lBQzVELGtCQUFrQixFQUFFLElBQUksQ0FBQyxtQkFBbUI7WUFDNUMsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2pDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0I7WUFDdkMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtZQUN2QyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQ3JDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0I7WUFDdkMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjtZQUN6QyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZTtTQUN0QyxDQUFBO1FBRUQscURBQXFEO1FBQ3JELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVEOzs7T0FHRztJQUNILGlCQUFpQixDQUFDLFVBQTZCO1FBQzdDLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLDBCQUEwQixFQUFFLElBQUksS0FBSyxDQUFDO1FBQ2hHLElBQUksQ0FBQywwQkFBMEIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO1lBQ25ILElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3BDO1FBQ0QsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxVQUFVLENBQUM7UUFDNUMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3RCLElBQUksUUFBUSxLQUFLLFNBQVMsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO2dCQUN0RCxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDO2FBQ2pFO1NBQ0Y7UUFDRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLG9CQUFvQixFQUFFO1lBQ3JELE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLFVBQVUsRUFBRTtZQUMvRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFO1NBQ3ZELENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7T0FHRztJQUNILGVBQWUsQ0FBQyxPQUFjLEVBQUUsVUFBbUI7UUFDakQsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsNkJBQTZCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNoRyxNQUFNLGVBQWUsR0FBRyxVQUFVLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUNyRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ25EO1FBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUU7WUFDdkUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMscUJBQXFCLElBQUksSUFBSSxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRTtnQkFDM0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUN4QjtZQUVELElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUU7b0JBQy9CLElBQUksQ0FBQyx1Q0FBdUMsRUFBRSxDQUFDO29CQUUvQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLEVBQUU7d0JBQzNDLElBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDO3FCQUN6QztpQkFDRjtnQkFDRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO2FBQ25DO1lBRUQsSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQzthQUM3QjtZQUVELHNLQUFzSztZQUN0SyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUUxTCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLGlCQUFpQixFQUFFO2dCQUNsRyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxrQkFBZ0MsQ0FBQyxDQUFDO2dCQUM5SCxrRkFBa0Y7Z0JBQ2xGLDJFQUEyRTtnQkFDM0UsTUFBTSxZQUFZLEdBQUcsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDMUcsSUFBSSxZQUFZLEtBQUssU0FBUyxJQUFJLFlBQVksS0FBSyxJQUFJLENBQUMsVUFBVSxFQUFFO29CQUNsRSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsWUFBWSxDQUFDO2lCQUNqQztnQkFFRCwyRkFBMkY7Z0JBQzNGLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUU7b0JBQ2xDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2lCQUNyRDtxQkFBTTtvQkFDTCxtREFBbUQ7b0JBQ25ELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQzFEO2FBQ0Y7WUFFRCxvSUFBb0k7WUFDcEksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3ZELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztnQkFDL0UsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQzdDO1NBQ0Y7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gscUNBQXFDLENBQUMsV0FBdUIsRUFBRSxpQkFBNkI7UUFDMUYsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQVUsSUFBSSxpQkFBaUIsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtZQUMxRixpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO1lBQ3JFLGlCQUFpQixDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7U0FDMUU7UUFDRCxPQUFPLGlCQUFpQixDQUFDO0lBQzNCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsMkJBQTJCLENBQUMsb0JBQThCO1FBQ3hELHVFQUF1RTtRQUN2RSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsMENBQTBDLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUU3RixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztTQUMzRTthQUFNO1lBQ0wsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3ZFO1FBRUQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLHFCQUFxQixFQUFFO1lBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDbEM7YUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsb0NBQW9DLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSwwQkFBMEIsRUFBRTtZQUNwSCxJQUFJLENBQUMsY0FBYyxDQUFDLDBCQUEwQixFQUFFLENBQUM7U0FDbEQ7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsYUFBYSxDQUFDLE9BQU8sR0FBRyxJQUFJO1FBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RELElBQUksT0FBTyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDL0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDbkQ7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQsRUFBRTtJQUNGLG9CQUFvQjtJQUNwQixxQkFBcUI7SUFFckI7OztPQUdHO0lBQ0sseUJBQXlCLENBQUMsaUJBQTJCO1FBQzNELGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxXQUFXLEdBQUcsSUFBSTtRQUNoRCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVPLGtCQUFrQixDQUFDLElBQWUsRUFBRSxXQUF1QixFQUFFLFFBQXVCO1FBQzFGLHdFQUF3RTtRQUN4RSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFO1lBQ2hDLHFFQUFxRTtZQUNyRSxJQUFJLFdBQVcsQ0FBQyxlQUFlLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7YUFDakM7WUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDekMsMEZBQTBGO2dCQUMxRixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBRXJELElBQUksV0FBVyxDQUFDLGVBQWUsRUFBRTtvQkFDL0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixFQUFFLENBQUM7b0JBQy9DLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO29CQUN0QyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztvQkFDaEMsSUFBSSxXQUFXLENBQUMsb0JBQW9CLElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEVBQUU7d0JBQzVFLElBQUksQ0FBQyxlQUFlLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztxQkFDcEQ7aUJBQ0Y7WUFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDO1NBQ0g7UUFFRCx3SUFBd0k7UUFDeEksSUFBSSxXQUFXLENBQUMsaUJBQWlCLEVBQUU7WUFDakMsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixDQUFDO1lBRWpELElBQUksVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7Z0JBQzdCLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUN6RztTQUNGO1FBRUQsSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO1lBQ3BCLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSwyQkFBMkIsSUFBSSxFQUFFLENBQUM7WUFFakYsZ0RBQWdEO1lBQ2hELEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxFQUFFO2dCQUN2QixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDdEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLDhCQUE4QixDQUFDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO29CQUMxRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBRSxJQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7d0JBQ2hFLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDakcsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7YUFDRjtZQUVELG9EQUFvRDtZQUNwRCxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRTtnQkFDM0IsSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzFELElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFFLFFBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7d0JBQ3BFLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLDhCQUE4QixDQUFDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO3dCQUM5RyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztvQkFDckcsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7YUFDRjtZQUVELGdFQUFnRTtZQUNoRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV4QyxJQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBQ3BCLDhFQUE4RTtnQkFDOUUsSUFBSSxXQUFXLENBQUMsYUFBYSxFQUFFO29CQUM3Qix3RUFBd0U7b0JBQ3hFLElBQUksV0FBVyxDQUFDLGlCQUFpQixJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRTt3QkFDbkYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDMUM7eUJBQU07d0JBQ0wsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3hDO2lCQUNGO2dCQUVELCtFQUErRTtnQkFDL0UsSUFBSSxXQUFXLENBQUMsZUFBZSxFQUFFO29CQUMvQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFOUIsdUVBQXVFO29CQUN2RSxJQUFJLFdBQVcsQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRTt3QkFDckYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDOUM7eUJBQU07d0JBQ0wsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDNUM7aUJBQ0Y7Z0JBRUQseURBQXlEO2dCQUN6RCxJQUFJLENBQUMsdUNBQXVDLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLHVDQUF1QyxFQUFFLENBQUM7Z0JBRS9DLHFIQUFxSDtnQkFDckgsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtvQkFDNUQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUNsQixJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDcEcsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFO29CQUNuRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFFcEYsbUhBQW1IO29CQUNuSCxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1Q0FBdUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLG9DQUFvQyxDQUFDLEVBQUU7d0JBQzdJLElBQUksQ0FBQyxjQUFjLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLDhCQUE4QixDQUFDLENBQUM7cUJBQ25HO2dCQUNILENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksV0FBVyxFQUFFLGVBQWUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRTtvQkFDcEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRTt3QkFDaEUsd0dBQXdHO3dCQUN4RyxrSEFBa0g7d0JBQ2xILDhHQUE4Rzt3QkFDOUcsSUFBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUN4RCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7eUJBQ2Y7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7YUFDRjtTQUNGO1FBRUQsd0ZBQXdGO1FBQ3hGLElBQUksV0FBVyxJQUFJLFdBQVcsQ0FBQyxlQUFlLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDLGVBQWUsRUFBRTtZQUMxRyxRQUFRLENBQUMsZUFBZSxHQUFHLENBQUMsU0FBaUIsRUFBRSxFQUFFO2dCQUMvQyxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQzFCLElBQUksV0FBVyxDQUFDLGVBQWUsSUFBSSxXQUFXLENBQUMsZUFBZSxFQUFFO29CQUM5RCxjQUFjLEdBQUcsV0FBVyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7aUJBQzNFO2dCQUNELE9BQU8sY0FBYyxDQUFDO1lBQ3hCLENBQUMsQ0FBQztTQUNIO0lBQ0gsQ0FBQztJQUVPLDRCQUE0QixDQUFDLFdBQXVCO1FBQzFELE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztRQUNqRCxNQUFNLGlCQUFpQixHQUFHLFVBQVUsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQzNELE1BQU0sY0FBYyxHQUF5QixpQkFBaUIsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzlFLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLElBQUksY0FBYyxDQUFDLGNBQWMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVyTSxJQUFJLGlCQUFpQixFQUFFO1lBQ3JCLHVHQUF1RztZQUN2Ryw4RUFBOEU7WUFDOUUsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRTtnQkFDdEMsb0JBQW9CO2dCQUNwQixJQUFJLGlCQUFpQixDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDM0gsaUJBQWlCLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNwRTtnQkFDRCxvQkFBb0I7Z0JBQ3BCLElBQUksaUJBQWlCLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUMzSCwrR0FBK0c7b0JBQy9HLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDN0gsaUJBQWlCLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDekQ7Z0JBQ0QsdUJBQXVCO2dCQUN2QixJQUFJLGlCQUFpQixDQUFDLGdCQUFnQixJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO29CQUN4RSxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO29CQUNoRSxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQzFEO2FBQ0Y7aUJBQU07Z0JBQ0wsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUM1RCxJQUFJLGFBQWEsSUFBSSxpQkFBaUIsQ0FBQyxhQUFhLEVBQUU7b0JBQ3BELGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ3ZEO2FBQ0Y7WUFFRCx3Q0FBd0M7WUFDeEMsSUFBSSxVQUFVLElBQUksaUJBQWlCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLHNCQUFzQixDQUFDLEVBQUU7Z0JBQ3BGLE1BQU0sS0FBSyxHQUFHLENBQUMsT0FBTyxpQkFBaUIsQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pHLE1BQU0sT0FBTyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO2dCQUUvSix5SEFBeUg7Z0JBQ3pILFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ2QsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQThDLENBQUM7b0JBRWxGLHVFQUF1RTtvQkFDdkUsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFFN0IseURBQXlEO29CQUN6RCxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUU7d0JBQ3pCLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztxQkFDekI7b0JBRUQsNkNBQTZDO29CQUM3QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLElBQUksQ0FBQyxDQUFDO29CQUNqRSxJQUFJLE9BQU8sWUFBWSxPQUFPLEVBQUU7d0JBQzlCLE9BQU87NkJBQ0osSUFBSSxDQUFDLENBQUMsYUFBa0IsRUFBRSxFQUFFLENBQUMscUJBQXFCLENBQUMsK0JBQStCLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7NkJBQ3JJLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO3FCQUM5RTt5QkFBTSxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDdEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQ3BCLE9BQTJCLENBQUMsU0FBUyxDQUFDOzRCQUNyQyxJQUFJLEVBQUUsQ0FBQyxhQUFrQixFQUFFLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQywrQkFBK0IsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUM7NEJBQ3JJLEtBQUssRUFBRSxDQUFDLEtBQVUsRUFBRSxFQUFFLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUM7eUJBQy9FLENBQUMsQ0FDSCxDQUFDO3FCQUNIO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0o7U0FDRjtJQUNILENBQUM7SUFFTyxjQUFjLENBQUMsSUFBZSxFQUFFLE9BQW1CO1FBQ3pELElBQUksQ0FBQyxPQUFPLENBQUMseUJBQXlCLElBQUksT0FBTyxDQUFDLHVDQUF1QyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLElBQUksT0FBTyxDQUFDLG9DQUFvQyxDQUFDLEVBQUU7WUFDN0ssTUFBTSxJQUFJLEtBQUssQ0FBQyxnVkFBZ1YsQ0FBQyxDQUFDO1NBQ25XO1FBRUQsNENBQTRDO1FBQzVDLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyx5QkFBeUIsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7WUFDOUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ3hCO1FBRUQscUNBQXFDO1FBQ3JDLElBQUksT0FBTyxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFO1lBQzNDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztTQUM3RjthQUFNO1lBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNsQztRQUNELElBQUksT0FBTyxDQUFDLGdCQUFnQixFQUFFO1lBQzVCLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyx5QkFBeUIsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7Z0JBQzlFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQzthQUN4QjtTQUNGO0lBQ0gsQ0FBQztJQUVPLDJCQUEyQixDQUFDLEtBQWdCLEVBQUUsV0FBdUI7UUFDM0UsOEVBQThFO1FBQzlFLElBQUksV0FBVyxDQUFDLGFBQWEsRUFBRTtZQUM3QixJQUFJLFdBQVcsQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNyRSwrR0FBK0c7Z0JBQy9HLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDN0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDL0M7U0FDRjtJQUNILENBQUM7SUFFRCxvSEFBb0g7SUFDNUcsd0JBQXdCLENBQUMsdUJBQStCLEVBQUUsY0FBc0I7UUFDdEYsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGNBQWMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHO1lBQ2IsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1lBQ3JCLE9BQU8sRUFBRSxJQUFJLElBQUksRUFBRTtZQUNuQixTQUFTLEVBQUUsdUJBQXVCO1lBQ2xDLGNBQWM7U0FDZixDQUFDO1FBQ0YsNkRBQTZEO1FBQzdELElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQ3pDO1FBRUQsb0dBQW9HO1FBQ3BHLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLDZCQUE2QixFQUFFO1lBQ3hFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyx1QkFBdUIsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUM3RDtJQUNILENBQUM7SUFFTywyQkFBMkIsQ0FBQyxpQkFBNkI7UUFDL0QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxjQUFjLEdBQUc7Z0JBQ3BCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDN0IsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjthQUMxQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ3BELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FDckIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLGlCQUFvQyxFQUFFLEVBQUU7Z0JBQ2pHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzVDLENBQUMsQ0FBQyxFQUNGLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsK0JBQStCLEVBQUUsQ0FBQyxVQUFnQyxFQUFFLEVBQUU7Z0JBQ3ZHLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxFQUFFLE9BQU8sSUFBSSxLQUFLLENBQUM7Z0JBQ25ELElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBRTtvQkFDdkMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLHFCQUFxQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDckU7Z0JBQ0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QyxDQUFDLENBQUMsQ0FDSCxDQUFDO1lBQ0Ysb0RBQW9EO1lBQ3BELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7U0FDdEM7UUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCwrR0FBK0c7SUFDdkcseUJBQXlCLENBQUMsTUFBYztRQUM5QyxNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSyxNQUFNLENBQUMsTUFBdUIsQ0FBQyxlQUFlLENBQUM7UUFDbkcsSUFBSSxlQUFlLFlBQVksVUFBVSxFQUFFO1lBQ3pDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUNyQixlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUMzRyxDQUFDO1NBQ0g7YUFBTSxJQUFJLGVBQWUsWUFBWSxPQUFPLEVBQUU7WUFDN0Msc0ZBQXNGO1lBQ3RGLDJFQUEyRTtZQUMzRSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBcUIsRUFBRSxFQUFFO2dCQUM3QyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxlQUFlO2lCQUMvRDtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRUQsNkNBQTZDO0lBQ3JDLHVDQUF1QztRQUM3QyxrRkFBa0Y7UUFDbEYsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlILE1BQU0sV0FBVyxHQUFhLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9ILElBQUksV0FBVyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZFLHdFQUF3RTtnQkFDeEUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixFQUFFO29CQUMzQyxNQUFNLGNBQWMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQzFJLElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxFQUFFLEtBQUssb0JBQW9CLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxvQkFBb0IsRUFBRTt3QkFDOUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztxQkFDckM7aUJBQ0Y7Z0JBRUQsc0ZBQXNGO2dCQUN0Rix5R0FBeUc7Z0JBQ3pHLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFMUQsK0VBQStFO2dCQUMvRSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEdBQUcsV0FBVyxDQUFDO2FBQ2pEO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsNkNBQTZDO0lBQ3JDLHVDQUF1QztRQUM3QyxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQzVDLGdGQUFnRjtZQUNoRixxSUFBcUk7WUFDckksMkdBQTJHO1lBQzNHLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BKLElBQUksQ0FBQyxhQUFhLENBQUMscUNBQXFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQ25HO1NBQ0Y7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLHVCQUF1QixDQUFDLE9BQWU7UUFDN0MsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUMvQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRTtnQkFDM0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDdEQsSUFBSSxlQUFlLEVBQUUsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEtBQUssZUFBZSxDQUFDLFNBQVMsRUFBRTtvQkFDcEgsSUFBSSxDQUFDLFVBQVUsR0FBRyxlQUFlLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQztpQkFDbEQ7YUFDRjtZQUNELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNyRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2hILElBQUksQ0FBQywyQkFBMkIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3JEO0lBQ0gsQ0FBQztJQUVELDhFQUE4RTtJQUN0RSxnQ0FBZ0M7UUFDdEMsZ0RBQWdEO1FBQ2hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDO1FBQzFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2hJLElBQUksa0JBQWtCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLE9BQU8sRUFBRSxZQUFZLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUU7WUFDcE0sSUFBSSxjQUFjLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUM7WUFDekQsSUFBSSxjQUFjLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUM7WUFFekQsbUdBQW1HO1lBQ25HLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDOUQsY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNuRTtpQkFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3JFLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDbkU7WUFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLEdBQUcsY0FBYyxDQUFDO1lBRWpFLDJFQUEyRTtZQUMzRSw0RUFBNEU7WUFDNUUsMkRBQTJEO1lBQzNELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbkYsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDZCxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRTt3QkFDbkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7cUJBQ2hEO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0o7U0FDRjtJQUNILENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxXQUF1QjtRQUM5QyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDakMsV0FBVyxDQUFDLGVBQWUsR0FBRyxzQkFBc0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWxFLDRJQUE0STtRQUM1SSxXQUFXLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsSUFBSSxXQUFXLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQUksS0FBSyxDQUFDO1FBRTlKLCtIQUErSDtRQUMvSCxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQWUsQ0FBQztRQUVyRyxtSUFBbUk7UUFDbkksbUdBQW1HO1FBQ25HLHlLQUF5SztRQUN6SyxJQUFJLE9BQU8sRUFBRSxVQUFVLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLElBQUksV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDdkosT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLFVBQVUsRUFBRSxRQUFRLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxJQUFJLGlCQUFpQixDQUFDLFVBQVcsQ0FBQyxRQUFRLENBQUM7WUFDcEosT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLFVBQVUsRUFBRSxTQUFTLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsU0FBUyxJQUFJLGlCQUFpQixDQUFDLFVBQVcsQ0FBQyxTQUFTLENBQUM7U0FDeko7UUFFRCx1RUFBdUU7UUFDdkUsSUFBSSxDQUFDLDJCQUEyQixHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsS0FBSyxLQUFLLENBQUMsQ0FBQztRQUNyRSxJQUFJLE9BQU8sQ0FBQyxlQUFlLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQ3JELE9BQU8sQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQztTQUNqRDtRQUVELHdGQUF3RjtRQUN4RixxRUFBcUU7UUFDckUsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3hGLE9BQU8sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1lBQzlCLElBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUM7WUFDeEMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUN0QixJQUFJLENBQUMsYUFBYSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQzthQUN0RDtTQUNGO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELHdIQUF3SDtJQUNoSCxvQkFBb0I7UUFDMUIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMseUJBQXlCLElBQUksRUFBRSxDQUFDO1FBRTdFLDhFQUE4RTtRQUM5RSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxZQUFZLEVBQWdCLENBQUMsQ0FBQztRQUU1RCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUU7WUFDeEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwSixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxFQUFFLElBQUksRUFBRSxhQUFhLENBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1NBQ2pKO0lBQ0gsQ0FBQztJQUVPLGlCQUFpQjtRQUN2QixrSUFBa0k7UUFDbEksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO1lBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDO1NBQzVFO1FBRUQsd0RBQXdEO1FBQ3hELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUV4RSxxRUFBcUU7UUFDckUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRTtZQUN0RixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUN0RDtRQUVELGtEQUFrRDtRQUNsRCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFO1lBQ25DLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ3REO1FBRUQscUhBQXFIO1FBQ3JILElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUU7WUFDcEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixFQUFFLENBQUM7U0FDaEQ7UUFFRCx1REFBdUQ7UUFDdkQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksMEJBQTBCLEVBQUUsQ0FBQztRQUMxRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRXZELHdFQUF3RTtRQUN4RSwrRkFBK0Y7UUFDL0YsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO1lBQzVDLEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUNoRCxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksT0FBTyxRQUFRLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtvQkFDekQsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUN0RDthQUNGO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsc0VBQXNFO0lBQzlELG9CQUFvQixDQUFDLFFBQW9CO1FBQy9DLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxJQUFJO1FBQzVDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsSUFBSSxjQUFjLEVBQUU7WUFDMUYsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLHdCQUF3QixDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNsSixJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxvQkFBbUMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7U0FDdEM7YUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQzFCLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNoQztZQUNELElBQUksQ0FBQyx3QkFBd0IsR0FBRyxLQUFLLENBQUM7U0FDdkM7SUFDSCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxlQUFlLENBQUksZ0JBQXFCLEVBQUUsZ0JBQWdCLEdBQUcsS0FBSztRQUN4RSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUM7UUFDakQsSUFBSSxtQkFBbUIsQ0FBQztRQUN4QixJQUFJLGlCQUFpQixHQUFVLEVBQUUsQ0FBQztRQUVsQyx3SUFBd0k7UUFDeEksSUFBSSxJQUFJLENBQUMsaUNBQWlDLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQ3RFLG1CQUFtQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDN0YsaUJBQWlCLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDO1NBQzlDO2FBQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN6RSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRTtnQkFDbEQseUZBQXlGO2dCQUN6RixtQkFBbUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLDBDQUEwQyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ25KLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUMsWUFBWSxDQUFDO2dCQUMxRSxpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7YUFDOUM7aUJBQU07Z0JBQ0wsZ0dBQWdHO2dCQUNoRyw2RkFBNkY7Z0JBQzdGLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxtQ0FBbUMsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3RJLGlCQUFpQixHQUFHLGdCQUFnQixJQUFJLEVBQUUsQ0FBQzthQUM1QztTQUNGO1FBRUQsMkZBQTJGO1FBQzNGLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsRUFBRTtZQUNsRyxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDOUQ7UUFFRCxPQUFPLGlCQUFpQixDQUFDO0lBQzNCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLDBDQUEwQyxDQUFDLGlCQUEyQjtRQUM1RSxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQzVELE9BQU8sQ0FBQyxLQUFLLENBQUMsd1JBQXdSLENBQUMsQ0FBQztTQUN6UztRQUVELE9BQU8saUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBb0IsRUFBRSxFQUFFO1lBQ3BELDZHQUE2RztZQUM3RyxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFO2dCQUM1RCxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDeEM7WUFDRCxPQUFPLEVBQUUsR0FBRyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1FBQ2pILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLDhCQUE4QjtRQUNwQyxtREFBbUQ7UUFDbkQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekYsQ0FBQztJQUVPLHdCQUF3QjtRQUM5Qix5REFBeUQ7UUFDekQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUN2RyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLHNCQUFzQixDQUFVLE1BQWlCLEVBQUUsYUFBa0I7UUFDMUUsTUFBTSxDQUFDLE1BQXVCLENBQUMsVUFBVSxHQUFHLGFBQWEsQ0FBQztRQUMxRCxNQUFNLENBQUMsTUFBdUIsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWpELCtGQUErRjtRQUMvRixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDekMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckYsSUFBSSxTQUFTLEVBQUU7Z0JBQ2IsU0FBUyxDQUFDLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxNQUFzQixDQUFDO2FBQ2hFO1NBQ0Y7UUFFRCx5R0FBeUc7UUFDekcsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQXdDLENBQUM7UUFDM0YsSUFBSSxhQUFhLEVBQUUsT0FBTyxJQUFJLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRTtZQUM3RCxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDeEIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QixhQUFhLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDL0M7SUFDSCxDQUFDOzt1SEFseUNVLHlCQUF5Qiw4UUFzTDFCLFFBQVEsYUFDUixpQkFBaUI7MkdBdkxoQix5QkFBeUIseVZBUHpCO1FBQ1QsNENBQTRDO1FBQzVDLGtCQUFrQjtRQUNsQixjQUFjO1FBQ2QsaUJBQWlCO0tBQ2xCLDBCQ3ZGSCx5S0FHTTs0RkRzRk8seUJBQXlCO2tCQVZyQyxTQUFTOytCQUNFLG1CQUFtQixhQUVsQjt3QkFDVCw0Q0FBNEM7d0JBQzVDLGtCQUFrQjt3QkFDbEIsY0FBYzt3QkFDZCxpQkFBaUI7cUJBQ2xCOzswQkFzTEUsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQ1IsTUFBTTsyQkFBQyxRQUFROzswQkFDZixNQUFNOzJCQUFDLGlCQUFpQjs0Q0FoSWxCLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csTUFBTTtzQkFBZCxLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBR0YsaUJBQWlCO3NCQURwQixLQUFLO2dCQWVGLGlCQUFpQjtzQkFEcEIsS0FBSztnQkFnQkksdUJBQXVCO3NCQUFoQyxNQUFNO2dCQUdILE9BQU87c0JBRFYsS0FBSztnQkEwQkYsbUJBQW1CO3NCQUR0QixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IDNyZCBwYXJ0eSB2ZW5kb3IgbGlic1xyXG5pbXBvcnQgJ3NsaWNrZ3JpZC9kaXN0L3NsaWNrLmNvcmUubWluJztcclxuaW1wb3J0ICdzbGlja2dyaWQvZGlzdC9zbGljay5pbnRlcmFjdGlvbnMubWluJztcclxuaW1wb3J0ICdzbGlja2dyaWQvZGlzdC9zbGljay5ncmlkLm1pbic7XHJcbmltcG9ydCAnc2xpY2tncmlkL2Rpc3Qvc2xpY2suZGF0YXZpZXcubWluJztcclxuXHJcbi8vIC4uLnRoZW4gZXZlcnl0aGluZyBlbHNlLi4uXHJcbmltcG9ydCB7IEFmdGVyVmlld0luaXQsIEFwcGxpY2F0aW9uUmVmLCBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEluamVjdCwgSW5wdXQsIE9uRGVzdHJveSwgT3B0aW9uYWwsIE91dHB1dCwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgVHJhbnNsYXRlU2VydmljZSB9IGZyb20gJ0BuZ3gtdHJhbnNsYXRlL2NvcmUnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcblxyXG5pbXBvcnQge1xyXG4gIC8vIGludGVyZmFjZXMvdHlwZXNcclxuICBBdXRvY29tcGxldGVyRWRpdG9yLFxyXG4gIEJhY2tlbmRTZXJ2aWNlQXBpLFxyXG4gIEJhY2tlbmRTZXJ2aWNlT3B0aW9uLFxyXG4gIENvbHVtbixcclxuICBDb2x1bW5FZGl0b3IsXHJcbiAgRGF0YVZpZXdPcHRpb24sXHJcbiAgRXZlbnRTdWJzY3JpcHRpb24sXHJcbiAgRXh0ZW5zaW9uTmFtZSxcclxuICBFeHRlcm5hbFJlc291cmNlLFxyXG4gIExvY2FsZSxcclxuICBNZXRyaWNzLFxyXG4gIFBhZ2luYXRpb24sXHJcbiAgU2VsZWN0RWRpdG9yLFxyXG4gIFNlcnZpY2VQYWdpbmF0aW9uLFxyXG4gIFNsaWNrRGF0YVZpZXcsXHJcbiAgU2xpY2tFdmVudEhhbmRsZXIsXHJcbiAgU2xpY2tHcmlkLFxyXG4gIFNsaWNrTmFtZXNwYWNlLFxyXG5cclxuICAvLyBzZXJ2aWNlc1xyXG4gIEJhY2tlbmRVdGlsaXR5U2VydmljZSxcclxuICBDb2xsZWN0aW9uU2VydmljZSxcclxuICBFdmVudE5hbWluZ1N0eWxlLFxyXG4gIEV4dGVuc2lvblNlcnZpY2UsXHJcbiAgRXh0ZW5zaW9uVXRpbGl0eSxcclxuICBGaWx0ZXJGYWN0b3J5LFxyXG4gIEZpbHRlclNlcnZpY2UsXHJcbiAgR3JpZEV2ZW50U2VydmljZSxcclxuICBHcmlkU2VydmljZSxcclxuICBHcmlkU3RhdGVTZXJ2aWNlLFxyXG4gIEdyb3VwaW5nQW5kQ29sc3BhblNlcnZpY2UsXHJcbiAgUGFnaW5hdGlvblNlcnZpY2UsXHJcbiAgUmVzaXplclNlcnZpY2UsXHJcbiAgUnhKc0ZhY2FkZSxcclxuICBTaGFyZWRTZXJ2aWNlLFxyXG4gIFNsaWNrZ3JpZENvbmZpZyxcclxuICBTbGlja0dyb3VwSXRlbU1ldGFkYXRhUHJvdmlkZXIsXHJcbiAgU29ydFNlcnZpY2UsXHJcbiAgVHJlZURhdGFTZXJ2aWNlLFxyXG5cclxuICAvLyB1dGlsaXRpZXNcclxuICBhdXRvQWRkRWRpdG9yRm9ybWF0dGVyVG9Db2x1bW5zV2l0aEVkaXRvcixcclxuICBlbXB0eUVsZW1lbnQsXHJcbiAgR3JpZFN0YXRlVHlwZSxcclxuICB1bnN1YnNjcmliZUFsbCxcclxufSBmcm9tICdAc2xpY2tncmlkLXVuaXZlcnNhbC9jb21tb24nO1xyXG5pbXBvcnQgeyBFdmVudFB1YlN1YlNlcnZpY2UgfSBmcm9tICdAc2xpY2tncmlkLXVuaXZlcnNhbC9ldmVudC1wdWItc3ViJztcclxuaW1wb3J0IHsgU2xpY2tFbXB0eVdhcm5pbmdDb21wb25lbnQgfSBmcm9tICdAc2xpY2tncmlkLXVuaXZlcnNhbC9lbXB0eS13YXJuaW5nLWNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFNsaWNrRm9vdGVyQ29tcG9uZW50IH0gZnJvbSAnQHNsaWNrZ3JpZC11bml2ZXJzYWwvY3VzdG9tLWZvb3Rlci1jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBTbGlja1BhZ2luYXRpb25Db21wb25lbnQgfSBmcm9tICdAc2xpY2tncmlkLXVuaXZlcnNhbC9wYWdpbmF0aW9uLWNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFJ4SnNSZXNvdXJjZSB9IGZyb20gJ0BzbGlja2dyaWQtdW5pdmVyc2FsL3J4anMtb2JzZXJ2YWJsZSc7XHJcbmltcG9ydCB7IGRlcXVhbCB9IGZyb20gJ2RlcXVhbC9saXRlJztcclxuXHJcbmltcG9ydCB7IENvbnN0YW50cyB9IGZyb20gJy4uL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7IEFuZ3VsYXJHcmlkSW5zdGFuY2UsIEV4dGVybmFsVGVzdGluZ0RlcGVuZGVuY2llcywgR3JpZE9wdGlvbiwgfSBmcm9tICcuLy4uL21vZGVscy9pbmRleCc7XHJcbmltcG9ydCB7IEdsb2JhbEdyaWRPcHRpb25zIH0gZnJvbSAnLi8uLi9nbG9iYWwtZ3JpZC1vcHRpb25zJztcclxuaW1wb3J0IHsgVHJhbnNsYXRlclNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy90cmFuc2xhdGVyLnNlcnZpY2UnO1xyXG5cclxuLy8gU2VydmljZXNcclxuaW1wb3J0IHsgQW5ndWxhclV0aWxTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvYW5ndWxhclV0aWwuc2VydmljZSc7XHJcbmltcG9ydCB7IFNsaWNrUm93RGV0YWlsVmlldyB9IGZyb20gJy4uL2V4dGVuc2lvbnMvc2xpY2tSb3dEZXRhaWxWaWV3JztcclxuaW1wb3J0IHsgQ29udGFpbmVyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2NvbnRhaW5lci5zZXJ2aWNlJztcclxuXHJcbi8vIHVzaW5nIGV4dGVybmFsIG5vbi10eXBlZCBqcyBsaWJyYXJpZXNcclxuZGVjbGFyZSBjb25zdCBTbGljazogU2xpY2tOYW1lc3BhY2U7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2FuZ3VsYXItc2xpY2tncmlkJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vYW5ndWxhci1zbGlja2dyaWQuY29tcG9uZW50Lmh0bWwnLFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAgLy8gbWFrZSBldmVyeXRoaW5nIHRyYW5zaWVudCAobm9uLXNpbmdsZXRvbilcclxuICAgIEFuZ3VsYXJVdGlsU2VydmljZSxcclxuICAgIEFwcGxpY2F0aW9uUmVmLFxyXG4gICAgVHJhbnNsYXRlclNlcnZpY2UsXHJcbiAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgQW5ndWxhclNsaWNrZ3JpZENvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XHJcbiAgcHJpdmF0ZSBfZGF0YXNldD86IGFueVtdIHwgbnVsbDtcclxuICBwcml2YXRlIF9jb2x1bW5EZWZpbml0aW9ucyE6IENvbHVtbltdO1xyXG4gIHByaXZhdGUgX2N1cnJlbnREYXRhc2V0TGVuZ3RoID0gMDtcclxuICBwcml2YXRlIF9ldmVudEhhbmRsZXI6IFNsaWNrRXZlbnRIYW5kbGVyID0gbmV3IFNsaWNrLkV2ZW50SGFuZGxlcigpO1xyXG4gIHByaXZhdGUgX2V2ZW50UHViU3ViU2VydmljZSE6IEV2ZW50UHViU3ViU2VydmljZTtcclxuICBwcml2YXRlIF9hbmd1bGFyR3JpZEluc3RhbmNlczogQW5ndWxhckdyaWRJbnN0YW5jZSB8IHVuZGVmaW5lZDtcclxuICBwcml2YXRlIF9oaWRlSGVhZGVyUm93QWZ0ZXJQYWdlTG9hZCA9IGZhbHNlO1xyXG4gIHByaXZhdGUgX2lzR3JpZEluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBfaXNEYXRhc2V0SW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICBwcml2YXRlIF9pc0RhdGFzZXRIaWVyYXJjaGljYWxJbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gIHByaXZhdGUgX2lzUGFnaW5hdGlvbkluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBfaXNMb2NhbEdyaWQgPSB0cnVlO1xyXG4gIHByaXZhdGUgX3BhZ2luYXRpb25PcHRpb25zOiBQYWdpbmF0aW9uIHwgdW5kZWZpbmVkO1xyXG4gIHByaXZhdGUgX3JlZ2lzdGVyZWRSZXNvdXJjZXM6IEV4dGVybmFsUmVzb3VyY2VbXSA9IFtdO1xyXG4gIGRhdGFWaWV3ITogU2xpY2tEYXRhVmlldztcclxuICBzbGlja0dyaWQhOiBTbGlja0dyaWQ7XHJcbiAgZ3JvdXBpbmdEZWZpbml0aW9uOiBhbnkgPSB7fTtcclxuICBncm91cEl0ZW1NZXRhZGF0YVByb3ZpZGVyPzogU2xpY2tHcm91cEl0ZW1NZXRhZGF0YVByb3ZpZGVyO1xyXG4gIGJhY2tlbmRTZXJ2aWNlQXBpPzogQmFja2VuZFNlcnZpY2VBcGk7XHJcbiAgbG9jYWxlcyE6IExvY2FsZTtcclxuICBtZXRyaWNzPzogTWV0cmljcztcclxuICBzaG93UGFnaW5hdGlvbiA9IGZhbHNlO1xyXG4gIHNlcnZpY2VMaXN0OiBhbnlbXSA9IFtdO1xyXG4gIHRvdGFsSXRlbXMgPSAwO1xyXG4gIHBhZ2luYXRpb25EYXRhPzoge1xyXG4gICAgZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb247XHJcbiAgICBwYWdpbmF0aW9uU2VydmljZTogUGFnaW5hdGlvblNlcnZpY2U7XHJcbiAgfTtcclxuICBzdWJzY3JpcHRpb25zOiBFdmVudFN1YnNjcmlwdGlvbltdID0gW107XHJcblxyXG4gIC8vIGNvbXBvbmVudHMgLyBwbHVnaW5zXHJcbiAgc2xpY2tFbXB0eVdhcm5pbmc/OiBTbGlja0VtcHR5V2FybmluZ0NvbXBvbmVudDtcclxuICBzbGlja0Zvb3Rlcj86IFNsaWNrRm9vdGVyQ29tcG9uZW50O1xyXG4gIHNsaWNrUGFnaW5hdGlvbj86IFNsaWNrUGFnaW5hdGlvbkNvbXBvbmVudDtcclxuICBzbGlja1Jvd0RldGFpbFZpZXc/OiBTbGlja1Jvd0RldGFpbFZpZXc7XHJcblxyXG4gIC8vIHNlcnZpY2VzXHJcbiAgYmFja2VuZFV0aWxpdHlTZXJ2aWNlITogQmFja2VuZFV0aWxpdHlTZXJ2aWNlO1xyXG4gIGNvbGxlY3Rpb25TZXJ2aWNlOiBDb2xsZWN0aW9uU2VydmljZTtcclxuICBleHRlbnNpb25TZXJ2aWNlOiBFeHRlbnNpb25TZXJ2aWNlO1xyXG4gIGV4dGVuc2lvblV0aWxpdHk6IEV4dGVuc2lvblV0aWxpdHk7XHJcbiAgZmlsdGVyRmFjdG9yeSE6IEZpbHRlckZhY3Rvcnk7XHJcbiAgZmlsdGVyU2VydmljZTogRmlsdGVyU2VydmljZTtcclxuICBncmlkRXZlbnRTZXJ2aWNlOiBHcmlkRXZlbnRTZXJ2aWNlO1xyXG4gIGdyaWRTZXJ2aWNlOiBHcmlkU2VydmljZTtcclxuICBncmlkU3RhdGVTZXJ2aWNlOiBHcmlkU3RhdGVTZXJ2aWNlO1xyXG4gIGdyb3VwaW5nU2VydmljZTogR3JvdXBpbmdBbmRDb2xzcGFuU2VydmljZTtcclxuICBwYWdpbmF0aW9uU2VydmljZTogUGFnaW5hdGlvblNlcnZpY2U7XHJcbiAgcmVzaXplclNlcnZpY2UhOiBSZXNpemVyU2VydmljZTtcclxuICByeGpzPzogUnhKc0ZhY2FkZTtcclxuICBzaGFyZWRTZXJ2aWNlOiBTaGFyZWRTZXJ2aWNlO1xyXG4gIHNvcnRTZXJ2aWNlOiBTb3J0U2VydmljZTtcclxuICB0cmVlRGF0YVNlcnZpY2U6IFRyZWVEYXRhU2VydmljZTtcclxuXHJcbiAgQElucHV0KCkgY3VzdG9tRGF0YVZpZXc6IGFueTtcclxuICBASW5wdXQoKSBncmlkSWQ6IHN0cmluZyA9ICcnO1xyXG4gIEBJbnB1dCgpIGdyaWRPcHRpb25zITogR3JpZE9wdGlvbjtcclxuXHJcbiAgQElucHV0KClcclxuICBnZXQgcGFnaW5hdGlvbk9wdGlvbnMoKTogUGFnaW5hdGlvbiB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGFnaW5hdGlvbk9wdGlvbnM7XHJcbiAgfVxyXG4gIHNldCBwYWdpbmF0aW9uT3B0aW9ucyhuZXdQYWdpbmF0aW9uT3B0aW9uczogUGFnaW5hdGlvbiB8IHVuZGVmaW5lZCkge1xyXG4gICAgaWYgKG5ld1BhZ2luYXRpb25PcHRpb25zICYmIHRoaXMuX3BhZ2luYXRpb25PcHRpb25zKSB7XHJcbiAgICAgIHRoaXMuX3BhZ2luYXRpb25PcHRpb25zID0geyAuLi50aGlzLmdyaWRPcHRpb25zLnBhZ2luYXRpb24sIC4uLnRoaXMuX3BhZ2luYXRpb25PcHRpb25zLCAuLi5uZXdQYWdpbmF0aW9uT3B0aW9ucyB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fcGFnaW5hdGlvbk9wdGlvbnMgPSBuZXdQYWdpbmF0aW9uT3B0aW9ucztcclxuICAgIH1cclxuICAgIHRoaXMuZ3JpZE9wdGlvbnMucGFnaW5hdGlvbiA9IHRoaXMuX3BhZ2luYXRpb25PcHRpb25zID8/IHRoaXMuZ3JpZE9wdGlvbnMucGFnaW5hdGlvbjtcclxuICAgIHRoaXMucGFnaW5hdGlvblNlcnZpY2UudXBkYXRlVG90YWxJdGVtcyh0aGlzLmdyaWRPcHRpb25zLnBhZ2luYXRpb24/LnRvdGFsSXRlbXMgPz8gMCwgdHJ1ZSk7XHJcbiAgfVxyXG5cclxuICBASW5wdXQoKVxyXG4gIHNldCBjb2x1bW5EZWZpbml0aW9ucyhjb2x1bW5EZWZpbml0aW9uczogQ29sdW1uW10pIHtcclxuICAgIHRoaXMuX2NvbHVtbkRlZmluaXRpb25zID0gY29sdW1uRGVmaW5pdGlvbnM7XHJcbiAgICBpZiAodGhpcy5faXNHcmlkSW5pdGlhbGl6ZWQpIHtcclxuICAgICAgdGhpcy51cGRhdGVDb2x1bW5EZWZpbml0aW9uc0xpc3QoY29sdW1uRGVmaW5pdGlvbnMpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbHVtbkRlZmluaXRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5jb3B5Q29sdW1uV2lkdGhzUmVmZXJlbmNlKGNvbHVtbkRlZmluaXRpb25zKTtcclxuICAgIH1cclxuICB9XHJcbiAgZ2V0IGNvbHVtbkRlZmluaXRpb25zKCk6IENvbHVtbltdIHtcclxuICAgIHJldHVybiB0aGlzLl9jb2x1bW5EZWZpbml0aW9ucztcclxuICB9XHJcblxyXG4gIC8vIG1ha2UgdGhlIGNvbHVtbkRlZmluaXRpb25zIGEgMi13YXkgYmluZGluZyBzbyB0aGF0IHBsdWdpbiBhZGRpbmcgY29sc1xyXG4gIC8vIGFyZSBzeW5jaGVkIG9uIHVzZXIncyBzaWRlIGFzIHdlbGwgKFJvd01vdmUsIFJvd0RldGFpbCwgUm93U2VsZWN0aW9ucylcclxuICBAT3V0cHV0KCkgY29sdW1uRGVmaW5pdGlvbnNDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyKHRydWUpO1xyXG5cclxuICBASW5wdXQoKVxyXG4gIGdldCBkYXRhc2V0KCk6IGFueVtdIHtcclxuICAgIHJldHVybiAodGhpcy5jdXN0b21EYXRhVmlldyA/IHRoaXMuc2xpY2tHcmlkPy5nZXREYXRhPy4oKSA6IHRoaXMuZGF0YVZpZXc/LmdldEl0ZW1zPy4oKSkgfHwgW107XHJcbiAgfVxyXG4gIHNldCBkYXRhc2V0KG5ld0RhdGFzZXQ6IGFueVtdKSB7XHJcbiAgICBjb25zdCBwcmV2RGF0YXNldExuID0gdGhpcy5fY3VycmVudERhdGFzZXRMZW5ndGg7XHJcbiAgICBjb25zdCBpc0RhdGFzZXRFcXVhbCA9IGRlcXVhbChuZXdEYXRhc2V0LCB0aGlzLl9kYXRhc2V0IHx8IFtdKTtcclxuICAgIGxldCBkYXRhID0gbmV3RGF0YXNldDtcclxuXHJcbiAgICAvLyB3aGVuIFRyZWUgRGF0YSBpcyBlbmFibGVkIGFuZCB3ZSBkb24ndCB5ZXQgaGF2ZSB0aGUgaGllcmFyY2hpY2FsIGRhdGFzZXQgZmlsbGVkLCB3ZSBjYW4gZm9yY2UgYSBjb252ZXJ0K3NvcnQgb2YgdGhlIGFycmF5XHJcbiAgICBpZiAodGhpcy5zbGlja0dyaWQgJiYgdGhpcy5ncmlkT3B0aW9ucz8uZW5hYmxlVHJlZURhdGEgJiYgQXJyYXkuaXNBcnJheShuZXdEYXRhc2V0KSAmJiAobmV3RGF0YXNldC5sZW5ndGggPiAwIHx8IG5ld0RhdGFzZXQubGVuZ3RoICE9PSBwcmV2RGF0YXNldExuIHx8ICFpc0RhdGFzZXRFcXVhbCkpIHtcclxuICAgICAgdGhpcy5faXNEYXRhc2V0SGllcmFyY2hpY2FsSW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICAgICAgZGF0YSA9IHRoaXMuc29ydFRyZWVEYXRhc2V0KG5ld0RhdGFzZXQsICFpc0RhdGFzZXRFcXVhbCk7IC8vIGlmIGRhdGFzZXQgY2hhbmdlZCwgdGhlbiBmb3JjZSBhIHJlZnJlc2ggYW55d2F5XHJcbiAgICB9XHJcbiAgICB0aGlzLl9kYXRhc2V0ID0gZGF0YTtcclxuICAgIHRoaXMucmVmcmVzaEdyaWREYXRhKGRhdGEgfHwgW10pO1xyXG4gICAgdGhpcy5fY3VycmVudERhdGFzZXRMZW5ndGggPSAobmV3RGF0YXNldCB8fCBbXSkubGVuZ3RoO1xyXG5cclxuICAgIC8vIGV4cGFuZC9hdXRvZml0IGNvbHVtbnMgb24gZmlyc3QgcGFnZSBsb2FkXHJcbiAgICAvLyB3ZSBjYW4gYXNzdW1lIHRoYXQgaWYgdGhlIHByZXZEYXRhc2V0IHdhcyBlbXB0eSB0aGVuIHdlIGFyZSBvbiBmaXJzdCBsb2FkXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9ucz8uYXV0b0ZpdENvbHVtbnNPbkZpcnN0TG9hZCAmJiBwcmV2RGF0YXNldExuID09PSAwKSB7XHJcbiAgICAgIHRoaXMuc2xpY2tHcmlkLmF1dG9zaXplQ29sdW1ucygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgQElucHV0KClcclxuICBnZXQgZGF0YXNldEhpZXJhcmNoaWNhbCgpOiBhbnlbXSB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gdGhpcy5zaGFyZWRTZXJ2aWNlLmhpZXJhcmNoaWNhbERhdGFzZXQ7XHJcbiAgfVxyXG4gIHNldCBkYXRhc2V0SGllcmFyY2hpY2FsKG5ld0hpZXJhcmNoaWNhbERhdGFzZXQ6IGFueVtdIHwgdW5kZWZpbmVkKSB7XHJcbiAgICBjb25zdCBpc0RhdGFzZXRFcXVhbCA9IGRlcXVhbChuZXdIaWVyYXJjaGljYWxEYXRhc2V0LCB0aGlzLnNoYXJlZFNlcnZpY2U/LmhpZXJhcmNoaWNhbERhdGFzZXQgPz8gW10pO1xyXG4gICAgY29uc3QgcHJldkZsYXREYXRhc2V0TG4gPSB0aGlzLl9jdXJyZW50RGF0YXNldExlbmd0aDtcclxuICAgIHRoaXMuc2hhcmVkU2VydmljZS5oaWVyYXJjaGljYWxEYXRhc2V0ID0gbmV3SGllcmFyY2hpY2FsRGF0YXNldDtcclxuXHJcbiAgICBpZiAobmV3SGllcmFyY2hpY2FsRGF0YXNldCAmJiB0aGlzLmNvbHVtbkRlZmluaXRpb25zICYmIHRoaXMuZmlsdGVyU2VydmljZT8uY2xlYXJGaWx0ZXJzKSB7XHJcbiAgICAgIHRoaXMuZmlsdGVyU2VydmljZS5jbGVhckZpbHRlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB3aGVuIGEgaGllcmFyY2hpY2FsIGRhdGFzZXQgaXMgc2V0IGFmdGVyd2FyZCwgd2UgY2FuIHJlc2V0IHRoZSBmbGF0IGRhdGFzZXQgYW5kIGNhbGwgYSB0cmVlIGRhdGEgc29ydCB0aGF0IHdpbGwgb3ZlcndyaXRlIHRoZSBmbGF0IGRhdGFzZXRcclxuICAgIGlmIChuZXdIaWVyYXJjaGljYWxEYXRhc2V0ICYmIHRoaXMuc2xpY2tHcmlkICYmIHRoaXMuc29ydFNlcnZpY2U/LnByb2Nlc3NUcmVlRGF0YUluaXRpYWxTb3J0KSB7XHJcbiAgICAgIHRoaXMuZGF0YVZpZXcuc2V0SXRlbXMoW10sIHRoaXMuZ3JpZE9wdGlvbnMuZGF0YXNldElkUHJvcGVydHlOYW1lID8/ICdpZCcpO1xyXG4gICAgICB0aGlzLnNvcnRTZXJ2aWNlLnByb2Nlc3NUcmVlRGF0YUluaXRpYWxTb3J0KCk7XHJcblxyXG4gICAgICAvLyB3ZSBhbHNvIG5lZWQgdG8gcmVzZXQvcmVmcmVzaCB0aGUgVHJlZSBEYXRhIGZpbHRlcnMgYmVjYXVzZSBpZiB3ZSBpbnNlcnRlZCBuZXcgaXRlbShzKSB0aGVuIGl0IG1pZ2h0IG5vdCBzaG93IHVwIHdpdGhvdXQgZG9pbmcgdGhpcyByZWZyZXNoXHJcbiAgICAgIC8vIGhvd2V2ZXIgd2UgbmVlZCAxIGNwdSBjeWNsZSBiZWZvcmUgaGF2aW5nIHRoZSBEYXRhVmlldyByZWZyZXNoZWQsIHNvIHdlIG5lZWQgdG8gd3JhcCB0aGlzIGNoZWNrIGluIGEgc2V0VGltZW91dFxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBjb25zdCBmbGF0RGF0YXNldExuID0gdGhpcy5kYXRhVmlldy5nZXRJdGVtQ291bnQoKTtcclxuICAgICAgICBpZiAoZmxhdERhdGFzZXRMbiA+IDAgJiYgKGZsYXREYXRhc2V0TG4gIT09IHByZXZGbGF0RGF0YXNldExuIHx8ICFpc0RhdGFzZXRFcXVhbCkpIHtcclxuICAgICAgICAgIHRoaXMuZmlsdGVyU2VydmljZS5yZWZyZXNoVHJlZURhdGFGaWx0ZXJzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5faXNEYXRhc2V0SGllcmFyY2hpY2FsSW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0IGVsZW1lbnRSZWYoKTogRWxlbWVudFJlZiB7XHJcbiAgICByZXR1cm4gdGhpcy5lbG07XHJcbiAgfVxyXG5cclxuICBnZXQgZXZlbnRIYW5kbGVyKCk6IFNsaWNrRXZlbnRIYW5kbGVyIHtcclxuICAgIHJldHVybiB0aGlzLl9ldmVudEhhbmRsZXI7XHJcbiAgfVxyXG5cclxuICBnZXQgZ3JpZENvbnRhaW5lckVsZW1lbnQoKTogSFRNTEVsZW1lbnQgfCBudWxsIHtcclxuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHt0aGlzLmdyaWRPcHRpb25zLmdyaWRDb250YWluZXJJZCB8fCAnJ31gKTtcclxuICB9XHJcblxyXG4gIC8qKiBHRVRURVIgdG8ga25vdyBpZiBkYXRhc2V0IHdhcyBpbml0aWFsaXplZCBvciBub3QgKi9cclxuICBnZXQgaXNEYXRhc2V0SW5pdGlhbGl6ZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5faXNEYXRhc2V0SW5pdGlhbGl6ZWQ7XHJcbiAgfVxyXG4gIC8qKiBTRVRURVIgdG8gY2hhbmdlIGlmIGRhdGFzZXQgd2FzIGluaXRpYWxpemVkIG9yIG5vdCAoc3RyaW5nbHkgdXNlZCBmb3IgdW5pdCB0ZXN0aW5nIHB1cnBvc2VzKSAqL1xyXG4gIHNldCBpc0RhdGFzZXRJbml0aWFsaXplZChpc0luaXRpYWxpemVkOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLl9pc0RhdGFzZXRJbml0aWFsaXplZCA9IGlzSW5pdGlhbGl6ZWQ7XHJcbiAgfVxyXG4gIHNldCBpc0RhdGFzZXRIaWVyYXJjaGljYWxJbml0aWFsaXplZChpc0luaXRpYWxpemVkOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLl9pc0RhdGFzZXRIaWVyYXJjaGljYWxJbml0aWFsaXplZCA9IGlzSW5pdGlhbGl6ZWQ7XHJcbiAgfVxyXG5cclxuICBnZXQgcmVnaXN0ZXJlZFJlc291cmNlcygpOiBFeHRlcm5hbFJlc291cmNlW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JlZ2lzdGVyZWRSZXNvdXJjZXM7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgYW5ndWxhclV0aWxTZXJ2aWNlOiBBbmd1bGFyVXRpbFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGFwcFJlZjogQXBwbGljYXRpb25SZWYsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNkOiBDaGFuZ2VEZXRlY3RvclJlZixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29udGFpbmVyU2VydmljZTogQ29udGFpbmVyU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgZWxtOiBFbGVtZW50UmVmLFxyXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSB0cmFuc2xhdGU6IFRyYW5zbGF0ZVNlcnZpY2UsXHJcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIHJlYWRvbmx5IHRyYW5zbGF0ZXJTZXJ2aWNlOiBUcmFuc2xhdGVyU2VydmljZSxcclxuICAgIEBJbmplY3QoJ2NvbmZpZycpIHByaXZhdGUgZm9yUm9vdENvbmZpZzogR3JpZE9wdGlvbixcclxuICAgIEBJbmplY3QoJ2V4dGVybmFsU2VydmljZScpIGV4dGVybmFsU2VydmljZXM6IEV4dGVybmFsVGVzdGluZ0RlcGVuZGVuY2llc1xyXG4gICkge1xyXG4gICAgY29uc3Qgc2xpY2tncmlkQ29uZmlnID0gbmV3IFNsaWNrZ3JpZENvbmZpZygpO1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgYW5kIGFzc2lnbiBhbGwgU2VydmljZSBEZXBlbmRlbmNpZXNcclxuICAgIHRoaXMuX2V2ZW50UHViU3ViU2VydmljZSA9IGV4dGVybmFsU2VydmljZXM/LmV2ZW50UHViU3ViU2VydmljZSA/PyBuZXcgRXZlbnRQdWJTdWJTZXJ2aWNlKHRoaXMuZWxtLm5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLmV2ZW50TmFtaW5nU3R5bGUgPSBFdmVudE5hbWluZ1N0eWxlLmNhbWVsQ2FzZTtcclxuXHJcbiAgICB0aGlzLmJhY2tlbmRVdGlsaXR5U2VydmljZSA9IGV4dGVybmFsU2VydmljZXM/LmJhY2tlbmRVdGlsaXR5U2VydmljZSA/PyBuZXcgQmFja2VuZFV0aWxpdHlTZXJ2aWNlKCk7XHJcbiAgICB0aGlzLmdyaWRFdmVudFNlcnZpY2UgPSBleHRlcm5hbFNlcnZpY2VzPy5ncmlkRXZlbnRTZXJ2aWNlID8/IG5ldyBHcmlkRXZlbnRTZXJ2aWNlKCk7XHJcbiAgICB0aGlzLnNoYXJlZFNlcnZpY2UgPSBleHRlcm5hbFNlcnZpY2VzPy5zaGFyZWRTZXJ2aWNlID8/IG5ldyBTaGFyZWRTZXJ2aWNlKCk7XHJcbiAgICB0aGlzLmNvbGxlY3Rpb25TZXJ2aWNlID0gZXh0ZXJuYWxTZXJ2aWNlcz8uY29sbGVjdGlvblNlcnZpY2UgPz8gbmV3IENvbGxlY3Rpb25TZXJ2aWNlKHRoaXMudHJhbnNsYXRlclNlcnZpY2UpO1xyXG4gICAgdGhpcy5leHRlbnNpb25VdGlsaXR5ID0gZXh0ZXJuYWxTZXJ2aWNlcz8uZXh0ZW5zaW9uVXRpbGl0eSA/PyBuZXcgRXh0ZW5zaW9uVXRpbGl0eSh0aGlzLnNoYXJlZFNlcnZpY2UsIHRoaXMuYmFja2VuZFV0aWxpdHlTZXJ2aWNlLCB0aGlzLnRyYW5zbGF0ZXJTZXJ2aWNlKTtcclxuICAgIHRoaXMuZmlsdGVyRmFjdG9yeSA9IG5ldyBGaWx0ZXJGYWN0b3J5KHNsaWNrZ3JpZENvbmZpZywgdGhpcy50cmFuc2xhdGVyU2VydmljZSwgdGhpcy5jb2xsZWN0aW9uU2VydmljZSk7XHJcbiAgICB0aGlzLmZpbHRlclNlcnZpY2UgPSBleHRlcm5hbFNlcnZpY2VzPy5maWx0ZXJTZXJ2aWNlID8/IG5ldyBGaWx0ZXJTZXJ2aWNlKHRoaXMuZmlsdGVyRmFjdG9yeSBhcyBhbnksIHRoaXMuX2V2ZW50UHViU3ViU2VydmljZSwgdGhpcy5zaGFyZWRTZXJ2aWNlLCB0aGlzLmJhY2tlbmRVdGlsaXR5U2VydmljZSk7XHJcbiAgICB0aGlzLnJlc2l6ZXJTZXJ2aWNlID0gZXh0ZXJuYWxTZXJ2aWNlcz8ucmVzaXplclNlcnZpY2UgPz8gbmV3IFJlc2l6ZXJTZXJ2aWNlKHRoaXMuX2V2ZW50UHViU3ViU2VydmljZSk7XHJcbiAgICB0aGlzLnNvcnRTZXJ2aWNlID0gZXh0ZXJuYWxTZXJ2aWNlcz8uc29ydFNlcnZpY2UgPz8gbmV3IFNvcnRTZXJ2aWNlKHRoaXMuc2hhcmVkU2VydmljZSwgdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLCB0aGlzLmJhY2tlbmRVdGlsaXR5U2VydmljZSk7XHJcbiAgICB0aGlzLnRyZWVEYXRhU2VydmljZSA9IGV4dGVybmFsU2VydmljZXM/LnRyZWVEYXRhU2VydmljZSA/PyBuZXcgVHJlZURhdGFTZXJ2aWNlKHRoaXMuX2V2ZW50UHViU3ViU2VydmljZSwgdGhpcy5zaGFyZWRTZXJ2aWNlLCB0aGlzLnNvcnRTZXJ2aWNlKTtcclxuICAgIHRoaXMucGFnaW5hdGlvblNlcnZpY2UgPSBleHRlcm5hbFNlcnZpY2VzPy5wYWdpbmF0aW9uU2VydmljZSA/PyBuZXcgUGFnaW5hdGlvblNlcnZpY2UodGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLCB0aGlzLnNoYXJlZFNlcnZpY2UsIHRoaXMuYmFja2VuZFV0aWxpdHlTZXJ2aWNlKTtcclxuXHJcbiAgICB0aGlzLmV4dGVuc2lvblNlcnZpY2UgPSBleHRlcm5hbFNlcnZpY2VzPy5leHRlbnNpb25TZXJ2aWNlID8/IG5ldyBFeHRlbnNpb25TZXJ2aWNlKFxyXG4gICAgICB0aGlzLmV4dGVuc2lvblV0aWxpdHksXHJcbiAgICAgIHRoaXMuZmlsdGVyU2VydmljZSxcclxuICAgICAgdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLFxyXG4gICAgICB0aGlzLnNoYXJlZFNlcnZpY2UsXHJcbiAgICAgIHRoaXMuc29ydFNlcnZpY2UsXHJcbiAgICAgIHRoaXMudHJlZURhdGFTZXJ2aWNlLFxyXG4gICAgICB0aGlzLnRyYW5zbGF0ZXJTZXJ2aWNlLFxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmdyaWRTdGF0ZVNlcnZpY2UgPSBleHRlcm5hbFNlcnZpY2VzPy5ncmlkU3RhdGVTZXJ2aWNlID8/IG5ldyBHcmlkU3RhdGVTZXJ2aWNlKHRoaXMuZXh0ZW5zaW9uU2VydmljZSwgdGhpcy5maWx0ZXJTZXJ2aWNlLCB0aGlzLl9ldmVudFB1YlN1YlNlcnZpY2UsIHRoaXMuc2hhcmVkU2VydmljZSwgdGhpcy5zb3J0U2VydmljZSwgdGhpcy50cmVlRGF0YVNlcnZpY2UpO1xyXG4gICAgdGhpcy5ncmlkU2VydmljZSA9IGV4dGVybmFsU2VydmljZXM/LmdyaWRTZXJ2aWNlID8/IG5ldyBHcmlkU2VydmljZSh0aGlzLmdyaWRTdGF0ZVNlcnZpY2UsIHRoaXMuZmlsdGVyU2VydmljZSwgdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLCB0aGlzLnBhZ2luYXRpb25TZXJ2aWNlLCB0aGlzLnNoYXJlZFNlcnZpY2UsIHRoaXMuc29ydFNlcnZpY2UsIHRoaXMudHJlZURhdGFTZXJ2aWNlKTtcclxuICAgIHRoaXMuZ3JvdXBpbmdTZXJ2aWNlID0gZXh0ZXJuYWxTZXJ2aWNlcz8uZ3JvdXBpbmdBbmRDb2xzcGFuU2VydmljZSA/PyBuZXcgR3JvdXBpbmdBbmRDb2xzcGFuU2VydmljZSh0aGlzLmV4dGVuc2lvblV0aWxpdHksIHRoaXMuX2V2ZW50UHViU3ViU2VydmljZSk7XHJcblxyXG4gICAgdGhpcy5zZXJ2aWNlTGlzdCA9IFtcclxuICAgICAgdGhpcy5jb250YWluZXJTZXJ2aWNlLFxyXG4gICAgICB0aGlzLmV4dGVuc2lvblNlcnZpY2UsXHJcbiAgICAgIHRoaXMuZmlsdGVyU2VydmljZSxcclxuICAgICAgdGhpcy5ncmlkRXZlbnRTZXJ2aWNlLFxyXG4gICAgICB0aGlzLmdyaWRTZXJ2aWNlLFxyXG4gICAgICB0aGlzLmdyaWRTdGF0ZVNlcnZpY2UsXHJcbiAgICAgIHRoaXMuZ3JvdXBpbmdTZXJ2aWNlLFxyXG4gICAgICB0aGlzLnBhZ2luYXRpb25TZXJ2aWNlLFxyXG4gICAgICB0aGlzLnJlc2l6ZXJTZXJ2aWNlLFxyXG4gICAgICB0aGlzLnNvcnRTZXJ2aWNlLFxyXG4gICAgICB0aGlzLnRyZWVEYXRhU2VydmljZSxcclxuICAgIF07XHJcblxyXG4gICAgLy8gcmVnaXN0ZXIgYWxsIFNlcnZpY2UgaW5zdGFuY2VzIGluIHRoZSBjb250YWluZXJcclxuICAgIHRoaXMuY29udGFpbmVyU2VydmljZS5yZWdpc3Rlckluc3RhbmNlKCdFeHRlbnNpb25VdGlsaXR5JywgdGhpcy5leHRlbnNpb25VdGlsaXR5KTtcclxuICAgIHRoaXMuY29udGFpbmVyU2VydmljZS5yZWdpc3Rlckluc3RhbmNlKCdGaWx0ZXJTZXJ2aWNlJywgdGhpcy5maWx0ZXJTZXJ2aWNlKTtcclxuICAgIHRoaXMuY29udGFpbmVyU2VydmljZS5yZWdpc3Rlckluc3RhbmNlKCdDb2xsZWN0aW9uU2VydmljZScsIHRoaXMuY29sbGVjdGlvblNlcnZpY2UpO1xyXG4gICAgdGhpcy5jb250YWluZXJTZXJ2aWNlLnJlZ2lzdGVySW5zdGFuY2UoJ0V4dGVuc2lvblNlcnZpY2UnLCB0aGlzLmV4dGVuc2lvblNlcnZpY2UpO1xyXG4gICAgdGhpcy5jb250YWluZXJTZXJ2aWNlLnJlZ2lzdGVySW5zdGFuY2UoJ0dyaWRFdmVudFNlcnZpY2UnLCB0aGlzLmdyaWRFdmVudFNlcnZpY2UpO1xyXG4gICAgdGhpcy5jb250YWluZXJTZXJ2aWNlLnJlZ2lzdGVySW5zdGFuY2UoJ0dyaWRTZXJ2aWNlJywgdGhpcy5ncmlkU2VydmljZSk7XHJcbiAgICB0aGlzLmNvbnRhaW5lclNlcnZpY2UucmVnaXN0ZXJJbnN0YW5jZSgnR3JpZFN0YXRlU2VydmljZScsIHRoaXMuZ3JpZFN0YXRlU2VydmljZSk7XHJcbiAgICB0aGlzLmNvbnRhaW5lclNlcnZpY2UucmVnaXN0ZXJJbnN0YW5jZSgnR3JvdXBpbmdBbmRDb2xzcGFuU2VydmljZScsIHRoaXMuZ3JvdXBpbmdTZXJ2aWNlKTtcclxuICAgIHRoaXMuY29udGFpbmVyU2VydmljZS5yZWdpc3Rlckluc3RhbmNlKCdQYWdpbmF0aW9uU2VydmljZScsIHRoaXMucGFnaW5hdGlvblNlcnZpY2UpO1xyXG4gICAgdGhpcy5jb250YWluZXJTZXJ2aWNlLnJlZ2lzdGVySW5zdGFuY2UoJ1Jlc2l6ZXJTZXJ2aWNlJywgdGhpcy5yZXNpemVyU2VydmljZSk7XHJcbiAgICB0aGlzLmNvbnRhaW5lclNlcnZpY2UucmVnaXN0ZXJJbnN0YW5jZSgnU2hhcmVkU2VydmljZScsIHRoaXMuc2hhcmVkU2VydmljZSk7XHJcbiAgICB0aGlzLmNvbnRhaW5lclNlcnZpY2UucmVnaXN0ZXJJbnN0YW5jZSgnU29ydFNlcnZpY2UnLCB0aGlzLnNvcnRTZXJ2aWNlKTtcclxuICAgIHRoaXMuY29udGFpbmVyU2VydmljZS5yZWdpc3Rlckluc3RhbmNlKCdFdmVudFB1YlN1YlNlcnZpY2UnLCB0aGlzLl9ldmVudFB1YlN1YlNlcnZpY2UpO1xyXG4gICAgdGhpcy5jb250YWluZXJTZXJ2aWNlLnJlZ2lzdGVySW5zdGFuY2UoJ1B1YlN1YlNlcnZpY2UnLCB0aGlzLl9ldmVudFB1YlN1YlNlcnZpY2UpO1xyXG4gICAgdGhpcy5jb250YWluZXJTZXJ2aWNlLnJlZ2lzdGVySW5zdGFuY2UoJ1RyYW5zbGF0ZXJTZXJ2aWNlJywgdGhpcy50cmFuc2xhdGVyU2VydmljZSk7XHJcbiAgICB0aGlzLmNvbnRhaW5lclNlcnZpY2UucmVnaXN0ZXJJbnN0YW5jZSgnVHJlZURhdGFTZXJ2aWNlJywgdGhpcy50cmVlRGF0YVNlcnZpY2UpO1xyXG4gIH1cclxuXHJcbiAgbmdBZnRlclZpZXdJbml0KCkge1xyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zIHx8ICF0aGlzLmNvbHVtbkRlZmluaXRpb25zKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVXNpbmcgYDxhbmd1bGFyLXNsaWNrZ3JpZD5gIHJlcXVpcmVzIFtncmlkT3B0aW9uc10gYW5kIFtjb2x1bW5EZWZpbml0aW9uc10sIGl0IHNlZW1zIHRoYXQgeW91IG1pZ2h0IGhhdmUgZm9yZ290IHRvIHByb3ZpZGUgdGhlbSBzaW5jZSBhdCBsZWFzdCBvZiB0aGVtIGlzIHVuZGVmaW5lZC4nKTtcclxuICAgIH1cclxuICAgIHRoaXMuaW5pdGlhbGl6YXRpb24odGhpcy5fZXZlbnRIYW5kbGVyKTtcclxuICAgIHRoaXMuX2lzR3JpZEluaXRpYWxpemVkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyByZWNoZWNrIHRoZSBlbXB0eSB3YXJuaW5nIG1lc3NhZ2UgYWZ0ZXIgZ3JpZCBpcyBzaG93biBzbyB0aGF0IGl0IHdvcmtzIGluIGV2ZXJ5IHVzZSBjYXNlXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9ucyAmJiB0aGlzLmdyaWRPcHRpb25zLmVuYWJsZUVtcHR5RGF0YVdhcm5pbmdNZXNzYWdlICYmIEFycmF5LmlzQXJyYXkodGhpcy5kYXRhc2V0KSkge1xyXG4gICAgICBjb25zdCBmaW5hbFRvdGFsQ291bnQgPSB0aGlzLmRhdGFzZXQubGVuZ3RoO1xyXG4gICAgICB0aGlzLmRpc3BsYXlFbXB0eURhdGFXYXJuaW5nKGZpbmFsVG90YWxDb3VudCA8IDEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB0aGlzLl9ldmVudFB1YlN1YlNlcnZpY2UucHVibGlzaCgnb25CZWZvcmVHcmlkRGVzdHJveScsIHRoaXMuc2xpY2tHcmlkKTtcclxuICAgIHRoaXMuZGVzdHJveSgpO1xyXG4gICAgdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLnB1Ymxpc2goJ29uQWZ0ZXJHcmlkRGVzdHJveWVkJywgdHJ1ZSk7XHJcbiAgfVxyXG5cclxuICBkZXN0cm95KHNob3VsZEVtcHR5RG9tRWxlbWVudENvbnRhaW5lciA9IGZhbHNlKSB7XHJcbiAgICAvLyBkaXNwb3NlIG9mIGFsbCBTZXJ2aWNlc1xyXG4gICAgdGhpcy5zZXJ2aWNlTGlzdC5mb3JFYWNoKChzZXJ2aWNlOiBhbnkpID0+IHtcclxuICAgICAgaWYgKHNlcnZpY2UgJiYgc2VydmljZS5kaXNwb3NlKSB7XHJcbiAgICAgICAgc2VydmljZS5kaXNwb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5zZXJ2aWNlTGlzdCA9IFtdO1xyXG5cclxuICAgIC8vIGRpc3Bvc2UgYWxsIHJlZ2lzdGVyZWQgZXh0ZXJuYWwgcmVzb3VyY2VzXHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl9yZWdpc3RlcmVkUmVzb3VyY2VzKSkge1xyXG4gICAgICB3aGlsZSAodGhpcy5fcmVnaXN0ZXJlZFJlc291cmNlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3QgcmVzb3VyY2UgPSB0aGlzLl9yZWdpc3RlcmVkUmVzb3VyY2VzLnBvcCgpO1xyXG4gICAgICAgIGlmIChyZXNvdXJjZT8uZGlzcG9zZSkge1xyXG4gICAgICAgICAgcmVzb3VyY2UuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0aGlzLl9yZWdpc3RlcmVkUmVzb3VyY2VzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGlzcG9zZSB0aGUgQ29tcG9uZW50c1xyXG4gICAgdGhpcy5zbGlja0VtcHR5V2FybmluZz8uZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5zbGlja0Zvb3Rlcj8uZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5zbGlja1BhZ2luYXRpb24/LmRpc3Bvc2UoKTtcclxuXHJcbiAgICBpZiAodGhpcy5fZXZlbnRIYW5kbGVyPy51bnN1YnNjcmliZUFsbCkge1xyXG4gICAgICB0aGlzLl9ldmVudEhhbmRsZXIudW5zdWJzY3JpYmVBbGwoKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2V2ZW50UHViU3ViU2VydmljZT8udW5zdWJzY3JpYmVBbGwoKTtcclxuICAgIGlmICh0aGlzLmRhdGFWaWV3KSB7XHJcbiAgICAgIGlmICh0aGlzLmRhdGFWaWV3Py5zZXRJdGVtcykge1xyXG4gICAgICAgIHRoaXMuZGF0YVZpZXcuc2V0SXRlbXMoW10pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmRhdGFWaWV3LmRlc3Ryb3kpIHtcclxuICAgICAgICB0aGlzLmRhdGFWaWV3LmRlc3Ryb3koKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuc2xpY2tHcmlkPy5kZXN0cm95KSB7XHJcbiAgICAgIHRoaXMuc2xpY2tHcmlkLmRlc3Ryb3koc2hvdWxkRW1wdHlEb21FbGVtZW50Q29udGFpbmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5iYWNrZW5kU2VydmljZUFwaSkge1xyXG4gICAgICBmb3IgKGNvbnN0IHByb3Agb2YgT2JqZWN0LmtleXModGhpcy5iYWNrZW5kU2VydmljZUFwaSkpIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5iYWNrZW5kU2VydmljZUFwaVtwcm9wIGFzIGtleW9mIEJhY2tlbmRTZXJ2aWNlQXBpXTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmJhY2tlbmRTZXJ2aWNlQXBpID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgZm9yIChjb25zdCBwcm9wIG9mIE9iamVjdC5rZXlzKHRoaXMuY29sdW1uRGVmaW5pdGlvbnMpKSB7XHJcbiAgICAgICh0aGlzLmNvbHVtbkRlZmluaXRpb25zIGFzIGFueSlbcHJvcF0gPSBudWxsO1xyXG4gICAgfVxyXG4gICAgZm9yIChjb25zdCBwcm9wIG9mIE9iamVjdC5rZXlzKHRoaXMuc2hhcmVkU2VydmljZSkpIHtcclxuICAgICAgKHRoaXMuc2hhcmVkU2VydmljZSBhcyBhbnkpW3Byb3BdID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyB3ZSBjb3VsZCBvcHRpb25hbGx5IGFsc28gZW1wdHkgdGhlIGNvbnRlbnQgb2YgdGhlIGdyaWQgY29udGFpbmVyIERPTSBlbGVtZW50XHJcbiAgICBpZiAoc2hvdWxkRW1wdHlEb21FbGVtZW50Q29udGFpbmVyKSB7XHJcbiAgICAgIHRoaXMuZW1wdHlHcmlkQ29udGFpbmVyRWxtKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWxzbyB1bnN1YnNjcmliZSBhbGwgUnhKUyBzdWJzY3JpcHRpb25zXHJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSB1bnN1YnNjcmliZUFsbCh0aGlzLnN1YnNjcmlwdGlvbnMpO1xyXG5cclxuICAgIHRoaXMuX2RhdGFzZXQgPSBudWxsO1xyXG4gICAgdGhpcy5kYXRhc2V0SGllcmFyY2hpY2FsID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5fY29sdW1uRGVmaW5pdGlvbnMgPSBbXTtcclxuICAgIHRoaXMuX2FuZ3VsYXJHcmlkSW5zdGFuY2VzID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5zbGlja0dyaWQgPSB1bmRlZmluZWQgYXMgYW55O1xyXG4gIH1cclxuXHJcbiAgZW1wdHlHcmlkQ29udGFpbmVyRWxtKCkge1xyXG4gICAgY29uc3QgZ3JpZENvbnRhaW5lcklkID0gdGhpcy5ncmlkT3B0aW9ucz8uZ3JpZENvbnRhaW5lcklkID8/ICdncmlkMSc7XHJcbiAgICBjb25zdCBncmlkQ29udGFpbmVyRWxtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7Z3JpZENvbnRhaW5lcklkfWApO1xyXG4gICAgZW1wdHlFbGVtZW50KGdyaWRDb250YWluZXJFbG0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVmaW5lIG91ciBpbnRlcm5hbCBQb3N0IFByb2Nlc3MgY2FsbGJhY2ssIGl0IHdpbGwgZXhlY3V0ZSBpbnRlcm5hbGx5IGFmdGVyIHdlIGdldCBiYWNrIHJlc3VsdCBmcm9tIHRoZSBQcm9jZXNzIGJhY2tlbmQgY2FsbFxyXG4gICAqIEZvciBub3csIHRoaXMgaXMgR3JhcGhRTCBTZXJ2aWNlIE9OTFkgZmVhdHVyZSBhbmQgaXQgd2lsbCBiYXNpY2FsbHkgcmVmcmVzaCB0aGUgRGF0YXNldCAmIFBhZ2luYXRpb24gd2l0aG91dCBoYXZpbmcgdGhlIHVzZXIgdG8gY3JlYXRlIGhpcyBvd24gUG9zdFByb2Nlc3MgZXZlcnkgdGltZVxyXG4gICAqL1xyXG4gIGNyZWF0ZUJhY2tlbmRBcGlJbnRlcm5hbFBvc3RQcm9jZXNzQ2FsbGJhY2soZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb24pIHtcclxuICAgIGNvbnN0IGJhY2tlbmRBcGkgPSBncmlkT3B0aW9ucyAmJiBncmlkT3B0aW9ucy5iYWNrZW5kU2VydmljZUFwaTtcclxuICAgIGlmIChiYWNrZW5kQXBpICYmIGJhY2tlbmRBcGkuc2VydmljZSkge1xyXG4gICAgICBjb25zdCBiYWNrZW5kQXBpU2VydmljZSA9IGJhY2tlbmRBcGkuc2VydmljZTtcclxuXHJcbiAgICAgIC8vIGludGVybmFsUG9zdFByb2Nlc3Mgb25seSB3b3JrcyAoZm9yIG5vdykgd2l0aCBhIEdyYXBoUUwgU2VydmljZSwgc28gbWFrZSBzdXJlIGl0IGlzIG9mIHRoYXQgdHlwZVxyXG4gICAgICBpZiAodHlwZW9mIGJhY2tlbmRBcGlTZXJ2aWNlLmdldERhdGFzZXROYW1lID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgYmFja2VuZEFwaS5pbnRlcm5hbFBvc3RQcm9jZXNzID0gKHByb2Nlc3NSZXN1bHQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZGF0YXNldE5hbWUgPSAoYmFja2VuZEFwaSAmJiBiYWNrZW5kQXBpU2VydmljZSAmJiB0eXBlb2YgYmFja2VuZEFwaVNlcnZpY2UuZ2V0RGF0YXNldE5hbWUgPT09ICdmdW5jdGlvbicpID8gYmFja2VuZEFwaVNlcnZpY2UuZ2V0RGF0YXNldE5hbWUoKSA6ICcnO1xyXG4gICAgICAgICAgaWYgKHByb2Nlc3NSZXN1bHQ/LmRhdGFbZGF0YXNldE5hbWVdKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBwcm9jZXNzUmVzdWx0LmRhdGFbZGF0YXNldE5hbWVdLmhhc093blByb3BlcnR5KCdub2RlcycpID8gKHByb2Nlc3NSZXN1bHQgYXMgYW55KS5kYXRhW2RhdGFzZXROYW1lXS5ub2RlcyA6IChwcm9jZXNzUmVzdWx0IGFzIGFueSkuZGF0YVtkYXRhc2V0TmFtZV07XHJcbiAgICAgICAgICAgIGNvbnN0IHRvdGFsQ291bnQgPSBwcm9jZXNzUmVzdWx0LmRhdGFbZGF0YXNldE5hbWVdLmhhc093blByb3BlcnR5KCd0b3RhbENvdW50JykgPyAocHJvY2Vzc1Jlc3VsdCBhcyBhbnkpLmRhdGFbZGF0YXNldE5hbWVdLnRvdGFsQ291bnQgOiAocHJvY2Vzc1Jlc3VsdCBhcyBhbnkpLmRhdGFbZGF0YXNldE5hbWVdLmxlbmd0aDtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoR3JpZERhdGEoZGF0YSwgdG90YWxDb3VudCB8fCAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpbml0aWFsaXphdGlvbihldmVudEhhbmRsZXI6IFNsaWNrRXZlbnRIYW5kbGVyKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zLnRyYW5zbGF0ZXIgPSB0aGlzLnRyYW5zbGF0ZXJTZXJ2aWNlO1xyXG4gICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gZXZlbnRIYW5kbGVyO1xyXG5cclxuICAgIC8vIHdoZW4gZGV0ZWN0aW5nIGEgZnJvemVuIGdyaWQsIHdlJ2xsIGF1dG9tYXRpY2FsbHkgZW5hYmxlIHRoZSBtb3VzZXdoZWVsIHNjcm9sbCBoYW5kbGVyIHNvIHRoYXQgd2UgY2FuIHNjcm9sbCBmcm9tIGJvdGggbGVmdC9yaWdodCBmcm96ZW4gY29udGFpbmVyc1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMgJiYgKCh0aGlzLmdyaWRPcHRpb25zLmZyb3plblJvdyAhPT0gdW5kZWZpbmVkICYmIHRoaXMuZ3JpZE9wdGlvbnMuZnJvemVuUm93ID49IDApIHx8IHRoaXMuZ3JpZE9wdGlvbnMuZnJvemVuQ29sdW1uICE9PSB1bmRlZmluZWQgJiYgdGhpcy5ncmlkT3B0aW9ucy5mcm96ZW5Db2x1bW4gPj0gMCkgJiYgdGhpcy5ncmlkT3B0aW9ucy5lbmFibGVNb3VzZVdoZWVsU2Nyb2xsSGFuZGxlciA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlTW91c2VXaGVlbFNjcm9sbEhhbmRsZXIgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2V2ZW50UHViU3ViU2VydmljZS5ldmVudE5hbWluZ1N0eWxlID0gdGhpcy5ncmlkT3B0aW9ucz8uZXZlbnROYW1pbmdTdHlsZSA/PyBFdmVudE5hbWluZ1N0eWxlLmNhbWVsQ2FzZTtcclxuICAgIHRoaXMuX2V2ZW50UHViU3ViU2VydmljZS5wdWJsaXNoKCdvbkJlZm9yZUdyaWRDcmVhdGUnLCB0cnVlKTtcclxuXHJcbiAgICAvLyBtYWtlIHN1cmUgdGhlIGRhdGFzZXQgaXMgaW5pdGlhbGl6ZWQgKGlmIG5vdCBpdCB3aWxsIHRocm93IGFuIGVycm9yIHRoYXQgaXQgY2Fubm90IGdldExlbmd0aCBvZiBudWxsKVxyXG4gICAgdGhpcy5fZGF0YXNldCA9IHRoaXMuX2RhdGFzZXQgfHwgW107XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zID0gdGhpcy5tZXJnZUdyaWRPcHRpb25zKHRoaXMuZ3JpZE9wdGlvbnMpO1xyXG4gICAgdGhpcy5fcGFnaW5hdGlvbk9wdGlvbnMgPSB0aGlzLmdyaWRPcHRpb25zPy5wYWdpbmF0aW9uO1xyXG4gICAgdGhpcy5sb2NhbGVzID0gdGhpcy5ncmlkT3B0aW9ucz8ubG9jYWxlcyA/PyBDb25zdGFudHMubG9jYWxlcztcclxuICAgIHRoaXMuYmFja2VuZFNlcnZpY2VBcGkgPSB0aGlzLmdyaWRPcHRpb25zPy5iYWNrZW5kU2VydmljZUFwaTtcclxuICAgIHRoaXMuX2lzTG9jYWxHcmlkID0gIXRoaXMuYmFja2VuZFNlcnZpY2VBcGk7IC8vIGNvbnNpZGVyZWQgYSBsb2NhbCBncmlkIGlmIGl0IGRvZXNuJ3QgaGF2ZSBhIGJhY2tlbmQgc2VydmljZSBzZXRcclxuXHJcbiAgICB0aGlzLmNyZWF0ZUJhY2tlbmRBcGlJbnRlcm5hbFBvc3RQcm9jZXNzQ2FsbGJhY2sodGhpcy5ncmlkT3B0aW9ucyk7XHJcblxyXG4gICAgaWYgKCF0aGlzLmN1c3RvbURhdGFWaWV3KSB7XHJcbiAgICAgIGNvbnN0IGRhdGF2aWV3SW5saW5lRmlsdGVycyA9IHRoaXMuZ3JpZE9wdGlvbnMuZGF0YVZpZXcgJiYgdGhpcy5ncmlkT3B0aW9ucy5kYXRhVmlldy5pbmxpbmVGaWx0ZXJzIHx8IGZhbHNlO1xyXG4gICAgICBsZXQgZGF0YVZpZXdPcHRpb25zOiBEYXRhVmlld09wdGlvbiA9IHsgaW5saW5lRmlsdGVyczogZGF0YXZpZXdJbmxpbmVGaWx0ZXJzIH07XHJcblxyXG4gICAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5kcmFnZ2FibGVHcm91cGluZyB8fCB0aGlzLmdyaWRPcHRpb25zLmVuYWJsZUdyb3VwaW5nKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cEl0ZW1NZXRhZGF0YVByb3ZpZGVyID0gbmV3IFNsaWNrR3JvdXBJdGVtTWV0YWRhdGFQcm92aWRlcigpO1xyXG4gICAgICAgIHRoaXMuc2hhcmVkU2VydmljZS5ncm91cEl0ZW1NZXRhZGF0YVByb3ZpZGVyID0gdGhpcy5ncm91cEl0ZW1NZXRhZGF0YVByb3ZpZGVyO1xyXG4gICAgICAgIGRhdGFWaWV3T3B0aW9ucyA9IHsgLi4uZGF0YVZpZXdPcHRpb25zLCBncm91cEl0ZW1NZXRhZGF0YVByb3ZpZGVyOiB0aGlzLmdyb3VwSXRlbU1ldGFkYXRhUHJvdmlkZXIgfTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmRhdGFWaWV3ID0gbmV3IFNsaWNrLkRhdGEuRGF0YVZpZXcoZGF0YVZpZXdPcHRpb25zKTtcclxuICAgICAgdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLnB1Ymxpc2goJ29uRGF0YXZpZXdDcmVhdGVkJywgdGhpcy5kYXRhVmlldyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2V0IGFueSBwb3NzaWJsZSBTZXJ2aWNlcyB0aGF0IHVzZXIgd2FudCB0byByZWdpc3RlciB3aGljaCBkb24ndCByZXF1aXJlIFNsaWNrR3JpZCB0byBiZSBpbnN0YW50aWF0ZWRcclxuICAgIC8vIFJ4SlMgUmVzb3VyY2UgaXMgaW4gdGhpcyBsb3QgYmVjYXVzZSBpdCBoYXMgdG8gYmUgcmVnaXN0ZXJlZCBiZWZvcmUgYW55dGhpbmcgZWxzZSBhbmQgZG9lc24ndCByZXF1aXJlIFNsaWNrR3JpZCB0byBiZSBpbml0aWFsaXplZFxyXG4gICAgdGhpcy5wcmVSZWdpc3RlclJlc291cmNlcygpO1xyXG5cclxuICAgIC8vIGZvciBjb252ZW5pZW5jZSB0byB0aGUgdXNlciwgd2UgcHJvdmlkZSB0aGUgcHJvcGVydHkgXCJlZGl0b3JcIiBhcyBhbiBBbmd1bGFyLVNsaWNrZ3JpZCBlZGl0b3IgY29tcGxleCBvYmplY3RcclxuICAgIC8vIGhvd2V2ZXIgXCJlZGl0b3JcIiBpcyB1c2VkIGludGVybmFsbHkgYnkgU2xpY2tHcmlkIGZvciBpdCdzIG93biBFZGl0b3IgRmFjdG9yeVxyXG4gICAgLy8gc28gaW4gb3VyIGxpYiB3ZSB3aWxsIHN3YXAgXCJlZGl0b3JcIiBhbmQgY29weSBpdCBpbnRvIGEgbmV3IHByb3BlcnR5IGNhbGxlZCBcImludGVybmFsQ29sdW1uRWRpdG9yXCJcclxuICAgIC8vIHRoZW4gdGFrZSBiYWNrIFwiZWRpdG9yLm1vZGVsXCIgYW5kIG1ha2UgaXQgdGhlIG5ldyBcImVkaXRvclwiIHNvIHRoYXQgU2xpY2tHcmlkIEVkaXRvciBGYWN0b3J5IHN0aWxsIHdvcmtzXHJcbiAgICB0aGlzLl9jb2x1bW5EZWZpbml0aW9ucyA9IHRoaXMuc3dhcEludGVybmFsRWRpdG9yVG9TbGlja0dyaWRGYWN0b3J5RWRpdG9yKHRoaXMuX2NvbHVtbkRlZmluaXRpb25zKTtcclxuXHJcbiAgICAvLyBpZiB0aGUgdXNlciB3YW50cyB0byBhdXRvbWF0aWNhbGx5IGFkZCBhIEN1c3RvbSBFZGl0b3IgRm9ybWF0dGVyLCB3ZSBuZWVkIHRvIGNhbGwgdGhlIGF1dG8gYWRkIGZ1bmN0aW9uIGFnYWluXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5hdXRvQWRkQ3VzdG9tRWRpdG9yRm9ybWF0dGVyKSB7XHJcbiAgICAgIGF1dG9BZGRFZGl0b3JGb3JtYXR0ZXJUb0NvbHVtbnNXaXRoRWRpdG9yKHRoaXMuX2NvbHVtbkRlZmluaXRpb25zLCB0aGlzLmdyaWRPcHRpb25zLmF1dG9BZGRDdXN0b21FZGl0b3JGb3JtYXR0ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNhdmUgcmVmZXJlbmNlIGZvciBhbGwgY29sdW1ucyBiZWZvcmUgdGhleSBvcHRpb25hbGx5IGJlY29tZSBoaWRkZW4vdmlzaWJsZVxyXG4gICAgdGhpcy5zaGFyZWRTZXJ2aWNlLmFsbENvbHVtbnMgPSB0aGlzLl9jb2x1bW5EZWZpbml0aW9ucztcclxuICAgIHRoaXMuc2hhcmVkU2VydmljZS52aXNpYmxlQ29sdW1ucyA9IHRoaXMuX2NvbHVtbkRlZmluaXRpb25zO1xyXG5cclxuICAgIC8vIGJlZm9yZSBjZXJ0YWluIGV4dGVudGlvbnMvcGx1Z2lucyBwb3RlbnRpYWxseSBhZGRzIGV4dHJhIGNvbHVtbnMgbm90IGNyZWF0ZWQgYnkgdGhlIHVzZXIgaXRzZWxmIChSb3dNb3ZlLCBSb3dEZXRhaWwsIFJvd1NlbGVjdGlvbnMpXHJcbiAgICAvLyB3ZSdsbCBzdWJzY3JpYmUgdG8gdGhlIGV2ZW50IGFuZCBwdXNoIGJhY2sgdGhlIGNoYW5nZSB0byB0aGUgdXNlciBzbyB0aGV5IGFsd2F5cyB1c2UgZnVsbCBjb2x1bW4gZGVmcyBhcnJheSBpbmNsdWRpbmcgZXh0cmEgY29sc1xyXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgIHRoaXMuX2V2ZW50UHViU3ViU2VydmljZS5zdWJzY3JpYmU8eyBjb2x1bW5zOiBDb2x1bW5bXTsgZ3JpZDogU2xpY2tHcmlkIH0+KCdvblBsdWdpbkNvbHVtbnNDaGFuZ2VkJywgZGF0YSA9PiB7XHJcbiAgICAgICAgdGhpcy5fY29sdW1uRGVmaW5pdGlvbnMgPSBkYXRhLmNvbHVtbnM7XHJcbiAgICAgICAgdGhpcy5jb2x1bW5EZWZpbml0aW9uc0NoYW5nZS5lbWl0KHRoaXMuX2NvbHVtbkRlZmluaXRpb25zKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgLy8gYWZ0ZXIgc3Vic2NyaWJpbmcgdG8gcG90ZW50aWFsIGNvbHVtbnMgY2hhbmdlZCwgd2UgYXJlIHJlYWR5IHRvIGNyZWF0ZSB0aGVzZSBvcHRpb25hbCBleHRlbnNpb25zXHJcbiAgICAvLyB3aGVuIHdlIGRpZCBmaW5kIHNvbWUgdG8gY3JlYXRlIChSb3dNb3ZlLCBSb3dEZXRhaWwsIFJvd1NlbGVjdGlvbnMpLCBpdCB3aWxsIGF1dG9tYXRpY2FsbHkgbW9kaWZ5IGNvbHVtbiBkZWZpbml0aW9ucyAoYnkgcHJldmlvdXMgc3Vic2NyaWJlKVxyXG4gICAgdGhpcy5leHRlbnNpb25TZXJ2aWNlLmNyZWF0ZUV4dGVuc2lvbnNCZWZvcmVHcmlkQ3JlYXRpb24odGhpcy5fY29sdW1uRGVmaW5pdGlvbnMsIHRoaXMuZ3JpZE9wdGlvbnMpO1xyXG5cclxuICAgIC8vIGlmIHVzZXIgZW50ZXJlZCBzb21lIFBpbm5pbmcvRnJvemVuIFwicHJlc2V0c1wiLCB3ZSBuZWVkIHRvIGFwcGx5IHRoZW0gaW4gdGhlIGdyaWQgb3B0aW9uc1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMucHJlc2V0cz8ucGlubmluZykge1xyXG4gICAgICB0aGlzLmdyaWRPcHRpb25zID0geyAuLi50aGlzLmdyaWRPcHRpb25zLCAuLi50aGlzLmdyaWRPcHRpb25zLnByZXNldHMucGlubmluZyB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGJ1aWxkIFNsaWNrR3JpZCBHcmlkLCBhbHNvIHVzZXIgbWlnaHQgb3B0aW9uYWxseSBwYXNzIGEgY3VzdG9tIGRhdGF2aWV3IChlLmcuIHJlbW90ZSBtb2RlbClcclxuICAgIHRoaXMuc2xpY2tHcmlkID0gbmV3IFNsaWNrLkdyaWQoYCMke3RoaXMuZ3JpZElkfWAsIHRoaXMuY3VzdG9tRGF0YVZpZXcgfHwgdGhpcy5kYXRhVmlldywgdGhpcy5fY29sdW1uRGVmaW5pdGlvbnMsIHRoaXMuZ3JpZE9wdGlvbnMpO1xyXG4gICAgdGhpcy5zaGFyZWRTZXJ2aWNlLmRhdGFWaWV3ID0gdGhpcy5kYXRhVmlldztcclxuICAgIHRoaXMuc2hhcmVkU2VydmljZS5zbGlja0dyaWQgPSB0aGlzLnNsaWNrR3JpZDtcclxuICAgIHRoaXMuc2hhcmVkU2VydmljZS5ncmlkQ29udGFpbmVyRWxlbWVudCA9IHRoaXMuZWxtLm5hdGl2ZUVsZW1lbnQgYXMgSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gICAgdGhpcy5leHRlbnNpb25TZXJ2aWNlLmJpbmREaWZmZXJlbnRFeHRlbnNpb25zKCk7XHJcbiAgICB0aGlzLmJpbmREaWZmZXJlbnRIb29rcyh0aGlzLnNsaWNrR3JpZCwgdGhpcy5ncmlkT3B0aW9ucywgdGhpcy5kYXRhVmlldyk7XHJcblxyXG4gICAgLy8gd2hlbiBpdCdzIGEgZnJvemVuIGdyaWQsIHdlIG5lZWQgdG8ga2VlcCB0aGUgZnJvemVuIGNvbHVtbiBpZCBmb3IgcmVmZXJlbmNlIGlmIHdlIGV2ZXIgc2hvdy9oaWRlIGNvbHVtbiBmcm9tIENvbHVtblBpY2tlci9HcmlkTWVudSBhZnRlcndhcmRcclxuICAgIGNvbnN0IGZyb3plbkNvbHVtbkluZGV4ID0gdGhpcy5ncmlkT3B0aW9ucy5mcm96ZW5Db2x1bW4gIT09IHVuZGVmaW5lZCA/IHRoaXMuZ3JpZE9wdGlvbnMuZnJvemVuQ29sdW1uIDogLTE7XHJcbiAgICBpZiAoZnJvemVuQ29sdW1uSW5kZXggPj0gMCAmJiBmcm96ZW5Db2x1bW5JbmRleCA8PSB0aGlzLl9jb2x1bW5EZWZpbml0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgdGhpcy5zaGFyZWRTZXJ2aWNlLmZyb3plblZpc2libGVDb2x1bW5JZCA9IHRoaXMuX2NvbHVtbkRlZmluaXRpb25zW2Zyb3plbkNvbHVtbkluZGV4XS5pZCB8fCAnJztcclxuICAgIH1cclxuXHJcbiAgICAvLyBnZXQgYW55IHBvc3NpYmxlIFNlcnZpY2VzIHRoYXQgdXNlciB3YW50IHRvIHJlZ2lzdGVyXHJcbiAgICB0aGlzLnJlZ2lzdGVyUmVzb3VyY2VzKCk7XHJcblxyXG4gICAgLy8gaW5pdGlhbGl6ZSB0aGUgU2xpY2tHcmlkIGdyaWRcclxuICAgIHRoaXMuc2xpY2tHcmlkLmluaXQoKTtcclxuXHJcbiAgICAvLyBpbml0aWFsaXplZCB0aGUgcmVzaXplciBzZXJ2aWNlIG9ubHkgYWZ0ZXIgU2xpY2tHcmlkIGlzIGluaXRpYWxpemVkXHJcbiAgICAvLyBpZiB3ZSBkb24ndCB3ZSBlbmQgdXAgYmluZGluZyBvdXIgcmVzaXplIHRvIGEgZ3JpZCBlbGVtZW50IHRoYXQgZG9lc24ndCB5ZXQgZXhpc3QgaW4gdGhlIERPTSBhbmQgdGhlIHJlc2l6ZXIgc2VydmljZSB3aWxsIGZhaWwgc2lsZW50bHkgKGJlY2F1c2UgaXQgaGFzIGEgdHJ5L2NhdGNoIHRoYXQgdW5iaW5kcyB0aGUgcmVzaXplIHdpdGhvdXQgdGhyb3dpbmcgYmFjaylcclxuICAgIGlmICh0aGlzLmdyaWRDb250YWluZXJFbGVtZW50KSB7XHJcbiAgICAgIHRoaXMucmVzaXplclNlcnZpY2UuaW5pdCh0aGlzLnNsaWNrR3JpZCwgdGhpcy5ncmlkQ29udGFpbmVyRWxlbWVudCBhcyBIVE1MRGl2RWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXNlciBjb3VsZCBzaG93IGEgY3VzdG9tIGZvb3RlciB3aXRoIHRoZSBkYXRhIG1ldHJpY3MgKGRhdGFzZXQgbGVuZ3RoIGFuZCBsYXN0IHVwZGF0ZWQgdGltZXN0YW1wKVxyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zLmVuYWJsZVBhZ2luYXRpb24gJiYgdGhpcy5ncmlkT3B0aW9ucy5zaG93Q3VzdG9tRm9vdGVyICYmIHRoaXMuZ3JpZE9wdGlvbnMuY3VzdG9tRm9vdGVyT3B0aW9ucyAmJiB0aGlzLmdyaWRDb250YWluZXJFbGVtZW50KSB7XHJcbiAgICAgIHRoaXMuc2xpY2tGb290ZXIgPSBuZXcgU2xpY2tGb290ZXJDb21wb25lbnQodGhpcy5zbGlja0dyaWQsIHRoaXMuZ3JpZE9wdGlvbnMuY3VzdG9tRm9vdGVyT3B0aW9ucywgdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLCB0aGlzLnRyYW5zbGF0ZXJTZXJ2aWNlKTtcclxuICAgICAgdGhpcy5zbGlja0Zvb3Rlci5yZW5kZXJGb290ZXIodGhpcy5ncmlkQ29udGFpbmVyRWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmN1c3RvbURhdGFWaWV3ICYmIHRoaXMuZGF0YVZpZXcpIHtcclxuICAgICAgLy8gbG9hZCB0aGUgZGF0YSBpbiB0aGUgRGF0YVZpZXcgKHVubGVzcyBpdCdzIGEgaGllcmFyY2hpY2FsIGRhdGFzZXQsIGlmIHNvIGl0IHdpbGwgYmUgbG9hZGVkIGFmdGVyIHRoZSBpbml0aWFsIHRyZWUgc29ydClcclxuICAgICAgY29uc3QgaW5pdGlhbERhdGFzZXQgPSB0aGlzLmdyaWRPcHRpb25zPy5lbmFibGVUcmVlRGF0YSA/IHRoaXMuc29ydFRyZWVEYXRhc2V0KHRoaXMuX2RhdGFzZXQpIDogdGhpcy5fZGF0YXNldDtcclxuICAgICAgdGhpcy5kYXRhVmlldy5iZWdpblVwZGF0ZSgpO1xyXG4gICAgICB0aGlzLmRhdGFWaWV3LnNldEl0ZW1zKGluaXRpYWxEYXRhc2V0IHx8IFtdLCB0aGlzLmdyaWRPcHRpb25zLmRhdGFzZXRJZFByb3BlcnR5TmFtZSA/PyAnaWQnKTtcclxuICAgICAgdGhpcy5kYXRhVmlldy5lbmRVcGRhdGUoKTtcclxuXHJcbiAgICAgIC8vIGlmIHlvdSBkb24ndCB3YW50IHRoZSBpdGVtcyB0aGF0IGFyZSBub3QgdmlzaWJsZSAoZHVlIHRvIGJlaW5nIGZpbHRlcmVkIG91dCBvciBiZWluZyBvbiBhIGRpZmZlcmVudCBwYWdlKVxyXG4gICAgICAvLyB0byBzdGF5IHNlbGVjdGVkLCBwYXNzICdmYWxzZScgdG8gdGhlIHNlY29uZCBhcmdcclxuICAgICAgaWYgKHRoaXMuc2xpY2tHcmlkPy5nZXRTZWxlY3Rpb25Nb2RlbCgpICYmIHRoaXMuZ3JpZE9wdGlvbnMgJiYgdGhpcy5ncmlkT3B0aW9ucy5kYXRhVmlldyAmJiB0aGlzLmdyaWRPcHRpb25zLmRhdGFWaWV3Lmhhc093blByb3BlcnR5KCdzeW5jR3JpZFNlbGVjdGlvbicpKSB7XHJcbiAgICAgICAgLy8gaWYgd2UgYXJlIHVzaW5nIGEgQmFja2VuZCBTZXJ2aWNlLCB3ZSB3aWxsIGRvIGFuIGV4dHJhIGZsYWcgY2hlY2ssIHRoZSByZWFzb24gaXMgYmVjYXVzZSBpdCBtaWdodCBoYXZlIHNvbWUgdW5pbnRlbmRlZCBiZWhhdmlvcnNcclxuICAgICAgICAvLyB3aXRoIHRoZSBCYWNrZW5kU2VydmljZUFwaSBiZWNhdXNlIHRlY2huaWNhbGx5IHRoZSBkYXRhIGluIHRoZSBwYWdlIGNoYW5nZXMgdGhlIERhdGFWaWV3IG9uIGV2ZXJ5IHBhZ2UgY2hhbmdlLlxyXG4gICAgICAgIGxldCBwcmVzZXJ2ZWRSb3dTZWxlY3Rpb25XaXRoQmFja2VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmJhY2tlbmRTZXJ2aWNlQXBpICYmIHRoaXMuZ3JpZE9wdGlvbnMuZGF0YVZpZXcuaGFzT3duUHJvcGVydHkoJ3N5bmNHcmlkU2VsZWN0aW9uV2l0aEJhY2tlbmRTZXJ2aWNlJykpIHtcclxuICAgICAgICAgIHByZXNlcnZlZFJvd1NlbGVjdGlvbldpdGhCYWNrZW5kID0gdGhpcy5ncmlkT3B0aW9ucy5kYXRhVmlldy5zeW5jR3JpZFNlbGVjdGlvbldpdGhCYWNrZW5kU2VydmljZSBhcyBib29sZWFuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc3luY0dyaWRTZWxlY3Rpb24gPSB0aGlzLmdyaWRPcHRpb25zLmRhdGFWaWV3LnN5bmNHcmlkU2VsZWN0aW9uO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygc3luY0dyaWRTZWxlY3Rpb24gPT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgbGV0IHByZXNlcnZlZFJvd1NlbGVjdGlvbiA9IHN5bmNHcmlkU2VsZWN0aW9uO1xyXG4gICAgICAgICAgaWYgKCF0aGlzLl9pc0xvY2FsR3JpZCkge1xyXG4gICAgICAgICAgICAvLyB3aGVuIHVzaW5nIEJhY2tlbmRTZXJ2aWNlQXBpLCB3ZSdsbCBiZSB1c2luZyB0aGUgXCJzeW5jR3JpZFNlbGVjdGlvbldpdGhCYWNrZW5kU2VydmljZVwiIGZsYWcgQlVUIFwic3luY0dyaWRTZWxlY3Rpb25cIiBtdXN0IGFsc28gYmUgc2V0IHRvIFRydWVcclxuICAgICAgICAgICAgcHJlc2VydmVkUm93U2VsZWN0aW9uID0gc3luY0dyaWRTZWxlY3Rpb24gJiYgcHJlc2VydmVkUm93U2VsZWN0aW9uV2l0aEJhY2tlbmQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmRhdGFWaWV3LnN5bmNHcmlkU2VsZWN0aW9uKHRoaXMuc2xpY2tHcmlkLCBwcmVzZXJ2ZWRSb3dTZWxlY3Rpb24pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHN5bmNHcmlkU2VsZWN0aW9uID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgdGhpcy5kYXRhVmlldy5zeW5jR3JpZFNlbGVjdGlvbih0aGlzLnNsaWNrR3JpZCwgc3luY0dyaWRTZWxlY3Rpb24ucHJlc2VydmVIaWRkZW4sIHN5bmNHcmlkU2VsZWN0aW9uLnByZXNlcnZlSGlkZGVuT25TZWxlY3Rpb25DaGFuZ2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZGF0YXNldExuID0gdGhpcy5kYXRhVmlldy5nZXRMZW5ndGgoKSB8fCB0aGlzLl9kYXRhc2V0ICYmIHRoaXMuX2RhdGFzZXQubGVuZ3RoIHx8IDA7XHJcbiAgICAgIGlmIChkYXRhc2V0TG4gPiAwKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0RhdGFzZXRJbml0aWFsaXplZCAmJiAodGhpcy5ncmlkT3B0aW9ucy5lbmFibGVDaGVja2JveFNlbGVjdG9yIHx8IHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlUm93U2VsZWN0aW9uKSkge1xyXG4gICAgICAgICAgdGhpcy5sb2FkUm93U2VsZWN0aW9uUHJlc2V0V2hlbkV4aXN0cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxvYWRGaWx0ZXJQcmVzZXRzV2hlbkRhdGFzZXRJbml0aWFsaXplZCgpO1xyXG4gICAgICAgIHRoaXMuX2lzRGF0YXNldEluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHVzZXIgbWlnaHQgd2FudCB0byBoaWRlIHRoZSBoZWFkZXIgcm93IG9uIHBhZ2UgbG9hZCBidXQgc3RpbGwgaGF2ZSBgZW5hYmxlRmlsdGVyaW5nOiB0cnVlYFxyXG4gICAgLy8gaWYgdGhhdCBpcyB0aGUgY2FzZSwgd2UgbmVlZCB0byBoaWRlIHRoZSBoZWFkZXJSb3cgT05MWSBBRlRFUiBhbGwgZmlsdGVycyBnb3QgY3JlYXRlZCAmIGRhdGFWaWV3IGV4aXN0XHJcbiAgICBpZiAodGhpcy5faGlkZUhlYWRlclJvd0FmdGVyUGFnZUxvYWQpIHtcclxuICAgICAgdGhpcy5zaG93SGVhZGVyUm93KGZhbHNlKTtcclxuICAgICAgdGhpcy5zaGFyZWRTZXJ2aWNlLmhpZGVIZWFkZXJSb3dBZnRlclBhZ2VMb2FkID0gdGhpcy5faGlkZUhlYWRlclJvd0FmdGVyUGFnZUxvYWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHVibGlzaCAmIGRpc3BhdGNoIGNlcnRhaW4gZXZlbnRzXHJcbiAgICB0aGlzLl9ldmVudFB1YlN1YlNlcnZpY2UucHVibGlzaCgnb25HcmlkQ3JlYXRlZCcsIHRoaXMuc2xpY2tHcmlkKTtcclxuXHJcbiAgICAvLyBhZnRlciB0aGUgRGF0YVZpZXcgaXMgY3JlYXRlZCAmIHVwZGF0ZWQgZXhlY3V0ZSBzb21lIHByb2Nlc3Nlc1xyXG4gICAgaWYgKCF0aGlzLmN1c3RvbURhdGFWaWV3KSB7XHJcbiAgICAgIHRoaXMuZXhlY3V0ZUFmdGVyRGF0YXZpZXdDcmVhdGVkKHRoaXMuc2xpY2tHcmlkLCB0aGlzLmdyaWRPcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBiaW5kIHJlc2l6ZSBPTkxZIGFmdGVyIHRoZSBkYXRhVmlldyBpcyByZWFkeVxyXG4gICAgdGhpcy5iaW5kUmVzaXplSG9vayh0aGlzLnNsaWNrR3JpZCwgdGhpcy5ncmlkT3B0aW9ucyk7XHJcblxyXG4gICAgLy8gYmluZCB0aGUgQmFja2VuZCBTZXJ2aWNlIEFQSSBjYWxsYmFjayBmdW5jdGlvbnMgb25seSBhZnRlciB0aGUgZ3JpZCBpcyBpbml0aWFsaXplZFxyXG4gICAgLy8gYmVjYXVzZSB0aGUgcHJlUHJvY2VzcygpIGFuZCBvbkluaXQoKSBtaWdodCBnZXQgdHJpZ2dlcmVkXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9ucz8uYmFja2VuZFNlcnZpY2VBcGkpIHtcclxuICAgICAgdGhpcy5iaW5kQmFja2VuZENhbGxiYWNrRnVuY3Rpb25zKHRoaXMuZ3JpZE9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGxvY2FsIGdyaWQsIGNoZWNrIGlmIHdlIG5lZWQgdG8gc2hvdyB0aGUgUGFnaW5hdGlvblxyXG4gICAgLy8gaWYgc28gdGhlbiBhbHNvIGNoZWNrIGlmIHRoZXJlJ3MgYW55IHByZXNldHMgYW5kIGZpbmFsbHkgaW5pdGlhbGl6ZSB0aGUgUGFnaW5hdGlvblNlcnZpY2VcclxuICAgIC8vIGEgbG9jYWwgZ3JpZCB3aXRoIFBhZ2luYXRpb24gcHJlc2V0cyB3aWxsIHBvdGVudGlhbGx5IGhhdmUgYSBkaWZmZXJlbnQgdG90YWwgb2YgaXRlbXMsIHdlJ2xsIG5lZWQgdG8gZ2V0IGl0IGZyb20gdGhlIERhdGFWaWV3IGFuZCB1cGRhdGUgb3VyIHRvdGFsXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9ucz8uZW5hYmxlUGFnaW5hdGlvbiAmJiB0aGlzLl9pc0xvY2FsR3JpZCkge1xyXG4gICAgICB0aGlzLnNob3dQYWdpbmF0aW9uID0gdHJ1ZTtcclxuICAgICAgdGhpcy5sb2FkTG9jYWxHcmlkUGFnaW5hdGlvbih0aGlzLmRhdGFzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2FuZ3VsYXJHcmlkSW5zdGFuY2VzID0ge1xyXG4gICAgICAvLyBTbGljayBHcmlkICYgRGF0YVZpZXcgb2JqZWN0c1xyXG4gICAgICBkYXRhVmlldzogdGhpcy5kYXRhVmlldyxcclxuICAgICAgc2xpY2tHcmlkOiB0aGlzLnNsaWNrR3JpZCxcclxuICAgICAgZXh0ZW5zaW9uczogdGhpcy5leHRlbnNpb25TZXJ2aWNlPy5leHRlbnNpb25MaXN0LFxyXG5cclxuICAgICAgLy8gcHVibGljIG1ldGhvZHNcclxuICAgICAgZGVzdHJveTogdGhpcy5kZXN0cm95LmJpbmQodGhpcyksXHJcblxyXG4gICAgICAvLyByZXR1cm4gYWxsIGF2YWlsYWJsZSBTZXJ2aWNlcyAobm9uLXNpbmdsZXRvbilcclxuICAgICAgYmFja2VuZFNlcnZpY2U6IHRoaXMuZ3JpZE9wdGlvbnM/LmJhY2tlbmRTZXJ2aWNlQXBpPy5zZXJ2aWNlLFxyXG4gICAgICBldmVudFB1YlN1YlNlcnZpY2U6IHRoaXMuX2V2ZW50UHViU3ViU2VydmljZSxcclxuICAgICAgZmlsdGVyU2VydmljZTogdGhpcy5maWx0ZXJTZXJ2aWNlLFxyXG4gICAgICBncmlkRXZlbnRTZXJ2aWNlOiB0aGlzLmdyaWRFdmVudFNlcnZpY2UsXHJcbiAgICAgIGdyaWRTdGF0ZVNlcnZpY2U6IHRoaXMuZ3JpZFN0YXRlU2VydmljZSxcclxuICAgICAgZ3JpZFNlcnZpY2U6IHRoaXMuZ3JpZFNlcnZpY2UsXHJcbiAgICAgIGdyb3VwaW5nU2VydmljZTogdGhpcy5ncm91cGluZ1NlcnZpY2UsXHJcbiAgICAgIGV4dGVuc2lvblNlcnZpY2U6IHRoaXMuZXh0ZW5zaW9uU2VydmljZSxcclxuICAgICAgcGFnaW5hdGlvblNlcnZpY2U6IHRoaXMucGFnaW5hdGlvblNlcnZpY2UsXHJcbiAgICAgIHJlc2l6ZXJTZXJ2aWNlOiB0aGlzLnJlc2l6ZXJTZXJ2aWNlLFxyXG4gICAgICBzb3J0U2VydmljZTogdGhpcy5zb3J0U2VydmljZSxcclxuICAgICAgdHJlZURhdGFTZXJ2aWNlOiB0aGlzLnRyZWVEYXRhU2VydmljZSxcclxuICAgIH1cclxuXHJcbiAgICAvLyBhbGwgaW5zdGFuY2VzIChTbGlja0dyaWQsIERhdGFWaWV3ICYgYWxsIFNlcnZpY2VzKVxyXG4gICAgdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLnB1Ymxpc2goJ29uQW5ndWxhckdyaWRDcmVhdGVkJywgdGhpcy5fYW5ndWxhckdyaWRJbnN0YW5jZXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT24gYSBQYWdpbmF0aW9uIGNoYW5nZWQsIHdlIHdpbGwgdHJpZ2dlciBhIEdyaWQgU3RhdGUgY2hhbmdlZCB3aXRoIHRoZSBuZXcgcGFnaW5hdGlvbiBpbmZvXHJcbiAgICogQWxzbyBpZiB3ZSB1c2UgUm93IFNlbGVjdGlvbiBvciB0aGUgQ2hlY2tib3ggU2VsZWN0b3IsIHdlIG5lZWQgdG8gcmVzZXQgYW55IHNlbGVjdGlvblxyXG4gICAqL1xyXG4gIHBhZ2luYXRpb25DaGFuZ2VkKHBhZ2luYXRpb246IFNlcnZpY2VQYWdpbmF0aW9uKSB7XHJcbiAgICBjb25zdCBpc1N5bmNHcmlkU2VsZWN0aW9uRW5hYmxlZCA9IHRoaXMuZ3JpZFN0YXRlU2VydmljZT8ubmVlZFRvUHJlc2VydmVSb3dTZWxlY3Rpb24oKSA/PyBmYWxzZTtcclxuICAgIGlmICghaXNTeW5jR3JpZFNlbGVjdGlvbkVuYWJsZWQgJiYgKHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlUm93U2VsZWN0aW9uIHx8IHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlQ2hlY2tib3hTZWxlY3RvcikpIHtcclxuICAgICAgdGhpcy5zbGlja0dyaWQuc2V0U2VsZWN0ZWRSb3dzKFtdKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHsgcGFnZU51bWJlciwgcGFnZVNpemUgfSA9IHBhZ2luYXRpb247XHJcbiAgICBpZiAodGhpcy5zaGFyZWRTZXJ2aWNlKSB7XHJcbiAgICAgIGlmIChwYWdlU2l6ZSAhPT0gdW5kZWZpbmVkICYmIHBhZ2VOdW1iZXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuc2hhcmVkU2VydmljZS5jdXJyZW50UGFnaW5hdGlvbiA9IHsgcGFnZU51bWJlciwgcGFnZVNpemUgfTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLnB1Ymxpc2goJ29uR3JpZFN0YXRlQ2hhbmdlZCcsIHtcclxuICAgICAgY2hhbmdlOiB7IG5ld1ZhbHVlczogeyBwYWdlTnVtYmVyLCBwYWdlU2l6ZSB9LCB0eXBlOiBHcmlkU3RhdGVUeXBlLnBhZ2luYXRpb24gfSxcclxuICAgICAgZ3JpZFN0YXRlOiB0aGlzLmdyaWRTdGF0ZVNlcnZpY2UuZ2V0Q3VycmVudEdyaWRTdGF0ZSgpXHJcbiAgICB9KTtcclxuICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIGRhdGFzZXQgY2hhbmdlcywgd2UgbmVlZCB0byByZWZyZXNoIHRoZSBlbnRpcmUgZ3JpZCBVSSAmIHBvc3NpYmx5IHJlc2l6ZSBpdCBhcyB3ZWxsXHJcbiAgICogQHBhcmFtIGRhdGFzZXRcclxuICAgKi9cclxuICByZWZyZXNoR3JpZERhdGEoZGF0YXNldDogYW55W10sIHRvdGFsQ291bnQ/OiBudW1iZXIpIHtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zICYmIHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlRW1wdHlEYXRhV2FybmluZ01lc3NhZ2UgJiYgQXJyYXkuaXNBcnJheShkYXRhc2V0KSkge1xyXG4gICAgICBjb25zdCBmaW5hbFRvdGFsQ291bnQgPSB0b3RhbENvdW50IHx8IGRhdGFzZXQubGVuZ3RoO1xyXG4gICAgICB0aGlzLmRpc3BsYXlFbXB0eURhdGFXYXJuaW5nKGZpbmFsVG90YWxDb3VudCA8IDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGFzZXQpICYmIHRoaXMuc2xpY2tHcmlkICYmIHRoaXMuZGF0YVZpZXc/LnNldEl0ZW1zKSB7XHJcbiAgICAgIHRoaXMuZGF0YVZpZXcuc2V0SXRlbXMoZGF0YXNldCwgdGhpcy5ncmlkT3B0aW9ucy5kYXRhc2V0SWRQcm9wZXJ0eU5hbWUgPz8gJ2lkJyk7XHJcbiAgICAgIGlmICghdGhpcy5ncmlkT3B0aW9ucy5iYWNrZW5kU2VydmljZUFwaSAmJiAhdGhpcy5ncmlkT3B0aW9ucy5lbmFibGVUcmVlRGF0YSkge1xyXG4gICAgICAgIHRoaXMuZGF0YVZpZXcucmVTb3J0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChkYXRhc2V0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzRGF0YXNldEluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICB0aGlzLmxvYWRGaWx0ZXJQcmVzZXRzV2hlbkRhdGFzZXRJbml0aWFsaXplZCgpO1xyXG5cclxuICAgICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmVuYWJsZUNoZWNrYm94U2VsZWN0b3IpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkUm93U2VsZWN0aW9uUHJlc2V0V2hlbkV4aXN0cygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc0RhdGFzZXRJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChkYXRhc2V0KSB7XHJcbiAgICAgICAgdGhpcy5zbGlja0dyaWQuaW52YWxpZGF0ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBkaXNwbGF5IHRoZSBQYWdpbmF0aW9uIGNvbXBvbmVudCBvbmx5IGFmdGVyIGNhbGxpbmcgdGhpcyByZWZyZXNoIGRhdGEgZmlyc3QsIHdlIGNhbGwgaXQgaGVyZSBzbyB0aGF0IGlmIHdlIHByZXNldCBwYWdpbmF0aW9uIHBhZ2UgbnVtYmVyIGl0IHdpbGwgYmUgc2hvd24gY29ycmVjdGx5XHJcbiAgICAgIHRoaXMuc2hvd1BhZ2luYXRpb24gPSAodGhpcy5ncmlkT3B0aW9ucyAmJiAodGhpcy5ncmlkT3B0aW9ucy5lbmFibGVQYWdpbmF0aW9uIHx8ICh0aGlzLmdyaWRPcHRpb25zLmJhY2tlbmRTZXJ2aWNlQXBpICYmIHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlUGFnaW5hdGlvbiA9PT0gdW5kZWZpbmVkKSkpID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgICAgaWYgKHRoaXMuX3BhZ2luYXRpb25PcHRpb25zICYmIHRoaXMuZ3JpZE9wdGlvbnM/LnBhZ2luYXRpb24gJiYgdGhpcy5ncmlkT3B0aW9ucz8uYmFja2VuZFNlcnZpY2VBcGkpIHtcclxuICAgICAgICBjb25zdCBwYWdpbmF0aW9uT3B0aW9ucyA9IHRoaXMuc2V0UGFnaW5hdGlvbk9wdGlvbnNXaGVuUHJlc2V0RGVmaW5lZCh0aGlzLmdyaWRPcHRpb25zLCB0aGlzLl9wYWdpbmF0aW9uT3B0aW9ucyBhcyBQYWdpbmF0aW9uKTtcclxuICAgICAgICAvLyB3aGVuIHdlIGhhdmUgYSB0b3RhbENvdW50IHVzZSBpdCwgZWxzZSB3ZSdsbCB0YWtlIGl0IGZyb20gdGhlIHBhZ2luYXRpb24gb2JqZWN0XHJcbiAgICAgICAgLy8gb25seSB1cGRhdGUgdGhlIHRvdGFsIGl0ZW1zIGlmIGl0J3MgZGlmZmVyZW50IHRvIGF2b2lkIHJlZnJlc2hpbmcgdGhlIFVJXHJcbiAgICAgICAgY29uc3QgdG90YWxSZWNvcmRzID0gKHRvdGFsQ291bnQgIT09IHVuZGVmaW5lZCkgPyB0b3RhbENvdW50IDogKHRoaXMuZ3JpZE9wdGlvbnM/LnBhZ2luYXRpb24/LnRvdGFsSXRlbXMpO1xyXG4gICAgICAgIGlmICh0b3RhbFJlY29yZHMgIT09IHVuZGVmaW5lZCAmJiB0b3RhbFJlY29yZHMgIT09IHRoaXMudG90YWxJdGVtcykge1xyXG4gICAgICAgICAgdGhpcy50b3RhbEl0ZW1zID0gK3RvdGFsUmVjb3JkcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGluaXRpYWxpemUgdGhlIFBhZ2luYXRpb24gU2VydmljZSB3aXRoIG5ldyBwYWdpbmF0aW9uIG9wdGlvbnMgKHdoaWNoIG1pZ2h0IGhhdmUgcHJlc2V0cylcclxuICAgICAgICBpZiAoIXRoaXMuX2lzUGFnaW5hdGlvbkluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICB0aGlzLmluaXRpYWxpemVQYWdpbmF0aW9uU2VydmljZShwYWdpbmF0aW9uT3B0aW9ucyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgcGFnaW5hdGlvbiBzZXJ2aWNlIHdpdGggdGhlIG5ldyB0b3RhbFxyXG4gICAgICAgICAgdGhpcy5wYWdpbmF0aW9uU2VydmljZS51cGRhdGVUb3RhbEl0ZW1zKHRoaXMudG90YWxJdGVtcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXNpemUgdGhlIGdyaWQgaW5zaWRlIGEgc2xpZ2h0IHRpbWVvdXQsIGluIGNhc2Ugb3RoZXIgRE9NIGVsZW1lbnQgY2hhbmdlZCBwcmlvciB0byB0aGUgcmVzaXplIChsaWtlIGEgZmlsdGVyL3BhZ2luYXRpb24gY2hhbmdlZClcclxuICAgICAgaWYgKHRoaXMuc2xpY2tHcmlkICYmIHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlQXV0b1Jlc2l6ZSkge1xyXG4gICAgICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5ncmlkT3B0aW9ucy5hdXRvUmVzaXplICYmIHRoaXMuZ3JpZE9wdGlvbnMuYXV0b1Jlc2l6ZS5kZWxheTtcclxuICAgICAgICB0aGlzLnJlc2l6ZXJTZXJ2aWNlLnJlc2l6ZUdyaWQoZGVsYXkgfHwgMTApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBpZiB0aGVyZSdzIGFueSBQYWdpbmF0aW9uIFByZXNldHMgZGVmaW5lZCBpbiB0aGUgR3JpZCBPcHRpb25zLFxyXG4gICAqIGlmIHRoZXJlIGFyZSB0aGVuIGxvYWQgdGhlbSBpbiB0aGUgcGFnaW5hdGlvbk9wdGlvbnMgb2JqZWN0XHJcbiAgICovXHJcbiAgc2V0UGFnaW5hdGlvbk9wdGlvbnNXaGVuUHJlc2V0RGVmaW5lZChncmlkT3B0aW9uczogR3JpZE9wdGlvbiwgcGFnaW5hdGlvbk9wdGlvbnM6IFBhZ2luYXRpb24pOiBQYWdpbmF0aW9uIHtcclxuICAgIGlmIChncmlkT3B0aW9ucy5wcmVzZXRzPy5wYWdpbmF0aW9uICYmIHBhZ2luYXRpb25PcHRpb25zICYmICF0aGlzLl9pc1BhZ2luYXRpb25Jbml0aWFsaXplZCkge1xyXG4gICAgICBwYWdpbmF0aW9uT3B0aW9ucy5wYWdlU2l6ZSA9IGdyaWRPcHRpb25zLnByZXNldHMucGFnaW5hdGlvbi5wYWdlU2l6ZTtcclxuICAgICAgcGFnaW5hdGlvbk9wdGlvbnMucGFnZU51bWJlciA9IGdyaWRPcHRpb25zLnByZXNldHMucGFnaW5hdGlvbi5wYWdlTnVtYmVyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhZ2luYXRpb25PcHRpb25zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHluYW1pY2FsbHkgY2hhbmdlIG9yIHVwZGF0ZSB0aGUgY29sdW1uIGRlZmluaXRpb25zIGxpc3QuXHJcbiAgICogV2Ugd2lsbCByZS1yZW5kZXIgdGhlIGdyaWQgc28gdGhhdCB0aGUgbmV3IGhlYWRlciBhbmQgZGF0YSBzaG93cyB1cCBjb3JyZWN0bHkuXHJcbiAgICogSWYgdXNpbmcgaTE4biwgd2UgYWxzbyBuZWVkIHRvIHRyaWdnZXIgYSByZS10cmFuc2xhdGUgb2YgdGhlIGNvbHVtbiBoZWFkZXJzXHJcbiAgICovXHJcbiAgdXBkYXRlQ29sdW1uRGVmaW5pdGlvbnNMaXN0KG5ld0NvbHVtbkRlZmluaXRpb25zOiBDb2x1bW5bXSkge1xyXG4gICAgLy8gbWFwL3N3YXAgdGhlIGludGVybmFsIGxpYnJhcnkgRWRpdG9yIHRvIHRoZSBTbGlja0dyaWQgRWRpdG9yIGZhY3RvcnlcclxuICAgIG5ld0NvbHVtbkRlZmluaXRpb25zID0gdGhpcy5zd2FwSW50ZXJuYWxFZGl0b3JUb1NsaWNrR3JpZEZhY3RvcnlFZGl0b3IobmV3Q29sdW1uRGVmaW5pdGlvbnMpO1xyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmVuYWJsZVRyYW5zbGF0ZSkge1xyXG4gICAgICB0aGlzLmV4dGVuc2lvblNlcnZpY2UudHJhbnNsYXRlQ29sdW1uSGVhZGVycyhmYWxzZSwgbmV3Q29sdW1uRGVmaW5pdGlvbnMpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5leHRlbnNpb25TZXJ2aWNlLnJlbmRlckNvbHVtbkhlYWRlcnMobmV3Q29sdW1uRGVmaW5pdGlvbnMsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zPy5lbmFibGVBdXRvU2l6ZUNvbHVtbnMpIHtcclxuICAgICAgdGhpcy5zbGlja0dyaWQuYXV0b3NpemVDb2x1bW5zKCk7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMuZ3JpZE9wdGlvbnM/LmVuYWJsZUF1dG9SZXNpemVDb2x1bW5zQnlDZWxsQ29udGVudCAmJiB0aGlzLnJlc2l6ZXJTZXJ2aWNlPy5yZXNpemVDb2x1bW5zQnlDZWxsQ29udGVudCkge1xyXG4gICAgICB0aGlzLnJlc2l6ZXJTZXJ2aWNlLnJlc2l6ZUNvbHVtbnNCeUNlbGxDb250ZW50KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaG93IHRoZSBmaWx0ZXIgcm93IGRpc3BsYXllZCBvbiBmaXJzdCByb3csIHdlIGNhbiBvcHRpb25hbGx5IHBhc3MgZmFsc2UgdG8gaGlkZSBpdC5cclxuICAgKiBAcGFyYW0gc2hvd2luZ1xyXG4gICAqL1xyXG4gIHNob3dIZWFkZXJSb3coc2hvd2luZyA9IHRydWUpIHtcclxuICAgIHRoaXMuc2xpY2tHcmlkLnNldEhlYWRlclJvd1Zpc2liaWxpdHkoc2hvd2luZywgZmFsc2UpO1xyXG4gICAgaWYgKHNob3dpbmcgPT09IHRydWUgJiYgdGhpcy5faXNHcmlkSW5pdGlhbGl6ZWQpIHtcclxuICAgICAgdGhpcy5zbGlja0dyaWQuc2V0Q29sdW1ucyh0aGlzLmNvbHVtbkRlZmluaXRpb25zKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzaG93aW5nO1xyXG4gIH1cclxuXHJcbiAgLy9cclxuICAvLyBwcml2YXRlIGZ1bmN0aW9uc1xyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvKipcclxuICAgKiBMb29wIHRocm91Z2ggYWxsIGNvbHVtbiBkZWZpbml0aW9ucyBhbmQgY29weSB0aGUgb3JpZ2luYWwgb3B0aW9uYWwgYHdpZHRoYCBwcm9wZXJ0aWVzIG9wdGlvbmFsbHkgcHJvdmlkZWQgYnkgdGhlIHVzZXIuXHJcbiAgICogV2Ugd2lsbCB1c2UgdGhpcyB3aGVuIGRvaW5nIGEgcmVzaXplIGJ5IGNlbGwgY29udGVudCwgaWYgdXNlciBwcm92aWRlZCBhIGB3aWR0aGAgaXQgd29uJ3Qgb3ZlcnJpZGUgaXQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjb3B5Q29sdW1uV2lkdGhzUmVmZXJlbmNlKGNvbHVtbkRlZmluaXRpb25zOiBDb2x1bW5bXSkge1xyXG4gICAgY29sdW1uRGVmaW5pdGlvbnMuZm9yRWFjaChjb2wgPT4gY29sLm9yaWdpbmFsV2lkdGggPSBjb2wud2lkdGgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkaXNwbGF5RW1wdHlEYXRhV2FybmluZyhzaG93V2FybmluZyA9IHRydWUpIHtcclxuICAgIHRoaXMuc2xpY2tFbXB0eVdhcm5pbmc/LnNob3dFbXB0eURhdGFNZXNzYWdlKHNob3dXYXJuaW5nKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYmluZERpZmZlcmVudEhvb2tzKGdyaWQ6IFNsaWNrR3JpZCwgZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb24sIGRhdGFWaWV3OiBTbGlja0RhdGFWaWV3KSB7XHJcbiAgICAvLyBvbiBsb2NhbGUgY2hhbmdlLCB3ZSBoYXZlIHRvIG1hbnVhbGx5IHRyYW5zbGF0ZSB0aGUgSGVhZGVycywgR3JpZE1lbnVcclxuICAgIGlmICh0aGlzLnRyYW5zbGF0ZT8ub25MYW5nQ2hhbmdlKSB7XHJcbiAgICAgIC8vIHRyYW5zbGF0ZSBzb21lIG9mIHRoZW0gb24gZmlyc3QgbG9hZCwgdGhlbiBvbiBlYWNoIGxhbmd1YWdlIGNoYW5nZVxyXG4gICAgICBpZiAoZ3JpZE9wdGlvbnMuZW5hYmxlVHJhbnNsYXRlKSB7XHJcbiAgICAgICAgdGhpcy5leHRlbnNpb25TZXJ2aWNlLnRyYW5zbGF0ZUFsbEV4dGVuc2lvbnMoKTtcclxuICAgICAgICB0aGlzLnRyYW5zbGF0ZUNvbHVtbkhlYWRlclRpdGxlS2V5cygpO1xyXG4gICAgICAgIHRoaXMudHJhbnNsYXRlQ29sdW1uR3JvdXBLZXlzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICAgIHRoaXMudHJhbnNsYXRlLm9uTGFuZ0NoYW5nZS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgLy8gcHVibGlzaCBldmVudCBvZiB0aGUgc2FtZSBuYW1lIHRoYXQgU2xpY2tncmlkLVVuaXZlcnNhbCB1c2VzIG9uIGEgbGFuZ3VhZ2UgY2hhbmdlIGV2ZW50XHJcbiAgICAgICAgICB0aGlzLl9ldmVudFB1YlN1YlNlcnZpY2UucHVibGlzaCgnb25MYW5ndWFnZUNoYW5nZScpO1xyXG5cclxuICAgICAgICAgIGlmIChncmlkT3B0aW9ucy5lbmFibGVUcmFuc2xhdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5leHRlbnNpb25TZXJ2aWNlLnRyYW5zbGF0ZUFsbEV4dGVuc2lvbnMoKTtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGVDb2x1bW5IZWFkZXJUaXRsZUtleXMoKTtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGVDb2x1bW5Hcm91cEtleXMoKTtcclxuICAgICAgICAgICAgaWYgKGdyaWRPcHRpb25zLmNyZWF0ZVByZUhlYWRlclBhbmVsICYmICFncmlkT3B0aW9ucy5lbmFibGVEcmFnZ2FibGVHcm91cGluZykge1xyXG4gICAgICAgICAgICAgIHRoaXMuZ3JvdXBpbmdTZXJ2aWNlLnRyYW5zbGF0ZUdyb3VwaW5nQW5kQ29sU3BhbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiB1c2VyIHNldCBhbiBvbkluaXQgQmFja2VuZCwgd2UnbGwgcnVuIGl0IHJpZ2h0IGF3YXkgKGFuZCBpZiBzbywgd2UgYWxzbyBuZWVkIHRvIHJ1biBwcmVQcm9jZXNzLCBpbnRlcm5hbFBvc3RQcm9jZXNzICYgcG9zdFByb2Nlc3MpXHJcbiAgICBpZiAoZ3JpZE9wdGlvbnMuYmFja2VuZFNlcnZpY2VBcGkpIHtcclxuICAgICAgY29uc3QgYmFja2VuZEFwaSA9IGdyaWRPcHRpb25zLmJhY2tlbmRTZXJ2aWNlQXBpO1xyXG5cclxuICAgICAgaWYgKGJhY2tlbmRBcGk/LnNlcnZpY2U/LmluaXQpIHtcclxuICAgICAgICBiYWNrZW5kQXBpLnNlcnZpY2UuaW5pdChiYWNrZW5kQXBpLm9wdGlvbnMsIGdyaWRPcHRpb25zLnBhZ2luYXRpb24sIHRoaXMuc2xpY2tHcmlkLCB0aGlzLnNoYXJlZFNlcnZpY2UpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRhdGFWaWV3ICYmIGdyaWQpIHtcclxuICAgICAgY29uc3Qgc2xpY2tncmlkRXZlbnRQcmVmaXggPSB0aGlzLmdyaWRPcHRpb25zPy5kZWZhdWx0U2xpY2tncmlkRXZlbnRQcmVmaXggPz8gJyc7XHJcblxyXG4gICAgICAvLyBleHBvc2UgYWxsIFNsaWNrIEdyaWQgRXZlbnRzIHRocm91Z2ggZGlzcGF0Y2hcclxuICAgICAgZm9yIChjb25zdCBwcm9wIGluIGdyaWQpIHtcclxuICAgICAgICBpZiAoZ3JpZC5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiBwcm9wLnN0YXJ0c1dpdGgoJ29uJykpIHtcclxuICAgICAgICAgIGNvbnN0IGdyaWRFdmVudE5hbWUgPSB0aGlzLl9ldmVudFB1YlN1YlNlcnZpY2UuZ2V0RXZlbnROYW1lQnlOYW1pbmdDb252ZW50aW9uKHByb3AsIHNsaWNrZ3JpZEV2ZW50UHJlZml4KTtcclxuICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlci5zdWJzY3JpYmUoKGdyaWQgYXMgYW55KVtwcm9wXSwgKGV2ZW50LCBhcmdzKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ldmVudFB1YlN1YlNlcnZpY2UuZGlzcGF0Y2hDdXN0b21FdmVudChncmlkRXZlbnROYW1lLCB7IGV2ZW50RGF0YTogZXZlbnQsIGFyZ3MgfSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGV4cG9zZSBhbGwgU2xpY2sgRGF0YVZpZXcgRXZlbnRzIHRocm91Z2ggZGlzcGF0Y2hcclxuICAgICAgZm9yIChjb25zdCBwcm9wIGluIGRhdGFWaWV3KSB7XHJcbiAgICAgICAgaWYgKGRhdGFWaWV3Lmhhc093blByb3BlcnR5KHByb3ApICYmIHByb3Auc3RhcnRzV2l0aCgnb24nKSkge1xyXG4gICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyLnN1YnNjcmliZSgoZGF0YVZpZXcgYXMgYW55KVtwcm9wXSwgKGV2ZW50LCBhcmdzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGFWaWV3RXZlbnROYW1lID0gdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLmdldEV2ZW50TmFtZUJ5TmFtaW5nQ29udmVudGlvbihwcm9wLCBzbGlja2dyaWRFdmVudFByZWZpeCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ldmVudFB1YlN1YlNlcnZpY2UuZGlzcGF0Y2hDdXN0b21FdmVudChkYXRhVmlld0V2ZW50TmFtZSwgeyBldmVudERhdGE6IGV2ZW50LCBhcmdzIH0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBvbiBjZWxsIGNsaWNrLCBtYWlubHkgdXNlZCB3aXRoIHRoZSBjb2x1bW5EZWYuYWN0aW9uIGNhbGxiYWNrXHJcbiAgICAgIHRoaXMuZ3JpZEV2ZW50U2VydmljZS5iaW5kT25DZWxsQ2hhbmdlKGdyaWQpO1xyXG4gICAgICB0aGlzLmdyaWRFdmVudFNlcnZpY2UuYmluZE9uQ2xpY2soZ3JpZCk7XHJcblxyXG4gICAgICBpZiAoZGF0YVZpZXcgJiYgZ3JpZCkge1xyXG4gICAgICAgIC8vIGJpbmQgZXh0ZXJuYWwgc29ydGluZyAoYmFja2VuZCkgd2hlbiBhdmFpbGFibGUgb3IgZGVmYXVsdCBvblNvcnQgKGRhdGFWaWV3KVxyXG4gICAgICAgIGlmIChncmlkT3B0aW9ucy5lbmFibGVTb3J0aW5nKSB7XHJcbiAgICAgICAgICAvLyBiaW5kIGV4dGVybmFsIHNvcnRpbmcgKGJhY2tlbmQpIHVubGVzcyBzcGVjaWZpZWQgdG8gdXNlIHRoZSBsb2NhbCBvbmVcclxuICAgICAgICAgIGlmIChncmlkT3B0aW9ucy5iYWNrZW5kU2VydmljZUFwaSAmJiAhZ3JpZE9wdGlvbnMuYmFja2VuZFNlcnZpY2VBcGkudXNlTG9jYWxTb3J0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc29ydFNlcnZpY2UuYmluZEJhY2tlbmRPblNvcnQoZ3JpZCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNvcnRTZXJ2aWNlLmJpbmRMb2NhbE9uU29ydChncmlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGJpbmQgZXh0ZXJuYWwgZmlsdGVyIChiYWNrZW5kKSB3aGVuIGF2YWlsYWJsZSBvciBkZWZhdWx0IG9uRmlsdGVyIChkYXRhVmlldylcclxuICAgICAgICBpZiAoZ3JpZE9wdGlvbnMuZW5hYmxlRmlsdGVyaW5nKSB7XHJcbiAgICAgICAgICB0aGlzLmZpbHRlclNlcnZpY2UuaW5pdChncmlkKTtcclxuXHJcbiAgICAgICAgICAvLyBiaW5kIGV4dGVybmFsIGZpbHRlciAoYmFja2VuZCkgdW5sZXNzIHNwZWNpZmllZCB0byB1c2UgdGhlIGxvY2FsIG9uZVxyXG4gICAgICAgICAgaWYgKGdyaWRPcHRpb25zLmJhY2tlbmRTZXJ2aWNlQXBpICYmICFncmlkT3B0aW9ucy5iYWNrZW5kU2VydmljZUFwaS51c2VMb2NhbEZpbHRlcmluZykge1xyXG4gICAgICAgICAgICB0aGlzLmZpbHRlclNlcnZpY2UuYmluZEJhY2tlbmRPbkZpbHRlcihncmlkKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyU2VydmljZS5iaW5kTG9jYWxPbkZpbHRlcihncmlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGxvYWQgYW55IHByZXNldHMgaWYgYW55IChhZnRlciBkYXRhc2V0IGlzIGluaXRpYWxpemVkKVxyXG4gICAgICAgIHRoaXMubG9hZENvbHVtblByZXNldHNXaGVuRGF0YXNldEluaXRpYWxpemVkKCk7XHJcbiAgICAgICAgdGhpcy5sb2FkRmlsdGVyUHJlc2V0c1doZW5EYXRhc2V0SW5pdGlhbGl6ZWQoKTtcclxuXHJcbiAgICAgICAgLy8gV2hlbiBkYXRhIGNoYW5nZXMgaW4gdGhlIERhdGFWaWV3LCB3ZSBuZWVkIHRvIHJlZnJlc2ggdGhlIG1ldHJpY3MgYW5kL29yIGRpc3BsYXkgYSB3YXJuaW5nIGlmIHRoZSBkYXRhc2V0IGlzIGVtcHR5XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyLnN1YnNjcmliZShkYXRhVmlldy5vblJvd0NvdW50Q2hhbmdlZCwgKCkgPT4ge1xyXG4gICAgICAgICAgZ3JpZC5pbnZhbGlkYXRlKCk7XHJcbiAgICAgICAgICB0aGlzLmhhbmRsZU9uSXRlbUNvdW50Q2hhbmdlZChkYXRhVmlldy5nZXRGaWx0ZXJlZEl0ZW1Db3VudCgpIHx8IDAsIGRhdGFWaWV3LmdldEl0ZW1Db3VudCgpIHx8IDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlci5zdWJzY3JpYmUoZGF0YVZpZXcub25TZXRJdGVtc0NhbGxlZCwgKF9lLCBhcmdzKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmhhbmRsZU9uSXRlbUNvdW50Q2hhbmdlZChkYXRhVmlldy5nZXRGaWx0ZXJlZEl0ZW1Db3VudCgpIHx8IDAsIGFyZ3MuaXRlbUNvdW50KTtcclxuXHJcbiAgICAgICAgICAvLyB3aGVuIHVzZXIgaGFzIHJlc2l6ZSBieSBjb250ZW50IGVuYWJsZWQsIHdlJ2xsIGZvcmNlIGEgZnVsbCB3aWR0aCBjYWxjdWxhdGlvbiBzaW5jZSB3ZSBjaGFuZ2Ugb3VyIGVudGlyZSBkYXRhc2V0XHJcbiAgICAgICAgICBpZiAoYXJncy5pdGVtQ291bnQgPiAwICYmICh0aGlzLmdyaWRPcHRpb25zLmF1dG9zaXplQ29sdW1uc0J5Q2VsbENvbnRlbnRPbkZpcnN0TG9hZCB8fCB0aGlzLmdyaWRPcHRpb25zLmVuYWJsZUF1dG9SZXNpemVDb2x1bW5zQnlDZWxsQ29udGVudCkpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXNpemVyU2VydmljZS5yZXNpemVDb2x1bW5zQnlDZWxsQ29udGVudCghdGhpcy5ncmlkT3B0aW9ucz8ucmVzaXplQnlDb250ZW50T25seU9uRmlyc3RMb2FkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGdyaWRPcHRpb25zPy5lbmFibGVGaWx0ZXJpbmcgJiYgIWdyaWRPcHRpb25zLmVuYWJsZVJvd0RldGFpbFZpZXcpIHtcclxuICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlci5zdWJzY3JpYmUoZGF0YVZpZXcub25Sb3dzQ2hhbmdlZCwgKF9lLCBhcmdzKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGZpbHRlcmluZyBkYXRhIHdpdGggbG9jYWwgZGF0YXNldCB3aWxsIG5vdCBhbHdheXMgc2hvdyBjb3JyZWN0bHkgdW5sZXNzIHdlIGNhbGwgdGhpcyB1cGRhdGVSb3cvcmVuZGVyXHJcbiAgICAgICAgICAgIC8vIGFsc28gZG9uJ3QgdXNlIFwiaW52YWxpZGF0ZVJvd3NcIiBzaW5jZSBpdCBkZXN0cm95cyB0aGUgZW50aXJlIHJvdyBhbmQgYXMgYmFkIHVzZXIgZXhwZXJpZW5jZSB3aGVuIHVwZGF0aW5nIGEgcm93XHJcbiAgICAgICAgICAgIC8vIHNlZSBjb21taXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9naGlzY29kaW5nL2F1cmVsaWEtc2xpY2tncmlkL2NvbW1pdC84YzUwM2E0ZDQ1ZmJhMTFjYmQ4ZDhjYzQ2N2ZhZThkMTc3Y2M0ZjYwXHJcbiAgICAgICAgICAgIGlmIChhcmdzPy5yb3dzICYmIEFycmF5LmlzQXJyYXkoYXJncy5yb3dzKSkge1xyXG4gICAgICAgICAgICAgIGFyZ3Mucm93cy5mb3JFYWNoKChyb3c6IG51bWJlcikgPT4gZ3JpZC51cGRhdGVSb3cocm93KSk7XHJcbiAgICAgICAgICAgICAgZ3JpZC5yZW5kZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGlkIHRoZSB1c2VyIGFkZCBhIGNvbHNwYW4gY2FsbGJhY2s/IElmIHNvLCBob29rIGl0IGludG8gdGhlIERhdGFWaWV3IGdldEl0ZW1NZXRhZGF0YVxyXG4gICAgaWYgKGdyaWRPcHRpb25zICYmIGdyaWRPcHRpb25zLmNvbHNwYW5DYWxsYmFjayAmJiBkYXRhVmlldyAmJiBkYXRhVmlldy5nZXRJdGVtICYmIGRhdGFWaWV3LmdldEl0ZW1NZXRhZGF0YSkge1xyXG4gICAgICBkYXRhVmlldy5nZXRJdGVtTWV0YWRhdGEgPSAocm93TnVtYmVyOiBudW1iZXIpID0+IHtcclxuICAgICAgICBsZXQgY2FsbGJhY2tSZXN1bHQgPSBudWxsO1xyXG4gICAgICAgIGlmIChncmlkT3B0aW9ucy5jb2xzcGFuQ2FsbGJhY2sgJiYgZ3JpZE9wdGlvbnMuY29sc3BhbkNhbGxiYWNrKSB7XHJcbiAgICAgICAgICBjYWxsYmFja1Jlc3VsdCA9IGdyaWRPcHRpb25zLmNvbHNwYW5DYWxsYmFjayhkYXRhVmlldy5nZXRJdGVtKHJvd051bWJlcikpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2FsbGJhY2tSZXN1bHQ7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJpbmRCYWNrZW5kQ2FsbGJhY2tGdW5jdGlvbnMoZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb24pIHtcclxuICAgIGNvbnN0IGJhY2tlbmRBcGkgPSBncmlkT3B0aW9ucy5iYWNrZW5kU2VydmljZUFwaTtcclxuICAgIGNvbnN0IGJhY2tlbmRBcGlTZXJ2aWNlID0gYmFja2VuZEFwaSAmJiBiYWNrZW5kQXBpLnNlcnZpY2U7XHJcbiAgICBjb25zdCBzZXJ2aWNlT3B0aW9uczogQmFja2VuZFNlcnZpY2VPcHRpb24gPSBiYWNrZW5kQXBpU2VydmljZT8ub3B0aW9ucyA/PyB7fTtcclxuICAgIGNvbnN0IGlzRXhlY3V0ZUNvbW1hbmRPbkluaXQgPSAoIXNlcnZpY2VPcHRpb25zKSA/IGZhbHNlIDogKChzZXJ2aWNlT3B0aW9ucyAmJiBzZXJ2aWNlT3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnZXhlY3V0ZVByb2Nlc3NDb21tYW5kT25Jbml0JykpID8gc2VydmljZU9wdGlvbnNbJ2V4ZWN1dGVQcm9jZXNzQ29tbWFuZE9uSW5pdCddIDogdHJ1ZSk7XHJcblxyXG4gICAgaWYgKGJhY2tlbmRBcGlTZXJ2aWNlKSB7XHJcbiAgICAgIC8vIHVwZGF0ZSBiYWNrZW5kIGZpbHRlcnMgKGlmIG5lZWQgYmUpIEJFRk9SRSB0aGUgcXVlcnkgcnVucyAodmlhIHRoZSBvbkluaXQgY29tbWFuZCBhIGZldyBsaW5lcyBiZWxvdylcclxuICAgICAgLy8gaWYgdXNlciBlbnRlcmVkIHNvbWUgYW55IFwicHJlc2V0c1wiLCB3ZSBuZWVkIHRvIHJlZmxlY3QgdGhlbSBhbGwgaW4gdGhlIGdyaWRcclxuICAgICAgaWYgKGdyaWRPcHRpb25zICYmIGdyaWRPcHRpb25zLnByZXNldHMpIHtcclxuICAgICAgICAvLyBGaWx0ZXJzIFwicHJlc2V0c1wiXHJcbiAgICAgICAgaWYgKGJhY2tlbmRBcGlTZXJ2aWNlLnVwZGF0ZUZpbHRlcnMgJiYgQXJyYXkuaXNBcnJheShncmlkT3B0aW9ucy5wcmVzZXRzLmZpbHRlcnMpICYmIGdyaWRPcHRpb25zLnByZXNldHMuZmlsdGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBiYWNrZW5kQXBpU2VydmljZS51cGRhdGVGaWx0ZXJzKGdyaWRPcHRpb25zLnByZXNldHMuZmlsdGVycywgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFNvcnRlcnMgXCJwcmVzZXRzXCJcclxuICAgICAgICBpZiAoYmFja2VuZEFwaVNlcnZpY2UudXBkYXRlU29ydGVycyAmJiBBcnJheS5pc0FycmF5KGdyaWRPcHRpb25zLnByZXNldHMuc29ydGVycykgJiYgZ3JpZE9wdGlvbnMucHJlc2V0cy5zb3J0ZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIC8vIHdoZW4gdXNpbmcgbXVsdGktY29sdW1uIHNvcnQsIHdlIGNhbiBoYXZlIG11bHRpcGxlIGJ1dCBvbiBzaW5nbGUgc29ydCB0aGVuIG9ubHkgZ3JhYiB0aGUgZmlyc3Qgc29ydCBwcm92aWRlZFxyXG4gICAgICAgICAgY29uc3Qgc29ydENvbHVtbnMgPSB0aGlzLmdyaWRPcHRpb25zLm11bHRpQ29sdW1uU29ydCA/IGdyaWRPcHRpb25zLnByZXNldHMuc29ydGVycyA6IGdyaWRPcHRpb25zLnByZXNldHMuc29ydGVycy5zbGljZSgwLCAxKTtcclxuICAgICAgICAgIGJhY2tlbmRBcGlTZXJ2aWNlLnVwZGF0ZVNvcnRlcnModW5kZWZpbmVkLCBzb3J0Q29sdW1ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFBhZ2luYXRpb24gXCJwcmVzZXRzXCJcclxuICAgICAgICBpZiAoYmFja2VuZEFwaVNlcnZpY2UudXBkYXRlUGFnaW5hdGlvbiAmJiBncmlkT3B0aW9ucy5wcmVzZXRzLnBhZ2luYXRpb24pIHtcclxuICAgICAgICAgIGNvbnN0IHsgcGFnZU51bWJlciwgcGFnZVNpemUgfSA9IGdyaWRPcHRpb25zLnByZXNldHMucGFnaW5hdGlvbjtcclxuICAgICAgICAgIGJhY2tlbmRBcGlTZXJ2aWNlLnVwZGF0ZVBhZ2luYXRpb24ocGFnZU51bWJlciwgcGFnZVNpemUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBjb2x1bW5GaWx0ZXJzID0gdGhpcy5maWx0ZXJTZXJ2aWNlLmdldENvbHVtbkZpbHRlcnMoKTtcclxuICAgICAgICBpZiAoY29sdW1uRmlsdGVycyAmJiBiYWNrZW5kQXBpU2VydmljZS51cGRhdGVGaWx0ZXJzKSB7XHJcbiAgICAgICAgICBiYWNrZW5kQXBpU2VydmljZS51cGRhdGVGaWx0ZXJzKGNvbHVtbkZpbHRlcnMsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGV4ZWN1dGUgb25Jbml0IGNvbW1hbmQgd2hlbiBuZWNlc3NhcnlcclxuICAgICAgaWYgKGJhY2tlbmRBcGkgJiYgYmFja2VuZEFwaVNlcnZpY2UgJiYgKGJhY2tlbmRBcGkub25Jbml0IHx8IGlzRXhlY3V0ZUNvbW1hbmRPbkluaXQpKSB7XHJcbiAgICAgICAgY29uc3QgcXVlcnkgPSAodHlwZW9mIGJhY2tlbmRBcGlTZXJ2aWNlLmJ1aWxkUXVlcnkgPT09ICdmdW5jdGlvbicpID8gYmFja2VuZEFwaVNlcnZpY2UuYnVpbGRRdWVyeSgpIDogJyc7XHJcbiAgICAgICAgY29uc3QgcHJvY2VzcyA9IChpc0V4ZWN1dGVDb21tYW5kT25Jbml0KSA/IChiYWNrZW5kQXBpLnByb2Nlc3MgJiYgYmFja2VuZEFwaS5wcm9jZXNzKHF1ZXJ5KSB8fCBudWxsKSA6IChiYWNrZW5kQXBpLm9uSW5pdCAmJiBiYWNrZW5kQXBpLm9uSW5pdChxdWVyeSkgfHwgbnVsbCk7XHJcblxyXG4gICAgICAgIC8vIHdyYXAgdGhpcyBpbnNpZGUgYSBzZXRUaW1lb3V0IHRvIGF2b2lkIHRpbWluZyBpc3N1ZSBzaW5jZSB0aGUgZ3JpZE9wdGlvbnMgbmVlZHMgdG8gYmUgcmVhZHkgYmVmb3JlIHJ1bm5pbmcgdGhpcyBvbkluaXRcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJhY2tlbmRVdGlsaXR5U2VydmljZSA9IHRoaXMuYmFja2VuZFV0aWxpdHlTZXJ2aWNlIGFzIEJhY2tlbmRVdGlsaXR5U2VydmljZTtcclxuXHJcbiAgICAgICAgICAvLyBrZWVwIHN0YXJ0IHRpbWUgJiBlbmQgdGltZXN0YW1wcyAmIHJldHVybiBpdCBhZnRlciBwcm9jZXNzIGV4ZWN1dGlvblxyXG4gICAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcclxuXHJcbiAgICAgICAgICAvLyBydW4gYW55IHByZS1wcm9jZXNzLCBpZiBkZWZpbmVkLCBmb3IgZXhhbXBsZSBhIHNwaW5uZXJcclxuICAgICAgICAgIGlmIChiYWNrZW5kQXBpLnByZVByb2Nlc3MpIHtcclxuICAgICAgICAgICAgYmFja2VuZEFwaS5wcmVQcm9jZXNzKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gdGhlIHByb2Nlc3NlcyBjYW4gYmUgYSBQcm9taXNlIChsaWtlIEh0dHApXHJcbiAgICAgICAgICBjb25zdCB0b3RhbEl0ZW1zID0gdGhpcy5ncmlkT3B0aW9ucz8ucGFnaW5hdGlvbj8udG90YWxJdGVtcyA/PyAwO1xyXG4gICAgICAgICAgaWYgKHByb2Nlc3MgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHByb2Nlc3NcclxuICAgICAgICAgICAgICAudGhlbigocHJvY2Vzc1Jlc3VsdDogYW55KSA9PiBiYWNrZW5kVXRpbGl0eVNlcnZpY2UuZXhlY3V0ZUJhY2tlbmRQcm9jZXNzZXNDYWxsYmFjayhzdGFydFRpbWUsIHByb2Nlc3NSZXN1bHQsIGJhY2tlbmRBcGksIHRvdGFsSXRlbXMpKVxyXG4gICAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IGJhY2tlbmRVdGlsaXR5U2VydmljZS5vbkJhY2tlbmRFcnJvcihlcnJvciwgYmFja2VuZEFwaSkpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChwcm9jZXNzICYmIHRoaXMucnhqcz8uaXNPYnNlcnZhYmxlKHByb2Nlc3MpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICAgICAgICAgIChwcm9jZXNzIGFzIE9ic2VydmFibGU8YW55Pikuc3Vic2NyaWJlKHtcclxuICAgICAgICAgICAgICAgIG5leHQ6IChwcm9jZXNzUmVzdWx0OiBhbnkpID0+IGJhY2tlbmRVdGlsaXR5U2VydmljZS5leGVjdXRlQmFja2VuZFByb2Nlc3Nlc0NhbGxiYWNrKHN0YXJ0VGltZSwgcHJvY2Vzc1Jlc3VsdCwgYmFja2VuZEFwaSwgdG90YWxJdGVtcyksXHJcbiAgICAgICAgICAgICAgICBlcnJvcjogKGVycm9yOiBhbnkpID0+IGJhY2tlbmRVdGlsaXR5U2VydmljZS5vbkJhY2tlbmRFcnJvcihlcnJvciwgYmFja2VuZEFwaSlcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJpbmRSZXNpemVIb29rKGdyaWQ6IFNsaWNrR3JpZCwgb3B0aW9uczogR3JpZE9wdGlvbikge1xyXG4gICAgaWYgKChvcHRpb25zLmF1dG9GaXRDb2x1bW5zT25GaXJzdExvYWQgJiYgb3B0aW9ucy5hdXRvc2l6ZUNvbHVtbnNCeUNlbGxDb250ZW50T25GaXJzdExvYWQpIHx8IChvcHRpb25zLmVuYWJsZUF1dG9TaXplQ29sdW1ucyAmJiBvcHRpb25zLmVuYWJsZUF1dG9SZXNpemVDb2x1bW5zQnlDZWxsQ29udGVudCkpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBbQW5ndWxhci1TbGlja2dyaWRdIFlvdSBjYW5ub3QgZW5hYmxlIGJvdGggYXV0b3NpemUvZml0IHZpZXdwb3J0ICYgcmVzaXplIGJ5IGNvbnRlbnQsIHlvdSBtdXN0IGNob29zZSB3aGljaCByZXNpemUgdGVjaG5pcXVlIHRvIHVzZS4gWW91IGNhbiBlbmFibGUgdGhlc2UgMiBvcHRpb25zIChcImF1dG9GaXRDb2x1bW5zT25GaXJzdExvYWRcIiBhbmQgXCJlbmFibGVBdXRvU2l6ZUNvbHVtbnNcIikgT1IgdGhlc2Ugb3RoZXIgMiBvcHRpb25zIChcImF1dG9zaXplQ29sdW1uc0J5Q2VsbENvbnRlbnRPbkZpcnN0TG9hZFwiIGFuZCBcImVuYWJsZUF1dG9SZXNpemVDb2x1bW5zQnlDZWxsQ29udGVudFwiKS5gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBleHBhbmQvYXV0b2ZpdCBjb2x1bW5zIG9uIGZpcnN0IHBhZ2UgbG9hZFxyXG4gICAgaWYgKGdyaWQgJiYgb3B0aW9ucy5hdXRvRml0Q29sdW1uc09uRmlyc3RMb2FkICYmIG9wdGlvbnMuZW5hYmxlQXV0b1NpemVDb2x1bW5zKSB7XHJcbiAgICAgIGdyaWQuYXV0b3NpemVDb2x1bW5zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXV0by1yZXNpemUgZ3JpZCBvbiBicm93c2VyIHJlc2l6ZVxyXG4gICAgaWYgKG9wdGlvbnMuZ3JpZEhlaWdodCB8fCBvcHRpb25zLmdyaWRXaWR0aCkge1xyXG4gICAgICB0aGlzLnJlc2l6ZXJTZXJ2aWNlLnJlc2l6ZUdyaWQoMCwgeyBoZWlnaHQ6IG9wdGlvbnMuZ3JpZEhlaWdodCwgd2lkdGg6IG9wdGlvbnMuZ3JpZFdpZHRoIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yZXNpemVyU2VydmljZS5yZXNpemVHcmlkKCk7XHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy5lbmFibGVBdXRvUmVzaXplKSB7XHJcbiAgICAgIGlmIChncmlkICYmIG9wdGlvbnMuYXV0b0ZpdENvbHVtbnNPbkZpcnN0TG9hZCAmJiBvcHRpb25zLmVuYWJsZUF1dG9TaXplQ29sdW1ucykge1xyXG4gICAgICAgIGdyaWQuYXV0b3NpemVDb2x1bW5zKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZXhlY3V0ZUFmdGVyRGF0YXZpZXdDcmVhdGVkKF9ncmlkOiBTbGlja0dyaWQsIGdyaWRPcHRpb25zOiBHcmlkT3B0aW9uKSB7XHJcbiAgICAvLyBpZiB1c2VyIGVudGVyZWQgc29tZSBTb3J0IFwicHJlc2V0c1wiLCB3ZSBuZWVkIHRvIHJlZmxlY3QgdGhlbSBhbGwgaW4gdGhlIERPTVxyXG4gICAgaWYgKGdyaWRPcHRpb25zLmVuYWJsZVNvcnRpbmcpIHtcclxuICAgICAgaWYgKGdyaWRPcHRpb25zLnByZXNldHMgJiYgQXJyYXkuaXNBcnJheShncmlkT3B0aW9ucy5wcmVzZXRzLnNvcnRlcnMpKSB7XHJcbiAgICAgICAgLy8gd2hlbiB1c2luZyBtdWx0aS1jb2x1bW4gc29ydCwgd2UgY2FuIGhhdmUgbXVsdGlwbGUgYnV0IG9uIHNpbmdsZSBzb3J0IHRoZW4gb25seSBncmFiIHRoZSBmaXJzdCBzb3J0IHByb3ZpZGVkXHJcbiAgICAgICAgY29uc3Qgc29ydENvbHVtbnMgPSB0aGlzLmdyaWRPcHRpb25zLm11bHRpQ29sdW1uU29ydCA/IGdyaWRPcHRpb25zLnByZXNldHMuc29ydGVycyA6IGdyaWRPcHRpb25zLnByZXNldHMuc29ydGVycy5zbGljZSgwLCAxKTtcclxuICAgICAgICB0aGlzLnNvcnRTZXJ2aWNlLmxvYWRHcmlkU29ydGVycyhzb3J0Q29sdW1ucyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBXaGVuIGRhdGEgY2hhbmdlcyBpbiB0aGUgRGF0YVZpZXcsIHdlJ2xsIHJlZnJlc2ggdGhlIG1ldHJpY3MgYW5kL29yIGRpc3BsYXkgYSB3YXJuaW5nIGlmIHRoZSBkYXRhc2V0IGlzIGVtcHR5ICovXHJcbiAgcHJpdmF0ZSBoYW5kbGVPbkl0ZW1Db3VudENoYW5nZWQoY3VycmVudFBhZ2VSb3dJdGVtQ291bnQ6IG51bWJlciwgdG90YWxJdGVtQ291bnQ6IG51bWJlcikge1xyXG4gICAgdGhpcy5fY3VycmVudERhdGFzZXRMZW5ndGggPSB0b3RhbEl0ZW1Db3VudDtcclxuICAgIHRoaXMubWV0cmljcyA9IHtcclxuICAgICAgc3RhcnRUaW1lOiBuZXcgRGF0ZSgpLFxyXG4gICAgICBlbmRUaW1lOiBuZXcgRGF0ZSgpLFxyXG4gICAgICBpdGVtQ291bnQ6IGN1cnJlbnRQYWdlUm93SXRlbUNvdW50LFxyXG4gICAgICB0b3RhbEl0ZW1Db3VudFxyXG4gICAgfTtcclxuICAgIC8vIGlmIGN1c3RvbSBmb290ZXIgaXMgZW5hYmxlZCwgdGhlbiB3ZSdsbCB1cGRhdGUgaXRzIG1ldHJpY3NcclxuICAgIGlmICh0aGlzLnNsaWNrRm9vdGVyKSB7XHJcbiAgICAgIHRoaXMuc2xpY2tGb290ZXIubWV0cmljcyA9IHRoaXMubWV0cmljcztcclxuICAgIH1cclxuXHJcbiAgICAvLyB3aGVuIHVzaW5nIGxvY2FsIChpbi1tZW1vcnkpIGRhdGFzZXQsIHdlJ2xsIGRpc3BsYXkgYSB3YXJuaW5nIG1lc3NhZ2Ugd2hlbiBmaWx0ZXJlZCBkYXRhIGlzIGVtcHR5XHJcbiAgICBpZiAodGhpcy5faXNMb2NhbEdyaWQgJiYgdGhpcy5ncmlkT3B0aW9ucz8uZW5hYmxlRW1wdHlEYXRhV2FybmluZ01lc3NhZ2UpIHtcclxuICAgICAgdGhpcy5kaXNwbGF5RW1wdHlEYXRhV2FybmluZyhjdXJyZW50UGFnZVJvd0l0ZW1Db3VudCA9PT0gMCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVQYWdpbmF0aW9uU2VydmljZShwYWdpbmF0aW9uT3B0aW9uczogUGFnaW5hdGlvbikge1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMpIHtcclxuICAgICAgdGhpcy5wYWdpbmF0aW9uRGF0YSA9IHtcclxuICAgICAgICBncmlkT3B0aW9uczogdGhpcy5ncmlkT3B0aW9ucyxcclxuICAgICAgICBwYWdpbmF0aW9uU2VydmljZTogdGhpcy5wYWdpbmF0aW9uU2VydmljZSxcclxuICAgICAgfTtcclxuICAgICAgdGhpcy5wYWdpbmF0aW9uU2VydmljZS50b3RhbEl0ZW1zID0gdGhpcy50b3RhbEl0ZW1zO1xyXG4gICAgICB0aGlzLnBhZ2luYXRpb25TZXJ2aWNlLmluaXQodGhpcy5zbGlja0dyaWQsIHBhZ2luYXRpb25PcHRpb25zLCB0aGlzLmJhY2tlbmRTZXJ2aWNlQXBpKTtcclxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgICAgdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLnN1YnNjcmliZSgnb25QYWdpbmF0aW9uQ2hhbmdlZCcsIChwYWdpbmF0aW9uQ2hhbmdlczogU2VydmljZVBhZ2luYXRpb24pID0+IHtcclxuICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkNoYW5nZWQocGFnaW5hdGlvbkNoYW5nZXMpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHRoaXMuX2V2ZW50UHViU3ViU2VydmljZS5zdWJzY3JpYmUoJ29uUGFnaW5hdGlvblZpc2liaWxpdHlDaGFuZ2VkJywgKHZpc2liaWxpdHk6IHsgdmlzaWJsZTogYm9vbGVhbiB9KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dQYWdpbmF0aW9uID0gdmlzaWJpbGl0eT8udmlzaWJsZSA/PyBmYWxzZTtcclxuICAgICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zPy5iYWNrZW5kU2VydmljZUFwaSkge1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tlbmRVdGlsaXR5U2VydmljZT8ucmVmcmVzaEJhY2tlbmREYXRhc2V0KHRoaXMuZ3JpZE9wdGlvbnMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5yZW5kZXJQYWdpbmF0aW9uKHRoaXMuc2hvd1BhZ2luYXRpb24pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcbiAgICAgIC8vIGFsc28gaW5pdGlhbGl6ZSAocmVuZGVyKSB0aGUgcGFnaW5hdGlvbiBjb21wb25lbnRcclxuICAgICAgdGhpcy5yZW5kZXJQYWdpbmF0aW9uKCk7XHJcbiAgICAgIHRoaXMuX2lzUGFnaW5hdGlvbkluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqIExvYWQgdGhlIEVkaXRvciBDb2xsZWN0aW9uIGFzeW5jaHJvbm91c2x5IGFuZCByZXBsYWNlIHRoZSBcImNvbGxlY3Rpb25cIiBwcm9wZXJ0eSB3aGVuIE9ic2VydmFibGUgcmVzb2x2ZXMgKi9cclxuICBwcml2YXRlIGxvYWRFZGl0b3JDb2xsZWN0aW9uQXN5bmMoY29sdW1uOiBDb2x1bW4pIHtcclxuICAgIGNvbnN0IGNvbGxlY3Rpb25Bc3luYyA9IGNvbHVtbiAmJiBjb2x1bW4uZWRpdG9yICYmIChjb2x1bW4uZWRpdG9yIGFzIENvbHVtbkVkaXRvcikuY29sbGVjdGlvbkFzeW5jO1xyXG4gICAgaWYgKGNvbGxlY3Rpb25Bc3luYyBpbnN0YW5jZW9mIE9ic2VydmFibGUpIHtcclxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXHJcbiAgICAgICAgY29sbGVjdGlvbkFzeW5jLnN1YnNjcmliZSgocmVzb2x2ZWRDb2xsZWN0aW9uKSA9PiB0aGlzLnVwZGF0ZUVkaXRvckNvbGxlY3Rpb24oY29sdW1uLCByZXNvbHZlZENvbGxlY3Rpb24pKVxyXG4gICAgICApO1xyXG4gICAgfSBlbHNlIGlmIChjb2xsZWN0aW9uQXN5bmMgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgIC8vIHdhaXQgZm9yIHRoZSBcImNvbGxlY3Rpb25Bc3luY1wiLCBvbmNlIHJlc29sdmVkIHdlIHdpbGwgc2F2ZSBpdCBpbnRvIHRoZSBcImNvbGxlY3Rpb25cIlxyXG4gICAgICAvLyB0aGUgY29sbGVjdGlvbkFzeW5jIGNhbiBiZSBvZiAzIHR5cGVzIEh0dHBDbGllbnQsIEh0dHBGZXRjaCBvciBhIFByb21pc2VcclxuICAgICAgY29sbGVjdGlvbkFzeW5jLnRoZW4oKHJlc3BvbnNlOiBhbnkgfCBhbnlbXSkgPT4ge1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlc3BvbnNlKSkge1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVFZGl0b3JDb2xsZWN0aW9uKGNvbHVtbiwgcmVzcG9uc2UpOyAvLyBmcm9tIFByb21pc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIExvYWQgYW55IHBvc3NpYmxlIENvbHVtbnMgR3JpZCBQcmVzZXRzICovXHJcbiAgcHJpdmF0ZSBsb2FkQ29sdW1uUHJlc2V0c1doZW5EYXRhc2V0SW5pdGlhbGl6ZWQoKSB7XHJcbiAgICAvLyBpZiB1c2VyIGVudGVyZWQgc29tZSBDb2x1bW5zIFwicHJlc2V0c1wiLCB3ZSBuZWVkIHRvIHJlZmxlY3QgdGhlbSBhbGwgaW4gdGhlIGdyaWRcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLnByZXNldHMgJiYgQXJyYXkuaXNBcnJheSh0aGlzLmdyaWRPcHRpb25zLnByZXNldHMuY29sdW1ucykgJiYgdGhpcy5ncmlkT3B0aW9ucy5wcmVzZXRzLmNvbHVtbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBncmlkQ29sdW1uczogQ29sdW1uW10gPSB0aGlzLmdyaWRTdGF0ZVNlcnZpY2UuZ2V0QXNzb2NpYXRlZEdyaWRDb2x1bW5zKHRoaXMuc2xpY2tHcmlkLCB0aGlzLmdyaWRPcHRpb25zLnByZXNldHMuY29sdW1ucyk7XHJcbiAgICAgIGlmIChncmlkQ29sdW1ucyAmJiBBcnJheS5pc0FycmF5KGdyaWRDb2x1bW5zKSAmJiBncmlkQ29sdW1ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIGNoZWNrYm94IHNlbGVjdG9yIGlzIGFsc28gdmlzaWJsZSBpZiBpdCBpcyBlbmFibGVkXHJcbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlQ2hlY2tib3hTZWxlY3Rvcikge1xyXG4gICAgICAgICAgY29uc3QgY2hlY2tib3hDb2x1bW4gPSAoQXJyYXkuaXNBcnJheSh0aGlzLl9jb2x1bW5EZWZpbml0aW9ucykgJiYgdGhpcy5fY29sdW1uRGVmaW5pdGlvbnMubGVuZ3RoID4gMCkgPyB0aGlzLl9jb2x1bW5EZWZpbml0aW9uc1swXSA6IG51bGw7XHJcbiAgICAgICAgICBpZiAoY2hlY2tib3hDb2x1bW4gJiYgY2hlY2tib3hDb2x1bW4uaWQgPT09ICdfY2hlY2tib3hfc2VsZWN0b3InICYmIGdyaWRDb2x1bW5zWzBdLmlkICE9PSAnX2NoZWNrYm94X3NlbGVjdG9yJykge1xyXG4gICAgICAgICAgICBncmlkQ29sdW1ucy51bnNoaWZ0KGNoZWNrYm94Q29sdW1uKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGtlZXAgY29weSB0aGUgb3JpZ2luYWwgb3B0aW9uYWwgYHdpZHRoYCBwcm9wZXJ0aWVzIG9wdGlvbmFsbHkgcHJvdmlkZWQgYnkgdGhlIHVzZXIuXHJcbiAgICAgICAgLy8gV2Ugd2lsbCB1c2UgdGhpcyB3aGVuIGRvaW5nIGEgcmVzaXplIGJ5IGNlbGwgY29udGVudCwgaWYgdXNlciBwcm92aWRlZCBhIGB3aWR0aGAgaXQgd29uJ3Qgb3ZlcnJpZGUgaXQuXHJcbiAgICAgICAgZ3JpZENvbHVtbnMuZm9yRWFjaChjb2wgPT4gY29sLm9yaWdpbmFsV2lkdGggPSBjb2wud2lkdGgpO1xyXG5cclxuICAgICAgICAvLyBmaW5hbGx5IHNldCB0aGUgbmV3IHByZXNldHMgY29sdW1ucyAoaW5jbHVkaW5nIGNoZWNrYm94IHNlbGVjdG9yIGlmIG5lZWQgYmUpXHJcbiAgICAgICAgdGhpcy5zbGlja0dyaWQuc2V0Q29sdW1ucyhncmlkQ29sdW1ucyk7XHJcbiAgICAgICAgdGhpcy5zaGFyZWRTZXJ2aWNlLnZpc2libGVDb2x1bW5zID0gZ3JpZENvbHVtbnM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBMb2FkIGFueSBwb3NzaWJsZSBGaWx0ZXJzIEdyaWQgUHJlc2V0cyAqL1xyXG4gIHByaXZhdGUgbG9hZEZpbHRlclByZXNldHNXaGVuRGF0YXNldEluaXRpYWxpemVkKCkge1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMgJiYgIXRoaXMuY3VzdG9tRGF0YVZpZXcpIHtcclxuICAgICAgLy8gaWYgdXNlciBlbnRlcmVkIHNvbWUgRmlsdGVyIFwicHJlc2V0c1wiLCB3ZSBuZWVkIHRvIHJlZmxlY3QgdGhlbSBhbGwgaW4gdGhlIERPTVxyXG4gICAgICAvLyBhbHNvIG5vdGUgdGhhdCBhIHByZXNldHMgb2YgVHJlZSBEYXRhIFRvZ2dsaW5nIHdpbGwgYWxzbyBjYWxsIHRoaXMgbWV0aG9kIGJlY2F1c2UgVHJlZSBEYXRhIHRvZ2dsaW5nIGRvZXMgd29yayB3aXRoIGRhdGEgZmlsdGVyaW5nXHJcbiAgICAgIC8vIChjb2xsYXBzaW5nIGEgcGFyZW50IHdpbGwgYmFzaWNhbGx5IHVzZSBGaWx0ZXIgZm9yIGhpZGRpbmcgKGFrYSBjb2xsYXBzaW5nKSBhd2F5IHRoZSBjaGlsZCB1bmRlcm5lYXQgaXQpXHJcbiAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLnByZXNldHMgJiYgKEFycmF5LmlzQXJyYXkodGhpcy5ncmlkT3B0aW9ucy5wcmVzZXRzLmZpbHRlcnMpIHx8IEFycmF5LmlzQXJyYXkodGhpcy5ncmlkT3B0aW9ucy5wcmVzZXRzPy50cmVlRGF0YT8udG9nZ2xlZEl0ZW1zKSkpIHtcclxuICAgICAgICB0aGlzLmZpbHRlclNlcnZpY2UucG9wdWxhdGVDb2x1bW5GaWx0ZXJTZWFyY2hUZXJtUHJlc2V0cyh0aGlzLmdyaWRPcHRpb25zLnByZXNldHM/LmZpbHRlcnMgfHwgW10pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBsb2NhbCBncmlkLCBjaGVjayBpZiB3ZSBuZWVkIHRvIHNob3cgdGhlIFBhZ2luYXRpb25cclxuICAgKiBpZiBzbyB0aGVuIGFsc28gY2hlY2sgaWYgdGhlcmUncyBhbnkgcHJlc2V0cyBhbmQgZmluYWxseSBpbml0aWFsaXplIHRoZSBQYWdpbmF0aW9uU2VydmljZVxyXG4gICAqIGEgbG9jYWwgZ3JpZCB3aXRoIFBhZ2luYXRpb24gcHJlc2V0cyB3aWxsIHBvdGVudGlhbGx5IGhhdmUgYSBkaWZmZXJlbnQgdG90YWwgb2YgaXRlbXMsIHdlJ2xsIG5lZWQgdG8gZ2V0IGl0IGZyb20gdGhlIERhdGFWaWV3IGFuZCB1cGRhdGUgb3VyIHRvdGFsXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBsb2FkTG9jYWxHcmlkUGFnaW5hdGlvbihkYXRhc2V0PzogYW55W10pIHtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zICYmIHRoaXMuX3BhZ2luYXRpb25PcHRpb25zKSB7XHJcbiAgICAgIHRoaXMudG90YWxJdGVtcyA9IEFycmF5LmlzQXJyYXkoZGF0YXNldCkgPyBkYXRhc2V0Lmxlbmd0aCA6IDA7XHJcbiAgICAgIGlmICh0aGlzLl9wYWdpbmF0aW9uT3B0aW9ucyAmJiB0aGlzLmRhdGFWaWV3Py5nZXRQYWdpbmdJbmZvKSB7XHJcbiAgICAgICAgY29uc3Qgc2xpY2tQYWdpbmdJbmZvID0gdGhpcy5kYXRhVmlldy5nZXRQYWdpbmdJbmZvKCk7XHJcbiAgICAgICAgaWYgKHNsaWNrUGFnaW5nSW5mbz8uaGFzT3duUHJvcGVydHkoJ3RvdGFsUm93cycpICYmIHRoaXMuX3BhZ2luYXRpb25PcHRpb25zLnRvdGFsSXRlbXMgIT09IHNsaWNrUGFnaW5nSW5mby50b3RhbFJvd3MpIHtcclxuICAgICAgICAgIHRoaXMudG90YWxJdGVtcyA9IHNsaWNrUGFnaW5nSW5mby50b3RhbFJvd3MgfHwgMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5fcGFnaW5hdGlvbk9wdGlvbnMudG90YWxJdGVtcyA9IHRoaXMudG90YWxJdGVtcztcclxuICAgICAgY29uc3QgcGFnaW5hdGlvbk9wdGlvbnMgPSB0aGlzLnNldFBhZ2luYXRpb25PcHRpb25zV2hlblByZXNldERlZmluZWQodGhpcy5ncmlkT3B0aW9ucywgdGhpcy5fcGFnaW5hdGlvbk9wdGlvbnMpO1xyXG4gICAgICB0aGlzLmluaXRpYWxpemVQYWdpbmF0aW9uU2VydmljZShwYWdpbmF0aW9uT3B0aW9ucyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogTG9hZCBhbnkgUm93IFNlbGVjdGlvbnMgaW50byB0aGUgRGF0YVZpZXcgdGhhdCB3ZXJlIHByZXNldHMgYnkgdGhlIHVzZXIgKi9cclxuICBwcml2YXRlIGxvYWRSb3dTZWxlY3Rpb25QcmVzZXRXaGVuRXhpc3RzKCkge1xyXG4gICAgLy8gaWYgdXNlciBlbnRlcmVkIHNvbWUgUm93IFNlbGVjdGlvbnMgXCJwcmVzZXRzXCJcclxuICAgIGNvbnN0IHByZXNldHMgPSB0aGlzLmdyaWRPcHRpb25zPy5wcmVzZXRzO1xyXG4gICAgY29uc3QgZW5hYmxlUm93U2VsZWN0aW9uID0gdGhpcy5ncmlkT3B0aW9ucyAmJiAodGhpcy5ncmlkT3B0aW9ucy5lbmFibGVDaGVja2JveFNlbGVjdG9yIHx8IHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlUm93U2VsZWN0aW9uKTtcclxuICAgIGlmIChlbmFibGVSb3dTZWxlY3Rpb24gJiYgdGhpcy5zbGlja0dyaWQ/LmdldFNlbGVjdGlvbk1vZGVsKCkgJiYgcHJlc2V0cz8ucm93U2VsZWN0aW9uICYmIChBcnJheS5pc0FycmF5KHByZXNldHMucm93U2VsZWN0aW9uLmdyaWRSb3dJbmRleGVzKSB8fCBBcnJheS5pc0FycmF5KHByZXNldHMucm93U2VsZWN0aW9uLmRhdGFDb250ZXh0SWRzKSkpIHtcclxuICAgICAgbGV0IGRhdGFDb250ZXh0SWRzID0gcHJlc2V0cy5yb3dTZWxlY3Rpb24uZGF0YUNvbnRleHRJZHM7XHJcbiAgICAgIGxldCBncmlkUm93SW5kZXhlcyA9IHByZXNldHMucm93U2VsZWN0aW9uLmdyaWRSb3dJbmRleGVzO1xyXG5cclxuICAgICAgLy8gbWFwcyB0aGUgSURzIHRvIHRoZSBHcmlkIFJvd3MgYW5kIHZpY2UgdmVyc2EsIHRoZSBcImRhdGFDb250ZXh0SWRzXCIgaGFzIHByZWNlZGVuY2Ugb3ZlciB0aGUgb3RoZXJcclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YUNvbnRleHRJZHMpICYmIGRhdGFDb250ZXh0SWRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBncmlkUm93SW5kZXhlcyA9IHRoaXMuZGF0YVZpZXcubWFwSWRzVG9Sb3dzKGRhdGFDb250ZXh0SWRzKSB8fCBbXTtcclxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGdyaWRSb3dJbmRleGVzKSAmJiBncmlkUm93SW5kZXhlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgZGF0YUNvbnRleHRJZHMgPSB0aGlzLmRhdGFWaWV3Lm1hcFJvd3NUb0lkcyhncmlkUm93SW5kZXhlcykgfHwgW107XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5ncmlkU3RhdGVTZXJ2aWNlLnNlbGVjdGVkUm93RGF0YUNvbnRleHRJZHMgPSBkYXRhQ29udGV4dElkcztcclxuXHJcbiAgICAgIC8vIGNoYW5nZSB0aGUgc2VsZWN0ZWQgcm93cyBleGNlcHQgVU5MRVNTIGl0J3MgYSBMb2NhbCBHcmlkIHdpdGggUGFnaW5hdGlvblxyXG4gICAgICAvLyBsb2NhbCBQYWdpbmF0aW9uIHVzZXMgdGhlIERhdGFWaWV3IGFuZCB0aGF0IGFsc28gdHJpZ2dlciBhIGNoYW5nZS9yZWZyZXNoXHJcbiAgICAgIC8vIGFuZCB3ZSBkb24ndCB3YW50IHRvIHRyaWdnZXIgMiBHcmlkIFN0YXRlIGNoYW5nZXMganVzdCAxXHJcbiAgICAgIGlmICgodGhpcy5faXNMb2NhbEdyaWQgJiYgIXRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlUGFnaW5hdGlvbikgfHwgIXRoaXMuX2lzTG9jYWxHcmlkKSB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBpZiAodGhpcy5zbGlja0dyaWQgJiYgQXJyYXkuaXNBcnJheShncmlkUm93SW5kZXhlcykpIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlja0dyaWQuc2V0U2VsZWN0ZWRSb3dzKGdyaWRSb3dJbmRleGVzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBtZXJnZUdyaWRPcHRpb25zKGdyaWRPcHRpb25zOiBHcmlkT3B0aW9uKTogR3JpZE9wdGlvbiB7XHJcbiAgICBncmlkT3B0aW9ucy5ncmlkSWQgPSB0aGlzLmdyaWRJZDtcclxuICAgIGdyaWRPcHRpb25zLmdyaWRDb250YWluZXJJZCA9IGBzbGlja0dyaWRDb250YWluZXItJHt0aGlzLmdyaWRJZH1gO1xyXG5cclxuICAgIC8vIGlmIHdlIGhhdmUgYSBiYWNrZW5kU2VydmljZUFwaSBhbmQgdGhlIGVuYWJsZVBhZ2luYXRpb24gaXMgdW5kZWZpbmVkLCB3ZSdsbCBhc3N1bWUgdGhhdCB3ZSBkbyB3YW50IHRvIHNlZSBpdCwgZWxzZSBnZXQgdGhhdCBkZWZpbmVkIHZhbHVlXHJcbiAgICBncmlkT3B0aW9ucy5lbmFibGVQYWdpbmF0aW9uID0gKChncmlkT3B0aW9ucy5iYWNrZW5kU2VydmljZUFwaSAmJiBncmlkT3B0aW9ucy5lbmFibGVQYWdpbmF0aW9uID09PSB1bmRlZmluZWQpID8gdHJ1ZSA6IGdyaWRPcHRpb25zLmVuYWJsZVBhZ2luYXRpb24pIHx8IGZhbHNlO1xyXG5cclxuICAgIC8vIHVzZSBqcXVlcnkgZXh0ZW5kIHRvIGRlZXAgbWVyZ2UgJiBjb3B5IHRvIGF2b2lkIGltbXV0YWJsZSBwcm9wZXJ0aWVzIGJlaW5nIGNoYW5nZWQgaW4gR2xvYmFsR3JpZE9wdGlvbnMgYWZ0ZXIgYSByb3V0ZSBjaGFuZ2VcclxuICAgIGNvbnN0IG9wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCB7fSwgR2xvYmFsR3JpZE9wdGlvbnMsIHRoaXMuZm9yUm9vdENvbmZpZywgZ3JpZE9wdGlvbnMpIGFzIEdyaWRPcHRpb247XHJcblxyXG4gICAgLy8gdXNpbmcgalF1ZXJ5IGV4dGVuZCB0byBkbyBhIGRlZXAgY2xvbmUgaGFzIGFuIHVud2FudGVkIHNpZGUgb24gb2JqZWN0cyBhbmQgcGFnZVNpemVzIGJ1dCBFUzYgc3ByZWFkIGhhcyBvdGhlciB3b3JzdCBzaWRlIGVmZmVjdHNcclxuICAgIC8vIHNvIHdlIHdpbGwganVzdCBvdmVyd3JpdGUgdGhlIHBhZ2VTaXplcyB3aGVuIG5lZWRlZCwgdGhpcyBpcyB0aGUgb25seSBvbmUgY2F1c2luZyBpc3N1ZXMgc28gZmFyLlxyXG4gICAgLy8galF1ZXJ5IHdyb3RlIHRoaXMgb24gdGhlaXIgZG9jczo6IE9uIGEgZGVlcCBleHRlbmQsIE9iamVjdCBhbmQgQXJyYXkgYXJlIGV4dGVuZGVkLCBidXQgb2JqZWN0IHdyYXBwZXJzIG9uIHByaW1pdGl2ZSB0eXBlcyBzdWNoIGFzIFN0cmluZywgQm9vbGVhbiwgYW5kIE51bWJlciBhcmUgbm90LlxyXG4gICAgaWYgKG9wdGlvbnM/LnBhZ2luYXRpb24gJiYgKGdyaWRPcHRpb25zLmVuYWJsZVBhZ2luYXRpb24gfHwgZ3JpZE9wdGlvbnMuYmFja2VuZFNlcnZpY2VBcGkpICYmICh0aGlzLmZvclJvb3RDb25maWcucGFnaW5hdGlvbiB8fCBncmlkT3B0aW9ucy5wYWdpbmF0aW9uKSkge1xyXG4gICAgICBvcHRpb25zLnBhZ2luYXRpb24ucGFnZVNpemUgPSBncmlkT3B0aW9ucy5wYWdpbmF0aW9uPy5wYWdlU2l6ZSA/PyB0aGlzLmZvclJvb3RDb25maWcucGFnaW5hdGlvbj8ucGFnZVNpemUgPz8gR2xvYmFsR3JpZE9wdGlvbnMucGFnaW5hdGlvbiEucGFnZVNpemU7XHJcbiAgICAgIG9wdGlvbnMucGFnaW5hdGlvbi5wYWdlU2l6ZXMgPSBncmlkT3B0aW9ucy5wYWdpbmF0aW9uPy5wYWdlU2l6ZXMgPz8gdGhpcy5mb3JSb290Q29uZmlnLnBhZ2luYXRpb24/LnBhZ2VTaXplcyA/PyBHbG9iYWxHcmlkT3B0aW9ucy5wYWdpbmF0aW9uIS5wYWdlU2l6ZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWxzbyBtYWtlIHN1cmUgdG8gc2hvdyB0aGUgaGVhZGVyIHJvdyBpZiB1c2VyIGhhdmUgZW5hYmxlZCBmaWx0ZXJpbmdcclxuICAgIHRoaXMuX2hpZGVIZWFkZXJSb3dBZnRlclBhZ2VMb2FkID0gKG9wdGlvbnMuc2hvd0hlYWRlclJvdyA9PT0gZmFsc2UpO1xyXG4gICAgaWYgKG9wdGlvbnMuZW5hYmxlRmlsdGVyaW5nICYmICFvcHRpb25zLnNob3dIZWFkZXJSb3cpIHtcclxuICAgICAgb3B0aW9ucy5zaG93SGVhZGVyUm93ID0gb3B0aW9ucy5lbmFibGVGaWx0ZXJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gd2hlbiB3ZSB1c2UgUGFnaW5hdGlvbiBvbiBMb2NhbCBHcmlkLCBpdCBkb2Vzbid0IHNlZW0gdG8gd29yayB3aXRob3V0IGVuYWJsZUZpbHRlcmluZ1xyXG4gICAgLy8gc28gd2UnbGwgZW5hYmxlIHRoZSBmaWx0ZXJpbmcgYnV0IHdlJ2xsIGtlZXAgdGhlIGhlYWRlciByb3cgaGlkZGVuXHJcbiAgICBpZiAob3B0aW9ucyAmJiAhb3B0aW9ucy5lbmFibGVGaWx0ZXJpbmcgJiYgb3B0aW9ucy5lbmFibGVQYWdpbmF0aW9uICYmIHRoaXMuX2lzTG9jYWxHcmlkKSB7XHJcbiAgICAgIG9wdGlvbnMuZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZTtcclxuICAgICAgb3B0aW9ucy5zaG93SGVhZGVyUm93ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuX2hpZGVIZWFkZXJSb3dBZnRlclBhZ2VMb2FkID0gdHJ1ZTtcclxuICAgICAgaWYgKHRoaXMuc2hhcmVkU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMuc2hhcmVkU2VydmljZS5oaWRlSGVhZGVyUm93QWZ0ZXJQYWdlTG9hZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3B0aW9ucztcclxuICB9XHJcblxyXG4gIC8qKiBQcmUtUmVnaXN0ZXIgYW55IFJlc291cmNlIHRoYXQgZG9uJ3QgcmVxdWlyZSBTbGlja0dyaWQgdG8gYmUgaW5zdGFudGlhdGVkIChmb3IgZXhhbXBsZSBSeEpTIFJlc291cmNlICYgUm93RGV0YWlsKSAqL1xyXG4gIHByaXZhdGUgcHJlUmVnaXN0ZXJSZXNvdXJjZXMoKSB7XHJcbiAgICB0aGlzLl9yZWdpc3RlcmVkUmVzb3VyY2VzID0gdGhpcy5ncmlkT3B0aW9ucy5yZWdpc3RlckV4dGVybmFsUmVzb3VyY2VzIHx8IFtdO1xyXG5cclxuICAgIC8vIEFuZ3VsYXItU2xpY2tncmlkIHJlcXVpcmVzIFJ4SlMsIHNvIHdlJ2xsIHJlZ2lzdGVyIGl0IGFzIHRoZSBmaXJzdCByZXNvdXJjZVxyXG4gICAgdGhpcy5yZWdpc3RlclJ4SnNSZXNvdXJjZShuZXcgUnhKc1Jlc291cmNlKCkgYXMgUnhKc0ZhY2FkZSk7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlUm93RGV0YWlsVmlldykge1xyXG4gICAgICB0aGlzLnNsaWNrUm93RGV0YWlsVmlldyA9IG5ldyBTbGlja1Jvd0RldGFpbFZpZXcodGhpcy5hbmd1bGFyVXRpbFNlcnZpY2UsIHRoaXMuYXBwUmVmLCB0aGlzLl9ldmVudFB1YlN1YlNlcnZpY2UsIHRoaXMuZWxtLm5hdGl2ZUVsZW1lbnQsIHRoaXMucnhqcyk7XHJcbiAgICAgIHRoaXMuc2xpY2tSb3dEZXRhaWxWaWV3LmNyZWF0ZSh0aGlzLmNvbHVtbkRlZmluaXRpb25zLCB0aGlzLmdyaWRPcHRpb25zKTtcclxuICAgICAgdGhpcy5fcmVnaXN0ZXJlZFJlc291cmNlcy5wdXNoKHRoaXMuc2xpY2tSb3dEZXRhaWxWaWV3KTtcclxuICAgICAgdGhpcy5leHRlbnNpb25TZXJ2aWNlLmFkZEV4dGVuc2lvblRvTGlzdChFeHRlbnNpb25OYW1lLnJvd0RldGFpbFZpZXcsIHsgbmFtZTogRXh0ZW5zaW9uTmFtZS5yb3dEZXRhaWxWaWV3LCBpbnN0YW5jZTogdGhpcy5zbGlja1Jvd0RldGFpbFZpZXcgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlZ2lzdGVyUmVzb3VyY2VzKCkge1xyXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgd2UgY29uc2lkZXIgYWxsIHRoZSByZWdpc3RlcmVkIHNlcnZpY2VzIGFzIGV4dGVybmFsIHNlcnZpY2VzLCBhbnl0aGluZyBlbHNlIHJlZ2lzdGVyZWQgYWZ0ZXJ3YXJkIGFyZW4ndCBleHRlcm5hbFxyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5fcmVnaXN0ZXJlZFJlc291cmNlcykpIHtcclxuICAgICAgdGhpcy5zaGFyZWRTZXJ2aWNlLmV4dGVybmFsUmVnaXN0ZXJlZFJlc291cmNlcyA9IHRoaXMuX3JlZ2lzdGVyZWRSZXNvdXJjZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHVzaCBhbGwgb3RoZXIgU2VydmljZXMgdGhhdCB3ZSB3YW50IHRvIGJlIHJlZ2lzdGVyZWRcclxuICAgIHRoaXMuX3JlZ2lzdGVyZWRSZXNvdXJjZXMucHVzaCh0aGlzLmdyaWRTZXJ2aWNlLCB0aGlzLmdyaWRTdGF0ZVNlcnZpY2UpO1xyXG5cclxuICAgIC8vIHdoZW4gdXNpbmcgR3JvdXBpbmcvRHJhZ2dhYmxlR3JvdXBpbmcvQ29sc3BhbiByZWdpc3RlciBpdHMgU2VydmljZVxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuY3JlYXRlUHJlSGVhZGVyUGFuZWwgJiYgIXRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlRHJhZ2dhYmxlR3JvdXBpbmcpIHtcclxuICAgICAgdGhpcy5fcmVnaXN0ZXJlZFJlc291cmNlcy5wdXNoKHRoaXMuZ3JvdXBpbmdTZXJ2aWNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB3aGVuIHVzaW5nIFRyZWUgRGF0YSBWaWV3LCByZWdpc3RlciBpdHMgU2VydmljZVxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlVHJlZURhdGEpIHtcclxuICAgICAgdGhpcy5fcmVnaXN0ZXJlZFJlc291cmNlcy5wdXNoKHRoaXMudHJlZURhdGFTZXJ2aWNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB3aGVuIHVzZXIgZW5hYmxlcyB0cmFuc2xhdGlvbiwgd2UgbmVlZCB0byB0cmFuc2xhdGUgSGVhZGVycyBvbiBmaXJzdCBwYXNzICYgc3Vic2VxdWVudGx5IGluIHRoZSBiaW5kRGlmZmVyZW50SG9va3NcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmVuYWJsZVRyYW5zbGF0ZSkge1xyXG4gICAgICB0aGlzLmV4dGVuc2lvblNlcnZpY2UudHJhbnNsYXRlQ29sdW1uSGVhZGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFsc28gaW5pdGlhbGl6ZSAocmVuZGVyKSB0aGUgZW1wdHkgd2FybmluZyBjb21wb25lbnRcclxuICAgIHRoaXMuc2xpY2tFbXB0eVdhcm5pbmcgPSBuZXcgU2xpY2tFbXB0eVdhcm5pbmdDb21wb25lbnQoKTtcclxuICAgIHRoaXMuX3JlZ2lzdGVyZWRSZXNvdXJjZXMucHVzaCh0aGlzLnNsaWNrRW1wdHlXYXJuaW5nKTtcclxuXHJcbiAgICAvLyBiaW5kICYgaW5pdGlhbGl6ZSBhbGwgQ29tcG9uZW50cy9TZXJ2aWNlcyB0aGF0IHdlcmUgdGFnZ2VkIGFzIGVuYWJsZWRcclxuICAgIC8vIHJlZ2lzdGVyIGFsbCBzZXJ2aWNlcyBieSBleGVjdXRpbmcgdGhlaXIgaW5pdCBtZXRob2QgYW5kIHByb3ZpZGluZyB0aGVtIHdpdGggdGhlIEdyaWQgb2JqZWN0XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl9yZWdpc3RlcmVkUmVzb3VyY2VzKSkge1xyXG4gICAgICBmb3IgKGNvbnN0IHJlc291cmNlIG9mIHRoaXMuX3JlZ2lzdGVyZWRSZXNvdXJjZXMpIHtcclxuICAgICAgICBpZiAodGhpcy5zbGlja0dyaWQgJiYgdHlwZW9mIHJlc291cmNlLmluaXQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIHJlc291cmNlLmluaXQodGhpcy5zbGlja0dyaWQsIHRoaXMuY29udGFpbmVyU2VydmljZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUmVnaXN0ZXIgdGhlIFJ4SlMgUmVzb3VyY2UgaW4gYWxsIG5lY2Vzc2FyeSBzZXJ2aWNlcyB3aGljaCB1c2VzICovXHJcbiAgcHJpdmF0ZSByZWdpc3RlclJ4SnNSZXNvdXJjZShyZXNvdXJjZTogUnhKc0ZhY2FkZSkge1xyXG4gICAgdGhpcy5yeGpzID0gcmVzb3VyY2U7XHJcbiAgICB0aGlzLmJhY2tlbmRVdGlsaXR5U2VydmljZS5hZGRSeEpzUmVzb3VyY2UodGhpcy5yeGpzKTtcclxuICAgIHRoaXMuZmlsdGVyRmFjdG9yeS5hZGRSeEpzUmVzb3VyY2UodGhpcy5yeGpzKTtcclxuICAgIHRoaXMuZmlsdGVyU2VydmljZS5hZGRSeEpzUmVzb3VyY2UodGhpcy5yeGpzKTtcclxuICAgIHRoaXMuc29ydFNlcnZpY2UuYWRkUnhKc1Jlc291cmNlKHRoaXMucnhqcyk7XHJcbiAgICB0aGlzLnBhZ2luYXRpb25TZXJ2aWNlLmFkZFJ4SnNSZXNvdXJjZSh0aGlzLnJ4anMpO1xyXG4gICAgdGhpcy5jb250YWluZXJTZXJ2aWNlLnJlZ2lzdGVySW5zdGFuY2UoJ1J4SnNSZXNvdXJjZScsIHRoaXMucnhqcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW5kZXIgKG9yIGRpc3Bvc2UpIHRoZSBQYWdpbmF0aW9uIENvbXBvbmVudCwgdXNlciBjYW4gb3B0aW9uYWxseSBwcm92aWRlIEZhbHNlICh0byBub3Qgc2hvdyBpdCkgd2hpY2ggd2lsbCBpbiB0ZXJtIGRpc3Bvc2Ugb2YgdGhlIFBhZ2luYXRpb24sXHJcbiAgICogYWxzbyB3aGlsZSBkaXNwb3Npbmcgd2UgY2FuIGNob29zZSB0byBvbWl0IHRoZSBkaXNwb3NhYmxlIG9mIHRoZSBQYWdpbmF0aW9uIFNlcnZpY2UgKGlmIHdlIGFyZSBzaW1wbHkgdG9nZ2xpbmcgdGhlIFBhZ2luYXRpb24sIHdlIHdhbnQgdG8ga2VlcCB0aGUgU2VydmljZSBhbGl2ZSlcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHNob3dQYWdpbmF0aW9uIC0gc2hvdyAobmV3IHJlbmRlcikgb3Igbm90IChkaXNwb3NlKSB0aGUgUGFnaW5hdGlvblxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gc2hvdWxkRGlzcG9zZVBhZ2luYXRpb25TZXJ2aWNlIC0gd2hlbiBkaXNwb3NpbmcgdGhlIFBhZ2luYXRpb24sIGRvIHdlIGFsc28gd2FudCB0byBkaXNwb3NlIG9mIHRoZSBQYWdpbmF0aW9uIFNlcnZpY2U/IChkZWZhdWx0cyB0byBUcnVlKVxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVuZGVyUGFnaW5hdGlvbihzaG93UGFnaW5hdGlvbiA9IHRydWUpIHtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zPy5lbmFibGVQYWdpbmF0aW9uICYmICF0aGlzLl9pc1BhZ2luYXRpb25Jbml0aWFsaXplZCAmJiBzaG93UGFnaW5hdGlvbikge1xyXG4gICAgICB0aGlzLnNsaWNrUGFnaW5hdGlvbiA9IG5ldyBTbGlja1BhZ2luYXRpb25Db21wb25lbnQodGhpcy5wYWdpbmF0aW9uU2VydmljZSwgdGhpcy5fZXZlbnRQdWJTdWJTZXJ2aWNlLCB0aGlzLnNoYXJlZFNlcnZpY2UsIHRoaXMudHJhbnNsYXRlclNlcnZpY2UpO1xyXG4gICAgICB0aGlzLnNsaWNrUGFnaW5hdGlvbi5yZW5kZXJQYWdpbmF0aW9uKHRoaXMuZ3JpZENvbnRhaW5lckVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpO1xyXG4gICAgICB0aGlzLl9pc1BhZ2luYXRpb25Jbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKCFzaG93UGFnaW5hdGlvbikge1xyXG4gICAgICBpZiAodGhpcy5zbGlja1BhZ2luYXRpb24pIHtcclxuICAgICAgICB0aGlzLnNsaWNrUGFnaW5hdGlvbi5kaXNwb3NlKCk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5faXNQYWdpbmF0aW9uSW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2VzIGEgZmxhdCBkYXRhc2V0IHdpdGggcGFyZW50L2NoaWxkIHJlbGF0aW9uc2hpcCwgc29ydCBpdCAodmlhIGl0cyB0cmVlIHN0cnVjdHVyZSkgYW5kIHJldHVybiB0aGUgc29ydGVkIGZsYXQgYXJyYXlcclxuICAgKiBAcGFyYW0ge0FycmF5PE9iamVjdD59IGZsYXREYXRhc2V0SW5wdXQgLSBmbGF0IGRhdGFzZXQgaW5wdXRcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGZvcmNlR3JpZFJlZnJlc2ggLSBvcHRpb25hbGx5IGZvcmNlIGEgZnVsbCBncmlkIHJlZnJlc2hcclxuICAgKiBAcmV0dXJucyB7QXJyYXk8T2JqZWN0Pn0gc29ydCBmbGF0IHBhcmVudC9jaGlsZCBkYXRhc2V0XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzb3J0VHJlZURhdGFzZXQ8VD4oZmxhdERhdGFzZXRJbnB1dDogVFtdLCBmb3JjZUdyaWRSZWZyZXNoID0gZmFsc2UpOiBUW10ge1xyXG4gICAgY29uc3QgcHJldkRhdGFzZXRMbiA9IHRoaXMuX2N1cnJlbnREYXRhc2V0TGVuZ3RoO1xyXG4gICAgbGV0IHNvcnRlZERhdGFzZXRSZXN1bHQ7XHJcbiAgICBsZXQgZmxhdERhdGFzZXRPdXRwdXQ6IGFueVtdID0gW107XHJcblxyXG4gICAgLy8gaWYgdGhlIGhpZXJhcmNoaWNhbCBkYXRhc2V0IHdhcyBhbHJlYWR5IGluaXRpYWxpemVkIHRoZW4gbm8gbmVlZCB0byByZS1jb252ZXJ0IGl0LCB3ZSBjYW4gdXNlIGl0IGRpcmVjdGx5IGZyb20gdGhlIHNoYXJlZCBzZXJ2aWNlIHJlZlxyXG4gICAgaWYgKHRoaXMuX2lzRGF0YXNldEhpZXJhcmNoaWNhbEluaXRpYWxpemVkICYmIHRoaXMuZGF0YXNldEhpZXJhcmNoaWNhbCkge1xyXG4gICAgICBzb3J0ZWREYXRhc2V0UmVzdWx0ID0gdGhpcy50cmVlRGF0YVNlcnZpY2Uuc29ydEhpZXJhcmNoaWNhbERhdGFzZXQodGhpcy5kYXRhc2V0SGllcmFyY2hpY2FsKTtcclxuICAgICAgZmxhdERhdGFzZXRPdXRwdXQgPSBzb3J0ZWREYXRhc2V0UmVzdWx0LmZsYXQ7XHJcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZmxhdERhdGFzZXRJbnB1dCkgJiYgZmxhdERhdGFzZXRJbnB1dC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zPy50cmVlRGF0YU9wdGlvbnM/LmluaXRpYWxTb3J0KSB7XHJcbiAgICAgICAgLy8gZWxzZSB3ZSBuZWVkIHRvIGZpcnN0IGNvbnZlcnQgdGhlIGZsYXQgZGF0YXNldCB0byBhIGhpZXJhcmNoaWNhbCBkYXRhc2V0IGFuZCB0aGVuIHNvcnRcclxuICAgICAgICBzb3J0ZWREYXRhc2V0UmVzdWx0ID0gdGhpcy50cmVlRGF0YVNlcnZpY2UuY29udmVydEZsYXRQYXJlbnRDaGlsZFRvVHJlZURhdGFzZXRBbmRTb3J0KGZsYXREYXRhc2V0SW5wdXQsIHRoaXMuX2NvbHVtbkRlZmluaXRpb25zLCB0aGlzLmdyaWRPcHRpb25zKTtcclxuICAgICAgICB0aGlzLnNoYXJlZFNlcnZpY2UuaGllcmFyY2hpY2FsRGF0YXNldCA9IHNvcnRlZERhdGFzZXRSZXN1bHQuaGllcmFyY2hpY2FsO1xyXG4gICAgICAgIGZsYXREYXRhc2V0T3V0cHV0ID0gc29ydGVkRGF0YXNldFJlc3VsdC5mbGF0O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGVsc2Ugd2UgYXNzdW1lIHRoYXQgdGhlIHVzZXIgcHJvdmlkZWQgYW4gYXJyYXkgdGhhdCBpcyBhbHJlYWR5IHNvcnRlZCAodXNlcidzIHJlc3BvbnNhYmlsaXR5KVxyXG4gICAgICAgIC8vIGFuZCBzbyB3ZSBjYW4gc2ltcGx5IGNvbnZlcnQgdGhlIGFycmF5IHRvIGEgdHJlZSBzdHJ1Y3R1cmUgYW5kIHdlJ3JlIGRvbmUsIG5vIG5lZWQgdG8gc29ydFxyXG4gICAgICAgIHRoaXMuc2hhcmVkU2VydmljZS5oaWVyYXJjaGljYWxEYXRhc2V0ID0gdGhpcy50cmVlRGF0YVNlcnZpY2UuY29udmVydEZsYXRQYXJlbnRDaGlsZFRvVHJlZURhdGFzZXQoZmxhdERhdGFzZXRJbnB1dCwgdGhpcy5ncmlkT3B0aW9ucyk7XHJcbiAgICAgICAgZmxhdERhdGFzZXRPdXRwdXQgPSBmbGF0RGF0YXNldElucHV0IHx8IFtdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgd2UgYWRkL3JlbW92ZSBpdGVtKHMpIGZyb20gdGhlIGRhdGFzZXQsIHdlIG5lZWQgdG8gYWxzbyByZWZyZXNoIG91ciB0cmVlIGRhdGEgZmlsdGVyc1xyXG4gICAgaWYgKGZsYXREYXRhc2V0SW5wdXQubGVuZ3RoID4gMCAmJiAoZm9yY2VHcmlkUmVmcmVzaCB8fCBmbGF0RGF0YXNldElucHV0Lmxlbmd0aCAhPT0gcHJldkRhdGFzZXRMbikpIHtcclxuICAgICAgdGhpcy5maWx0ZXJTZXJ2aWNlLnJlZnJlc2hUcmVlRGF0YUZpbHRlcnMoZmxhdERhdGFzZXRPdXRwdXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmbGF0RGF0YXNldE91dHB1dDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvciBjb252ZW5pZW5jZSB0byB0aGUgdXNlciwgd2UgcHJvdmlkZSB0aGUgcHJvcGVydHkgXCJlZGl0b3JcIiBhcyBhbiBBbmd1bGFyLVNsaWNrZ3JpZCBlZGl0b3IgY29tcGxleCBvYmplY3RcclxuICAgKiBob3dldmVyIFwiZWRpdG9yXCIgaXMgdXNlZCBpbnRlcm5hbGx5IGJ5IFNsaWNrR3JpZCBmb3IgaXQncyBvd24gRWRpdG9yIEZhY3RvcnlcclxuICAgKiBzbyBpbiBvdXIgbGliIHdlIHdpbGwgc3dhcCBcImVkaXRvclwiIGFuZCBjb3B5IGl0IGludG8gYSBuZXcgcHJvcGVydHkgY2FsbGVkIFwiaW50ZXJuYWxDb2x1bW5FZGl0b3JcIlxyXG4gICAqIHRoZW4gdGFrZSBiYWNrIFwiZWRpdG9yLm1vZGVsXCIgYW5kIG1ha2UgaXQgdGhlIG5ldyBcImVkaXRvclwiIHNvIHRoYXQgU2xpY2tHcmlkIEVkaXRvciBGYWN0b3J5IHN0aWxsIHdvcmtzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzd2FwSW50ZXJuYWxFZGl0b3JUb1NsaWNrR3JpZEZhY3RvcnlFZGl0b3IoY29sdW1uRGVmaW5pdGlvbnM6IENvbHVtbltdKSB7XHJcbiAgICBpZiAoY29sdW1uRGVmaW5pdGlvbnMuc29tZShjb2wgPT4gYCR7Y29sLmlkfWAuaW5jbHVkZXMoJy4nKSkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW0FuZ3VsYXItU2xpY2tncmlkXSBNYWtlIHN1cmUgdGhhdCBub25lIG9mIHlvdXIgQ29sdW1uIERlZmluaXRpb24gXCJpZFwiIHByb3BlcnR5IGluY2x1ZGVzIGEgZG90IGluIGl0cyBuYW1lIGJlY2F1c2UgdGhhdCB3aWxsIGNhdXNlIHNvbWUgcHJvYmxlbXMgd2l0aCB0aGUgRWRpdG9ycy4gRm9yIGV4YW1wbGUgaWYgeW91ciBjb2x1bW4gZGVmaW5pdGlvbiBcImZpZWxkXCIgcHJvcGVydHkgaXMgXCJ1c2VyLmZpcnN0TmFtZVwiIHRoZW4gdXNlIFwiZmlyc3ROYW1lXCIgYXMgdGhlIGNvbHVtbiBcImlkXCIuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbHVtbkRlZmluaXRpb25zLm1hcCgoY29sdW1uOiBDb2x1bW4gfCBhbnkpID0+IHtcclxuICAgICAgLy8gb24gZXZlcnkgRWRpdG9yIHRoYXQgaGF2ZSBhIFwiY29sbGVjdGlvbkFzeW5jXCIsIHJlc29sdmUgdGhlIGRhdGEgYW5kIGFzc2lnbiBpdCB0byB0aGUgXCJjb2xsZWN0aW9uXCIgcHJvcGVydHlcclxuICAgICAgaWYgKGNvbHVtbiAmJiBjb2x1bW4uZWRpdG9yICYmIGNvbHVtbi5lZGl0b3IuY29sbGVjdGlvbkFzeW5jKSB7XHJcbiAgICAgICAgdGhpcy5sb2FkRWRpdG9yQ29sbGVjdGlvbkFzeW5jKGNvbHVtbik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHsgLi4uY29sdW1uLCBlZGl0b3I6IGNvbHVtbi5lZGl0b3IgJiYgY29sdW1uLmVkaXRvci5tb2RlbCwgaW50ZXJuYWxDb2x1bW5FZGl0b3I6IHsgLi4uY29sdW1uLmVkaXRvciB9IH07XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdHJhbnNsYXRlQ29sdW1uSGVhZGVyVGl0bGVLZXlzKCkge1xyXG4gICAgLy8gdHJhbnNsYXRlIGFsbCBjb2x1bW5zIChpbmNsdWRpbmcgaGlkZGVuIGNvbHVtbnMpXHJcbiAgICB0aGlzLmV4dGVuc2lvblV0aWxpdHkudHJhbnNsYXRlSXRlbXModGhpcy5zaGFyZWRTZXJ2aWNlLmFsbENvbHVtbnMsICduYW1lS2V5JywgJ25hbWUnKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdHJhbnNsYXRlQ29sdW1uR3JvdXBLZXlzKCkge1xyXG4gICAgLy8gdHJhbnNsYXRlIGFsbCBjb2x1bW4gZ3JvdXBzIChpbmNsdWRpbmcgaGlkZGVuIGNvbHVtbnMpXHJcbiAgICB0aGlzLmV4dGVuc2lvblV0aWxpdHkudHJhbnNsYXRlSXRlbXModGhpcy5zaGFyZWRTZXJ2aWNlLmFsbENvbHVtbnMsICdjb2x1bW5Hcm91cEtleScsICdjb2x1bW5Hcm91cCcpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBcImludGVybmFsQ29sdW1uRWRpdG9yLmNvbGxlY3Rpb25cIiBwcm9wZXJ0eS5cclxuICAgKiBTaW5jZSB0aGlzIGlzIGNhbGxlZCBhZnRlciB0aGUgYXN5bmMgY2FsbCByZXNvbHZlcywgdGhlIHBvaW50ZXIgd2lsbCBub3QgYmUgdGhlIHNhbWUgYXMgdGhlIFwiY29sdW1uXCIgYXJndW1lbnQgcGFzc2VkLlxyXG4gICAqIE9uY2Ugd2UgZm91bmQgdGhlIG5ldyBwb2ludGVyLCB3ZSB3aWxsIHJlYXNzaWduIHRoZSBcImVkaXRvclwiIGFuZCBcImNvbGxlY3Rpb25cIiB0byB0aGUgXCJpbnRlcm5hbENvbHVtbkVkaXRvclwiIHNvIGl0IGhhcyBuZXdlc3QgY29sbGVjdGlvblxyXG4gICAqL1xyXG4gIHByaXZhdGUgdXBkYXRlRWRpdG9yQ29sbGVjdGlvbjxUID0gYW55Pihjb2x1bW46IENvbHVtbjxUPiwgbmV3Q29sbGVjdGlvbjogVFtdKSB7XHJcbiAgICAoY29sdW1uLmVkaXRvciBhcyBDb2x1bW5FZGl0b3IpLmNvbGxlY3Rpb24gPSBuZXdDb2xsZWN0aW9uO1xyXG4gICAgKGNvbHVtbi5lZGl0b3IgYXMgQ29sdW1uRWRpdG9yKS5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGZpbmQgdGhlIG5ldyBjb2x1bW4gcmVmZXJlbmNlIHBvaW50ZXIgJiByZS1hc3NpZ24gdGhlIG5ldyBlZGl0b3IgdG8gdGhlIGludGVybmFsQ29sdW1uRWRpdG9yXHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLmNvbHVtbkRlZmluaXRpb25zKSkge1xyXG4gICAgICBjb25zdCBjb2x1bW5SZWYgPSB0aGlzLmNvbHVtbkRlZmluaXRpb25zLmZpbmQoKGNvbDogQ29sdW1uKSA9PiBjb2wuaWQgPT09IGNvbHVtbi5pZCk7XHJcbiAgICAgIGlmIChjb2x1bW5SZWYpIHtcclxuICAgICAgICBjb2x1bW5SZWYuaW50ZXJuYWxDb2x1bW5FZGl0b3IgPSBjb2x1bW4uZWRpdG9yIGFzIENvbHVtbkVkaXRvcjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGdldCBjdXJyZW50IEVkaXRvciwgcmVtb3ZlIGl0IGZyb20gdGhlIERPTSB0aGVuIHJlLWVuYWJsZSBpdCBhbmQgcmUtcmVuZGVyIGl0IHdpdGggdGhlIG5ldyBjb2xsZWN0aW9uLlxyXG4gICAgY29uc3QgY3VycmVudEVkaXRvciA9IHRoaXMuc2xpY2tHcmlkLmdldENlbGxFZGl0b3IoKSBhcyBBdXRvY29tcGxldGVyRWRpdG9yIHwgU2VsZWN0RWRpdG9yO1xyXG4gICAgaWYgKGN1cnJlbnRFZGl0b3I/LmRpc2FibGUgJiYgY3VycmVudEVkaXRvcj8ucmVuZGVyRG9tRWxlbWVudCkge1xyXG4gICAgICBjdXJyZW50RWRpdG9yLmRlc3Ryb3koKTtcclxuICAgICAgY3VycmVudEVkaXRvci5kaXNhYmxlKGZhbHNlKTtcclxuICAgICAgY3VycmVudEVkaXRvci5yZW5kZXJEb21FbGVtZW50KG5ld0NvbGxlY3Rpb24pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCI8ZGl2IGlkPVwic2xpY2tHcmlkQ29udGFpbmVyLXt7Z3JpZElkfX1cIiBjbGFzcz1cImdyaWRQYW5lXCI+XHJcbiAgPGRpdiBhdHRyLmlkPSd7e2dyaWRJZH19JyBjbGFzcz1cInNsaWNrZ3JpZC1jb250YWluZXJcIiBzdHlsZT1cIndpZHRoOiAxMDAlXCI+XHJcbiAgPC9kaXY+XHJcbjwvZGl2PiJdfQ==