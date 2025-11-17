Cookies.set("token", "None");
$(document).ready(function(){
    if (!Cookies.get('user')){
        Cookies.set('user', "Sign in");
    }
    clear_cart('files-table');
$.getJSON( '/labcas-ui/assets/conf/environment.cfg?version=5.3.1', function(json) {
	$.each( json, function( key, val ) {
        if (typeof val == "string"){
            localStorage.setItem(key, val);
        }else if(typeof val == "object"){
            localStorage.setItem(key, JSON.stringify(val));
        }else{
            
        }
	});
}, 'text').done(function(d) {
                
            }).fail(function(d, textStatus, error) {
                console.error("Config failed, status: " + textStatus + ", error: "+error);
            }).always(function(d) {
                
            });
	$('#loginerror').html(localStorage.getItem("login_msg"));
});
$('#loginform').submit(function (e) {
	e.preventDefault();
	Cookies.set("user", $('#username').val());
	Cookies.set("userletters", $('#username').val().substr(0, 2).toUpperCase());
	Cookies.set("userpass", btoa($('#username').val() + ":" + $('#password').val()));
        $.ajax({
            url: localStorage.getItem('environment')+"/data-access-api/auth",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + btoa($('#username').val() + ":" + $('#password').val()));
                },
                type: 'POST',
                success: function (data) {
			Cookies.set("logout_alert","Off");
			Cookies.set("token", data);
			Cookies.set("JasonWebToken", data);
			//Get user data, then redirect
			$.ajax({
				url: localStorage.getItem('environment')+"/data-access-api/userdata/read?id="+Cookies.get('user'),
				beforeSend: function(xhr) { 
					xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
				},
				type: 'GET',
				dataType: 'json',
				success: function (data) {
					user_data = {"FavoriteCollections":[],"FavoriteDatasets":[],"FavoriteFiles":[]};
					first_time_user = false;
					if (data['response'] && data['response']['docs'] && data['response']['docs'][0]){
						user_data = data['response']['docs'][0];
					}
					if (!user_data["FavoriteCollections"]){
						user_data["FavoriteCollections"] = [];
						//first time user
						first_time_user = true;	
					}
					if (!user_data["FavoriteDatasets"]){
						user_data["FavoriteDatasets"] = [];
					}
					if (!user_data["FavoriteFiles"]){
						user_data["FavoriteFiles"] = [];
					}
					
					localStorage.setItem("userdata",  JSON.stringify(user_data));

					writeUserData(JSON.stringify(user_data))
					localStorage.setItem("first_time_user",  first_time_user);
					if (Cookies.get("login_redirect")){
                        window.location.replace("/labcas-ui/m/index.html");
					}else{
						window.location.replace("/labcas-ui/m/index.html");
					}
				},
				error: function(){
					 console.error("Unable to get user favorites, dev will need to troubleshoot...");
					 //window.location.replace("/nist/application/pages/login.html");
				 }
			});
                },
                error: function(){
                    Cookies.set("token", "None");
                    $('#alertHTML').html(localStorage.getItem("error_msg"));
                    $('#errorModal').modal('show');
                }
        }); 
});
