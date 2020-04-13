/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { MatOption, MatSelect, MatSort, MatTable } from '@angular/material';
import { isArray, isNullOrUndefined, isNumber, isString } from 'util';
import { _isNumberValue } from '@angular/cdk/coercion';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { MatSelectSearchComponent } from 'ngx-mat-select-search';
/** @type {?} */
var MAX_SAFE_INTEGER = 9007199254740991;
var MatSelectTableComponent = /** @class */ (function () {
    function MatSelectTableComponent(cd) {
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
    MatSelectTableComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.multiple = this.multiple || false;
        this.matSelect.openedChange
            .pipe(takeUntil(this._onDestroy))
            .subscribe((/**
         * @param {?} opened
         * @return {?}
         */
        function (opened) {
            if (_this.resetFiltersOnOpen !== false || !_this.matOptions.length) {
                _this.resetFilters();
            }
            _this.overallSearchVisibleState = _this.overallSearchVisible;
            if (_this.resetSortOnOpen !== false) {
                _this.sort.sort({ id: '', start: 'asc', disableClear: false });
            }
            if (!opened) {
                _this.close.emit(!opened);
                return;
            }
            if (_this.overallSearchEnabled) {
                _this.proxyMatSelectSearchConfiguration(_this.matSelectSearchConfigurator);
            }
            // ToDo: get rid of this workaround (updates header row [otherwise sort mechanism produces glitches])
            ((/** @type {?} */ (_this.table)))._headerRowDefChanged = true;
            // Disable sort buttons to prevent sorting change on SPACE key pressed in filter field
            setTimeout((/**
             * @return {?}
             */
            function () { return [].forEach.call(_this.tableRef.nativeElement.querySelectorAll('button.mat-sort-header-button'), (/**
             * @param {?} e
             * @return {?}
             */
            function (e) { return e.disabled = true; })); }));
            // Patch the height of the panel to include the height of the header and footer
            /** @type {?} */
            var panelElement = _this.matSelect.panel.nativeElement;
            /** @type {?} */
            var panelHeight = panelElement.getBoundingClientRect().height;
            /** @type {?} */
            var tableAdditionalHeight = 0;
            _this.table
                ._getRenderedRows(_this.table._headerRowOutlet)
                .concat(_this.table._getRenderedRows(_this.table._footerRowOutlet))
                .forEach((/**
             * @param {?} row
             * @return {?}
             */
            function (row) { return tableAdditionalHeight += row.getBoundingClientRect().height; }));
            if (!isNaN(panelHeight)) {
                panelElement.style.maxHeight = panelHeight + tableAdditionalHeight + "px";
            }
            if (!_this.matSelectSearchConfigurator.disableScrollToActiveOnOptionsChanged
                && !isNullOrUndefined(_this.matSelect._keyManager) && _this.completeRowList.length > 0) {
                _this._onSelectOpen.pipe(takeUntil(_this._onDestroy), debounceTime(1), take(1)).subscribe((/**
                 * @return {?}
                 */
                function () {
                    /** @type {?} */
                    var firstValue = "" + _this.completeRowList[0].id;
                    for (var i = 0; i < _this.tableDataSource.length; i++) {
                        if ("" + _this.tableDataSource[i].id === firstValue) {
                            _this.matSelect._keyManager.setActiveItem(i);
                            try {
                                _this.cd.detectChanges();
                            }
                            catch (ignored) {
                            }
                            break;
                        }
                    }
                }));
            }
        }));
    };
    /**
     * @return {?}
     */
    MatSelectTableComponent.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        merge.apply(void 0, tslib_1.__spread([
            this._onOptionsChange,
            this.sort.sortChange,
            this.filterControls.valueChanges,
            this.overallFilterControl.valueChanges
        ])).pipe(takeUntil(this._onDestroy), debounceTime(100))
            .subscribe((/**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var dataClone = tslib_1.__spread(((_this.dataSource || { data: [] }).data || []));
            if (_this.addNullRow()) {
                dataClone.unshift(_this.nullRow);
            }
            // Apply filtering
            if (_this.overallSearchEnabled && _this.overallSearchVisibleState) {
                _this.applyOverallFilter(dataClone);
            }
            else {
                _this.applyColumnLevelFilters(dataClone);
            }
            // Inherit default sorting options if sort not specified
            if (!_this.sort.active && !isNullOrUndefined(_this.defaultSort) && _this.defaultSort.active) {
                _this.sort.active = _this.defaultSort.active;
                _this.sort.direction = _this.defaultSort.direction;
            }
            // Apply default or manual sorting
            _this.tableDataSource = !_this.sort.active ?
                dataClone : _this.sortData(dataClone, _this.sort.active, _this.sort.direction);
            try {
                _this.cd.detectChanges();
            }
            catch (ignored) {
            }
            _this._onSelectOpen.next();
        }));
        // Manually sort data for this.matSelect.options (QueryList<MatOption>) and notify matSelect.options of changes
        // It's important to keep this.matSelect.options order synchronized with data in the table
        //     because this.matSelect.options (QueryList<MatOption>) doesn't update it's state after table data is changed
        this.matOptions.changes.subscribe((/**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var options = {};
            _this.matOptions.toArray()
                .filter((/**
             * @param {?} option
             * @return {?}
             */
            function (option) { return !isNullOrUndefined(option); }))
                .forEach((/**
             * @param {?} option
             * @return {?}
             */
            function (option) { return options["" + option.value] = option; }));
            _this.matSelect.options.reset(_this.tableDataSource
                .filter((/**
             * @param {?} row
             * @return {?}
             */
            function (row) { return !isNullOrUndefined(options["" + row.id]); }))
                .map((/**
             * @param {?} row
             * @return {?}
             */
            function (row) { return options["" + row.id]; })));
            _this.matSelect.options.notifyOnChanges();
        }));
        if (!isNullOrUndefined(this.matSelect._keyManager)) {
            // Subscribe on KeyManager changes to highlight the table rows accordingly
            this.matSelect._keyManager.change
                .pipe(takeUntil(this._onDestroy))
                .subscribe((/**
             * @param {?} activeRow
             * @return {?}
             */
            function (activeRow) { return _this.tableActiveRow = activeRow; }));
        }
    };
    /**
     * @return {?}
     */
    MatSelectTableComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._onSelectOpen.complete();
        this._onDestroy.next();
        this._onDestroy.complete();
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    MatSelectTableComponent.prototype.registerOnChange = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) {
        var _this = this;
        /** @type {?} */
        var proxyFn = (/**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            // ToDo: refactor - comparison mechanism isn't optimized. filteredOutRows is a map but completeValueList is an array
            if (_this.multiple === true) {
                for (var i = _this.completeValueList.length - 1; i >= 0; i--) {
                    if (_this.filteredOutRows["" + _this.completeValueList[i]] === undefined && value.indexOf(_this.completeValueList[i]) === -1) {
                        _this.completeValueList.splice(i, 1);
                    }
                }
                value
                    .filter((/**
                 * @param {?} choice
                 * @return {?}
                 */
                function (choice) { return _this.completeValueList.indexOf(choice) === -1; }))
                    .forEach((/**
                 * @param {?} choice
                 * @return {?}
                 */
                function (choice) { return _this.completeValueList.push(choice); }));
                _this.matSelect.value = _this.completeValueList;
                fn(_this.completeValueList);
                _this.completeRowList.splice(0);
                ((_this.dataSource || { data: [] }).data || [])
                    .filter((/**
                 * @param {?} row
                 * @return {?}
                 */
                function (row) { return _this.completeValueList.indexOf(row.id) !== -1; }))
                    .forEach((/**
                 * @param {?} row
                 * @return {?}
                 */
                function (row) { return _this.completeRowList.push(row); }));
            }
            else {
                fn(value);
                _this.completeRowList.splice(0);
                ((_this.dataSource || { data: [] }).data || [])
                    .filter((/**
                 * @param {?} row
                 * @return {?}
                 */
                function (row) { return row.id === value; }))
                    .forEach((/**
                 * @param {?} row
                 * @return {?}
                 */
                function (row) { return _this.completeRowList.push(row); }));
            }
        });
        this.matSelect.registerOnChange(proxyFn);
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    MatSelectTableComponent.prototype.registerOnTouched = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) {
        this.matSelect.registerOnTouched(fn);
    };
    /**
     * @param {?} isDisabled
     * @return {?}
     */
    MatSelectTableComponent.prototype.setDisabledState = /**
     * @param {?} isDisabled
     * @return {?}
     */
    function (isDisabled) {
        this.matSelect.setDisabledState(isDisabled);
    };
    /**
     * @param {?} value
     * @return {?}
     */
    MatSelectTableComponent.prototype.writeValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        this.updateCompleteRowList(value);
        this.matSelect.writeValue(value);
        if (this.matSelect.value !== value) {
            this.matSelect.value = value;
        }
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    MatSelectTableComponent.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        var _this = this;
        if (!isNullOrUndefined(changes.resetFiltersOnOpen) && changes.resetFiltersOnOpen.currentValue !== false) {
            this.resetFilters();
        }
        if (!isNullOrUndefined(changes.dataSource)) {
            this.updateCompleteRowList(this.completeRowList.map((/**
             * @param {?} row
             * @return {?}
             */
            function (row) { return row.id; })));
        }
        // Proxy @Input bindings to MatSelect
        if (!isNullOrUndefined(changes.matSelectConfigurator)) {
            /** @type {?} */
            var configuration_1 = changes.matSelectConfigurator.currentValue;
            Object.keys(configuration_1)
                .filter((/**
             * @param {?} key
             * @return {?}
             */
            function (key) { return !['multiple', 'panelClass'].includes(key) && !_this.controlValueAccessorKeys.includes(key); }))
                .forEach((/**
             * @param {?} key
             * @return {?}
             */
            function (key) { return _this.matSelect[key] = configuration_1[key]; }));
            /** @type {?} */
            var panelClass = [];
            panelClass.push('mat-select-search-table-panel');
            if (!isNullOrUndefined(configuration_1.panelClass)) {
                panelClass.push(configuration_1.panelClass);
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
            this.tableDataSource = tslib_1.__spread(changes.dataSource.currentValue.data);
            if (this.addNullRow()) {
                this.tableDataSource.unshift(this.nullRow);
            }
            this.tableColumns = tslib_1.__spread(['_selection'], changes.dataSource.currentValue.columns.map((/**
             * @param {?} column
             * @return {?}
             */
            function (column) { return column.key; })));
            this.tableColumnsMap.clear();
            changes.dataSource.currentValue.columns.forEach((/**
             * @param {?} column
             * @return {?}
             */
            function (column) { return _this.tableColumnsMap.set(column.key, column); }));
            this.applyProxyToArray(changes.dataSource.currentValue.data, (/**
             * @return {?}
             */
            function () {
                _this._onOptionsChange.next();
            }));
            this._onOptionsChange.next();
        }
    };
    /**
     * @param {?} event
     * @return {?}
     */
    MatSelectTableComponent.prototype.emulateMatOptionClick = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        if (event.composedPath()
            .filter((/**
         * @param {?} et
         * @return {?}
         */
        function (et) { return et instanceof HTMLElement; }))
            .some((/**
         * @param {?} et
         * @return {?}
         */
        function (et) { return et.tagName.toLowerCase() === 'mat-option'; }))) {
            return;
        }
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        /** @type {?} */
        var rowElement = event.target;
        while (rowElement != null && rowElement instanceof HTMLElement && rowElement.tagName.toLowerCase() !== 'tr') {
            rowElement = rowElement.parentElement;
        }
        if (rowElement === null) {
            return;
        }
        /** @type {?} */
        var childOption = rowElement.querySelector('mat-option');
        if (!childOption) {
            return;
        }
        childOption.click();
    };
    /**
     * @param {?} key
     * @return {?}
     */
    MatSelectTableComponent.prototype.filterFormControl = /**
     * @param {?} key
     * @return {?}
     */
    function (key) {
        if (!this.filterControls.contains(key)) {
            this.filterControls.registerControl(key, new FormControl(''));
        }
        return (/** @type {?} */ (this.filterControls.get(key)));
    };
    /**
     * @param {?} value
     * @return {?}
     */
    MatSelectTableComponent.prototype.simpleTriggerLabelFn = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        var _this = this;
        if (!isNullOrUndefined(this.triggerLabelSort)) {
            this.sortData(value, this.triggerLabelSort.active, this.triggerLabelSort.direction);
        }
        return value.map((/**
         * @param {?} row
         * @return {?}
         */
        function (row) {
            if (isNullOrUndefined(row)) {
                return '';
            }
            if (isNullOrUndefined(_this.customTriggerLabelTemplate)
                || typeof _this.customTriggerLabelTemplate !== 'string'
                || _this.customTriggerLabelTemplate.trim().length === 0) {
                return "" + row.id;
            }
            /** @type {?} */
            var atLeastPartialSubstitution = false;
            /** @type {?} */
            var substitution = _this.customTriggerLabelTemplate.replace(/[$]{1}[{]{1}([^}]+)[}]{1}?/g, (/**
             * @param {?} _
             * @param {?} key
             * @return {?}
             */
            function (_, key) {
                return !isNullOrUndefined(row[key]) && (atLeastPartialSubstitution = true) ? row[key] : '';
            }));
            if (atLeastPartialSubstitution === false) {
                return "" + row.id;
            }
            return substitution.trim();
        })).join(', ');
    };
    /**
     * @return {?}
     */
    MatSelectTableComponent.prototype.toggleOverallSearch = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.overallSearchVisibleState = !this.overallSearchVisibleState;
        this.resetFilters();
        if (this.overallSearchVisibleState) {
            setTimeout((/**
             * @return {?}
             */
            function () { return _this.matSelectSearch._focus(); }));
        }
    };
    /**
     * @private
     * @param {?} value
     * @return {?}
     */
    MatSelectTableComponent.prototype.updateCompleteRowList = /**
     * @private
     * @param {?} value
     * @return {?}
     */
    function (value) {
        var _this = this;
        this.completeRowList.splice(0);
        this.completeValueList.splice(0);
        if (isNullOrUndefined(value)) {
            return;
        }
        /** @type {?} */
        var valueArray = !isArray(value) ? [value] : value;
        valueArray
            .filter((/**
         * @param {?} valueId
         * @return {?}
         */
        function (valueId) { return !isNullOrUndefined(valueId); }))
            .forEach((/**
         * @param {?} valueId
         * @return {?}
         */
        function (valueId) {
            ((_this.dataSource || { data: [] }).data || [])
                .filter((/**
             * @param {?} row
             * @return {?}
             */
            function (row) { return !isNullOrUndefined(row) && !isNullOrUndefined(row.id) && row.id === valueId; }))
                .forEach((/**
             * @param {?} row
             * @return {?}
             */
            function (row) {
                _this.completeRowList.push(row);
                _this.completeValueList.push(row.id);
            }));
        }));
        if (!isNullOrUndefined(this.triggerLabelSort)) {
            this.sortData(this.completeRowList, this.triggerLabelSort.active, this.triggerLabelSort.direction);
        }
    };
    /**
     * @private
     * @param {?} configuration
     * @return {?}
     */
    MatSelectTableComponent.prototype.proxyMatSelectSearchConfiguration = /**
     * @private
     * @param {?} configuration
     * @return {?}
     */
    function (configuration) {
        var _this = this;
        if (isNullOrUndefined(this.matSelectSearch)) {
            return;
        }
        // Proxy @Input bindings to NgxMatSelectSearch
        Object.keys(configuration)
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        function (key) { return !['clearSearchInput'].includes(key) && !_this.controlValueAccessorKeys.includes(key); }))
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        function (key) { return _this.matSelectSearch[key] = configuration[key]; }));
    };
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    MatSelectTableComponent.prototype.applyColumnLevelFilters = /**
     * @private
     * @param {?} data
     * @return {?}
     */
    function (data) {
        var _this = this;
        this.filteredOutRows = {};
        /** @type {?} */
        var filters = {};
        Object.keys(this.filterControls.controls)
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        function (key) { return _this.tableColumnsMap.has(key)
            && !isNullOrUndefined(_this.tableColumnsMap.get(key).filter)
            // If filter is enabled
            && _this.tableColumnsMap.get(key).filter.enabled !== false; }))
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        function (key) {
            /** @type {?} */
            var value = _this.filterControls.get(key).value;
            return !isNullOrUndefined(value)
                // If an array - check it's not empty
                && ((isArray(value) && value.length > 0)
                    // If string - check that not blank
                    || (typeof value === 'string' && value.trim().length > 0)
                    // If number - check that toString() is not blank
                    || (typeof value === 'number' && ("" + value).trim().length > 0));
        }))
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        function (key) { return filters[key] = {
            filter: _this.tableColumnsMap.get(key).filter,
            value: _this.filterControls.get(key).value
        }; }));
        /** @type {?} */
        var filterKeys = Object.keys(filters);
        for (var i = data.length - 1; i >= 0; i--) {
            for (var k = 0; k < filterKeys.length; k++) {
                /** @type {?} */
                var filterKey = filterKeys[k];
                /** @type {?} */
                var row = data[i];
                /** @type {?} */
                var cellValue = row[filterKey];
                if (isNullOrUndefined(cellValue)) {
                    data.splice(i, 1).forEach((/**
                     * @param {?} item
                     * @return {?}
                     */
                    function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                    continue;
                }
                /** @type {?} */
                var filter = filters[filterKey];
                /** @type {?} */
                var comparator = filter.filter.comparator;
                if (typeof filter.filter.comparatorFn === 'function') {
                    if (!filter.filter.comparatorFn.call(null, cellValue, filter.value, row)) {
                        data.splice(i, 1).forEach((/**
                         * @param {?} item
                         * @return {?}
                         */
                        function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                        break;
                    }
                }
                else if (isNullOrUndefined(comparator) || comparator === 'equals') {
                    if (filter.value !== cellValue) {
                        data.splice(i, 1).forEach((/**
                         * @param {?} item
                         * @return {?}
                         */
                        function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                        break;
                    }
                }
                else if (typeof cellValue === 'string' && typeof filter.value === 'string') {
                    /** @type {?} */
                    var cellValueLC = ("" + cellValue).toLowerCase();
                    /** @type {?} */
                    var filterValueLC = filter.value.toLowerCase();
                    if (isNullOrUndefined(comparator) || comparator === 'equalsIgnoreCase') {
                        if (filterValueLC !== cellValueLC) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                            break;
                        }
                    }
                    else if (comparator === 'contains') {
                        if (cellValue.indexOf(filter.value) === -1) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                            break;
                        }
                    }
                    else if (comparator === 'containsIgnoreCase') {
                        if (cellValueLC.indexOf(filterValueLC) === -1) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                            break;
                        }
                    }
                    else if (comparator === 'startsWith') {
                        if (!cellValue.startsWith(filter.value)) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                            break;
                        }
                    }
                    else if (comparator === 'startsWithIgnoreCase') {
                        if (!cellValueLC.startsWith(filterValueLC)) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                            break;
                        }
                    }
                }
            }
        }
    };
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    MatSelectTableComponent.prototype.applyOverallFilter = /**
     * @private
     * @param {?} data
     * @return {?}
     */
    function (data) {
        var _this = this;
        this.filteredOutRows = {};
        if (isNullOrUndefined(this.overallFilterControl.value)) {
            return;
        }
        /** @type {?} */
        var filterValueLC = this.overallFilterControl.value.toLowerCase();
        if (filterValueLC.trim().length === 0) {
            return;
        }
        for (var i = data.length - 1; i >= 0; i--) {
            /** @type {?} */
            var row = data[i];
            /** @type {?} */
            var rowShouldBeFiltered = true;
            for (var j = this.dataSource.columns.length - 1; j >= 0; j--) {
                /** @type {?} */
                var key = this.dataSource.columns[j].key;
                /** @type {?} */
                var cellValue = row[key];
                if (isNullOrUndefined(cellValue)) {
                    continue;
                }
                /** @type {?} */
                var cellValueLC = ("" + cellValue).toLowerCase();
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
                function (item) { return _this.filteredOutRows["" + item.id] = item; }));
            }
        }
    };
    /**
     * @private
     * @param {?} array
     * @param {?} callback
     * @return {?}
     */
    MatSelectTableComponent.prototype.applyProxyToArray = /**
     * @private
     * @param {?} array
     * @param {?} callback
     * @return {?}
     */
    function (array, callback) {
        ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach((/**
         * @param {?} methodName
         * @return {?}
         */
        function (methodName) {
            array[methodName] = (/**
             * @return {?}
             */
            function () {
                /** @type {?} */
                var res = Array.prototype[methodName].apply(array, arguments);
                callback.apply(array, arguments); // finally call the callback supplied
                return res;
            });
        }));
    };
    /**
     * @private
     * @return {?}
     */
    MatSelectTableComponent.prototype.resetFilters = /**
     * @private
     * @return {?}
     */
    function () {
        var _this = this;
        this.overallFilterControl.setValue('');
        Object.keys(this.filterControls.controls)
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        function (key) { return _this.filterControls.get(key).setValue(''); }));
    };
    /**
     * Taken from {@see MatTableDataSource#sortingDataAccessor}
     *
     * @param data
     * @param sortHeaderId
     */
    /**
     * Taken from {\@see MatTableDataSource#sortingDataAccessor}
     *
     * @private
     * @param {?} data
     * @param {?} active
     * @return {?}
     */
    MatSelectTableComponent.prototype.sortingDataAccessor = /**
     * Taken from {\@see MatTableDataSource#sortingDataAccessor}
     *
     * @private
     * @param {?} data
     * @param {?} active
     * @return {?}
     */
    function (data, active) {
        /** @type {?} */
        var value = ((/** @type {?} */ (data)))[active];
        if (_isNumberValue(value)) {
            /** @type {?} */
            var numberValue = Number(value);
            // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
            // leave them as strings. For more info: https://goo.gl/y5vbSg
            return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
        }
        return value;
    };
    /**
     * @private
     * @param {?} data
     * @param {?} active
     * @param {?} direction
     * @return {?}
     */
    MatSelectTableComponent.prototype.sortData = /**
     * @private
     * @param {?} data
     * @param {?} active
     * @param {?} direction
     * @return {?}
     */
    function (data, active, direction) {
        var _this = this;
        if (!active || direction === '') {
            return data;
        }
        return data.sort((/**
         * @param {?} a
         * @param {?} b
         * @return {?}
         */
        function (a, b) {
            /** @type {?} */
            var aValue = _this.sortingDataAccessor(a, active);
            /** @type {?} */
            var bValue = _this.sortingDataAccessor(b, active);
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
                return ((/** @type {?} */ (aValue))).localeCompare((/** @type {?} */ (bValue))) * (_this.sort.direction === 'asc' ? 1 : -1);
            }
            // Try to convert to a Number type
            aValue = isNaN((/** @type {?} */ (aValue))) ? "" + aValue : +aValue;
            bValue = isNaN((/** @type {?} */ (bValue))) ? "" + bValue : +bValue;
            // if one is number and other is String
            if (isString(aValue) && isNumber(bValue)) {
                return (1) * (_this.sort.direction === 'asc' ? 1 : -1);
            }
            if (isNumber(aValue) && isString(bValue)) {
                return (-1) * (_this.sort.direction === 'asc' ? 1 : -1);
            }
            // Compare as Numbers otherwise
            return (aValue > bValue ? 1 : -1) * (_this.sort.direction === 'asc' ? 1 : -1);
        }));
    };
    /**
     * @return {?}
     */
    MatSelectTableComponent.prototype.addNullRow = /**
     * @return {?}
     */
    function () {
        return !this.multiple && !isNullOrUndefined(this.labelForNullValue);
    };
    MatSelectTableComponent.decorators = [
        { type: Component, args: [{
                    selector: 'ngx-mat-select-table',
                    template: "<mat-form-field>\r\n  <mat-select #componentSelect\r\n              [multiple]=\"multiple\"\r\n              disableRipple>\r\n\r\n    <mat-select-trigger>\r\n      <ng-container *ngIf=\"!customTriggerLabelFn\">{{simpleTriggerLabelFn(completeRowList)}}</ng-container>\r\n      <ng-container *ngIf=\"customTriggerLabelFn\">{{customTriggerLabelFn(completeRowList)}}</ng-container>\r\n    </mat-select-trigger>\r\n\r\n    <ngx-mat-select-search *ngIf=\"overallSearchEnabled\"\r\n                           [formControl]=\"overallFilterControl\"\r\n                           [clearSearchInput]=\"resetFiltersOnOpen\"\r\n                           [ngClass]=\"{hidden: overallSearchVisibleState !== true}\">\r\n      <mat-icon *ngIf=\"matSelectSearchConfigurator?.clearIcon\"\r\n                ngxMatSelectSearchClear\r\n                color=\"primary\">{{matSelectSearchConfigurator.clearIcon}}</mat-icon>\r\n    </ngx-mat-select-search>\r\n    <mat-icon *ngIf=\"overallSearchEnabled\"\r\n              (click)=\"toggleOverallSearch()\"\r\n              class=\"overall-search-toggle\"\r\n              color=\"primary\">{{overallSearchVisibleState ? 'arrow_back' : 'search'}}</mat-icon>\r\n\r\n    <table #table\r\n           mat-table\r\n           matSort\r\n           [dataSource]=\"tableDataSource\">\r\n\r\n      <ng-container *ngFor=\"let columnKey of tableColumns; let i = index\"\r\n                    [matColumnDef]=\"columnKey\"\r\n                    [ngSwitch]=\"columnKey\">\r\n\r\n        <ng-container *ngSwitchCase=\"'_selection'\">\r\n          <th mat-header-cell *matHeaderCellDef [ngClass]=\"{selection: true, hidden: !multiple}\"></th>\r\n          <td mat-cell *matCellDef=\"let row\" [ngClass]=\"{selection: true, hidden: !multiple}\">\r\n            <mat-option [value]=\"row.id\"></mat-option>\r\n          </td>\r\n        </ng-container>\r\n\r\n        <ng-container *ngSwitchDefault>\r\n          <th mat-header-cell\r\n              mat-sort-header\r\n              [disabled]=\"!tableColumnsMap.get(columnKey).sortable\"\r\n              *matHeaderCellDef>\r\n            <!-- Header cell -->\r\n            <ng-container [ngSwitch]=\"tableColumnsMap.get(columnKey).filter?.type\">\r\n              <ng-container *ngSwitchCase=\"'string'\"\r\n                            [ngTemplateOutlet]=\"filterTypeString\"\r\n                            [ngTemplateOutletContext]=\"{column: tableColumnsMap.get(columnKey)}\"></ng-container>\r\n\r\n              <div *ngSwitchDefault>{{tableColumnsMap.get(columnKey).name}}</div>\r\n            </ng-container>\r\n          </th>\r\n          <td mat-cell *matCellDef=\"let row\"\r\n              [colSpan]=\"addNullRow() && row.id === null && i === 1 ? tableColumns.length : 1\"\r\n              [ngStyle]=\"{display: addNullRow() && row.id === null && i !== 1 ? 'none' : ''}\"\r\n          >\r\n            {{addNullRow() && row.id === null && i === 1 ? labelForNullValue : row[columnKey]}}\r\n          </td>\r\n        </ng-container>\r\n\r\n      </ng-container>\r\n\r\n      <tr mat-header-row *matHeaderRowDef=\"tableColumns; sticky: true\"></tr>\r\n      <tr mat-row *matRowDef=\"let row; columns: tableColumns; let i = index\"\r\n          (click)=\"emulateMatOptionClick($event)\"\r\n          [ngClass]=\"{active: i === tableActiveRow}\"></tr>\r\n    </table>\r\n\r\n  </mat-select>\r\n</mat-form-field>\r\n\r\n<ng-template #filterTypeString\r\n             let-column='column'>\r\n  <mat-form-field\r\n    (click)=\"$event.stopPropagation()\"\r\n    class=\"filter\">\r\n    <input matInput\r\n           [formControl]=\"filterFormControl(column.key)\"\r\n           (keydown)=\"$event.stopPropagation()\"\r\n           (keyup)=\"$event.stopPropagation()\"\r\n           (keypress)=\"$event.stopPropagation()\"\r\n           [placeholder]=\"column.name\"/>\r\n  </mat-form-field>\r\n</ng-template>\r\n",
                    exportAs: 'ngx-mat-select-table',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef((/**
                             * @return {?}
                             */
                            function () { return MatSelectTableComponent; })),
                            multi: true
                        }
                    ],
                    styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel{overflow-x:auto!important}::ng-deep .mat-select-panel.mat-select-search-table-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px;width:calc(100% - 26px)}::ng-deep .mat-select-panel.mat-select-search-table-panel table{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr{cursor:pointer;height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr mat-option{height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-bottom:0!important;box-shadow:inset 0 -1px 0 0 rgba(0,0,0,.12)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th[aria-sort] ::ng-deep .mat-sort-header-arrow{opacity:1!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
                }] }
    ];
    /** @nocollapse */
    MatSelectTableComponent.ctorParameters = function () { return [
        { type: ChangeDetectorRef }
    ]; };
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
        close: [{ type: Output }],
        matSelect: [{ type: ViewChild, args: ['componentSelect',] }],
        matSelectSearch: [{ type: ViewChild, args: [MatSelectSearchComponent,] }],
        sort: [{ type: ViewChild, args: [MatSort,] }],
        table: [{ type: ViewChild, args: [MatTable,] }],
        tableRef: [{ type: ViewChild, args: ['table', { read: ElementRef },] }],
        matOptions: [{ type: ViewChildren, args: [MatOption,] }]
    };
    return MatSelectTableComponent;
}());
export { MatSelectTableComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbIm1hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUVMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFVBQVUsRUFBRSxZQUFZLEVBQ3hCLFVBQVUsRUFDVixLQUFLLEVBR0csTUFBTSxFQUNkLFNBQVMsRUFFVCxTQUFTLEVBQ1QsWUFBWSxFQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBdUIsV0FBVyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQy9GLE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQTBDLE1BQU0sbUJBQW1CLENBQUM7QUFDbkgsT0FBTyxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBR3BFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc3RCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7SUFFekQsZ0JBQWdCLEdBQUcsZ0JBQWdCO0FBRXpDO0lBNkhFLGlDQUFvQixFQUFxQjtRQUFyQixPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQXRFakMsWUFBTyxHQUFzQixFQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUMsQ0FBQztRQW9CdEMsVUFBSyxHQUEwQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBd0I1RCxv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RWxCLFNBQVMsU0FBQyxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDOzZCQUVyQyxZQUFZLFNBQUMsU0FBUzs7SUFrakJ6Qiw4QkFBQztDQUFBLEFBem9CRCxJQXlvQkM7U0EzbkJZLHVCQUF1Qjs7Ozs7O0lBR2xDLDZDQUFpRTs7Ozs7O0lBTWpFLDJDQUEyQjs7Ozs7SUFHM0IsdURBQXVDOzs7OztJQUd2Qyx1REFBdUM7Ozs7O0lBR3ZDLGtEQUFrQzs7Ozs7SUFHbEMscURBQXFDOzs7OztJQUtyQyx1REFBc0U7Ozs7O0lBS3RFLG1EQUFnQzs7Ozs7OztJQU9oQyw2REFBNEM7O0lBRTVDLG9EQUFtQzs7Ozs7SUFDbkMsMENBQWdEOzs7Ozs7SUFNaEQsd0RBQXVEOzs7Ozs7O0lBT3ZELDhEQUE2RDs7Ozs7SUFLN0QsOENBQTJCOztJQUUzQix3Q0FBNEQ7Ozs7O0lBRTVELDRDQUEyRDs7Ozs7SUFFM0Qsa0RBQXVGOzs7OztJQUV2Rix1Q0FBMEM7Ozs7O0lBRTFDLHdDQUFnRTs7Ozs7SUFFaEUsMkNBQXFFOzs7OztJQUVyRSw2Q0FBa0U7O0lBRWxFLGtEQUFxQzs7SUFFckMsK0NBQXVCOztJQUV2QixrREFBbUQ7O0lBRW5ELGlEQUF1Qjs7SUFFdkIsa0RBQXNEOztJQUV0RCxrREFBMEM7O0lBRTFDLDREQUFtQzs7SUFFbkMsdURBQWtDOzs7OztJQUVsQyxpREFBa0M7Ozs7O0lBRWxDLG9EQUFzQzs7Ozs7SUFFdEMsMkRBT0U7Ozs7OztJQUdGLDZDQUF5Qzs7Ozs7SUFFekMsZ0RBQTRDOzs7OztJQUU1QyxtREFBK0M7Ozs7O0lBRW5DLHFDQUE2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcclxuICBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBDb21wb25lbnQsXHJcbiAgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLFxyXG4gIGZvcndhcmRSZWYsXHJcbiAgSW5wdXQsXHJcbiAgT25DaGFuZ2VzLFxyXG4gIE9uRGVzdHJveSxcclxuICBPbkluaXQsIE91dHB1dCxcclxuICBRdWVyeUxpc3QsXHJcbiAgU2ltcGxlQ2hhbmdlcyxcclxuICBWaWV3Q2hpbGQsXHJcbiAgVmlld0NoaWxkcmVuXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIEZvcm1Db250cm9sLCBGb3JtR3JvdXAsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7bWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge01hdE9wdGlvbiwgTWF0U2VsZWN0LCBNYXRTb3J0LCBNYXRUYWJsZSwgTWF0VGFibGVEYXRhU291cmNlLCBTb3J0LCBTb3J0RGlyZWN0aW9ufSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbCc7XHJcbmltcG9ydCB7aXNBcnJheSwgaXNOdWxsT3JVbmRlZmluZWQsIGlzTnVtYmVyLCBpc1N0cmluZ30gZnJvbSAndXRpbCc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVEYXRhU291cmNlfSBmcm9tICcuL01hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZSc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVSb3d9IGZyb20gJy4vTWF0U2VsZWN0VGFibGVSb3cnO1xyXG5pbXBvcnQge19pc051bWJlclZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xyXG5pbXBvcnQge2RlYm91bmNlVGltZSwgdGFrZSwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVDb2x1bW59IGZyb20gJy4vTWF0U2VsZWN0VGFibGVDb2x1bW4nO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlRmlsdGVyfSBmcm9tICcuL01hdFNlbGVjdFRhYmxlRmlsdGVyJztcclxuaW1wb3J0IHtNYXRTZWxlY3RTZWFyY2hDb21wb25lbnR9IGZyb20gJ25neC1tYXQtc2VsZWN0LXNlYXJjaCc7XHJcblxyXG5jb25zdCBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmd4LW1hdC1zZWxlY3QtdGFibGUnLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9tYXQtc2VsZWN0LXRhYmxlLmNvbXBvbmVudC5odG1sJyxcclxuICBzdHlsZVVybHM6IFsnLi9tYXQtc2VsZWN0LXRhYmxlLmNvbXBvbmVudC5zY3NzJ10sXHJcbiAgZXhwb3J0QXM6ICduZ3gtbWF0LXNlbGVjdC10YWJsZScsXHJcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgcHJvdmlkZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxyXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCksXHJcbiAgICAgIG11bHRpOiB0cnVlXHJcbiAgICB9XHJcbiAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTWF0U2VsZWN0VGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25Jbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3ksIE9uQ2hhbmdlcyB7XHJcblxyXG4gIC8qKiBEYXRhIFNvdXJjZSBmb3IgdGhlIHRhYmxlICovXHJcbiAgQElucHV0KCkgZGF0YVNvdXJjZTogTWF0U2VsZWN0VGFibGVEYXRhU291cmNlPE1hdFNlbGVjdFRhYmxlUm93PjtcclxuXHJcbiAgLyoqXHJcbiAgICogTXVsdGlwbGUvU2luZ2xlIG1vZGUgZm9yIHtAc2VlIE1hdFNlbGVjdCNtdWx0aXBsZX0gdG8gaW5pdGlhbGl6ZS5cclxuICAgKiBOQjogc3dpdGNoaW5nIGJldHdlZW4gbW9kZXMgaW4gcnVudGltZSBpcyBub3Qgc3VwcG9ydGVkIGJ5IHtAc2VlIE1hdFNlbGVjdH1cclxuICAgKi9cclxuICBASW5wdXQoKSBtdWx0aXBsZTogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgb3Igbm90IG92ZXJhbGwgc2VhcmNoIG1vZGUgZW5hYmxlZC4gU2VlIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50fSAqL1xyXG4gIEBJbnB1dCgpIG92ZXJhbGxTZWFyY2hFbmFibGVkOiBib29sZWFuO1xyXG5cclxuICAvKiogRGVmYXVsdCBpcyB0cnVlICovXHJcbiAgQElucHV0KCkgb3ZlcmFsbFNlYXJjaFZpc2libGU6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCBzaG91bGQge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnR9IGJlIHZpc2libGUgb24gb3Blbi4gRGVmYXVsdCBpcyB0cnVlICovXHJcbiAgQElucHV0KCkgcmVzZXRTb3J0T25PcGVuOiBib29sZWFuO1xyXG5cclxuICAvKiogV2hldGhlciBvciBub3QgcHJldmlvdXMgc2VhcmNoIHNob3VsZCBiZSBjbGVhcmVkIG9uIG9wZW4uIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIHJlc2V0RmlsdGVyc09uT3BlbjogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdG8gY3VzdG9taXplIHRoZSBkZWZhdWx0IGxhYmVsXHJcbiAgICovXHJcbiAgQElucHV0KCkgY3VzdG9tVHJpZ2dlckxhYmVsRm46ICh2YWx1ZTogTWF0U2VsZWN0VGFibGVSb3dbXSkgPT4gc3RyaW5nO1xyXG5cclxuICAvKipcclxuICAgKiBTb3J0IG9wdGlvbiBmb3IgdmFsdWVzIGluIHRoZSBjdXN0b21UcmlnZ2VyTGFiZWxGbiBpbiBNdWx0aXBsZSBtb2RlLlxyXG4gICAgKi9cclxuICBASW5wdXQoKSB0cmlnZ2VyTGFiZWxTb3J0OiBTb3J0O1xyXG5cclxuICAvKipcclxuICAgKiBUZW1wbGF0ZSB0byBjdXN0b21pemUgdGhlIGRlZmF1bHQgdHJpZ2dlciBsYWJlbC4gSGFzIGxlc3NlciBwcmlvcml0eSB0aGFuIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I2N1c3RvbVRyaWdnZXJMYWJlbEZufS5cclxuICAgKiBTdWJzdGl0dXRpb24gaXMgY2FzZSBzZW5zaXRpdmUuXHJcbiAgICogRXhhbXBsZTogJHtuYW1lfSAke2lkfSAtICR7YWRkcmVzc31cclxuICAgKi9cclxuICBASW5wdXQoKSBjdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZTogc3RyaW5nO1xyXG5cclxuICBASW5wdXQoKSBsYWJlbEZvck51bGxWYWx1ZTogc3RyaW5nO1xyXG4gIHByaXZhdGUgbnVsbFJvdzogTWF0U2VsZWN0VGFibGVSb3cgPSB7aWQ6IG51bGx9O1xyXG5cclxuICAvKipcclxuICAgKiB7QHNlZSBNYXRTZWxlY3R9IHByb3h5IGlucHV0cyBjb25maWd1cmF0b3JcclxuICAgKiB7QHNlZSBNYXRTZWxlY3QjbXVsdGlwbGV9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNtdWx0aXBsZX1cclxuICAgKi9cclxuICBASW5wdXQoKSBtYXRTZWxlY3RDb25maWd1cmF0b3I6IHsgW2tleTogc3RyaW5nXTogYW55IH07XHJcblxyXG4gIC8qKlxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0gcHJveHkgaW5wdXRzIGNvbmZpZ3VyYXRvclxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudCNjbGVhclNlYXJjaElucHV0fSBnZXRzIHZhbHVlIGZyb20ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjcmVzZXRGaWx0ZXJzT25PcGVufVxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0ge0BzZWUgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNvdmVyYWxsRmlsdGVyQ29udHJvbH1cclxuICAgKi9cclxuICBASW5wdXQoKSBtYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3I6IHsgW2tleTogc3RyaW5nXTogYW55IH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGx5IGRlZmF1bHQgc29ydGluZ1xyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGRlZmF1bHRTb3J0OiBTb3J0O1xyXG5cclxuICBAT3V0cHV0KCkgY2xvc2U6IEV2ZW50RW1pdHRlcjxib29sZWFuPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgQFZpZXdDaGlsZCgnY29tcG9uZW50U2VsZWN0JykgcHJpdmF0ZSBtYXRTZWxlY3Q6IE1hdFNlbGVjdDtcclxuXHJcbiAgQFZpZXdDaGlsZChNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQpIHByaXZhdGUgbWF0U2VsZWN0U2VhcmNoOiBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQ7XHJcblxyXG4gIEBWaWV3Q2hpbGQoTWF0U29ydCkgcHJpdmF0ZSBzb3J0OiBNYXRTb3J0O1xyXG5cclxuICBAVmlld0NoaWxkKE1hdFRhYmxlKSBwcml2YXRlIHRhYmxlOiBNYXRUYWJsZTxNYXRTZWxlY3RUYWJsZVJvdz47XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ3RhYmxlJywge3JlYWQ6IEVsZW1lbnRSZWZ9KSBwcml2YXRlIHRhYmxlUmVmOiBFbGVtZW50UmVmO1xyXG5cclxuICBAVmlld0NoaWxkcmVuKE1hdE9wdGlvbikgcHJpdmF0ZSBtYXRPcHRpb25zOiBRdWVyeUxpc3Q8TWF0T3B0aW9uPjtcclxuXHJcbiAgdGFibGVEYXRhU291cmNlOiBNYXRTZWxlY3RUYWJsZVJvd1tdO1xyXG5cclxuICB0YWJsZUNvbHVtbnM6IHN0cmluZ1tdO1xyXG5cclxuICB0YWJsZUNvbHVtbnNNYXA6IE1hcDxzdHJpbmcsIE1hdFNlbGVjdFRhYmxlQ29sdW1uPjtcclxuXHJcbiAgdGFibGVBY3RpdmVSb3c6IG51bWJlcjtcclxuXHJcbiAgZmlsdGVyZWRPdXRSb3dzOiB7IFtrZXk6IHN0cmluZ106IE1hdFNlbGVjdFRhYmxlUm93IH07XHJcblxyXG4gIGNvbXBsZXRlUm93TGlzdDogTWF0U2VsZWN0VGFibGVSb3dbXSA9IFtdO1xyXG5cclxuICBvdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlOiBib29sZWFuO1xyXG5cclxuICBvdmVyYWxsRmlsdGVyQ29udHJvbDogRm9ybUNvbnRyb2w7XHJcblxyXG4gIHByaXZhdGUgZmlsdGVyQ29udHJvbHM6IEZvcm1Hcm91cDtcclxuXHJcbiAgcHJpdmF0ZSBjb21wbGV0ZVZhbHVlTGlzdDogYW55W10gPSBbXTtcclxuXHJcbiAgcHJpdmF0ZSBjb250cm9sVmFsdWVBY2Nlc3NvcktleXM6IHN0cmluZ1tdID0gW1xyXG4gICAgJ2Zvcm1Db250cm9sJyxcclxuICAgICdmb3JtQ29udHJvbE5hbWUnLFxyXG4gICAgJ2Zvcm1Hcm91cCcsXHJcbiAgICAnZm9ybUdyb3VwTmFtZScsXHJcbiAgICAnZm9ybUFycmF5JyxcclxuICAgICdmb3JtQXJyYXlOYW1lJ1xyXG4gIF07XHJcblxyXG4gIC8qKiBTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cclxuICBwcml2YXRlIF9vbkRlc3Ryb3kgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBwcml2YXRlIF9vblNlbGVjdE9wZW4gPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBwcml2YXRlIF9vbk9wdGlvbnNDaGFuZ2UgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikge1xyXG4gICAgdGhpcy50YWJsZUNvbHVtbnNNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLmZpbHRlckNvbnRyb2xzID0gbmV3IEZvcm1Hcm91cCh7fSk7XHJcbiAgICB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sID0gbmV3IEZvcm1Db250cm9sKCcnKTtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tdWx0aXBsZSA9IHRoaXMubXVsdGlwbGUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5vcGVuZWRDaGFuZ2VcclxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXHJcbiAgICAgIC5zdWJzY3JpYmUob3BlbmVkID0+IHtcclxuICAgICAgICBpZiAodGhpcy5yZXNldEZpbHRlcnNPbk9wZW4gIT09IGZhbHNlIHx8ICF0aGlzLm1hdE9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUgPSB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlO1xyXG4gICAgICAgIGlmICh0aGlzLnJlc2V0U29ydE9uT3BlbiAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgIHRoaXMuc29ydC5zb3J0KHtpZDogJycsIHN0YXJ0OiAnYXNjJywgZGlzYWJsZUNsZWFyOiBmYWxzZX0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW9wZW5lZCkge1xyXG4gICAgICAgICAgdGhpcy5jbG9zZS5lbWl0KCFvcGVuZWQpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCkge1xyXG4gICAgICAgICAgdGhpcy5wcm94eU1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRpb24odGhpcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUb0RvOiBnZXQgcmlkIG9mIHRoaXMgd29ya2Fyb3VuZCAodXBkYXRlcyBoZWFkZXIgcm93IFtvdGhlcndpc2Ugc29ydCBtZWNoYW5pc20gcHJvZHVjZXMgZ2xpdGNoZXNdKVxyXG4gICAgICAgICh0aGlzLnRhYmxlIGFzIGFueSkuX2hlYWRlclJvd0RlZkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIC8vIERpc2FibGUgc29ydCBidXR0b25zIHRvIHByZXZlbnQgc29ydGluZyBjaGFuZ2Ugb24gU1BBQ0Uga2V5IHByZXNzZWQgaW4gZmlsdGVyIGZpZWxkXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBbXS5mb3JFYWNoLmNhbGwoXHJcbiAgICAgICAgICB0aGlzLnRhYmxlUmVmLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uLm1hdC1zb3J0LWhlYWRlci1idXR0b24nKSxcclxuICAgICAgICAgIChlKSA9PiBlLmRpc2FibGVkID0gdHJ1ZSlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBQYXRjaCB0aGUgaGVpZ2h0IG9mIHRoZSBwYW5lbCB0byBpbmNsdWRlIHRoZSBoZWlnaHQgb2YgdGhlIGhlYWRlciBhbmQgZm9vdGVyXHJcbiAgICAgICAgY29uc3QgcGFuZWxFbGVtZW50OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMubWF0U2VsZWN0LnBhbmVsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgcGFuZWxIZWlnaHQgPSBwYW5lbEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgICAgIGxldCB0YWJsZUFkZGl0aW9uYWxIZWlnaHQgPSAwO1xyXG4gICAgICAgIHRoaXMudGFibGVcclxuICAgICAgICAgIC5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMudGFibGUuX2hlYWRlclJvd091dGxldClcclxuICAgICAgICAgIC5jb25jYXQodGhpcy50YWJsZS5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMudGFibGUuX2Zvb3RlclJvd091dGxldCkpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGFibGVBZGRpdGlvbmFsSGVpZ2h0ICs9IHJvdy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xyXG4gICAgICAgIGlmICghaXNOYU4ocGFuZWxIZWlnaHQpKSB7XHJcbiAgICAgICAgICBwYW5lbEVsZW1lbnQuc3R5bGUubWF4SGVpZ2h0ID0gYCR7cGFuZWxIZWlnaHQgKyB0YWJsZUFkZGl0aW9uYWxIZWlnaHR9cHhgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvci5kaXNhYmxlU2Nyb2xsVG9BY3RpdmVPbk9wdGlvbnNDaGFuZ2VkXHJcbiAgICAgICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIpICYmIHRoaXMuY29tcGxldGVSb3dMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHRoaXMuX29uU2VsZWN0T3Blbi5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpLCBkZWJvdW5jZVRpbWUoMSksIHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0VmFsdWUgPSBgJHt0aGlzLmNvbXBsZXRlUm93TGlzdFswXS5pZH1gO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudGFibGVEYXRhU291cmNlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGAke3RoaXMudGFibGVEYXRhU291cmNlW2ldLmlkfWAgPT09IGZpcnN0VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oaSk7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZWQpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcclxuICAgIG1lcmdlKC4uLltcclxuICAgICAgdGhpcy5fb25PcHRpb25zQ2hhbmdlLFxyXG4gICAgICB0aGlzLnNvcnQuc29ydENoYW5nZSxcclxuICAgICAgdGhpcy5maWx0ZXJDb250cm9scy52YWx1ZUNoYW5nZXMsXHJcbiAgICAgIHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWVDaGFuZ2VzXHJcbiAgICBdKVxyXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSwgZGVib3VuY2VUaW1lKDEwMCkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRhdGFDbG9uZTogTWF0U2VsZWN0VGFibGVSb3dbXSA9IFsuLi4oKHRoaXMuZGF0YVNvdXJjZSB8fCB7ZGF0YTogW119KS5kYXRhIHx8IFtdKV07XHJcbiAgICAgICAgaWYgKHRoaXMuYWRkTnVsbFJvdygpKSB7XHJcbiAgICAgICAgICBkYXRhQ2xvbmUudW5zaGlmdCh0aGlzLm51bGxSb3cpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwbHkgZmlsdGVyaW5nXHJcbiAgICAgICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaEVuYWJsZWQgJiYgdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlKSB7XHJcbiAgICAgICAgICB0aGlzLmFwcGx5T3ZlcmFsbEZpbHRlcihkYXRhQ2xvbmUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmFwcGx5Q29sdW1uTGV2ZWxGaWx0ZXJzKGRhdGFDbG9uZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbmhlcml0IGRlZmF1bHQgc29ydGluZyBvcHRpb25zIGlmIHNvcnQgbm90IHNwZWNpZmllZFxyXG4gICAgICAgIGlmICghdGhpcy5zb3J0LmFjdGl2ZSAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5kZWZhdWx0U29ydCkgJiYgdGhpcy5kZWZhdWx0U29ydC5hY3RpdmUpIHtcclxuICAgICAgICAgIHRoaXMuc29ydC5hY3RpdmUgPSB0aGlzLmRlZmF1bHRTb3J0LmFjdGl2ZTtcclxuICAgICAgICAgIHRoaXMuc29ydC5kaXJlY3Rpb24gPSB0aGlzLmRlZmF1bHRTb3J0LmRpcmVjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGx5IGRlZmF1bHQgb3IgbWFudWFsIHNvcnRpbmdcclxuICAgICAgICB0aGlzLnRhYmxlRGF0YVNvdXJjZSA9ICF0aGlzLnNvcnQuYWN0aXZlID9cclxuICAgICAgICAgIGRhdGFDbG9uZSA6IHRoaXMuc29ydERhdGEoZGF0YUNsb25lLCB0aGlzLnNvcnQuYWN0aXZlLCB0aGlzLnNvcnQuZGlyZWN0aW9uKTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGlnbm9yZWQpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX29uU2VsZWN0T3Blbi5uZXh0KCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIC8vIE1hbnVhbGx5IHNvcnQgZGF0YSBmb3IgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucyAoUXVlcnlMaXN0PE1hdE9wdGlvbj4pIGFuZCBub3RpZnkgbWF0U2VsZWN0Lm9wdGlvbnMgb2YgY2hhbmdlc1xyXG4gICAgLy8gSXQncyBpbXBvcnRhbnQgdG8ga2VlcCB0aGlzLm1hdFNlbGVjdC5vcHRpb25zIG9yZGVyIHN5bmNocm9uaXplZCB3aXRoIGRhdGEgaW4gdGhlIHRhYmxlXHJcbiAgICAvLyAgICAgYmVjYXVzZSB0aGlzLm1hdFNlbGVjdC5vcHRpb25zIChRdWVyeUxpc3Q8TWF0T3B0aW9uPikgZG9lc24ndCB1cGRhdGUgaXQncyBzdGF0ZSBhZnRlciB0YWJsZSBkYXRhIGlzIGNoYW5nZWRcclxuICAgIHRoaXMubWF0T3B0aW9ucy5jaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnM6IHsgW2tleTogc3RyaW5nXTogTWF0T3B0aW9uIH0gPSB7fTtcclxuICAgICAgdGhpcy5tYXRPcHRpb25zLnRvQXJyYXkoKVxyXG4gICAgICAgIC5maWx0ZXIob3B0aW9uID0+ICFpc051bGxPclVuZGVmaW5lZChvcHRpb24pKVxyXG4gICAgICAgIC5mb3JFYWNoKG9wdGlvbiA9PiBvcHRpb25zW2Ake29wdGlvbi52YWx1ZX1gXSA9IG9wdGlvbik7XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMucmVzZXQodGhpcy50YWJsZURhdGFTb3VyY2VcclxuICAgICAgICAuZmlsdGVyKHJvdyA9PiAhaXNOdWxsT3JVbmRlZmluZWQob3B0aW9uc1tgJHtyb3cuaWR9YF0pKVxyXG4gICAgICAgIC5tYXAocm93ID0+IG9wdGlvbnNbYCR7cm93LmlkfWBdKSk7XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMubm90aWZ5T25DaGFuZ2VzKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyKSkge1xyXG4gICAgICAvLyBTdWJzY3JpYmUgb24gS2V5TWFuYWdlciBjaGFuZ2VzIHRvIGhpZ2hsaWdodCB0aGUgdGFibGUgcm93cyBhY2NvcmRpbmdseVxyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlci5jaGFuZ2VcclxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSlcclxuICAgICAgICAuc3Vic2NyaWJlKGFjdGl2ZVJvdyA9PiB0aGlzLnRhYmxlQWN0aXZlUm93ID0gYWN0aXZlUm93KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdGhpcy5fb25TZWxlY3RPcGVuLmNvbXBsZXRlKCk7XHJcbiAgICB0aGlzLl9vbkRlc3Ryb3kubmV4dCgpO1xyXG4gICAgdGhpcy5fb25EZXN0cm95LmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgY29uc3QgcHJveHlGbjogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAvLyBUb0RvOiByZWZhY3RvciAtIGNvbXBhcmlzb24gbWVjaGFuaXNtIGlzbid0IG9wdGltaXplZC4gZmlsdGVyZWRPdXRSb3dzIGlzIGEgbWFwIGJ1dCBjb21wbGV0ZVZhbHVlTGlzdCBpcyBhbiBhcnJheVxyXG4gICAgICBpZiAodGhpcy5tdWx0aXBsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7dGhpcy5jb21wbGV0ZVZhbHVlTGlzdFtpXX1gXSA9PT0gdW5kZWZpbmVkICYmIHZhbHVlLmluZGV4T2YodGhpcy5jb21wbGV0ZVZhbHVlTGlzdFtpXSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGVWYWx1ZUxpc3Quc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YWx1ZVxyXG4gICAgICAgICAgLmZpbHRlcihjaG9pY2UgPT4gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5pbmRleE9mKGNob2ljZSkgPT09IC0xKVxyXG4gICAgICAgICAgLmZvckVhY2goY2hvaWNlID0+IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QucHVzaChjaG9pY2UpKTtcclxuICAgICAgICB0aGlzLm1hdFNlbGVjdC52YWx1ZSA9IHRoaXMuY29tcGxldGVWYWx1ZUxpc3Q7XHJcbiAgICAgICAgZm4odGhpcy5jb21wbGV0ZVZhbHVlTGlzdCk7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgICAgICgodGhpcy5kYXRhU291cmNlIHx8IHtkYXRhOiBbXX0pLmRhdGEgfHwgW10pXHJcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LmluZGV4T2Yocm93LmlkKSAhPT0gLTEpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3cpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmbih2YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgICAgICgodGhpcy5kYXRhU291cmNlIHx8IHtkYXRhOiBbXX0pLmRhdGEgfHwgW10pXHJcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiByb3cuaWQgPT09IHZhbHVlKVxyXG4gICAgICAgICAgLmZvckVhY2gocm93ID0+IHRoaXMuY29tcGxldGVSb3dMaXN0LnB1c2gocm93KSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5yZWdpc3Rlck9uQ2hhbmdlKHByb3h5Rm4pO1xyXG4gIH1cclxuXHJcbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHt9KTogdm9pZCB7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5yZWdpc3Rlck9uVG91Y2hlZChmbik7XHJcbiAgfVxyXG5cclxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMubWF0U2VsZWN0LnNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZCk7XHJcbiAgfVxyXG5cclxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMudXBkYXRlQ29tcGxldGVSb3dMaXN0KHZhbHVlKTtcclxuICAgIHRoaXMubWF0U2VsZWN0LndyaXRlVmFsdWUodmFsdWUpO1xyXG4gICAgaWYgKHRoaXMubWF0U2VsZWN0LnZhbHVlICE9PSB2YWx1ZSkge1xyXG4gICAgICB0aGlzLm1hdFNlbGVjdC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5yZXNldEZpbHRlcnNPbk9wZW4pICYmIGNoYW5nZXMucmVzZXRGaWx0ZXJzT25PcGVuLmN1cnJlbnRWYWx1ZSAhPT0gZmFsc2UpIHtcclxuICAgICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMuZGF0YVNvdXJjZSkpIHtcclxuICAgICAgdGhpcy51cGRhdGVDb21wbGV0ZVJvd0xpc3QodGhpcy5jb21wbGV0ZVJvd0xpc3QubWFwKHJvdyA9PiByb3cuaWQpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm94eSBASW5wdXQgYmluZGluZ3MgdG8gTWF0U2VsZWN0XHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMubWF0U2VsZWN0Q29uZmlndXJhdG9yKSkge1xyXG4gICAgICBjb25zdCBjb25maWd1cmF0aW9uID0gY2hhbmdlcy5tYXRTZWxlY3RDb25maWd1cmF0b3IuY3VycmVudFZhbHVlO1xyXG4gICAgICBPYmplY3Qua2V5cyhjb25maWd1cmF0aW9uKVxyXG4gICAgICAgIC5maWx0ZXIoa2V5ID0+ICFbJ211bHRpcGxlJywgJ3BhbmVsQ2xhc3MnXS5pbmNsdWRlcyhrZXkpICYmICF0aGlzLmNvbnRyb2xWYWx1ZUFjY2Vzc29yS2V5cy5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiB0aGlzLm1hdFNlbGVjdFtrZXldID0gY29uZmlndXJhdGlvbltrZXldKTtcclxuICAgICAgY29uc3QgcGFuZWxDbGFzczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgcGFuZWxDbGFzcy5wdXNoKCdtYXQtc2VsZWN0LXNlYXJjaC10YWJsZS1wYW5lbCcpO1xyXG4gICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNvbmZpZ3VyYXRpb24ucGFuZWxDbGFzcykpIHtcclxuICAgICAgICBwYW5lbENsYXNzLnB1c2goY29uZmlndXJhdGlvbi5wYW5lbENsYXNzKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCkge1xyXG4gICAgICAgIHBhbmVsQ2xhc3MucHVzaCgnbWF0LXNlbGVjdC1zZWFyY2gtcGFuZWwnKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5wYW5lbENsYXNzID0gcGFuZWxDbGFzcztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yKSkge1xyXG4gICAgICB0aGlzLnByb3h5TWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdGlvbihjaGFuZ2VzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvci5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlKVxyXG4gICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZSlcclxuICAgICAgJiYgaXNBcnJheShjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmRhdGEpKSB7XHJcbiAgICAgIHRoaXMudGFibGVEYXRhU291cmNlID0gWy4uLmNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YV07XHJcbiAgICAgIGlmICh0aGlzLmFkZE51bGxSb3coKSkge1xyXG4gICAgICAgIHRoaXMudGFibGVEYXRhU291cmNlLnVuc2hpZnQodGhpcy5udWxsUm93KTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnRhYmxlQ29sdW1ucyA9IFsnX3NlbGVjdGlvbicsIC4uLmNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuY29sdW1ucy5tYXAoY29sdW1uID0+IGNvbHVtbi5rZXkpXTtcclxuICAgICAgdGhpcy50YWJsZUNvbHVtbnNNYXAuY2xlYXIoKTtcclxuICAgICAgY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5jb2x1bW5zLmZvckVhY2goY29sdW1uID0+IHRoaXMudGFibGVDb2x1bW5zTWFwLnNldChjb2x1bW4ua2V5LCBjb2x1bW4pKTtcclxuICAgICAgdGhpcy5hcHBseVByb3h5VG9BcnJheShjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmRhdGEsICgpID0+IHtcclxuICAgICAgICB0aGlzLl9vbk9wdGlvbnNDaGFuZ2UubmV4dCgpO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5fb25PcHRpb25zQ2hhbmdlLm5leHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGVtdWxhdGVNYXRPcHRpb25DbGljayhldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgaWYgKGV2ZW50LmNvbXBvc2VkUGF0aCgpXHJcbiAgICAgIC5maWx0ZXIoZXQgPT4gZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcclxuICAgICAgLnNvbWUoKGV0OiBIVE1MRWxlbWVudCkgPT4gZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnbWF0LW9wdGlvbicpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBsZXQgcm93RWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuICAgIHdoaWxlIChyb3dFbGVtZW50ICE9IG51bGwgJiYgcm93RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIHJvd0VsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAndHInKSB7XHJcbiAgICAgIHJvd0VsZW1lbnQgPSByb3dFbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBpZiAocm93RWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBjaGlsZE9wdGlvbjogSFRNTEVsZW1lbnQgPSByb3dFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ21hdC1vcHRpb24nKTtcclxuICAgIGlmICghY2hpbGRPcHRpb24pIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY2hpbGRPcHRpb24uY2xpY2soKTtcclxuICB9XHJcblxyXG5cclxuICBmaWx0ZXJGb3JtQ29udHJvbChrZXk6IHN0cmluZyk6IEZvcm1Db250cm9sIHtcclxuICAgIGlmICghdGhpcy5maWx0ZXJDb250cm9scy5jb250YWlucyhrZXkpKSB7XHJcbiAgICAgIHRoaXMuZmlsdGVyQ29udHJvbHMucmVnaXN0ZXJDb250cm9sKGtleSwgbmV3IEZvcm1Db250cm9sKCcnKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gPEZvcm1Db250cm9sPnRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSk7XHJcbiAgfVxyXG5cclxuICBzaW1wbGVUcmlnZ2VyTGFiZWxGbih2YWx1ZTogTWF0U2VsZWN0VGFibGVSb3dbXSk6IHN0cmluZyB7XHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMudHJpZ2dlckxhYmVsU29ydCkpIHtcclxuICAgICAgdGhpcy5zb3J0RGF0YSh2YWx1ZSwgdGhpcy50cmlnZ2VyTGFiZWxTb3J0LmFjdGl2ZSwgdGhpcy50cmlnZ2VyTGFiZWxTb3J0LmRpcmVjdGlvbik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWUubWFwKHJvdyA9PiB7XHJcbiAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChyb3cpKSB7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlKVxyXG4gICAgICAgIHx8IHR5cGVvZiB0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlICE9PSAnc3RyaW5nJ1xyXG4gICAgICAgIHx8IHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBgJHtyb3cuaWR9YDtcclxuICAgICAgfVxyXG4gICAgICBsZXQgYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPSBmYWxzZTtcclxuICAgICAgY29uc3Qgc3Vic3RpdHV0aW9uOiBzdHJpbmcgPSB0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlLnJlcGxhY2UoL1skXXsxfVt7XXsxfShbXn1dKylbfV17MX0/L2csIChfLCBrZXkpID0+XHJcbiAgICAgICAgIWlzTnVsbE9yVW5kZWZpbmVkKHJvd1trZXldKSAmJiAoYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPSB0cnVlKSA/IHJvd1trZXldIDogJycpO1xyXG4gICAgICBpZiAoYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIGAke3Jvdy5pZH1gO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdWJzdGl0dXRpb24udHJpbSgpO1xyXG4gICAgfSkuam9pbignLCAnKTtcclxuICB9XHJcblxyXG4gIHRvZ2dsZU92ZXJhbGxTZWFyY2goKTogdm9pZCB7XHJcbiAgICB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUgPSAhdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlO1xyXG4gICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgIGlmICh0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUpIHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLm1hdFNlbGVjdFNlYXJjaC5fZm9jdXMoKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUNvbXBsZXRlUm93TGlzdCh2YWx1ZTogYW55W10pOiB2b2lkIHtcclxuICAgIHRoaXMuY29tcGxldGVSb3dMaXN0LnNwbGljZSgwKTtcclxuICAgIHRoaXMuY29tcGxldGVWYWx1ZUxpc3Quc3BsaWNlKDApO1xyXG4gICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCB2YWx1ZUFycmF5OiBhbnlbXSA9ICFpc0FycmF5KHZhbHVlKSA/IFt2YWx1ZV0gOiB2YWx1ZTtcclxuICAgIHZhbHVlQXJyYXlcclxuICAgICAgLmZpbHRlcih2YWx1ZUlkID0+ICFpc051bGxPclVuZGVmaW5lZCh2YWx1ZUlkKSlcclxuICAgICAgLmZvckVhY2godmFsdWVJZCA9PiB7XHJcbiAgICAgICAgKCh0aGlzLmRhdGFTb3VyY2UgfHwge2RhdGE6IFtdfSkuZGF0YSB8fCBbXSlcclxuICAgICAgICAgIC5maWx0ZXIocm93ID0+ICFpc051bGxPclVuZGVmaW5lZChyb3cpICYmICFpc051bGxPclVuZGVmaW5lZChyb3cuaWQpICYmIHJvdy5pZCA9PT0gdmFsdWVJZClcclxuICAgICAgICAgIC5mb3JFYWNoKHJvdyA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGVSb3dMaXN0LnB1c2gocm93KTtcclxuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5wdXNoKHJvdy5pZCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblx0ICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMudHJpZ2dlckxhYmVsU29ydCkpIHtcclxuXHRcdHRoaXMuc29ydERhdGEodGhpcy5jb21wbGV0ZVJvd0xpc3QsIHRoaXMudHJpZ2dlckxhYmVsU29ydC5hY3RpdmUsIHRoaXMudHJpZ2dlckxhYmVsU29ydC5kaXJlY3Rpb24pO1xyXG5cdCAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwcm94eU1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRpb24oY29uZmlndXJhdGlvbjogeyBba2V5OiBzdHJpbmddOiBhbnkgfSk6IHZvaWQge1xyXG4gICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubWF0U2VsZWN0U2VhcmNoKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUHJveHkgQElucHV0IGJpbmRpbmdzIHRvIE5neE1hdFNlbGVjdFNlYXJjaFxyXG4gICAgT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbilcclxuICAgICAgLmZpbHRlcihrZXkgPT4gIVsnY2xlYXJTZWFyY2hJbnB1dCddLmluY2x1ZGVzKGtleSkgJiYgIXRoaXMuY29udHJvbFZhbHVlQWNjZXNzb3JLZXlzLmluY2x1ZGVzKGtleSkpXHJcbiAgICAgIC5mb3JFYWNoKGtleSA9PiB0aGlzLm1hdFNlbGVjdFNlYXJjaFtrZXldID0gY29uZmlndXJhdGlvbltrZXldKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwbHlDb2x1bW5MZXZlbEZpbHRlcnMoZGF0YTogTWF0U2VsZWN0VGFibGVSb3dbXSk6IHZvaWQge1xyXG4gICAgdGhpcy5maWx0ZXJlZE91dFJvd3MgPSB7fTtcclxuICAgIGNvbnN0IGZpbHRlcnM6IHsgW2tleTogc3RyaW5nXTogeyBmaWx0ZXI6IE1hdFNlbGVjdFRhYmxlRmlsdGVyLCB2YWx1ZTogYW55IH0gfSA9IHt9O1xyXG4gICAgT2JqZWN0LmtleXModGhpcy5maWx0ZXJDb250cm9scy5jb250cm9scylcclxuICAgICAgLmZpbHRlcihrZXkgPT4gdGhpcy50YWJsZUNvbHVtbnNNYXAuaGFzKGtleSlcclxuICAgICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy50YWJsZUNvbHVtbnNNYXAuZ2V0KGtleSkuZmlsdGVyKVxyXG4gICAgICAgIC8vIElmIGZpbHRlciBpcyBlbmFibGVkXHJcbiAgICAgICAgJiYgdGhpcy50YWJsZUNvbHVtbnNNYXAuZ2V0KGtleSkuZmlsdGVyLmVuYWJsZWQgIT09IGZhbHNlKVxyXG4gICAgICAuZmlsdGVyKGtleSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmZpbHRlckNvbnRyb2xzLmdldChrZXkpLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiAhaXNOdWxsT3JVbmRlZmluZWQodmFsdWUpXHJcbiAgICAgICAgICAvLyBJZiBhbiBhcnJheSAtIGNoZWNrIGl0J3Mgbm90IGVtcHR5XHJcbiAgICAgICAgICAmJiAoKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIC8vIElmIHN0cmluZyAtIGNoZWNrIHRoYXQgbm90IGJsYW5rXHJcbiAgICAgICAgICAgIHx8ICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnRyaW0oKS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAvLyBJZiBudW1iZXIgLSBjaGVjayB0aGF0IHRvU3RyaW5nKCkgaXMgbm90IGJsYW5rXHJcbiAgICAgICAgICAgIHx8ICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGAke3ZhbHVlfWAudHJpbSgpLmxlbmd0aCA+IDApKTtcclxuICAgICAgfSlcclxuICAgICAgLmZvckVhY2goa2V5ID0+IGZpbHRlcnNba2V5XSA9IHtcclxuICAgICAgICBmaWx0ZXI6IHRoaXMudGFibGVDb2x1bW5zTWFwLmdldChrZXkpLmZpbHRlcixcclxuICAgICAgICB2YWx1ZTogdGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIGNvbnN0IGZpbHRlcktleXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMoZmlsdGVycyk7XHJcbiAgICBmb3IgKGxldCBpID0gZGF0YS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBmb3IgKGxldCBrID0gMDsgayA8IGZpbHRlcktleXMubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICBjb25zdCBmaWx0ZXJLZXk6IHN0cmluZyA9IGZpbHRlcktleXNba107XHJcbiAgICAgICAgY29uc3Qgcm93OiBNYXRTZWxlY3RUYWJsZVJvdyA9IGRhdGFbaV07XHJcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlOiBhbnkgPSByb3dbZmlsdGVyS2V5XTtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBmaWx0ZXIgPSBmaWx0ZXJzW2ZpbHRlcktleV07XHJcbiAgICAgICAgY29uc3QgY29tcGFyYXRvciA9IGZpbHRlci5maWx0ZXIuY29tcGFyYXRvcjtcclxuICAgICAgICBpZiAodHlwZW9mIGZpbHRlci5maWx0ZXIuY29tcGFyYXRvckZuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICBpZiAoIWZpbHRlci5maWx0ZXIuY29tcGFyYXRvckZuLmNhbGwobnVsbCwgY2VsbFZhbHVlLCBmaWx0ZXIudmFsdWUsIHJvdykpIHtcclxuICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc051bGxPclVuZGVmaW5lZChjb21wYXJhdG9yKSB8fCBjb21wYXJhdG9yID09PSAnZXF1YWxzJykge1xyXG4gICAgICAgICAgaWYgKGZpbHRlci52YWx1ZSAhPT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGZpbHRlci52YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgIGNvbnN0IGNlbGxWYWx1ZUxDOiBzdHJpbmcgPSBgJHtjZWxsVmFsdWV9YC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgY29uc3QgZmlsdGVyVmFsdWVMQzogc3RyaW5nID0gZmlsdGVyLnZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY29tcGFyYXRvcikgfHwgY29tcGFyYXRvciA9PT0gJ2VxdWFsc0lnbm9yZUNhc2UnKSB7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJWYWx1ZUxDICE9PSBjZWxsVmFsdWVMQykge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ2NvbnRhaW5zJykge1xyXG4gICAgICAgICAgICBpZiAoY2VsbFZhbHVlLmluZGV4T2YoZmlsdGVyLnZhbHVlKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdjb250YWluc0lnbm9yZUNhc2UnKSB7XHJcbiAgICAgICAgICAgIGlmIChjZWxsVmFsdWVMQy5pbmRleE9mKGZpbHRlclZhbHVlTEMpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ3N0YXJ0c1dpdGgnKSB7XHJcbiAgICAgICAgICAgIGlmICghY2VsbFZhbHVlLnN0YXJ0c1dpdGgoZmlsdGVyLnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ3N0YXJ0c1dpdGhJZ25vcmVDYXNlJykge1xyXG4gICAgICAgICAgICBpZiAoIWNlbGxWYWx1ZUxDLnN0YXJ0c1dpdGgoZmlsdGVyVmFsdWVMQykpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5T3ZlcmFsbEZpbHRlcihkYXRhOiBNYXRTZWxlY3RUYWJsZVJvd1tdKTogdm9pZCB7XHJcbiAgICB0aGlzLmZpbHRlcmVkT3V0Um93cyA9IHt9O1xyXG4gICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGZpbHRlclZhbHVlTEM6IHN0cmluZyA9IHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWUudG9Mb3dlckNhc2UoKTtcclxuICAgIGlmIChmaWx0ZXJWYWx1ZUxDLnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgaSA9IGRhdGEubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgY29uc3Qgcm93OiBNYXRTZWxlY3RUYWJsZVJvdyA9IGRhdGFbaV07XHJcbiAgICAgIGxldCByb3dTaG91bGRCZUZpbHRlcmVkID0gdHJ1ZTtcclxuICAgICAgZm9yIChsZXQgaiA9IHRoaXMuZGF0YVNvdXJjZS5jb2x1bW5zLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XHJcbiAgICAgICAgY29uc3Qga2V5OiBzdHJpbmcgPSB0aGlzLmRhdGFTb3VyY2UuY29sdW1uc1tqXS5rZXk7XHJcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlOiBhbnkgPSByb3dba2V5XTtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZUxDOiBzdHJpbmcgPSBgJHtjZWxsVmFsdWV9YC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmIChjZWxsVmFsdWVMQy5pbmRleE9mKGZpbHRlclZhbHVlTEMpICE9PSAtMSkge1xyXG4gICAgICAgICAgcm93U2hvdWxkQmVGaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChyb3dTaG91bGRCZUZpbHRlcmVkKSB7XHJcbiAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBseVByb3h5VG9BcnJheShhcnJheTogYW55W10sIGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICBbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAndW5zaGlmdCcsICdzcGxpY2UnLCAnc29ydCddLmZvckVhY2goKG1ldGhvZE5hbWUpID0+IHtcclxuICAgICAgYXJyYXlbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY29uc3QgcmVzID0gQXJyYXkucHJvdG90eXBlW21ldGhvZE5hbWVdLmFwcGx5KGFycmF5LCBhcmd1bWVudHMpOyAvLyBjYWxsIG5vcm1hbCBiZWhhdmlvdXJcclxuICAgICAgICBjYWxsYmFjay5hcHBseShhcnJheSwgYXJndW1lbnRzKTsgLy8gZmluYWxseSBjYWxsIHRoZSBjYWxsYmFjayBzdXBwbGllZFxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzZXRGaWx0ZXJzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC5zZXRWYWx1ZSgnJyk7XHJcbiAgICBPYmplY3Qua2V5cyh0aGlzLmZpbHRlckNvbnRyb2xzLmNvbnRyb2xzKVxyXG4gICAgICAuZm9yRWFjaChrZXkgPT4gdGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KS5zZXRWYWx1ZSgnJykpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGFrZW4gZnJvbSB7QHNlZSBNYXRUYWJsZURhdGFTb3VyY2Ujc29ydGluZ0RhdGFBY2Nlc3Nvcn1cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhXHJcbiAgICogQHBhcmFtIHNvcnRIZWFkZXJJZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgc29ydGluZ0RhdGFBY2Nlc3NvcihkYXRhOiBNYXRTZWxlY3RUYWJsZVJvdywgYWN0aXZlOiBzdHJpbmcpOiBzdHJpbmcgfCBudW1iZXIgfCBEYXRlIHtcclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IChkYXRhIGFzIHsgW2tleTogc3RyaW5nXTogYW55IH0pW2FjdGl2ZV07XHJcblxyXG4gICAgaWYgKF9pc051bWJlclZhbHVlKHZhbHVlKSkge1xyXG4gICAgICBjb25zdCBudW1iZXJWYWx1ZSA9IE51bWJlcih2YWx1ZSk7XHJcblxyXG4gICAgICAvLyBOdW1iZXJzIGJleW9uZCBgTUFYX1NBRkVfSU5URUdFUmAgY2FuJ3QgYmUgY29tcGFyZWQgcmVsaWFibHkgc28gd2VcclxuICAgICAgLy8gbGVhdmUgdGhlbSBhcyBzdHJpbmdzLiBGb3IgbW9yZSBpbmZvOiBodHRwczovL2dvby5nbC95NXZiU2dcclxuICAgICAgcmV0dXJuIG51bWJlclZhbHVlIDwgTUFYX1NBRkVfSU5URUdFUiA/IG51bWJlclZhbHVlIDogdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuXHJcblxyXG4gIHByaXZhdGUgc29ydERhdGEoZGF0YTogTWF0U2VsZWN0VGFibGVSb3dbXSwgYWN0aXZlOiBzdHJpbmcsIGRpcmVjdGlvbjogU29ydERpcmVjdGlvbik6IE1hdFNlbGVjdFRhYmxlUm93W10ge1xyXG4gICAgaWYgKCFhY3RpdmUgfHwgZGlyZWN0aW9uID09PSAnJykge1xyXG4gICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGF0YS5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgIGxldCBhVmFsdWUgPSB0aGlzLnNvcnRpbmdEYXRhQWNjZXNzb3IoYSwgYWN0aXZlKTtcclxuICAgICAgbGV0IGJWYWx1ZSA9IHRoaXMuc29ydGluZ0RhdGFBY2Nlc3NvcihiLCBhY3RpdmUpO1xyXG5cclxuICAgICAgaWYgKGEuaWQgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgIH0gZWxzZSBpZiAoYi5pZCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBCb3RoIG51bGwvdW5kZWZpbmVkL2VxdWFsIHZhbHVlIGNoZWNrXHJcbiAgICAgIGlmIChhVmFsdWUgPT09IGJWYWx1ZSkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBPbmUgbnVsbCB2YWx1ZSBjaGVja1xyXG4gICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoYVZhbHVlKSAmJiAhaXNOdWxsT3JVbmRlZmluZWQoYlZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgICAgfSBlbHNlIGlmICghaXNOdWxsT3JVbmRlZmluZWQoYVZhbHVlKSAmJiBpc051bGxPclVuZGVmaW5lZChiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhVmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XHJcbiAgICAgICAgYVZhbHVlID0gYVZhbHVlLmdldFRpbWUoKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoYlZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgIGJWYWx1ZSA9IGJWYWx1ZS5nZXRUaW1lKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFVzZXIgbG9jYWxlQ29tcGFyZSBmb3Igc3RyaW5nc1xyXG4gICAgICBpZiAoaXNTdHJpbmcoYVZhbHVlKSAmJiBpc1N0cmluZyhiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuICg8c3RyaW5nPmFWYWx1ZSkubG9jYWxlQ29tcGFyZSg8c3RyaW5nPmJWYWx1ZSkgKiAodGhpcy5zb3J0LmRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUcnkgdG8gY29udmVydCB0byBhIE51bWJlciB0eXBlXHJcbiAgICAgIGFWYWx1ZSA9IGlzTmFOKDxudW1iZXI+YVZhbHVlKSA/IGAke2FWYWx1ZX1gIDogK2FWYWx1ZTtcclxuICAgICAgYlZhbHVlID0gaXNOYU4oPG51bWJlcj5iVmFsdWUpID8gYCR7YlZhbHVlfWAgOiArYlZhbHVlO1xyXG5cclxuICAgICAgLy8gaWYgb25lIGlzIG51bWJlciBhbmQgb3RoZXIgaXMgU3RyaW5nXHJcbiAgICAgIGlmIChpc1N0cmluZyhhVmFsdWUpICYmIGlzTnVtYmVyKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gKDEpICogKHRoaXMuc29ydC5kaXJlY3Rpb24gPT09ICdhc2MnID8gMSA6IC0xKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNOdW1iZXIoYVZhbHVlKSAmJiBpc1N0cmluZyhiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuICgtMSkgKiAodGhpcy5zb3J0LmRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDb21wYXJlIGFzIE51bWJlcnMgb3RoZXJ3aXNlXHJcbiAgICAgIHJldHVybiAoYVZhbHVlID4gYlZhbHVlID8gMSA6IC0xKSAqICh0aGlzLnNvcnQuZGlyZWN0aW9uID09PSAnYXNjJyA/IDEgOiAtMSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGFkZE51bGxSb3coKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIXRoaXMubXVsdGlwbGUgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubGFiZWxGb3JOdWxsVmFsdWUpO1xyXG4gIH1cclxufVxyXG4iXX0=