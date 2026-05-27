const token = localStorage.getItem("token");

if (!token) {

    alert("Please Login First");

    window.location.href = "login.html";

}