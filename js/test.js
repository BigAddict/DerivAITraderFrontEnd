const base_url = "http://127.0.0.1:8080";

// Check if the server is running
async function checkServer() {
    try {
        const response = await fetch(`${base_url}/`);
        if (!response.ok) {
            throw new Error("Server is not running");
        }
        const data = await response.json();
        return data.message;
    } catch (error) {
        return "Error checking server:", error;
    }
}

checkServer().then(message => {
    console.log(message);
});