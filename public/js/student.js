const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "student") {
    window.location.href = "/login";
}


document.getElementById("userName").textContent =
    localStorage.getItem("name") || "Student";


// ================================
// LOAD STORES
// ================================

async function loadStores() {

    const response = await fetch(
        "/api/stores",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );


    const stores = await response.json();

    const container =
        document.getElementById("stores");


    if (!stores.length) {

        container.innerHTML = `
            <div class="empty">
                No print shops registered yet.
            </div>
        `;

        return;
    }


    container.innerHTML = stores.map(store => {

        const busy =
            store.pendingOrders >= 8;

        return `

        <div class="store-card">

            <div class="store-top">

                <div class="store-icon">
                    🖨️
                </div>

                <span class="${store.isOpen
                    ? "open"
                    : "closed"}">

                    ${store.isOpen
                        ? "Open"
                        : "Closed"}

                </span>

            </div>


            <h3>${store.name}</h3>

            <p class="location">
                📍 ${store.location}
            </p>


            <div class="queue-info">

                <div>

                    <strong>
                        ${store.pendingOrders}
                    </strong>

                    <span>
                        pending orders
                    </span>

                </div>


                <div>

                    <strong>
                        ~${store.estimatedTime} min
                    </strong>

                    <span>
                        estimated wait
                    </span>

                </div>

            </div>


            <div class="queue-bar">

                <div
                    style="width:${Math.min(
                        store.pendingOrders * 10,
                        100
                    )}%">
                </div>

            </div>


            <button
                class="primary-button full"
                onclick="openOrderModal(
                    '${store._id}',
                    '${store.name}'
                )"
                ${!store.isOpen ? "disabled" : ""}>

                Select Shop →

            </button>

        </div>

        `;

    }).join("");
}


// ================================
// ORDER MODAL
// ================================

function openOrderModal(storeId, storeName) {

    document
        .getElementById("orderModal")
        .classList.remove("hidden");


    document
        .getElementById("storeId")
        .value = storeId;


    document
        .getElementById("selectedStore")
        .textContent =
        `Ordering from ${storeName}`;
}


function closeOrderModal() {

    document
        .getElementById("orderModal")
        .classList.add("hidden");

}


// ================================
// CREATE ORDER
// ================================

document
    .getElementById("orderForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();


        const formData = new FormData();


        formData.append(
            "storeId",
            document.getElementById("storeId").value
        );


        formData.append(
            "file",
            document.getElementById("file").files[0]
        );


        formData.append(
            "copies",
            document.getElementById("copies").value
        );


        formData.append(
            "printType",
            document.getElementById("printType").value
        );


        formData.append(
            "sides",
            document.getElementById("sides").value
        );


        formData.append(
            "instructions",
            document.getElementById("instructions").value
        );


        const response = await fetch(
            "/api/orders",
            {

                method: "POST",

                headers: {
                    Authorization: `Bearer ${token}`
                },

                body: formData

            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        alert(
            `Order placed successfully!\n\nYour Order ID is:\n${data.orderId}`
        );


        closeOrderModal();

        document
            .getElementById("orderForm")
            .reset();


        loadOrders();

        loadStores();

    });


// ================================
// LOAD ORDERS
// ================================

async function loadOrders() {

    const response = await fetch(
        "/api/orders/my-orders",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );


    const orders = await response.json();

    const container =
        document.getElementById("ordersList");


    if (!orders.length) {

        container.innerHTML = `
            <div class="empty">
                You haven't placed any orders yet.
            </div>
        `;

        return;
    }


    container.innerHTML = orders.map(order => {

        return `

        <div class="order-card">

            <div>

                <div class="order-id">
                    ${order.orderId}
                </div>

                <h3>
                    ${order.fileName}
                </h3>

                <p>
                    ${order.store.name}
                    · ${order.copies} copies
                    · ${order.printType}
                </p>

            </div>


            <span class="status ${order.status}">
                ${order.status}
            </span>

        </div>

        `;

    }).join("");
}


// ================================
// LOGOUT
// ================================

function logout() {

    localStorage.clear();

    window.location.href = "/login";
}


loadStores();

loadOrders();