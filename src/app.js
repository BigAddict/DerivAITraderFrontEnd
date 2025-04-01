// src/app.js
//let backend_url; // Removed backend_url declaration

// Removed loadConfig function

// Ensure AppConstants is defined before using it
if (typeof window.AppConstants === 'undefined' || !window.AppConstants.BACKEND_URL) {
    console.error("AppConstants.BACKEND_URL is not defined. Please ensure src/constants.js is loaded before app.js.");
    // You might want to display an error message to the user or take other appropriate action here.
    throw new Error("Backend URL not defined. See console for details."); // Stop execution
}

const backend_url = window.AppConstants.BACKEND_URL; // Retrieve from AppConstants
console.log(`Using backend URL: ${backend_url}`); // Verify the URL
async function checkOnline() {
    try {
        const response = await fetch(`${backend_url}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
            if (!response.ok) {
            throw new Error(`Backend is offline. Status code: ${response.status}`);
            }
        console.log("Backend is online!");
        } catch (error) {
        console.error("Backend is offline:", error);
        console.log("Backend is offline!"); // Log the offline status
        }
    }

checkOnline();

async function checkAuth() {
    try {
        const response = await fetch(`${backend_url}/users/me`, {
            method: 'POST',
            credentials: 'include' // Include cookies in request
});

        if (response.status === 401) {
            // Not authorized, redirect to login with error message
            const error = await response.json();
            window.location.href = `/login.html?error=${encodeURIComponent(error.detail || 'Not Authorized')}`;
            console.log(error);
            return false;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to check auth status');
        }

        // Parse response as UserResponse schema
        const userData = await response.json();
        if (!userData.id || !userData.email || !userData.username ||
            typeof userData.is_active === 'undefined' ||
            typeof userData.is_superuser === 'undefined' ||
            typeof userData.is_verified === 'undefined') {
            throw new Error('Invalid user data format');
        }
        document.getElementById("userEmail").textContent = userData.email;

        const userNameElements = document.querySelectorAll('.userName');
        userNameElements.forEach(element => {
            element.textContent = userData.username;
        });

        return userData;

    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = `/login.html?error=${encodeURIComponent(error.message)}`;
        return false;
    }
}

checkAuth();

document.addEventListener("DOMContentLoaded", function () {
    let loaded_page = "";
    const dashboardNav = document.getElementById("dashboardNav");
    const marketNav = document.getElementById("marketNav");

    const dashboardLink = document.getElementById("dashboardLink");
    const marketLink = document.getElementById("marketLink");

    if (loaded_page === "") {
        loadPage("dashboard.html");
        loaded_page = "dashboard.html";
        dashboardNav.classList.add("active");
        marketNav.classList.remove("active");
    }
    marketLink.addEventListener("click", function (e) {
        e.preventDefault();
        if (loaded_page !== "market.html") {
            loadPage("market.html");
            loaded_page = "market.html";
            dashboardNav.classList.remove("active");
            marketNav.classList.add("active");
        }
    });
    dashboardLink.addEventListener("click", function (e) {
        e.preventDefault();
        if (loaded_page !== "dashboard.html") {
            loadPage("dashboard.html");
            loaded_page = "dashboard.html";
            dashboardNav.classList.add("active");
            marketNav.classList.remove("active");
        }
    });

});