document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("nav a");
    const contentContainer = document.getElementById("content");

    // Function to load content from a file
    function loadContent(page) {
        fetch(`${page}.html`)
            .then(response => response.text())
            .then(content => {
                contentContainer.innerHTML = content;
            })
            .catch(error => {
                console.error("Error loading content:", error);
            });
    }

    // Add click event listeners to the navigation links
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const page = this.getAttribute("data-page");
            loadContent(page);
        });
    });

    // Load the initial content (e.g., section1.html)
    loadContent("section1");
});
