var root_app = "";

function writeUserData(data){
	$.ajax({
        url: Cookies.get('environment')+"/data-access-api/userdata/create",
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
        },
        type: 'POST',
        data: data,
        contentType:"application/json",
        dataType: 'json',
        success: function (data) {
            console.log(data);
        },
        error: function(){
             //alert("Login expired, please login...");
             //window.location.replace("/labcas-ui/application/pages/login.html");
         }
    });
}
function getUserData(user){
	$.ajax({
        url: Cookies.get('environment')+"/data-access-api/userdata/read?id="+user,
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
        },
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            console.log(data);
        },
        error: function(){
             //alert("Login expired, please login...");
             //window.location.replace("/labcas-ui/application/pages/login.html");
         }
    });
}

Cookies.set("token", "None");
$('#loginform').submit(function (e) {
    e.preventDefault();
    $.get('/labcas-ui/assets/conf/environment.cfg', function(data) {
        root_app = data;
        $.ajax({
            url: root_app+"/data-access-api/auth",
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
                    //getUserData("dliu");
                    //writeUserData('{"id":"dliu", "FavoriteCollections":["test", "okay"], "LastLogin": "2019-10-30T12:00:00Z"}');
                    //getUserData("dliu");
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
