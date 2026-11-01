
import React, { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

// Lazy Loading
const Home = lazy(() => import("./components/Home"));
const Movies = lazy(() => import("./components/Movies"));
const MovieDetails = lazy(() => import("./components/MovieDetails"));
const Theatres = lazy(() => import("./components/Theatres"));
const BookNow = lazy(() => import("./components/BookNow"));
const Payment = lazy(() => import("./components/Payment"));
const BookingSuccess = lazy(() => import("./components/BookingSuccess"));
const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/Signup"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const Profile = lazy(() => import("./components/Profile"));

const AppContent = () => {
  const location = useLocation();

  const [loading, setLoading] = useState(true);

  // Show loading for 1 second whenever the route changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Hide Header and Footer
  const hideHeaderFooter =
    location.pathname === "/Login" ||
    location.pathname === "/Signup" ||
    location.pathname === "/AdminPanel";

  return (
    <>
      {!hideHeaderFooter && <Header />}

      {loading ? (
        <div className="page-loader">
          <div className="loader-spinner"></div>
          <p>Loading MovieBook...</p>

          <style>{`
            .page-loader {
              min-height: 75vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background: #f8fafc;
            }

            .loader-spinner {
              width: 50px;
              height: 50px;
              border: 5px solid #e2e8f0;
              border-top: 5px solid #087ff5;
              border-radius: 50%;
              animation: movieSpin 0.8s linear infinite;
            }

            .page-loader p {
              margin-top: 15px;
              color: #087ff5;
              font-size: 16px;
              font-weight: 600;
            }

            @keyframes movieSpin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="page-loader">
              Loading MovieBook...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Movies" element={<Movies />} />
            <Route path="/MovieDetails" element={<MovieDetails />} />
            <Route path="/Theatres" element={<Theatres />} />
            <Route path="/BookNow" element={<BookNow />} />
            <Route path="/Payment" element={<Payment />} />

            <Route
              path="/BookingSuccess"
              element={<BookingSuccess />}
            />

            <Route path="/profile" element={<Profile />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/AdminPanel" element={<AdminPanel />} />
          </Routes>
        </Suspense>
      )}

      {!hideHeaderFooter && <Footer />}
    </>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
