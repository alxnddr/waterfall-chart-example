import { ParentSize } from "@visx/responsive";
import { WaterfallChart } from "./WaterfallChart";
import "./App.css";

const data = [
  { month: "Jan", earnings: 23 },
  { month: "Feb", earnings: 18 },
  { month: "Mar", earnings: -14 },
  { month: "Apr", earnings: 4 },
  { month: "May", earnings: -26 },
  { month: "Jun", earnings: 10 },
  { month: "Jul", earnings: 32 },
  { month: "Aug", earnings: 48 },
  { month: "Sep", earnings: 12 },
  { month: "Oct", earnings: -14 },
  { month: "Nov", earnings: -15 },
  { month: "Dec", earnings: 5 },
];

function App() {
  return (
    <div className="App">
      <ParentSize>
        {({ width, height }) => (
          <WaterfallChart
            width={width}
            height={height}
            data={data}
            xAccessor={(datum) => datum.month}
            yAccessor={(datum) => datum.earnings}
            yLabel="Earnings"
          />
        )}
      </ParentSize>
    </div>
  );
}

export default App;
