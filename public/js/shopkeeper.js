const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "shopkeeper") {
    window.location.href = "/login";
}


let selectedOrderId = null;


// ================================
// LOAD QUEUE
// ================================

async function loadQueue() {

    const response = await fetch(
        "/api/orders/shop-orders",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );


    const orders = await response.json();

    const container =
        document.getElementById("shopOrders");


    document.getElementById("queueCount")
        .textContent = orders.length;


    if (!orders.length) {

        container.innerHTML = `

            <div class="empty queue-empty">

                <div class="big-icon">
                    ✓
                </div>

                <h2>
                    Queue is clear
                </h2>

                <p>
                    No pending print orders right now.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML = orders.map(
        (order, index) => {

        const isFirst = index === 0;


        return `

        <div class="
            shop-order-card
            ${isFirst ? "next-order" : ""}
        ">

            <div class="order-position">

                ${
                    isFirst
                    ? "NEXT"
                    : `#${index + 1}`
                }

            </div>


            <div class="shop-order-main">

                <div class="order-id">
                    ${order.orderId}
                </div>

                <h3>
                    ${order.fileName}
                </h3>

                <p>
                    Student:
                    ${order.student.name}
                </p>

                <div class="print-details">

                    <span>
                        ${order.copies} copies
                    </span>

                    <span>
                        ${order.printType === "color"
                            ? "Color"
                            : "B&W"}
                    </span>

                    <span>
                        ${order.sides === "double"
                            ? "Double-sided"
                            : "Single-sided"}
                    </span>

                </div>


                ${
                    order.instructions
                    ? `
                    <div class="instructions">
                        📝 ${order.instructions}
                    </div>
                    `
                    : ""
                }

            </div>


            <div class="shop-order-actions">

                <a
                    href="/api/orders/${order._id}/file"
                    target="_blank"
                    class="secondary-button">

                    View File

                </a>


                <button

                    class="${
                        isFirst
                        ? "primary-button"
                        : "disabled-button"
                    }"

                    ${
                        isFirst
                        ? `onclick="openConfirm('${order._id}')"`
                        : "disabled"
                    }>

                    ${
                        isFirst
                        ? "✓ Print & Complete"
                        : "Waiting"
                    }

                </button>

            </div>

        </div>

        `;

    }).join("");
}


// ================================
// CONFIRM
// ================================

function openConfirm(orderId) {

    selectedOrderId = orderId;

    document
        .getElementById("confirmModal")
        .classList.remove("hidden");
}


function closeModal() {

    document
        .getElementById("confirmModal")
        .classList.add("hidden");

    selectedOrderId = null;
}


// ================================
// COMPLETE ORDER
// ================================

document
    .getElementById("confirmButton")
    .addEventListener("click", async () => {

        if (!selectedOrderId) return;


        const response = await fetch(
            `/api/orders/${selectedOrderId}/complete`,
            {

                method: "PUT",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }

            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(data.message);

            closeModal();

            return;
        }


        alert("Order completed!");


        closeModal();

        loadQueue();

    });


// ================================
// LOGOUT
// ================================

function logout() {

    localStorage.clear();

    window.location.href = "/login";
}


loadQueue();


// Refresh queue every 10 seconds

setInterval(
    loadQueue,
    10000
);