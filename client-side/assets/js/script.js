document.addEventListener("DOMContentLoaded", () => {
    const welcomeUserElement = document.getElementById("welcomeUser");
    const authButtons = document.getElementById("authButtons");

    // Function to display the welcome message
    function displayWelcomeMessage() {
        const token = localStorage.getItem("jwtToken");

        if (token) {
            // Decode the token to extract user information
            const userPayload = parseJwt(token);

            if (userPayload && userPayload.name) {
                // Update welcome message
                welcomeUserElement.textContent = `Welcome, ${userPayload.name}!`;

                // Replace Sign up button with Logout button
                authButtons.innerHTML = `
                    <button id="logoutButton"
                            class="ms-auto btn btn-md rounded-2 py-1 ps-3 pe-3 text-light logout fw-bold">
                        Logout
                    </button>
                `;

                // Attach logout functionality
                document.getElementById("logoutButton").addEventListener("click", () => {
                    logoutUser();
                });
            } else {
                // Invalid token, clear storage and reset UI
                console.warn("Invalid token payload:", userPayload);
                clearUserSession();
            }
        } else {
            // No token, show default message
            resetToSignUp();
        }
    }

    // Function to decode JWT token
    function parseJwt(token) {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Failed to parse JWT:", e);
            return null;
        }
    }

    // Function to clear user session
    function clearUserSession() {
        localStorage.removeItem("jwtToken");
        resetToSignUp();
    }

    // Function to reset to Sign up state
    function resetToSignUp() {
        welcomeUserElement.textContent = "Welcome!";
        authButtons.innerHTML = `
            <a href="https://node-taskmaster.netlify.app/login.html"
               class="ms-auto btn btn-md rounded-2 py-1 ps-3 pe-3 text-light signup fw-bold">
               Login
            </a>
        `;
    }

    // Function to handle logout
    function logoutUser() {
        clearUserSession();
        // alert("You have been logged out.");
        // window.location.reload(); // Reload to reset UI
        window.location.href = 'https://node-taskmaster.netlify.app/login.html';
    }

    // Call the function to display the welcome message on page load
    displayWelcomeMessage();
});


// document.getElementById("createTaskForm").addEventListener("submit", async function (event) {
//     event.preventDefault();

//     // Collect form data
//     const title = document.getElementById("taskTitle").value;
//     const description = document.getElementById("taskDescription").value;
//     const status = document.getElementById("taskStatus").value;
//     const dueDate = document.getElementById("dueDate").value;
//     const assignedUsersInput = document.getElementById("assignedUsers").value;
//     const files = document.getElementById("taskFiles").files;

//     // Convert assigned users input to an array of emails
//     const assignedUsers = assignedUsersInput.split(',').map(email => email.trim());

//     // Prepare form data (including files)
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);
//     formData.append("status", status);
//     formData.append("dueDate", dueDate);
//     formData.append("assignedUsers", JSON.stringify(assignedUsers)); // Stringify the array
//     // Attach files
//     Array.from(files).forEach(file => formData.append("files", file));

//     console.log('form date =============>', formData);




//     // Retrieve token from localStorage
//     const token = localStorage.getItem("jwtToken");
//     console.log("Token from localStorage==========> ", token);

//     // Define API endpoint
//     const apiEndpoint = "http://localhost:5000/create";

//     try {
//         // Send POST request with form data
//         const response = await fetch(apiEndpoint, {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//             },
//             body: formData,

//         });


//         const data = await response.json();
//         const responseMessage = document.getElementById("responseMessage");

//         // Handle response
//         if (response.ok) {
//             responseMessage.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
//         } else {
//             responseMessage.innerHTML = `<div class="alert alert-danger">${data.message || "An error occurred"}</div>`;
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         document.getElementById("responseMessage").innerHTML = `<div class="alert alert-danger">Failed to create task</div>`;
//     }
// });


document.getElementById("createTaskForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent normal form submission

    // Collect form data
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const status = document.getElementById("taskStatus").value;
    const dueDate = document.getElementById("dueDate").value;
    const assignedUsersInput = document.getElementById("assignedUsers").value;
    const files = document.getElementById("taskFiles").files;

    // Prepare form data (including files)
    const formData = new FormData();

    try {
        // Append non-file fields
        if (!title) throw new Error("Title is required");
        formData.append("title", title);

        if (!description) throw new Error("Description is required");
        formData.append("description", description);

        if (!status) throw new Error("Status is required");
        formData.append("status", status);

        if (!dueDate) throw new Error("Due date is required");
        formData.append("dueDate", dueDate);

        if (!assignedUsersInput) throw new Error("Assigned users are required");
        const assignedUsers = assignedUsersInput.split(',').map(email => email.trim());
        if (!assignedUsers.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
            throw new Error("One or more assigned users' emails are invalid.");
        }
        formData.append("assignedUsers", JSON.stringify(assignedUsers)); // Stringify the array

        // Attach files (if present)
        if (files.length > 0) {
            Array.from(files).forEach(file => formData.append("files", file));
        } else {
            throw new Error("At least one file is required.");
        }

        // Send the form data
        const token = localStorage.getItem("jwtToken"); // Retrieve token from localStorage
        if (!token) throw new Error("No token found. User is not authenticated.");

        const response = await fetch("https://node-taskmaster-api.onrender.com/create", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData, // Send FormData object
        });

        const data = await response.json();
        const responseMessage = document.getElementById("responseMessage");

        if (response.ok) {
            responseMessage.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        } else {
            responseMessage.innerHTML = `<div class="alert alert-danger">${data.message || "An error occurred"}</div>`;
        }

    } catch (error) {
        // Log the specific error that occurred
        console.error("Error:", error);
        document.getElementById("responseMessage").innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
});


// TaskList
document.addEventListener('DOMContentLoaded', async function () {
    // Retrieve the token and user ID from localStorage (or wherever it's stored)
    const userId = localStorage.getItem("userId"); // Make sure userId is set in localStorage when the user logs in

    if (!userId) {
        alert("User ID is required!");
        return;
    }

    try {
        // Fetch tasks for the logged-in user from the backend
        const response = await fetch(`https://node-taskmaster-api.onrender.com/tasks/${userId}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayTasks(data.tasks);
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('There was an error fetching tasks.');
    }
});

// Function to display the tasks
function displayTasks(tasks) {
    const taskListContainer = document.getElementById("taskList");
    taskListContainer.innerHTML = '';

    if (tasks.length === 0) {
        taskListContainer.innerHTML = "<p>No tasks found.</p>";
        return;
    }

    tasks.forEach(task => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task");
        taskElement.innerHTML = `

                <div class="card">
                <div class="card-header"><h6 class="fw-bold text-light"> ${task.title}</h6></div>
                    <div class="card-body">
                        <p>Description: ${task.description}</p>
                        <p>Assigned Users:
                        <ul>
                            ${task.assignedUsers.map(user => `<li>${user.name} (${user.email})</li>`).join('')}
                        </ul>
                        </p>
                        <p>Status: ${task.status}</p>
                        <p>Due Date: ${task.dueDate}</p>
                        

                        <div class="edit-and-delete">
                            <a href="#" class="deleteTask" data-task-id="${task._id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                                    class="bi bi-trash-fill text-danger" viewBox="0 0 16 16">
                                    <path
                                        d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                                </svg>
                            </a>
                            <a href="#" class="ms-3" data-bs-toggle="modal" data-bs-target="#editTaskModal">
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                                    class="bi bi-pencil-square" viewBox="0 0 16 16">
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                </svg>
                            </a>

                            <div class="modal fade" id="editTaskModal" tabindex="-1" aria-labelledby="editTaskModalLabel" aria-hidden="true">
                            <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                <h5 class="modal-title" id="editTaskModalLabel">Edit Task</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                <form id="editTaskForm">
                                    <div class="mb-3">
                                    <label for="title" class="form-label">Task Title</label>
                                    <input type="text" class="form-control" id="title" required>
                                    </div>
                                    <div class="mb-3">
                                    <label for="description" class="form-label">Description</label>
                                    <input type="text" class="form-control" id="description" required>
                                    </div>
                                    <div class="mb-3">
                                    <label for="dueDate" class="form-label">Due Date</label>
                                    <input type="date" class="form-control" id="dueDate" required>
                                    </div>
                                    <div class="mb-3">
                                    <label for="assignedUsers" class="form-label">Assigned Users</label>
                                    <input type="text" class="form-control" id="assignedUsers" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary">Save Changes</button>
                                </form>
                                </div>
                            </div>
                            </div>
                        </div>

                        </div>
                    </div>
                </div>
                </div>
                
        `;
        taskListContainer.appendChild(taskElement);
    });
}



// Event listener for delete buttons
document.querySelectorAll("#taskList").forEach(deleteButton => {
    deleteButton.addEventListener("click", async (event) => {
        event.preventDefault(); // Prevent the default action of the anchor tag

        const taskId = event.target.closest('a').getAttribute('data-task-id'); // Get task ID from the data attribute

        if (!taskId) {
            alert("Task ID not found");
            return;
        }

        // Confirm before deleting
        const confirmDelete = confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("jwtToken");

            const response = await fetch(`https://node-taskmaster-api.onrender.com/task/${taskId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message); // Show success message
                // Optionally, remove the task element from the DOM
                const taskElement = event.target.closest('.task'); // Find the task element
                taskElement.remove(); // Remove the task from the DOM
            } else {
                alert(data.message || "Failed to delete task"); // Show error message
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Error deleting task");
        }
    });
});



// Replace with the actual logged-in user's ID

const userId = localStorage.getItem("userId");

// Function to fetch and display tasks
async function fetchAndDisplayTasks() {
    try {
        // Make a GET request to fetch tasks
        const response = await fetch(`https://node-taskmaster-api.onrender.com/tasks/assigned/${userId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch tasks');
        }

        // Get the tasks container
        const tasksContainer = document.getElementById('tasks-container');

        // Clear the container before adding tasks
        tasksContainer.innerHTML = '';

        // Check if tasks exist
        if (data.tasks.length === 0) {
            tasksContainer.innerHTML = '<p>No tasks assigned to you.</p>';
            return;
        }

        // Loop through tasks and render each one
        data.tasks.forEach(task => {
            // Create a task card
            const taskElement = document.createElement('div');
            taskElement.classList.add('task');

            // Task details
            taskElement.innerHTML = `

            <div class="card">
                <div class="card-header"><h6 class="fw-bold text-light"> ${task.title}</h6></div>
                    <div class="card-body">
                        <p>Description: ${task.description}</p>
                        <p>Assigned Users:
                        <ul>
                            ${task.assignedUsers.map(user => `<li>${user.name} (${user.email})</li>`).join('')}
                        </ul>
                        </p>
                        <p>Status: ${task.status}</p>
                        <p>Due Date: ${new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                </div>


               
            `;

            // Append to the container
            tasksContainer.appendChild(taskElement);
        });
    } catch (error) {
        console.error(error.message);
        document.getElementById('tasks-container').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Call the function when the page loads
fetchAndDisplayTasks();