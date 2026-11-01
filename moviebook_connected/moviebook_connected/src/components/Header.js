
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  // LOAD LOGGED-IN USER
  const loadUser = () => {
    try {
      const data = localStorage.getItem("loggedInUser");

      if (data) {
        setUser(JSON.parse(data));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("User loading error:", error);
      setUser(null);
    }
  };

  // LOGIN / LOGOUT EVENTS
  useEffect(() => {
    loadUser();

    window.addEventListener("userLogin", loadUser);
    window.addEventListener("userLogout", loadUser);

    return () => {
      window.removeEventListener("userLogin", loadUser);
      window.removeEventListener("userLogout", loadUser);
    };
  }, []);

  // SYNC SEARCH WITH URL
  useEffect(() => {
    const currentPage = location.pathname.toLowerCase();
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";

    if (currentPage === "/movies" || currentPage === "/theatres") {
      setSearch(query);
    } else {
      setSearch("");
    }
  }, [location.pathname, location.search]);

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");

    window.dispatchEvent(new Event("userLogout"));

    navigate("/");
  };

  // ACTIVE PAGE
  const isActive = (path) => {
    return location.pathname.toLowerCase() === path.toLowerCase();
  };

  // SEARCH SUBMIT
  const handleSearch = (e) => {
    e.preventDefault();

    const searchText = search.trim();
    const currentPage = location.pathname.toLowerCase();

    if (!searchText) {
      if (currentPage === "/theatres") {
        navigate("/Theatres", { replace: true });
      } else {
        navigate("/Movies", { replace: true });
      }
      return;
    }

    if (currentPage === "/theatres") {
      navigate(`/Theatres?search=${encodeURIComponent(searchText)}`);
    } else {
      navigate(`/Movies?search=${encodeURIComponent(searchText)}`);
    }
  };

  // SEARCH INPUT CHANGE
  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearch(value);

    if (value.trim() === "") {
      const currentPage = location.pathname.toLowerCase();

      if (currentPage === "/theatres") {
        navigate("/Theatres", { replace: true });
      } else if (currentPage === "/movies") {
        navigate("/Movies", { replace: true });
      }
    }
  };

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        .moviebook-header {
          width: 100%;
          height: 58px;
          padding: 0 22px;
          background: #06162d;
          display: flex;
          align-items: center;
          gap: 28px;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .moviebook-logo {
          color: white;
          text-decoration: none;
          font-size: 21px;
          font-weight: 800;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .moviebook-logo:hover {
          color: white;
        }

        .moviebook-nav {
          display: flex;
          align-items: center;
          height: 100%;
          gap: 4px;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
        }

        .moviebook-nav-link {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 13px;
          color: #dce5f1;
          background: transparent;
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          transition: 0.2s ease;
        }

        .moviebook-nav-link:hover {
          color: white;
        }

        .moviebook-nav-link.active {
          color: white;
        }

        .moviebook-nav-link.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 12px;
          right: 12px;
          height: 3px;
          background: #0ea5ff;
          border-radius: 5px 5px 0 0;
        }

        .moviebook-search {
          display: flex;
          align-items: center;
          flex-shrink: 1;
          min-width: 130px;
          max-width: 230px;
          height: 34px;
          margin-left: auto;
          background: white;
          border-radius: 5px;
          overflow: hidden;
        }

        .moviebook-search input {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          padding: 0 10px;
          font-size: 11px;
          color: #1f2937;
        }

        .moviebook-search input::placeholder {
          color: #94a3b8;
        }

        .moviebook-search button {
          width: 35px;
          height: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
        }

        .moviebook-login {
          color: white;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 9px;
          white-space: nowrap;
          border-radius: 4px;
          transition: 0.2s;
        }

        .moviebook-login:hover {
          background: rgba(255,255,255,0.10);
          color: white;
        }

        .moviebook-signup {
          color: white;
          background: #1687ff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 13px;
          border-radius: 4px;
          white-space: nowrap;
          transition: 0.2s;
        }

        .moviebook-signup:hover {
          background: #006fe6;
          color: white;
        }

        .moviebook-admin {
          color: white;
          background: #7c3aed;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 10px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .moviebook-admin:hover {
          background: #6d28d9;
          color: white;
        }

        .moviebook-admin.active {
          background: #8b5cf6;
        }

        .moviebook-user {
          color: white;
          background: rgba(255,255,255,0.08);
          font-size: 12px;
          font-weight: 600;
          padding: 7px 9px;
          border-radius: 4px;
          white-space: nowrap;
        }

        /* PROFILE BUTTON */

        .moviebook-profile {
          color: white;
          background: #087ff5;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 11px;
          border-radius: 4px;
          white-space: nowrap;
          transition: 0.2s;
        }

        .moviebook-profile:hover {
          background: #006bd6;
          color: white;
        }

        .moviebook-profile.active {
          background: #006bd6;
        }

        .moviebook-logout {
          border: none;
          color: white;
          background: #ef4444;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 11px;
          border-radius: 4px;
          white-space: nowrap;
          cursor: pointer;
        }

        .moviebook-logout:hover {
          background: #dc2626;
        }

        @media (max-width: 900px) {
          .moviebook-header {
            padding: 0 14px;
            gap: 12px;
          }

          .moviebook-logo {
            font-size: 19px;
          }

          .moviebook-nav-link {
            padding: 0 8px;
            font-size: 11px;
          }

          .moviebook-search {
            max-width: 170px;
          }
        }

        @media (max-width: 650px) {
          .moviebook-header {
            overflow-x: auto;
            overflow-y: hidden;
          }

          .moviebook-search {
            min-width: 150px;
          }
        }

      `}</style>

      <header className="moviebook-header">

        <Link to="/" className="moviebook-logo">
          MovieBook
        </Link>

        <nav className="moviebook-nav">

          <Link
            to="/"
            className={`moviebook-nav-link ${isActive("/") ? "active" : ""}`}
          >
            Home
          </Link>

          <Link
            to="/Movies"
            className={`moviebook-nav-link ${isActive("/Movies") ? "active" : ""}`}
          >
            Movies
          </Link>

          <Link
            to="/Theatres"
            className={`moviebook-nav-link ${isActive("/Theatres") ? "active" : ""}`}
          >
            Theatres
          </Link>

          <form
            className="moviebook-search"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search movies, theatres..."
              value={search}
              onChange={handleSearchChange}
            />

            <button type="submit">🔍</button>
          </form>

          {!user && (
            <>
              <Link to="/Login" className="moviebook-login">
                🔑 Login
              </Link>

              <Link to="/Signup" className="moviebook-signup">
                Sign Up
              </Link>
            </>
          )}

          {user && (
            <>
              {user.role === "admin" && (
                <Link
                  to="/AdminPanel"
                  className={`moviebook-admin ${isActive("/AdminPanel") ? "active" : ""}`}
                >
                  Admin
                </Link>
              )}

              <Link
                to="/profile"
                className={`moviebook-profile ${isActive("/profile") ? "active" : ""}`}
              >
                👤 My Profile
              </Link>

              <span className="moviebook-user">
                {user.name || "User"}
              </span>

              <button
                type="button"
                className="moviebook-logout"
                onClick={logout}
              >
                Logout
              </button>
            </>
          )}

        </nav>
      </header>
    </>
  );
};

export default Header;
