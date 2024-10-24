import React, { useEffect, useRef } from "react";
import axiosInstance from './axios';
import { useNavigate } from "react-router-dom";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import './SupersetDashboard.css';

const SupersetDashboard = () => {
  const mountPointRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    let guestToken; // Store in memory, avoid localStorage/sessionStorage

    // Disable global scrolling when the dashboard is active
    const disableGlobalScroll = () => {
      document.body.style.overflow = 'hidden';
    };

    // Re-enable global scrolling when the dashboard is removed
    const enableGlobalScroll = () => {
      document.body.style.overflow = 'auto';
    };

    // Call disable scroll on component mount
    disableGlobalScroll();

    const embed = async () => {
      try {
        const response = await axiosInstance.get('get_superset_guest_token/', {
          withCredentials: true,
        });

        let guestToken = response.data.guest_token;
        const expirationTime = 300 * 1000; // 5 minutes in milliseconds

        // Set a timeout to refresh the token before it expires
        const refreshGuestToken = async () => {
          try {
            const newResponse = await axiosInstance.get('get_superset_guest_token/', {
              withCredentials: true,
            });
            guestToken = newResponse.data.guest_token;
            console.log('Refreshed Guest Token:', guestToken);
          } catch (error) {
            console.error('Error refreshing guest token:', error);
          }
        };

        // Refresh token 1 minute before it expires
        const tokenRefreshTimeout = setTimeout(refreshGuestToken, expirationTime - 60000);

        const mountPoint = mountPointRef.current;
        if (!mountPoint) {
          console.error("Mount point is not available.");
          return;
        }

        // Embed the dashboard using the SDK
        await embedDashboard({
          id: process.env.REACT_APP_DASHBOARD_ID,
          supersetDomain: process.env.REACT_APP_SUPERSET_URL,
          mountPoint: mountPoint,
          fetchGuestToken: () => guestToken,
          dashboardUiConfig: {
            hideTitle: true,
          },
        });

      } catch (error) {
        console.error('Error embedding Superset dashboard:', error);
        if (error.response && error.response.status === 401) {
          if (isMounted) navigate('/login');
        }
      }
    };

    embed();

    // Re-enable scroll when the component unmounts
    return () => {
      isMounted = false;
      enableGlobalScroll(); // Restore scroll
    };
  }, [navigate]);

  return (
    <div
      ref={mountPointRef}
      id="superset-container"
    >
    </div>
  );
};

export default React.memo(SupersetDashboard);