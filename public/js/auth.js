const roleSelect = document.getElementById("role");
const shopFields = document.getElementById("shopFields");

if (roleSelect) {

    roleSelect.addEventListener("change", () => {

        if (roleSelect.value === "shopkeeper") {
            shopFields.classList.remove("hidden");
        } else {
            shopFields.classList.add("hidden");
        }

    });

}


// ================================
// LOGIN
// ================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;


        const response = await fetch("/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });


        const data = await response.json();


        if (!response.ok) {

            document.getElementById("message")
                .textContent = data.message;

            return;
        }


        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "role",
            data.role
        );

        localStorage.setItem(
            "name",
            data.name
        );


        if (data.role === "student") {
            window.location.href = "/student";
        } else {
            window.location.href = "/shopkeeper";
        }

    });

}


// ================================
// SIGNUP
// ================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();


        const role =
            document.getElementById("role").value;


        const body = {

            name:
                document.getElementById("name").value,

            email:
                document.getElementById("email").value,

            password:
                document.getElementById("password").value,

            role

        };


        if (role === "shopkeeper") {

            body.storeName =
                document.getElementById("storeName").value;

            body.location =
                document.getElementById("location").value;

        }


        const response = await fetch(
            "/api/auth/signup",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(body)

            }
        );


        const data = await response.json();


        if (!response.ok) {

            document.getElementById("message")
                .textContent = data.message;

            return;

        }


        alert(
            "Account created! Please login."
        );

        window.location.href = "/login";

    });

}