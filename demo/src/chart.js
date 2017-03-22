import React from "react";
import ReactBrush, { BrushedArea } from "../../lib";
import { scaleBand, scaleLinear } from "d3-scale";
import maxBy from "lodash/maxBy";
import "./chart.css";

export default class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: {},
    };

    this.updateChart(props);
  }

  updateChart(props) {
    const { width, height, data } = props;

    this.xScale = scaleBand()
      .rangeRound([0, width])
      .padding(0.1)
      .domain(data.map(d => d.value));

    this.yScale = scaleLinear()
      .rangeRound([height, 0])
      .domain([0, maxBy(data, d => d.count).count]);

    this.bandwidth = this.xScale.bandwidth();
  }

  toggleBucket(i) {
    this.setState(({ selected }) => ({
      selected: { ...selected, [i]: !selected[i] },
    }));
  }

  handleBrushStart = selection => {
    this.setState({ selected: {} });
  };

  handleBrushStop = selection => {
    const { data } = this.props;
    const selected = {};

    data.forEach((d, i) => {
      const x0 = this.xScale(d.value);
      const x1 = x0 + this.bandwidth;
      const s0 = selection.x;
      const s1 = s0 + selection.width;

      if (
        (x0 >= s0 && x0 <= s1) ||
        (x1 >= s0 && x1 <= s1) ||
        (s0 >= x0 && s1 <= x1)
      ) {
        selected[i] = true;
      }
    });

    this.setState({ selected });
  };

  componentWillUpdate(nextProps) {
    this.updateChart(nextProps);
  }

  render() {
    const { height, width, data, ...props } = this.props;
    const { selected } = this.state;

    return (
      <ReactBrush
        onBrushStart={this.handleBrushStart}
        onBrushStop={this.handleBrushStop}
        height={height}
        width={width}
        brushedArea={<BrushedArea fullHeight />}
        {...props}
      >
        <g>
          {data.map((d, i) => {
            const y = this.yScale(d.count);

            return (
              <g key={i}>
                <rect
                  key={i}
                  style={{ fill: selected[i] ? "red" : "blue" }}
                  x={this.xScale(d.value)}
                  y={y}
                  width={this.bandwidth}
                  height={height - y}
                />
                <rect
                  className="bar"
                  x={this.xScale(d.value)}
                  y={0}
                  width={this.bandwidth}
                  height={height}
                  onClick={() => {
                    this.toggleBucket(i);
                  }}
                />
              </g>
            );
          })}
        </g>
      </ReactBrush>
    );
  }
}
