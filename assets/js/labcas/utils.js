var user_data = {};
$().ready(function() {
	if(localStorage.getItem("userdata") && localStorage.getItem("userdata") != "None"){
		user_data = JSON.parse(localStorage.getItem("userdata"));
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
			$.each( json, function( key, val ) {
				localStorage.setItem(key, val);
			});
	
			user_data = {"FavoriteCollections":[],"FavoriteDatasets":[],"FavoriteFiles":[]};
			if(localStorage.getItem("userdata") && localStorage.getItem("userdata") != "None"){
				var data = localStorage.getItem("userdata");
			
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
			localStorage.setItem("userdata",  JSON.stringify(user_data));
			Cookies.remove('JasonWebToken');
		        $('#login_logout').html('<i class="nc-icon nc-button-power"></i> Log in')
		        $('#login_logout').removeClass("text-danger");
		        $('#login_logout').addClass("text-success");
		}});
	}
}

function writeUserData(udata, noreload){
	$.ajax({
        url: localStorage.getItem('environment')+"/data-access-api/userdata/create",
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
        },
        type: 'POST',
        data: udata,
        contentType:"application/json",
        dataType: 'json',
        success: function (data) {
            //console.log(data);
            localStorage.setItem("userdata",  udata);
	    if(!noreload){
		    window.location.reload();
	    }
        },
        error: function(){
             //alert("Login expired, please login...");
             //window.location.replace("/labcas-ui/application/pages/login.html");
         }
    });
    
}
function getUserData(){
	$.ajax({
		url: localStorage.getItem('environment')+"/data-access-api/userdata/read?id="+Cookies.get('user'),
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
			localStorage.setItem("userdata",  JSON.stringify(user_data_tmp));
		},
		error: function(){
			 //alert("Login expired, please login...");
			 //window.location.replace("/labcas-ui/application/pages/login.html");
		 }
	});
}
function query_labcas_api(url, customfunction){
        $.ajax({
                url: url,
                beforeSend: function(xhr) {
                        if(Cookies.get('token') && Cookies.get('token') != "None"){
                                xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
                        }
                },
                type: 'GET',
                dataType: 'json',
                processData: false,
                success: function (data) {
                        customfunction(data);
                },
                error: function(e){
                        if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                                   localStorage.setItem("logout_alert","On");
                                 alert(formatTimeOfDay($.now()) + ": Login expired, please login...");
                        }
                        window.location.replace("/labcas-ui/index.html");
                 }
        });


}
function save_favorite(labcas_id, labcas_type, ele){
	var user_id = Cookies.get('user');
	$.ajax({
        url: localStorage.getItem('environment')+"/data-access-api/userdata/read?id="+user_id,
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
			if ($(ele).hasClass("btn-info")){
				$(ele).removeClass("btn-info");
				$(ele).addClass("btn-success")
			}else if($(ele).hasClass("btn-success")){
                                $(ele).removeClass("btn-success")
				$(ele).addClass("btn-info");
			}else if($(ele).css("color") == "rgb(0, 0, 255)"){
				$(ele).css("color","#87CB16");
			}else if($(ele).css("color") == "rgb(135, 203, 22)"){
				$(ele).css("color","#0000FF")

			}
			writeUserData(JSON.stringify(user_data_tmp), true);
		},
        error: function(){
             //alert("Login expired, please login...");
             //window.location.replace("/labcas-ui/application/pages/login.html");
         }
    });
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
			pis.push("<a href='"+localStorage.getItem('leadpi_url')+leadpi[1]+"-"+leadpi[0]+"'>"+obj.LeadPI[i]+"</a>");
			institutions.push("<a href='"+localStorage.getItem('institution_url')+inst_url+"'>"+o+"</a>");
			
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
                        protocols.push("<a href='"+localStorage.getItem('protocol_url')+inst_url+"'>"+o+"</a>");

                }
        }
	if (obj.Organ){
		for (var i = 0; i < obj.Organ.length; i++) {
			o = $.trim(obj.Organ[i]);
			if (o != ""){
				orgs.push("<a href='"+localStorage.getItem('organ_url')+o.toLowerCase()+"'>"+o+"</a>");
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
				if (obj.LeadPI[i] && obj.LeadPI[i].includes("+")){
					leadpi = $.trim(obj.LeadPI[i]).toLowerCase().split("+");
				}
				pis.push("<a href='"+localStorage.getItem('institution_url')+inst_url+"/"+leadpi[1]+"-"+leadpi[0]+"'>"+obj.LeadPI[i]+"</a>");
				institutions.push("<a href='"+localStorage.getItem('institution_url')+inst_url+"'>"+o+"</a>");
			
			}
		}
	}
	if (obj.ProtocolName){
		for (var i = 0; i < obj.ProtocolName.length; i++) {
			o = $.trim(obj.ProtocolName[i]);
			//console.log((inst_url.length+$.trim(inst_split[c]).length+1));
			if (o != "" && o != "Unknown"){
				inst_url_clean = o.replace(/\./g,"-").replace(/'/g,"-").replace(/&/,"-").replace(/;/,"-").replace(/#/,"-").replace(/\(/g,"-").replace(/\)/g,"-").replace(/ - /g,"-").replace(/:/g,"-").replace(/,/g,"-").replace(/\//g,"-").toLowerCase().replace(/ /g,"-");

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
					protocols.push("<a href='"+localStorage.getItem('protocol_url')+inst_url+"'>"+o+"</a>");
				}
			}
		}
	}
	
	if (obj.Organ){
		for (var i = 0; i < obj.Organ.length; i++) {
			o = $.trim(obj.Organ[i]);
			if (o != ""){
				orgs.push("<a href='"+localStorage.getItem('organ_url')+o+"'>"+o+"</a>");
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
	}
	if (cpage - 20 > fastbackward){
		fastbackward = cpage - 20;
	}
	if (cpage + 20 < fastforward){
		fastforward = cpage + 20;
	}
	$('#'+divid+"_pagination_top").append('<li class="page-item"><a class="page-link" onclick="paginate(\''+divid+'\','+fastbackward+');">«</a></li>');
	$('#'+divid+"_pagination_bottom").append('<li class="page-item"><a class="page-link" onclick="paginate(\''+divid+'\','+fastbackward+');">«</a></li>');
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
	}else if (divid == 'collectionfiles' ){
                console.log("HERE");
                query_labcas_api(localStorage.getItem('environment')+"/data-access-api/files/select?q=DatasetId:"+get_var["collection_id"]+"/"+get_var["collection_id"]+"&wt=json&indent=true&start="+(cpage-1)*10, fill_collection_level_files);
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
		var isEdge = window.navigator.userAgent.indexOf("Edge") > -1;


		if( isChrome ){
			if ( isMacintosh() ){
				$('#alertHTML').html("Download blocked. To fix this for Chrome:<br>The path required is \"Chrome\" → Preferences → Privacy and security → <br>Site Settings → Content, Pop-ups and redirects → Allow, Add:<br>"+window.location.hostname);
			}
			if ( isWindows() ){
				$('#alertHTML').html("Download blocked. To fix this for Chrome:<br>The path required is (⋮) → Settings → Privacy and security → <br>Site Settings → Content, Pop-ups and redirects → Allow, Add:<br>"+window.location.hostname);
			}
	
			if ( isEdge ){
				$('#alertHTML').html("Download blocked. To fix this for Chrome:<br>The path is \"⋯\" → Settings → Privacy and security → Pop-ups and redirects → Allow, add, "+window.location.hostname+", Add");
			}
		}else if ( isSafari ){
			$('#alertHTML').html("Download blocked. To fix this for Safari:<br>The path is \"Safari\" → Preferences → Websites → Pop-up Windows → "+window.location.hostname+" → Drop-down menu, \"Allow\"");
		}else if ( isFirefox ){
			if ( isMacintosh() ){
				$('#alertHTML').html("Download blocked. To fix this for Firefox:<br>The path is \"Firefox\" → Preferences → Privacy & Security → Block pop-up windows, \"Exceptions…\" → add "+window.location.hostname+", \"Allow\", Save Changes.: ");
			}if ( isWindows() ){
				$('#alertHTML').html("Download blocked. To fix this for Firefox:<br>The path is (☰) → Options → Privacy & Security → Block pop-up windows, \"Exceptions…\" → add "+window.location.hostname+", \"Allow\", Save Changes.: ");
			}
		}else if ( isIE ){
			$('#alertHTML').html("Download blocked. Please fix this for Internet Explorer.");
		}else{
			$('#alertHTML').html("Download blocked. Please fix this for your respective browser.");
		}
		$('#errorModal').modal({backdrop: 'static', keyboard: false});
		$('#errorModal').modal('show');
		return "popup_blocked";
	}
	return "worked";
}

function checkSize(filecount, filesize, threshold){
	$('#sizeHTML').html("There are <B><font color='red'>"+filecount+"</font></B> files with total size of <B><font color='red'>"+filesize+"</font></B>. This is more than the <B><font color='red'>"+threshold+"</font></B> recommended download size from a web browser. If you'd like to proceed, the browser will initiate a series of downloads, please keep your browser and internet connection open for the duration of the download. Alternatively, you may download the below script that can be run through your command prompt/terminal instead with minimal interferance.");
	$('#sizeModal').modal({backdrop: 'static', keyboard: false});
	$('#sizeModal').modal('show');
}

function resume_download(){
	localStorage.setItem('download_size',0);
	window.location.replace("/labcas-ui/download.html");
}

function download_file(val, type){
	var dataurl = localStorage.getItem('environment')+"/data-access-api/download?id="+val;
	console.log(dataurl);
	if (UrlExists(dataurl)){
		if (type == "multiple"){
			win = window.open(dataurl, '_blank');
			outcome = checkWindow(win);
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
    var download_size = 0;
    $('#' + formname + ' input[type="checkbox"]').each(function() {
        if ($(this).is(":checked")) {
            download_list.push($(this).val().replace("&","%26"));
	        download_size += parseInt(this.getAttribute("data-valuesize"));
        }
    });
    var get_var = get_url_vars();
    if (get_var["dataset_id"] && get_var["dataset_id"] != "undefined"){
	    Cookies.set("login_redirect", "/labcas-ui/d/index.html?dataset_id="+get_var["dataset_id"])
    }else if (get_var["search"]){
	    Cookies.set("login_redirect", "/labcas-ui/s/index.html?search="+get_var["search"])
    }
    localStorage.setItem('download_list',JSON.stringify(download_list));
    localStorage.setItem('download_size',download_size);
    window.location.replace("/labcas-ui/download.html");
}
function download_dataset(dataset){
    dataset = dataset.replace("%5C%20","%20").replace("%20","%5C%20").replace(" ","%5C%20");
	console.log(localStorage.getItem('environment')+"/data-access-api/files/select?q=DatasetId:"+dataset+"&wt=json&indent=true&rows=10000");
	query_labcas_api(localStorage.getItem('environment')+"/data-access-api/files/select?q=DatasetId:"+dataset+"&wt=json&indent=true&rows=10000", generate_dataset_file_list);
}
function generate_dataset_file_list(data){
	var download_list = [];
	var download_size = 0;
	$.each(data.response.docs, function(key, value) {
                console.log(key);
                console.log(value.id);
                var html_safe_id = encodeURI(escapeRegExp(value.id));
                console.log(html_safe_idi);
		download_list.push(html_safe_id.replace("&","%26"));
		download_size += value.FileSize;
        });
	localStorage.setItem('download_list',JSON.stringify(download_list));
	localStorage.setItem('download_size',download_size);
	window.location.replace("/labcas-ui/download.html");
}
function download_script(filename) {
  var element = document.createElement('a');
  if (isMacintosh() || isLinux()){
	  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorage.getItem("download_script").replace('----labcaspass----',"Bearer " + Cookies.get('token'))));
	  element.setAttribute('download', "labcas_download.sh");
  }else if(isWindows()){
	  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorage.getItem("download_script_win").replace('----labcaspass----',"Bearer " + Cookies.get('token'))));
	  element.setAttribute('download', "labcas_download.ps1");
  }

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
  if (isMacintosh() || isLinux()){
	  $('#fileHTML').html("Now that you've downloaded the download script, you will also need to click below to download the script file list. Make sure the downloaded file list is stored in the same folder as the earlier download script. <B><font color=red>Please also ensure no previous file named files.csv are in the same folder directory.</font></B> In order to run the download, open a terminal, navigate to the folder of your download script and files.csv, then type:<br>sh labcas_download.sh");
  }else if(isWindows()){
	  $('#fileHTML').html("Now that you've downloaded the download script, you will also need to click below to download the script file list. Make sure the downloaded file list is stored in the same folder as the earlier download script. <B><font color=red>Please also ensure no previous file named files.csv are in the same folder directory.</font></B> In order to run the download, right click on the data_download.ps1 file and select \"Run with PowerShell\".");

  }
	$('#fileModal').modal({backdrop: 'static', keyboard: false});
        $('#fileModal').modal('show');
}
function download_script_files() {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.parse(localStorage.getItem("download_list")).join("\n"+localStorage.getItem('environment')+"/data-access-api/download?id=")));
  element.setAttribute('download', "files.csv");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);

  localStorage.setItem("download_list",JSON.stringify([]));
  $('#download_list_link').hide();
   //window.location.reload();

}

function reset_search_filters(){
      var get_var = get_url_vars();
        localStorage.setItem("search", get_var["search"]);
        localStorage.setItem("search_filter", "off");


        $.each(localStorage.getItem("filters").split(","), function(ind, head) {
                var divs = localStorage.getItem(head+"_filters_div").split(",");
                $.each(divs, function(i, divhead) {
                        localStorage.setItem($.trim(divhead), "");
                        if(divhead.includes("_num_")){
                                localStorage.setItem($.trim(divhead)+"_0","");
                                localStorage.setItem($.trim(divhead)+"_1","");
                                localStorage.setItem($.trim(divhead)+"_max_0","");
                                localStorage.setItem($.trim(divhead)+"_max_1","");
                        }else{
                                localStorage.setItem($.trim(divhead)+"_val", "");
                        }
                });
        });
        localStorage.setItem("search", "*");
	window.history.replaceState({}, document.title, "/" + "labcas-ui/s/index.html?search=*");
}
function isMacintosh() {
  return navigator.platform.indexOf('Mac') > -1
}

function isWindows() {
  return navigator.platform.indexOf('Win') > -1
}
function isLinux() {
  return navigator.platform.indexOf('Linux') > -1
}
function UrlExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404 && http.status !=500;
}
function setupBootstrapTable(table){
    var $table = $('#'+table);
    $table.bootstrapTable({
            toolbar: ".toolbar",
            clickToSelect: true,
            showRefresh: true,
            search: true,
            showToggle: true,
            showColumns: true,
            pagination: true,
            searchAlign: 'left',
            pageSize: 50,
            clickToSelect: false,
            pageList: [8, 10, 25, 50, 100],

            formatShowingRows: function(pageFrom, pageTo, totalRows) {
                //do nothing here, we don't want to show the text "showing x of y from..."
            },
            formatRecordsPerPage: function(pageNumber) {
              return pageNumber + " rows visible";
            },
            icons: {
               refresh: 'fa fa-refresh',
               toggle: 'fa fa-th-list',
               columns: 'fa fa-columns',
               detailOpen: 'fa fa-plus-circle',
               detailClose: 'fa fa-minus-circle'
           }
    });

    //activate the tooltips after the data table is initialized
    $('[rel="tooltip"]').tooltip();

    $(window).resize(function() {
        $table.bootstrapTable('resetView');
    });

}

//IntroJS Trigger
function introWizard(check_first_time){
	if(check_first_time){
		if (localStorage.getItem("first_time_user") == "false"){
			return;
		}
	}
	localStorage.setItem("first_time_user","false");
	introJs().start();
}

function accepted_image_check(f){
    var img_ext = [".svs",".jpg",".gif",".jpeg",".dcm",".dicom",".png",".tif",".tiff"];
    var pass_flag = false;
    $.each(img_ext, function(key,value){
       if (f.toLowerCase().endsWith(value)){
           pass_flag = true;
           return;
       }
    });
    return pass_flag;
}
function generate_image_file_list(data){
    var image_list = [];
    var image_size = 0;
    var image_type = "image";
    console.log(data);
    $.each(data.response.docs, function(key, value) {
        console.log(key);
        console.log(value.id);
        if ( accepted_image_check(value.id) ){
            var html_safe_id = encodeURI(escapeRegExp(value.id));
            if (value.id.toLowerCase().endsWith(".dcm") || value.id.toLowerCase().endsWith(".dicom")){
                image_type = "dicoms";
            }
            console.log(html_safe_id);
            image_list.push(localStorage.getItem('environment')+"/data-access-api/download?id="+html_safe_id);
        }
    });
    
    localStorage.setItem(image_type,JSON.stringify(image_list));
    var get_var = get_url_vars();

    if (get_var["dataset_id"] && get_var["dataset_id"] != "undefined"){
        Cookies.set("login_redirect", "/labcas-ui/d/index.html?dataset_id="+get_var["dataset_id"])
    }else if (get_var["search"]){
        Cookies.set("login_redirect", "/labcas-ui/s/index.html?search="+get_var["search"])
    }
    if (image_type == "dicoms"){
       window.location.replace("/labcas-ui/i/index.html");
    }else{
       window.location.replace("/labcas-ui/z/index.html");
    }
}


function submitImage(formname, dataset){
    if ( $('#check_all:checked').length ){
        var get_var = get_url_vars();
        if (get_var["dataset_id"] && get_var["dataset_id"] != "undefined"){
            dataset = get_var["dataset_id"];
            console.log(localStorage.getItem('environment')+"/data-access-api/files/select?q=DatasetId:"+dataset+"&wt=json&indent=true&rows=10000");
            query_labcas_api(localStorage.getItem('environment')+"/data-access-api/files/select?q=DatasetId:"+dataset+"&wt=json&indent=true&rows=10000", generate_image_file_list);

         }
        //submitDicom('files-table','all',dataset_id)
        return;
    }else{
        submitImageData(formname);
    }

}

function submitImageData(formname, dicom){
    var image_list = [];
    var histomics_list = [];
    var image_type = "image";
    console.log(dicom);
    
    if (dicom){
        image_list.push(localStorage.getItem('environment')+"/data-access-api/download?id="+$(dicom).val());
        if ($(dicom).val().endsWith(".dcm") || $(dicom).val().endsWith(".dicom")){
            image_type = "dicoms";
        }
    }else{
        $('#' + formname + ' input[type="checkbox"]').each(function() {
            if ($(this).is(":checked")) {
                image_list.push(localStorage.getItem('environment')+"/data-access-api/download?id="+$(this).val());
                histomics_list.push([$(this).data("loc"),$(this).data("name"),$(this).data("version")]);
                if ($(this).val().endsWith(".dcm") || $(this).val().endsWith(".dicom")){
                    image_type = "dicoms";
                }
            }
        });
    }
    
    localStorage.setItem(image_type,JSON.stringify(image_list));
    localStorage.setItem("image_data",JSON.stringify(histomics_list));

    var get_var = get_url_vars();
    
    if (get_var["dataset_id"] && get_var["dataset_id"] != "undefined"){
	    Cookies.set("login_redirect", "/labcas-ui/d/index.html?dataset_id="+get_var["dataset_id"])
    }else if (get_var["search"]){
	    Cookies.set("login_redirect", "/labcas-ui/s/index.html?search="+get_var["search"])
    }
    console.log(image_type);
    if (image_type == "dicoms"){
        window.location.replace("/labcas-ui/i/index.html");
    }else{
        window.location.replace("/labcas-ui/z/index.html");
    }
}

function changeFrameSrc(frame, src){
    $('#'+frame).attr('src', src);
    $('#img_frame').contents().find('#h-navbar-brand').html('Image Viewer');
}


function showHistImage(){
    /*images = JSON.parse(localStorage.getItem('image'));
    console.log(JSON.stringify({'token':Cookies.get('token'), 'image':images}));
    $.ajax({
        url: "http://david-server.local/cgi-bin/labcas_dsa_api.py",
        type: 'POST',
        data: JSON.stringify({'token':Cookies.get('token'), 'image':images}),
        dataType: "json",
        success: function (data) {
            $.each(data['image_id_list'], function( key, val ) {
                $("#image_list_table tbody").append("<tr><td><a href='#' onclick=\"changeFrameSrc('img_frame','http://localhost:8009/histomics#?image="+val['id']+"')\">"+val['name']+"</a></td></tr>");
            });
            // Updates needed to ensure css displays correctly within iframe
            document.getElementById('img_frame').onload = function() {
                console.log("Iframe loaded");
            };
            changeFrameSrc("img_frame", "http://localhost:8009/histomics#?image="+data['image_id_list'][0]['id']);
                $('#loading_viewer').hide();
                $('#viewer_content').show();
                wait(1000);
                $('#img_frame').contents().find('#h-navbar-brand').html('Image Viewer');
        },
        error: function(e){
            console.log("Image view failed");
            if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                   localStorage.setItem("logout_alert","On");
                 alert("You are currently logged out. Redirecting you to log in.");
            }
        }
    });*/
    images = JSON.parse(localStorage.getItem('image'));
    images_data = JSON.parse(localStorage.getItem('image_data'));
    show_flag = true;
    $.each(images_data, function( key, val ) {
        orchistrate_find(val[0], val[1], val[2], show_flag);
        show_flag = false;
    });

}

function orchistrate_find(query_folder, query_file, version, show_flag){
    var image_dsa_path = [];
    var root_collection = "5ffe07c63466812d58b4451a";
    var labcas_data_map = JSON.parse(localStorage.getItem("labcas_data")).collection_path_maps;
    query_folder = query_folder.replace("/usr/local/labcas/backend/archive/","");
    query_folder = query_folder.replace("&","%26");
    query_file = query_file.replace("&","%26");
    var collection_name = query_folder.split("/")[0];

    console.log("start");
    console.log(collection_name);
    query_folder = query_folder.replace(collection_name,labcas_data_map[collection_name]);
    console.log(query_folder);
    image_dsa_path = query_folder.split("/");
    console.log(image_dsa_path);

    recurse_dsa(root_collection, image_dsa_path.shift(), query_file, image_dsa_path, show_flag,'collection', version);
}

function recurse_dsa(sub_folder, sub_name, query_file, image_dsa_path, show_flag, parenttype, version){
    //console.log("recursive search");
    //console.log(sub_folder);
    //console.log(sub_name);
    //console.log(localStorage.getItem("dsa_api")+"/folder?parentType="+parenttype+"&parentId="+sub_folder+"&name="+sub_name+"&limit=50&sort=lowerName&sortdir=1");
    $.ajax({
        url: localStorage.getItem("dsa_api")+"/folder?parentType="+parenttype+"&parentId="+sub_folder+"&name="+sub_name+"&limit=50&sort=lowerName&sortdir=1",
        type: 'GET',
        success: function (data) {
            //console.log("Folder");
            //console.log(data);
            if (image_dsa_path.length > 0 && data.length > 0 && data[0]._id){
                 recurse_dsa(data[0]._id, image_dsa_path.shift(), query_file, image_dsa_path, show_flag, 'folder', version);
            }else{
                //console.log("FILE");
                //console.log(data);
                if (data.length > 0 && data[0]._id){
                    //console.log(localStorage.getItem("dsa_api")+"/item?folderId="+data[0]._id+"&name="+query_file+"&limit=50&sort=lowerName&sortdir=1");
                    $.ajax({
                        url: localStorage.getItem("dsa_api")+"/item?folderId="+data[0]._id+"&name="+query_file+"&limit=50&sort=lowerName&sortdir=1",
                        type: 'GET',
                        success: function (filedata) {
                            //console.log("looking within file");
                            //console.log(image_dsa_path.length);
                            //console.log(version);
                            //console.log("looking within file");
                            if (filedata.length > 0 && filedata[0]._id){
                                //console.log("looking within file 1");
                                $("#image_list_table tbody").append("<tr><td><a href='#' onclick=\"changeFrameSrc('img_frame','"+localStorage.getItem("dsa_image_viewer")+"?image="+filedata[0]._id+"')\">"+query_file+"</a></td></tr>");
                                if (show_flag){
                                    $('#loading_viewer').hide();
                                    $('#viewer_content').show();
                                    changeFrameSrc("img_frame", localStorage.getItem("dsa_image_viewer")+"?image="+filedata[0]._id);
                                }
                            }else if(image_dsa_path.length == 0 && version != "null"){
                                console.log("looking within file 2");
                                recurse_dsa(data[0]._id, version, query_file, image_dsa_path, show_flag, 'folder', "null");
                            }
                            else{
                                console.log("looking within file 3");
                                console.log("Something went wrong in recursive file/version search through DSA");
                            }
                        }
                    });
                }else{
                    console.log("Something went wrong in recursive folder search through DSA");
                }
            }
        },
        error: function(e){
            console.log("failed");
        }
    });
}

