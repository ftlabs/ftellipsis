/*jshint node:true*/

'use strict';

(function() {

  // Alias some methods
  var indexOf = Array.prototype.indexOf;
  var getStyle = window.getComputedStyle;

  // Classes
  var overflowingChildClass = 'ellipsis-overflowing-child';
  var containerClass = 'ellipsis-set';

  // Error messages
  var errors = [
    'The ellipsis container must have line-height set on it'
  ];

  // Data about current vendor
  var vendor = getVendorData();

  /**
   * Initialize a new Ellipsis
   * instance with the given element.
   *
   * Options:
   *   - `container` A parent container element
   *   - `reRender` Forces a redraw after ellipsis applied
   *
   * @constructor
   * @param {Element} el
   * @param {Object} options
   * @api public
   */

  function Ellipsis(el, options) {
    if (!el) return;
    this.el = el;
    this.container = options && options.container;
    this.reRender = options && options.reRender;
  }

  /**
   * Measures the element and
   * finds the overflowing child.
   *
   * @return {Ellipsis}
   * @api public
   */

  Ellipsis.prototype.calc = function() {
    if (!this.el) return this;
    var style = getStyle(this.el);
    var size = getSize(this.el);

    this.columnHeight = size[1];
    this.columnCount = getColumnCount(style);
    this.columnGap = getColumnGap(style);
    this.columnWidth = size[0] / this.columnCount;
    this.lineHeight = getLineHeight(style);
    this.deltaHeight = size[1] % this.lineHeight;
    this.linesPerColumn = Math.floor(this.columnHeight / this.lineHeight);
    this.totalLines = this.linesPerColumn * this.columnCount;

    this.child = this.getOverflowingChild();

    return this;
  };

  /**
   * Clamps the overflowing child using
   * the information acquired from #calc().
   *
   * @return {Ellipsis}
   * @api public
   */

  Ellipsis.prototype.set = function() {
    if (!this.el || !this.child) return this;

    this.clampChild();
    siblingsAfter(this.child.el, { display: 'none' });
    this.markContainer();

    return this;
  };

  /**
   * Unclamps the overflowing child.
   *
   * @return {Ellipsis}
   * @api public
   */

  Ellipsis.prototype.unset = function() {
    if (!this.el || !this.child) return this;

    this.unclampChild(this.child);
    siblingsAfter(this.child.el, { display: '' });
    this.unmarkContainer();
    this.child = null;

    return this;
  };

  /**
   * Clears any references
   *
   * @return {Ellipsis}
   * @api public
   */

  Ellipsis.prototype.destroy = function() {
    this.el = this.child = null;
    return this;
  };

  /**
   * Returns the overflowing child with some
   * extra data required for clamping.
   *
   * @param  {Ellipsis} instance
   * @return {Object}
   * @api private
   */

  Ellipsis.prototype.getOverflowingChild = function() {
    var self = this;
    var child = {};
    var lineCounter = 0;

    // Loop over each child element
    each(this.el.children, function(el) {
      var lineCount, overflow, underflow;
      var startColumnIndex = Math.floor(lineCounter / self.linesPerColumn);

      // Get the line count of the
      // child and increment the counter
      lineCounter += lineCount = self.getLineCount(el);

      // If this is the overflowing child
      if (lineCounter >= self.totalLines) {
        overflow = lineCounter - self.totalLines;
        underflow = lineCount - overflow;

        child.el = el;
        child.clampedLines = underflow;
        child.clampedHeight = child.clampedLines * self.lineHeight;
        child.visibleColumnSpan = self.columnCount - startColumnIndex;
        child.applyTopMargin = self.shouldApplyTopMargin(child);

        return child;
      }
    });

    return child;
  };

  /**
   * Returns the number
   * of lines an element has.
   *
   * If the element is larger than
   * the column width we make the
   * assumption that this is FireFox
   * and the element is broken across
   * a column boundary. In this case
   * we have to get the height using
   * `getClientRects()`.
   *
   * @param  {Element} el
   * @return {Number}
   * @api private
   */

  Ellipsis.prototype.getLineCount = function(el) {
    return (el.offsetWidth > this.columnWidth)
      ? getLinesFromRects(el, this.lineHeight)
      : lineCount(el.clientHeight, this.lineHeight);
  };

  /**
   * If a container has been
   * declared we mark it with
   * a class for styling purposes.
   *
   * @api private
   */

  Ellipsis.prototype.markContainer = function() {
    if (!this.container) return;
    this.container.classList.add(containerClass);
    if (this.reRender) reRender(this.container);
  };

  /**
   * Removes the class
   * from the container.
   *
   * @api private
   */

  Ellipsis.prototype.unmarkContainer = function() {
    if (!this.container) return;
    this.container.classList.remove(containerClass);
    if (this.reRender) reRender(this.container);
  };

  /**
   * Determines whether top margin should be
   * applied to the overflowing child.
   *
   * This is to counteract an annoying
   * column-count/-webkit-box bug, whereby the
   * flexbox element falls into the delta are under
   * the previous sibling. Top margin keeps it
   * in the correct column.
   *
   * @param  {Element} el
   * @param  {Ellipsis} instance
   * @return {Boolean}
   * @api private
   */

  Ellipsis.prototype.shouldApplyTopMargin = function(child) {
    var el = child.el;

    // Dont't if it's not webkit
    if (!vendor.webkit) return;

    // Don't if it's a single column layout
    if (this.columnCount === 1) return;

    // Don't if the delta height is minimal
    if (this.deltaHeight <= 3) return;

    // Don't if it's the first child
    if (!el.previousElementSibling) return;

    // FINAL TEST: If the element is at the top or bottom of its
    // parent container then we require top margin.
    return (el.offsetTop === 0 || el.offsetTop === this.columnHeight);
  };

  /**
   * Clamps the child element to the set
   * height and lines.
   *
   * @param  {Object} child
   * @api private
   */

  Ellipsis.prototype.clampChild = function() {
    var child = this.child;
    if (!child || !child.el) return;

    child.el.style.height = child.clampedHeight + 'px';

    // Use webkit line clamp
    // for webkit browsers.
    if (vendor.webkit) {
      child.el.style.webkitLineClamp = child.clampedLines;
      child.el.style.display = '-webkit-box';
      child.el.style.webkitBoxOrient = 'vertical';
    }

    // Overflow hidden is only required
    // for single column containers as
    // multi-column containers overflow
    // to the right, so are not visible.
    // `overflow: hidden;` also messes
    // with column layout in Firefox.
    if (this.columnCount === 1) child.el.style.overflow = 'hidden';

    // Apply a top margin to fix webkit
    // column-count mixed with flexbox bug,
    // if we have decided it is neccessary.
    if (child.applyTopMargin) child.el.style.marginTop = '2em';

    // Add the overflowing child class as
    // a style hook
    child.el.classList.add(overflowingChildClass);

    // Non webkit borwsers get a helper
    // elment that is styled as an alternative
    // to the webkit-line-clamp ellipsis.
    if (!vendor.webkit) {
      child.helper = child.el.appendChild(this.helperElement());
    }
  };

  /**
   * Removes all clamping styles from
   * the overflowing child.
   *
   * @param  {Object} child
   * @api private
   */

  Ellipsis.prototype.unclampChild = function(child) {
    if (!child || !child.el) return;
    child.el.style.display = '';
    child.el.style.height = '';
    child.el.style.webkitLineClamp = '';
    child.el.style.webkitBoxOrient = '';
    child.el.style.marginTop = '';
    child.el.style.overflow = '';
    child.el.classList.remove(overflowingChildClass);

    if (child.helper) {
      child.helper.parentNode.removeChild(child.helper);
    }
  };

  /**
   * Creates the helper element
   * for non-webkit browsers.
   *
   * @return {Element}
   * @api private
   */

  Ellipsis.prototype.helperElement = function() {
    var el = document.createElement('span');
    var columns = this.child.visibleColumnSpan - 1;
    var rightOffset, marginRight;

    el.className = 'ellipsis-helper';
    el.style.display = 'block';
    el.style.height = this.lineHeight + 'px';
    el.style.position = 'absolute';
    el.style.bottom = 0;
    el.style.right = 0;

    // HACK: This is a work around to deal with
    // the wierdness of positioning elements
    // inside an element that is broken across
    // more than one column.
    if (vendor.js === 'Moz' && columns) {
      rightOffset = columns * 100;
      marginRight = -(columns * this.columnGap);
      el.style.right = '-' + rightOffset + '%';
      el.style.marginRight = marginRight + 'px';
      el.style.marginBottom = this.deltaHeight + 'px';
    }

    return el;
  };

  /**
   * Re-render with no setTimeout, boom!
   *
   * @param  {Element} el
   * @return void
   */
  function reRender(el) {
    el.style.display = 'none';
    var r = el.offsetTop;
    el.style.display = '';
  }

  /**
   * Sets the display property on
   * all siblingsafter the given element.
   *
   * Options:
   *   - `display` the css display type to use
   *
   * @param  {Node} el
   * @param  {Options} options
   * @return void
   */

  function siblingsAfter(el, options) {
    if (!el) return;
    var display = options && options.display;
    var siblings = el.parentNode.children;
    var index = indexOf.call(siblings, el);

    for (var i = index + 1, l = siblings.length; i < l; i++) {
      siblings[i].style.display = display;
    }
  }

  /**
   * Returns total line
   * count from a rect list.
   *
   * @param  {Element} el
   * @param  {Number} lineHeight
   * @return {Number}
   */

  function getLinesFromRects(el, lineHeight) {
    var rects = el.getClientRects();
    var lines = 0;

    each(rects, function(rect) {
      lines += lineCount(rect.height, lineHeight);
    });

    return lines;
  }

  /**
   * Calculates a line count
   * from the passed height.
   *
   * @param  {Number} height
   * @param  {Number} lineHeight
   * @return {Number}
   */

  function lineCount(height, lineHeight) {
    return Math.floor(height / lineHeight);
  }

  /**
   * Returns infomation about
   * the current vendor.
   *
   * @return {Object}
   */

  function getVendorData() {
    var el = document.createElement( "div" );
    var js = ["Webkit", "Moz", "O", "ms"];
    var css = ["-webkit-", "-moz-", "-o-", "-ms-"];
    for (var i = 0; i < js.length; i++ ) {
      if (js[i] + "ColumnCount" in el.style) {
        return {
          css: css[i],
          js: js[i],
          webkit: js[i] === 'Webkit',
          moz: js[i] === 'Moz'
        };
      }
    }
  }

  /**
   * Gets the column count of an element
   * using the vendor prefix.
   *
   * @param  {CSSStyleDeclaration} style  [description]
   * @return {Number}
   */

  function getColumnCount(style) {
    return parseInt(style[vendor.js + 'ColumnCount'], 10) || 1;
  }

  /**
   * Returns the gap between columns
   *
   * @param  {CSSStyleDeclaration} style
   * @return {Number}
   */

  function getColumnGap(style) {
    return parseInt(style[vendor.js + 'ColumnGap'], 10);
  }

  /**
   * Gets the line height from the style declaration.
   *
   * @param  {CSSStyleDeclaration} style
   * @return {Number|null}
   */

  function getLineHeight(style) {
    var lineHeight = parseInt(style.lineHeight, 10);
    if (!lineHeight) throw new Error(errors[0]);

    return lineHeight;
  }

  /**
   * Returns the width and height of the
   * given element.
   *
   * @param  {Element} el
   * @return {Array}
   */

  function getSize(el) {
    return [el.offsetWidth, el.offsetHeight];
  }

  /**
   * Little iterator
   *
   * @param  {Array}   list
   * @param  {Function} fn
   */

  function each(list, fn) {
    for (var i = 0, l = list.length; i < l; i++) if (fn(list[i])) break;
  }

  /**
   * Expose `Ellipsis`
   */

  if (typeof exports === 'object') {
    module.exports = function(el, options) {
      return new Ellipsis(el, options);
    };

    module.exports.Ellipsis = Ellipsis;
  } else if (typeof define === 'function' && define.amd) {
    define(Ellipsis);
  } else {
    window.Ellipsis = Ellipsis;
  }

}());