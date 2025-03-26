async function populateDashboard() {
    const derivAccounts = document.getElementById('derivAccounts');

    try {
        const response = await fetch("http://localhost:8080/deriv/account-info", {
            method: "GET",
            credentials: "include"
        })

        if (!response.ok) {
            console.log("Error fetching account info")
            return;
        }

        const accountsData = await response.json();
        // Handle both single account and array of accounts
        const accounts = Array.isArray(accountsData) ? accountsData : [accountsData];
        
        accounts.forEach(account => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${account.account_id}</td>
                <td>${account.account_currency}</td>
                <td>${account.account_balance}</td>
            `;
            derivAccounts.appendChild(row);
        });
        
    } catch (error) {
        console.error("Error populating dashboard:", error);
        console.log("Error populating dashboard. Please try again later.");
    }
}

async function handleDerivCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if Deriv has sent account details
    if (!urlParams.has("acct1") || !urlParams.has("token1") || !urlParams.has("cur1")) {
        return; // No Deriv callback data, exit
    }

    // Extract account info
    const accountData = {
        "account_id": urlParams.get("acct1"),
        "token": urlParams.get("token1"),
        "currency": urlParams.get("cur1")
    };

    console.log("Processing Deriv callback:", accountData);

    try {
        // Send account details to backend
        const response = await fetch("http://localhost:8080/users/deriv-callback", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({   // ✅ Convert object to JSON string
                "account_id": urlParams.get("acct1"),
                "token": urlParams.get("token1"),
                "currency": urlParams.get("cur1")
            }),
            credentials: "include"  // ✅ Ensures cookies are sent
        });
    
        const result = await response.json();
        if (response.ok) {
            console.log("Account linked successfully:", result);
    
            // Remove query parameters from URL after processing
            window.history.replaceState(null, null, "/");
    
            // Redirect to dashboard
            window.location.href = "/";
        } else {
            console.log(result.detail || "Failed to link account.");
        }
    } catch (error) {
        console.error("Error linking account:", error);
        console.log("An error occurred. Please try again.");
    }
}

async function checkAuth() {
    try {
        const response = await fetch('http://localhost:8080/users/me', {
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
        document.getElementById("userName").textContent = userData.username
        document.getElementById("userEmail").textContent = userData.email

        return userData;

    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = `/login.html?error=${encodeURIComponent(error.message)}`;
        return false;
    }
}

function handleConnectAccount() {
    window.location.href = "https://oauth.deriv.com/oauth2/authorize?app_id=69972";
}
function handleLogout() {
    fetch('http://localhost:8080/users/logout', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            window.location.href = "/login.html";
        } else {
            console.log("Failed to logout");
        }
    })
    .catch(error => {
        console.error("Error logging out:", error);
        console.log("An error occurred. Please try again.");
    });
}
