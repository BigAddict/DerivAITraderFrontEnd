const body = document.getElementById("body");
const checkbox = document.getElementById("checkbox");

const mainHeader = document.getElementById("mainHeader")
const logoHeader = document.getElementById("logoHeader")
const sidebar = document.getElementById("sidebar")
checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
        body.setAttribute("data-background-color", "dark")
        mainHeader.classList.add("bg-dark")
        logoHeader.classList.add("bg-dark")
        sidebar.classList.add("bg-dark")
        
    } else {
        body.setAttribute("data-background-color", "light")
        mainHeader.classList.remove("bg-dark")
        logoHeader.classList.remove("bg-dark")
        sidebar.classList.remove("bg-dark")
    }
})