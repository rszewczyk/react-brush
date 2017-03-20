import React from "react";
import ReactDOM from "react-dom";
import ReactBrush, { BrushedArea } from "../../lib";
import { scaleBand, scaleLinear } from "d3-scale";
import max from "lodash/max";

const Wrapper = props => <div style={{ padding: "1rem" }} {...props} />;

const barData = [1, 13, 4, 8, 17, 7, 4, 6];

class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: null,
    };
  }

  render() {
    const { children, height, width, ...props } = this.props;
    const child = React.Children.only(children);

    return (
      <ReactBrush
        onBrushStart={() => {
          this.setState({ selection: null });
        }}
        onBrushStop={selection => {
          this.setState({ selection });
        }}
        height={height}
        width={width}
        {...props}
        children={React.cloneElement(child, {
          selection: this.state.selection,
          height,
          width,
        })}
      />
    );
  }
}

class Bars extends React.PureComponent {
  render() {
    const { height, width, data, selection } = this.props;
    const xScale = scaleBand()
      .rangeRound([0, width])
      .padding(0.1)
      .domain(data.map((d, i) => i));
    const bandwidth = xScale.bandwidth();
    const yScale = scaleLinear().rangeRound([height, 0]).domain([0, max(data)]);

    return (
      <g>
        {data.map((d, i) => {
          let fill = "blue";
          const x = xScale(i);

          if (selection) {
            const x0 = x;
            const x1 = x + bandwidth;
            const s0 = selection.x;
            const s1 = s0 + selection.width;

            if (
              (x0 >= s0 && x0 <= s1) ||
              (x1 >= s0 && x1 <= s1) ||
              (s0 >= x0 && s1 <= x1)
            ) {
              fill = "red";
            }
          }

          return (
            <rect
              style={{ fill, cursor: "pointer" }}
              key={i}
              x={x}
              y={yScale(d)}
              width={bandwidth}
              height={height - yScale(d)}
              onClick={() => {
                alert(`you clicked: ${i}`);
              }}
            />
          );
        })}
      </g>
    );
  }
}

ReactDOM.render(
  <div style={{ display: "flex", flexWrap: "wrap" }}>
    <Wrapper>
      <p>Basic brush</p>
      <ReactBrush
        height={200}
        width={400}
        style={{ border: "solid 1px black" }}
      />
    </Wrapper>

    <Wrapper>
      <p>One dimensional brush</p>
      <ReactBrush
        height={200}
        width={400}
        style={{ border: "solid 1px black" }}
        brushedArea={<BrushedArea fullHeight />}
      />
    </Wrapper>

    <Wrapper>
      <p>Simple customization of the brushed area</p>
      <ReactBrush
        height={200}
        width={400}
        style={{ border: "solid 1px black" }}
        brushedArea={
          <BrushedArea
            style={{
              fill: "transparent",
              stroke: "red",
              strokeWidth: "2px",
              opacity: 1.0,
            }}
          />
        }
      />
    </Wrapper>

    <Wrapper>
      <p>Multiple brushes</p>
      <svg height={200} width={400} style={{ border: "solid 1px black" }}>
        <ReactBrush
          tag="g"
          transform="translate(10, 10)"
          height={120}
          width={180}
          brushedArea={<BrushedArea fullHeight />}
        >
          <rect style={{ fill: "green" }} height={120} width={180} />
        </ReactBrush>
        <ReactBrush
          tag="g"
          transform="translate(220, 10)"
          height={180}
          width={120}
          brushedArea={<BrushedArea fullWidth />}
        >
          <rect style={{ fill: "red" }} height={180} width={120} />
        </ReactBrush>
      </svg>
    </Wrapper>

    <Wrapper>
      <p>
        Using the brush callbacks to select elements of your graphic.
        react-brush composes nicely with other interactive graphic elements -
        the brush overlay doesn't interfere with other mouse events
      </p>
      <Chart
        height={200}
        width={400}
        style={{ border: "solid 1px black" }}
        brushedArea={<BrushedArea fullHeight />}
      >
        <Bars data={barData} />
      </Chart>
    </Wrapper>
  </div>,
  document.getElementById("root"),
);
