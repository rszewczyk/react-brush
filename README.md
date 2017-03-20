# react-brush 🚧

Render an `svg` with a highlightable area.

## Installation
```
yarn add react-brush
```

## Basic Usage
The default export of `react-brush` is a component.

```jsx
import ReactBrush from 'react-brush';

// ...
  <ReactBrush height={200} width={500} />
// ...
```

This will render an `svg` with a brush overlay that is enabled when the user presses and holds mouse button `0` for a short time (` >= 300ms`) or clicks, holds and begins to drag. The selected region will be displayed while the brush is in progress. Callbacks can be registered to handle the start, stop and change of a brush action.

```jsx
<ReactBrush
  height={200}
  width={500}
  onBrushStart={handleBrushStart}
  onBrushEnd={handleBrushEnd}
  onBrushChange={handleBrushChange}
/>
```

The callbacks will receive a single object parameter with the following type:

```
{
  x: number,       // x and y represent the top left corner of the selected region relative
  y: number,       // to the origin of the svg's viewable area

  width: number,   // the width of selected region
  height: number,  // the height of selected region
}
```

`react-brush` also exports a `BrushedArea` component that can be used to customize the selected area. Pass it as the prop `brushedArea` to the `ReactBrush` component.

```jsx
<ReactBrush
  height={200}
  width={500}
  brushedArea={<BrushedArea fullHeight />}
/>
```

The `brushedArea` prop can alternatively be a render callback that will be passed a single object parameter with the shape `{ brush, container }`. The `brush` property is an object of the same type as that passed to the brush callbacks. The `container` property is an object with the shape `{ top, bottom, left, right }` describing the position of the `ReactBrush` container in the document.

```jsx
<ReactBrush
  height={200}
  width={500}
  brushedArea={({ container, brush }) => {
    /* do something awesome */
  }}
/>
```

See the demo for some working examples.

## API:

### `<ReactBrush>` Props

Property  	| Type | 	Required		|	Default		|	  Description
:-----------|:----------|:----------|:----------|:----------
`width` | `number` | yes | `undefined` | The width of the brush container
`height` | `number` | yes | `undefined` | The height of the brush container
`onBrushStart` | `function` | no | `undefined` | The callback to use if any when a brush is started (the user presses mouse button `0`)
`onBrushStop` | `function` | no | `undefined` | The callback to use if any when a brush is stopped (the user releases mouse button `0`)
`onBrushChange` | `function` | no | `undefined` | The callback to use if any when a brush is changed (the user drags while holding down mouse button `0`)
`brushedArea` | `function` or `element` | no | `<BrushedArea />` | The element or render callback to use to render the brushed area
`tag` | `string` `svg or g` | no | `svg` | The

### `<BrushedArea>` Props
Property  	| Type | 	Required		|	Default		|	  Description
:-----------|:----------|:----------|:----------|:----------
`fullHeight` | `boolean` | no | false | the brushed area will take up the full height of its container
`fullWidth` | `boolean` | no | false | the brushed area will take up the full width of its container
