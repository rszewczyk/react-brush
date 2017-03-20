import React, {
  Component,
  cloneElement,
  isValidElement,
  PropTypes,
} from "react";
import { shallowEqual } from "./utils.js";

const monotonicId = initial => {
  return () => ++initial;
};

const mouseIsInBounds = (mouseEvent, rectangle) => {
  const { pageX: x, pageY: y } = mouseEvent;
  const { top, left, right, bottom } = rectangle;

  return x >= left && x <= right && y >= top && y <= bottom;
};

const getBrushedState = (state, bounds) => {
  const {
    mouseDown,
    mouseMove,
    mouseUp,
    brushStart,

    mx0,
    my0,
    mx1,
    my1,
  } = state;

  const { left, top } = bounds;

  return {
    y: Math.min(my1, my0) - top,
    x: Math.min(mx1, mx0) - left,
    height: Math.abs(my1 - my0),
    width: Math.abs(mx1 - mx0),
  };
};

export default class ReactBrush extends Component {
  state = {
    mouseMove: 0,
    mouseDown: 0,
    mouseUp: 1,
    brushStart: 0,

    mx0: 0,
    my0: 0,
    mx1: 0,
    my1: 0,
  };

  constructor(props) {
    super(props);
    this._userSelectStyles = {};
    this._getId = monotonicId(this.state.mouseUp);
  }

  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onBrushStart: PropTypes.func,
    onBrushStop: PropTypes.func,
    onBrushChange: PropTypes.func,
    brushedArea: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    tag: PropTypes.string,
  };

  getBounds() {
    if (!this.container) {
      return { top: 0, left: 0, right: 0, bottom: 0 };
    }
    const { clientTop, clientLeft } = document.documentElement;
    const { pageYOffset, pageXOffset } = window;
    const { top, left } = this.container.getBoundingClientRect();
    const { height, width } = this.props;

    const vertOffset = pageYOffset - clientTop;
    const horizontalOffset = pageXOffset - clientLeft;

    return {
      top: top + vertOffset,
      left: left + horizontalOffset,
      bottom: top + vertOffset + height,
      right: left + horizontalOffset + width,
    };
  }

  clearMouseDownTimer() {
    clearTimeout(this._mouseDownTimer);
    this._mouseDownTimer = null;
  }

  mouseDown = e => {
    if (this.props.onMouseDown) {
      this.props.onMouseDown(e);
    }

    const { button, pageX: mx0, pageY: my0 } = e;

    if (e.button !== 0) {
      return;
    }

    this.setState({
      mouseDown: this._getId(),
      mx0,
      my0,
      mx1: mx0,
      my1: my0,
    });

    this.clearMouseDownTimer();
    this._mouseDownTimer = setTimeout(
      () => {
        this.setState({ brushStart: this._getId() });
      },
      300,
    );
  };

  mouseUp = e => {
    const bounds = this.getBounds();
    if (this.props.onMouseUp && mouseIsInBounds(e, bounds)) {
      this.props.onMouseUp(e);
    }

    const { button, pageX: mx1, pageY: my1 } = e;

    if (e.button !== 0) {
      return;
    }

    this.clearMouseDownTimer();

    this.setState({
      mouseUp: this._getId(),
      mx1,
      my1,
    });
  };

  mouseMove = e => {
    const bounds = this.getBounds();
    if (this.props.onMouseMove && mouseIsInBounds(e, bounds)) {
      this.props.onMouseMove(e);
    }

    const { pageX: mx1, pageY: my1 } = e;

    this.setState(({ mx0, my0, mouseUp, mouseDown, brushStart }) => {
      const state = {
        mouseMove: this._getId(),
        mx1,
        my1,
      };

      // end here if the mouse is not down or brush is already in progress
      if (mouseDown < mouseUp || mouseUp < brushStart) {
        return state;
      }

      // has the mouse moved far enough to trigger a brush?
      if (Math.hypot(Math.abs(mx0 - mx1), Math.abs(mx0 - my1)) >= 3) {
        this.clearMouseDownTimer();
        state.brushStart = this._getId();
      }

      return state;
    });
  };

  brushStart(nextState) {
    // prevent text in other elements from being selected during a brush
    const delStyle = document.documentElement.style;
    const {
      userSelect,
      webkitUserSelect,
      mozUserSelect,
      msUserSelect,
    } = delStyle;

    this._userSelectStyles = {
      userSelect,
      webkitUserSelect,
      mozUserSelect,
      msUserSelect,
    };

    delStyle.userSelect = "none";
    delStyle.webkitUserSelect = "none";
    delStyle.mozUserSelect = "none";
    delStyle.msUserSelect = "none";

    if (this.props.onBrushStart) {
      this.props.onBrushStart(getBrushedState(nextState, this.getBounds()));
    }
  }

  brushStop(nextState) {
    // restore previous user-select styles
    const delStyle = document.documentElement.style;
    const {
      userSelect,
      webkitUserSelect,
      mozUserSelect,
      msUserSelect,
    } = this._userSelectStyles;

    delStyle.userSelect = userSelect;
    delStyle.webkitUserSelect = webkitUserSelect;
    delStyle.mozUserSelect = mozUserSelect;
    delStyle.msUserSelect = msUserSelect;

    if (this.props.onBrushStop) {
      this.props.onBrushStop(getBrushedState(nextState, this.getBounds()));
    }
  }

  brushChange(nextState) {
    if (this.props.onBrushChange) {
      this.props.onBrushChange(getBrushedState(nextState, this.getBounds()));
    }
  }

  shouldComponentUpdate(
    nextProps,
    { mx1: nextMx1, my1: nextMy1, mouseMove: nextMouseMove, ...nextState },
  ) {
    const { mx1, my1, mouseMove, ...state } = this.state;
    if (
      !shallowEqual(this.props, nextProps) || !shallowEqual(state, nextState)
    ) {
      return true;
    }

    // only re-render on mouse movement if the user is actively brushing
    if (nextState.brushStart > nextState.mouseUp) {
      return mx1 !== nextMx1 || my1 !== nextMy1 || nextMouseMove !== mouseMove;
    }

    return false;
  }

  componentWillUpdate(nextProps, nextState) {
    const { brushStart, mouseUp, mouseMove } = this.state;
    const {
      brushStart: nextBrushStart,
      mouseUp: nextMouseUp,
      mouseMove: nextMouseMove,
    } = nextState;

    // are we starting a brush?
    if (nextBrushStart > nextMouseUp && brushStart < mouseUp) {
      this.brushStart(nextState);
      return;
    }

    // are we ending a brush?
    if (nextMouseUp > nextBrushStart && mouseUp < brushStart) {
      this.brushStop(nextState);
      return;
    }

    // are we updating the brush?
    if (nextMouseMove > mouseMove && nextBrushStart > nextMouseUp) {
      this.brushChange(nextState);
      return;
    }
  }

  componentWillMount() {
    window.addEventListener("mouseup", this.mouseUp);
    window.addEventListener("mousemove", this.mouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener("mouseup", this.mouseUp);
    window.removeEventListener("mousemove", this.mouseMove);
  }

  renderOverlay() {
    const {
      brushedArea = <BrushedArea />,
      height,
      width,
    } = this.props;

    const container = this.getBounds();
    const brush = getBrushedState(this.state, container);
    const brushProps = { brush, container };

    const { brushStart, mouseUp } = this.state;
    const brushing = brushStart > mouseUp;

    return (
      <g>
        {brushing &&
          (isValidElement(brushedArea)
            ? cloneElement(brushedArea, brushProps)
            : brushedArea(brushProps))}
        <rect
          width={width}
          height={height}
          style={{ opacity: 0, cursor: "crosshair" }}
          onMouseMove={this.mouseMove}
        />
      </g>
    );
  }

  render() {
    const {
      // these props aren't used here, but we prevent them from being passed on
      // to the underlying tag
      onMouseDown,
      onMouseUp,
      onMouseMove,
      onBrushStop,
      onBrushStart,
      onBrushChange,
      brushedArea,

      tag: Tag = "svg",
      children,
      width,
      height,
      ...props
    } = this.props;

    if (Tag === "svg") {
      props.height = height;
      props.width = width;
    }

    const { brushStart, mouseUp } = this.state;
    const brushing = brushStart > mouseUp;

    return (
      <Tag
        onMouseDown={this.mouseDown}
        {...props}
        ref={r => {
          this.container = r;
        }}
      >
        {!brushing && this.renderOverlay()}
        {children}
        {brushing && this.renderOverlay()}
      </Tag>
    );
  }
}

export const BrushedArea = (
  {
    brush,
    container,
    style,
    fullWidth,
    fullHeight,
    className,
  },
) => {
  if (!(container && brush)) {
    return null;
  }

  const {
    width: brushWidth,
    height: brushHeight,
    x: brushX,
    y: brushY,
  } = brush;

  const { top, left, right, bottom } = container;
  const containerWidth = right - left;
  const containterHeight = bottom - top;

  let x = 0;
  let y = 0;
  let width = containerWidth;
  let height = containterHeight;

  if (!fullWidth) {
    [x, width] = brushX < 0
      ? [0, brushWidth + brushX]
      : [
          brushX,
          brushX + brushWidth > containerWidth
            ? containerWidth - brushX
            : brushWidth,
        ];
  }
  if (!fullHeight) {
    [y, height] = brushY < 0
      ? [0, brushHeight + brushY]
      : [
          brushY,
          brushY + brushHeight > containterHeight
            ? containterHeight - brushY
            : brushHeight,
        ];
  }

  return (
    <rect
      width={width}
      height={height}
      className={className}
      x={x}
      y={y}
      style={{ fill: "black", opacity: 0.3, ...style }}
    />
  );
};

BrushedArea.propTypes = {
  container: PropTypes.object,
  brush: PropTypes.object,
  fullWidth: PropTypes.bool,
  fullHeight: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
};
