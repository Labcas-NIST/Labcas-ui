var root_app = "edrn-labcas";
Cookies.set("token", "None");
$('#loginform').submit(function (e) {
    e.preventDefault();
    $.ajax({
        url: "https://"+root_app+".jpl.nasa.gov/data-access-api/auth",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa($('#username').val() + ":" + $('#password').val()));
            },
            type: 'GET',
            success: function (data) {
                //localStorage.setItem('token', data);
                Cookies.set("token", data);
                Cookies.set("user", $('#username').val());
                window.location.replace("/labcas-ui/application/labcas_collection_table.html");
            },
            error: function(){
                //localStorage.setItem('token', "None");
                Cookies.set("token", "None");
                alert("Could not login. Please make sure you have an account or reach out to EDRN JPL Support.");
            }
    }); 
});
