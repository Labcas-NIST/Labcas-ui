var user_data = {};

//Omero related global variables
var omero_datasets = "";
var latest_base_url = localStorage.getItem("omero_base");
var omeroweb_url;
var base_urls;
var omero_csrf_token;
var login_flag = 0;

$().ready(function() {
	if(localStorage.getItem("userdata") && localStorage.getItem("userdata") != "None"){
		user_data = JSON.parse(localStorage.getItem("userdata"));
	}

	// Toggle plus minus icon on show hide of collapse element
	$(".collapse.show").each(function(){	
        	$(this).prev(".btn").find(".fa").addClass("fa-minus").removeClass("fa-plus");
        });
	$(".collapse").on('show.bs.collapse', function(){
        	$(this).prev(".btn").find(".fa").removeClass("fa-plus").addClass("fa-minus");
        }).on('hide.bs.collapse', function(){
        	$(this).prev(".btn").find(".fa").removeClass("fa-minus").addClass("fa-plus");
        });
	//Always do this, init functions
	
	setTimeout(function(){
        if (!(location.href.includes("/nist/index.html") || location.href.endsWith("/nist/") || location.href.endsWith("/nist") || location.href.includes("/nist/o/index.html"))){
            if(!localStorage.getItem('environment')){
                localStorage.setItem("environment","https://"+location.hostname.split(/\//)[0]);
            }
            query_labcas_api(localStorage.getItem('environment')+"/data-access-api/collections/select?q=*&facet=true&facet.limit=-1&wt=json&rows=0",get_labcas_collection_stats);
            query_labcas_api(localStorage.getItem('environment')+"/data-access-api/datasets/select?q=*&facet=true&facet.limit=-1&wt=json&rows=0",get_labcas_dataset_stats);
            query_labcas_api(localStorage.getItem('environment')+"/data-access-api/files/select?q=*&facet=true&facet.limit=-1&wt=json&rows=0",get_labcas_file_stats);
        }
      },1000);

});
function redirect_to_login(){
    console.log("Attempting to redirect to login...");
    if (localStorage.getItem("allow_redirect") == "true"){
        //window.location.replace("/nist/index.html?version=3.0.0");
    }else{

    }
}
function login_redirect(){
        if (Cookies.get("login_redirect")){
            window.location.replace(Cookies.get("login_redirect"));
        }else{
            window.location.replace("/nist/s/index.html?search=*");
        }
}
function baseName(str)
{
   var base = new String(str).substring(str.lastIndexOf('/') + 1); 
    if(base.lastIndexOf(".") != -1)       
        base = base.substring(0, base.lastIndexOf("."));
   return base;
}
function initCookies(){
	if(!Cookies.get("token") || Cookies.get("token") == "None"){
		$.ajax({
			url: '/nist/assets/conf/environment.cfg?26',
			dataType: 'json',
			async: false,
			success: function(json) {
			Cookies.set("user", "Sign in");
			$.each( json, function( key, val ) {
				if (typeof val == "string"){
				    localStorage.setItem(key, val);
				}else if(typeof val == "object"){
				    localStorage.setItem(key, JSON.stringify(val));
				}
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
            localStorage.setItem("userdata",  udata);
	    if(!noreload){
		    window.location.reload();
	    }
        },
        error: function(){
             console.log("Creating user profile failed... please troubleshoot");
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
			 console.log("read user data profile failed..., please troubleshoot");
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
			redirect_to_login();
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
             console.log("user fravorite profile failed... please troubleshoot");
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


function get_url_vars(){
    var $_GET = {};
    var url_vars = document.location.search.replace("\\&","%5C%26").replace("+","%5C%2B");
    url_vars.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
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
    }else if (divid == 'hierarchy_files'){
        setup_labcas_hierarchy_data(localStorage.getItem("hierarchy_file_query"), cpage-1)
	}else if (divid == 'collectionfiles' ){
        query_labcas_api(localStorage.getItem('environment')+"/data-access-api/files/select?q=DatasetId:"+get_var["collection_id"]+"/"+get_var["collection_id"]+"&wt=json&indent=true&start="+(cpage-1)*10, fill_collection_level_files);
    }
}
function escapeRegExp(string) {
      return string.replace(/[\*\?\^\$\{\}\(\)\|\[\]\\~&!":]/g, '\\$&'); // $& means the whole matched string
}
function replaceRegExp(string, replace) {
      return string.replace(/[\*\?\^\$\{\}\(\)\|\[\]\\~&!;\.\/ ":]/g, replace); // $& means the whole matched string
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

function usage_agreement(){
	$('#acceptHTML').html(localStorage.getItem("accept_msg"));
	$('#acceptModal').modal('show');
}

function checkSize(filecount, filesize, threshold){
	$('#sizeHTML').html("There are <B><font color='red'>"+filecount+"</font></B> files with total size of <B><font color='red'>"+filesize+"</font></B>. This is more than the <B><font color='red'>"+threshold+"</font></B> recommended download size from a web browser. If you'd like to proceed, the browser will initiate a series of downloads, please keep your browser and internet connection open for the duration of the download. Alternatively, you may download the below script that can be run through your command prompt/terminal instead with minimal interferance.");
	$('#sizeModal').modal({backdrop: 'static', keyboard: false});
	$('#sizeModal').modal('show');
}

function resume_download(){
	localStorage.setItem('download_size',0);
	window.location.replace("/nist/download.html?version=3.0.0");
}

function download_file(val, type){
	var dataurl = localStorage.getItem('environment')+"/data-access-api/download?id="+val.replace("\\&","%5C%26").replace("+","%5C%2B");
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
    var download_list = {};
    var download_size = 0;

    if (formname == "cart"){
        if ($('#cart_size').html() == '0 B'){
            alert("No files available to download, please select from search or dataset pages");
            return;
        }
	if (localStorage.getItem('cart_list')){
	    download_list = JSON.parse(localStorage.getItem('cart_list'));
	}
        if (localStorage.getItem('cart_size')){
            download_size = parseInt(localStorage.getItem('cart_size'));
	}
    }else{
	    $('#' + formname + ' input[type="checkbox"]').each(function() {
		if ($(this).is(":checked")) {
		    download_list[$(this).val().replace("&","%26").replace("+","%2B")] = [this.getAttribute("data-loc"), this.getAttribute("data-name"), this.getAttribute("data-version"), $(this).val()];
			download_size += parseInt(this.getAttribute("data-valuesize"));
		}
	    });
    }
    var get_var = get_url_vars();
    if (get_var["dataset_id"] && get_var["dataset_id"] != "undefined"){
	    Cookies.set("login_redirect", "/nist/d/index.html?dataset_id="+get_var["dataset_id"])
    }else if (get_var["search"]){
	    Cookies.set("login_redirect", "/nist/s/index.html?search="+get_var["search"].replace("&","%26"))
    }
    localStorage.setItem('download_list',JSON.stringify(download_list));
    localStorage.setItem('download_size',download_size);
    window.location.replace("/nist/download.html?version=3.0.0");
}
function download_dataset(dataset){
    var url = "";
    if (dataset == "hierarchy_query" && localStorage.getItem("hierarchy_file_query")){
	var file_query = localStorage.getItem("hierarchy_file_query");
	url = localStorage.getItem('environment')+"/data-access-api/files/select?q=*"+file_query+"&wt=json&indent=true&rows=2147483647";
    }else{
	dataset = dataset.replace("%5C%20","%20").replace("%20","%5C%20").replace(" ","%5C%20");
	url = localStorage.getItem('environment')+"/data-access-api/files/select?q=DatasetId:"+dataset+"&wt=json&indent=true&rows=10000";
    }
    console.log(url);
    query_labcas_api(url, generate_dataset_file_list);
}

function extract_item_from_list(array, what){
    return array.filter(function(element){ 
        return element !== what;
    });
}

function clear_cart(formname){
    var download_list = {};
    var download_size = 0;
    localStorage.setItem('cart_list',JSON.stringify(download_list));
    localStorage.setItem('cart_size',download_size);
	$('#' + formname + ' input[type="checkbox"]').each(function() {
        if ($(this).is(":checked")) {
		$(this).prop("checked", false);
	}});
    $('#cart-count').html(Object.keys(download_list).length);
	$('#cart_size').html("");
}

function init_file_checkboxes(formname){
    $('#' + formname + ' input[type="checkbox"]').change(function() {
        var download_list = {};
        var download_size = 0;
        if (localStorage.getItem('cart_list')){
            download_list = JSON.parse(localStorage.getItem('cart_list'));
        }
        if (localStorage.getItem('cart_size')){
            download_size = parseInt(localStorage.getItem('cart_size'));
        }
        var cart_item = $(this).val().replace("&","%26");
        if ($(this).is(":checked")) {
            download_list[cart_item] = [this.getAttribute("data-loc"), this.getAttribute("data-name"), this.getAttribute("data-version"), $(this).val()];
            download_size += parseInt(this.getAttribute("data-valuesize"));
        }else{
            if ( cart_item in download_list ){
            console.log("Deleting");
            console.log(cart_item);
            delete download_list[cart_item];
            download_size -= parseInt(this.getAttribute("data-valuesize"));
            }
        }
        localStorage.setItem('cart_list',JSON.stringify(download_list));
        localStorage.setItem('cart_size',download_size);
        set_cart_status();
   });
   set_cart_status();
}


function generate_dataset_file_list(data){
	var download_list = {};
	var download_size = 0;
	$.each(data.response.docs, function(key, value) {
                var html_safe_id = encodeURI(escapeRegExp(value.id)).replace("&","%26").replace("+","%2B");
		var version = value.DatasetVersion ? value.DatasetVersion : "";
		var fileloc = value.FileLocation ? value.FileLocation : "";
		var filename = value.FileName ? value.FileName : "";
		download_list[html_safe_id] = [fileloc, filename, version, html_safe_id];;
		download_size += value.FileSize;
        });
	localStorage.setItem('download_list',JSON.stringify(download_list));
	localStorage.setItem('download_size',download_size);
	window.location.replace("/nist/download.html?version=3.0.0");
}
function download_script(filename, ostype) {
	var element = document.createElement('a');
	var download_script_user = $('#download_script_user').val();
	var download_script_pass = $('#download_script_pass').val();

	var download_script_key = "Basic "+btoa(unescape(encodeURIComponent(download_script_user+':'+download_script_pass)));
	if (ostype == "linux" || ostype == "mac"){
	      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorage.getItem("download_script").replace('----labcaspass----',download_script_key)));
	      element.setAttribute('download', "labcas_download.sh");
	}else if(ostype == "windows"){
              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorage.getItem("download_script_win").replace('----labcaspass----',download_script_key)));
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
	$('#sizeModal').modal('hide');
	$('#fileModal').modal({backdrop: 'static', keyboard: false});
	$('#fileModal').modal('show');
}
function download_script_files() {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorage.getItem('environment')+"/data-access-api/download?id="+Object.keys(JSON.parse(localStorage.getItem("download_list"))).join("\n"+localStorage.getItem('environment')+"/data-access-api/download?id=")));
	element.setAttribute('download', "files.csv");

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);

	localStorage.setItem("download_list",JSON.stringify([]));
	$('#download_list_link').hide();
}

function reset_search_filters(){
      var get_var = get_url_vars();
        localStorage.setItem("search", get_var["search"].replace("&","%26"));
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
	window.history.replaceState({}, document.title, "/" + "nist/s/index.html?search=*");
}
function set_search_filters(params){
	reset_search_filters();
	localStorage.setItem("search_filter", "on");
	$.each(localStorage.getItem("filters").split(","), function(ind, head) {
            var divs = localStorage.getItem(head+"_filters_div").split(",");
            $.each(divs, function(i, divhead) {
			if (params[$.trim(divhead)]){
				localStorage.setItem($.trim(divhead), params[$.trim(divhead)]);
			}
            if(divhead.includes("_num_")){
				if (params[$.trim(divhead)+"_0"]){
					localStorage.setItem($.trim(divhead)+"_0", params[$.trim(divhead)+"_0"]);
					localStorage.setItem($.trim(divhead)+"_1",params[$.trim(divhead)+"_1"]);
					localStorage.setItem($.trim(divhead)+"_max_0",params[$.trim(divhead)+"_max_0"]);
					localStorage.setItem($.trim(divhead)+"_max_1",params[$.trim(divhead)+"_max_1"]);
				}
            }else{
				console.log(params[$.trim(divhead)+"_val"]);
				if (params[$.trim(divhead)+"_val"]){
					localStorage.setItem($.trim(divhead)+"_val", params[$.trim(divhead)+"_val"]);
				}
            }
            });
        });
	if (params["search"] && params["search"] != "*" && params["search"] != ""){
        localStorage.setItem("search", params["search"].replace("&","%26"));
		window.location.replace("/nist/s/index.html?search="+params["search"].replace("&","%26"));
	}else{
		window.location.replace("/nist/s/index.html?search=*");
	}
}

function get_labcas_collection_stats(data){
	$("#collection_total_count").html(data.response.numFound);
}

function get_labcas_dataset_stats(data){
	$("#dataset_total_count").html(data.response.numFound);
}

function get_labcas_file_stats(data){
	$("#file_total_count").html(data.response.numFound);
}
function get_labcas_dataset_file_stats(data){
	$("#collection_files_len").html(0);
}

function get_search_filters(){
    var get_var = get_url_vars();
	var params = {"search":localStorage.getItem("search").replace("&","%26")}

    $.each(localStorage.getItem("filters").split(","), function(ind, head) {
            var divs = localStorage.getItem(head+"_filters_div").split(",");
            $.each(divs, function(i, divhead) {
                    params[$.trim(divhead)] = localStorage.getItem($.trim(divhead));
                    if(divhead.includes("_num_")){
                            params[$.trim(divhead)+"_0"] = localStorage.getItem($.trim(divhead)+"_0");
                            params[$.trim(divhead)+"_1"] = localStorage.getItem($.trim(divhead)+"_1");
                            params[$.trim(divhead)+"_max_0"] = localStorage.getItem($.trim(divhead)+"_max_0");
                            params[$.trim(divhead)+"_max_1"] = localStorage.getItem($.trim(divhead)+"_max_1");
                    }else{
                            params[$.trim(divhead)+"_val"] = localStorage.getItem($.trim(divhead)+"_val");
                    }
            });
    });
	return params;
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
    var img_ext = [".svs",".jpg",".gif",".jpeg",".dcm",".DCM",".dicom",".png",".tif",".tiff",".scm",".scn",".qptiff"];
    var pass_flag = false;
    $.each(img_ext, function(key,value){
       if (f.toLowerCase().endsWith(value)){
           pass_flag = true;
           return;
       }
    });
    return pass_flag;
}
function acepted_omero_check(f){
    var img_ext = ["ome.tif","ome.tiff",".qptiff"];
    var pass_flag = false;
    $.each(img_ext, function(key,value){
       if (f.toLowerCase().endsWith(value)){
           pass_flag = true;
           return;
       }
    });
    return pass_flag;
}

function generate_accepted_image_solr_filters(){
	var img_ext = [".svs",".jpg",".gif",".jpeg",".dcm",".DCM",".dicom",".png",".tif",".tiff",".scm",".scn",".qptiff"];
	var fq = "(id:*"+img_ext.join("%20AND%20id:*")+")";
	return fq;
}

function check_dicom_multi(){
	var flag = false;
	var dicom_list_axial = [];
	var dicom_list_coronal = [];
	var dicom_list_sagittal = [];
	if ( localStorage.getItem('dicoms') ){
		var dicom_list = JSON.parse(localStorage.getItem('dicoms'));
		if (dicom_list.length > 0){
			$.each(dicom_list, function(key, value) {
				var fname = value.substring(value.lastIndexOf('/')+1);
				if (fname.startsWith("1mm_") || fname.startsWith("axial_")){
					dicom_list_axial.push(value);
					flag = true;
				}else if(fname.startsWith("coronal_")){
					dicom_list_coronal.push(value);
					flag = true;
				}else if(fname.startsWith("sagittal_")){
					dicom_list_sagittal.push(value);
					flag = true;
                                }
			});
		}
	}
	localStorage.setItem("dicoms1",JSON.stringify(dicom_list_axial));
	localStorage.setItem("dicoms2",JSON.stringify(dicom_list_coronal));
	localStorage.setItem("dicoms3",JSON.stringify(dicom_list_sagittal));
	localStorage.setItem("multi_dicom",flag);
	return flag;
}

function generate_image_file_list(data){
    var image_list = [];
    var histomics_list = [];
    var image_size = 0;
    var image_type = "image";
    $.each(data.response.docs, function(key, value) {
        if ( accepted_image_check(value.id) || accepted_image_check(value.FileName)){
            var html_safe_id = encodeURI(escapeRegExp(value.id));
            if (value.id.toLowerCase().endsWith(".dcm") || value.id.toLowerCase().endsWith(".dicom") || value.id.toLowerCase().endsWith(".DCM")
            || value.FileName.toLowerCase().endsWith(".dcm") || value.FileName.toLowerCase().endsWith(".dicom") || value.FileName.toLowerCase().endsWith(".DCM")
            ){
                image_type = "dicoms";
            }else if(acepted_omero_check(value.id)){
		image_type = "omeros";
	    }
            image_list.push(localStorage.getItem('environment')+"/data-access-api/download?id="+html_safe_id);

            //histomics
            var filename = value.FileName ? value.FileName : "";
            var version = value.DatasetVersion ? value.DatasetVersion : "";
            var loc = value.FileLocation ? value.FileLocation : "";

            histomics_list.push([loc,filename,version, html_safe_id]);
        }
    });
    
    localStorage.setItem(image_type,JSON.stringify(image_list));
    localStorage.setItem("image_data",JSON.stringify(histomics_list));
    var get_var = get_url_vars();

    if (get_var["dataset_id"] && get_var["dataset_id"] != "undefined"){
        Cookies.set("login_redirect", "/nist/d/index.html?dataset_id="+get_var["dataset_id"])
    }else if (get_var["search"]){
        Cookies.set("login_redirect", "/nist/s/index.html?search="+get_var["search"].replace("&","%26"))
    }
    if (image_type == "dicoms"){
	if (check_dicom_multi()){
	       window.location.replace("/nist/i/mindex.html?version=3.0.0");
	}else{
	       window.location.replace("/nist/i/index.html?version=3.0.0");
	}
    }else if(image_type = "omeros"){
	window.location.replace("/nist/o/index.html?version=3.0.0");
    }else{
       window.location.replace("/nist/z/index.html?version=3.0.0");
    }
}

function checkDatasetContainsDicom(dataset_id, safe_dataset_id, data){
	if (!(data.response.numFound > 0)){
		$('#view_'+safe_dataset_id).show();
	}
}

function submitImage(formname, dataset){
    if ( $('#check_all:checked').length || dataset){
        console.log("Loading images from dataset:");
        console.log(dataset);
        var get_var = get_url_vars();
        if (dataset){
            url = "";
            if (dataset == "hierarchy_query" && localStorage.getItem("hierarchy_file_query")){
                var file_query = localStorage.getItem("hierarchy_file_query");
                url = localStorage.getItem('environment')+"/data-access-api/files/select?q=*"+file_query+"&wt=json&indent=true&rows=2147483647";
            }else{
                dataset = dataset.replace("%5C%20","%20").replace("%20","%5C%20").replace(" ","%5C%20");
                url = localStorage.getItem('environment')+"/data-access-api/files/select?q=DatasetId:"+dataset+"&wt=json&indent=true&rows=10000";
            }
            console.log(url);
            query_labcas_api(url, generate_image_file_list);

         }
        return;
    }else{
        submitImageData(formname);
    }

}

function submitSingleImageData(image, loc, name, version){
        var image_list = [];
        var histomics_list = [];
	var image_type = "image";
        image_list.push(localStorage.getItem('environment')+"/data-access-api/download?id="+image);
        histomics_list.push([loc,name,version, image]);
        if (name.endsWith(".dcm") || name.endsWith(".dicom") || name.endsWith(".DCM")){
            image_type = "dicoms";
        }
        else if (acepted_omero_check(name)){
            image_type = "omeros";
        }else{
		localStorage.setItem("image_data",JSON.stringify(histomics_list));
	}
        localStorage.setItem(image_type,JSON.stringify(image_list));
        localStorage.setItem("omeros",JSON.stringify(histomics_list));
        var get_var = get_url_vars();

            if (get_var["dataset_id"] && get_var["dataset_id"] != "undefined"){
                    Cookies.set("login_redirect", "/nist/d/index.html?dataset_id="+get_var["dataset_id"])
            }else if (get_var["search"]){
                    Cookies.set("login_redirect", "/nist/s/index.html?search="+get_var["search"].replace("&","%26"))
            }else if (get_var["file_id"] && get_var["file_id"] != "undefined"){
                        Cookies.set("login_redirect", "/nist/f/index.html?file_id="+get_var["file_id"])
            }
            if (image_type == "dicoms"){
		if (check_dicom_multi()){
		       window.location.replace("/nist/i/mindex.html?version=3.0.0");
		}else{
		       window.location.replace("/nist/i/index.html?version=3.0.0");
		}
            }else if(image_type == "omeros"){
		window.location.replace("/nist/o/index.html?version=3.0.0");
            }else{
                window.location.replace("/nist/z/index.html?version=3.0.0");
            }

}

function check_image_filtered_dataset(file){
    var image_filtered = localStorage.getItem("dataset_image_hide").split(",");
    var show_flag = true;
    $.each(image_filtered, function( key, val ) {
        if (file.includes(val)){
            show_flag = false;
            return;
        }
    });
    return show_flag;
}

function submitImageData(formname, dicom){
    var image_list = [];
    var histomics_list = [];
    var dicoms_list = [];
    var omero_list = [];
    var image_type = "image";
    if (formname == 'cart_image' && $('#image_size').html() == '0'){
        alert("No images available to view, please select from search or dataset pages");
        return;
    }else if (formname == 'cart_dicom' && $('#dicom_size').html() == '0'){
        alert("No dicoms available to view, please select from search or dataset pages");
        return;
    }else if (formname == 'cart_omero' && $('#omero_size').html() == '0'){
        alert("No omero images available to view, please select from search or dataset pages");
        return;
    }else{}
   
 
    if (dicom){
        dicoms_list.push(localStorage.getItem('environment')+"/data-access-api/download?id="+$(dicom).val());
        if ($(dicom).val().endsWith(".dcm") || $(dicom).val().endsWith(".dicom") || $(dicom).val().endsWith(".DCM")){
            image_type = "dicoms";
        }
    }else{
        if (formname.startsWith("cart_")){
	    if (localStorage.getItem('cart_list')){
        	download_list = JSON.parse(localStorage.getItem('cart_list'));
            $.each(download_list, function( key, val ) {
                //check_image_filtered_dataset should be key, not val[1] since key is the full labcasId and contains dataset name within, while val[1] is just the filename itself.
                if (check_image_filtered_dataset(key)){
                    if (accepted_image_check(val[1]) && (val[1].endsWith(".dcm") || val[1].endsWith(".dicom") || val[1].endsWith(".DCM"))){
                        dicoms_list.push(localStorage.getItem('environment')+"/data-access-api/download?id="+key);
                    }else if(acepted_omero_check(key)){
                        omero_list.push([val[0],val[1],val[2], key]);
                    }else if(accepted_image_check(key)){
                        image_list.push(localStorage.getItem('environment')+"/data-access-api/download?id="+key);
                        histomics_list.push([val[0],val[1],val[2], key]);
                    }
                }
            });
        }
	}else{
        $('#' + formname + ' input[type="checkbox"]').each(function() {
            
            if ($(this).is(":checked") && accepted_image_check($(this).data("name"))) {
                if ($(this).val().endsWith(".dcm") || $(this).val().endsWith(".dicom") || $(this).val().endsWith(".DCM") ||
                    $(this).data("name").endsWith(".dcm") || $(this).data("name").endsWith(".dicom") || $(this).data("name").endsWith(".DCM") 
                    ){
                     image_type = "dicoms";
                     dicoms_list.push(localStorage.getItem('environment')+"/data-access-api/download?id="+$(this).val());
                }else if(acepted_omero_check($(this).val())){
                     image_type = "omeros";
                     omero_list.push([$(this).data("loc"),$(this).data("name"),$(this).data("version"), $(this).val()]);
                }else if(accepted_image_check($(this).val())){
                     image_list.push(localStorage.getItem('environment')+"/data-access-api/download?id="+$(this).val());
                     histomics_list.push([$(this).data("loc"),$(this).data("name"),$(this).data("version"), $(this).val()]);
                }
            }
        });
	}
    }
    
    localStorage.setItem("image",JSON.stringify(image_list));
    localStorage.setItem("dicoms",JSON.stringify(dicoms_list));
    localStorage.setItem("image_data",JSON.stringify(histomics_list));
    localStorage.setItem("omeros",JSON.stringify(omero_list));

    var get_var = get_url_vars();
    
    if (get_var["dataset_id"] && get_var["dataset_id"] != "undefined"){
	    Cookies.set("login_redirect", "/nist/d/index.html?dataset_id="+get_var["dataset_id"])
    }else if (get_var["search"]){
	    Cookies.set("login_redirect", "/nist/s/index.html?search="+get_var["search"].replace("&","%26"))
    }
    if (formname.startsWith("cart_")){
        if (formname == "cart_dicom"){
		if (check_dicom_multi()){
		       window.location.replace("/nist/i/mindex.html?version=3.0.0");
		}else{
		       window.location.replace("/nist/i/index.html?version=3.0.0");
		}
        }else if(formname == "cart_omero"){
		window.location.replace("/nist/o/index.html?version=3.0.0");
	}else{
            window.location.replace("/nist/z/index.html?version=3.0.0");
        }
    }else{
       if (image_type == "dicoms"){
		if (check_dicom_multi()){
		       window.location.replace("/nist/i/mindex.html?version=3.0.0");
		}else{
		       window.location.replace("/nist/i/index.html?version=3.0.0");
		}
       }else if(image_type == "omeros"){
	  window.location.replace("/nist/o/index.html?version=3.0.0");
       }else{
          window.location.replace("/nist/z/index.html?version=3.0.0");
       }
    }
}

function changeFrameSrc(frame, src, fileid){
    $('#'+frame).attr('src', src);
    $('#img_frame').contents().find('#h-navbar-brand').html('Image Viewer');
    window.history.replaceState(null, null, "?fileid="+fileid);
}

function check_omero_image(image_dataset, image_name, version, show_flag, fileid, show_flag){
	dataset = baseName(image_dataset);
	datasetid = -1;
	$.each(omero_datasets, function(key, val){
		if (val.Name == dataset){
			datasetid = val["@id"];
			return false;
		}
	});
        makeJSONRequest('GET', localStorage.getItem("omero_api")+"/datasets/"+datasetid+"/images", function(data) {
		var imageid = -1;
		$.each(data.data, function(key, val){
			if (val.Name == image_name || val.Name == image_name+" [resolution #1]"){
				imageid = val["@id"];
				return false;
			}
		});
		if (show_flag){
			orchistrate_omero_find(image_dataset, image_name, version, show_flag, fileid, imageid);
		}
		var download_cmd = "download_file('"+fileid+"','single');";
		var details_cmd = "window.open(\"/nist/f/index.html?file_id="+fileid+"\");";
		$("#image_list_table tbody").append("<tr ><td  style='padding-left: 5px; word-wrap: break-word;'><a style='word-wrap: break-word;' href='#' onclick=\"changeFrameSrc('img_frame','"+localStorage.getItem("omero_image_viewer")+imageid+"', '"+imageid+"')\">"+decodeURIComponent(image_name)+"</a></td><td class='td-actions text-right'><button type='button' rel='detailbutton' title='Details' style='padding:0px' class='btn btn-info btn-simple btn-link' onclick='"+details_cmd+"'><i class='fa fa-info-circle'></i></button>"+'<button type="button" rel="downloadbutton" title="Download" class="btn btn-success btn-simple btn-link" onclick="'+download_cmd+'"><i class="fa fa-download"></i></button></td></tr>');
});

return datasetid;
}



function createCORSRequest(method, url) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		xhr.withCredentials = true;
		console.log(xhr);
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		xhr = new XDomainRequest();
		console.log(xhr.headers);
		xhr.open(method, url);
	} else {
		// CORS is not supported by the browser.
		xhr = null;
	}

	xhr.onerror = function() {
		console.log('There was an error!');
	};
	return xhr;
}

function makeJSONRequest(method, url, callback, data) {
  console.log("url");
  console.log(url);
  var xhr = createCORSRequest(method, url);
  xhr.onload = function() {
    // handle the response (assumes we're getting JSON data)
    var responseText = xhr.responseText;
    var jsonResponse = responseText;
    // If not logged-in, show login form
    if (xhr.status === 403) {
      if (login_flag != 1){
          login_flag = 1;
          prepareLogin();
      }else{
        console.log("Already tried to login once, failed, please troubleshoot");
      }
    }
    // status OK - call the callback()
    else if (xhr.status === 200) {
      if (callback) {
        jsonResponse = JSON.parse(responseText);
        callback(jsonResponse);
      }
    } else {
      console.log("Error:", xhr)
    }
  };

  if (method !== 'GET') {
    console.log("CSRF");
    console.log(omero_csrf_token);
          
    xhr.setRequestHeader('x-csrftoken', omero_csrf_token);
  }
  if (data) {
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
  } else {
    xhr.send();
  }
}

function loadProjects() {
  var projects_url = base_urls['url:datasets'].replace("http:","https:");
	  makeJSONRequest('POST', projects_url, function(rsp) {
  });
}

function loadBaseUrls(callback) {
  makeJSONRequest('GET', latest_base_url, function(rsp) {
    base_urls = rsp;
    callback();
  });
}
//loadBaseUrls(loadProjects);
function prepareLogin() {
  // show login form
  var servers_url = base_urls['url:servers'];

  // Also get CSRF token needed for login and other POST requests
  var token_url = base_urls['url:token'].replace("http:","https:");
  makeJSONRequest('GET', token_url, function(rsp) {
    omero_csrf_token = rsp.data;
    loginOmero();
  });
}

function testGetDatasets(){
    var projects_url = base_urls['url:datasets'].replace("http:","https:");
    makeJSONRequest('GET', projects_url, function(rsp) {
    });

}

function loginOmero(){
  var login_url = base_urls['url:login'];

  var fields = ['username', 'password', 'server'];
  var configs = {'username':localStorage.getItem("omero_server_user"),'password':localStorage.getItem("omero_server_pass"),'server':localStorage.getItem("omero_server_id")}
  var data = fields.map(function(f){
    return f + '=' + configs[f];
  });
  data = data.join('&');
  login_url = login_url.replace("http:","https:");
  
  makeJSONRequest('POST', login_url, function(rsp) {
    // Will get eventContext if login OK
    console.log(rsp);

    // Show username in top header
    var ctx = rsp['eventContext'];
    console.log(ctx['userName']);

    var get_var = get_url_vars();
    showOmeroImage(get_var["fileid"]);
  }, data);

  return false;

}


function getOmeroDataset(image_dataset, image_name, version, show_flag, fileid, show_flag){
	if (omero_datasets.length == 0){
		console.log("API Getting");
                var projects_url = base_urls['url:datasets'].replace("http:","https:");
                makeJSONRequest('GET', projects_url, function(rsp) {
			omero_datasets = rsp.data;
			check_omero_image(image_dataset, image_name, version, show_flag, fileid, show_flag);
                }); 
	}else{
	    check_omero_image(image_dataset, image_name, version, show_flag, fileid, show_flag);
	}
}

function showOmeroImage(hist_image){
       images_data = JSON.parse(localStorage.getItem('omeros'));
       show_flag = true;
       $.each(images_data, function( key, val ) {
          var fileid = val[3];
          var query_file = val[1];
          var query_folder = val[0];
          var version = val[2];
	  getOmeroDataset(query_folder, query_file, version, show_flag, fileid, show_flag);
          show_flag = false;
       });
       localStorage.setItem("image_data","");
       localStorage.setItem("image","");
}

function showHistImage(hist_image){
    if (hist_image && hist_image != ""){
        setup_labcas_file_data("fileimage",'id:"'+encodeURI(hist_image).replace("&","%26")+'"', 'id:'+hist_image+'*'); 
    }else{
       images = JSON.parse(localStorage.getItem('image'));
       images_data = JSON.parse(localStorage.getItem('image_data'));
       show_flag = true;
       $.each(images_data, function( key, val ) {
          orchistrate_find(val[0], val[1], val[2], show_flag, val[3]);
          show_flag = false;
       });
       localStorage.setItem("image_data","");
       localStorage.setItem("image","");
    }
}

function set_cart_status (){
    // set cart info
        var download_list = {};
        var download_size = 0;
        if (localStorage.getItem('cart_list')){
                download_list = JSON.parse(localStorage.getItem('cart_list'));
        }
        if (localStorage.getItem('cart_size')){
                download_size = parseInt(localStorage.getItem('cart_size'));
        }
        $('#cart-count').html(Object.keys(download_list).length);
        filesize = humanFileSize(download_size, true);
        $('#cart_size').html(filesize);

        imagesize = 0;
        omerosize = 0;
        dicomsize = 0;

        $.each(download_list, function( key, val ){
            if (check_image_filtered_dataset(key)){
                if (val[1] && accepted_image_check(val[1]) && (val[1].endsWith(".dicom") || val[1].endsWith(".dcm") || val[1].endsWith(".DCM"))){
                    dicomsize += 1;
                }else if(val[1] && acepted_omero_check(val[1])){
                    omerosize += 1;
                }else if(val[1] && accepted_image_check(val[1])){
                    imagesize += 1;
                }
            }
        });

        $('#image_size').html(imagesize);
        $('#omero_size').html(omerosize);
        $('#dicom_size').html(dicomsize);
}

function orchistrate_omero_find(query_folder, query_file, version, show_flag, fileid, omero_id){
    changeFrameSrc("img_frame", localStorage.getItem("omero_image_viewer")+omero_id, omero_id);
    $('#loading_viewer').hide();
    $('#viewer_content').show();
}

function orchistrate_find(query_folder, query_file, version, show_flag, fileid){
    var image_dsa_path = [];
    var root_collection = localStorage.getItem("dsa_root_collection");
    var labcas_data_map = JSON.parse(localStorage.getItem("labcas_data")).collection_path_maps;

    //Specifically for qptiff files
    if (query_file.endsWith(".qptiff") && query_folder.includes("mIHC_Images/")){
       query_file = query_file.replace(".qptiff",".png");
       query_folder = query_folder.replace("mIHC_Images/","mIHC_Images_png/");
    }
    query_folder = query_folder.replace("/usr/local/labcas/backend/archive/","");
    query_folder = query_folder.replace("&","%26");
    query_file = query_file.replace("&","%26");
    var collection_name = query_folder.split("/")[0];

    if (collection_name in labcas_data_map){
    	query_folder = query_folder.replace(collection_name,labcas_data_map[collection_name]);
    }
    image_dsa_path = query_folder.split("/");

    recurse_dsa(root_collection, image_dsa_path.shift(), query_file, image_dsa_path, show_flag,'collection', version, fileid);
}

function recurse_dsa(sub_folder, sub_name, query_file, image_dsa_path, show_flag, parenttype, version, fileid){
    var url = localStorage.getItem("dsa_api")+"/folder?parentType="+parenttype+"&parentId="+sub_folder+"&name="+sub_name+"&limit=50&sort=lowerName&sortdir=1";
    console.log(url);
    $.ajax({
	url: url,
        type: 'GET',
        success: function (data) {
            if (image_dsa_path.length > 0 && data.length > 0 && data[0]._id){
                 recurse_dsa(data[0]._id, image_dsa_path.shift(), query_file, image_dsa_path, show_flag, 'folder', version, fileid);
            }else{
                if (data.length > 0 && data[0]._id){
                    $.ajax({
                        url: localStorage.getItem("dsa_api")+"/item?folderId="+data[0]._id+"&name="+query_file+"&limit=50&sort=lowerName&sortdir=1",
                        type: 'GET',
                        success: function (filedata) {
                            if (filedata.length > 0 && filedata[0]._id){
                                var download_cmd = "download_file('"+fileid+"','single');";
                                var details_cmd = "window.open(\"/nist/f/index.html?file_id="+fileid+"\");";
                                $("#image_list_table tbody").append("<tr ><td  style='padding-left: 5px; word-wrap: break-word;'><a style='word-wrap: break-word;' href='#' onclick=\"changeFrameSrc('img_frame','"+localStorage.getItem("dsa_image_viewer")+"?image="+filedata[0]._id+"', '"+fileid+"')\">"+decodeURIComponent(query_file)+"</a></td><td class='td-actions text-right'><button type='button' rel='detailbutton' title='Details' style='padding:0px' class='btn btn-info btn-simple btn-link' onclick='"+details_cmd+"'><i class='fa fa-info-circle'></i></button>"+'<button type="button" rel="downloadbutton" title="Download" class="btn btn-success btn-simple btn-link" onclick="'+download_cmd+'"><i class="fa fa-download"></i></button></td></tr>');
                                if (show_flag){
                                    $('#loading_viewer').hide();
                                    $('#viewer_content').show();
                                    changeFrameSrc("img_frame", localStorage.getItem("dsa_image_viewer")+"?image="+filedata[0]._id, fileid);
                                }
                            }else if(image_dsa_path.length == 0 && version != "null"){
                                recurse_dsa(data[0]._id, version, query_file, image_dsa_path, show_flag, 'folder', "null", fileid);
                            }
                            else{
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


function save_labcas_acceptance(type){
    var payload = {}
    if (type == "login"){
        payload['userid'] = Cookies.get("user");
    }else if(type == "anonymous"){
        payload['userid'] = $('#accept_user').val();
        payload['email'] = $('#accept_email').val();
    }
    $.ajax({
        url: localStorage.getItem("ksdb_labcas_acceptance_save"),
        type: 'POST',
        dataType: "json",
        data: JSON.stringify(payload),
        success: function (data) {
            Cookies.set('accepted', true);
            login_redirect();
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
            alert("Labcas acceptance save failed, please reach out to "+localStorage.getItem("support_contact")+" for support.");
        }
    });
}
function check_labcas_acceptance(source){
    var username = Cookies.get("user");
    if (source == "anonymous"){
        usage_agreement();
    }else if (source == "login"){
        $.ajax({
            url: localStorage.getItem("ksdb_labcas_acceptance_check"),
            type: 'POST',
            dataType: "json",
            data: JSON.stringify({'userid':username}),
            success: function (data) {
                console.log("Successfully checked user acceptance "+username);
                if (!data.accepted){
                    usage_agreement();
                }else{
                    login_redirect();
                }
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
                alert("Labcas initiation check failed, please reach out to "+localStorage.getItem("support_contact")+" for support.");
            }
        });
    }
}

function save_search_profile(){
	var name = $('#save_profile_name').val();
	var username = Cookies.get("user");
	
	var check_flag = true;
	if (name == ""){
		alert("Please enter a name for your search profile to be saved.");
		check_flag = false;
	}
	console.log(name);
	if (!/^[a-zA-Z 0-9]+$/.test(name)){
		alert("Please make sure to only use letters, numbers, or space in your search profile name.");
		check_flag = false;
	}
	if (check_flag){
		var params = get_search_filters();
		localStorage.setItem("active_custom_search_profile",name);
		$.ajax({
			url: localStorage.getItem("ksdb_labcas_search_profile_save"),
			type: 'POST',
			dataType: "json",
			data: JSON.stringify({'userid':username, 'profile_name':name, 'profile':params}),
			success: function (data) {
				alert("Successfully saved search profile "+name);
				$('#saved_profiles').append("<option selected value='"+name+"'>"+name+"</option>");
				window.location.replace("/nist/s/index.html?search="+params['search'].replace("&","%26"))
			},
			error: function(e){
				alert("Save failed, please reach out to "+localStorage.getItem("support_contact")+" for support.");
			}
		});
	}
}

function delete_search_profile(){
	var username = Cookies.get("user");
	var name = $('#saved_profiles').val();

	$.ajax({
		url: localStorage.getItem("ksdb_labcas_search_profile_delete"),
		type: 'POST',
		dataType: "json",
		data: JSON.stringify({'userid':username, 'profile_name':name}),
		success: function (data) {
			alert("Successfully deleted search profile "+name);
			$("#saved_profiles option[value='"+name+"']").remove();
			localStorage.setItem("active_custom_search_profile","custom");
			$('#delete_profile').hide();
			$('#save_profile_name').show();
                        $('#save_profile').show();
			window.location.replace("/nist/s/index.html?search=*")
		},
		error: function(e){
			alert("Save failed, please reach out to "+localStorage.getItem("support_contact")+" for support.");
		}
	});

}

function populate_collection_details_protocol_shortname(shortname){
	$("#collectiondetails-table tbody").append(
            "<tr>"+
		"<td class='text-right' valign='top' style='padding: 2px 8px;' width='30%'>Abbreviated Name:</td>"+
		"<td class='text-left' valign='top' style='padding: 2px 8px;'>"+
			shortname+
		"</td>"+
	"</tr>");
}

function get_protocol_info(program, pid, field, func){
	var url = localStorage.getItem("ksdb_labcas_search_protocol_api")+program+localStorage.getItem("ksdb_split_key")+pid;
	console.log(url);
	$.ajax({
		url: url,
		type: 'GET',
		dataType: 'json',
		success: function (data) {
			wait(1000);
			if (data.length > 0){
				func(data[0].fields[field]);
			}
		},
		error: function(e){
		    console.log("Failed to grab search ksdb protocol data");
		}
	});

}
function get_search_profile(name){
	var username = Cookies.get("user");
	if (name == "" || name == "custom"){
		$.ajax({
			url: localStorage.getItem("ksdb_labcas_search_name_api")+username,
			type: 'GET',
			dataType: 'json',
			success: function (data) {
				$('#saved_profiles').empty();
				$('#saved_profiles').append("<option value='custom'>Custom</option>");
				$.each( data.search_results, function( key, val ) {
					if (val != ""){
					if (localStorage.getItem("active_custom_search_profile") == val){
						$('#saved_profiles').append("<option value='"+val+"' selected>"+val+"</option>");
						$('#save_profile_name').hide();
						$('#save_profile').hide();
						$('#delete_profile').show();
					}else{
						$('#saved_profiles').append("<option value='"+val+"'>"+val+"</option>");
					}
					}
				});
			},
			error: function(e){
			    console.log("Failed to grab search profiles");
			}
		});
	}else{
		var url = localStorage.getItem("ksdb_labcas_search_profile_api")+username+localStorage.getItem("ksdb_split_key")+name;
		console.log(url)
		$.ajax({
			url: url,
                        type: 'GET',
                        success: function (data) {
				data = data.replace(/'/g, '"')
				var search_profile = JSON.parse(data);
				localStorage.setItem("active_custom_search_profile",name);
				set_search_filters(search_profile);
				$('#save_profile_name').hide();
				$('#save_profile').hide();
				$('#delete_profile').show();
			},
            error: function(e){
                console.log("Failed to grab search profiles");
            }
        });
	}
}
