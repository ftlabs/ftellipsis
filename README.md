# Ellipsis

Solves the problem of applying ellipsis (...) on a multi-line block of text at the point it overflows its container. Ellipsis will work in conjuction with CSS [column-count](https://developer.mozilla.org/en-US/docs/CSS/column-count) if you wish.

Results are best in webkit browsers due to the availability of
[webkit-line-clamp](http://dropshado.ws/post/1015351370/webkit-line-clamp). For non-webkit browsers Ellipsis falls back to clamping text and positioning an element over the end of the overflowing line, allowing the developer to style this however they wish.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/wilsonpage/ellipsis/master/build/ellipsis.min.js
[max]: https://raw.github.com/wilsonpage/ellipsis/master/build/ellipsis.js

## Usage
_(Coming soon)_

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





## Release History
_(Nothing yet)_
