async function loadConfig() {
    try {
        const response = await fetch('src/config.json');
        if (!response.ok) {
            throw new Error(`Failed to load config.json: ${response.status}`);
        }
        const config = await response.json();
        return config;
    } catch (error) {
        console.error('Error loading config.json:', error);
        return {}; // Return an empty object as a fallback
    }
}
let backend_url;

loadConfig().then(config => {
    backend_url = config.backend_api;

    if (!backend_url) {
        console.warn("backend_api not found in config.json.  Using a default or placeholder value is recommended.");
        backend_url = "http://localhost:8080"; // Provide a default value
    }


    async function checkOnline() {
        const response = await fetch(`${backend_url}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    checkOnline().then(() => {
        console.log("Backend is online!");
    }).catch(() => {
        console.log("Backend is offline!");
    });

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
                console.log(error)
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
            document.getElementById("userEmail").textContent = userData.email

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
});

// document.addEventListener("DOMContentLoaded", () => {
//     loadPage("dashboard.html")
// });