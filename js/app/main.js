const baseUrl = "http://localhost:8080"

export function backendUrl() {
    return baseUrl
}

async function checkBackendOnline() {
    const url = `${baseUrl}`
    try {
        const response = await fetch(url, {
            method: 'GET'
        })
        if (response.ok) {
            return ""
        } else {
            Swal.fire({
                icon: "error",
                title: "System Failure",
                text: "A crittical error occured. Please contact support",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 10000,
            });
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "System Failure",
            text: `A critical error occured. Details: ${error}`,
            toast: true,
            showConfirmButton: false,
            timer: 10000,
        });
    }
}

async function derivAccountDetails() {
    const url = `${baseUrl}/deriv/account-info`
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include"
        });
        if (response.ok) {
            console.log(await response.json())
        } else {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: `Failed to fetch account details: ${await response.json().detail}`,
                toast: true,
                showConfirmButton: false,
                timer: 10000,
            });
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "System Failure",
            text: `A critical error occured. Details: ${error}`,
            toast: true,
            showConfirmButton: false,
            timer: 10000,
        });
    }
}

checkBackendOnline();