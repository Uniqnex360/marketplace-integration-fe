import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Box, Typography, Card, CardContent, CircularProgress } from "@mui/material";
import axios from "axios";
import DottedCircleLoading from "../../Loading/DotLoading";

const DonutChart = ({ marketPlaceId, DateStartDate, DateEndDate }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableColors, setAvailableColors] = useState([
    "#42A5F5", "#616161", "#4FC3F7", "#66BB6A", "#FFB74D", "#FF7043", "#7E57C2",
    "#9575CD", "#E57373", "#F06292", "#BA68C8", "#7986CB", "#64B5F6", "#4DB6AC",
    "#81C784", "#A5D6A7", "#DCE775", "#FFF176", "#FFD54F", "#FFB300", "#F57C00",
    "#D4E157", "#A1887F", "#90A4AE", "#BCAAA4" // Add more colors as needed
  ]);
  const userData = localStorage.getItem("user");
  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${process.env.REACT_APP_IP}fetchTopSellingCategories/`, {
          marketplace_id: marketPlaceId.id,
          start_date: DateStartDate || "",
          end_date: DateEndDate || "",
          user_id: userIds,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        console.log("API Response:", response.data);

        if (response.data?.data?.top_categories) {
          const topCategories = response.data.data.top_categories;
          const formattedData = topCategories.map((item, index) => {
            const colorIndex = index % availableColors.length;
            return {
              name: item.category_name,
              value: item.total_order_value,
              color: availableColors[colorIndex],
            };
          });
          setChartData(formattedData);
        } else {
          setChartData([]);
          console.error("Invalid API response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [marketPlaceId, DateStartDate, DateEndDate, availableColors]);

  return (
//     <Card sx={{ width: "100%" }}>
// <CardContent>
//   <Box
//     sx={{
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       flexDirection: "column",
//       width: "100%",
//       height: 290,
//     }}
//   >
//     <Typography
//       sx={{
//         marginBottom: "25px",
//         fontSize: "14px",
//         textAlign: "center",
//       }}
//     >
//       Top Selling Categories
//     </Typography>

//     {loading ? (
//       <DottedCircleLoading />
//     ) : chartData.length > 0 ? (
//       <PieChart width={350} height={250}>
//       <Pie
//         data={chartData}
//         dataKey="value"
//         nameKey="name"
//         cx="50%"
//         cy="50%"
//         innerRadius={60}
//         outerRadius={80}
//         paddingAngle={2}
//         isAnimationActive={false}
      
//       >
//         {chartData.map((entry, index) => (
//           <Cell key={`cell-${index}`} fill={entry.color} />
//         ))}
//       </Pie>
    
//       <Tooltip
//         formatter={(value, name) => [`$${value}`, `${name}`]}
//         wrapperStyle={{ background: 'rgba(255, 255, 255, 0.8)', padding: '10px', borderRadius: '5px' }}
//         trigger={['hover']} // Tooltip appears only on hover
//       />
    
//       <Legend
//         align="right"
//         verticalAlign="middle"
//         layout="vertical"
//         wrapperStyle={{ fontSize: 12, paddingLeft: '10px' }}
//       />
//     </PieChart>
    
//     ) : (
//       <Typography>No Data Available</Typography>
//     )}
//   </Box>
// </CardContent>
//   </Card>
  
 <Card sx={{ width: "100%",border: "1px solid #ccc" }}>
  <CardContent>
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: 290,
      }}
    >
      <Typography
        sx={{
          marginBottom: "15px",
          fontSize: "16px",
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        Top Selling Categories
      </Typography>

      {loading ? (
        <DottedCircleLoading />
      ) : chartData.length > 0 ? (
        <PieChart width={350} height={250}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

             <Tooltip
            formatter={(value, name) => [`$${value}`, `${name}`]}
            wrapperStyle={{
              background: "rgba(255, 255, 255, 0.9)",
              padding: "8px",
              borderRadius: "5px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      ) : (
        <Typography>No Data Available</Typography>
      )}
    </Box>
  </CardContent>
</Card>




  );
};

export default DonutChart;
