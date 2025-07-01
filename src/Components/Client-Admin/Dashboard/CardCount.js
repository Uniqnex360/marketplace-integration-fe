import { useState, useEffect } from "react";
import { Card, CardContent, Grid, Typography, Box } from "@mui/material";
import axios from "axios";
import DottedCircleLoading from "../../Loading/DotLoading";

const CardCount = ({ marketPlaceId, DateStartDate, DateEndDate }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    total_sales: 0,
    total_units_sold: 0,
    total_sold_product_count: 0,
  });

  useEffect(() => {
    // if (!DateStartDate || !DateEndDate) return; // Ensure both dates exist

    console.log("Updated Props:", { DateStartDate, DateEndDate });

    const fetchCount = async () => {
      setLoading(true);
      try {
        const userData = localStorage.getItem("user");
        let userIds = "";
        if (userData) {
          const data = JSON.parse(userData);
          userIds = data.id;
        }

        const response = await axios.post(
          `${process.env.REACT_APP_IP}fetchSalesSummary/`,
          {
            marketplace_id: marketPlaceId?.id === "all" ? "" : marketPlaceId?.id,
            start_date: DateStartDate, // Directly use passed string format
            end_date: DateEndDate,
            user_id: userIds,
          }
        );

        if (response.data && response.data.data) {
          setData(response.data.data);
        } else {
          console.error("Invalid response from API");
        }
      } catch (error) {
        console.error("Error fetching count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [marketPlaceId, DateStartDate, DateEndDate]); // Dependencies updated

  return (
    <Box sx={{ backgroundColor: "#f8f9fc", p: 2, borderRadius: 2,   width: "96%", }}>
      <Box sx={{ backgroundColor: "#fff", p: 2, borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2}>
          {loading ? (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
               
                  minHeight: "150px",
                }}
              >
                <DottedCircleLoading />
              </Box>
            </Grid>
          ) : (
            <>
              <Grid item xs={12} sm={4}>
                <Card sx={{ boxShadow: 2, textAlign: "center", borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      ${data.total_sales.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Sales
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ boxShadow: 2, textAlign: "center", borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {data.total_units_sold}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Units Sold
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ boxShadow: 2, textAlign: "center", borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {data.total_sold_product_count}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Products Sold
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default CardCount;
