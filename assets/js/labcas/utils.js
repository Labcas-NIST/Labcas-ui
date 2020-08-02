var user_data = {};
$().ready(function() {
	if(Cookies.get("userdata") && Cookies.get("userdata") != "None"){
		user_data = JSON.parse(Cookies.get("userdata"));
	}
	console.log(user_data);

	// Toggle plus minus icon on show hide of collapse element
	$(".collapse.show").each(function(){	
        	$(this).prev(".btn").find(".fa").addClass("fa-minus").removeClass("fa-plus");
        });
	$(".collapse").on('show.bs.collapse', function(){
        	$(this).prev(".btn").find(".fa").removeClass("fa-plus").addClass("fa-minus");
        }).on('hide.bs.collapse', function(){
        	$(this).prev(".btn").find(".fa").removeClass("fa-minus").addClass("fa-plus");
        });
});
function initCookies(){
	if(!Cookies.get("token") || Cookies.get("token") == "None"){
		$.ajax({
			  url: '/labcas-ui/assets/conf/environment.cfg?26',
			  dataType: 'json',
			  async: false,
			  success: function(json) {
			Cookies.set("user", "Sign in");
			//Cookies.set("userletters", "PU");
			$.each( json, function( key, val ) {
				Cookies.set(key, val);
			});
	
			user_data = {"FavoriteCollections":[],"FavoriteDatasets":[],"FavoriteFiles":[]};
			if(Cookies.get("userdata") && Cookies.get("userdata") != "None"){
				var data = Cookies.get("userdata");
			
				if (data['response'] && data['response']['docs'] && data['response']['docs'][0]){
					user_data = data['response']['docs'][0];
				}
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
			Cookies.remove('JasonWebToken');
            $('#login_logout').html('<i class="nc-icon nc-button-power"></i> Log in')
            $('#login_logout').removeClass("text-danger");
            $('#login_logout').addClass("text-success");
		}});
		//user_data = JSON.parse(Cookies.get("userdata"));
	}
}

function writeUserData(udata){
	$.ajax({
        url: Cookies.get('environment')+"/data-access-api/userdata/create",
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
        },
        type: 'POST',
        data: udata,
        contentType:"application/json",
        dataType: 'json',
        success: function (data) {
            //console.log(data);
            Cookies.set("userdata",  udata);
            window.location.reload();
        },
        error: function(){
             //alert("Login expired, please login...");
             //window.location.replace("/labcas-ui/application/pages/login.html");
         }
    });
    
}
function getUserData(){
	$.ajax({
		url: Cookies.get('environment')+"/data-access-api/userdata/read?id="+Cookies.get('user'),
		beforeSend: function(xhr) { 
			xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
		},
		type: 'GET',
		dataType: 'json',
		success: function (data) {
			user_data_tmp = {}
			if (data['response']){
				user_data_tmp = data['response']['docs'][0];
			}
			if (!user_data_tmp["FavoriteCollections"]){
				user_data_tmp["FavoriteCollections"] = [];
			}
			if (!user_data_tmp["FavoriteDatasets"]){
				user_data_tmp["FavoriteDatasets"] = [];
			}
			if (!user_data_tmp["FavoriteFiles"]){
				user_data_tmp["FavoriteFiles"] = [];
			}
			Cookies.set("userdata",  JSON.stringify(user_data_tmp));
		},
		error: function(){
			 //alert("Login expired, please login...");
			 //window.location.replace("/labcas-ui/application/pages/login.html");
		 }
	});
}

function save_favorite(labcas_id, labcas_type){
	var user_id = Cookies.get('user');
	$.ajax({
        url: Cookies.get('environment')+"/data-access-api/userdata/read?id="+user_id,
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
        },
        type: 'GET',
        dataType: 'json',
        success: function (data) {
			var user_data_tmp = data;
			//console.log(user_data_tmp);
			var user_collection = [];
			if (user_data_tmp['response'] && user_data_tmp['response']['docs'][0]){
				user_data_tmp = user_data_tmp['response']['docs'][0];
				if (user_data_tmp["_version_"]){
					delete user_data_tmp["_version_"];
				}
			}else{
				user_data_tmp = {"id":user_id};
			}
			
			if (user_data_tmp[labcas_type]){
				user_collection = user_data_tmp[labcas_type];
			}
			
			if (user_collection.includes(labcas_id)){
				user_collection.splice(user_collection.indexOf(labcas_id), 1);
			}else{
				user_collection.push(labcas_id);
				user_data_tmp[labcas_type] = user_collection;
			}
			if (!user_data_tmp["FavoriteCollections"]){
				user_data_tmp["FavoriteCollections"] = [];
			}
			if (!user_data_tmp["FavoriteDatasets"]){
				user_data_tmp["FavoriteDatasets"] = [];
			}
			if (!user_data_tmp["FavoriteFiles"]){
				user_data_tmp["FavoriteFiles"] = [];
			}
			writeUserData(JSON.stringify(user_data_tmp));
		},
        error: function(){
             //alert("Login expired, please login...");
             //window.location.replace("/labcas-ui/application/pages/login.html");
         }
    });
	//writeUserData('{"id":"dliu", "FavoriteCollections":["test", "okay"], "LastLogin": "2019-10-30T12:00:00Z"}');
	//getUserData("dliu");
}

function dataset_compare_sort(a, b) {
  const idA = a.id.toUpperCase();
  const idB = b.id.toUpperCase();

  var comparison = 0;
  if (idA > idB) {
    comparison = 1;
  } else if (idA < idB) {
    comparison = -1;
  }
  return comparison;
}

function generate_mcl_links(obj){
	var institutions = [];
	var protocols = [];
	var pis = [];
	var orgs = [];
	if (obj.Institution){
		for (var i = 0; i < obj.Institution.length; i++) {
			o = $.trim(obj.Institution[i]);
			if (o != ""){
				inst_url = o.replace(/\./g,"").replace(/\(/g,"").replace(/\)/g,"").replace(/ - /g," ").toLowerCase().replace(/ /g,"-");
			}	
			
			leadpi = $.trim(obj.LeadPI[i]).toLowerCase().split(" ");
			if (obj.LeadPI[i].includes("+")){
				leadpi = $.trim(obj.LeadPI[i]).toLowerCase().split("+");
			}
			pis.push("<a href='"+Cookies.get('leadpi_url')+leadpi[1]+"-"+leadpi[0]+"'>"+obj.LeadPI[i]+"</a>");
			institutions.push("<a href='"+Cookies.get('institution_url')+inst_url+"'>"+o+"</a>");
			
		}
	}
	if (obj.ProtocolName){
                for (var i = 0; i < obj.ProtocolName.length; i++) {
                        o = $.trim(obj.ProtocolName[i]);
                        if (o != ""){
                                inst_url = o.replace(/\./g,"-").replace(/\(/g,"-").replace(/\)/g,"-").replace(/ - /g,"-").replace(/:/g,"-").replace(/,/g,"-").replace(/\//g,"-").toLowerCase().replace(/ /g,"-");
     				while (inst_url.includes("--") || inst_url.startsWith("-") || inst_url.endsWith("-")){
					inst_url = inst_url.replace(/--/g,"-");
					inst_url = inst_url.trim("-");
				}
                        }
                        protocols.push("<a href='"+Cookies.get('protocol_url')+inst_url+"'>"+o+"</a>");

                }
        }
	if (obj.Organ){
		for (var i = 0; i < obj.Organ.length; i++) {
			o = $.trim(obj.Organ[i]);
			if (o != ""){
				orgs.push("<a href='"+Cookies.get('organ_url')+o.toLowerCase()+"'>"+o+"</a>");
			}
		}
	}
	return [institutions, pis, orgs, protocols];
}

function generate_edrn_links(obj){
	var institutions = [];
	var protocols = [];
	var pis = [];
	var orgs = [];
	if (obj.Institution){
		for (var i = 0; i < obj.Institution.length; i++) {
			o = $.trim(obj.Institution[i]);
			if (o != "" && obj.InstitutionId && obj.InstitutionId[i] && $.trim(obj.InstitutionId[i]) != ""){
				inst_split = o.replace(".","").toLowerCase().split(" ");
				inst_url = $.trim(obj.InstitutionId[i]);
				for (var c = 0; c < inst_split.length; c++) {
					if (!inst_split[c]){
						continue;
					}
					if ((inst_url.length+$.trim(inst_split[c]).length+1) > 50){
						break;
					}

					inst_url += "-"+$.trim(inst_split[c]);
				}
				
				leadpi = $.trim(obj.LeadPI[i]).toLowerCase().split(" ");
				if (obj.LeadPI[i].includes("+")){
					leadpi = $.trim(obj.LeadPI[i]).toLowerCase().split("+");
				}
				pis.push("<a href='"+Cookies.get('institution_url')+inst_url+"/"+leadpi[1]+"-"+leadpi[0]+"'>"+obj.LeadPI[i]+"</a>");
				institutions.push("<a href='"+Cookies.get('institution_url')+inst_url+"'>"+o+"</a>");
			
			}
		}
	}
	if (obj.ProtocolName){
		for (var i = 0; i < obj.ProtocolName.length; i++) {
			o = $.trim(obj.ProtocolName[i]);
			//console.log((inst_url.length+$.trim(inst_split[c]).length+1));
			if (o != "" && o != "Unknown"){
				inst_url_clean = o.replace(/\./g,"-").replace(/'/g,"-").replace(/&/,"-").replace(/;/,"-").replace(/#/,"-").replace(/\(/g,"-").replace(/\)/g,"-").replace(/ - /g,"-").replace(/:/g,"-").replace(/,/g,"-").replace(/\//g,"-").toLowerCase().replace(/ /g,"-");
				/*while (inst_url_clean.includes("--") || inst_url_clean.startsWith("-") || inst_url_clean.endsWith("-")){
                                        inst_url_clean = inst_url_clean.replace(/--/g,"-");
                                        inst_url_clean = inst_url_clean.trim("-");
                                }*/

				inst_split = inst_url_clean.toLowerCase().split("-");

				inst_url = $.trim(obj.ProtocolId[i]);
				if (o == "No Associated Protocol"){
					inst_url = o;
					protocols.push(o);
				}else{
					for (var c = 0; c < inst_split.length; c++) {
						if (!inst_split[c]){
							continue;
						}
						if ((inst_url.length+$.trim(inst_split[c]).length+1) > 50){
							break;
						}
						inst_url += "-"+$.trim(inst_split[c]);
					}
					protocols.push("<a href='"+Cookies.get('protocol_url')+inst_url+"'>"+o+"</a>");
				}
			}
		}
	}
	
	if (obj.Organ){
		for (var i = 0; i < obj.Organ.length; i++) {
			o = $.trim(obj.Organ[i]);
			if (o != ""){
				orgs.push("<a href='"+Cookies.get('organ_url')+o+"'>"+o+"</a>");
			}
		}
	}
	return [institutions, pis, orgs, protocols];
}


function get_url_vars(){
    var $_GET = {};

    document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
        function decode(s) {
            return decodeURIComponent(s.split("+").join(" "));
        }
        $_GET[decode(arguments[1])] = decode(arguments[2]);
    });
    return $_GET;
}

function load_pagination(divid, size, cpage){
	$('#'+divid+"_pagination_top").empty();
	$('#'+divid+"_pagination_bottom").empty();
	var lowerbound = 1;
	var fastbackward = 1;
	var upperbound = Math.ceil(size / 10);
	var fastforward = Math.ceil(size / 10);
	cpage = Math.floor(cpage / 10);
	if (cpage - 5 > lowerbound){
		lowerbound = cpage - 5;
	}
	if (cpage + 5 < upperbound){
		upperbound = cpage + 5;
		/*if (upperbound < 10){
			upperbound =10;
		}*/
	}
	if (cpage - 20 > fastbackward){
		fastbackward = cpage - 20;
	}
	if (cpage + 20 < fastforward){
		fastforward = cpage + 20;
	}
	$('#'+divid+"_pagination_top").append('<li class="page-item"><a class="page-link" onclick="paginate(\''+divid+'\','+fastbackward+');">«</a></li>');
	$('#'+divid+"_pagination_bottom").append('<li class="page-item"><a class="page-link" onclick="paginate(\''+divid+'\','+fastbackward+');">«</a></li>');
	//console.log(cpage);
	//console.log(lowerbound);
	//console.log(upperbound);
	for(var idx=lowerbound;idx<upperbound+1;idx++){
		if (parseInt(idx) == parseInt(cpage)+1){
			$('#'+divid+"_pagination_top").append('<li class="page-item active"><a class="page-link" onclick="paginate(\''+divid+'\','+idx+');">'+idx+'</a></li>');
			$('#'+divid+"_pagination_bottom").append('<li class="page-item active"><a class="page-link" onclick="paginate(\''+divid+'\','+idx+');">'+idx+'</a></li>');
		}else{
			$('#'+divid+"_pagination_top").append('<li class="page-item"><a class="page-link" onclick="paginate(\''+divid+'\','+idx+');">'+idx+'</a></li>');
			$('#'+divid+"_pagination_bottom").append('<li class="page-item"><a class="page-link" onclick="paginate(\''+divid+'\','+idx+');">'+idx+'</a></li>');
		}
	}
	$('#'+divid+"_pagination_top").append('<li class="page-item"><a class="page-link" onclick="paginate(\''+divid+'\','+fastforward+');">»</a></li>');
	$('#'+divid+"_pagination_bottom").append('<li class="page-item"><a class="page-link" onclick="paginate(\''+divid+'\','+fastforward+');">»</a></li>');
}

function paginate(divid, cpage){
	var get_var = get_url_vars();
	if (divid == 'files'){
		setup_labcas_dataset_data("datasetfiles",'id:"'+get_var["dataset_id"]+'"', 'DatasetId:"'+get_var["dataset_id"]+'"', cpage-1); 
	}else if (divid == 'collections_search' || divid == 'datasets_search' || divid == 'files_search'){
		setup_labcas_search(get_var["search"], divid, cpage-1);
	}
}
function escapeRegExp(string) {
      return string.replace(/[\.\*\?\^\$\{\}\(\)\|\[\]\\~&!": ]/g, '\\$&'); // $& means the whole matched string
}

function formatTimeOfDay(millisSinceEpoch) {
  var secondsSinceEpoch = (millisSinceEpoch / 1000) | 0;
  var secondsInDay = ((secondsSinceEpoch % 86400) + 86400) % 86400;
  var seconds = secondsInDay % 60;
  var minutes = ((secondsInDay / 60) | 0) % 60;
  var hours = (secondsInDay / 3600) | 0;
  return hours + (minutes < 10 ? ":0" : ":")
      + minutes + (seconds < 10 ? ":0" : ":")
      + seconds;
}
function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}
function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
      now = Date.now();
    }
}


function checkWindow(win){

	if(!win || win.closed || typeof win.closed=='undefined') 
	{ 
		// Internet Explorer 6-11
		var isIE = /*@cc_on!@*/false || !!document.documentMode;

		var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
		var isFirefox = typeof InstallTrigger !== 'undefined';

		var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
		if( isChrome ){
			alert("Download blocked. To fix this for Chrome:\nGo to Preferences->Site Settings->Pop-ups->Allow->Add:\n"+window.location.hostname);	
		}else if ( isSafari ){
			alert("Download blocked. To fix this for Safari:\nGo to Safari->Preferences->Security->Uncheck \"Block pop-up windows\"");
		}else if ( isFirefox ){
			alert("Download blocked. To fix this for Firefox:\nGo to Firefox->Preferences->Content->Pop-ups->Exceptions->Add: "+window.location.hostname);
		}else if ( isIE ){
			alert("Download blocked. Please fix this for Internet Explorer.");
		}else{
			alert("Download blocked. Please fix this for your respective browser.");
		}
		return "popup_blocked";
	}
	return "worked";
}
function download_file(val, type){
	var dataurl = Cookies.get('environment')+"/data-access-api/download?id="+val;
	if (UrlExists(dataurl)){
		if (type == "multiple"){
			win = window.open(dataurl, '_blank');
			outcome = checkWindow(win);
			/*if (outcome == "worked"){
				win.close();
			}*/
			return outcome;
		}else{
			location.href = dataurl;
		}
	}else{
		alert("Error! The following file not available for download:\n"+decodeURI(val).replace(/\\/g,'')+'\n\nPlease reach out to ic-portal@jpl.nasa.gov.');
	}
	
}
function download_files(formname){
    var download_list = [];
    $('#' + formname + ' input[type="checkbox"]').each(function() {
        if ($(this).is(":checked")) {
            //alert($(this).val());
            download_list.push($(this).val());
            //var dataurl = Cookies.get('environment')+"/data-access-api/download?id="+$(this).val();
	    //console.log("Downloading2 "+dataurl);
		
	    //window.open(dataurl, '_parent');
	    //wait(1000);
            /*$.ajax({
		url: Cookies.get('environment')+"/data-access-api/download?id="+$(this).val(),
		type: 'GET',
		beforeSend: function() {
		    console.log("Downloading ");
		},
		complete: function() {
	            //console.log("Downloading "+$(this).val());
	            console.log("Downloading "+dataurl);
		    window.location = dataurl;
		}
	    });*/
        }
    });
    var get_var = get_url_vars();
    Cookies.set("login_redirect", "/labcas-ui/d/index.html?dataset_id="+get_var["dataset_id"])
    Cookies.set('download_list',JSON.stringify(download_list));
    window.location.replace("/labcas-ui/download.html");
}
function reset_search_filters(){
      var get_var = get_url_vars();
        Cookies.set("search", get_var["search"]);
        Cookies.set("search_filter", "off");


        $.each(Cookies.get("filters").split(","), function(ind, head) {
                var divs = Cookies.get(head+"_filters_div").split(",");
                $.each(divs, function(i, divhead) {
                        Cookies.set($.trim(divhead), "");
                        if(divhead.includes("_num_")){
                                Cookies.set($.trim(divhead)+"_0","");
                                Cookies.set($.trim(divhead)+"_1","");
                                Cookies.set($.trim(divhead)+"_max_0","");
                                Cookies.set($.trim(divhead)+"_max_1","");
                        }else{
                                Cookies.set($.trim(divhead)+"_val", "");
                        }
                });
        });
        Cookies.set("search", "*");
	window.history.replaceState({}, document.title, "/" + "labcas-ui/s/index.html?search=*");
}
function UrlExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404 && http.status !=500;
}
