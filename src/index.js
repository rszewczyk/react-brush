import React, {
  Component,
  cloneElement,
  isValidElement,
  PropTypes,
} from "react";
import { shallowEqual } from "./utils.js";

const mouseIsInBounds = (mouseEvent, rectangle) => {
  const { pageX: x, pageY: y } = mouseEvent;
  const { top, left, right, bottom } = rectangle;

  return x >= left && x <= right && y >= top && y <= bottom;
};

const mouseMoveExceedsThreshold = ({ mx0, mx1, my0, my1 }, threshold) =>
  threshold > 0 &&
  Math.hypot(Math.abs(mx0 - mx1), Math.abs(my0 - my1)) >= threshold;

const getBrushedState = (state, bounds) => {
  const {
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
    mouseDown: false,
    isBrushing: false,

    mx0: 0,
    my0: 0,
    mx1: 0,
    my1: 0,
  };

  constructor(props) {
    super(props);
    this._userSelectStyles = {};
  }

  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onBrushStart: PropTypes.func,
    onBrushStop: PropTypes.func,
    onBrushChange: PropTypes.func,
    brushedArea: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    tag: PropTypes.string,
    mouseMoveThreshold: PropTypes.number,
    mouseDownThreshold: PropTypes.number,
  };

  static defaultProps = {
    tag: "svg",
    mouseDownThreshold: 500,
    mouseMoveThreshold: 5,
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
    if (this._mouseDownTimer) {
      clearTimeout(this._mouseDownTimer);
      this._mouseDownTimer = null;
    }
  }

  handleMouseDown = e => {
    const { button, pageX: mx0, pageY: my0 } = e;
    const { mouseDownThreshold, mouseMoveThreshold } = this.props;
    const delayBrush = mouseDownThreshold > 0 || moveMoveThreshold > 0;

    if (button === 0) {
      this.setState({
        mouseDown: true,
        isBrushing: delayBrush ? false : true,
        mx0,
        my0,
        mx1: mx0,
        my1: my0,
      });
    }

    const { onMouseDown } = this.props;
    if (typeof onMouseDown === "function") {
      onMouseDown(e);
    }
  };

  handleMouseUp = e => {
    const { button, pageX: mx1, pageY: my1 } = e;
    if (e.button === 0) {
      this.clearMouseDownTimer();

      this.setState({
        mouseDown: false,
        isBrushing: false,
        mx1,
        my1,
      });
    }

    const { onMouseUp } = this.props;
    if (
      typeof onMouseUp === "function" && mouseIsInBounds(e, this.getBounds())
    ) {
      this.props.onMouseUp(e);
    }
  };

  mouseMove = e => {
    const { pageX: mx1, pageY: my1 } = e;

    this.setState(({ mouseDown, isBrushing }) => {
      const state = {
        mx1,
        my1,
      };

      // end here if the mouse is not down or brush is already in progress
      if (!mouseDown || isBrushing) {
        return state;
      }

      // end here if the mouse has not moved far enough to trigger a brush
      const { mx0, my0 } = this.state;
      if (
        !mouseMoveExceedsThreshold(
          { mx1, my1, mx0, my0 },
          this.props.mouseMoveThreshold,
        )
      ) {
        return state;
      }

      this.clearMouseDownTimer();
      state.isBrushing = true;

      return state;
    });

    const { onMouseMove } = this.props;
    if (
      typeof onMouseMove === "function" && mouseIsInBounds(e, this.getBounds())
    ) {
      onMouseMove(e);
    }
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

    const { onBrushStart } = this.props;
    if (typeof onBrushStart === "function") {
      onBrushStart(getBrushedState(nextState, this.getBounds()));
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

    const { onBrushStop } = this.props;
    if (typeof onBrushStop === "function") {
      onBrushStop(getBrushedState(nextState, this.getBounds()));
    }
  }

  brushChange(nextState) {
    const { onBrushChange } = this.props;
    if (typeof onBrushChange === "function") {
      onBrushChange(getBrushedState(nextState, this.getBounds()));
    }
  }

  shouldComponentUpdate(nextProps, { mx1: nextx, my1: nexty, ...nextState }) {
    const { mx1: x, my1: y, ...state } = this.state;
    if (
      !shallowEqual(this.props, nextProps) || !shallowEqual(state, nextState)
    ) {
      return true;
    }

    // only re-render on mouse movement if the user is actively brushing
    if (nextState.isBrushing === true) {
      return x !== nextx || y !== nexty;
    }

    return false;
  }

  componentWillUpdate(nextProps, nextState) {
    const { isBrushing, x1: x, y1: y, mouseDown } = this.state;
    const {
      isBrushing: nextIsBrushing,
      x1: nextx,
      y1: nexty,
      mouseDown: nextMouseDown,
    } = nextState;

    // if mouse went from up to down, schedule brush if needed
    if (!mouseDown && nextMouseDown && !nextIsBrushing) {
      const { mouseDownThreshold } = this.props;
      if (mouseDownThreshold > 0) {
        this._mouseDownTimer = setTimeout(
          () => {
            this.setState({ isBrushing: true });
            this.clearMouseDownTimer();
          },
          mouseDownThreshold,
        );
      }
    }

    // are we starting a brush?
    if (!isBrushing && nextIsBrushing) {
      this.brushStart(nextState);
      return;
    }

    // are we ending a brush?
    if (isBrushing && !nextIsBrushing) {
      this.brushStop(nextState);
      return;
    }

    // are we updating the brush?
    if (nextIsBrushing && (nextx != x || nexty != y)) {
      this.brushChange(nextState);
      return;
    }
  }

  componentWillMount() {
    window.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("mousemove", this.mouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("mousemove", this.mouseMove);
    this.clearMouseDownTimer();
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
    const { isBrushing } = this.state;

    return (
      <g>
        {isBrushing &&
          (isValidElement(brushedArea)
            ? cloneElement(brushedArea, brushProps)
            : brushedArea(brushProps))}
        <rect
          width={width}
          height={height}
          style={{ opacity: 0, cursor: isBrushing ? "crosshair" : "auto" }}
        />
      </g>
    );
  }

  render() {
    const {
      // these props aren't used here, but we prevent them from being passed on
      // to the underlying tag
      onMouseUp,
      onMouseMove,
      onBrushStop,
      onBrushStart,
      onBrushChange,
      brushedArea,
      mouseMoveThreshold,
      mouseDownThreshold,

      tag: Tag,
      children,
      width,
      height,
      onMouseDown,
      ...props
    } = this.props;

    if (Tag === "svg") {
      props.height = height;
      props.width = width;
    }

    const { brushStart, mouseUp } = this.state;
    const { isBrushing } = this.state;

    return (
      <Tag
        onMouseDown={this.handleMouseDown}
        {...props}
        ref={r => {
          this.container = r;
        }}
      >
        {!isBrushing && this.renderOverlay()}
        {children}
        {isBrushing && this.renderOverlay()}
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
