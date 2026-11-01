const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://localhost:5000/api";


// ======================================================
// COMMON API REQUEST
// ======================================================

export async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        localStorage.getItem("token");

    // Check FormData
    const isFormData =
        options.body instanceof FormData;


    const headers = {

        ...(token && {
            Authorization:
                `Bearer ${token}`,
        }),

        ...(options.headers || {})
    };


    // IMPORTANT:
    // FormData ke liye Content-Type manually set mat karo.
    if (!isFormData) {

        headers["Content-Type"] =
            "application/json";
    }


    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );


    let data;


    try {

        data = await response.json();

    } catch {

        data = {};

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Something went wrong"
        );
    }


    return data;
}


// ======================================================
// SIGNUP
// ======================================================

export const signupUser = (
    payload
) =>
    apiRequest(
        "/users/signup",
        {
            method: "POST",

            body:
                JSON.stringify(payload)
        }
    );


// ======================================================
// NORMAL LOGIN
// ======================================================

export const loginUser = (
    payload
) =>
    apiRequest(
        "/users/login",
        {
            method: "POST",

            body:
                JSON.stringify(payload)
        }
    );


// ======================================================
// SEND OTP
// ======================================================

export const sendOTP = (
    email
) =>
    apiRequest(
        "/users/send-otp",
        {
            method: "POST",

            body:
                JSON.stringify({
                    email
                })
        }
    );


// ======================================================
// VERIFY OTP
// ======================================================

export const verifyOTP = (
    email,
    otp
) =>
    apiRequest(
        "/users/verify-otp",
        {
            method: "POST",

            body:
                JSON.stringify({
                    email,
                    otp
                })
        }
    );


export const requestPasswordReset = (email) =>
    apiRequest(
        "/users/password-reset/request",
        {
            method: "POST",
            body: JSON.stringify({ email })
        }
    );


export const verifyPasswordResetOTP = (email, otp) =>
    apiRequest(
        "/users/password-reset/verify-otp",
        {
            method: "POST",
            body: JSON.stringify({ email, otp })
        }
    );


export const resetPassword = (resetToken, password) =>
    apiRequest(
        "/users/password-reset/reset",
        {
            method: "POST",
            body: JSON.stringify({ resetToken, password })
        }
    );


// ======================================================
// USERS
// ======================================================

export const getUsers = () =>
    apiRequest(
        "/users"
    );


export const deleteUser = (
    id
) =>
    apiRequest(
        `/users/${id}`,
        {
            method: "DELETE"
        }
    );


// ======================================================
// MOVIES
// ======================================================

// GET MOVIES

export const getMovies = () =>
    apiRequest(
        "/movies"
    );


// ======================================================
// ADD MOVIE
// CLOUDINARY IMAGE UPLOAD
// ======================================================

export const addMovie = (
    payload
) => {

    const formData =
        new FormData();


    formData.append(
        "title",
        payload.title
    );


    formData.append(
        "genre",
        payload.genre
    );


    formData.append(
        "rating",
        payload.rating || ""
    );


    // Description
    if (payload.description) {

        formData.append(
            "description",
            payload.description
        );
    }


    // Duration
    if (payload.duration) {

        formData.append(
            "duration",
            payload.duration
        );
    }


    // Movie image
    if (
        payload.image &&
        payload.image instanceof File
    ) {

        formData.append(
            "image",
            payload.image
        );

    } else {

        console.error(
            "Movie image file is missing"
        );
    }


    return apiRequest(
        "/movies",
        {
            method: "POST",
            body: formData
        }
    );
};


// ======================================================
// UPDATE MOVIE
// ======================================================

export const updateMovie = (
    id,
    payload
) => {

    const formData =
        new FormData();


    formData.append(
        "title",
        payload.title
    );


    formData.append(
        "genre",
        payload.genre
    );


    formData.append(
        "rating",
        payload.rating || ""
    );


    // Description
    if (payload.description) {

        formData.append(
            "description",
            payload.description
        );
    }


    // Duration
    if (payload.duration) {

        formData.append(
            "duration",
            payload.duration
        );
    }


    // Upload new image only
    if (
        payload.image &&
        payload.image instanceof File
    ) {

        formData.append(
            "image",
            payload.image
        );
    }


    return apiRequest(
        `/movies/${id}`,
        {
            method: "PUT",
            body: formData
        }
    );
};


// ======================================================
// DELETE MOVIE
// ======================================================

export const deleteMovie = (
    id
) =>
    apiRequest(
        `/movies/${id}`,
        {
            method: "DELETE"
        }
    );


// ======================================================
// THEATRES
// ======================================================

export const getTheatres = () =>
    apiRequest(
        "/theatres"
    );


// ======================================================
// BOOKINGS
// ======================================================


   // ======================================================
// BOOKINGS
// ======================================================

export const createBooking = (payload) =>
  apiRequest("/bookings", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const getBookings = () =>
  apiRequest("/bookings");

export const getUserBookings = (userId) =>
  apiRequest(`/bookings/user/${userId}`);

export const askAdminOrderQuestion = (question) =>
    apiRequest("/bookings/admin/chat", {
        method: "POST",
        body: JSON.stringify({
            question,
            timezoneOffset: new Date().getTimezoneOffset()
        })
    });

    // ======================================================
// RAZORPAY - CREATE ORDER
// ======================================================

export const createPaymentOrder = (
    amount
) =>
    apiRequest(
        "/payment/create-order",
        {
            method: "POST",

            body: JSON.stringify({
                amount
            })
        }
    );


// ======================================================
// RAZORPAY - VERIFY PAYMENT
// ======================================================

export const verifyPayment = (
    paymentData
) =>
    apiRequest(
        "/payment/verify",
        {
            method: "POST",

            body: JSON.stringify(
                paymentData
            )
        }
    );