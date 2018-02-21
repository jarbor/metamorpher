# svg-path-transform
Utilities for working with and transforming SVG Paths in the DOM.

## TL;DR
Modify an SVG Path in three steps:
1. Create a path object with [`Path.make(element)`](#pathmakeinput).
2. Modify the path object with the chainable [`scale`](#pathscalefactor-origin), [`rotate`](#pathrotatedegrees-origin), [`translate`](#pathtranslatex-y) and [`transform`](#pathtransformpath) methods.
3. Update the rendered path with the [`paint`](#pathpaint) method.

Achieve complex path animation with a simple loop and the [`transform`](#pathtransformpath) and [`interpolate`](#pathinterpolatestartpath-endpath-progress) methods. Suggested to use a minimal easing / animation package to add easings to your loops. Recommend to use [VelocityJS](https://github.com/julianshapiro/velocity) since you may want to combine this with CSS animations.

## Installation
```
yarn add svg-path-transform
```

## Include
SVG Path Transform supports AMD, CommonJS, ES6 import methods in addition to global script include. Since, SVG Path Transform has multiple exported classes and no default export, you have the option to selectively import classes from SVG Path Transform based on your needs. Most consumers of this package will only require the `Path` class and possibly the `Point` class. 

### ES6
```js
import {Path, Point, Edge} from 'svg-path-transform';
```

### CommonJS
```js
var Path = require('svg-path-transform').Path;
var Point = require('svg-path-transform').Point;
var Edge = require('svg-path-transform').Edge;
```

### Global Script Include
```html
<script src="svg-path-transform.js" />
<script>
  var Path = svgPathTransform.Path;
  var Point = svgPathTransform.Point;
  var Edge = svgPathTransform.Edge;
</script>
```

## Path Usage
`Path`, the main class that most consumers of this package will use, represents an SVG Path as a collection of [`Point`](#point-usage)s. As such, `Path` extends from the native JavaScript [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) and consequently all standard array functions are supported (length, forEach, etc.)

To start working with a `Path`, use the factory method, [`Path.make()`](#pathmakeinput).

### Path.make(input)
Factory method - takes as `input` one of:
1. A [Path SVGElement](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) (in the DOM),
2. Another `Path` (this class) or,
3. A `String` representing SVG Path data (the `d` parameter of an SVG Path).

If the first option, Path SVGElement, is used then the path will already be attached to the same DOM element that was passed in for the pruposes of the [`paint`](#pathpaint) method. If the other options are used, they can later be attached to a DOM element with the `attach` method or used as a parameter to the [`interpolate`](#pathinterpolatestartpath-endpath-progress) method.

### path.attach(element)
[Chainable] Attach a path to the DOM so it can be painted.

### path.detach()
[Chainable] Detatch a path from the DOM.

### path.paint()
[Chainable] Update the rendered path in the DOM by setting the DOM Path element's `d` parameter. If the path is currently detached from the DOM, then no action will be performed.

### path.scale(factor, origin)
[Chainable] Scale each point in the path by `factor` relative to the `origin` [`Point`](#point-usage).

### path.rotate(degrees, origin)
[Chainable] Rotate each point in the path by `degrees` relative to the `origin` [`Point`](#point-usage).

### path.translate(x, y)
[Chainable] Translate each point in the path by `x` in the x-coordinate and `y` in the y-coordinate.

### path.transform(path)
[Chainable] Transform each point in the path to the same place in the SVG as corresponding point the `path` parameter. Use in conjunction with [`interpolate`](#pathinterpolatestartpath-endpath-progress) to morph one path into another. Unsupported behavior if path lengths don't match.

### path.interpolate(startPath, endPath, progress)
[Chainable] Calculate and set the path to be the interpolated `progress` between `startPath` and `endPath`. Progress should be a decimal between 0 and 1 representing the percentage of interpolation. Critical for animating one path to become another path. Unsupported behavior if path lengths don't match.

### path.longestEdge
Returns the longest [`Edge`](#edge-usage) of the path

## Point Usage
### point.scale(factor, origin)
Scale the point by `factor` relative to the `origin` [`Point`](#point-usage).

### point.rotate(degrees, origin)
Rotate the point by `degrees` relative to the `origin` [`Point`](#point-usage).

### point.translate(x, y)
Translate the point by `x` in the x-coordinate and `y` in the y-coordinate.

### point.transform(point)
Copy the x and y coordinate from the `point` parameter.

### point.interpolate(startPoint, endPoint, progress)
Calculate and set the point to be the interpolated `progress` between `startPoint` and `endPoint`. Progress should be a decimal between 0 and 1 representing the percentage of interpolation.

## Edge Usage
