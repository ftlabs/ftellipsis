# FTEllipsis [![Build Status](https://travis-ci.org/ftlabs/ftellipsis.png?branch=master)](https://travis-ci.org/ftlabs/ftellipsis)

Solves the problem of applying ellipsis (&hellip;) on a multi-line block of text at the point it overflows its container. Ellipsis will work in conjuction with CSS [column-count](https://developer.mozilla.org/en-US/docs/CSS/column-count) if you wish.

Results are best in webkit browsers due to the availability of [webkit-line-clamp](http://dropshado.ws/post/1015351370/webkit-line-clamp). For non-webkit browsers FTEllipsis falls back to clamping text and positioning an element over the end of the overflowing line, allowing the developer to style this however they wish.

## Getting Started

##### NPM

```
$ npm install ftellipsis
```

##### Bower

```
$ bower install ftellipsis
```

or download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/ftlabs/ftellipsis/master/build/ftellipsis.min.js
[max]: https://raw.github.com/ftlabs/ftellipsis/master/lib/index.js

## Examples

- [Primary](http://ftlabs.github.io/ftellipsis/examples/1/)
- [Single Line](http://ftlabs.github.io/ftellipsis/examples/single-line/)

## Usage

```js
var element = document.getElementById('my-element');
var ellipsis = new Ellipsis(element);

ellipsis.calc();
ellipsis.set();
```

Requirements:

- The element must have a fixed height so that content overflows.
- The element must have child elements (eg. `<p>`s).

### Unsetting

Unsetting an ellipsis instance removes any styling.

```js
ellipsis.unset();
```

### Destroying

Destroying an ellipsis instance resets the instance back to it's original state, unsetting internal variables and state.

```js
ellipsis.destroy();
```

## Tests

```
$ npm install
$ npm test
```

## API

### Ellipsis();

Initialize a new Ellipsis
instance with the given element.

Options:

 - `container` A parent container element
 - `reRender` Forces a redraw after ellipsis applied

### Ellipsis#calc();

Measures the element and
finds the overflowing child.



### Ellipsis#set();

Clamps the overflowing child using
the information acquired from #calc().



### Ellipsis#unset();

Unclamps the overflowing child.



### Ellipsis#destroy();

Clears any references




## Credits and collaboration

The lead developer of FTEllipsis is [Wilson Page](http://github.com/wilsonpage) at FT Labs. All open source code released by FT Labs is licenced under the MIT licence. We welcome comments, feedback and suggestions. Please feel free to raise an issue or pull request. Enjoy...