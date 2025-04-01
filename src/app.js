// src/app.js
import { pageInjector } from '../assets/js/pageInjector.js';
import { AppConstants } from './constants.js';
//let backend_url; // Removed backend_url declaration

// Removed loadConfig function

// Constants are now imported, no need for window check
const backend_url = AppConstants.BACKEND_URL;
console.log(`Using backend URL: ${backend_url}`); // Verify the URL
async function checkOnline() {
    try {
        const response = await fetch(`${backend_url}`, {
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

async function checkAuth() {
    try {
        const response = await fetch(`${backend_url}users/me`, {
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

function logout() {
    fetch(`${backend_url}users/logout`, {
        method: 'POST',
        credentials: 'include' // Include cookies in request
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Logout failed');
        }
        window.location.href = '/login.html';
    })
    .catch(error => {
        console.error('Logout error:', error);
    });
}

checkOnline();
checkAuth();


document.addEventListener("DOMContentLoaded", function () {
    const dashboardNav = document.getElementById("dashboardNav");
    const marketNav = document.getElementById("marketNav");
    const dashboardLink = document.getElementById("dashboardLink");
    const marketLink = document.getElementById("marketLink");

    // Function to handle navigation and active state
    const navigateTo = (pageName, activeNav, inactiveNav) => {
        if (pageInjector.currentPage !== pageName) {
            pageInjector.loadPage(pageName);
            activeNav.classList.add("active");
            inactiveNav.classList.remove("active");
        }
    };

    // Initial page load
    navigateTo("dashboard.html", dashboardNav, marketNav);

    // Event listeners
    marketLink.addEventListener("click", function (e) {
        e.preventDefault();
        navigateTo("market.html", marketNav, dashboardNav);
    });

    dashboardLink.addEventListener("click", function (e) {
        e.preventDefault();
        navigateTo("dashboard.html", dashboardNav, marketNav);
    });

    // Add logout listener if logout button exists
    const logoutButton = document.getElementById('logoutButton'); // Assuming you have a logout button with this ID
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});