import React from "react";
import ReactDOM from "react-dom";
import Brushable, { BrushedArea } from "../../lib";

const Wrapper = props => <div style={{ padding: "1rem" }} {...props} />;

ReactDOM.render(
  <div style={{ display: "flex", flexWrap: "wrap" }}>
    <Wrapper>
      <p>Basic brush</p>
      <Brushable
        height={200}
        width={400}
        style={{ border: "solid 1px black" }}
      />
    </Wrapper>
    <Wrapper>
      <p>One dimensional brush</p>
      <Brushable
        height={200}
        width={400}
        style={{ border: "solid 1px black" }}
        brushedArea={<BrushedArea fullHeight />}
      />
    </Wrapper>
    <Wrapper>
      <p>Simple customization of the brushed area</p>
      <Brushable
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
        <Brushable
          tag="g"
          transform="translate(10, 10)"
          height={120}
          width={180}
          brushedArea={<BrushedArea fullHeight />}
        >
          <rect style={{ fill: "green" }} height={120} width={180} />
        </Brushable>
        <Brushable
          tag="g"
          transform="translate(220, 10)"
          height={180}
          width={120}
          brushedArea={<BrushedArea fullWidth />}
        >
          <rect style={{ fill: "red" }} height={180} width={120} />
        </Brushable>
      </svg>
    </Wrapper>
  </div>,
  document.getElementById("root"),
);
