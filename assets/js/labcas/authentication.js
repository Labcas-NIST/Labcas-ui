var root_app = "mcl-labcas";
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
function fill_collections_data(data){
    $.each(data.response.docs, function(index, obj) {
          $("#collection-table tbody").append(
            "<tr>"+
                "<td></td><td>"+
                "<a href=\"/labcas-ui/application/labcas_collection-detail_table.html?collection_id="+
                    obj.id+"\">"+
                obj.CollectionName+"</a></td>"+
                "<td>"+obj.LeadPI+"</td>"+
                "<td>"+obj.Institution+"</td>"+
                "<td>"+obj.Discipline+"</td>"+
                "<td>"+obj.DataCustodian+"</td>"+
                "<td>"+obj.Organ+"</td>"+
                "<td></td>"+
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
	console.log("HERE");
	console.log(data);
	$("#collectiontitle").html(data.response.docs[0].CollectionName);
	$.each(data.response.docs[0], function(key, value) {
		if ($.isArray(value)){
			value = value.join(",");
		}
          $("#collectiondetails-table tbody").append(
            "<tr>"+
				"<td>"+key+":</td>"+
				"<td class='text-right'>"+
					value+
				"</td>"+
			"</tr>");
		
    });
    $("#collection_details_len").html(Object.keys(data.response.docs[0]).length);
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
	$.each(data.response.docs, function(key, value) {
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
						"<button type=\"button\" rel=\"tooltip\" title=\"Edit Task\" class=\"btn btn-info btn-simple btn-link\">"+
							"<i class=\"fa fa-share\"></i>"+
						"</button>"+
						"<button type=\"button\" rel=\"tooltip\" title=\"Remove\" class=\"btn btn-danger btn-simple btn-link\">"+
							"<i class=\"fa fa-star\"></i>"+
						"</button>"+
						"<button type=\"button\" rel=\"tooltip\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\">"+
							"<i class=\"fa fa-download\"></i>"+
						"</button>"+
					"</td>"+
				"</tr>");	
		});                                                                     
    $("#collection_datasets_len").html(data.response.numFound); 
}
function fill_files_data(data){
	var size = data.response.numFound;
	var cpage = data.response.start;
	load_pagination("files",size,cpage);
	$("#files-table tbody").empty();
	$.each(data.response.docs, function(key, value) {
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
				"<button type=\"button\" rel=\"tooltip\" title=\"Edit Task\" class=\"btn btn-info btn-simple btn-link\">"+
					"<i class=\"fa fa-share\"></i>"+
				"</button>"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Remove\" class=\"btn btn-danger btn-simple btn-link\">"+
					"<i class=\"fa fa-star\"></i>"+
				"</button>"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\" onclick=\"location.href='https://mcl-labcas.jpl.nasa.gov/data-access-api/download?id="+value.id+"'\">"+
					"<i class=\"fa fa-download\"></i>"+
				"</button>"+
			"</td>"+
		"</tr>");	
	});                                                                     
    $("#dataset_files_len").html(size); 
}

function setup_labcas_data(datatype, query, dataset_query){
    $.ajax({
        url: "https://"+root_app+".jpl.nasa.gov/data-access-api/collections/select?q="+query+"&wt=json&indent=true&rows=2147483647",
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
        },
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if (datatype == "collections"){
                fill_collections_data(data);
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
			url: "https://"+root_app+".jpl.nasa.gov/data-access-api/datasets/select?q="+dataset_query+"&wt=json&indent=true&rows=2147483647",
			beforeSend: function(xhr) { 
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
			},
			type: 'GET',
			dataType: 'json',
			processData: false,
			success: function (data) {
                console.log("https://"+root_app+".jpl.nasa.gov/data-access-api/datasets/select?q="+dataset_query+"&wt=json&indent=true&rows=2147483647");
                console.log(Cookies.get('token'));
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
			url: "https://"+root_app+".jpl.nasa.gov/data-access-api/datasets/select?q="+query+"&wt=json&indent=true&rows=2147483647",
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
        url: "https://"+root_app+".jpl.nasa.gov/data-access-api/files/select?q="+file_query+"&wt=json&indent=true&start="+cpage*10,
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
    console.log( "https://"+root_app+".jpl.nasa.gov/data-access-api/files/select?q="+query+"&wt=json&indent=true&rows=2147483647");
    $.ajax({
        url: "https://"+root_app+".jpl.nasa.gov/data-access-api/files/select?q="+query+"&wt=json&indent=true&rows=2147483647",
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
	console.log(data);
	$("#search-dataset-table tbody").empty();
	$.each(data.response.docs, function(key, obj) {
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
				"<button type=\"button\" rel=\"tooltip\" title=\"Edit Task\" class=\"btn btn-info btn-simple btn-link\">"+
					"<i class=\"fa fa-share\"></i>"+
				"</button>"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Remove\" class=\"btn btn-danger btn-simple btn-link\">"+
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
	console.log(data);
	$("#search-file-table tbody").empty();
	$.each(data.response.docs, function(key, obj) {
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
				"<button type=\"button\" rel=\"tooltip\" title=\"Edit Task\" class=\"btn btn-info btn-simple btn-link\">"+
					"<i class=\"fa fa-share\"></i>"+
				"</button>"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Remove\" class=\"btn btn-danger btn-simple btn-link\">"+
					"<i class=\"fa fa-star\"></i>"+
				"</button>"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\"  onclick=\"location.href='https://mcl-labcas.jpl.nasa.gov/data-access-api/download?id="+obj.id+"'\">"+
					"<i class=\"fa fa-download\"></i>"+
				"</button>"+
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
				"<button type=\"button\" rel=\"tooltip\" title=\"Edit Task\" class=\"btn btn-info btn-simple btn-link\">"+
					"<i class=\"fa fa-share\"></i>"+
				"</button>"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Remove\" class=\"btn btn-danger btn-simple btn-link\">"+
					"<i class=\"fa fa-star\"></i>"+
				"</button>"+
				"<button type=\"button\" rel=\"tooltip\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\">"+
					"<i class=\"fa fa-download\"></i>"+
				"</button>"+
			"</td>"+
		"</tr>");	
	});                                                                     
    $("#collections_len").html(size); 
    organ_filter = organ_filter.unique();
    disc_filter = disc_filter.unique();
    pi_filter = pi_filter.unique();
    $.each(organ_filter, function(key, obj) {
        //console.log(key);
        //console.log(obj);
        $("#organ_filters").append($(' <div class="row"><div class="col-md-6"><center>'+obj+'</center></div><div class="col-md-6"><input type="checkbox" checked="" data-toggle="switch" data-on-color="info" data-off-color="info" data-on-text="<i class=\'fa fa-check\'></i>" data-off-text="<i class=\'fa fa-times\'></i>"><span class="toggle"></span></div></div>'));
        //.find('input[type="checkbox"]')
          //  .last()
            //.bootstrapToggle();
    });
    $.each(pi_filter, function(key, obj) {
        $("#pi_filters").append($(' <div class="row"><div class="col-md-6"><center>'+obj+'</center></div><div class="col-md-6"><input type="checkbox" checked="" data-toggle="switch" data-on-color="info" data-off-color="info" data-on-text="<i class=\'fa fa-check\'></i>" data-off-text="<i class=\'fa fa-times\'></i>"><span class="toggle"></span></div></div>'));
    });
    $.each(disc_filter, function(key, obj) {
        $("#disc_filters").append($(' <div class="row"><div class="col-md-6"><center>'+obj+'</center></div><div class="col-md-6"><input type="checkbox" checked="" data-toggle="switch" data-on-color="info" data-off-color="info" data-on-text="<i class=\'fa fa-check\'></i>" data-off-text="<i class=\'fa fa-times\'></i>"><span class="toggle"></span></div></div>'));
    });

}


function setup_labcas_search(query, divid, cpage){
    console.log("Searching...");
    if (divid == "collections_search" || divid == "all"){
    console.log(cpage);
		$.ajax({
			url: "https://"+root_app+".jpl.nasa.gov/data-access-api/collections/select?q=*"+query+"*&wt=json&indent=true&start="+cpage*10,	
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
            url: "https://"+root_app+".jpl.nasa.gov/data-access-api/datasets/select?q=*"+query+"*&wt=json&indent=true&start="+cpage*10,
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
			url: "https://"+root_app+".jpl.nasa.gov/data-access-api/files/select?q=*"+query+"*&wt=json&indent=true&start="+cpage*10,
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
