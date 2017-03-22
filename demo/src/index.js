import React from "react";
import ReactDOM from "react-dom";
import ReactBrush, { BrushedArea } from "../../lib";
import Chart from "./chart";

const chartData = [
  {
    value: "A",
    count: 123,
  },
  {
    value: "B",
    count: 34,
  },
  {
    value: "C",
    count: 76,
  },
  {
    value: "D",
    count: 69,
  },
];

const Wrapper = props => (
  <div style={{ padding: "16px", width: "432px" }} {...props} />
);

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
        data={chartData}
      />
    </Wrapper>
  </div>,
  document.getElementById("root"),
);
