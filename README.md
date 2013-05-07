# Ellipsis

Multi-line ellipsis made possible

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/wilsonpage/ellipsis/master/dist/ellipsis.min.js
[max]: https://raw.github.com/wilsonpage/ellipsis/master/dist/ellipsis.js

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

#### Unsetting

Unsetting an ellipsis instance removes any styling.

```js
ellipsis.unset();
```

#### Destroying

Destroying an ellipsis instance resets the instance back to it's original state, unsetting and internal variables and state.

```js
ellipsis.unset();
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



