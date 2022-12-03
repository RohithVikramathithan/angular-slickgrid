import { unsubscribeAll, SlickRowSelectionModel, castObservableToPromise, addToArrayWhenNotExists, Filters, OperatorType, EventNamingStyle, FileType, DelimiterType, SlickgridConfig as SlickgridConfig$1, BackendUtilityService, GridEventService, SharedService, CollectionService, ExtensionUtility, FilterFactory, FilterService, ResizerService, SortService, TreeDataService, PaginationService, ExtensionService, GridStateService, GridService, GroupingAndColspanService, emptyElement, SlickGroupItemMetadataProvider, autoAddEditorFormatterToColumnsWithEditor, GridStateType, ExtensionName } from '@slickgrid-universal/common';
export * from '@slickgrid-universal/common';
import * as i0 from '@angular/core';
import { Injectable, Optional, EventEmitter, ApplicationRef, Component, Inject, Input, Output, NgModule } from '@angular/core';
import * as i1 from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { SlickRowDetailView as SlickRowDetailView$1 } from '@slickgrid-universal/row-detail-view-plugin';
import { Observable } from 'rxjs';
import * as DOMPurify from 'dompurify';
import 'slickgrid/dist/slick.core.min';
import 'slickgrid/dist/slick.interactions.min';
import 'slickgrid/dist/slick.grid.min';
import 'slickgrid/dist/slick.dataview.min';
import { EventPubSubService } from '@slickgrid-universal/event-pub-sub';
import { SlickEmptyWarningComponent } from '@slickgrid-universal/empty-warning-component';
import { SlickFooterComponent } from '@slickgrid-universal/custom-footer-component';
import { SlickPaginationComponent } from '@slickgrid-universal/pagination-component';
import { RxJsResource } from '@slickgrid-universal/rxjs-observable';
import { dequal } from 'dequal/lite';
import { CommonModule } from '@angular/common';

class AngularUtilService {
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

class ContainerService {
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

/**
 * This is a Translate Service Wrapper for Slickgrid-Universal monorepo lib to work properly,
 * it must implement Slickgrid-Universal TranslaterService interface to work properly
 */
class TranslaterService {
    constructor(translateService) {
        this.translateService = translateService;
    }
    /**
     * Method to return the current language used by the App
     * @return {string} current language
     */
    getCurrentLanguage() {
        return this.translateService?.currentLang ?? '';
    }
    /**
     * Method to set the language to use in the App and Translate Service
     * @param {string} language
     * @return {Promise} output
     */
    async use(newLang) {
        return this.translateService?.use?.(newLang);
    }
    /**
     * Method which receives a translation key and returns the translated value assigned to that key
     * @param {string} translation key
     * @return {string} translated value
     */
    translate(translationKey) {
        return this.translateService?.instant?.(translationKey || ' ');
    }
}
TranslaterService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: TranslaterService, deps: [{ token: i1.TranslateService, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
TranslaterService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: TranslaterService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: TranslaterService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.TranslateService, decorators: [{
                    type: Optional
                }] }]; } });

/**
 * Unsubscribe all Observables Subscriptions
 * It will return an empty array if it all went well
 * @param subscriptions
 */
function unsubscribeAllObservables(subscriptions) {
    if (Array.isArray(subscriptions)) {
        subscriptions.forEach((subscription) => {
            if (subscription && subscription.unsubscribe) {
                subscription.unsubscribe();
            }
        });
        subscriptions = [];
    }
    return subscriptions;
}

const ROW_DETAIL_CONTAINER_PREFIX = 'container_';
const PRELOAD_CONTAINER_PREFIX = 'container_loading';
class SlickRowDetailView extends SlickRowDetailView$1 {
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

/** Global Grid Options Defaults */
const GlobalGridOptions = {
    alwaysShowVerticalScroll: true,
    autoEdit: false,
    asyncEditorLoading: false,
    autoFitColumnsOnFirstLoad: true,
    autoResize: {
        applyResizeToContainer: true,
        calculateAvailableSizeBy: 'window',
        bottomPadding: 20,
        minHeight: 180,
        minWidth: 300,
        rightPadding: 0
    },
    cellHighlightCssClass: 'slick-cell-modified',
    checkboxSelector: {
        cssClass: 'slick-cell-checkboxsel'
    },
    columnPicker: {
        fadeSpeed: 0,
        hideForceFitButton: false,
        hideSyncResizeButton: true,
        headerColumnValueExtractor: pickerHeaderColumnValueExtractor
    },
    cellMenu: {
        autoAdjustDrop: true,
        autoAlignSide: true,
        hideCloseButton: true,
        hideCommandSection: false,
        hideOptionSection: false,
    },
    contextMenu: {
        autoAdjustDrop: true,
        autoAlignSide: true,
        hideCloseButton: true,
        hideClearAllGrouping: false,
        hideCollapseAllGroups: false,
        hideCommandSection: false,
        hideCopyCellValueCommand: false,
        hideExpandAllGroups: false,
        hideExportCsvCommand: false,
        hideExportExcelCommand: false,
        hideExportTextDelimitedCommand: true,
        hideMenuOnScroll: true,
        hideOptionSection: false,
        iconCopyCellValueCommand: 'fa fa-clone',
        iconExportCsvCommand: 'fa fa-download',
        iconExportExcelCommand: 'fa fa-file-excel-o text-success',
        iconExportTextDelimitedCommand: 'fa fa-download',
    },
    customFooterOptions: {
        dateFormat: 'YYYY-MM-DD, hh:mm a',
        hideRowSelectionCount: false,
        hideTotalItemCount: false,
        hideLastUpdateTimestamp: true,
        footerHeight: 25,
        leftContainerClass: 'col-xs-12 col-sm-5',
        rightContainerClass: 'col-xs-6 col-sm-7',
        metricSeparator: '|',
        metricTexts: {
            items: 'items',
            itemsKey: 'ITEMS',
            itemsSelected: 'items selected',
            itemsSelectedKey: 'ITEMS_SELECTED',
            of: 'of',
            ofKey: 'OF',
        }
    },
    dataView: {
        syncGridSelection: true,
        syncGridSelectionWithBackendService: false, // but disable it when using backend services
    },
    datasetIdPropertyName: 'id',
    defaultFilter: Filters.input,
    defaultBackendServiceFilterTypingDebounce: 500,
    defaultColumnSortFieldId: 'id',
    defaultFilterPlaceholder: '🔎︎',
    defaultFilterRangeOperator: OperatorType.rangeInclusive,
    editable: false,
    enableAutoResize: true,
    enableAutoSizeColumns: true,
    enableCellNavigation: false,
    enableColumnPicker: true,
    enableColumnReorder: true,
    enableColumnResizeOnDoubleClick: true,
    enableContextMenu: true,
    enableExcelExport: true,
    enableTextExport: false,
    enableFilterTrimWhiteSpace: false,
    enableGridMenu: true,
    enableHeaderMenu: true,
    enableEmptyDataWarningMessage: true,
    emptyDataWarning: {
        className: 'slick-empty-data-warning',
        message: 'No data to display.',
        messageKey: 'EMPTY_DATA_WARNING_MESSAGE',
        hideFrozenLeftWarning: false,
        hideFrozenRightWarning: false,
        leftViewportMarginLeft: '40%',
        rightViewportMarginLeft: '40%',
        frozenLeftViewportMarginLeft: '0px',
        frozenRightViewportMarginLeft: '40%',
    },
    enableMouseHoverHighlightRow: true,
    enableSorting: true,
    enableTextSelectionOnCells: true,
    eventNamingStyle: EventNamingStyle.camelCase,
    explicitInitialization: true,
    excelExportOptions: {
        addGroupIndentation: true,
        exportWithFormatter: false,
        filename: 'export',
        format: FileType.xlsx,
        groupingColumnHeaderTitle: 'Group By',
        groupCollapsedSymbol: '⮞',
        groupExpandedSymbol: '⮟',
        groupingAggregatorRowText: '',
        sanitizeDataExport: false,
    },
    textExportOptions: {
        delimiter: DelimiterType.comma,
        exportWithFormatter: false,
        filename: 'export',
        format: FileType.csv,
        groupingColumnHeaderTitle: 'Group By',
        groupingAggregatorRowText: '',
        sanitizeDataExport: false,
        useUtf8WithBom: true
    },
    filterTypingDebounce: 0,
    forceFitColumns: false,
    frozenHeaderWidthCalcDifferential: 0,
    gridMenu: {
        dropSide: 'left',
        commandLabels: {
            clearAllFiltersCommandKey: 'CLEAR_ALL_FILTERS',
            clearAllSortingCommandKey: 'CLEAR_ALL_SORTING',
            clearFrozenColumnsCommandKey: 'CLEAR_PINNING',
            exportCsvCommandKey: 'EXPORT_TO_CSV',
            exportExcelCommandKey: 'EXPORT_TO_EXCEL',
            exportTextDelimitedCommandKey: 'EXPORT_TO_TAB_DELIMITED',
            refreshDatasetCommandKey: 'REFRESH_DATASET',
            toggleFilterCommandKey: 'TOGGLE_FILTER_ROW',
            togglePreHeaderCommandKey: 'TOGGLE_PRE_HEADER_ROW',
        },
        hideClearAllFiltersCommand: false,
        hideClearAllSortingCommand: false,
        hideClearFrozenColumnsCommand: true,
        hideExportCsvCommand: false,
        hideExportExcelCommand: false,
        hideExportTextDelimitedCommand: true,
        hideForceFitButton: false,
        hideRefreshDatasetCommand: false,
        hideSyncResizeButton: true,
        hideToggleFilterCommand: false,
        hideTogglePreHeaderCommand: false,
        iconCssClass: 'fa fa-bars',
        iconClearAllFiltersCommand: 'fa fa-filter text-danger',
        iconClearAllSortingCommand: 'fa fa-unsorted text-danger',
        iconClearFrozenColumnsCommand: 'fa fa-times',
        iconExportCsvCommand: 'fa fa-download',
        iconExportExcelCommand: 'fa fa-file-excel-o text-success',
        iconExportTextDelimitedCommand: 'fa fa-download',
        iconRefreshDatasetCommand: 'fa fa-refresh',
        iconToggleFilterCommand: 'fa fa-random',
        iconTogglePreHeaderCommand: 'fa fa-random',
        menuWidth: 16,
        resizeOnShowHeaderRow: true,
        headerColumnValueExtractor: pickerHeaderColumnValueExtractor
    },
    headerMenu: {
        autoAlign: true,
        autoAlignOffset: 12,
        minWidth: 140,
        iconClearFilterCommand: 'fa fa-filter text-danger',
        iconClearSortCommand: 'fa fa-unsorted',
        iconFreezeColumns: 'fa fa-thumb-tack',
        iconSortAscCommand: 'fa fa-sort-amount-asc',
        iconSortDescCommand: 'fa fa-sort-amount-desc',
        iconColumnHideCommand: 'fa fa-times',
        iconColumnResizeByContentCommand: 'fa fa-arrows-h',
        hideColumnResizeByContentCommand: false,
        hideColumnHideCommand: false,
        hideClearFilterCommand: false,
        hideClearSortCommand: false,
        hideFreezeColumnsCommand: true,
        hideSortCommands: false
    },
    headerRowHeight: 35,
    multiColumnSort: true,
    numberedMultiColumnSort: true,
    tristateMultiColumnSort: false,
    sortColNumberInSeparateSpan: true,
    suppressActiveCellChangeOnEdit: true,
    pagination: {
        pageSizes: [10, 15, 20, 25, 30, 40, 50, 75, 100],
        pageSize: 25,
        totalItems: 0
    },
    // technically speaking the Row Detail requires the process & viewComponent but we'll ignore it just to set certain options
    rowDetailView: {
        collapseAllOnSort: true,
        cssClass: 'detail-view-toggle',
        panelRows: 1,
        keyPrefix: '__',
        useRowClick: false,
        useSimpleViewportCalc: true,
        saveDetailViewOnScroll: false,
    },
    rowHeight: 35,
    topPanelHeight: 35,
    translationNamespaceSeparator: ':',
    resetFilterSearchValueAfterOnBeforeCancellation: true,
    resizeByContentOnlyOnFirstLoad: true,
    resizeByContentOptions: {
        alwaysRecalculateColumnWidth: false,
        cellCharWidthInPx: 7.8,
        cellPaddingWidthInPx: 14,
        defaultRatioForStringType: 0.88,
        formatterPaddingWidthInPx: 0,
        maxItemToInspectCellContentWidth: 1000,
        maxItemToInspectSingleColumnWidthByContent: 5000,
        widthToRemoveFromExceededWidthReadjustment: 50,
    },
    treeDataOptions: {
        exportIndentMarginLeft: 5,
        exportIndentationLeadingChar: '͏͏͏͏͏͏͏͏͏·',
    }
};
/**
 * Value Extractor for both ColumnPicker & GridMenu Picker
 * when using Column Header Grouping, we'll prefix the column group title
 * else we'll simply return the column name title
 */
function pickerHeaderColumnValueExtractor(column) {
    const headerGroup = column && column.columnGroup || '';
    if (headerGroup) {
        return headerGroup + ' - ' + column.name;
    }
    return column && column.name || '';
}

class SlickgridConfig {
    constructor() {
        this.options = GlobalGridOptions;
    }
}

class Constants {
}
// English Locale texts when using only 1 Locale instead of I18N
Constants.locales = {
    TEXT_ALL_SELECTED: 'All Selected',
    TEXT_ALL_X_RECORDS_SELECTED: 'All {{x}} records selected',
    TEXT_APPLY_MASS_UPDATE: 'Apply Mass Update',
    TEXT_APPLY_TO_SELECTION: 'Update Selection',
    TEXT_CANCEL: 'Cancel',
    TEXT_CLEAR_ALL_FILTERS: 'Clear all Filters',
    TEXT_CLEAR_ALL_GROUPING: 'Clear all Grouping',
    TEXT_CLEAR_ALL_SORTING: 'Clear all Sorting',
    TEXT_CLEAR_PINNING: 'Unfreeze Columns/Rows',
    TEXT_CLONE: 'Clone',
    TEXT_COLLAPSE_ALL_GROUPS: 'Collapse all Groups',
    TEXT_CONTAINS: 'Contains',
    TEXT_COLUMNS: 'Columns',
    TEXT_COLUMN_RESIZE_BY_CONTENT: 'Resize by Content',
    TEXT_COMMANDS: 'Commands',
    TEXT_COPY: 'Copy',
    TEXT_EQUALS: 'Equals',
    TEXT_EQUAL_TO: 'Equal to',
    TEXT_ENDS_WITH: 'Ends With',
    TEXT_ERROR_EDITABLE_GRID_REQUIRED: 'Your grid must be editable in order to use the Composite Editor Modal.',
    TEXT_ERROR_ENABLE_CELL_NAVIGATION_REQUIRED: 'Composite Editor requires the flag "enableCellNavigation" to be set to True in your Grid Options.',
    TEXT_ERROR_NO_CHANGES_DETECTED: 'Sorry we could not detect any changes.',
    TEXT_ERROR_NO_EDITOR_FOUND: 'We could not find any Editor in your Column Definition.',
    TEXT_ERROR_NO_RECORD_FOUND: 'No records selected for edit or clone operation.',
    TEXT_ERROR_ROW_NOT_EDITABLE: 'Current row is not editable.',
    TEXT_ERROR_ROW_SELECTION_REQUIRED: 'You must select some rows before trying to apply new value(s).',
    TEXT_EXPAND_ALL_GROUPS: 'Expand all Groups',
    TEXT_EXPORT_TO_CSV: 'Export in CSV format',
    TEXT_EXPORT_TO_TEXT_FORMAT: 'Export in Text format (Tab delimited)',
    TEXT_EXPORT_TO_EXCEL: 'Export to Excel',
    TEXT_EXPORT_TO_TAB_DELIMITED: 'Export in Text format (Tab delimited)',
    TEXT_FORCE_FIT_COLUMNS: 'Force fit columns',
    TEXT_FREEZE_COLUMNS: 'Freeze Columns',
    TEXT_GREATER_THAN: 'Greater than',
    TEXT_GREATER_THAN_OR_EQUAL_TO: 'Greater than or equal to',
    TEXT_GROUP_BY: 'Group By',
    TEXT_HIDE_COLUMN: 'Hide Column',
    TEXT_ITEMS: 'items',
    TEXT_ITEMS_PER_PAGE: 'items per page',
    TEXT_ITEMS_SELECTED: 'items selected',
    TEXT_OF: 'of',
    TEXT_OK: 'OK',
    TEXT_LAST_UPDATE: 'Last Update',
    TEXT_LESS_THAN: 'Less than',
    TEXT_LESS_THAN_OR_EQUAL_TO: 'Less than or equal to',
    TEXT_NO_ELEMENTS_FOUND: 'Aucun élément trouvé',
    TEXT_NOT_CONTAINS: 'Not contains',
    TEXT_NOT_EQUAL_TO: 'Not equal to',
    TEXT_PAGE: 'Page',
    TEXT_REFRESH_DATASET: 'Refresh Dataset',
    TEXT_REMOVE_FILTER: 'Remove Filter',
    TEXT_REMOVE_SORT: 'Remove Sort',
    TEXT_SAVE: 'Save',
    TEXT_SELECT_ALL: 'Select All',
    TEXT_SYNCHRONOUS_RESIZE: 'Synchronous resize',
    TEXT_SORT_ASCENDING: 'Sort Ascending',
    TEXT_SORT_DESCENDING: 'Sort Descending',
    TEXT_STARTS_WITH: 'Starts With',
    TEXT_TOGGLE_FILTER_ROW: 'Toggle Filter Row',
    TEXT_TOGGLE_PRE_HEADER_ROW: 'Toggle Pre-Header Row',
    TEXT_X_OF_Y_SELECTED: '# of % selected',
    TEXT_X_OF_Y_MASS_SELECTED: '{{x}} of {{y}} selected',
};
Constants.treeDataProperties = {
    CHILDREN_PROP: 'children',
    COLLAPSED_PROP: '__collapsed',
    HAS_CHILDREN_PROP: '__hasChildren',
    TREE_LEVEL_PROP: '__treeLevel',
    PARENT_PROP: '__parentId',
};
// some Validation default texts
Constants.VALIDATION_REQUIRED_FIELD = 'Field is required';
Constants.VALIDATION_EDITOR_VALID_NUMBER = 'Please enter a valid number';
Constants.VALIDATION_EDITOR_VALID_INTEGER = 'Please enter a valid integer number';
Constants.VALIDATION_EDITOR_INTEGER_BETWEEN = 'Please enter a valid integer number between {{minValue}} and {{maxValue}}';
Constants.VALIDATION_EDITOR_INTEGER_MAX = 'Please enter a valid integer number that is lower than {{maxValue}}';
Constants.VALIDATION_EDITOR_INTEGER_MAX_INCLUSIVE = 'Please enter a valid integer number that is lower than or equal to {{maxValue}}';
Constants.VALIDATION_EDITOR_INTEGER_MIN = 'Please enter a valid integer number that is greater than {{minValue}}';
Constants.VALIDATION_EDITOR_INTEGER_MIN_INCLUSIVE = 'Please enter a valid integer number that is greater than or equal to {{minValue}}';
Constants.VALIDATION_EDITOR_NUMBER_BETWEEN = 'Please enter a valid number between {{minValue}} and {{maxValue}}';
Constants.VALIDATION_EDITOR_NUMBER_MAX = 'Please enter a valid number that is lower than {{maxValue}}';
Constants.VALIDATION_EDITOR_NUMBER_MAX_INCLUSIVE = 'Please enter a valid number that is lower than or equal to {{maxValue}}';
Constants.VALIDATION_EDITOR_NUMBER_MIN = 'Please enter a valid number that is greater than {{minValue}}';
Constants.VALIDATION_EDITOR_NUMBER_MIN_INCLUSIVE = 'Please enter a valid number that is greater than or equal to {{minValue}}';
Constants.VALIDATION_EDITOR_DECIMAL_BETWEEN = 'Please enter a valid number with a maximum of {{maxDecimal}} decimals';
Constants.VALIDATION_EDITOR_TEXT_LENGTH_BETWEEN = 'Please make sure your text length is between {{minLength}} and {{maxLength}} characters';
Constants.VALIDATION_EDITOR_TEXT_MAX_LENGTH = 'Please make sure your text is less than {{maxLength}} characters';
Constants.VALIDATION_EDITOR_TEXT_MAX_LENGTH_INCLUSIVE = 'Please make sure your text is less than or equal to {{maxLength}} characters';
Constants.VALIDATION_EDITOR_TEXT_MIN_LENGTH = 'Please make sure your text is more than {{minLength}} character(s)';
Constants.VALIDATION_EDITOR_TEXT_MIN_LENGTH_INCLUSIVE = 'Please make sure your text is at least {{minLength}} character(s)';

// import 3rd party vendor libs
class AngularSlickgridComponent {
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
        const slickgridConfig = new SlickgridConfig$1();
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
AngularSlickgridComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: AngularSlickgridComponent, deps: [{ token: AngularUtilService }, { token: i0.ApplicationRef }, { token: i0.ChangeDetectorRef }, { token: ContainerService }, { token: i0.ElementRef }, { token: i1.TranslateService, optional: true }, { token: TranslaterService, optional: true }, { token: 'config' }, { token: 'externalService' }], target: i0.ɵɵFactoryTarget.Component });
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
        }], ctorParameters: function () { return [{ type: AngularUtilService }, { type: i0.ApplicationRef }, { type: i0.ChangeDetectorRef }, { type: ContainerService }, { type: i0.ElementRef }, { type: i1.TranslateService, decorators: [{
                    type: Optional
                }] }, { type: TranslaterService, decorators: [{
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

class AngularSlickgridModule {
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

/**
 * Generated bundle index. Do not edit.
 */

export { AngularSlickgridComponent, AngularSlickgridModule, AngularUtilService, SlickRowDetailView, SlickgridConfig, unsubscribeAllObservables };
//# sourceMappingURL=angular-slickgrid.mjs.map
