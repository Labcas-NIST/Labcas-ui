$(document).ready(function() {
    initializeUser();
    loadConfiguration();
    setupLoginForm();
});

function initializeUser() {
    if (!Cookies.get('user')) {
        Cookies.set('user', "Sign in");
    }
    clear_cart('files-table');
}

function loadConfiguration() {
    $.getJSON('/labcas-ui/assets/conf/environment.cfg?version=3.0.0', function(json) {
        Object.entries(json).forEach(([key, val]) => {
            if (typeof val === "string" || typeof val === "object") {
                localStorage.setItem(key, JSON.stringify(val).replace(/^"|"$/g, ''));
            } else {
                console.log('Unexpected type of key:', key, 'with type:', typeof val, 'and value:', val);
            }
        });
    }).done(() => {
        console.log("Configuration loaded successfully.");
    }).fail((jqXHR, textStatus, error) => {
        console.error("Configuration failed to load. Status:", textStatus, "Error:", error);
    }).always(() => {
        console.log("Configuration load attempt finished.");
    });
    $('#loginerror').text(localStorage.getItem("login_msg"));
}

function setupLoginForm() {
    $('#loginform').submit(function(e) {
        e.preventDefault();
        performLogin();
    });
}

function performLogin() {
    // Check the sso_enabled flag from localStorage
    const isSsoEnabled = (localStorage.getItem('sso_enabled') === "true");

    if (isSsoEnabled) {
        // Instead of collecting username/password, we redirect
        // to our mock SSO login endpoint with a redirectTo param.
        const ssoUrl = localStorage.getItem('sso_login_url');
        const redirectTarget = localStorage.getItem('sso_redirect_url');
        window.location.replace(`${ssoUrl}?redirectTo=${redirectTarget}`);

    } else {
        const username = $('#username').val();
        const password = $('#password').val();

        Cookies.set("user", username);
        Cookies.set("userletters", username.substr(0, 2).toUpperCase());
        Cookies.set("userpass", btoa(username + ":" + password));

        // Original AJAX call to the labcas backend
        $.ajax({
            url: localStorage.getItem('environment') + "labcas-backend-data-access-api/auth",
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            data: {
                username: username,
                password: password
            },
            success: handleAuthenticationSuccess,
            error: handleAuthenticationError
        });
    }
}

function handleAuthenticationSuccess(data) {
    Cookies.set("token", data);
    Cookies.set("JasonWebToken", data);
    window.location.replace("/labcas-ui/m/index.html");
    //getUserData();
}

function getUserData() {
    $.ajax({
        url: localStorage.getItem('environment') + "/data-access-api/userdata/read?id=" + Cookies.get('user'),
        beforeSend: xhr => xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')),
        type: 'GET',
        dataType: 'json',
        success: processUserData,
        error: () => console.log("Unable to get user favorites, dev will need to troubleshoot...")
    });
}

function processUserData(data) {
    let user_data = {"FavoriteCollections": [], "FavoriteDatasets": [], "FavoriteFiles": []};
    let first_time_user = false;

    if (data['response'] && data['response']['docs'] && data['response']['docs'][0]) {
        user_data = data['response']['docs'][0];
        first_time_user = !user_data["FavoriteCollections"];
    }

    console.log("User data loaded:", user_data);
    localStorage.setItem("userdata", JSON.stringify(user_data));
    localStorage.setItem("first_time_user", first_time_user);

    if (Cookies.get("login_redirect")) {
        window.location.replace(Cookies.get("login_redirect"));
    } else {
        window.location.replace("/labcas-ui/m/index.html");
    }
}

function handleAuthenticationError() {
    Cookies.set("token", "None");
    $('#alertHTML').text(localStorage.getItem("error_msg"));
    $('#errorModal').modal('show');
}
