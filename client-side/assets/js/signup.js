document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from reloading the page

    // Gather form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const title = document.getElementById('title').value;
    const admin = document.getElementById('admin').checked;

    // Check if passwords match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'danger');
        return; // Stop form submission
    }

    try {
        // Make POST request to register the user
        const response = await fetch('https://node-taskmaster-api.onrender.com/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, role, title, admin }),
        });

        // Parse the JSON response
        const result = await response.json();

        if (response.ok) {
            // Store the token in localStorage
            localStorage.setItem('jwtToken', result.token);

            // Show success message
            showAlert('Registration successful! Redirecting to login...', 'success');

            // Redirect to login page after a delay
            setTimeout(() => {
                window.location.href = 'https://node-taskmaster.netlify.app/login.html';
            }, 2000);
        } else {
            // Handle errors
            showAlert(result.message || 'Registration failed', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('An error occurred during registration.', 'danger');
    }
});

// Function to show Bootstrap alerts
function showAlert(message, type) {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    alertPlaceholder.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}
