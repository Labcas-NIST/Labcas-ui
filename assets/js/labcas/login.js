var root_app = "";

Cookies.set("token", "None");
$('#loginform').submit(function (e) {
    e.preventDefault();
    $.get('/labcas-ui/assets/conf/environment.cfg', function(data) {
        root_app = data;
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
                    Cookies.set("userletters", $('#username').val().substr(0, 2).toUpperCase());
                    Cookies.set("environment", root_app);
                    window.location.replace("/labcas-ui/application/labcas_collection_table.html");
                },
                error: function(){
                    //localStorage.setItem('token', "None");
                    Cookies.set("token", "None");
                    alert("Could not login. Please make sure you have an account or reach out to EDRN JPL Support.");
                }
        }); 
    }, 'text');
});
