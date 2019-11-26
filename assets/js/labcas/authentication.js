var root_app = "";

Array.prototype.contains = function(v) {
      for (var i = 0; i < this.length; i++) {
              if (this[i] === v) return true;
                }
        return false;
};

Array.prototype.unique = function() {
      var arr = [];
        for (var i = 0; i < this.length; i++) {
                if (!arr.contains(this[i])) {
                          arr.push(this[i]);
                              }
                  }
          return arr;
}

function fill_collections_public_data(data){
	$.each(data.response.docs, function(index, obj) {
		if ((!obj.QAState) || (obj.QAState && !obj.QAState.includes("Private"))){
			var color = "btn-info";
			if(user_data["FavoriteCollections"].includes(obj.id)){
				color = "btn-success";
			}
		
		
			var institutions = obj.Institution;
			var pis = obj.LeadPI;
			var orgs = obj.Organ;
		
			if (Cookies.get('environment').includes("edrn-labcas")){
				var obj_arr = generate_edrn_links(obj);
				institutions = obj_arr[0];
				//pis = obj_arr[1];
				orgs = obj_arr[2];
			}else if(Cookies.get('environment').includes("mcl-labcas")){
				var obj_arr = generate_mcl_links(obj);
				//institutions = obj_arr[0];
				//pis = obj_arr[1];
				orgs = obj_arr[2];
			}
			//console.log(institutions);
			  $("#collection-table tbody").append(
				"<tr>"+
					"<td></td><td>"+
					"<a href=\"/labcas-ui/application/labcas_collection-detail_table.html?collection_id="+
						obj.id+"\">"+
					obj.CollectionName+"</a></td>"+
					"<td>"+pis.join(", ")+"</td>"+
					"<td>"+institutions.join(", ")+"</td>"+
					"<td>"+obj.Discipline+"</td>"+
					"<td>"+obj.DataCustodian+"</td>"+
					"<td>"+orgs.join(", ")+"</td>"+
					"<td class=\"td-actions text-right\">"+
							"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteCollections')\" class=\"btn "+color+" btn-simple btn-link\">"+
								"<i class=\"fa fa-star\"></i>"+
							"</button>"+
						"</td>"+
				"</tr>");
			  //console.log(obj);
		}
    });
    $table.bootstrapTable({
            toolbar: ".toolbar",
            clickToSelect: true,
            showRefresh: true,
            search: true,
            showToggle: true,
            showColumns: true,
            pagination: true,
            searchAlign: 'left',
            pageSize: 8,
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
function fill_collections_data(data){
	
    $.each(data.response.docs, function(index, obj) {
    	var color = "btn-info";
		if(user_data["FavoriteCollections"].includes(obj.id)){
			color = "btn-success";
    	}
    	
		
		var institutions = obj.Institution;
    	var pis = obj.LeadPI;
    	var orgs = obj.Organ;
    	
    	if (Cookies.get('environment').includes("edrn-labcas")){
			var obj_arr = generate_edrn_links(obj);
			institutions = obj_arr[0];
			//pis = obj_arr[1];
			orgs = obj_arr[2];
		}else if(Cookies.get('environment').includes("mcl-labcas")){
			var obj_arr = generate_mcl_links(obj);
			//institutions = obj_arr[0];
			//pis = obj_arr[1];
			orgs = obj_arr[2];
		}
    	//console.log(institutions);
          $("#collection-table tbody").append(
            "<tr>"+
                "<td></td><td>"+
                "<a href=\"/labcas-ui/application/labcas_collection-detail_table.html?collection_id="+
                    obj.id+"\">"+
                obj.CollectionName+"</a></td>"+
                "<td>"+pis.join(", ")+"</td>"+
                "<td>"+institutions.join(", ")+"</td>"+
                "<td>"+obj.Discipline+"</td>"+
                "<td>"+obj.DataCustodian+"</td>"+
                "<td>"+orgs.join(", ")+"</td>"+
                "<td class=\"td-actions text-right\">"+
						"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteCollections')\" class=\"btn "+color+" btn-simple btn-link\">"+
							"<i class=\"fa fa-star\"></i>"+
						"</button>"+
					"</td>"+
            "</tr>");
          //console.log(obj);
    });
    $table.bootstrapTable({
            toolbar: ".toolbar",
            clickToSelect: true,
            showRefresh: true,
            search: true,
            showToggle: true,
            showColumns: true,
            pagination: true,
            searchAlign: 'left',
            pageSize: 8,
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
function fill_collection_details_data(data){
	$("#collectiontitle").html(data.response.docs[0].CollectionName);
	var obj = data.response.docs[0];
	var institutions = obj.Institution;
	var pis = obj.LeadPI;
	var orgs = obj.Organ;
	
	if (Cookies.get('environment').includes("edrn-labcas")){
		var obj_arr = generate_edrn_links(obj);
		institutions = obj_arr[0];
		pis = obj_arr[1];
		orgs = obj_arr[2];
	}else if(Cookies.get('environment').includes("mcl-labcas")){
		var obj_arr = generate_mcl_links(obj);
		institutions = obj_arr[0];
		pis = obj_arr[1];
		orgs = obj_arr[2];
	}
	
	$.each(obj, function(key, value) {
		if ($.isArray(value)){
			value = value.join(",");
		}
		if (key == "Institution"){
			value = institutions.join(", ");
		}else if (key == "LeadPI"){
			value = pis.join(", ");
		}else if (key == "Consortium"){
			value = "<a href='https://edrn.nci.nih.gov'>"+value+"</a>";
		}else if (key == "Organ"){
			value = orgs.join(", ");
		}
          $("#collectiondetails-table tbody").append(
            "<tr>"+
				"<td>"+key+":</td>"+
				"<td class='text-right'>"+
					value+
				"</td>"+
			"</tr>");
		
    });
    $("#collection_details_len").html(Object.keys(obj).length);
}
function fill_dataset_details_data(data){
	$("#datasettitle").html(data.response.docs[0].DatasetName);
	$.each(data.response.docs[0], function(key, value) {
		if ($.isArray(value)){
			value = value.join(",");
		}
        if (key == "CollectionId"){
            value = "<a href=\"/labcas-ui/application/labcas_collection-detail_table.html?collection_id="+value+"\">"+value+"</a>";
        }
          $("#datasetdetails-table tbody").append(
            "<tr>"+
				"<td>"+key+":</td>"+
				"<td class='text-right'>"+
					value+
				"</td>"+
			"</tr>");
		
    });
    $("#dataset_details_len").html(Object.keys(data.response.docs[0]).length);
}
function fill_file_details_data(data){
	$("#filetitle").html(data.response.docs[0].FileName);
	$.each(data.response.docs[0], function(key, value) {
		if ($.isArray(value)){
			value = value.join(",");
		}
          $("#filedetails-table tbody").append(
            "<tr>"+
				"<td>"+key+":</td>"+
				"<td class='text-right'>"+
					value+
				"</td>"+
			"</tr>");
		
    });
    $("#file_details_len").html(Object.keys(data.response.docs[0]).length);
}
function fill_datasets_data(data){

	data.response.docs.sort(dataset_compare_sort);
	$.each(data.response.docs, function(key, value) {
			var color = "btn-info";
			if(user_data["FavoriteDatasets"].includes(value.id)){
				color = "btn-success";
			}
				if (value.id.split("/").length - 2 > 0){
					value.DatasetName = "&nbsp;&nbsp;&nbsp;&nbsp;".repeat(value.id.split("/").length - 2)+"<span>&#8226;</span>"+value.DatasetName
				}
			  $("#datasets-table tbody").append(
				"<tr>"+
					"<td><!--<div class=\"form-check\">"+
						"<label class=\"form-check-label\">"+
							"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
							"<span class=\"form-check-sign\"></span>"+
						"</label>"+
					"</div>--></td>"+
					"<td class='text-left'>"+
                        "<a href=\"/labcas-ui/application/labcas_dataset-detail_table.html?dataset_id="+
                            value.id+"\">"+
                            value.DatasetName+
                        "</a>"+
					"</td>"+
					"<td class=\"td-actions text-right\">"+
						"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+value.id+"', 'FavoriteDatasets')\" class=\"btn "+color+" btn-simple btn-link\">"+
							"<i class=\"fa fa-star\"></i>"+
						"</button>"+
						"<button type=\"button\" rel=\"tooltip\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\">"+
							"<i class=\"fa fa-download\"></i>"+
						"</button>"+
					"</td>"+
				"</tr>");
		});                                                                     
    $("#collection_datasets_len").html(data.response.numFound); 
    $("#collection_favorites_len").html(user_data['FavoriteFiles'].length+user_data['FavoriteDatasets'].length+user_data['FavoriteCollections'].length);
}
function fill_files_data(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("files",size,cpage);
	$("#files-table tbody").empty();
	$.each(data.response.docs, function(key, value) {
	
		var color = "btn-info";
		if(user_data["FavoriteFiles"].includes(value.id)){
			color = "btn-success";
		}
		
		var thumb = "";
		var filetype = value.FileType ? value.FileType.join(",") : "";
		var description = value.Description? value.Description.join(",") : "";
		if ('FileThumbnailUrl' in value){
		thumb = "<img width='50' height='50' src='"+value.FileThumbnailUrl+"'/>";
		}
		$("#files-table tbody").append(
		"<tr>"+
			"<td><div class=\"form-check\">"+
				"<label class=\"form-check-label\">"+
					"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
					"<span class=\"form-check-sign\"></span>"+
				"</label>"+
			"</div></td>"+
			"<td class='text-left'>"+
				"<a href=\"/labcas-ui/application/labcas_file-detail_table.html?file_id="+
					value.id+"\">"+
					value.FileName+
				"</a>"+
			"</td>"+
			"<td class='text-left'>"+
					filetype +
			"</td>"+
			"<td class='text-left'>"+
					description +
			"</td>"+
			"<td class='text-left'>"+
					thumb+
			"</td>"+
			"<td class='text-left'>"+
					value.FileSize+
			"</td>"+
			"<td class=\"td-actions text-right\">"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+value.id+"', 'FavoriteFiles')\" class=\"btn "+color+" btn-simple btn-link\">"+
					"<i class=\"fa fa-star\"></i>"+
				"</button>"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\" onclick=\"location.href='https://mcl-labcas.jpl.nasa.gov/data-access-api/download?id="+value.id+"'\">"+
					"<i class=\"fa fa-download\"></i>"+
				"</button>"+
			"</td>"+
		"</tr>");	
	});                                                                     
    $("#dataset_files_len").html(size); 
    $("#dataset_favorites_len").html(user_data['FavoriteFiles'].length+user_data['FavoriteDatasets'].length+user_data['FavoriteCollections'].length);
}

function setup_labcas_data(datatype, query, dataset_query){
	
    $.ajax({
        url: Cookies.get('environment')+"/data-access-api/collections/select?q="+query+"&wt=json&indent=true&rows=2147483647",
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
        },
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if (datatype == "collections"){
                fill_collections_data(data);
            }else if (datatype == "collections_public"){
            	fill_collections_public_data(data);
            }else if (datatype == "collectiondatasets"){
                fill_collection_details_data(data);
            }
        },
        error: function(){
             alert("Login expired, please login...");
             window.location.replace("/labcas-ui/application/pages/login.html");
         }
    });
    if (datatype == "collectiondatasets"){
    	$.ajax({
			url: Cookies.get('environment')+"/data-access-api/datasets/select?q="+dataset_query+"&wt=json&indent=true&rows=2147483647",
			beforeSend: function(xhr) { 
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
			},
			type: 'GET',
			dataType: 'json',
			processData: false,
			success: function (data) {
                //console.log(Cookies.get('environment')+"/data-access-api/datasets/select?q="+dataset_query+"&wt=json&indent=true&rows=2147483647");
                //console.log(Cookies.get('token'));
                fill_datasets_data(data);
			},
			error: function(){
                 alert("Login expired, please login...");
                 window.location.replace("/labcas-ui/application/pages/login.html");
			 }
		});
    }
}
function setup_labcas_dataset_data(datatype, query, file_query, cpage){
    if (cpage == 0){ //if this isn't a pagination request and a default load
		$.ajax({
			url: Cookies.get('environment')+"/data-access-api/datasets/select?q="+query+"&wt=json&indent=true&rows=2147483647",
			xhrFields: {
					withCredentials: true
			  },
			beforeSend: function(xhr, settings) { 
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
			},
			dataType: 'json',
			success: function (data) {
				fill_dataset_details_data(data);
			},
			error: function(){
				 alert("Login expired, please login...");
				 window.location.replace("/labcas-ui/application/pages/login.html");
			 
			 }
		});
    }
    
    $.ajax({
        url: Cookies.get('environment')+"/data-access-api/files/select?q="+file_query+"&wt=json&indent=true&start="+cpage*10,
        xhrFields: {
                withCredentials: true
          },
        beforeSend: function(xhr, settings) { 
            xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
        },
        dataType: 'json',
        success: function (data) {
            fill_files_data(data);
        },
        error: function(){
             alert("Login expired, please login...");
             window.location.replace("/labcas-ui/application/pages/login.html");
             
         }
    });
}

function setup_labcas_file_data(datatype, query, file_query){
    //console.log( Cookies.get('environment')+"/data-access-api/files/select?q="+query+"&wt=json&indent=true&rows=2147483647");
    $.ajax({
        url: Cookies.get('environment')+"/data-access-api/files/select?q="+query+"&wt=json&indent=true&rows=2147483647",
        xhrFields: {
                withCredentials: true
          },
        beforeSend: function(xhr, settings) { 
            xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
        },
        dataType: 'json',
        success: function (data) {
            fill_file_details_data(data);
        },
        error: function(){
             alert("Login expired, please login...");
             window.location.replace("/labcas-ui/application/pages/login.html");
             
         }
    });
}




/*Search Section*/
function fill_datasets_search(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("datasets_search",size,cpage);
	//console.log(data);
	$("#search-dataset-table tbody").empty();
	$.each(data.response.docs, function(key, obj) {
	  var color = "btn-info";
	  if(user_data["FavoriteDatasets"].includes(obj.id)){
			color = "btn-success";
	  }
	
	  var thumb = "";
	  var filetype = obj.FileType ? obj.FileType.join(",") : "";
	  var description = obj.Description? obj.Description.join(",") : "";
	  if ('FileThumbnailUrl' in obj){
		thumb = "<img width='50' height='50' src='"+obj.FileThumbnailUrl+"'/>";
	  }
	  $("#search-dataset-table tbody").append(
		"<tr>"+
			"<td><div class=\"form-check\">"+
				"<label class=\"form-check-label\">"+
					"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
					"<span class=\"form-check-sign\"></span>"+
				"</label>"+
			"</div></td><td>"+
			"<a href=\"/labcas-ui/application/labcas_dataset-detail_table.html?dataset_id="+
                    obj.id+"\">"+
                obj.DatasetName+"</a></td>"+
                "<td><a href=\"/labcas-ui/application/labcas_collection-detail_table.html?collection_id="+
                    obj.CollectionId+"\">"+
                    	obj.CollectionName+"</a></td>"+
                "<td>"+obj.DatasetVersion+"</td>"+
			"<td class=\"td-actions text-right\">"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteDatasets')\" class=\"btn "+color+" btn-simple btn-link\">"+
					"<i class=\"fa fa-star\"></i>"+
				"</button>"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\">"+
					"<i class=\"fa fa-download\"></i>"+
				"</button>"+
			"</td>"+
		"</tr>");	
	});                
	$("#datasets_len").html(size); 
}
function fill_files_search(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("files_search",size,cpage);
	//console.log(data);
	$("#search-file-table tbody").empty();
	$.each(data.response.docs, function(key, obj) {
	  var color = "btn-info";
	  if(user_data["FavoriteFiles"].includes(obj.id)){
			color = "btn-success";
	  }
	  var thumb = "";
	  var filetype = obj.FileType ? obj.FileType.join(",") : "";
	  var description = obj.Description? obj.Description.join(",") : "";
	  if ('FileThumbnailUrl' in obj){
		thumb = "<img width='50' height='50' src='"+obj.FileThumbnailUrl+"'/>";
	  }
	  $("#search-file-table tbody").append(
		"<tr>"+
			"<td><div class=\"form-check\">"+
				"<label class=\"form-check-label\">"+
					"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
					"<span class=\"form-check-sign\"></span>"+
				"</label>"+
			"</div></td>"+
			"<td class='text-left'>"+
				"<a href=\"/labcas-ui/application/labcas_file-detail_table.html?file_id="+
					obj.id+"\">"+
					obj.FileName+
				"</a>"+
			"</td>"+
			"<td class='text-left'>"+
					filetype +
			"</td>"+
			"<td class='text-left'>"+
					description +
			"</td>"+
			"<td class='text-left'>"+
					thumb+
			"</td>"+
			"<td class='text-left'>"+
					obj.FileSize+
			"</td>"+
			"<td class=\"td-actions text-right\">"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteFiles')\" class=\"btn "+color+" btn-simple btn-link\">"+
					"<i class=\"fa fa-star\"></i>"+
				"</button>"+
				//"<button type=\"button\" rel=\"tooltip\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\"  onclick=\"location.href='https://mcl-labcas.jpl.nasa.gov/data-access-api/download?id="+obj.id+"'\">"+
				//	"<i class=\"fa fa-download\"></i>"+
				//"</button>"+
			"</td>"+
		"</tr>");	
	});              
	$("#files_len").html(size); 
}

function fill_collections_search(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("collections_search",size,cpage);
	$("#search-collection-table tbody").empty();
    var organ_filter = [];
    var pi_filter = [];
    var disc_filter = [];
	$.each(data.response.docs, function(key, obj) {
	  var color = "btn-info";
	  if(user_data["FavoriteCollections"].includes(obj.id)){
			color = "btn-success";
	  }
	  var thumb = "";
	  var filetype = obj.FileType ? obj.FileType.join(",") : "";
	  var description = obj.Description? obj.Description.join(",") : "";
	  if ('FileThumbnailUrl' in obj){
		thumb = "<img width='50' height='50' src='"+obj.FileThumbnailUrl+"'/>";
	  }
      organ_filter.push(String(obj.Organ));
      disc_filter.push(String(obj.Discipline));
      pi_filter.push(String(obj.LeadPI));
	  $("#search-collection-table tbody").append(
		"<tr>"+
			"<td><div class=\"form-check\">"+
				"<label class=\"form-check-label\">"+
					"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
					"<span class=\"form-check-sign\"></span>"+
				"</label>"+
			"</div></td><td>"+
			"<a href=\"/labcas-ui/application/labcas_collection-detail_table.html?collection_id="+
                    obj.id+"\">"+
                obj.CollectionName+"</a></td>"+
                "<td>"+obj.LeadPI+"</td>"+
                "<td>"+obj.Institution+"</td>"+
                "<td>"+obj.Discipline+"</td>"+
                "<td>"+obj.DataCustodian+"</td>"+
                "<td>"+obj.Organ+"</td>"+
			"<td class=\"td-actions text-right\">"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\"  onclick=\"save_favorite('"+obj.id+"', 'FavoriteCollections')\" class=\"btn "+color+" btn-simple btn-link\">"+
					"<i class=\"fa fa-star\"></i>"+
				"</button>"+
				//"<button type=\"button\" rel=\"tooltip\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\">"+
				//	"<i class=\"fa fa-download\"></i>"+
				//"</button>"+
			"</td>"+
		"</tr>");	
	});                                                                     
    $("#collections_len").html(size); 
    organ_filter = organ_filter.unique();
    disc_filter = disc_filter.unique();
    pi_filter = pi_filter.unique();
    if (Cookies.get("search_filter") != "on"){
        var organ_list = [];
        $.each(organ_filter, function(key, obj) {
            //console.log(key);
            //console.log(obj);
            $.each(obj.split(","),function(i,o){
                if ($.trim(o) != ""){
                    organ_list.push($.trim(o).replace(" ","+"));
                }
            });
            //.find('input[type="checkbox"]')
              //  .last()
                //.bootstrapToggle();
        });
        $.each($.unique(organ_list),function(i,o){
            $("#organ_filters").append($(' <div class="row"><div class="col-md-6"><center>'+$.trim(o)+'</center></div><div class="col-md-6"><input type="checkbox" name="organ_filter[]" value="'+$.trim(o)+'" data-toggle="switch" data-on-color="info" data-off-color="info" data-on-text="<i class=\'fa fa-check\'></i>" data-off-text="<i class=\'fa fa-times\'></i>"><span class="toggle"></span></div></div>'));
        });

        var pi_list = [];
        $.each(pi_filter, function(key, obj) {
            $.each(obj.split(","),function(i,o){
                if ($.trim(o) != ""){
                    pi_list.push($.trim(o).replace(" ","+"));
                }
            });
        });
        $.each($.unique(pi_list),function(i,o){
            $("#pi_filters").append($(' <div class="row"><div class="col-md-6"><center>'+$.trim(o)+'</center></div><div class="col-md-6"><input type="checkbox" name="pi_filter[]" value="'+$.trim(o)+'" data-toggle="switch" data-on-color="info" data-off-color="info" data-on-text="<i class=\'fa fa-check\'></i>" data-off-text="<i class=\'fa fa-times\'></i>"><span class="toggle"></span></div></div>'));
        });

        var disc_list = [];
        $.each(disc_filter, function(key, obj) {
            $.each(obj.split(","),function(i,o){
                if ($.trim(o) != ""){
                     disc_list.push($.trim(o).replace(" ","+"));
                }
            });
        });
        $.each($.unique(disc_list),function(i,o){
            $("#disc_filters").append($(' <div class="row"><div class="col-md-6"><center>'+$.trim(o)+'</center></div><div class="col-md-6"><input type="checkbox" name="disc_filter[]" value="'+$.trim(o)+'" data-toggle="switch" data-on-color="info" data-off-color="info" data-on-text="<i class=\'fa fa-check\'></i>" data-off-text="<i class=\'fa fa-times\'></i>"><span class="toggle"></span></div></div>'));
        });

        $('input[name="organ_filter[]"]').change(function() {
            var organ_val = [];
            $("input[name='organ_filter[]']").each(function (index, obj) {
                if(this.checked) {
                    organ_val.push(this.value);
                }
            });
            var organ_search = "";
            if (organ_val.length > 0){
                organ_search = "&fq=(Organ:"+organ_val.join(" OR Organ:")+")";
            }
            //console.log(organ_search);
            Cookies.set("organ_filter", organ_search);
            Cookies.set("search_filter", "on");
            setup_labcas_search(Cookies.get('search'), "all", 0);
        });
        $('input[name="pi_filter[]"]').change(function() {
            var pi_val = [];
            $("input[name='pi_filter[]']").each(function (index, obj) {
                if(this.checked) {
                    pi_val.push(this.value);
                }
            });
            var pi_search = "";
            if (pi_val.length > 0){
                pi_search = "&fq=(LeadPI:"+pi_val.join(" OR LeadPI:")+")";
            }
            Cookies.set("pi_filter", pi_search);
            Cookies.set("search_filter", "on");
            setup_labcas_search(Cookies.get('search'), "all", 0);
        });
        $('input[name="disc_filter[]"]').change(function() {
            var disc_val = [];
            $("input[name='disc_filter[]']").each(function (index, obj) {
                if(this.checked) {
                    disc_val.push(this.value);
                }
            });
            var disc_search = "";
            if (disc_val.length > 0){
                disc_search = "&fq=(Discipline:"+disc_val.join(" OR Discipline:")+")";
            }
            //console.log(disc_search);
            Cookies.set("disc_filter", disc_search);
            Cookies.set("search_filter", "on");
            setup_labcas_search(Cookies.get('search'), "all", 0);
        });

    }
}


function setup_labcas_search(query, divid, cpage){
    console.log("Searching...");
    if (divid == "collections_search" || divid == "all"){
        console.log(Cookies.get('environment')+"/data-access-api/collections/select?q=*"+query+"*"+Cookies.get('organ_filter')+Cookies.get('pi_filter')+Cookies.get('disc_filter')+"&wt=json&indent=true&start="+cpage*10);
		$.ajax({
			url: Cookies.get('environment')+"/data-access-api/collections/select?q=*"+query+"*"+Cookies.get('organ_filter')+Cookies.get('pi_filter')+Cookies.get('disc_filter')+"&wt=json&indent=true&start="+cpage*10,	
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
			},
			type: 'GET',
			dataType: 'json',
			success: function (data) {
				fill_collections_search(data);
			},
			error: function(){
				 alert("Login expired, please login...");
				 window.location.replace("/labcas-ui/application/pages/login.html");
			 }
		});
    }
    if (divid == "datasets_search" || divid == "all"){
        $.ajax({
            url: Cookies.get('environment')+"/data-access-api/datasets/select?q=*"+query+"*&wt=json&indent=true&start="+cpage*10,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
            },
            type: 'GET',
            dataType: 'json',
            processData: false,
            success: function (data) {
                fill_datasets_search(data);
            },
            error: function(){
                 alert("Login expired, please login...");
                 window.location.replace("/labcas-ui/application/pages/login.html");
             }
        });
    }
    if (divid == "files_search" || divid == "all"){
		$.ajax({
			url: Cookies.get('environment')+"/data-access-api/files/select?q=*"+query+"*&wt=json&indent=true&start="+cpage*10,
			xhrFields: {
					withCredentials: true
			  },
			beforeSend: function(xhr, settings) { 
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
			},
			dataType: 'json',
			success: function (data) {
				fill_files_search(data);
			},
			error: function(){
				 alert("Login expired, please login...");
				 window.location.replace("/labcas-ui/application/pages/login.html");
			 
			 }
		});
	}
}
/* End Search Section */


/*Starred Section*/
function fill_datasets_starred(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("datasets_search",size,cpage);
	//console.log(data);
	$("#starred-dataset-table tbody").empty();
	$.each(data.response.docs, function(key, obj) {
	  if(user_data["FavoriteDatasets"].includes(obj.id)){
		  var color = "btn-success";
	  
	
		  var thumb = "";
		  var filetype = obj.FileType ? obj.FileType.join(",") : "";
		  var description = obj.Description? obj.Description.join(",") : "";
		  if ('FileThumbnailUrl' in obj){
			thumb = "<img width='50' height='50' src='"+obj.FileThumbnailUrl+"'/>";
		  }
		  $("#starred-dataset-table tbody").append(
			"<tr>"+
				"<td><div class=\"form-check\">"+
					"<label class=\"form-check-label\">"+
						"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
						"<span class=\"form-check-sign\"></span>"+
					"</label>"+
				"</div></td><td>"+
				"<a href=\"/labcas-ui/application/labcas_dataset-detail_table.html?dataset_id="+
						obj.id+"\">"+
					obj.DatasetName+"</a></td>"+
					"<td><a href=\"/labcas-ui/application/labcas_collection-detail_table.html?collection_id="+
						obj.CollectionId+"\">"+
							obj.CollectionName+"</a></td>"+
					"<td>"+obj.DatasetVersion+"</td>"+
				"<td class=\"td-actions text-right\">"+
					"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteDatasets')\" class=\"btn "+color+" btn-simple btn-link\">"+
						"<i class=\"fa fa-star\"></i>"+
					"</button>"+
					"<button type=\"button\" rel=\"tooltip\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\">"+
						"<i class=\"fa fa-download\"></i>"+
					"</button>"+
				"</td>"+
			"</tr>");	
		  }
	});                
	$("#datasets_len").html(size); 
}
function fill_files_starred(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("files_search",size,cpage);
	//console.log(data);
	$("#starred-file-table tbody").empty();
	$.each(data.response.docs, function(key, obj) {
	  if(user_data["FavoriteFiles"].includes(obj.id)){
		  var color = "btn-success";
	  
		  var thumb = "";
		  var filetype = obj.FileType ? obj.FileType.join(",") : "";
		  var description = obj.Description? obj.Description.join(",") : "";
		  if ('FileThumbnailUrl' in obj){
			thumb = "<img width='50' height='50' src='"+obj.FileThumbnailUrl+"'/>";
		  }
		  $("#starred-file-table tbody").append(
			"<tr>"+
				"<td><div class=\"form-check\">"+
					"<label class=\"form-check-label\">"+
						"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
						"<span class=\"form-check-sign\"></span>"+
					"</label>"+
				"</div></td>"+
				"<td class='text-left'>"+
					"<a href=\"/labcas-ui/application/labcas_file-detail_table.html?file_id="+
						obj.id+"\">"+
						obj.FileName+
					"</a>"+
				"</td>"+
				"<td class='text-left'>"+
						filetype +
				"</td>"+
				"<td class='text-left'>"+
						description +
				"</td>"+
				"<td class='text-left'>"+
						thumb+
				"</td>"+
				"<td class='text-left'>"+
						obj.FileSize+
				"</td>"+
				"<td class=\"td-actions text-right\">"+
					"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteFiles')\" class=\"btn "+color+" btn-simple btn-link\">"+
						"<i class=\"fa fa-star\"></i>"+
					"</button>"+
					//"<button type=\"button\" rel=\"tooltip\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\"  onclick=\"location.href='https://mcl-labcas.jpl.nasa.gov/data-access-api/download?id="+obj.id+"'\">"+
					//	"<i class=\"fa fa-download\"></i>"+
					//"</button>"+
				"</td>"+
			"</tr>");	
		  }
	});              
	$("#files_len").html(size); 
}

function fill_collections_starred(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("collections_search",size,cpage);
	$("#starred-collection-table tbody").empty();
	
	console.log(data.response.docs);
	$.each(data.response.docs, function(key, obj) {
	  if(user_data["FavoriteCollections"].includes(obj.id)){
		  var color = "btn-success";
	  
		  var thumb = "";
		  var filetype = obj.FileType ? obj.FileType.join(",") : "";
		  var description = obj.Description? obj.Description.join(",") : "";
		  if ('FileThumbnailUrl' in obj){
			thumb = "<img width='50' height='50' src='"+obj.FileThumbnailUrl+"'/>";
		  }
		  $("#starred-collection-table tbody").append(
			"<tr>"+
				"<td><div class=\"form-check\">"+
					"<label class=\"form-check-label\">"+
						"<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
						"<span class=\"form-check-sign\"></span>"+
					"</label>"+
				"</div></td><td>"+
				"<a href=\"/labcas-ui/application/labcas_collection-detail_table.html?collection_id="+
						obj.id+"\">"+
					obj.CollectionName+"</a></td>"+
					"<td>"+obj.LeadPI+"</td>"+
					"<td>"+obj.Institution+"</td>"+
					"<td>"+obj.Discipline+"</td>"+
					"<td>"+obj.DataCustodian+"</td>"+
					"<td>"+obj.Organ+"</td>"+
				"<td class=\"td-actions text-right\">"+
					"<button type=\"button\" rel=\"tooltip\" title=\"Favorite\"  onclick=\"save_favorite('"+obj.id+"', 'FavoriteCollections')\" class=\"btn "+color+" btn-simple btn-link\">"+
						"<i class=\"fa fa-star\"></i>"+
					"</button>"+
				"</td>"+
			"</tr>");	
		}
	});                                                                     
    $("#collections_len").html(size); 
    
}

function setup_labcas_starred(query, divid, cpage){
    console.log("Loading data...");
    if (divid == "collections_starred" || divid == "all"){
        console.log(Cookies.get('environment')+"/data-access-api/collections/select?q=*&wt=json&indent=true&start="+cpage*10);
		$.ajax({
			url: Cookies.get('environment')+"/data-access-api/collections/select?q=*&wt=json&indent=true&start="+cpage*10,	
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
			},
			type: 'GET',
			dataType: 'json',
			success: function (data) {
				fill_collections_starred(data);
			},
			error: function(){
				 alert("Login expired, please login...");
				 window.location.replace("/labcas-ui/application/pages/login.html");
			 }
		});
    }
    if (divid == "datasets_starred" || divid == "all"){
        $.ajax({
            url: Cookies.get('environment')+"/data-access-api/datasets/select?q=*"+query+"*&wt=json&indent=true&start="+cpage*10,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
            },
            type: 'GET',
            dataType: 'json',
            processData: false,
            success: function (data) {
                fill_datasets_starred(data);
            },
            error: function(){
                 alert("Login expired, please login...");
                 window.location.replace("/labcas-ui/application/pages/login.html");
             }
        });
    }
    if (divid == "files_starred" || divid == "all"){
		$.ajax({
			url: Cookies.get('environment')+"/data-access-api/files/select?q=*&wt=json&indent=true&start="+cpage*10,
			xhrFields: {
					withCredentials: true
			  },
			beforeSend: function(xhr, settings) { 
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
			},
			dataType: 'json',
			success: function (data) {
				fill_files_starred(data);
			},
			error: function(){
				 alert("Login expired, please login...");
				 window.location.replace("/labcas-ui/application/pages/login.html");
			 
			 }
		});
	}
}

/* Starred Section End */