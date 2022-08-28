import React, { useMemo } from "react";
import { extent } from "d3-array";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Group } from "@visx/group";
import { GridRows } from "@visx/grid";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Bar, Line } from "@visx/shape";
import { Text } from "@visx/text";

type XAccessor<TDatum> = (datum: TDatum) => string | number;
type YAccessor<TDatum> = (datum: TDatum) => number;

interface WaterfallChartProps<TDatum> {
  width: number;
  height: number;
  data: TDatum[];
  xAccessor: XAccessor<TDatum>;
  yAccessor: YAccessor<TDatum>;
  yLabel: string;
}

const colors = {
  positive: "#49b86f",
  negative: "#c92e5b",
  total: "#434857",
  stepConnector: "#888d94",
  axes: "#888d94",
};

function calculateWaterfallSteps<TDatum>(
  data: TDatum[],
  xAccessor: XAccessor<TDatum>,
  yAccessor: YAccessor<TDatum>
) {
  // Holds cumulative value
  let cumulativeTotal = 0;

  // Calculate bars for each data point
  const steps = data.map((datum) => {
    const xValue = xAccessor(datum);
    const yValue = yAccessor(datum);

    const prevTotal = cumulativeTotal;
    cumulativeTotal += yValue;

    return {
      x: xValue,
      y: yValue,
      start: prevTotal,
      end: cumulativeTotal,
      color: yValue > 0 ? colors.positive : colors.negative,
    };
  });

  // Add final Total bar
  steps.push({
    x: "Total",
    y: cumulativeTotal,
    start: 0,
    end: cumulativeTotal,
    color: colors.total,
  });

  return steps;
}

export function WaterfallChart<TDatum>({
  width,
  height,
  data,
  xAccessor,
  yAccessor,
  yLabel,
}: WaterfallChartProps<TDatum>) {
  // Preserve space near chart edges and calculate actual chart dimensions
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Calculate waterfall steps from provided data
  const steps = useMemo(
    () => calculateWaterfallSteps(data, xAccessor, yAccessor),
    [data, xAccessor, yAccessor]
  );

  // Build scales
  const padding = 0.2;
  const xScale = scaleBand({
    domain: steps.map((step) => step.x),
    padding,
    range: [0, innerWidth],
  });

  const yDomain = useMemo(() => {
    const values = steps.flatMap((step) => [step.start, step.end]);
    const [min, max] = extent<number>(values);
    return min != null && max != null ? [min, max] : undefined;
  }, [steps]);

  const yScale = scaleLinear({
    domain: yDomain,
    nice: true,
    range: [innerHeight, 0],
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows scale={yScale} width={innerWidth} strokeDasharray="5" />

        {steps.map((step, index) => {
          const x = xScale(step.x);
          const y = yScale(Math.max(step.start, step.end));

          if (x == null || y == null) {
            return null;
          }

          const barHeight = Math.abs(yScale(step.start) - yScale(step.end));

          const isLast = index === steps.length - 1;
          const linePadding = 2;
          const x1 = x + xScale.bandwidth() + linePadding;
          const x2 = x + xScale.bandwidth() / (1 - padding) - linePadding;
          const lineY = step.end < step.start ? y + barHeight : y;

          const labelOffset = 10;
          const labelY =
            yScale(step.end) + (step.y < 0 ? labelOffset : -labelOffset);

          return (
            <React.Fragment key={index}>
              <Bar
                key={index}
                width={xScale.bandwidth()}
                height={barHeight}
                x={x}
                y={y}
                fill={step.color}
              />
              {!isLast && (
                <Line
                  x1={x1}
                  x2={x2}
                  y1={lineY}
                  y2={lineY}
                  stroke={colors.stepConnector}
                  strokeDasharray={2}
                />
              )}

              <Text
                textAnchor="middle"
                x={x + xScale.bandwidth() / 2}
                y={labelY}
                style={{
                  fill: colors.axes,
                  fontSize: 13,
                  fontWeight: 700,
                }}
                verticalAnchor="middle"
              >
                {step.y}
              </Text>
            </React.Fragment>
          );
        })}

        <AxisLeft
          label={yLabel}
          scale={yScale}
          stroke={colors.axes}
          tickStroke={colors.axes}
          hideAxisLine
          hideTicks
          labelProps={{
            fill: colors.axes,
            fontSize: 16,
          }}
          tickLabelProps={() => ({
            fill: colors.axes,
            fontSize: 13,
            textAnchor: "end",
            verticalAnchor: "middle",
          })}
        />
        <AxisBottom
          scale={xScale}
          top={innerHeight}
          stroke={colors.axes}
          tickStroke={colors.axes}
          tickLabelProps={() => ({
            fill: colors.axes,
            fontSize: 13,
            fontWeight: 600,
            textAnchor: "middle",
            verticalAnchor: "middle",
          })}
        />
      </Group>
    </svg>
  );
}
