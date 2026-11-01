import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getUsers,
  deleteUser as deleteUserApi,
  getMovies,
  addMovie,
  updateMovie as updateMovieApi,
  deleteMovie as deleteMovieApi,
  getBookings,
  askAdminOrderQuestion,
} from "../api";

const AdminPanel = () => {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [dateRange, setDateRange] = useState("month");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Ask about MovieBook orders, movies, theatres, users, payments, or site features. Answers use current database records.",
    },
  ]);

  const [editingMovie, setEditingMovie] = useState(null);

  const [movieForm, setMovieForm] = useState({
    title: "",
    genre: "",
    rating: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const [pendingDeleteMovie, setPendingDeleteMovie] = useState(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);

  const showPopup = (type, title, message) => {
    setPopup({ show: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  const submitAdminChat = async (eventOrQuestion) => {
    let question;

    if (typeof eventOrQuestion === "string") {
      question = eventOrQuestion.trim();
    } else {
      eventOrQuestion.preventDefault();
      question = chatInput.trim();
    }

    if (!question || chatLoading) return;

    setChatInput("");
    setChatMessages((current) => [
      ...current,
      { role: "user", text: question },
    ].slice(-20));
    setChatLoading(true);

    try {
      const response = await askAdminOrderQuestion(question);
      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: response.reply || "No response was returned.",
        },
      ].slice(-20));
    } catch (error) {
      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: error.message || "Unable to retrieve order data.",
        },
      ].slice(-20));
    } finally {
      setChatLoading(false);
    }
  };

  // LOAD ADMIN DATA
  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("loggedInUser") || "null"
    );

    if (!user || user.role !== "admin") {
      navigate("/Login");
      return;
    }

    const load = async () => {
      try {
        const [usersData, moviesData, bookingsData] =
          await Promise.all([
            getUsers(),
            getMovies(),
            getBookings(),
          ]);

        setUsers(usersData.users || []);
        setMovies(moviesData.movies || []);
        setBookings(bookingsData.bookings || []);
      } catch (error) {
        console.error("Admin data loading failed:", error);
        showPopup("error", "Load Failed", error.message);
      }
    };

    load();
  }, [navigate]);

  // MOVIE FORM CHANGE
  const handleMovieChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files && files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showPopup(
          "error",
          "Invalid Image",
          "Please select a valid image file."
        );
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showPopup(
          "error",
          "Image Too Large",
          "Please select an image smaller than 5 MB."
        );
        e.target.value = "";
        return;
      }

      setMovieForm((current) => ({
        ...current,
        image: file,
      }));

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      return;
    }

    setMovieForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // RESET MOVIE FORM
  const resetMovieForm = () => {
    setEditingMovie(null);

    setMovieForm({
      title: "",
      genre: "",
      rating: "",
      image: null,
    });

    setImagePreview("");
  };

  // ADD / UPDATE MOVIE
  const saveMovie = async (e) => {
    e.preventDefault();

    const title = movieForm.title.trim();
    const genre = movieForm.genre.trim();
    const rating = Number(movieForm.rating);

    if (!title) {
      showPopup("error", "Title Required", "Please enter movie title.");
      return;
    }

    if (!genre) {
      showPopup("error", "Genre Required", "Please enter movie genre.");
      return;
    }

    if (!movieForm.rating) {
      showPopup("error", "Rating Required", "Please enter movie rating.");
      return;
    }

    if (rating < 0 || rating > 10) {
      showPopup(
        "error",
        "Invalid Rating",
        "Rating must be between 0 and 10."
      );
      return;
    }

    if (!editingMovie && !movieForm.image) {
      showPopup(
        "error",
        "Image Required",
        "Please select a movie image."
      );
      return;
    }

    try {
      let data;

      if (editingMovie) {
        data = await updateMovieApi(editingMovie._id, {
          title,
          genre,
          rating,
          image: movieForm.image,
        });

        setMovies((current) =>
          current.map((movie) =>
            movie._id === editingMovie._id ? data.movie : movie
          )
        );

        showPopup(
          "success",
          "Movie Updated",
          `${title} has been updated successfully.`
        );
      } else {
        data = await addMovie({
          title,
          genre,
          rating,
          image: movieForm.image,
        });

        setMovies((current) => [data.movie, ...current]);

        showPopup(
          "success",
          "Movie Added",
          `${title} has been added successfully.`
        );
      }

      resetMovieForm();
    } catch (error) {
      console.error("Movie save failed:", error);
      showPopup("error", "Movie Save Failed", error.message);
    }
  };

  // EDIT MOVIE
  const editMovie = (movie) => {
    setEditingMovie(movie);

    setMovieForm({
      title: movie.title || "",
      genre: movie.genre || "",
      rating: movie.rating || "",
      image: null,
    });

    setImagePreview(movie.image || "");
    setActivePage("movies");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE MOVIE
  const deleteMovie = (movie) => {
    if (!movie) return;
    setPendingDeleteMovie(movie);
  };

  const cancelDeleteMovie = () => {
    setPendingDeleteMovie(null);
  };

  const confirmDeleteMovie = async () => {
    if (!pendingDeleteMovie) return;

    const movie = pendingDeleteMovie;
    setPendingDeleteMovie(null);

    try {
      await deleteMovieApi(movie._id);

      setMovies((current) =>
        current.filter((item) => item._id !== movie._id)
      );

      showPopup(
        "success",
        "Movie Deleted",
        `${movie.title} has been deleted successfully.`
      );
    } catch (error) {
      showPopup("error", "Delete Failed", error.message);
    }
  };

  // DELETE USER
  const deleteUser = (user) => {
    if (!user) return;
    setPendingDeleteUser(user);
  };

  const cancelDeleteUser = () => {
    setPendingDeleteUser(null);
  };

  const confirmDeleteUser = async () => {
    if (!pendingDeleteUser) return;

    const user = pendingDeleteUser;
    setPendingDeleteUser(null);

    try {
      await deleteUserApi(user._id);

      setUsers((current) =>
        current.filter((item) => item._id !== user._id)
      );

      showPopup(
        "success",
        "User Deleted",
        `${user.name || user.email || "User"} has been deleted successfully.`
      );
    } catch (error) {
      showPopup("error", "Delete Failed", error.message);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");

    window.dispatchEvent(new Event("userLogout"));
    navigate("/Login");
  };

  const getBookingTimestamp = (booking) =>
    new Date(
      booking?.createdAt || booking?.paymentDate || booking?.date || 0
    ).getTime();

  const now = new Date();
  let rangeStart;
  let rangeEnd;

  if (dateRange === "today") {
    rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (dateRange === "week") {
    const daysSinceMonday = (now.getDay() + 6) % 7;
    rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
    rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 7);
  } else if (dateRange === "lastMonth") {
    rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    rangeEnd = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (dateRange === "year") {
    rangeStart = new Date(now.getFullYear(), 0, 1);
    rangeEnd = new Date(now.getFullYear() + 1, 0, 1);
  } else {
    rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const filteredBookings = bookings.filter((booking) => {
    if (dateRange === "all") return true;

    const timestamp = getBookingTimestamp(booking);
    return (
      !Number.isNaN(timestamp) &&
      timestamp >= rangeStart.getTime() &&
      timestamp < rangeEnd.getTime()
    );
  });

  // STATISTICS
  const totalRevenue = filteredBookings.reduce(
    (total, booking) =>
      total + Number(booking.totalAmount || 0),
    0
  );

  const totalTickets = filteredBookings.reduce(
    (total, booking) =>
      total + Number(booking.totalSeats || booking.seats?.length || 0),
    0
  );

  const getMovieImage = (movie) =>
    movie?.image ||
    "https://via.placeholder.com/180x250?text=Movie";

  const getGenre = (movie) => movie?.genre || "Unknown";

  // GET POPULATED BOOKING DETAILS
  const getReferenceField = (
    reference,
    field,
    fallback = "Details not populated"
  ) => {
    if (
      reference &&
      typeof reference === "object" &&
      reference[field]
    ) {
      return reference[field];
    }

    return fallback;
  };

  const getBookingUserName = (booking) =>
    getReferenceField(
      booking?.user,
      "name",
      booking?.userName || "Details not populated"
    );

  const getBookingUserEmail = (booking) =>
    getReferenceField(
      booking?.user,
      "email",
      booking?.userEmail || "-"
    );

  const getBookingMovieName = (booking) =>
    getReferenceField(
      booking?.movie,
      "title",
      booking?.movieName || "Details not populated"
    );

  const getBookingTheatreName = (booking) =>
    getReferenceField(
      booking?.theatre,
      "name",
      booking?.theatreName || "Details not populated"
    );

  // LATEST BOOKINGS FIRST
  const sortedBookings = [...bookings].sort(
    (a, b) => getBookingTimestamp(b) - getBookingTimestamp(a)
  );
  const sortedFilteredBookings = [...filteredBookings].sort(
    (a, b) => getBookingTimestamp(b) - getBookingTimestamp(a)
  );

  const formatBookingDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString();
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .admin-page {
          min-height: calc(100vh - 70px);
          background: #f4f7fb;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
          padding: 0 0 50px;
        }

        .admin-container {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
          padding: 25px 35px 50px;
        }

        .admin-tabs {
          width: 100%;
          background: #ffffff;
          border: 1px solid #dfe6ef;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px;
          margin-bottom: 22px;
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
          overflow-x: auto;
        }

        .admin-tab {
          border: none;
          background: transparent;
          color: #526174;
          padding: 11px 20px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: .2s;
        }

        .admin-tab:hover {
          background: #edf5ff;
          color: #087df0;
        }

        .admin-tab.active {
          background: #087df0;
          color: white;
          box-shadow: 0 3px 8px rgba(8,125,240,.2);
        }

        .admin-tab.logout {
          margin-left: auto;
          color: #e04b4b;
        }

        .admin-tab.logout:hover {
          background: #fff0f0;
          color: #d93030;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 22px;
          color: #101a2c;
          font-weight: 700;
        }

        .page-header p {
          margin: 4px 0 0;
          color: #7a8798;
          font-size: 12px;
        }

        .month-select {
          border: 1px solid #d5deea;
          background: white;
          padding: 8px 12px;
          border-radius: 5px;
          font-size: 11px;
          color: #445268;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          background: white;
          border: 1px solid #dce4ee;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 22px;
        }

        .overview-card {
          min-height: 82px;
          padding: 13px 15px;
          border-right: 1px solid #e2e7ef;
          position: relative;
        }

        .overview-card:last-child {
          border-right: none;
        }

        .overview-card .number {
          font-size: 19px;
          font-weight: 700;
          color: #172033;
          margin: 0 0 5px;
        }

        .overview-card .label {
          font-size: 10px;
          color: #728095;
          margin: 0 0 6px;
        }

        .overview-card .trend {
          font-size: 9px;
          color: #16a05d;
          font-weight: bold;
        }

        .section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 16px;
          color: #162137;
        }

        .section-title span {
          color: #087df0;
          font-size: 11px;
          font-weight: bold;
        }

        .movie-schedule-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .schedule-card {
          background: white;
          border: 1px solid #dce4ed;
          border-radius: 6px;
          padding: 10px;
          display: flex;
          gap: 10px;
          min-height: 190px;
          transition: .2s;
        }

        .schedule-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(20,40,70,.08);
          border-color: #9bc7f4;
        }

        .schedule-poster {
          width: 92px;
          height: 132px;
          object-fit: cover;
          border-radius: 4px;
          background: #edf1f5;
          flex-shrink: 0;
        }

        .schedule-info {
          flex: 1;
          min-width: 0;
        }

        .status-badge {
          display: inline-block;
          padding: 3px 6px;
          border: 1px solid #087df0;
          border-radius: 3px;
          color: #087df0;
          background: #f3f9ff;
          font-size: 8px;
          font-weight: bold;
          margin-bottom: 7px;
        }

        .schedule-info h3 {
          margin: 0 0 6px;
          font-size: 12px;
          line-height: 1.3;
          color: #182238;
        }

        .schedule-info p {
          margin: 4px 0;
          color: #718096;
          font-size: 9px;
        }

        .schedule-rating {
          color: #f0a800 !important;
          font-weight: bold;
        }

        .schedule-button {
          margin-top: 8px;
          border: none;
          background: #087df0;
          color: white;
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 9px;
          font-weight: bold;
          cursor: pointer;
        }

        .schedule-button:hover {
          background: #0669ca;
        }

        .content-box {
          background: white;
          border: 1px solid #dce4ee;
          border-radius: 7px;
          padding: 20px;
          margin-bottom: 18px;
          box-shadow: 0 2px 8px rgba(20,40,70,.03);
        }

        .content-box h2 {
          margin: 0 0 18px;
          color: #172033;
          font-size: 17px;
        }

        .movie-form {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .movie-form input {
          width: 100%;
          padding: 11px 13px;
          border: 1px solid #ccd6e3;
          border-radius: 5px;
          outline: none;
          font-size: 12px;
          color: #172033;
          background: white;
        }

        .movie-form input:focus {
          border-color: #087df0;
          box-shadow: 0 0 0 2px rgba(8,125,240,.08);
        }

        .image-upload-box {
          border: 1px dashed #b8c8da;
          border-radius: 6px;
          padding: 12px;
          background: #f9fbfd;
        }

        .image-upload-box label {
          display: block;
          font-size: 11px;
          font-weight: bold;
          color: #526174;
          margin-bottom: 8px;
        }

        .image-upload-box input[type="file"] {
          padding: 8px;
          background: white;
          cursor: pointer;
        }

        .image-preview-box {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .image-preview {
          width: 75px;
          height: 100px;
          object-fit: cover;
          border-radius: 5px;
          border: 1px solid #dce4ee;
          background: #edf1f5;
        }

        .image-preview-text {
          font-size: 10px;
          color: #728095;
          word-break: break-word;
        }

        .form-buttons {
          grid-column: 1 / -1;
          display: flex;
          gap: 8px;
        }

        .primary-btn,
        .secondary-btn {
          border: none;
          border-radius: 5px;
          padding: 10px 18px;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
        }

        .primary-btn {
          background: #087df0;
          color: white;
        }

        .primary-btn:hover {
          background: #0669ca;
        }

        .secondary-btn {
          background: #e9eef5;
          color: #3d4b5e;
        }

        .movies-admin-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .admin-movie-card {
          background: white;
          border: 1px solid #dce4ee;
          border-radius: 7px;
          overflow: hidden;
          transition: .2s;
        }

        .admin-movie-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 16px rgba(20,40,70,.08);
        }

        .admin-movie-image {
          width: 100%;
          height: 230px;
          object-fit: cover;
          display: block;
          background: #edf1f5;
        }

        .admin-movie-content {
          padding: 11px;
        }

        .admin-movie-content h3 {
          margin: 0 0 5px;
          font-size: 13px;
          color: #182238;
        }

        .admin-movie-content p {
          margin: 4px 0;
          font-size: 10px;
          color: #758196;
        }

        .movie-actions {
          display: flex;
          gap: 7px;
          margin-top: 10px;
        }

        .edit-btn,
        .delete-btn {
          flex: 1;
          padding: 7px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 10px;
          font-weight: bold;
        }

        .edit-btn {
          background: #e7f2ff;
          color: #0871ca;
        }

        .delete-btn {
          background: #ffe9e9;
          color: #d83232;
        }

        .edit-btn:hover {
          background: #d7eaff;
        }

        .delete-btn:hover {
          background: #ffdada;
        }

        .user-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .user-card {
          border: 1px solid #dfe6ef;
          border-radius: 6px;
          padding: 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .user-info strong {
          font-size: 12px;
          color: #182238;
        }

        .user-info p {
          margin: 4px 0;
          color: #68778b;
          font-size: 10px;
        }

        .user-info small {
          color: #929dad;
          font-size: 9px;
        }

        .booking-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .booking-card {
          background: white;
          border: 1px solid #dce4ee;
          border-radius: 7px;
          padding: 15px;
          transition: .2s;
        }

        .booking-card:hover {
          border-color: #9bc7f4;
          box-shadow: 0 4px 14px rgba(20,70,120,.07);
        }

        .booking-card h3 {
          margin: 0 0 12px;
          font-size: 12px;
          color: #172033;
        }

        .booking-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5px 15px;
        }

        .booking-details p {
          margin: 3px 0;
          font-size: 10px;
          color: #6c788a;
          overflow-wrap: anywhere;
        }

        .booking-details strong {
          color: #27354a;
        }

        .paid {
          color: #15995a !important;
          font-weight: bold;
        }

        .recent-bookings {
          margin-top: 22px;
        }

        .recent-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .recent-card {
          border: 1px solid #dce4ee;
          border-radius: 6px;
          padding: 12px;
          background: white;
        }

        .recent-card h3 {
          margin: 0 0 8px;
          font-size: 11px;
          color: #172033;
        }

        .recent-card p {
          margin: 5px 0;
          font-size: 9px;
          color: #6f7c8f;
          overflow-wrap: anywhere;
        }

        .empty {
          text-align: center;
          padding: 35px 15px;
          color: #8792a2;
          font-size: 12px;
        }

        .popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 18, 35, .55);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99999;
        }

        .popup {
          width: 90%;
          max-width: 390px;
          background: white;
          padding: 28px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 15px 45px rgba(0,0,0,.25);
          animation: popupShow .2s ease;
        }

        @keyframes popupShow {
          from {
            transform: scale(.92);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .popup-icon {
          width: 58px;
          height: 58px;
          margin: auto;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 30px;
          font-weight: bold;
        }

        .popup-success {
          background: #22a05a;
        }

        .popup-error {
          background: #e44848;
        }

        .popup h2 {
          margin: 15px 0 7px;
          color: #172033;
          font-size: 18px;
        }

        .popup p {
          color: #687486;
          font-size: 12px;
        }

        .popup button {
          margin-top: 10px;
          padding: 9px 25px;
          border: none;
          border-radius: 5px;
          background: #087df0;
          color: white;
          cursor: pointer;
          font-weight: bold;
        }

        .admin-chat-widget {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 9000;
        }

        .admin-chat-launcher {
          border: 0;
          border-radius: 24px;
          padding: 12px 17px;
          background: #087df0;
          color: white;
          box-shadow: 0 6px 20px rgba(8, 70, 130, .25);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .admin-chat-panel {
          width: min(390px, calc(100vw - 28px));
          height: min(570px, calc(100vh - 100px));
          min-height: 360px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #f7f9fc;
          border: 1px solid #d5deea;
          border-radius: 10px;
          box-shadow: 0 15px 40px rgba(18, 35, 56, .22);
        }

        .admin-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: #123b56;
          color: white;
        }

        .admin-chat-header strong {
          font-size: 14px;
        }

        .admin-chat-header small {
          display: block;
          margin-top: 3px;
          color: #c8dce8;
          font-size: 10px;
        }

        .admin-chat-close {
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 5px;
          background: transparent;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }

        .admin-chat-messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 9px;
          padding: 14px;
        }

        .admin-chat-message {
          max-width: 92%;
          padding: 10px 12px;
          border: 1px solid #e0e6ee;
          border-radius: 8px;
          background: white;
          color: #243247;
          font-size: 12px;
          line-height: 1.5;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .admin-chat-message.user {
          align-self: flex-end;
          border-color: #087df0;
          background: #087df0;
          color: white;
        }

        .admin-chat-suggestions {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding: 0 12px 10px;
        }

        .admin-chat-suggestions button {
          flex: 0 0 auto;
          border: 1px solid #cdd8e5;
          border-radius: 14px;
          padding: 6px 9px;
          background: white;
          color: #42536a;
          font-size: 10px;
          cursor: pointer;
        }

        .admin-chat-form {
          display: flex;
          gap: 7px;
          padding: 10px;
          border-top: 1px solid #e0e6ee;
          background: white;
        }

        .admin-chat-form input {
          flex: 1;
          min-width: 0;
          border: 1px solid #cdd8e5;
          border-radius: 5px;
          padding: 9px 10px;
          font-size: 12px;
        }

        .admin-chat-form button {
          border: 0;
          border-radius: 5px;
          padding: 0 12px;
          background: #087df0;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .admin-chat-form button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        @media (max-width: 1200px) {
          .movie-schedule-grid,
          .movies-admin-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1000px) {
          .overview-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .overview-card:nth-child(3) {
            border-right: none;
          }

          .overview-card:nth-child(4),
          .overview-card:nth-child(5) {
            border-top: 1px solid #e2e7ef;
          }

          .movie-schedule-grid,
          .movies-admin-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .booking-list {
            grid-template-columns: 1fr;
          }

          .recent-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 750px) {
          .admin-container {
            padding: 18px 15px 40px;
          }

          .admin-tabs {
            margin-bottom: 18px;
          }

          .admin-tab {
            padding: 10px 13px;
            font-size: 11px;
          }

          .page-header {
            align-items: flex-start;
            gap: 10px;
            flex-direction: column;
          }

          .overview-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .overview-card {
            border-right: 1px solid #e2e7ef;
            border-bottom: 1px solid #e2e7ef;
          }

          .movie-schedule-grid {
            grid-template-columns: 1fr;
          }

          .movies-admin-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .movie-form {
            grid-template-columns: 1fr;
          }

          .form-buttons {
            grid-column: auto;
          }

          .user-list {
            grid-template-columns: 1fr;
          }

          .recent-list {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 500px) {
          .overview-grid,
          .movies-admin-grid {
            grid-template-columns: 1fr;
          }

          .overview-card {
            border-right: none;
          }

          .schedule-card {
            min-height: 170px;
          }

          .schedule-poster {
            width: 85px;
            height: 120px;
          }

          .booking-details {
            grid-template-columns: 1fr;
          }

          .user-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .user-card .delete-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="admin-page">
        <div className="admin-container">

          {/* ADMIN NAVIGATION */}
          <div className="admin-tabs">
            <button
              className={`admin-tab ${
                activePage === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActivePage("dashboard")}
            >
              📊 Dashboard
            </button>

            <button
              className={`admin-tab ${
                activePage === "movies" ? "active" : ""
              }`}
              onClick={() => setActivePage("movies")}
            >
              🎬 Movies
            </button>

            <button
              className={`admin-tab ${
                activePage === "users" ? "active" : ""
              }`}
              onClick={() => setActivePage("users")}
            >
              👥 Users
            </button>

            <button
              className={`admin-tab ${
                activePage === "bookings" ? "active" : ""
              }`}
              onClick={() => setActivePage("bookings")}
            >
              🎟️ Transactions
            </button>

            <button
              className={`admin-tab ${
                activePage === "payments" ? "active" : ""
              }`}
              onClick={() => setActivePage("payments")}
            >
              💳 Payments
            </button>

            <button className="admin-tab logout" onClick={logout}>
              Logout
            </button>
          </div>

          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <>
              <div className="page-header">
                <div>
                  <h1>Overview</h1>
                  <p>MovieBook administration dashboard</p>
                </div>

                <select
                  className="month-select"
                  value={dateRange}
                  onChange={(event) => setDateRange(event.target.value)}
                  aria-label="Dashboard date range"
                >
                  <option value="all">Total Data</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              <div className="overview-grid">
                <div className="overview-card">
                  <p className="number">{totalTickets}</p>
                  <p className="label">Ticket Sold</p>
                  <span className="trend">+2.7% vs Last Month</span>
                </div>

                <div className="overview-card">
                  <p className="number">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="label">Total Sales</p>
                  <span className="trend">+7.3% vs Last Month</span>
                </div>

                <div className="overview-card">
                  <p className="number">{filteredBookings.length}</p>
                  <p className="label">Online Ticket Order</p>
                  <span className="trend">+12.0% vs Last Month</span>
                </div>

                <div className="overview-card">
                  <p className="number">{filteredBookings.length}</p>
                  <p className="label">Total Bookings</p>
                  <span className="trend">+5.2%</span>
                </div>

                <div className="overview-card">
                  <p className="number">{users.length}</p>
                  <p className="label">Registered Users</p>
                  <span className="trend">+3.0%</span>
                </div>
              </div>

              <div className="section-title">
                <h2>All Movie Schedule</h2>
                <span>{movies.length} Movies</span>
              </div>

              {movies.length === 0 ? (
                <div className="content-box empty">
                  No movies added yet.
                </div>
              ) : (
                <div className="movie-schedule-grid">
                  {movies.map((movie) => (
                    <div className="schedule-card" key={movie._id}>
                      <img
                        src={getMovieImage(movie)}
                        alt={movie.title}
                        className="schedule-poster"
                      />

                      <div className="schedule-info">
                        <span className="status-badge">
                          Now Playing
                        </span>

                        <h3>{movie.title}</h3>
                        <p>🎬 Movie</p>

                        <p className="schedule-rating">
                          ⭐ {movie.rating || "-"}
                        </p>

                        <p>{getGenre(movie)}</p>

                        <button
                          className="schedule-button"
                          onClick={() => editMovie(movie)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RECENT BOOKINGS */}
              <div className="recent-bookings">
                <div className="section-title">
                  <h2>Recent Transactions</h2>

                  <span
                    onClick={() => setActivePage("bookings")}
                    style={{ cursor: "pointer" }}
                  >
                    View All
                  </span>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="content-box empty">
                    {bookings.length === 0
                      ? "No bookings yet."
                      : "No bookings in this period."}
                  </div>
                ) : (
                  <div className="recent-list">
                    {sortedFilteredBookings.slice(0, 3).map((booking) => (
                      <div
                        className="recent-card"
                        key={booking._id}
                      >
                        <h3>
                          🎟️ {booking.bookingId || booking._id}
                        </h3>

                        <p>
                          User: {getBookingUserName(booking)}
                        </p>

                        <p>
                          Movie: {getBookingMovieName(booking)}
                        </p>

                        <p>
                          Theatre: {getBookingTheatreName(booking)}
                        </p>

                        <p>
                          Amount: ₹
                          {Number(
                            booking.totalAmount || 0
                          ).toLocaleString("en-IN")}
                        </p>

                        <p>
                          Date: {booking.date || "-"}
                        </p>

                        <p>
                          Time: {booking.time || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* MOVIES PAGE */}
          {activePage === "movies" && (
            <>
              <div className="page-header">
                <div>
                  <h1>Movies</h1>
                  <p>Manage your MovieBook movies</p>
                </div>
              </div>

              <div className="content-box">
                <h2>
                  {editingMovie ? "Update Movie" : "Add Movie"}
                </h2>

                <form className="movie-form" onSubmit={saveMovie}>
                  <input
                    name="title"
                    placeholder="Movie Title"
                    value={movieForm.title}
                    onChange={handleMovieChange}
                  />

                  <input
                    name="genre"
                    placeholder="Genre"
                    value={movieForm.genre}
                    onChange={handleMovieChange}
                  />

                  <input
                    name="rating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Rating (0-10)"
                    value={movieForm.rating}
                    onChange={handleMovieChange}
                  />

                  <div className="image-upload-box">
                    <label>Movie Image</label>

                    <input
                      type="file"
                      name="image"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleMovieChange}
                    />

                    {imagePreview && (
                      <div className="image-preview-box">
                        <img
                          src={imagePreview}
                          alt="Movie Preview"
                          className="image-preview"
                        />

                        <div className="image-preview-text">
                          {movieForm.image
                            ? movieForm.image.name
                            : "Current movie image"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="primary-btn">
                      {editingMovie ? "Update Movie" : "Add Movie"}
                    </button>

                    {editingMovie && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={resetMovieForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="section-title">
                <h2>All Movies</h2>
                <span>{movies.length} Movies</span>
              </div>

              {movies.length === 0 ? (
                <div className="content-box empty">
                  No movies added yet.
                </div>
              ) : (
                <div className="movies-admin-grid">
                  {movies.map((movie) => (
                    <div
                      className="admin-movie-card"
                      key={movie._id}
                    >
                      <img
                        src={getMovieImage(movie)}
                        alt={movie.title}
                        className="admin-movie-image"
                      />

                      <div className="admin-movie-content">
                        <h3>{movie.title}</h3>
                        <p>{movie.genre}</p>
                        <p>⭐ {movie.rating}</p>

                        <div className="movie-actions">
                          <button
                            className="edit-btn"
                            onClick={() => editMovie(movie)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => deleteMovie(movie)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* USERS PAGE */}
          {activePage === "users" && (
            <>
              <div className="page-header">
                <div>
                  <h1>Users</h1>
                  <p>Registered MovieBook users</p>
                </div>
              </div>

              <div className="content-box">
                <h2>Registered Users ({users.length})</h2>

                {users.length === 0 ? (
                  <div className="empty">
                    No registered users.
                  </div>
                ) : (
                  <div className="user-list">
                    {users.map((user) => (
                      <div className="user-card" key={user._id}>
                        <div className="user-info">
                          <strong>👤 {user.name}</strong>
                          <p>{user.email}</p>

                          <small>
                            Registered: {user.registeredAt || "-"}
                          </small>
                        </div>

                        <button
                          className="delete-btn"
                          onClick={() => deleteUser(user)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* BOOKINGS PAGE */}
          {activePage === "bookings" && (
            <>
              <div className="page-header">
                <div>
                  <h1>Transactions</h1>
                  <p>All movie ticket bookings</p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="content-box empty">
                  No bookings yet.
                </div>
              ) : (
                <div className="booking-list">
                  {sortedBookings.map((booking) => (
                    <div
                      className="booking-card"
                      key={booking._id}
                    >
                      <h3>
                        🎟️ Booking ID:{" "}
                        {booking.bookingId || booking._id}
                      </h3>

                      <div className="booking-details">
                        <p>
                          <strong>User:</strong>{" "}
                          {getBookingUserName(booking)}
                        </p>

                        <p>
                          <strong>Email:</strong>{" "}
                          {getBookingUserEmail(booking)}
                        </p>

                        <p>
                          <strong>Movie:</strong>{" "}
                          {getBookingMovieName(booking)}
                        </p>

                        <p>
                          <strong>Theatre:</strong>{" "}
                          {getBookingTheatreName(booking)}
                        </p>

                        <p>
                          <strong>Date:</strong>{" "}
                          {booking.date || "-"}
                        </p>

                        <p>
                          <strong>Time:</strong>{" "}
                          {booking.time || "-"}
                        </p>

                        <p>
                          <strong>Regular:</strong>{" "}
                          {booking.regularCount ??
                            booking.regular ??
                            0}
                        </p>

                        <p>
                          <strong>Premium:</strong>{" "}
                          {booking.premiumCount ??
                            booking.premium ??
                            0}
                        </p>

                        <p>
                          <strong>VIP:</strong>{" "}
                          {booking.vipCount ?? booking.vip ?? 0}
                        </p>

                        <p>
                          <strong>Total Tickets:</strong>{" "}
                          {booking.totalSeats ??
                            booking.seats?.length ??
                            0}
                        </p>

                        <p>
                          <strong>Seat Numbers:</strong>{" "}
                          {Array.isArray(booking.seats) &&
                          booking.seats.length
                            ? booking.seats.join(", ")
                            : "-"}
                        </p>

                        <p>
                          <strong>Amount:</strong> ₹
                          {Number(
                            booking.totalAmount || 0
                          ).toLocaleString("en-IN")}
                        </p>

                        <p className="paid">
                          <strong>Payment:</strong>{" "}
                          {booking.paymentStatus || "Pending"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* PAYMENTS PAGE */}
          {activePage === "payments" && (
            <>
              <div className="page-header">
                <div>
                  <h1>Payments</h1>
                  <p>Payment transaction records</p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="content-box empty">
                  No payment records.
                </div>
              ) : (
                <div className="booking-list">
                  {sortedBookings.map((booking) => (
                    <div
                      className="booking-card"
                      key={booking._id}
                    >
                      <h3>
                        💳 {booking.bookingId || booking._id}
                      </h3>

                      <div className="booking-details">
                        <p>
                          <strong>User:</strong>{" "}
                          {getBookingUserName(booking)}
                        </p>

                        <p>
                          <strong>Movie:</strong>{" "}
                          {getBookingMovieName(booking)}
                        </p>

                        <p>
                          <strong>Theatre:</strong>{" "}
                          {getBookingTheatreName(booking)}
                        </p>

                        <p>
                          <strong>Amount:</strong> ₹
                          {Number(
                            booking.totalAmount || 0
                          ).toLocaleString("en-IN")}
                        </p>

                        <p>
                          <strong>Method:</strong>{" "}
                          {booking.paymentMethod || "-"}
                        </p>

                        <p className="paid">
                          <strong>Status:</strong>{" "}
                          {booking.paymentStatus || "Pending"}
                        </p>

                        <p>
                          <strong>Payment Date:</strong>{" "}
                          {formatBookingDate(
                            booking.paymentDate ||
                            booking.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="admin-chat-widget">
        {chatOpen ? (
          <section className="admin-chat-panel" aria-label="Admin order assistant">
            <header className="admin-chat-header">
              <div>
                <strong>Order Assistant</strong>
                <small>Answers from booking records</small>
              </div>
              <button
                type="button"
                className="admin-chat-close"
                onClick={() => setChatOpen(false)}
                aria-label="Close order assistant"
              >
                ×
              </button>
            </header>

            <div className="admin-chat-messages" aria-live="polite">
              {chatMessages.map((message, index) => (
                <div
                  className={`admin-chat-message ${message.role}`}
                  key={`${message.role}-${index}`}
                >
                  {message.text}
                </div>
              ))}
              {chatLoading && (
                <div className="admin-chat-message assistant" role="status">
                  Checking booking records...
                </div>
              )}
            </div>

            <div className="admin-chat-suggestions">
              <button type="button" disabled={chatLoading} onClick={() => submitAdminChat("Show today's total orders and details")}>Today</button>
              <button type="button" disabled={chatLoading} onClick={() => submitAdminChat("Show this week's order summary")}>This week</button>
              <button type="button" disabled={chatLoading} onClick={() => submitAdminChat("Show all-time order totals")}>All time</button>
              <button type="button" disabled={chatLoading} onClick={() => submitAdminChat("How many movies and theatres are listed?")}>Catalog</button>
              <button type="button" disabled={chatLoading} onClick={() => submitAdminChat("What can MovieBook users do on this site?")}>Site features</button>
            </div>

            <form className="admin-chat-form" onSubmit={submitAdminChat}>
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about orders..."
                aria-label="Ask about orders"
                disabled={chatLoading}
              />
              <button type="submit" disabled={chatLoading || !chatInput.trim()}>
                Send
              </button>
            </form>
          </section>
        ) : (
          <button
            type="button"
            className="admin-chat-launcher"
            onClick={() => setChatOpen(true)}
          >
            Order Assistant
          </button>
        )}
      </div>

      {/* MOVIE DELETE CONFIRMATION POPUP */}
      {pendingDeleteMovie && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-icon popup-error">!</div>

            <h2>Confirm Delete</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>"{pendingDeleteMovie.title}"</strong>?
              This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <button
                type="button"
                onClick={cancelDeleteMovie}
                style={{
                  background: "#e9eef5",
                  color: "#3d4b5e",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteMovie}
                style={{
                  background: "#e44848",
                  color: "#ffffff",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER DELETE CONFIRMATION POPUP */}
      {pendingDeleteUser && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-icon popup-error">!</div>

            <h2>Confirm Delete</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                "{pendingDeleteUser.name ||
                  pendingDeleteUser.email ||
                  "this user"}"
              </strong>
              ? This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <button
                type="button"
                onClick={cancelDeleteUser}
                style={{
                  background: "#e9eef5",
                  color: "#3d4b5e",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteUser}
                style={{
                  background: "#e44848",
                  color: "#ffffff",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS / ERROR POPUP */}
      {popup.show && (
        <div className="popup-overlay">
          <div className="popup">
            <div
              className={`popup-icon ${
                popup.type === "success"
                  ? "popup-success"
                  : "popup-error"
              }`}
            >
              {popup.type === "success" ? "✓" : "!"}
            </div>

            <h2>{popup.title}</h2>
            <p>{popup.message}</p>

            <button onClick={closePopup}>OK</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;