import {
  axisBottom,
  axisLeft,
  ScaleBand,
  scaleBand,
  scaleLinear,
  ScaleLinear,
  select,
} from "d3";
import React from "react";
import { useDimensions } from "../hooks/useDimension";
import { Card, H1Style } from "../styles";

interface Data {
  label: string;
  value: number;
}

interface AxisBottomProps {
  scale: ScaleBand<string>;
  transform: string;
}

interface AxisLeftProps {
  scale: ScaleLinear<number, number, never>;
}

interface BarsProps {
  data: IBarChartProps["data"];
  height: number;
  scaleX: AxisBottomProps["scale"];
  scaleY: AxisLeftProps["scale"];
}

interface IBarChartProps {
  data: Data[];
  containerRef: React.RefObject<any>;
}

const tmp = {
  "2023-01-31T00:00:00": 21,
  "2023-02-01T00:00:00": 32,
  "2023-02-02T00:00:00": 33,
  "2023-02-03T00:00:00": 39,
  "2023-02-04T00:00:00": 16,
  "2023-02-05T00:00:00": 16,
  "2023-02-06T00:00:00": 135,
};

// const DATA: Data[] = [
//   { label: "23rd Nov", value: 20 },
//   { label: "24th Nov", value: 10 },
//   { label: "25th Nov", value: 5 },
//   { label: "26th Nov", value: 15 },
//   { label: "27th Nov", value: 11 },
//   { label: "28th Nov", value: 21 },
//   { label: "29th Nov", value: 18 },
// ];

function AxisBottom({ scale, transform }: AxisBottomProps) {
  const ref = React.useRef<SVGGElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      select(ref.current).call(axisBottom(scale));
    }
  }, [scale]);

  return <g ref={ref} transform={transform} />;
}

function AxisLeft({ scale }: AxisLeftProps) {
  const ref = React.useRef<SVGGElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      select(ref.current).call(axisLeft(scale).ticks(5));
    }
  }, [scale]);

  return <g ref={ref} />;
}

function Bars({ data, height, scaleX, scaleY }: BarsProps) {
  return (
    <>
      {data.map(({ value, label }) => (
        <rect
          key={`bar-${label}`}
          x={scaleX(label)}
          y={scaleY(value)}
          width={scaleX.bandwidth()}
          height={height - scaleY(value)}
          fill="#00babc"
        />
      ))}
    </>
  );
}

const BarChart = ({ data, containerRef }: IBarChartProps) => {
  const margin = { top: 16, right: 16, bottom: 24, left: 32 };

  const dimension = useDimensions(containerRef);

  const width = dimension.width - margin.left - margin.right;
  const height = dimension.height - margin.top - margin.bottom;

  const scaleX = scaleBand()
    .domain(data.map(({ label }) => label))
    .range([0, width])
    .padding(0.2);
  const scaleY = scaleLinear()
    .domain([0, Math.max(...data.map(({ value }) => value))])
    .range([height, 0]);

  return (
    <svg
      width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <AxisBottom scale={scaleX} transform={`translate(0, ${height})`} />
        <AxisLeft scale={scaleY} />
        <Bars data={data} height={height} scaleX={scaleX} scaleY={scaleY} />
      </g>
    </svg>
  );
};

interface ITotalActiveUser7Days {
  className?: string;
}
const TotalActiveUser7Days = ({ className }: ITotalActiveUser7Days) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [data, setData] = React.useState<any>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      await fetch(
        "https://backend-flask.onrender.com/api/on-campus/daily-total-active-students"
      )
        .then((response) => {
          if (response.ok) {
            console.log("Successfully fetch Daily Total Active Students");
            return response.json();
          }
        })
        .then((data) => {
          const newData = Object.keys(data).map((key) => {
            const date = new Date(key).toDateString().split(" ");
            return {
              label: date[1] + " " + date[2],
              value: tmp[key as keyof typeof tmp],
            };
          });
          setData(newData);
        })
        .catch((error) => {
          console.error(error);
        });
    };
    fetchUsers();

    // Call the API every 5 minutes
    const interval = setInterval(fetchUsers, 1000 * 60 * 1);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);

    const newData = Object.keys(tmp).map((key) => {
      const date = new Date(key).toDateString().split(" ");
      return {
        label: date[1] + " " + date[2],
        value: tmp[key as keyof typeof tmp],
      };
    });
    setData(newData);
  }, []);

  return (
    // the container for the svg
    <Card className={className + " flex flex-col"}>
      <H1Style>Total active users last 7 days</H1Style>
      <div ref={containerRef} className="h-full w-full">
        <BarChart data={data} containerRef={containerRef} />
      </div>
    </Card>
  );
};

export default TotalActiveUser7Days;
