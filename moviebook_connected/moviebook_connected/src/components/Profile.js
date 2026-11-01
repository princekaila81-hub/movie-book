
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Profile = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        email: "",
        mobile: "",
        address: "",
        image: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("loggedInUser");

        if (!token || !savedUser) {
            navigate("/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(savedUser);

            setUser({
                name: parsedUser.name || "",
                email: parsedUser.email || "",
                mobile: parsedUser.mobile || "",
                address: parsedUser.address || "",
                image: parsedUser.image || ""
            });
        } catch (err) {
            console.error("User data error:", err);
            navigate("/login");
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setUser((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (
            !user.name.trim() ||
            !user.mobile.trim() ||
            !user.address.trim()
        ) {
            setError("Please fill all fields.");
            return;
        }

        if (!/^[0-9]{10}$/.test(user.mobile.trim())) {
            setError("Mobile number must contain 10 digits.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/users/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: user.name.trim(),
                        mobile: user.mobile.trim(),
                        address: user.address.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Profile update failed"
                );
            }

            const updatedUser = {
                ...user,
                ...data.user
            };

            setUser(updatedUser);

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(updatedUser)
            );

            window.dispatchEvent(new Event("userLogin"));

            setMessage("Profile updated successfully!");

        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-profile-page">

            <div className="mb-profile-container">

                <div className="mb-profile-header">
                    <h1>My Profile</h1>
                    <p>Manage your MovieBook account</p>
                </div>

                <div className="mb-profile-avatar">
                    {user.image ? (
                        <img src={user.image} alt="Profile" />
                    ) : (
                        <div className="mb-profile-placeholder">
                            {user.name
                                ? user.name.charAt(0).toUpperCase()
                                : "U"}
                        </div>
                    )}
                </div>

                <h2 className="mb-profile-name">
                    {user.name || "User"}
                </h2>

                <p className="mb-profile-email">
                    {user.email}
                </p>

                {message && (
                    <div className="mb-profile-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-profile-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="mb-profile-field">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={user.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div className="mb-profile-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={user.email}
                            readOnly
                        />
                    </div>

                    <div className="mb-profile-field">
                        <label>Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={user.mobile}
                            onChange={handleChange}
                            placeholder="Enter mobile number"
                            maxLength="10"
                            required
                        />
                    </div>

                    <div className="mb-profile-field">
                        <label>Address</label>
                        <textarea
                            name="address"
                            value={user.address}
                            onChange={handleChange}
                            placeholder="Enter your address"
                            rows="4"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="mb-profile-save"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        type="button"
                        className="mb-profile-back"
                        onClick={() => navigate("/")}
                    >
                        Back to Home
                    </button>

                </form>
            </div>

            <style>{`
                .mb-profile-page {
                    min-height: 100vh;
                    padding: 50px 20px;
                    background: linear-gradient(
                        135deg, #dcecff, #f7fbff
                    );
                    font-family: Arial, Helvetica, sans-serif;
                    box-sizing: border-box;
                }

                .mb-profile-container {
                    max-width: 550px;
                    margin: auto;
                    padding: 35px;
                    background: #fff;
                    border: 1px solid #e1ecf9;
                    border-radius: 18px;
                    box-shadow: 0 8px 30px rgba(0,80,160,.12);
                }

                .mb-profile-header {
                    text-align: center;
                    margin-bottom: 25px;
                }

                .mb-profile-header h1 {
                    color: #087ff5;
                    margin-bottom: 8px;
                    font-size: 30px;
                }

                .mb-profile-header p,
                .mb-profile-email {
                    color: #718096;
                }

                .mb-profile-avatar {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 15px;
                }

                .mb-profile-avatar img,
                .mb-profile-placeholder {
                    width: 105px;
                    height: 105px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid #dcecff;
                }

                .mb-profile-placeholder {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #087ff5;
                    color: white;
                    font-size: 40px;
                    font-weight: bold;
                }

                .mb-profile-name,
                .mb-profile-email {
                    text-align: center;
                }

                .mb-profile-name {
                    color: #243b53;
                    margin: 8px 0;
                }

                .mb-profile-email {
                    margin-bottom: 28px;
                }

                .mb-profile-field {
                    margin-bottom: 20px;
                }

                .mb-profile-field label {
                    display: block;
                    margin-bottom: 8px;
                    color: #334e68;
                    font-weight: 600;
                }

                .mb-profile-field input,
                .mb-profile-field textarea {
                    width: 100%;
                    padding: 13px 14px;
                    border: 1px solid #d5e2f0;
                    border-radius: 8px;
                    background: #f8fbff;
                    color: #243b53;
                    font-size: 15px;
                    outline: none;
                    box-sizing: border-box;
                }

                .mb-profile-field input:focus,
                .mb-profile-field textarea:focus {
                    border-color: #087ff5;
                    box-shadow: 0 0 0 3px rgba(8,127,245,.1);
                }

                .mb-profile-field input[readonly] {
                    background: #edf3fa;
                    cursor: not-allowed;
                }

                .mb-profile-field textarea {
                    resize: vertical;
                }

                .mb-profile-save,
                .mb-profile-back {
                    width: 100%;
                    padding: 14px;
                    margin-top: 12px;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: .3s;
                }

                .mb-profile-save {
                    background: #087ff5;
                    color: white;
                }

                .mb-profile-save:hover {
                    background: #006bd6;
                }

                .mb-profile-save:disabled {
                    opacity: .6;
                    cursor: not-allowed;
                }

                .mb-profile-back {
                    background: #eaf3ff;
                    color: #087ff5;
                }

                .mb-profile-back:hover {
                    background: #d6e8ff;
                }

                .mb-profile-success,
                .mb-profile-error {
                    padding: 12px;
                    margin-bottom: 18px;
                    border-radius: 8px;
                    text-align: center;
                }

                .mb-profile-success {
                    background: #e5f8ed;
                    color: #168344;
                }

                .mb-profile-error {
                    background: #ffe9e9;
                    color: #d32f2f;
                }

                @media(max-width:600px) {
                    .mb-profile-container {
                        padding: 22px;
                    }

                    .mb-profile-header h1 {
                        font-size: 25px;
                    }
                }
            `}</style>

        </div>
    );
};

export default Profile;
