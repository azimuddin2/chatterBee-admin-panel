import StatCard from "@/components/MetricCard";
import RegistrationTable from "@/components/RegistrationTable";
import ChartCard from "@/components/EarningSummaryChart";
import { Area, ResponsiveContainer } from "recharts";

import EarningSummaryChart from "@/components/EarningSummaryChart";
import MetricCard from "@/components/MetricCard";
import { AlertTriangle, DollarSign, Users } from "lucide-react";
import Dashboard from "@/components/MetricCard";

const Admin = () => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return (
    <>
      <div className="bg-white w-full min-h-screen">
        <div className="">
          <Dashboard />
          {/* <MetricCard
            title="Active User"
            value={1548}
            icon={Users}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-500"
          />
          <MetricCard
            title="Caregiver Alerts"
            value={158}
            icon={AlertTriangle}
            iconBgColor="bg-yellow-50"
            iconColor="text-yellow-500"
          />
          <MetricCard
            title="Total Earning"
            value="$26,816"
            icon={DollarSign}
            iconBgColor="bg-green-50"
            iconColor="text-green-500"
          /> */}
        </div>

        <div className=" ">
          {/* Earning Summary Chart */}
          <div className="w-full">
            {/* Ensure minimum height for chart visibility */}
            <EarningSummaryChart />
          </div>

          {/* Alcohol Consumption Trend Line Chart */}
          {/* <div className="min-h-[340px]"> */}

          {/* Ensure minimum height for chart visibility */}
          {/* <AlcoholConsumptionTrendChart /> */}
          {/* </div> */}
        </div>

        <div className="p-4">
          <RegistrationTable />
        </div>
      </div>
    </>
  );
};
export default Admin;
