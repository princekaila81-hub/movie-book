import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <style>{`
        .footer {
          background: #111827;
          color: white;
          padding: 50px 20px 20px;
          margin-top: 0.3px;
          font-family: Arial, sans-serif;
        }

        .footer-container {
          max-width: 1200px;
          margin: auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 30px;
        }

        .footer-section h2,
        .footer-section h3 {
          color: #fbbf24;
          margin-bottom: 15px;
        }

        .logo {
          font-size: 28px;
          font-weight: bold;
        }

        .footer-section p {
          color: #d1d5db;
          line-height: 1.7;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section ul li {
          margin: 10px 0;
        }

        .footer-section ul li a {
          color: #d1d5db;
          text-decoration: none;
          transition: 0.3s;
        }

        .footer-section ul li a:hover {
          color: #fbbf24;
        }

        /* SOCIAL MEDIA */
        .social-icons {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .social-icons a {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: 0.3s;
        }

        .social-icons img {
          width: 25px;
          height: 25px;
          object-fit: contain;
        }

        .social-icons a:hover {
          transform: translateY(-4px) scale(1.08);
          box-shadow: 0 5px 15px rgba(255, 255, 255, 0.25);
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          text-align: center;
          padding-top: 20px;
          margin-top: 40px;
          color: #9ca3af;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .footer {
            text-align: center;
          }

          .social-icons {
            justify-content: center;
          }
        }
      `}</style>
      <footer className="footer">
        <div className="footer-container">
          {/* BRAND */}
          <div className="footer-section">
            <h2 className="logo">🎬 MovieBook</h2>

            <p>
              Book your favorite movie tickets anytime, anywhere with a fast,
              secure, and seamless experience.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-section">
            <h3>Quick Links</h3>

            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>

              <li>
                <Link to="/Movies">Movies</Link>
              </li>

              <li>
                <Link to="/Offers">Offers</Link>
              </li>

              <li>
                <Link to="/Contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div className="footer-section">
            <h3>Contact</h3>

            <p>Email: support@moviebook.com</p>
            <p>Phone: +91 97278 91960</p>
            <p>Ahmedabad, Gujarat</p>
          </div>

          {/* SOCIAL MEDIA */}
          <div className="footer-section">
            <h3>Follow Us</h3>

            <div className="social-icons">
              {/* FACEBOOK */}
              <Link
                to="/Facebook"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                  alt="Facebook"
                />
              </Link>

              {/* INSTAGRAM */}
              <Link
                to="/Instagram"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                  alt="Instagram"
                />
              </Link>

              {/* TWITTER */}
              <Link
                to="/Twitter"
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
                  alt="Twitter"
                />
              </Link>

              {/* YOUTUBE */}
              <Link
                to="/YouTube"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
                  alt="YouTube"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} MovieBook. All Rights Reserved.
        </div>
      </footer>
    </>
  );
};

export default Footer;
