Cookies.set("token", "None");
$('#loginform').submit(function (e) {
    e.preventDefault();
    $.getJSON( '/labcas-ui/assets/conf/environment.cfg?24', function(json) {
        //console.log(json);
		Cookies.set("user", $('#username').val());
		Cookies.set("userletters", $('#username').val().substr(0, 2).toUpperCase());
		$.each( json, function( key, val ) {
			Cookies.set(key, val);
		});
        $.ajax({
            url: Cookies.get('environment')+"/data-access-api/auth",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + btoa($('#username').val() + ":" + $('#password').val()));
                },
                type: 'GET',
                success: function (data) {
                	
					Cookies.set("token", data);
                    //Get user data, then redirect
                    $.ajax({
						url: Cookies.get('environment')+"/data-access-api/userdata/read?id="+Cookies.get('user'),
						beforeSend: function(xhr) { 
							xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
						},
						type: 'GET',
						dataType: 'json',
						success: function (data) {
							user_data = {"FavoriteCollections":[],"FavoriteDatasets":[],"FavoriteFiles":[]};
							if (data['response'] && data['response']['docs'] && data['response']['docs'][0]){
								user_data = data['response']['docs'][0];
							}
							if (!user_data["FavoriteCollections"]){
								user_data["FavoriteCollections"] = [];
							}
							if (!user_data["FavoriteDatasets"]){
								user_data["FavoriteDatasets"] = [];
							}
							if (!user_data["FavoriteFiles"]){
								user_data["FavoriteFiles"] = [];
							}
							console.log("userdata");
							console.log(user_data);
							Cookies.set("userdata",  JSON.stringify(user_data));
							window.location.replace("/labcas-ui/application/labcas_collection_table.html");
						},
						error: function(){
							 //alert("Login expired, please login...");
							 //window.location.replace("/labcas-ui/application/pages/login.html");
						 }
					});
                },
                error: function(){
                    //localStorage.setItem('token', "None");
                    Cookies.set("token", "None");
                    alert("Could not login. Please make sure you have an account or reach out to EDRN JPL Support.");
                }
        }); 
    }, 'text');
});
