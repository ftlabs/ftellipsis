
;(function(){

  'use strict';

  /**
   * Aliases
   */

  var indexOf = Array.prototype.indexOf;
  var getStyle = window.getComputedStyle;

  /**
   * CSS Classes
   */

  var overflowingChildClass = 'ellipsis-overflowing-child';
  var containerClass = 'ellipsis-set';

  /**
   * Vendor Info
   */

  var vendor = getVendorData();

  /**
   * Initialize a new Ellipsis
   * instance with the given element.
   *
   * Options:
   *
   *  - `container` A parent container element
   *  - `reRender` Forces a redraw after ellipsis applied
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
    this.lineHeight = getLineHeight(this.el, style);
    this.deltaHeight = size[1] % this.lineHeight;
    this.linesPerColumn = Math.floor(this.columnHeight / this.lineHeight);
    this.totalLines = this.linesPerColumn * this.columnCount;

    // COMPLEX:
    // We set the height on the container
    // explicitly to work around problem
    // with columned containers not fitting
    // all lines when the height is exactly
    // divisible by the line height.
    if (!this.deltaHeight && this.columnCount > 1) {
      this.el.style.height = this.columnHeight + 'px';
    }

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

    this.el.style.height = '';
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

    // It's super important that we clear references
    // to any DOM nodes here so that we don't end up
    // with any 'detached nodes' lingering in memory
    this.el = this.child = this.container = null;

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
      var startColumnIndex = Math.floor(lineCounter / self.linesPerColumn) || 0;

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
        child.gutterSpan = child.visibleColumnSpan - 1;
        child.applyTopMargin = self.shouldApplyTopMargin(child);

        // COMPLEX:
        // In order to get the overflowing
        // child height correct we have to
        // add the delta for each gutter the
        // overflowing child crosses. This is
        // just how webkit columns work.
        if (vendor.webkit && child.clampedLines > 1) {
          child.clampedHeight += child.gutterSpan * self.deltaHeight;
        }

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

    // Clamp the height
    child.el.style.height = child.clampedHeight + 'px';

    // Use webkit line clamp
    // for webkit browsers.
    if (vendor.webkit) {
      child.el.style.webkitLineClamp = child.clampedLines;
      child.el.style.display = '-webkit-box';
      child.el.style.webkitBoxOrient = 'vertical';
    }

    if (this.shouldHideOverflow()) child.el.style.overflow = 'hidden';

    // Apply a top margin to fix webkit
    // column-count mixed with flexbox bug,
    // if we have decided it is neccessary.
    if (child.applyTopMargin) child.el.style.marginTop = '2em';

    // Add the overflowing
    // child class as a style hook
    child.el.classList.add(overflowingChildClass);

    // Non webkit browsers get a helper
    // element that is styled as an alternative
    // to the webkit-line-clamp ellipsis.
    // Must be position relative so that we can
    // position the helper element.
    if (!vendor.webkit) {
      child.el.style.position = 'relative';
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
    el.style.width = '5em';
    el.style.position = 'absolute';
    el.style.bottom = 0;
    el.style.right = 0;

    // HACK: This is a work around to deal with
    // the wierdness of positioning elements
    // inside an element that is broken across
    // more than one column.
    if (vendor.moz && columns) {
      rightOffset = -(columns * 100);
      marginRight = -(columns * this.columnGap);
      el.style.right = rightOffset + '%';
      el.style.marginRight = marginRight + 'px';
      el.style.marginBottom = this.deltaHeight + 'px';
    }

    return el;
  };

  /**
   * Determines whether overflow
   * should be hidden on clamped
   * child.
   *
   * NOTE:
   * Overflow hidden is only required
   * for single column containers as
   * multi-column containers overflow
   * to the right, so are not visible.
   * `overflow: hidden;` also messes
   * with column layout in Firefox.
   *
   * @return {Boolean}
   * @api private
   */
  Ellipsis.prototype.shouldHideOverflow = function() {
    var hasColumns = this.columnCount > 1;

    // If there is not enough room to show
    // even one line; hide all overflow.
    if (this.columnHeight < this.lineHeight) return true;

    // Hide all single column overflow
    return !hasColumns;
  };

  /**
   * Re-render with no setTimeout, boom!
   *
   * NOTE:
   * We have to assign the return value
   * to something global so that Closure
   * Compiler doesn't strip it out.
   *
   * @param  {Element} el
   * @api private
   */
  function reRender(el) {
    el.style.display = 'none';
    Ellipsis.r = el.offsetTop;
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
   * @api private
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
   * @api private
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
   * @api private
   */

  function lineCount(height, lineHeight) {
    return Math.floor(height / lineHeight);
  }

  /**
   * Returns infomation about
   * the current vendor.
   *
   * @return {Object}
   * @api private
   */

   function getVendorData() {
     var el = document.createElement('test');
     var result = {};
     var vendors = {
       'Webkit': ['WebkitColumnCount', 'WebkitColumnGap'],
       'Moz': ['MozColumnCount', 'MozColumnGap'],
       'ms': ['msColumnCount', 'msColumnGap'],
       '': ['columnCount', 'columnGap']
     };

     for (var vendor in vendors) {
       if (vendors[vendor][0] in el.style) {
         result.columnCount = vendors[vendor][0];
         result.columnGap = vendors[vendor][1];
         result[vendor.toLowerCase()] = true;
       }
     }

     return result;
   }

   /**
    * Gets the column count of an
    * element using the vendor prefix.
    *
    * @param  {CSSStyleDeclaration} style  [description]
    * @return {Number}
    * @api private
    */

   function getColumnCount(style) {
     return parseInt(style[vendor.columnCount], 10) || 1;
   }

   /**
    * Returns the gap between columns
    *
    * @param  {CSSStyleDeclaration} style
    * @return {Number}
    * @api private
    */

   function getColumnGap(style) {
     return parseInt(style[vendor.columnGap], 10) || 0;
   }

  /**
   * Gets the line height
   * from the style declaration.
   *
   * @param  {CSSStyleDeclaration} style
   * @return {Number|null}
   * @api private
   */

  function getLineHeight(el, style) {
    var lineHeightStr = style.lineHeight;

    if (lineHeightStr) {
      if (lineHeightStr.indexOf('px') < 0) {
        throw Error('The ellipsis container ' + elementName(el) + ' must have line-height set using px unit, found: ' + lineHeightStr);
      }

      var lineHeight = parseInt(lineHeightStr, 10);
      if (lineHeight) {
        return lineHeight;
      }
    }
    throw Error('The ellipsis container ' + elementName(el) + ' must have line-height set on it, found: ' + lineHeightStr);
  }

  /**
   * Returns the width and
   * height of the given element.
   *
   * @param  {Element} el
   * @return {Array}
   * @api private
   */

  function getSize(el) {
    return [el.offsetWidth, el.offsetHeight];
  }

  /**
   * Little iterator
   *
   * @param  {Array}   list
   * @param  {Function} fn
   * @api private
   */

  function each(list, fn) {
    for (var i = 0, l = list.length; i < l; i++) if (fn(list[i])) break;
  }

  function elementName(el) {
    var name = el.tagName;
    if (el.id) name += '#' + el.id;
    if (el.className) name += (' ' + el.className).replace(/\s+/g,'.');
    return name;
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
    define(function() { return Ellipsis; });
  } else {
    window.Ellipsis = Ellipsis;
  }

})();
