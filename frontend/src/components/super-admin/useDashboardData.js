// src/components/super-admin/hooks/useDashboardData.js
import { useState, useEffect } from "react";
import { apiRequest } from "../../../api/client"; // Make sure this exists

export default function useDashboardData() {
  const [tableData, setTableData] = useState({
    admins: [],
    staff: [],
    clients: [],
    shipments: [],
  });
  const [stats, setStats] = useState([]);
  const [activity, setActivity] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [
          adminsRes,
          staffRes,
          clientsRes,
          shipmentsRes,
          statsRes,
          activityRes,
          servicesRes
        ] = await Promise.all([
          apiRequest("/admins/"),
          apiRequest("/staff/"),
          apiRequest("/clients/"),
          apiRequest("/shipments/"),
          apiRequest("/dashboard/stats/"),
          apiRequest("/dashboard/activity/"),
          apiRequest("/dashboard/services/")
        ]);

        if (!isMounted) return;

        setTableData({
          admins: adminsRes.results || adminsRes,
          staff: staffRes.results || staffRes,
          clients: clientsRes.results || clientsRes,
          shipments: shipmentsRes.results || shipmentsRes,
        });

        setStats(statsRes.stats || statsRes);
        setActivity(activityRes.activity || activityRes);
        setServices(servicesRes.services || servicesRes);

      } catch (err) {
        if (!isMounted) return;
        setError("Failed to load dashboard data.");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    fetchData();

    const interval = setInterval(fetchData, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { tableData, stats, activity, services, loading, error };
}