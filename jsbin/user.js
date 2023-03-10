const signup_endpoint = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/signup";
const login_endpoint = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/auth/login";
const getsingle_endpoint = "https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/" // + user id

const annualExpiration = 1;

function calculateExpiration(past) {
    var currentDate = new Date();

    if (past == true) {
        currentDate.setFullYear(currentDate.getFullYear() - annualExpiration);
    } else {
        currentDate.setFullYear(currentDate.getFullYear() + annualExpiration);
    }

    return currentDate;
}

function getCookieData(trim) {
    const cookies = document.cookie;
    const cookieArray = cookies.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i];
        const [name, value] = cookie.split("=");
        if (name.trim() === trim) {
            return {
                "Data": value.toString(),
                "Valid": true,
            };
        }
    }

    return {
        "Data": "no data.",
        "Valid": false,
    };
}

function implementUsername() {
    var username = document.getElementById("username");
    var data = getCookieData("account_id");

    var login_btn = document.getElementById("login-btn");
    var signup_btn = document.getElementById("signup-btn");
    var dashboard_btn = document.getElementById("dashboard-btn");
    var upload_btn = document.getElementById("upload-btn");

    if (data.Valid) {
        var url = getsingle_endpoint + data.Data;

        login_btn.remove();
        signup_btn.remove();
    
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "GET",
            headers: myHeaders,
        }

        fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
            var result_parse = JSON.parse(result);
            console.log("User info:" , result_parse);

            if (result_parse.name) {
                username.innerHTML = result_parse.name;
            }
        })
    } else {
        dashboard_btn.remove();
        upload_btn.remove();
        username.innerHTML = "";
    }
}

function createCookieData(authToken, id) {
    const expiration = calculateExpiration(false).toUTCString();

    document.cookie = "session_id="+authToken+"; expires="+expiration+";";
    document.cookie = "account_id="+id+"; expires="+expiration+";";
}

function clearCookieData() {
    const expiration = calculateExpiration(true).toUTCString();
    const cookies = document.cookie.split(";");

    cookies.forEach(function(cookie) {
        const name = cookie.split("=")[0].trim();
        document.cookie = name + "=; expires="+expiration+";"
    })
}

function createSessionData() {
    var data = getCookieData("session_id");

    if (!data.Valid) {
        const username_input = document.getElementById("username_input").value;
        const email_input = document.getElementById("email_input").value;
        const password_input = document.getElementById("password_input").value;

        var username = username_input.toString();
        var password = password_input.toString();
        var email = email_input.toString();

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                "name": username,
                "email": email,
                "password": password,
            }),
        };

        var error_label = document.getElementById("error-label");
        error_label.innerHTML = "Creating account...";

        fetch(signup_endpoint, requestOptions)
        .then(response => response.text())
        .then(result => {
            var result_parse = JSON.parse(result);
            console.log("Signup result:" , result_parse);

            if (result_parse.authToken) {
                createCookieData(result_parse.authToken, result_parse.userId);
                error_label.innerHTML = "Successfully created account!";
            } else {
                error_label.innerHTML = result_parse.message;
            }
        })
        .catch(error => {
            console.warn("Error trying to create session data:", error);
        });
    }
}

function getSessionData() {
    var data = getCookieData("session_id");

    if (!data.Valid) {
        const username_input = document.getElementById("username_login").value;
        const password_input = document.getElementById("password_login").value;

        var username = username_input.toString();
        var password = password_input.toString();

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                "username": username,
                "password": password,
            }),
        };

        var error_label = document.getElementById("error-label");
        error_label.innerHTML = "Logging you in...";

        fetch(login_endpoint, requestOptions)
        .then(response => response.text())
        .then(result => {
            var result_parse = JSON.parse(result);
            console.log("Login info:" , result_parse);

            if (result_parse.authToken) {
                error_label.innerHTML = "Successfully logged in!";
                createCookieData(result_parse.authToken, result_parse.userId);
                window.location.assign("index.html");
            } else {
                error_label.innerHTML = result_parse.message;
            }
        })
    }
}

function changeSessionData(headers, endpoint) {
    var error_label = document.getElementById("error-label");
    error_label.innerHTML = "Changing settings...";

    fetch(endpoint, headers)
    .then(response => response.text())
    .then(result => {
        var result_parse = JSON.parse(result);

        if (result_parse.message) {
            error_label.innerHTML = result_parse.message;
        } else {
            error_label.innerHTML = "Successfully changed settings!";
        }
    })
}

function changeEmailData() {
    var data = getCookieData("account_id");

    if (data.Valid) {
        const new_email = document.getElementById("email_input").value;
        const old_email = document.getElementById("old_email_input").value;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                "user_id": data.Data,
                "old_email": old_email,
                "new_email": new_email,
            }),
        };

        changeSessionData(requestOptions, ("https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/edit_email/" + data.Data));
    }
}

function changePasswordData() {
    var data = getCookieData("account_id");

    if (data.Valid) {
        const new_password = document.getElementById("password_input").value;
        const old_password = document.getElementById("old_password_input").value;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                "user_id": data.Data,
                "old_password": old_password,
                "new_password": new_password,
            }),
        };
        
        changeSessionData(requestOptions, ("https://x8ki-letl-twmt.n7.xano.io/api:V36A7Ayv:v1/user/edit_pass/" + data.Data));
    }
}

function logout() {
    var data = getCookieData("session_id");

    if (data.Valid) {
        clearCookieData();
    }

    window.location.assign("login.html");
}

function redirectSettings() {
    var data = getCookieData("session_id");

    if (data.Valid) {
        window.location.assign("settings.html");
    }
}

console.log(document.cookie);
implementUsername();
