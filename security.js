// security.js

// Function to get CSRF token from cookies
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrfToken') {
            return decodeURIComponent(value);
        }
    }
    return null;
}

// Function to send AJAX request with CSRF token
function sendAjaxRequest(url, method, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-CSRF-Token', getCSRFToken());

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(null, JSON.parse(xhr.responseText));
            } else {
                callback(new Error(`Request failed with status ${xhr.status}`));
            }
        }
    };

    xhr.send(JSON.stringify(data));
}

// Other security-related functions...

// Example usage:
// const apiUrl = 'https://your-api-endpoint.com';
// const requestData = { /* your data */ };

// sendAjaxRequest(apiUrl, 'POST', requestData, function (error, response) {
//     if (error) {
//         console.error('Request failed:', error.message);
//     } else {
//         console.log('Request successful:', response);
//     }
// });
