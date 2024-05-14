var collection_facets = {};
var collection_facets_alias = {};
function collection_hierarchy_fill(data){
    var hierarchy = $('#view_tag_select')
    var hierarchy_list = {};
    collection_facets = data;
    $.each(data.facet_counts.facet_fields, function(key, value) {
        var prev = 1;
        var prev_v = 0;
        $.each(value, function(k, v) {
            if (prev == 1){
                prev_v = v;
                prev = 0;
            }else{
                prev = 1;
                if (v != 0){
                    hierarchy_list[key] = 1;
                    return;
                }
            }
        });
    });
    $.each(hierarchy_list, function (i, item) {
        hierarchy.append($('<option>', { 
            value: i,
            text : i 
        }));

    });
    console.log(hierarchy_list);
    console.log("Done");

    //Make sure hierarchy default is populated #-tagged #defaulthierarchy
    if (localStorage.getItem("hierarchy_tags_"+localStorage.getItem("current_collection_id")) != ""){
        var valid_tags_check = false;
        var hierarchy_tags = [];
        if (localStorage.getItem("hierarchy_tags_"+localStorage.getItem("current_collection_id"))){
            hierarchy_tags = localStorage.getItem("hierarchy_tags_"+localStorage.getItem("current_collection_id")).split(",");
        }
        var elt = $('#view_tags');
        $.each(hierarchy_tags, function( key, val ) {
            if (val in collection_facets.facet_counts.facet_fields){
                elt.tagsinput('add', { "value": val});
                valid_tags_check = true;
            }
        });
        //if tag exist as a key in the files under this collection, show the hierarchy built by the hierarchy tag combination
                        if (valid_tags_check){
            $('#datasets-table').hide();
            $('#hierarchy_').show();
        }
    }

}

function collection_hierarchy_get(collection_id){
    var facets = "&facet.field=participantID&facet.field=SubmittingInvestigatorID&facet.field=contains_image&facet.field=dicom_StudyInstanceUID&facet.field=dicom_AccessionNumber&facet.field=dicom_PatientID&facet.field=dicom_StudyDate&facet.field=n&facet.field=dicom_Modality&facet.field=dicom_SeriesDescription&facet.field=dicom_StudyDescription&facet.field=dicom_SeriesInstanceUID&facet.field=DatasetName&facet.field=AssayType&facet.field=ContentType&facet.field=library_strategy";
    url = localStorage.getItem('environment')+"/data-access-api/files/select?q=CollectionId:"+collection_id+"&facet=true&facet.limit=-1&facet.mincount=1"+facets+"&wt=json&rows=0";
    query_labcas_api(url, collection_hierarchy_fill);
}

/*function collection_hierarchy_filter(collection_id, facet){
    var facets = "&facet.field="+facet;
    url = localStorage.getItem('environment')+"/data-access-api/files/select?q=CollectionId:"+collection_id+"&facet=true&facet.limit=-1"+facets+"&wt=json&rows=0";
    query_labcas_api(url, fill_hierarchy_data);
}*/

function get_hierarchy_selected(idx){
    var hierarchy = $('#view_tags');
    if (idx < hierarchy.val().split(",").length){
        return hierarchy.val().split(",")[idx];
    }else{
        return -1;
    }
}
function toggle_child_elements(idx, show){
    if (show == "true"){
        $('div[id^="hierarchy_'+idx+'_"]').show();
        $('#toggle_'+idx).html("<a onclick='toggle_child_elements(\""+idx+"\",\"false\")' href='#'><i class='fa fa-minus'></i></a>");
    }else{
        $('div[id^="hierarchy_'+idx+'_"]').hide();
        $('#toggle_'+idx).html("<a onclick='toggle_child_elements(\""+idx+"\",\"true\")' href='#'><i class='fa fa-plus'></i></a>");
    }
}
function fill_hierarchy_data(data, collection_id, path, pathval, idx){
    var collection_file_facets = data.facet_counts.facet_fields;
    collection_file_f = get_hierarchy_selected(idx);

    if (collection_file_facets != -1){
        idx += 1;
        var prev = 1;
        var prev_v = 0;
        $.each(collection_file_facets[collection_file_f], function(k, v) {
            if (prev == 1){
                prev_v = v;
                prev = 0;
            }else{
                prev = 1;
                if (v != 0 && $.trim(prev_v) != ''){
                    var pathval_child = pathval.slice();
                    var path_child = path.slice();
                    var pathval_parent = pathval.slice();
                    pathval_child.push(prev_v);
                    path_child.push(collection_file_f);
                    var mapped_path = replaceRegExp(pathval.join("_"), "_");
                    var mapped_path_child = replaceRegExp(pathval_child.join("_"), "_");
                    var mapped_path_parent = replaceRegExp(pathval_parent.join("_"), "_");
                    collection_facets_alias[mapped_path_child] = [path_child, pathval_child];
                    var visibility = "";
                    var checkbox = "<a onclick='toggle_child_elements(\""+mapped_path_child+"\",\"true\")' href='#'><i class='fa fa-plus'></i></a>";
                    if (idx > 1){
                        visibility = "style='display:none'";
                        checkbox = "<a onclick='toggle_child_elements(\""+mapped_path_child+"\",\"false\")' href='#'><i class='fa fa-minus'></i></a>";
                    }
                    $('#toggle_'+mapped_path_parent+'_').css("visibility", "visible");
                    $('#toggle_'+mapped_path_parent).css("visibility", "visible");
                    $('#hierarchy_'+mapped_path).append("<div id='hierarchy_"+mapped_path_child+"' "+visibility+" class=''><hr style='margin-bottom:0;margin-top:0'>"+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".repeat(idx)+"<nobr><span id='toggle_"+mapped_path_child+"' style='visibility: hidden'>"+checkbox+"</span><a onclick='submit_hierarchy_link(\""+mapped_path_child+"\")' href='#'>"+prev_v+"</a></nobr></div>");
                    collection_file_f_child = get_hierarchy_selected(idx);
                    if (collection_file_f_child == -1){
                        return;
                    }
                    //Start next child discovery
                    filters = [];
                    for (var i = 0; i < path_child.length; i++) {
                        filters.push("fq=("+path_child[i]+":"+escapeRegExp(pathval_child[i]).replace(/\\&/g,"%5C%26").replace(/\\/g,"%5C")+")");
                    }
                    facets = "&facet.field="+collection_file_f_child;
                    
                    filter_field = "";
                    if (filters.length > 0){
                        filter_field = "&"+filters.join("&");
                    }
                    url = localStorage.getItem('environment')+"/data-access-api/files/select?q=CollectionId:"+collection_id+filter_field+"&facet=true&facet.limit=-1&facet.mincount=1"+facets+"&wt=json&rows=0";
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
                        success: function (filedata) {
                            fill_hierarchy_data(filedata, collection_id, path_child, pathval_child, idx);
                        },error: function(e){
                            if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                                 localStorage.setItem("logout_alert","On");
                                 alert(formatTimeOfDay($.now()) + ": Login expired, please login...");
                            }
                            redirect_to_login();
                        }
                    });
                }
            }
        });
    }
}

function submit_hierarchy_link(key){
    var link_path = collection_facets_alias[key];
    console.log(link_path);
    localStorage.setItem("hierarchy_dict_current",JSON.stringify(link_path));
     window.location.replace("/labcas-ui/cd/index.html");
}
function fill_hierarchy_files_data(data){
    var size = data.response.numFound;
    var cpage = data.response.start;
    console.log("HERE11");
    load_pagination("hierarchy_files",size,cpage);
    console.log("HERE12");
    $("#files-table tbody").empty();
    var download_list = JSON.parse(localStorage.getItem("download_list"));
    var cart_list = JSON.parse(localStorage.getItem("cart_list"));

        $.each(data.response.docs, function(key, value) {

        var color = "btn-info";
        if(user_data["FavoriteFiles"].includes(value.id)){
            color = "btn-success";
        }

        var thumb = "";
        var filetype = value.FileType ? value.FileType.join(",") : "";
        //var filename = value.FileName ? value.FileName : "";
        var filename = value.name ? value.name : "";
        if (filename == ""){
            filename = value.FileName ? value.FileName : "";
        }
        var version = value.DatasetVersion ? value.DatasetVersion : "";
        var fileloc = value.FileLocation ? value.FileLocation : "";
        var site = value.Institution ? value.Institution.join(",") : "";
        var parID = value.participantID ? value.participantID.join(",") : "";
        var speID = value.specimen_id ? value.specimen_id.join(",") : "";
        var description = value.Description? value.Description.join(",") : "";
        if ('ThumbnailRelativePath' in value){
            thumb = "<img width='50' height='50' src='"+localStorage.getItem('environment')+"/labcas-ui/assets/"+value.ThumbnailRelativePath+"'/>";
        }
        var html_safe_id = encodeURI(escapeRegExp(value.id)).replace("&","%26");
        var filesize = "";
        var filesizenum = 0;
        if (value.FileSize){
            filesize = humanFileSize(value.FileSize, true);
            filesizenum = value.FileSize;
        }
        var checked = "";
        if ( (download_list &&  html_safe_id in download_list) || (cart_list &&  html_safe_id in cart_list)){
            checked = "checked";
        }
        $("#files-table tbody").append(
        "<tr>"+
            "<td><center><input type='checkbox' class='form-check-input' data-loc='"+fileloc+"' data-name='"+filename+"' data-version='"+version+"' value='"+html_safe_id+"' "+checked+" data-valuesize='"+filesizenum+"'></center></td>"+
            "<td class='text-left' style='padding-right: 10px'>"+
                "<a href=\"/labcas-ui/f/index.html?file_id="+
                    html_safe_id+"\">"+
                    value.FileName+
                "</a>"+
            "</td>"+
            "<td class='text-left'>"+
                    parID +
            "</td>"+
            "<td class='text-left'>"+
                    speID +
            "</td>"+
            "<td class='text-left'>"+
                    site +
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
                    filesize+
            "</td>"+
            "<td class=\"td-actions text-right\">"+
                "<button type=\"button\" rel=\"favoritebutton\" title=\"Favorite\" onclick=\"save_favorite('"+value.id+"', 'FavoriteFiles', this)\" class=\"btn "+color+" btn-simple btn-link\">"+
                    "<i class=\"fa fa-star\"></i>"+
                "</button>"+
                "<button type=\"button\" rel=\"downloadbutton\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\" onclick=\"download_file('"+html_safe_id+"','single')\">"+
                    "<i class=\"fa fa-download\"></i>"+
                "</button>"+
            "</td>"+
        "</tr>");
    });
    $("#collection_files_len").html(size);
    $("#collection_favorites_len").html(user_data['FavoriteFiles'].length+user_data['FavoriteDatasets'].length+user_data['FavoriteCollections'].length);
    $('#loading_file').hide(500);
    if (size > 0){
    $("#children-files").show();
    }
    init_file_checkboxes("files-table");

}

function setup_labcas_hierarchy_data(file_query, cpage){
    console.log(file_query);
    console.log(cpage);

    var url = localStorage.getItem('environment')+"/data-access-api/files/select?q=*"+file_query+"&wt=json&indent=true&sort=FileName%20asc&start="+cpage*10;
    console.log(url);
    $.ajax({
        url: url,
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function(xhr, settings) {
            if(Cookies.get('token') && Cookies.get('token') != "None"){
                xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
            }
        },
        dataType: 'json',
        success: function (data) {
            fill_hierarchy_files_data(data);
        },
        error: function(e){
        if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
             localStorage.setItem("logout_alert","On");
             alert("You are currently logged out. Redirecting you to log in.");
        }
        redirect_to_login();

         }
    });
}
