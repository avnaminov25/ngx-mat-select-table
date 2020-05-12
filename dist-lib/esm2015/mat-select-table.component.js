/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { MatOption, MatSelect, MatSort, MatTable } from '@angular/material';
import { isArray, isNullOrUndefined, isNumber, isString } from 'util';
import { _isNumberValue } from '@angular/cdk/coercion';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { MatSelectSearchComponent } from 'ngx-mat-select-search';
/** @type {?} */
const MAX_SAFE_INTEGER = 9007199254740991;
export class MatSelectTableComponent {
    /**
     * @param {?} cd
     */
    constructor(cd) {
        this.cd = cd;
        this.nullRow = { id: null };
        this.close = new EventEmitter();
        this.completeRowList = [];
        this.completeValueList = [];
        this.controlValueAccessorKeys = [
            'formControl',
            'formControlName',
            'formGroup',
            'formGroupName',
            'formArray',
            'formArrayName'
        ];
        /**
         * Subject that emits when the component has been destroyed.
         */
        this._onDestroy = new Subject();
        this._onSelectOpen = new Subject();
        this._onOptionsChange = new Subject();
        this.tableColumnsMap = new Map();
        this.filterControls = new FormGroup({});
        this.overallFilterControl = new FormControl('');
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.multiple = this.multiple || false;
        this.matSelect.openedChange
            .pipe(takeUntil(this._onDestroy))
            .subscribe((/**
         * @param {?} opened
         * @return {?}
         */
        opened => {
            if (this.resetFiltersOnOpen !== false || !this.matOptions.length) {
                this.resetFilters();
            }
            this.overallSearchVisibleState = this.overallSearchVisible;
            if (this.resetSortOnOpen !== false) {
                this.sort.sort({ id: '', start: 'asc', disableClear: false });
            }
            if (!opened) {
                this.close.emit(!opened);
                return;
            }
            if (this.overallSearchEnabled) {
                this.proxyMatSelectSearchConfiguration(this.matSelectSearchConfigurator);
            }
            // ToDo: get rid of this workaround (updates header row [otherwise sort mechanism produces glitches])
            ((/** @type {?} */ (this.table)))._headerRowDefChanged = true;
            // Disable sort buttons to prevent sorting change on SPACE key pressed in filter field
            setTimeout((/**
             * @return {?}
             */
            () => [].forEach.call(this.tableRef.nativeElement.querySelectorAll('button.mat-sort-header-button'), (/**
             * @param {?} e
             * @return {?}
             */
            (e) => e.disabled = true))));
            // Patch the height of the panel to include the height of the header and footer
            /** @type {?} */
            const panelElement = this.matSelect.panel.nativeElement;
            /** @type {?} */
            const panelHeight = panelElement.getBoundingClientRect().height;
            /** @type {?} */
            let tableAdditionalHeight = 0;
            this.table
                ._getRenderedRows(this.table._headerRowOutlet)
                .concat(this.table._getRenderedRows(this.table._footerRowOutlet))
                .forEach((/**
             * @param {?} row
             * @return {?}
             */
            row => tableAdditionalHeight += row.getBoundingClientRect().height));
            if (!isNaN(panelHeight)) {
                panelElement.style.maxHeight = `${panelHeight + tableAdditionalHeight}px`;
            }
            if (!this.matSelectSearchConfigurator.disableScrollToActiveOnOptionsChanged
                && !isNullOrUndefined(this.matSelect._keyManager) && this.completeRowList.length > 0) {
                this._onSelectOpen.pipe(takeUntil(this._onDestroy), debounceTime(1), take(1)).subscribe((/**
                 * @return {?}
                 */
                () => {
                    /** @type {?} */
                    const firstValue = `${this.completeRowList[0].id}`;
                    for (let i = 0; i < this.tableDataSource.length; i++) {
                        if (`${this.tableDataSource[i].id}` === firstValue) {
                            this.matSelect._keyManager.setActiveItem(i);
                            try {
                                this.cd.detectChanges();
                            }
                            catch (ignored) {
                            }
                            break;
                        }
                    }
                }));
            }
        }));
        this.matSelect.valueChange
            .pipe(takeUntil(this._onDestroy))
            .subscribe((/**
         * @param {?} value
         * @return {?}
         */
        (value) => {
            if (!this.multiple) {
                return;
            }
            if (isArray(value) && value.length > 1 && value.some((/**
             * @param {?} v
             * @return {?}
             */
            v => v === ''))) {
                this.writeValue(value.filter((/**
                 * @param {?} v
                 * @return {?}
                 */
                v => v !== '')));
                try {
                    this.cd.detectChanges();
                }
                catch (ignored) {
                }
            }
            if (isArray(value) && value.length === 0) {
                this.checkAndResetSelection();
            }
        }));
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        merge(...[
            this._onOptionsChange,
            this.sort.sortChange,
            this.filterControls.valueChanges,
            this.overallFilterControl.valueChanges
        ])
            .pipe(takeUntil(this._onDestroy), debounceTime(100))
            .subscribe((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            const dataClone = [...((this.dataSource || { data: [] }).data || [])];
            if (this.addNullRow()) {
                dataClone.unshift(this.nullRow);
            }
            // Apply filtering
            if (this.overallSearchEnabled && this.overallSearchVisibleState) {
                this.applyOverallFilter(dataClone);
            }
            else {
                this.applyColumnLevelFilters(dataClone);
            }
            // Inherit default sorting options if sort not specified
            if (!this.sort.active && !isNullOrUndefined(this.defaultSort) && this.defaultSort.active) {
                this.sort.active = this.defaultSort.active;
                this.sort.direction = this.defaultSort.direction;
            }
            // Apply default or manual sorting
            this.tableDataSource = !this.sort.active ?
                dataClone : this.sortData(dataClone, this.sort.active, this.sort.direction);
            try {
                this.cd.detectChanges();
            }
            catch (ignored) {
            }
            this._onSelectOpen.next();
        }));
        // Manually sort data for this.matSelect.options (QueryList<MatOption>) and notify matSelect.options of changes
        // It's important to keep this.matSelect.options order synchronized with data in the table
        //     because this.matSelect.options (QueryList<MatOption>) doesn't update it's state after table data is changed
        this.matOptions.changes.subscribe((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            const options = {};
            this.matOptions.toArray()
                .filter((/**
             * @param {?} option
             * @return {?}
             */
            option => !isNullOrUndefined(option)))
                .forEach((/**
             * @param {?} option
             * @return {?}
             */
            option => options[`${option.value}`] = option));
            this.matSelect.options.reset(this.tableDataSource
                .filter((/**
             * @param {?} row
             * @return {?}
             */
            row => !isNullOrUndefined(options[`${row.id}`])))
                .map((/**
             * @param {?} row
             * @return {?}
             */
            row => options[`${row.id}`])));
            this.matSelect.options.notifyOnChanges();
        }));
        if (!isNullOrUndefined(this.matSelect._keyManager)) {
            // Subscribe on KeyManager changes to highlight the table rows accordingly
            this.matSelect._keyManager.change
                .pipe(takeUntil(this._onDestroy))
                .subscribe((/**
             * @param {?} activeRow
             * @return {?}
             */
            activeRow => this.tableActiveRow = activeRow));
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._onSelectOpen.complete();
        this._onDestroy.next();
        this._onDestroy.complete();
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnChange(fn) {
        /** @type {?} */
        const proxyFn = (/**
         * @param {?} value
         * @return {?}
         */
        (value) => {
            // ToDo: refactor - comparison mechanism isn't optimized. filteredOutRows is a map but completeValueList is an array
            if (this.multiple === true) {
                for (let i = this.completeValueList.length - 1; i >= 0; i--) {
                    if (this.filteredOutRows[`${this.completeValueList[i]}`] === undefined && value.indexOf(this.completeValueList[i]) === -1) {
                        this.completeValueList.splice(i, 1);
                    }
                }
                value
                    .filter((/**
                 * @param {?} choice
                 * @return {?}
                 */
                choice => this.completeValueList.indexOf(choice) === -1))
                    .forEach((/**
                 * @param {?} choice
                 * @return {?}
                 */
                choice => this.completeValueList.push(choice)));
                this.matSelect.value = this.completeValueList;
                fn(this.completeValueList);
                this.completeRowList.splice(0);
                ((this.dataSource || { data: [] }).data || [])
                    .filter((/**
                 * @param {?} row
                 * @return {?}
                 */
                row => this.completeValueList.indexOf(row.id) !== -1))
                    .forEach((/**
                 * @param {?} row
                 * @return {?}
                 */
                row => this.completeRowList.push(row)));
            }
            else {
                fn(value);
                this.completeRowList.splice(0);
                ((this.dataSource || { data: [] }).data || [])
                    .filter((/**
                 * @param {?} row
                 * @return {?}
                 */
                row => row.id === value))
                    .forEach((/**
                 * @param {?} row
                 * @return {?}
                 */
                row => this.completeRowList.push(row)));
            }
        });
        this.matSelect.registerOnChange(proxyFn);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnTouched(fn) {
        this.matSelect.registerOnTouched(fn);
    }
    /**
     * @param {?} isDisabled
     * @return {?}
     */
    setDisabledState(isDisabled) {
        this.matSelect.setDisabledState(isDisabled);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    writeValue(value) {
        this.updateCompleteRowList(value);
        this.matSelect.writeValue(value);
        if (this.matSelect.value !== value) {
            this.matSelect.value = value;
        }
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (!isNullOrUndefined(changes.resetFiltersOnOpen) && changes.resetFiltersOnOpen.currentValue !== false) {
            this.resetFilters();
        }
        if (!isNullOrUndefined(changes.dataSource)) {
            this.updateCompleteRowList(this.completeRowList.map((/**
             * @param {?} row
             * @return {?}
             */
            row => row.id)));
        }
        // Proxy @Input bindings to MatSelect
        if (!isNullOrUndefined(changes.matSelectConfigurator)) {
            /** @type {?} */
            const configuration = changes.matSelectConfigurator.currentValue;
            Object.keys(configuration)
                .filter((/**
             * @param {?} key
             * @return {?}
             */
            key => !['multiple', 'panelClass'].includes(key) && !this.controlValueAccessorKeys.includes(key)))
                .forEach((/**
             * @param {?} key
             * @return {?}
             */
            key => this.matSelect[key] = configuration[key]));
            /** @type {?} */
            const panelClass = [];
            panelClass.push('mat-select-search-table-panel');
            if (!isNullOrUndefined(configuration.panelClass)) {
                panelClass.push(configuration.panelClass);
            }
            if (this.overallSearchEnabled) {
                panelClass.push('mat-select-search-panel');
            }
            this.matSelect.panelClass = panelClass;
        }
        if (!isNullOrUndefined(changes.matSelectSearchConfigurator)) {
            this.proxyMatSelectSearchConfiguration(changes.matSelectSearchConfigurator.currentValue);
        }
        if (!isNullOrUndefined(changes.dataSource)
            && !isNullOrUndefined(changes.dataSource.currentValue)
            && isArray(changes.dataSource.currentValue.data)) {
            this.tableDataSource = [...changes.dataSource.currentValue.data];
            if (this.addNullRow()) {
                this.tableDataSource.unshift(this.nullRow);
            }
            this.tableColumns = ['_selection', ...changes.dataSource.currentValue.columns.map((/**
                 * @param {?} column
                 * @return {?}
                 */
                column => column.key))];
            this.tableColumnsMap.clear();
            changes.dataSource.currentValue.columns.forEach((/**
             * @param {?} column
             * @return {?}
             */
            column => this.tableColumnsMap.set(column.key, column)));
            this.applyProxyToArray(changes.dataSource.currentValue.data, (/**
             * @return {?}
             */
            () => {
                this._onOptionsChange.next();
            }));
            this._onOptionsChange.next();
        }
    }
    /**
     * @param {?} event
     * @return {?}
     */
    emulateMatOptionClick(event) {
        if (event.composedPath()
            .filter((/**
         * @param {?} et
         * @return {?}
         */
        et => et instanceof HTMLElement))
            .some((/**
         * @param {?} et
         * @return {?}
         */
        (et) => et.tagName.toLowerCase() === 'mat-option'))) {
            return;
        }
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        /** @type {?} */
        let rowElement = event.target;
        while (rowElement != null && rowElement instanceof HTMLElement && rowElement.tagName.toLowerCase() !== 'tr') {
            rowElement = rowElement.parentElement;
        }
        if (rowElement === null) {
            return;
        }
        /** @type {?} */
        const childOption = rowElement.querySelector('mat-option');
        if (!childOption) {
            return;
        }
        childOption.click();
    }
    /**
     * @param {?} key
     * @return {?}
     */
    filterFormControl(key) {
        if (!this.filterControls.contains(key)) {
            this.filterControls.registerControl(key, new FormControl(''));
        }
        return (/** @type {?} */ (this.filterControls.get(key)));
    }
    /**
     * @param {?} value
     * @return {?}
     */
    simpleTriggerLabelFn(value) {
        if (!isNullOrUndefined(this.triggerLabelSort)) {
            this.sortData(value, this.triggerLabelSort.active, this.triggerLabelSort.direction);
        }
        return value.map((/**
         * @param {?} row
         * @return {?}
         */
        row => {
            if (isNullOrUndefined(row)) {
                return '';
            }
            if (isNullOrUndefined(this.customTriggerLabelTemplate)
                || typeof this.customTriggerLabelTemplate !== 'string'
                || this.customTriggerLabelTemplate.trim().length === 0) {
                return `${row.id}`;
            }
            /** @type {?} */
            let atLeastPartialSubstitution = false;
            /** @type {?} */
            const substitution = this.customTriggerLabelTemplate.replace(/[$]{1}[{]{1}([^}]+)[}]{1}?/g, (/**
             * @param {?} _
             * @param {?} key
             * @return {?}
             */
            (_, key) => !isNullOrUndefined(row[key]) && (atLeastPartialSubstitution = true) ? row[key] : ''));
            if (atLeastPartialSubstitution === false) {
                return `${row.id}`;
            }
            return substitution.trim();
        })).join(', ');
    }
    /**
     * @return {?}
     */
    toggleOverallSearch() {
        this.overallSearchVisibleState = !this.overallSearchVisibleState;
        this.resetFilters();
        if (this.overallSearchVisibleState) {
            setTimeout((/**
             * @return {?}
             */
            () => this.matSelectSearch._focus()));
        }
    }
    /**
     * @private
     * @param {?} value
     * @return {?}
     */
    updateCompleteRowList(value) {
        this.completeRowList.splice(0);
        this.completeValueList.splice(0);
        if (isNullOrUndefined(value)) {
            return;
        }
        /** @type {?} */
        const valueArray = !isArray(value) ? [value] : value;
        valueArray
            .filter((/**
         * @param {?} valueId
         * @return {?}
         */
        valueId => !isNullOrUndefined(valueId)))
            .forEach((/**
         * @param {?} valueId
         * @return {?}
         */
        valueId => {
            ((this.dataSource || { data: [] }).data || [])
                .filter((/**
             * @param {?} row
             * @return {?}
             */
            row => !isNullOrUndefined(row) && !isNullOrUndefined(row.id) && row.id === valueId))
                .forEach((/**
             * @param {?} row
             * @return {?}
             */
            row => {
                this.completeRowList.push(row);
                this.completeValueList.push(row.id);
            }));
        }));
    }
    /**
     * @private
     * @param {?} configuration
     * @return {?}
     */
    proxyMatSelectSearchConfiguration(configuration) {
        if (isNullOrUndefined(this.matSelectSearch)) {
            return;
        }
        // Proxy @Input bindings to NgxMatSelectSearch
        Object.keys(configuration)
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        key => !['clearSearchInput'].includes(key) && !this.controlValueAccessorKeys.includes(key)))
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        key => this.matSelectSearch[key] = configuration[key]));
    }
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    applyColumnLevelFilters(data) {
        this.filteredOutRows = {};
        /** @type {?} */
        const filters = {};
        Object.keys(this.filterControls.controls)
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        key => this.tableColumnsMap.has(key)
            && !isNullOrUndefined(this.tableColumnsMap.get(key).filter)
            // If filter is enabled
            && this.tableColumnsMap.get(key).filter.enabled !== false))
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        key => {
            /** @type {?} */
            const value = this.filterControls.get(key).value;
            return !isNullOrUndefined(value)
                // If an array - check it's not empty
                && ((isArray(value) && value.length > 0)
                    // If string - check that not blank
                    || (typeof value === 'string' && value.trim().length > 0)
                    // If number - check that toString() is not blank
                    || (typeof value === 'number' && `${value}`.trim().length > 0));
        }))
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        key => filters[key] = {
            filter: this.tableColumnsMap.get(key).filter,
            value: this.filterControls.get(key).value
        }));
        /** @type {?} */
        const filterKeys = Object.keys(filters);
        for (let i = data.length - 1; i >= 0; i--) {
            for (let k = 0; k < filterKeys.length; k++) {
                /** @type {?} */
                const filterKey = filterKeys[k];
                /** @type {?} */
                const row = data[i];
                if (isNullOrUndefined(row)) {
                    return;
                }
                /** @type {?} */
                const cellValue = row[filterKey];
                if (isNullOrUndefined(cellValue)) {
                    data.splice(i, 1).forEach((/**
                     * @param {?} item
                     * @return {?}
                     */
                    item => this.filteredOutRows[`${item.id}`] = item));
                    continue;
                }
                /** @type {?} */
                const filter = filters[filterKey];
                /** @type {?} */
                const comparator = filter.filter.comparator;
                if (typeof filter.filter.comparatorFn === 'function') {
                    if (!filter.filter.comparatorFn.call(null, cellValue, filter.value, row)) {
                        data.splice(i, 1).forEach((/**
                         * @param {?} item
                         * @return {?}
                         */
                        item => this.filteredOutRows[`${item.id}`] = item));
                        break;
                    }
                }
                else if (isNullOrUndefined(comparator) || comparator === 'equals') {
                    if (filter.value !== cellValue) {
                        data.splice(i, 1).forEach((/**
                         * @param {?} item
                         * @return {?}
                         */
                        item => this.filteredOutRows[`${item.id}`] = item));
                        break;
                    }
                }
                else if (typeof cellValue === 'string' && typeof filter.value === 'string') {
                    /** @type {?} */
                    const cellValueLC = `${cellValue}`.toLowerCase();
                    /** @type {?} */
                    const filterValueLC = filter.value.toLowerCase();
                    if (isNullOrUndefined(comparator) || comparator === 'equalsIgnoreCase') {
                        if (filterValueLC !== cellValueLC) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            item => this.filteredOutRows[`${item.id}`] = item));
                            break;
                        }
                    }
                    else if (comparator === 'contains') {
                        if (cellValue.indexOf(filter.value) === -1) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            item => this.filteredOutRows[`${item.id}`] = item));
                            break;
                        }
                    }
                    else if (comparator === 'containsIgnoreCase') {
                        if (cellValueLC.indexOf(filterValueLC) === -1) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            item => this.filteredOutRows[`${item.id}`] = item));
                            break;
                        }
                    }
                    else if (comparator === 'startsWith') {
                        if (!cellValue.startsWith(filter.value)) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            item => this.filteredOutRows[`${item.id}`] = item));
                            break;
                        }
                    }
                    else if (comparator === 'startsWithIgnoreCase') {
                        if (!cellValueLC.startsWith(filterValueLC)) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            item => this.filteredOutRows[`${item.id}`] = item));
                            break;
                        }
                    }
                }
            }
        }
    }
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    applyOverallFilter(data) {
        this.filteredOutRows = {};
        if (isNullOrUndefined(this.overallFilterControl.value)) {
            return;
        }
        /** @type {?} */
        const filterValueLC = this.overallFilterControl.value.toLowerCase();
        if (filterValueLC.trim().length === 0) {
            return;
        }
        for (let i = data.length - 1; i >= 0; i--) {
            /** @type {?} */
            const row = data[i];
            /** @type {?} */
            let rowShouldBeFiltered = true;
            for (let j = this.dataSource.columns.length - 1; j >= 0; j--) {
                /** @type {?} */
                const key = this.dataSource.columns[j].key;
                /** @type {?} */
                const cellValue = row[key];
                if (isNullOrUndefined(cellValue)) {
                    continue;
                }
                /** @type {?} */
                const cellValueLC = `${cellValue}`.toLowerCase();
                if (cellValueLC.indexOf(filterValueLC) !== -1) {
                    rowShouldBeFiltered = false;
                    break;
                }
            }
            if (rowShouldBeFiltered) {
                data.splice(i, 1).forEach((/**
                 * @param {?} item
                 * @return {?}
                 */
                item => this.filteredOutRows[`${item.id}`] = item));
            }
        }
    }
    /**
     * @private
     * @param {?} array
     * @param {?} callback
     * @return {?}
     */
    applyProxyToArray(array, callback) {
        ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach((/**
         * @param {?} methodName
         * @return {?}
         */
        (methodName) => {
            array[methodName] = (/**
             * @return {?}
             */
            function () {
                /** @type {?} */
                const res = Array.prototype[methodName].apply(array, arguments);
                callback.apply(array, arguments); // finally call the callback supplied
                return res;
            });
        }));
    }
    /**
     * @private
     * @return {?}
     */
    resetFilters() {
        this.overallFilterControl.setValue('');
        Object.keys(this.filterControls.controls)
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        key => this.filterControls.get(key).setValue('')));
    }
    /**
     * Taken from {\@see MatTableDataSource#sortingDataAccessor}
     *
     * @private
     * @param {?} data
     * @param {?} active
     * @return {?}
     */
    sortingDataAccessor(data, active) {
        /** @type {?} */
        const value = ((/** @type {?} */ (data)))[active];
        if (_isNumberValue(value)) {
            /** @type {?} */
            const numberValue = Number(value);
            // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
            // leave them as strings. For more info: https://goo.gl/y5vbSg
            return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
        }
        return value;
    }
    /**
     * @private
     * @param {?} data
     * @param {?} active
     * @param {?} direction
     * @return {?}
     */
    sortData(data, active, direction) {
        if (!active || direction === '') {
            return data;
        }
        return data.sort((/**
         * @param {?} a
         * @param {?} b
         * @return {?}
         */
        (a, b) => {
            /** @type {?} */
            let aValue = this.sortingDataAccessor(a, active);
            /** @type {?} */
            let bValue = this.sortingDataAccessor(b, active);
            if (a.id === null) {
                return -1;
            }
            else if (b.id === null) {
                return 1;
            }
            // Both null/undefined/equal value check
            if (aValue === bValue) {
                return 0;
            }
            // One null value check
            if (isNullOrUndefined(aValue) && !isNullOrUndefined(bValue)) {
                return -1;
            }
            else if (!isNullOrUndefined(aValue) && isNullOrUndefined(bValue)) {
                return 1;
            }
            if (aValue instanceof Date) {
                aValue = aValue.getTime();
            }
            if (bValue instanceof Date) {
                bValue = bValue.getTime();
            }
            // User localeCompare for strings
            if (isString(aValue) && isString(bValue)) {
                return ((/** @type {?} */ (aValue))).localeCompare((/** @type {?} */ (bValue))) * (direction === 'asc' ? 1 : -1);
            }
            // Try to convert to a Number type
            aValue = isNaN((/** @type {?} */ (aValue))) ? `${aValue}` : +aValue;
            bValue = isNaN((/** @type {?} */ (bValue))) ? `${bValue}` : +bValue;
            // if one is number and other is String
            if (isString(aValue) && isNumber(bValue)) {
                return (1) * (direction === 'asc' ? 1 : -1);
            }
            if (isNumber(aValue) && isString(bValue)) {
                return (-1) * (direction === 'asc' ? 1 : -1);
            }
            // Compare as Numbers otherwise
            return (aValue > bValue ? 1 : -1) * (direction === 'asc' ? 1 : -1);
        }));
    }
    /**
     * @return {?}
     */
    addNullRow() {
        return !this.multiple && !isNullOrUndefined(this.labelForNullValue);
    }
    /**
     * @private
     * @return {?}
     */
    checkAndResetSelection() {
        if (this.matSelect.value && isArray(this.matSelect.value) && this.matSelect.value.length < 1
            && !isNullOrUndefined(this.resetOptionAction)) {
            this.resetOptionAction();
        }
    }
}
MatSelectTableComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-mat-select-table',
                template: "<mat-form-field>\r\n  <mat-select #componentSelect\r\n              [multiple]=\"multiple\"\r\n              disableRipple>\r\n\r\n    <mat-select-trigger>\r\n      <ng-container *ngIf=\"!customTriggerLabelFn\">{{simpleTriggerLabelFn(completeRowList)}}</ng-container>\r\n      <ng-container *ngIf=\"customTriggerLabelFn\">{{customTriggerLabelFn(completeRowList)}}</ng-container>\r\n    </mat-select-trigger>\r\n\r\n    <ngx-mat-select-search *ngIf=\"overallSearchEnabled\"\r\n                           [formControl]=\"overallFilterControl\"\r\n                           [clearSearchInput]=\"resetFiltersOnOpen\"\r\n                           [ngClass]=\"{hidden: overallSearchVisibleState !== true}\">\r\n      <mat-icon *ngIf=\"matSelectSearchConfigurator?.clearIcon\"\r\n                ngxMatSelectSearchClear\r\n                color=\"primary\">{{matSelectSearchConfigurator.clearIcon}}</mat-icon>\r\n    </ngx-mat-select-search>\r\n    <mat-icon *ngIf=\"overallSearchEnabled\"\r\n              (click)=\"toggleOverallSearch()\"\r\n              class=\"overall-search-toggle\"\r\n              color=\"primary\">{{overallSearchVisibleState ? 'arrow_back' : 'search'}}</mat-icon>\r\n\r\n    <table #table\r\n           mat-table\r\n           matSort\r\n           [dataSource]=\"tableDataSource\">\r\n\r\n      <ng-container *ngFor=\"let columnKey of tableColumns; let i = index\"\r\n                    [matColumnDef]=\"columnKey\"\r\n                    [ngSwitch]=\"columnKey\">\r\n\r\n        <ng-container *ngSwitchCase=\"'_selection'\">\r\n          <th mat-header-cell *matHeaderCellDef [ngClass]=\"{selection: true, hidden: !multiple}\"></th>\r\n          <td mat-cell *matCellDef=\"let row\" [ngClass]=\"{selection: true, hidden: !multiple}\">\r\n\t\t\t<mat-option [value]=\"row.id\" (click)=\"row.id === null && resetOptionAction ? resetOptionAction() : null\"></mat-option>\r\n          </td>\r\n        </ng-container>\r\n\r\n        <ng-container *ngSwitchDefault>\r\n          <th mat-header-cell\r\n              mat-sort-header\r\n              [disabled]=\"!tableColumnsMap.get(columnKey).sortable\"\r\n              *matHeaderCellDef>\r\n            <!-- Header cell -->\r\n            <ng-container [ngSwitch]=\"tableColumnsMap.get(columnKey).filter?.type\">\r\n              <ng-container *ngSwitchCase=\"'string'\"\r\n                            [ngTemplateOutlet]=\"filterTypeString\"\r\n                            [ngTemplateOutletContext]=\"{column: tableColumnsMap.get(columnKey)}\"></ng-container>\r\n\r\n              <div *ngSwitchDefault>{{tableColumnsMap.get(columnKey).name}}</div>\r\n            </ng-container>\r\n          </th>\r\n          <td mat-cell *matCellDef=\"let row\"\r\n              [colSpan]=\"addNullRow() && row.id === null && i === 1 ? tableColumns.length : 1\"\r\n              [ngStyle]=\"{display: addNullRow() && row.id === null && i !== 1 ? 'none' : ''}\"\r\n          >\r\n            {{addNullRow() && row.id === null && i === 1 ? labelForNullValue : row[columnKey]}}\r\n          </td>\r\n        </ng-container>\r\n\r\n      </ng-container>\r\n\r\n      <tr mat-header-row *matHeaderRowDef=\"tableColumns; sticky: true\"></tr>\r\n      <tr mat-row *matRowDef=\"let row; columns: tableColumns; let i = index\"\r\n          (click)=\"emulateMatOptionClick($event)\"\r\n          [ngClass]=\"{active: i === tableActiveRow}\"></tr>\r\n    </table>\r\n\r\n  </mat-select>\r\n</mat-form-field>\r\n\r\n<ng-template #filterTypeString\r\n             let-column='column'>\r\n  <mat-form-field\r\n    (click)=\"$event.stopPropagation()\"\r\n    class=\"filter\">\r\n    <input matInput\r\n           [formControl]=\"filterFormControl(column.key)\"\r\n           (keydown)=\"$event.stopPropagation()\"\r\n           (keyup)=\"$event.stopPropagation()\"\r\n           (keypress)=\"$event.stopPropagation()\"\r\n           [placeholder]=\"column.name\"/>\r\n  </mat-form-field>\r\n</ng-template>\r\n",
                exportAs: 'ngx-mat-select-table',
                changeDetection: ChangeDetectionStrategy.OnPush,
                providers: [
                    {
                        provide: NG_VALUE_ACCESSOR,
                        useExisting: forwardRef((/**
                         * @return {?}
                         */
                        () => MatSelectTableComponent)),
                        multi: true
                    }
                ],
                styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel{overflow-x:auto!important}::ng-deep .mat-select-panel.mat-select-search-table-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px;width:calc(100% - 26px)}::ng-deep .mat-select-panel.mat-select-search-table-panel table{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr{cursor:pointer;height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr mat-option{height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-bottom:0!important;box-shadow:inset 0 -1px 0 0 rgba(0,0,0,.12)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th[aria-sort] ::ng-deep .mat-sort-header-arrow{opacity:1!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
            }] }
];
/** @nocollapse */
MatSelectTableComponent.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
MatSelectTableComponent.propDecorators = {
    dataSource: [{ type: Input }],
    multiple: [{ type: Input }],
    overallSearchEnabled: [{ type: Input }],
    overallSearchVisible: [{ type: Input }],
    resetSortOnOpen: [{ type: Input }],
    resetFiltersOnOpen: [{ type: Input }],
    customTriggerLabelFn: [{ type: Input }],
    triggerLabelSort: [{ type: Input }],
    customTriggerLabelTemplate: [{ type: Input }],
    labelForNullValue: [{ type: Input }],
    matSelectConfigurator: [{ type: Input }],
    matSelectSearchConfigurator: [{ type: Input }],
    defaultSort: [{ type: Input }],
    resetOptionAction: [{ type: Input }],
    close: [{ type: Output }],
    matSelect: [{ type: ViewChild, args: ['componentSelect',] }],
    matSelectSearch: [{ type: ViewChild, args: [MatSelectSearchComponent,] }],
    sort: [{ type: ViewChild, args: [MatSort,] }],
    table: [{ type: ViewChild, args: [MatTable,] }],
    tableRef: [{ type: ViewChild, args: ['table', { read: ElementRef },] }],
    matOptions: [{ type: ViewChildren, args: [MatOption,] }]
};
if (false) {
    /**
     * Data Source for the table
     * @type {?}
     */
    MatSelectTableComponent.prototype.dataSource;
    /**
     * Multiple/Single mode for {\@see MatSelect#multiple} to initialize.
     * NB: switching between modes in runtime is not supported by {\@see MatSelect}
     * @type {?}
     */
    MatSelectTableComponent.prototype.multiple;
    /**
     * Whether or not overall search mode enabled. See {\@see MatSelectTableComponent}
     * @type {?}
     */
    MatSelectTableComponent.prototype.overallSearchEnabled;
    /**
     * Default is true
     * @type {?}
     */
    MatSelectTableComponent.prototype.overallSearchVisible;
    /**
     * Whether or not should {\@see MatSelectTableComponent} be visible on open. Default is true
     * @type {?}
     */
    MatSelectTableComponent.prototype.resetSortOnOpen;
    /**
     * Whether or not previous search should be cleared on open. Default is true
     * @type {?}
     */
    MatSelectTableComponent.prototype.resetFiltersOnOpen;
    /**
     * Function to customize the default label
     * @type {?}
     */
    MatSelectTableComponent.prototype.customTriggerLabelFn;
    /**
     * Sort option for values in the customTriggerLabelFn in Multiple mode.
     * @type {?}
     */
    MatSelectTableComponent.prototype.triggerLabelSort;
    /**
     * Template to customize the default trigger label. Has lesser priority than {\@see MatSelectTableComponent#customTriggerLabelFn}.
     * Substitution is case sensitive.
     * Example: ${name} ${id} - ${address}
     * @type {?}
     */
    MatSelectTableComponent.prototype.customTriggerLabelTemplate;
    /** @type {?} */
    MatSelectTableComponent.prototype.labelForNullValue;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.nullRow;
    /**
     * {\@see MatSelect} proxy inputs configurator
     * {\@see MatSelect#multiple} gets value from {\@see MatSelectTableComponent#multiple}
     * @type {?}
     */
    MatSelectTableComponent.prototype.matSelectConfigurator;
    /**
     * {\@see MatSelectSearchComponent} proxy inputs configurator
     * {\@see MatSelectSearchComponent#clearSearchInput} gets value from {\@see MatSelectTableComponent#resetFiltersOnOpen}
     * {\@see MatSelectSearchComponent} {\@see ControlValueAccessor} gets value from {\@see MatSelectTableComponent#overallFilterControl}
     * @type {?}
     */
    MatSelectTableComponent.prototype.matSelectSearchConfigurator;
    /**
     * Apply default sorting
     * @type {?}
     */
    MatSelectTableComponent.prototype.defaultSort;
    /** @type {?} */
    MatSelectTableComponent.prototype.resetOptionAction;
    /** @type {?} */
    MatSelectTableComponent.prototype.close;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.matSelect;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.matSelectSearch;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.sort;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.table;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.tableRef;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.matOptions;
    /** @type {?} */
    MatSelectTableComponent.prototype.tableDataSource;
    /** @type {?} */
    MatSelectTableComponent.prototype.tableColumns;
    /** @type {?} */
    MatSelectTableComponent.prototype.tableColumnsMap;
    /** @type {?} */
    MatSelectTableComponent.prototype.tableActiveRow;
    /** @type {?} */
    MatSelectTableComponent.prototype.filteredOutRows;
    /** @type {?} */
    MatSelectTableComponent.prototype.completeRowList;
    /** @type {?} */
    MatSelectTableComponent.prototype.overallSearchVisibleState;
    /** @type {?} */
    MatSelectTableComponent.prototype.overallFilterControl;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.filterControls;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.completeValueList;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.controlValueAccessorKeys;
    /**
     * Subject that emits when the component has been destroyed.
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype._onDestroy;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype._onSelectOpen;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype._onOptionsChange;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.cd;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbIm1hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBRUwsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsVUFBVSxFQUFFLFlBQVksRUFDeEIsVUFBVSxFQUNWLEtBQUssRUFHRyxNQUFNLEVBQ2QsU0FBUyxFQUVULFNBQVMsRUFDVCxZQUFZLEVBQ2IsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUF1QixXQUFXLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0YsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBMEMsTUFBTSxtQkFBbUIsQ0FBQztBQUNuSCxPQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHcEUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRzdELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDOztNQUV6RCxnQkFBZ0IsR0FBRyxnQkFBZ0I7QUFnQnpDLE1BQU0sT0FBTyx1QkFBdUI7Ozs7SUFpSGxDLFlBQW9CLEVBQXFCO1FBQXJCLE9BQUUsR0FBRixFQUFFLENBQW1CO1FBeEVqQyxZQUFPLEdBQXNCLEVBQUMsRUFBRSxFQUFFLElBQUksRUFBQyxDQUFDO1FBc0J0QyxVQUFLLEdBQTBCLElBQUksWUFB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QUVMLE1BQU07d0JBRU4sU0FBUyxTQUFDLGlCQUFpQjs4QkFFM0IsU0FBUyxTQUFDLHdCQUF3QjttQkFFbEMsU0FBUyxTQUFDLE9BQU87b0JBRWpCLFNBQVMsU0FBQyxRQUFRO3VCQUVsQixTQUFTLFNBQUMsT0FBTyxFQUFFLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQzt5QkFFckMsWUFBWSxTQUFDLFNBQVM7Ozs7Ozs7SUF4RXZCLDZDQUFpRTs7Ozs7O0lBTWpFLDJDQUEyQjs7Ozs7SUFHM0IsdURBQXVDOzs7OztJQUd2Qyx1REFBdUM7Ozs7O0lBR3ZDLGtEQUFrQzs7Ozs7SUFHbEMscURBQXFDOzs7OztJQUtyQyx1REFBc0U7Ozs7O0lBS3RFLG1EQUFnQzs7Ozs7OztJQU9oQyw2REFBNEM7O0lBRTVDLG9EQUFtQzs7Ozs7SUFDbkMsMENBQWdEOzs7Ozs7SUFNaEQsd0RBQXVEOzs7Ozs7O0lBT3ZELDhEQUE2RDs7Ozs7SUFLN0QsOENBQTJCOztJQUUzQixvREFBdUM7O0lBRXZDLHdDQUE0RDs7Ozs7SUFFNUQsNENBQTJEOzs7OztJQUUzRCxrREFBdUY7Ozs7O0lBRXZGLHVDQUEwQzs7Ozs7SUFFMUMsd0NBQWdFOzs7OztJQUVoRSwyQ0FBcUU7Ozs7O0lBRXJFLDZDQUFrRTs7SUFFbEUsa0RBQXFDOztJQUVyQywrQ0FBdUI7O0lBRXZCLGtEQUFtRDs7SUFFbkQsaURBQXVCOztJQUV2QixrREFBc0Q7O0lBRXRELGtEQUEwQzs7SUFFMUMsNERBQW1DOztJQUVuQyx1REFBa0M7Ozs7O0lBRWxDLGlEQUFrQzs7Ozs7SUFFbEMsb0RBQXNDOzs7OztJQUV0QywyREFPRTs7Ozs7O0lBR0YsNkNBQXlDOzs7OztJQUV6QyxnREFBNEM7Ozs7O0lBRTVDLG1EQUErQzs7Ozs7SUFFbkMscUNBQTZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBBZnRlclZpZXdJbml0LFxyXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxyXG4gIENoYW5nZURldGVjdG9yUmVmLFxyXG4gIENvbXBvbmVudCxcclxuICBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsXHJcbiAgZm9yd2FyZFJlZixcclxuICBJbnB1dCxcclxuICBPbkNoYW5nZXMsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCwgT3V0cHV0LFxyXG4gIFF1ZXJ5TGlzdCxcclxuICBTaW1wbGVDaGFuZ2VzLFxyXG4gIFZpZXdDaGlsZCxcclxuICBWaWV3Q2hpbGRyZW5cclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgRm9ybUNvbnRyb2wsIEZvcm1Hcm91cCwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuaW1wb3J0IHttZXJnZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7TWF0T3B0aW9uLCBNYXRTZWxlY3QsIE1hdFNvcnQsIE1hdFRhYmxlLCBNYXRUYWJsZURhdGFTb3VyY2UsIFNvcnQsIFNvcnREaXJlY3Rpb259IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsJztcclxuaW1wb3J0IHtpc0FycmF5LCBpc051bGxPclVuZGVmaW5lZCwgaXNOdW1iZXIsIGlzU3RyaW5nfSBmcm9tICd1dGlsJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZURhdGFTb3VyY2V9IGZyb20gJy4vTWF0U2VsZWN0VGFibGVEYXRhU291cmNlJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZVJvd30gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZVJvdyc7XHJcbmltcG9ydCB7X2lzTnVtYmVyVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XHJcbmltcG9ydCB7ZGVib3VuY2VUaW1lLCB0YWtlLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZUNvbHVtbn0gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZUNvbHVtbic7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVGaWx0ZXJ9IGZyb20gJy4vTWF0U2VsZWN0VGFibGVGaWx0ZXInO1xyXG5pbXBvcnQge01hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0gZnJvbSAnbmd4LW1hdC1zZWxlY3Qtc2VhcmNoJztcclxuXHJcbmNvbnN0IE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICduZ3gtbWF0LXNlbGVjdC10YWJsZScsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL21hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsczogWycuL21hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnNjc3MnXSxcclxuICBleHBvcnRBczogJ25neC1tYXQtc2VsZWN0LXRhYmxlJyxcclxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICBwcm92aWRlcnM6IFtcclxuICAgIHtcclxuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXHJcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50KSxcclxuICAgICAgbXVsdGk6IHRydWVcclxuICAgIH1cclxuICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgT25DaGFuZ2VzIHtcclxuXHJcbiAgLyoqIERhdGEgU291cmNlIGZvciB0aGUgdGFibGUgKi9cclxuICBASW5wdXQoKSBkYXRhU291cmNlOiBNYXRTZWxlY3RUYWJsZURhdGFTb3VyY2U8TWF0U2VsZWN0VGFibGVSb3c+O1xyXG5cclxuICAvKipcclxuICAgKiBNdWx0aXBsZS9TaW5nbGUgbW9kZSBmb3Ige0BzZWUgTWF0U2VsZWN0I211bHRpcGxlfSB0byBpbml0aWFsaXplLlxyXG4gICAqIE5COiBzd2l0Y2hpbmcgYmV0d2VlbiBtb2RlcyBpbiBydW50aW1lIGlzIG5vdCBzdXBwb3J0ZWQgYnkge0BzZWUgTWF0U2VsZWN0fVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG11bHRpcGxlOiBib29sZWFuO1xyXG5cclxuICAvKiogV2hldGhlciBvciBub3Qgb3ZlcmFsbCBzZWFyY2ggbW9kZSBlbmFibGVkLiBTZWUge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnR9ICovXHJcbiAgQElucHV0KCkgb3ZlcmFsbFNlYXJjaEVuYWJsZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBEZWZhdWx0IGlzIHRydWUgKi9cclxuICBASW5wdXQoKSBvdmVyYWxsU2VhcmNoVmlzaWJsZTogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgb3Igbm90IHNob3VsZCB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudH0gYmUgdmlzaWJsZSBvbiBvcGVuLiBEZWZhdWx0IGlzIHRydWUgKi9cclxuICBASW5wdXQoKSByZXNldFNvcnRPbk9wZW46IGJvb2xlYW47XHJcblxyXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCBwcmV2aW91cyBzZWFyY2ggc2hvdWxkIGJlIGNsZWFyZWQgb24gb3Blbi4gRGVmYXVsdCBpcyB0cnVlICovXHJcbiAgQElucHV0KCkgcmVzZXRGaWx0ZXJzT25PcGVuOiBib29sZWFuO1xyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0byBjdXN0b21pemUgdGhlIGRlZmF1bHQgbGFiZWxcclxuICAgKi9cclxuICBASW5wdXQoKSBjdXN0b21UcmlnZ2VyTGFiZWxGbjogKHZhbHVlOiBNYXRTZWxlY3RUYWJsZVJvd1tdKSA9PiBzdHJpbmc7XHJcblxyXG4gIC8qKlxyXG4gICAqIFNvcnQgb3B0aW9uIGZvciB2YWx1ZXMgaW4gdGhlIGN1c3RvbVRyaWdnZXJMYWJlbEZuIGluIE11bHRpcGxlIG1vZGUuXHJcbiAgICAqL1xyXG4gIEBJbnB1dCgpIHRyaWdnZXJMYWJlbFNvcnQ6IFNvcnQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlbXBsYXRlIHRvIGN1c3RvbWl6ZSB0aGUgZGVmYXVsdCB0cmlnZ2VyIGxhYmVsLiBIYXMgbGVzc2VyIHByaW9yaXR5IHRoYW4ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjY3VzdG9tVHJpZ2dlckxhYmVsRm59LlxyXG4gICAqIFN1YnN0aXR1dGlvbiBpcyBjYXNlIHNlbnNpdGl2ZS5cclxuICAgKiBFeGFtcGxlOiAke25hbWV9ICR7aWR9IC0gJHthZGRyZXNzfVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlOiBzdHJpbmc7XHJcblxyXG4gIEBJbnB1dCgpIGxhYmVsRm9yTnVsbFZhbHVlOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBudWxsUm93OiBNYXRTZWxlY3RUYWJsZVJvdyA9IHtpZDogbnVsbH07XHJcblxyXG4gIC8qKlxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdH0gcHJveHkgaW5wdXRzIGNvbmZpZ3VyYXRvclxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdCNtdWx0aXBsZX0gZ2V0cyB2YWx1ZSBmcm9tIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I211bHRpcGxlfVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG1hdFNlbGVjdENvbmZpZ3VyYXRvcjogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcclxuXHJcbiAgLyoqXHJcbiAgICoge0BzZWUgTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50fSBwcm94eSBpbnB1dHMgY29uZmlndXJhdG9yXHJcbiAgICoge0BzZWUgTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50I2NsZWFyU2VhcmNoSW5wdXR9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNyZXNldEZpbHRlcnNPbk9wZW59XHJcbiAgICoge0BzZWUgTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50fSB7QHNlZSBDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZ2V0cyB2YWx1ZSBmcm9tIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I292ZXJhbGxGaWx0ZXJDb250cm9sfVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvcjogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQXBwbHkgZGVmYXVsdCBzb3J0aW5nXHJcbiAgICovXHJcbiAgQElucHV0KCkgZGVmYXVsdFNvcnQ6IFNvcnQ7XHJcblxyXG4gIEBJbnB1dCgpIHJlc2V0T3B0aW9uQWN0aW9uOiAoKSA9PiB2b2lkO1xyXG5cclxuICBAT3V0cHV0KCkgY2xvc2U6IEV2ZW50RW1pdHRlcjxib29sZWFuPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgQFZpZXdDaGlsZCgnY29tcG9uZW50U2VsZWN0JykgcHJpdmF0ZSBtYXRTZWxlY3Q6IE1hdFNlbGVjdDtcclxuXHJcbiAgQFZpZXdDaGlsZChNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQpIHByaXZhdGUgbWF0U2VsZWN0U2VhcmNoOiBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQ7XHJcblxyXG4gIEBWaWV3Q2hpbGQoTWF0U29ydCkgcHJpdmF0ZSBzb3J0OiBNYXRTb3J0O1xyXG5cclxuICBAVmlld0NoaWxkKE1hdFRhYmxlKSBwcml2YXRlIHRhYmxlOiBNYXRUYWJsZTxNYXRTZWxlY3RUYWJsZVJvdz47XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ3RhYmxlJywge3JlYWQ6IEVsZW1lbnRSZWZ9KSBwcml2YXRlIHRhYmxlUmVmOiBFbGVtZW50UmVmO1xyXG5cclxuICBAVmlld0NoaWxkcmVuKE1hdE9wdGlvbikgcHJpdmF0ZSBtYXRPcHRpb25zOiBRdWVyeUxpc3Q8TWF0T3B0aW9uPjtcclxuXHJcbiAgdGFibGVEYXRhU291cmNlOiBNYXRTZWxlY3RUYWJsZVJvd1tdO1xyXG5cclxuICB0YWJsZUNvbHVtbnM6IHN0cmluZ1tdO1xyXG5cclxuICB0YWJsZUNvbHVtbnNNYXA6IE1hcDxzdHJpbmcsIE1hdFNlbGVjdFRhYmxlQ29sdW1uPjtcclxuXHJcbiAgdGFibGVBY3RpdmVSb3c6IG51bWJlcjtcclxuXHJcbiAgZmlsdGVyZWRPdXRSb3dzOiB7IFtrZXk6IHN0cmluZ106IE1hdFNlbGVjdFRhYmxlUm93IH07XHJcblxyXG4gIGNvbXBsZXRlUm93TGlzdDogTWF0U2VsZWN0VGFibGVSb3dbXSA9IFtdO1xyXG5cclxuICBvdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlOiBib29sZWFuO1xyXG5cclxuICBvdmVyYWxsRmlsdGVyQ29udHJvbDogRm9ybUNvbnRyb2w7XHJcblxyXG4gIHByaXZhdGUgZmlsdGVyQ29udHJvbHM6IEZvcm1Hcm91cDtcclxuXHJcbiAgcHJpdmF0ZSBjb21wbGV0ZVZhbHVlTGlzdDogYW55W10gPSBbXTtcclxuXHJcbiAgcHJpdmF0ZSBjb250cm9sVmFsdWVBY2Nlc3NvcktleXM6IHN0cmluZ1tdID0gW1xyXG4gICAgJ2Zvcm1Db250cm9sJyxcclxuICAgICdmb3JtQ29udHJvbE5hbWUnLFxyXG4gICAgJ2Zvcm1Hcm91cCcsXHJcbiAgICAnZm9ybUdyb3VwTmFtZScsXHJcbiAgICAnZm9ybUFycmF5JyxcclxuICAgICdmb3JtQXJyYXlOYW1lJ1xyXG4gIF07XHJcblxyXG4gIC8qKiBTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cclxuICBwcml2YXRlIF9vbkRlc3Ryb3kgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBwcml2YXRlIF9vblNlbGVjdE9wZW4gPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBwcml2YXRlIF9vbk9wdGlvbnNDaGFuZ2UgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikge1xyXG4gICAgdGhpcy50YWJsZUNvbHVtbnNNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLmZpbHRlckNvbnRyb2xzID0gbmV3IEZvcm1Hcm91cCh7fSk7XHJcbiAgICB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sID0gbmV3IEZvcm1Db250cm9sKCcnKTtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tdWx0aXBsZSA9IHRoaXMubXVsdGlwbGUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5vcGVuZWRDaGFuZ2VcclxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXHJcbiAgICAgIC5zdWJzY3JpYmUob3BlbmVkID0+IHtcclxuICAgICAgICBpZiAodGhpcy5yZXNldEZpbHRlcnNPbk9wZW4gIT09IGZhbHNlIHx8ICF0aGlzLm1hdE9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUgPSB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlO1xyXG4gICAgICAgIGlmICh0aGlzLnJlc2V0U29ydE9uT3BlbiAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgIHRoaXMuc29ydC5zb3J0KHtpZDogJycsIHN0YXJ0OiAnYXNjJywgZGlzYWJsZUNsZWFyOiBmYWxzZX0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW9wZW5lZCkge1xyXG4gICAgICAgICAgdGhpcy5jbG9zZS5lbWl0KCFvcGVuZWQpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCkge1xyXG4gICAgICAgICAgdGhpcy5wcm94eU1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRpb24odGhpcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUb0RvOiBnZXQgcmlkIG9mIHRoaXMgd29ya2Fyb3VuZCAodXBkYXRlcyBoZWFkZXIgcm93IFtvdGhlcndpc2Ugc29ydCBtZWNoYW5pc20gcHJvZHVjZXMgZ2xpdGNoZXNdKVxyXG4gICAgICAgICh0aGlzLnRhYmxlIGFzIGFueSkuX2hlYWRlclJvd0RlZkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIC8vIERpc2FibGUgc29ydCBidXR0b25zIHRvIHByZXZlbnQgc29ydGluZyBjaGFuZ2Ugb24gU1BBQ0Uga2V5IHByZXNzZWQgaW4gZmlsdGVyIGZpZWxkXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBbXS5mb3JFYWNoLmNhbGwoXHJcbiAgICAgICAgICB0aGlzLnRhYmxlUmVmLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uLm1hdC1zb3J0LWhlYWRlci1idXR0b24nKSxcclxuICAgICAgICAgIChlKSA9PiBlLmRpc2FibGVkID0gdHJ1ZSlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBQYXRjaCB0aGUgaGVpZ2h0IG9mIHRoZSBwYW5lbCB0byBpbmNsdWRlIHRoZSBoZWlnaHQgb2YgdGhlIGhlYWRlciBhbmQgZm9vdGVyXHJcbiAgICAgICAgY29uc3QgcGFuZWxFbGVtZW50OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMubWF0U2VsZWN0LnBhbmVsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgcGFuZWxIZWlnaHQgPSBwYW5lbEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgICAgIGxldCB0YWJsZUFkZGl0aW9uYWxIZWlnaHQgPSAwO1xyXG4gICAgICAgIHRoaXMudGFibGVcclxuICAgICAgICAgIC5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMudGFibGUuX2hlYWRlclJvd091dGxldClcclxuICAgICAgICAgIC5jb25jYXQodGhpcy50YWJsZS5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMudGFibGUuX2Zvb3RlclJvd091dGxldCkpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGFibGVBZGRpdGlvbmFsSGVpZ2h0ICs9IHJvdy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xyXG4gICAgICAgIGlmICghaXNOYU4ocGFuZWxIZWlnaHQpKSB7XHJcbiAgICAgICAgICBwYW5lbEVsZW1lbnQuc3R5bGUubWF4SGVpZ2h0ID0gYCR7cGFuZWxIZWlnaHQgKyB0YWJsZUFkZGl0aW9uYWxIZWlnaHR9cHhgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvci5kaXNhYmxlU2Nyb2xsVG9BY3RpdmVPbk9wdGlvbnNDaGFuZ2VkXHJcbiAgICAgICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIpICYmIHRoaXMuY29tcGxldGVSb3dMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHRoaXMuX29uU2VsZWN0T3Blbi5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpLCBkZWJvdW5jZVRpbWUoMSksIHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0VmFsdWUgPSBgJHt0aGlzLmNvbXBsZXRlUm93TGlzdFswXS5pZH1gO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudGFibGVEYXRhU291cmNlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGAke3RoaXMudGFibGVEYXRhU291cmNlW2ldLmlkfWAgPT09IGZpcnN0VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oaSk7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZWQpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHQgIFxyXG5cdHRoaXMubWF0U2VsZWN0LnZhbHVlQ2hhbmdlXHJcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgICAuc3Vic2NyaWJlKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIGlmICghdGhpcy5tdWx0aXBsZSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID4gMSAmJiB2YWx1ZS5zb21lKHYgPT4gdiA9PT0gJycpKSB7XHJcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUodmFsdWUuZmlsdGVyKHYgPT4gdiAhPT0gJycpKTtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgICAgICAgfSBjYXRjaCAoaWdub3JlZCkge1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICB0aGlzLmNoZWNrQW5kUmVzZXRTZWxlY3Rpb24oKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xyXG4gICAgbWVyZ2UoLi4uW1xyXG4gICAgICB0aGlzLl9vbk9wdGlvbnNDaGFuZ2UsXHJcbiAgICAgIHRoaXMuc29ydC5zb3J0Q2hhbmdlLFxyXG4gICAgICB0aGlzLmZpbHRlckNvbnRyb2xzLnZhbHVlQ2hhbmdlcyxcclxuICAgICAgdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC52YWx1ZUNoYW5nZXNcclxuICAgIF0pXHJcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpLCBkZWJvdW5jZVRpbWUoMTAwKSlcclxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZGF0YUNsb25lOiBNYXRTZWxlY3RUYWJsZVJvd1tdID0gWy4uLigodGhpcy5kYXRhU291cmNlIHx8IHtkYXRhOiBbXX0pLmRhdGEgfHwgW10pXTtcclxuICAgICAgICBpZiAodGhpcy5hZGROdWxsUm93KCkpIHtcclxuICAgICAgICAgIGRhdGFDbG9uZS51bnNoaWZ0KHRoaXMubnVsbFJvdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBseSBmaWx0ZXJpbmdcclxuICAgICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCAmJiB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUpIHtcclxuICAgICAgICAgIHRoaXMuYXBwbHlPdmVyYWxsRmlsdGVyKGRhdGFDbG9uZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuYXBwbHlDb2x1bW5MZXZlbEZpbHRlcnMoZGF0YUNsb25lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaGVyaXQgZGVmYXVsdCBzb3J0aW5nIG9wdGlvbnMgaWYgc29ydCBub3Qgc3BlY2lmaWVkXHJcbiAgICAgICAgaWYgKCF0aGlzLnNvcnQuYWN0aXZlICYmICFpc051bGxPclVuZGVmaW5lZCh0aGlzLmRlZmF1bHRTb3J0KSAmJiB0aGlzLmRlZmF1bHRTb3J0LmFjdGl2ZSkge1xyXG4gICAgICAgICAgdGhpcy5zb3J0LmFjdGl2ZSA9IHRoaXMuZGVmYXVsdFNvcnQuYWN0aXZlO1xyXG4gICAgICAgICAgdGhpcy5zb3J0LmRpcmVjdGlvbiA9IHRoaXMuZGVmYXVsdFNvcnQuZGlyZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwbHkgZGVmYXVsdCBvciBtYW51YWwgc29ydGluZ1xyXG4gICAgICAgIHRoaXMudGFibGVEYXRhU291cmNlID0gIXRoaXMuc29ydC5hY3RpdmUgP1xyXG4gICAgICAgICAgZGF0YUNsb25lIDogdGhpcy5zb3J0RGF0YShkYXRhQ2xvbmUsIHRoaXMuc29ydC5hY3RpdmUsIHRoaXMuc29ydC5kaXJlY3Rpb24pO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdGhpcy5jZC5kZXRlY3RDaGFuZ2VzKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoaWdub3JlZCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fb25TZWxlY3RPcGVuLm5leHQoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgLy8gTWFudWFsbHkgc29ydCBkYXRhIGZvciB0aGlzLm1hdFNlbGVjdC5vcHRpb25zIChRdWVyeUxpc3Q8TWF0T3B0aW9uPikgYW5kIG5vdGlmeSBtYXRTZWxlY3Qub3B0aW9ucyBvZiBjaGFuZ2VzXHJcbiAgICAvLyBJdCdzIGltcG9ydGFudCB0byBrZWVwIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMgb3JkZXIgc3luY2hyb25pemVkIHdpdGggZGF0YSBpbiB0aGUgdGFibGVcclxuICAgIC8vICAgICBiZWNhdXNlIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMgKFF1ZXJ5TGlzdDxNYXRPcHRpb24+KSBkb2Vzbid0IHVwZGF0ZSBpdCdzIHN0YXRlIGFmdGVyIHRhYmxlIGRhdGEgaXMgY2hhbmdlZFxyXG4gICAgdGhpcy5tYXRPcHRpb25zLmNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgY29uc3Qgb3B0aW9uczogeyBba2V5OiBzdHJpbmddOiBNYXRPcHRpb24gfSA9IHt9O1xyXG4gICAgICB0aGlzLm1hdE9wdGlvbnMudG9BcnJheSgpXHJcbiAgICAgICAgLmZpbHRlcihvcHRpb24gPT4gIWlzTnVsbE9yVW5kZWZpbmVkKG9wdGlvbikpXHJcbiAgICAgICAgLmZvckVhY2gob3B0aW9uID0+IG9wdGlvbnNbYCR7b3B0aW9uLnZhbHVlfWBdID0gb3B0aW9uKTtcclxuICAgICAgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucy5yZXNldCh0aGlzLnRhYmxlRGF0YVNvdXJjZVxyXG4gICAgICAgIC5maWx0ZXIocm93ID0+ICFpc051bGxPclVuZGVmaW5lZChvcHRpb25zW2Ake3Jvdy5pZH1gXSkpXHJcbiAgICAgICAgLm1hcChyb3cgPT4gb3B0aW9uc1tgJHtyb3cuaWR9YF0pKTtcclxuICAgICAgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucy5ub3RpZnlPbkNoYW5nZXMoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIpKSB7XHJcbiAgICAgIC8vIFN1YnNjcmliZSBvbiBLZXlNYW5hZ2VyIGNoYW5nZXMgdG8gaGlnaGxpZ2h0IHRoZSB0YWJsZSByb3dzIGFjY29yZGluZ2x5XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyLmNoYW5nZVxyXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgICAgIC5zdWJzY3JpYmUoYWN0aXZlUm93ID0+IHRoaXMudGFibGVBY3RpdmVSb3cgPSBhY3RpdmVSb3cpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB0aGlzLl9vblNlbGVjdE9wZW4uY29tcGxldGUoKTtcclxuICAgIHRoaXMuX29uRGVzdHJveS5uZXh0KCk7XHJcbiAgICB0aGlzLl9vbkRlc3Ryb3kuY29tcGxldGUoKTtcclxuICB9XHJcblxyXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogYW55KSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICBjb25zdCBwcm94eUZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCA9ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgIC8vIFRvRG86IHJlZmFjdG9yIC0gY29tcGFyaXNvbiBtZWNoYW5pc20gaXNuJ3Qgb3B0aW1pemVkLiBmaWx0ZXJlZE91dFJvd3MgaXMgYSBtYXAgYnV0IGNvbXBsZXRlVmFsdWVMaXN0IGlzIGFuIGFycmF5XHJcbiAgICAgIGlmICh0aGlzLm11bHRpcGxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgIGlmICh0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHt0aGlzLmNvbXBsZXRlVmFsdWVMaXN0W2ldfWBdID09PSB1bmRlZmluZWQgJiYgdmFsdWUuaW5kZXhPZih0aGlzLmNvbXBsZXRlVmFsdWVMaXN0W2ldKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbHVlXHJcbiAgICAgICAgICAuZmlsdGVyKGNob2ljZSA9PiB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LmluZGV4T2YoY2hvaWNlKSA9PT0gLTEpXHJcbiAgICAgICAgICAuZm9yRWFjaChjaG9pY2UgPT4gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5wdXNoKGNob2ljZSkpO1xyXG4gICAgICAgIHRoaXMubWF0U2VsZWN0LnZhbHVlID0gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdDtcclxuICAgICAgICBmbih0aGlzLmNvbXBsZXRlVmFsdWVMaXN0KTtcclxuICAgICAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5zcGxpY2UoMCk7XHJcbiAgICAgICAgKCh0aGlzLmRhdGFTb3VyY2UgfHwge2RhdGE6IFtdfSkuZGF0YSB8fCBbXSlcclxuICAgICAgICAgIC5maWx0ZXIocm93ID0+IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QuaW5kZXhPZihyb3cuaWQpICE9PSAtMSlcclxuICAgICAgICAgIC5mb3JFYWNoKHJvdyA9PiB0aGlzLmNvbXBsZXRlUm93TGlzdC5wdXNoKHJvdykpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZuKHZhbHVlKTtcclxuICAgICAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5zcGxpY2UoMCk7XHJcbiAgICAgICAgKCh0aGlzLmRhdGFTb3VyY2UgfHwge2RhdGE6IFtdfSkuZGF0YSB8fCBbXSlcclxuICAgICAgICAgIC5maWx0ZXIocm93ID0+IHJvdy5pZCA9PT0gdmFsdWUpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3cpKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoaXMubWF0U2VsZWN0LnJlZ2lzdGVyT25DaGFuZ2UocHJveHlGbik7XHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4ge30pOiB2b2lkIHtcclxuICAgIHRoaXMubWF0U2VsZWN0LnJlZ2lzdGVyT25Ub3VjaGVkKGZuKTtcclxuICB9XHJcblxyXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5tYXRTZWxlY3Quc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkKTtcclxuICB9XHJcblxyXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy51cGRhdGVDb21wbGV0ZVJvd0xpc3QodmFsdWUpO1xyXG4gICAgdGhpcy5tYXRTZWxlY3Qud3JpdGVWYWx1ZSh2YWx1ZSk7XHJcbiAgICBpZiAodGhpcy5tYXRTZWxlY3QudmFsdWUgIT09IHZhbHVlKSB7XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0LnZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLnJlc2V0RmlsdGVyc09uT3BlbikgJiYgY2hhbmdlcy5yZXNldEZpbHRlcnNPbk9wZW4uY3VycmVudFZhbHVlICE9PSBmYWxzZSkge1xyXG4gICAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlKSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZUNvbXBsZXRlUm93TGlzdCh0aGlzLmNvbXBsZXRlUm93TGlzdC5tYXAocm93ID0+IHJvdy5pZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb3h5IEBJbnB1dCBiaW5kaW5ncyB0byBNYXRTZWxlY3RcclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5tYXRTZWxlY3RDb25maWd1cmF0b3IpKSB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSBjaGFuZ2VzLm1hdFNlbGVjdENvbmZpZ3VyYXRvci5jdXJyZW50VmFsdWU7XHJcbiAgICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24pXHJcbiAgICAgICAgLmZpbHRlcihrZXkgPT4gIVsnbXVsdGlwbGUnLCAncGFuZWxDbGFzcyddLmluY2x1ZGVzKGtleSkgJiYgIXRoaXMuY29udHJvbFZhbHVlQWNjZXNzb3JLZXlzLmluY2x1ZGVzKGtleSkpXHJcbiAgICAgICAgLmZvckVhY2goa2V5ID0+IHRoaXMubWF0U2VsZWN0W2tleV0gPSBjb25maWd1cmF0aW9uW2tleV0pO1xyXG4gICAgICBjb25zdCBwYW5lbENsYXNzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICBwYW5lbENsYXNzLnB1c2goJ21hdC1zZWxlY3Qtc2VhcmNoLXRhYmxlLXBhbmVsJyk7XHJcbiAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY29uZmlndXJhdGlvbi5wYW5lbENsYXNzKSkge1xyXG4gICAgICAgIHBhbmVsQ2xhc3MucHVzaChjb25maWd1cmF0aW9uLnBhbmVsQ2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLm92ZXJhbGxTZWFyY2hFbmFibGVkKSB7XHJcbiAgICAgICAgcGFuZWxDbGFzcy5wdXNoKCdtYXQtc2VsZWN0LXNlYXJjaC1wYW5lbCcpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0LnBhbmVsQ2xhc3MgPSBwYW5lbENsYXNzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IpKSB7XHJcbiAgICAgIHRoaXMucHJveHlNYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0aW9uKGNoYW5nZXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yLmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLmRhdGFTb3VyY2UpXHJcbiAgICAgICYmICFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlKVxyXG4gICAgICAmJiBpc0FycmF5KGNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YSkpIHtcclxuICAgICAgdGhpcy50YWJsZURhdGFTb3VyY2UgPSBbLi4uY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5kYXRhXTtcclxuICAgICAgaWYgKHRoaXMuYWRkTnVsbFJvdygpKSB7XHJcbiAgICAgICAgdGhpcy50YWJsZURhdGFTb3VyY2UudW5zaGlmdCh0aGlzLm51bGxSb3cpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMudGFibGVDb2x1bW5zID0gWydfc2VsZWN0aW9uJywgLi4uY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5jb2x1bW5zLm1hcChjb2x1bW4gPT4gY29sdW1uLmtleSldO1xyXG4gICAgICB0aGlzLnRhYmxlQ29sdW1uc01hcC5jbGVhcigpO1xyXG4gICAgICBjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmNvbHVtbnMuZm9yRWFjaChjb2x1bW4gPT4gdGhpcy50YWJsZUNvbHVtbnNNYXAuc2V0KGNvbHVtbi5rZXksIGNvbHVtbikpO1xyXG4gICAgICB0aGlzLmFwcGx5UHJveHlUb0FycmF5KGNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YSwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuX29uT3B0aW9uc0NoYW5nZS5uZXh0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLl9vbk9wdGlvbnNDaGFuZ2UubmV4dCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZW11bGF0ZU1hdE9wdGlvbkNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICBpZiAoZXZlbnQuY29tcG9zZWRQYXRoKClcclxuICAgICAgLmZpbHRlcihldCA9PiBldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG4gICAgICAuc29tZSgoZXQ6IEhUTUxFbGVtZW50KSA9PiBldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdtYXQtb3B0aW9uJykpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCByb3dFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgd2hpbGUgKHJvd0VsZW1lbnQgIT0gbnVsbCAmJiByb3dFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgcm93RWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICd0cicpIHtcclxuICAgICAgcm93RWxlbWVudCA9IHJvd0VsZW1lbnQucGFyZW50RWxlbWVudDtcclxuICAgIH1cclxuICAgIGlmIChyb3dFbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGNoaWxkT3B0aW9uOiBIVE1MRWxlbWVudCA9IHJvd0VsZW1lbnQucXVlcnlTZWxlY3RvcignbWF0LW9wdGlvbicpO1xyXG4gICAgaWYgKCFjaGlsZE9wdGlvbikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjaGlsZE9wdGlvbi5jbGljaygpO1xyXG4gIH1cclxuXHJcblxyXG4gIGZpbHRlckZvcm1Db250cm9sKGtleTogc3RyaW5nKTogRm9ybUNvbnRyb2wge1xyXG4gICAgaWYgKCF0aGlzLmZpbHRlckNvbnRyb2xzLmNvbnRhaW5zKGtleSkpIHtcclxuICAgICAgdGhpcy5maWx0ZXJDb250cm9scy5yZWdpc3RlckNvbnRyb2woa2V5LCBuZXcgRm9ybUNvbnRyb2woJycpKTtcclxuICAgIH1cclxuICAgIHJldHVybiA8Rm9ybUNvbnRyb2w+dGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KTtcclxuICB9XHJcblxyXG4gIHNpbXBsZVRyaWdnZXJMYWJlbEZuKHZhbHVlOiBNYXRTZWxlY3RUYWJsZVJvd1tdKTogc3RyaW5nIHtcclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQodGhpcy50cmlnZ2VyTGFiZWxTb3J0KSkge1xyXG4gICAgICB0aGlzLnNvcnREYXRhKHZhbHVlLCB0aGlzLnRyaWdnZXJMYWJlbFNvcnQuYWN0aXZlLCB0aGlzLnRyaWdnZXJMYWJlbFNvcnQuZGlyZWN0aW9uKTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZS5tYXAocm93ID0+IHtcclxuICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHJvdykpIHtcclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUpXHJcbiAgICAgICAgfHwgdHlwZW9mIHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUgIT09ICdzdHJpbmcnXHJcbiAgICAgICAgfHwgdGhpcy5jdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZS50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGAke3Jvdy5pZH1gO1xyXG4gICAgICB9XHJcbiAgICAgIGxldCBhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBzdWJzdGl0dXRpb246IHN0cmluZyA9IHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUucmVwbGFjZSgvWyRdezF9W3tdezF9KFtefV0rKVt9XXsxfT8vZywgKF8sIGtleSkgPT5cclxuICAgICAgICAhaXNOdWxsT3JVbmRlZmluZWQocm93W2tleV0pICYmIChhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9IHRydWUpID8gcm93W2tleV0gOiAnJyk7XHJcbiAgICAgIGlmIChhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9PT0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm4gYCR7cm93LmlkfWA7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN1YnN0aXR1dGlvbi50cmltKCk7XHJcbiAgICB9KS5qb2luKCcsICcpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlT3ZlcmFsbFNlYXJjaCgpOiB2b2lkIHtcclxuICAgIHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSA9ICF0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGU7XHJcbiAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSkge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMubWF0U2VsZWN0U2VhcmNoLl9mb2N1cygpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlQ29tcGxldGVSb3dMaXN0KHZhbHVlOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5zcGxpY2UoMCk7XHJcbiAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodmFsdWUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHZhbHVlQXJyYXk6IGFueVtdID0gIWlzQXJyYXkodmFsdWUpID8gW3ZhbHVlXSA6IHZhbHVlO1xyXG4gICAgdmFsdWVBcnJheVxyXG4gICAgICAuZmlsdGVyKHZhbHVlSWQgPT4gIWlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlSWQpKVxyXG4gICAgICAuZm9yRWFjaCh2YWx1ZUlkID0+IHtcclxuICAgICAgICAoKHRoaXMuZGF0YVNvdXJjZSB8fCB7ZGF0YTogW119KS5kYXRhIHx8IFtdKVxyXG4gICAgICAgICAgLmZpbHRlcihyb3cgPT4gIWlzTnVsbE9yVW5kZWZpbmVkKHJvdykgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHJvdy5pZCkgJiYgcm93LmlkID09PSB2YWx1ZUlkKVxyXG4gICAgICAgICAgLmZvckVhY2gocm93ID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3cpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LnB1c2gocm93LmlkKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcHJveHlNYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0aW9uKGNvbmZpZ3VyYXRpb246IHsgW2tleTogc3RyaW5nXTogYW55IH0pOiB2b2lkIHtcclxuICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLm1hdFNlbGVjdFNlYXJjaCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb3h5IEBJbnB1dCBiaW5kaW5ncyB0byBOZ3hNYXRTZWxlY3RTZWFyY2hcclxuICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24pXHJcbiAgICAgIC5maWx0ZXIoa2V5ID0+ICFbJ2NsZWFyU2VhcmNoSW5wdXQnXS5pbmNsdWRlcyhrZXkpICYmICF0aGlzLmNvbnRyb2xWYWx1ZUFjY2Vzc29yS2V5cy5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAuZm9yRWFjaChrZXkgPT4gdGhpcy5tYXRTZWxlY3RTZWFyY2hba2V5XSA9IGNvbmZpZ3VyYXRpb25ba2V5XSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5Q29sdW1uTGV2ZWxGaWx0ZXJzKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93W10pOiB2b2lkIHtcclxuICAgIHRoaXMuZmlsdGVyZWRPdXRSb3dzID0ge307XHJcbiAgICBjb25zdCBmaWx0ZXJzOiB7IFtrZXk6IHN0cmluZ106IHsgZmlsdGVyOiBNYXRTZWxlY3RUYWJsZUZpbHRlciwgdmFsdWU6IGFueSB9IH0gPSB7fTtcclxuICAgIE9iamVjdC5rZXlzKHRoaXMuZmlsdGVyQ29udHJvbHMuY29udHJvbHMpXHJcbiAgICAgIC5maWx0ZXIoa2V5ID0+IHRoaXMudGFibGVDb2x1bW5zTWFwLmhhcyhrZXkpXHJcbiAgICAgICAgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMudGFibGVDb2x1bW5zTWFwLmdldChrZXkpLmZpbHRlcilcclxuICAgICAgICAvLyBJZiBmaWx0ZXIgaXMgZW5hYmxlZFxyXG4gICAgICAgICYmIHRoaXMudGFibGVDb2x1bW5zTWFwLmdldChrZXkpLmZpbHRlci5lbmFibGVkICE9PSBmYWxzZSlcclxuICAgICAgLmZpbHRlcihrZXkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KS52YWx1ZTtcclxuICAgICAgICByZXR1cm4gIWlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlKVxyXG4gICAgICAgICAgLy8gSWYgYW4gYXJyYXkgLSBjaGVjayBpdCdzIG5vdCBlbXB0eVxyXG4gICAgICAgICAgJiYgKChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAvLyBJZiBzdHJpbmcgLSBjaGVjayB0aGF0IG5vdCBibGFua1xyXG4gICAgICAgICAgICB8fCAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgLy8gSWYgbnVtYmVyIC0gY2hlY2sgdGhhdCB0b1N0cmluZygpIGlzIG5vdCBibGFua1xyXG4gICAgICAgICAgICB8fCAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBgJHt2YWx1ZX1gLnRyaW0oKS5sZW5ndGggPiAwKSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5mb3JFYWNoKGtleSA9PiBmaWx0ZXJzW2tleV0gPSB7XHJcbiAgICAgICAgZmlsdGVyOiB0aGlzLnRhYmxlQ29sdW1uc01hcC5nZXQoa2V5KS5maWx0ZXIsXHJcbiAgICAgICAgdmFsdWU6IHRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSkudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICBjb25zdCBmaWx0ZXJLZXlzOiBzdHJpbmdbXSA9IE9iamVjdC5rZXlzKGZpbHRlcnMpO1xyXG4gICAgZm9yIChsZXQgaSA9IGRhdGEubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBmaWx0ZXJLZXlzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgY29uc3QgZmlsdGVyS2V5OiBzdHJpbmcgPSBmaWx0ZXJLZXlzW2tdO1xyXG4gICAgICAgIGNvbnN0IHJvdzogTWF0U2VsZWN0VGFibGVSb3cgPSBkYXRhW2ldO1xyXG5cdFx0aWYgKGlzTnVsbE9yVW5kZWZpbmVkKHJvdykpIHtcclxuXHRcdCAgcmV0dXJuO1xyXG5cdFx0fVxyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZTogYW55ID0gcm93W2ZpbHRlcktleV07XHJcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZmlsdGVyID0gZmlsdGVyc1tmaWx0ZXJLZXldO1xyXG4gICAgICAgIGNvbnN0IGNvbXBhcmF0b3IgPSBmaWx0ZXIuZmlsdGVyLmNvbXBhcmF0b3I7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXIuZmlsdGVyLmNvbXBhcmF0b3JGbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgaWYgKCFmaWx0ZXIuZmlsdGVyLmNvbXBhcmF0b3JGbi5jYWxsKG51bGwsIGNlbGxWYWx1ZSwgZmlsdGVyLnZhbHVlLCByb3cpKSB7XHJcbiAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY29tcGFyYXRvcikgfHwgY29tcGFyYXRvciA9PT0gJ2VxdWFscycpIHtcclxuICAgICAgICAgIGlmIChmaWx0ZXIudmFsdWUgIT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZWxsVmFsdWUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBmaWx0ZXIudmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICBjb25zdCBjZWxsVmFsdWVMQzogc3RyaW5nID0gYCR7Y2VsbFZhbHVlfWAudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGNvbnN0IGZpbHRlclZhbHVlTEM6IHN0cmluZyA9IGZpbHRlci52YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNvbXBhcmF0b3IpIHx8IGNvbXBhcmF0b3IgPT09ICdlcXVhbHNJZ25vcmVDYXNlJykge1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyVmFsdWVMQyAhPT0gY2VsbFZhbHVlTEMpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdjb250YWlucycpIHtcclxuICAgICAgICAgICAgaWYgKGNlbGxWYWx1ZS5pbmRleE9mKGZpbHRlci52YWx1ZSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnY29udGFpbnNJZ25vcmVDYXNlJykge1xyXG4gICAgICAgICAgICBpZiAoY2VsbFZhbHVlTEMuaW5kZXhPZihmaWx0ZXJWYWx1ZUxDKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdzdGFydHNXaXRoJykge1xyXG4gICAgICAgICAgICBpZiAoIWNlbGxWYWx1ZS5zdGFydHNXaXRoKGZpbHRlci52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdzdGFydHNXaXRoSWdub3JlQ2FzZScpIHtcclxuICAgICAgICAgICAgaWYgKCFjZWxsVmFsdWVMQy5zdGFydHNXaXRoKGZpbHRlclZhbHVlTEMpKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBseU92ZXJhbGxGaWx0ZXIoZGF0YTogTWF0U2VsZWN0VGFibGVSb3dbXSk6IHZvaWQge1xyXG4gICAgdGhpcy5maWx0ZXJlZE91dFJvd3MgPSB7fTtcclxuICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnZhbHVlKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBmaWx0ZXJWYWx1ZUxDOiBzdHJpbmcgPSB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBpZiAoZmlsdGVyVmFsdWVMQy50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvciAobGV0IGkgPSBkYXRhLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGNvbnN0IHJvdzogTWF0U2VsZWN0VGFibGVSb3cgPSBkYXRhW2ldO1xyXG4gICAgICBsZXQgcm93U2hvdWxkQmVGaWx0ZXJlZCA9IHRydWU7XHJcbiAgICAgIGZvciAobGV0IGogPSB0aGlzLmRhdGFTb3VyY2UuY29sdW1ucy5sZW5ndGggLSAxOyBqID49IDA7IGotLSkge1xyXG4gICAgICAgIGNvbnN0IGtleTogc3RyaW5nID0gdGhpcy5kYXRhU291cmNlLmNvbHVtbnNbal0ua2V5O1xyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZTogYW55ID0gcm93W2tleV07XHJcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjZWxsVmFsdWVMQzogc3RyaW5nID0gYCR7Y2VsbFZhbHVlfWAudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAoY2VsbFZhbHVlTEMuaW5kZXhPZihmaWx0ZXJWYWx1ZUxDKSAhPT0gLTEpIHtcclxuICAgICAgICAgIHJvd1Nob3VsZEJlRmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAocm93U2hvdWxkQmVGaWx0ZXJlZCkge1xyXG4gICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwbHlQcm94eVRvQXJyYXkoYXJyYXk6IGFueVtdLCBjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3Vuc2hpZnQnLCAnc3BsaWNlJywgJ3NvcnQnXS5mb3JFYWNoKChtZXRob2ROYW1lKSA9PiB7XHJcbiAgICAgIGFycmF5W21ldGhvZE5hbWVdID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IEFycmF5LnByb3RvdHlwZVttZXRob2ROYW1lXS5hcHBseShhcnJheSwgYXJndW1lbnRzKTsgLy8gY2FsbCBub3JtYWwgYmVoYXZpb3VyXHJcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoYXJyYXksIGFyZ3VtZW50cyk7IC8vIGZpbmFsbHkgY2FsbCB0aGUgY2FsbGJhY2sgc3VwcGxpZWRcclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0RmlsdGVycygpOiB2b2lkIHtcclxuICAgIHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wuc2V0VmFsdWUoJycpO1xyXG4gICAgT2JqZWN0LmtleXModGhpcy5maWx0ZXJDb250cm9scy5jb250cm9scylcclxuICAgICAgLmZvckVhY2goa2V5ID0+IHRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSkuc2V0VmFsdWUoJycpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2VuIGZyb20ge0BzZWUgTWF0VGFibGVEYXRhU291cmNlI3NvcnRpbmdEYXRhQWNjZXNzb3J9XHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0YVxyXG4gICAqIEBwYXJhbSBzb3J0SGVhZGVySWRcclxuICAgKi9cclxuICBwcml2YXRlIHNvcnRpbmdEYXRhQWNjZXNzb3IoZGF0YTogTWF0U2VsZWN0VGFibGVSb3csIGFjdGl2ZTogc3RyaW5nKTogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSB7XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSAoZGF0YSBhcyB7IFtrZXk6IHN0cmluZ106IGFueSB9KVthY3RpdmVdO1xyXG5cclxuICAgIGlmIChfaXNOdW1iZXJWYWx1ZSh2YWx1ZSkpIHtcclxuICAgICAgY29uc3QgbnVtYmVyVmFsdWUgPSBOdW1iZXIodmFsdWUpO1xyXG5cclxuICAgICAgLy8gTnVtYmVycyBiZXlvbmQgYE1BWF9TQUZFX0lOVEVHRVJgIGNhbid0IGJlIGNvbXBhcmVkIHJlbGlhYmx5IHNvIHdlXHJcbiAgICAgIC8vIGxlYXZlIHRoZW0gYXMgc3RyaW5ncy4gRm9yIG1vcmUgaW5mbzogaHR0cHM6Ly9nb28uZ2wveTV2YlNnXHJcbiAgICAgIHJldHVybiBudW1iZXJWYWx1ZSA8IE1BWF9TQUZFX0lOVEVHRVIgPyBudW1iZXJWYWx1ZSA6IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcblxyXG5cclxuICBwcml2YXRlIHNvcnREYXRhKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93W10sIGFjdGl2ZTogc3RyaW5nLCBkaXJlY3Rpb246IFNvcnREaXJlY3Rpb24pOiBNYXRTZWxlY3RUYWJsZVJvd1tdIHtcclxuICAgIGlmICghYWN0aXZlIHx8IGRpcmVjdGlvbiA9PT0gJycpIHtcclxuICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRhdGEuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICBsZXQgYVZhbHVlID0gdGhpcy5zb3J0aW5nRGF0YUFjY2Vzc29yKGEsIGFjdGl2ZSk7XHJcbiAgICAgIGxldCBiVmFsdWUgPSB0aGlzLnNvcnRpbmdEYXRhQWNjZXNzb3IoYiwgYWN0aXZlKTtcclxuXHJcbiAgICAgIGlmIChhLmlkID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9IGVsc2UgaWYgKGIuaWQgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQm90aCBudWxsL3VuZGVmaW5lZC9lcXVhbCB2YWx1ZSBjaGVja1xyXG4gICAgICBpZiAoYVZhbHVlID09PSBiVmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gT25lIG51bGwgdmFsdWUgY2hlY2tcclxuICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGFWYWx1ZSkgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgIH0gZWxzZSBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGFWYWx1ZSkgJiYgaXNOdWxsT3JVbmRlZmluZWQoYlZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYVZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgIGFWYWx1ZSA9IGFWYWx1ZS5nZXRUaW1lKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGJWYWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICBiVmFsdWUgPSBiVmFsdWUuZ2V0VGltZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVc2VyIGxvY2FsZUNvbXBhcmUgZm9yIHN0cmluZ3NcclxuICAgICAgaWYgKGlzU3RyaW5nKGFWYWx1ZSkgJiYgaXNTdHJpbmcoYlZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiAoPHN0cmluZz5hVmFsdWUpLmxvY2FsZUNvbXBhcmUoPHN0cmluZz5iVmFsdWUpICogKGRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUcnkgdG8gY29udmVydCB0byBhIE51bWJlciB0eXBlXHJcbiAgICAgIGFWYWx1ZSA9IGlzTmFOKDxudW1iZXI+YVZhbHVlKSA/IGAke2FWYWx1ZX1gIDogK2FWYWx1ZTtcclxuICAgICAgYlZhbHVlID0gaXNOYU4oPG51bWJlcj5iVmFsdWUpID8gYCR7YlZhbHVlfWAgOiArYlZhbHVlO1xyXG5cclxuICAgICAgLy8gaWYgb25lIGlzIG51bWJlciBhbmQgb3RoZXIgaXMgU3RyaW5nXHJcbiAgICAgIGlmIChpc1N0cmluZyhhVmFsdWUpICYmIGlzTnVtYmVyKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gKDEpICogKGRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc051bWJlcihhVmFsdWUpICYmIGlzU3RyaW5nKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gKC0xKSAqIChkaXJlY3Rpb24gPT09ICdhc2MnID8gMSA6IC0xKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ29tcGFyZSBhcyBOdW1iZXJzIG90aGVyd2lzZVxyXG4gICAgICByZXR1cm4gKGFWYWx1ZSA+IGJWYWx1ZSA/IDEgOiAtMSkgKiAoZGlyZWN0aW9uID09PSAnYXNjJyA/IDEgOiAtMSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGFkZE51bGxSb3coKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIXRoaXMubXVsdGlwbGUgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubGFiZWxGb3JOdWxsVmFsdWUpO1xyXG4gIH1cclxuICBcclxuICBwcml2YXRlIGNoZWNrQW5kUmVzZXRTZWxlY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5tYXRTZWxlY3QudmFsdWUgJiYgaXNBcnJheSh0aGlzLm1hdFNlbGVjdC52YWx1ZSkgJiYgdGhpcy5tYXRTZWxlY3QudmFsdWUubGVuZ3RoIDwgMVxyXG4gICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5yZXNldE9wdGlvbkFjdGlvbikpIHtcclxuICAgICAgdGhpcy5yZXNldE9wdGlvbkFjdGlvbigpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=