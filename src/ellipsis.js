/*
 * ellipsis
 * https://github.com/wilsonpage/ellipsis
 *
 * Copyright (c) 2012 Wilson Page
 * Licensed under the MIT license.
 */

/*global console*/
(function(root) {
    'use strict';

    /**
     * Returns the vendor prifix on runtime.
     *
     * @return {String}
     */

    var vendor = (function() {
        var el = document.createElement( "div" );
        var js = ["Webkit", "Moz", "O", "ms"];
        var css = ["-webkit-", "-moz-", "-o-", "-ms-"];
        for (var i = 0; i < js.length; i++ ) {
            if (js[i] + "ColumnCount" in el.style) return css[i];
        }

        return "columnCount" in el.style ? "" : false;
    })();

    /**
     * Gets the column count of an element using the vendor prefix.
     *
     * @param  {CSSStyleDeclaration} style  [description]
     * @param  {String} vendor
     * @return {Number}
     */

    function getColumnCount(style, vendor) {
        return parseInt(style.getPropertyValue(vendor + 'column-count'), 10) || 1;
    }

    /**
     * Gets the line height from the style declaration.
     *
     * @param  {CSSStyleDeclaration} style
     * @return {Number|null}
     */

    function getLineHeight(style) {
        var lineHeight = parseInt(style.getPropertyValue('line-height'), 10);
        if (!lineHeight) return console.error('The ellipsis container must have line-height set on it');
        return lineHeight;
    }

    /**
     * Returns the computed style of the given element.
     *
     * @param  {Element} el
     * @return {CSSStyleDeclaration}
     */
    function getStyle(el) {
        return window.getComputedStyle(el);
    }

    /**
     * Returns the width and height of the given element.
     *
     * @param  {Element} el
     * @return {Array}
     */

    function getSize(el) {
        return [el.offsetWidth, el.offsetHeight];
    }

    /**
     * Determines whether top margin should be applied to the
     * overflowing child.
     *
     * This is to counteract an annoying column-count/-webkit-box bug,
     * whereby the flexbox element falls into the delta are under the
     * previous sibling. Top margin keeps it in the correct column.
     *
     * @param  {Element} el
     * @param  {Ellipsis} instance
     * @return {Boolean}
     */

    function shouldApplyTopMargin(el, instance) {
        return el.offsetTop < 4 && instance.deltaHeight > instance.lineHeight / 2;
    }

    /**
     * Returns the overflowing child with some extra data
     * required for clamping.
     *
     * @param  {Ellipsis} instance
     * @return {Object}
     */

    function getOverflowingChild(instance) {
        var i, l, childHeight, overflowingHeight, underflowingHeight, endColumnIndex, endColumnSpan, columnDeltaHeight;
        var child = {};
        var children = instance.el.children;
        var heightCounter = 0;
        var startColumnIndex = 0;

        // Loop over each of the parent's children
        for (i = 0, l = children.length; i < l; i++) {
            heightCounter += childHeight = children[i].offsetHeight;
            endColumnIndex = Math.floor(heightCounter / (instance.columnHeight));

            if (heightCounter >= instance.totalHeight) {
                child.el = children[i];
                break;
            }

            startColumnIndex = endColumnIndex;
        }

        // Don't continue if there is no overflowing child.
        if (!child.el) return;

        // Determine how many columns the overflow child will span once trucated.
        endColumnSpan = instance.columnCount - startColumnIndex;

        // Get the amount of height overflowing and the amount of
        // height underflowing the end of the container.
        overflowingHeight = heightCounter - instance.totalHeight;
        underflowingHeight = childHeight - overflowingHeight;

        child.cappedLines = Math.floor((underflowingHeight - ((endColumnSpan) * instance.deltaHeight)) / instance.lineHeight);
        child.cappedHeight = (child.cappedLines * instance.lineHeight) + ((endColumnSpan - 1) * instance.deltaHeight);
        child.applyTopMargin = shouldApplyTopMargin(child.el, instance);

        return child;
    }

    /**
     * Clamps the child element to the set height and lines.
     *
     * @param  {Object} child
     * @return void
     */

    function clampOverflowingChild(child) {
        if (!child || !child.el) return;
        child.el.style['height'] = child.cappedHeight + 'px';
        child.el.style['webkitLineClamp'] = child.cappedLines;
        child.el.style['display'] = '-webkit-box';
        child.el.style['webkitBoxOrient'] = 'vertical';

        if (child.applyTopMargin) {
            child.el.style['marginTop'] = '1em';
        }

        child.el.classList.add('overflowing-child');
    }

    /**
     * Removes all clamping styles from the overflowing child.
     *
     * @param  {Object} child
     * @return void
     */

    function unclampOverflowingChild(child) {
        if (!child || !child.el) return;
        child.el.style['height'] = '';
        child.el.style['webkitLineClamp'] = '';
        child.el.style['display'] = '';
        child.el.style['webkitBoxOrient'] = '';
        child.el.classList.remove('overflowing-child');
    }

    // Expose Ellipsis
    root.Ellipsis = Ellipsis;

    /**
     * The public constructor.
     *
     * @constructor
     * @param {Element} el
     */

    function Ellipsis(el) {
        if (!el) return;
        this.el = el;
    }

    /**
     * Measures the element and find the overflowing child.
     *
     * @return {Ellipsis}
     */

    Ellipsis.prototype.calc = function() {
        if (Ellipsis.profile) console.profile('ellipsis.calc');
        var style = getStyle(this.el);
        var size = getSize(this.el);

        this.columnHeight = size[1];
        this.columnCount = getColumnCount(style, vendor);
        this.lineHeight = getLineHeight(style);
        this.deltaHeight = size[1] % this.lineHeight;
        this.totalHeight = size[1] * this.columnCount;

        this.overflowingChild = getOverflowingChild(this);
        if (Ellipsis.profile) console.profileEnd('ellipsis.calc');
        return this;
    };

    /**
     * Clamps the overflowing child using the information
     * acquired from Ellipsis#calc().
     *
     * @return {Ellipsis}
     */

    Ellipsis.prototype.set = function() {
        if (Ellipsis.profile) console.profile('ellipsis.set');
        clampOverflowingChild(this.overflowingChild);
        if (Ellipsis.profile) console.profileEnd('ellipsis.set');
        return this;
    };

    /**
     * Unclamps the overflowing child.
     *
     * @return {Ellipsis}
     */

    Ellipsis.prototype.unset = function() {
        if (Ellipsis.profile) console.profile('ellipsis.unset');
        unclampOverflowingChild(this.overflowingChild);
        this.overflowingChild = null;
        if (Ellipsis.profile) console.profileEnd('ellipsis.unset');
        return this;
    };

    /**
     * Destroys any node references.
     *
     * @return {Ellipsis}
     */

    Ellipsis.prototype.destroy = function() {
        this.el = this.overflowingChild = null;
        return this;
    };
}(this));