var collection_facets = {};
var collection_facets_alias = {};
var hierarchy_unique_check = {};
var obj_type = "collection";


function collection_hierarchy_default(){

    var valid_tags_check = false;
    var elt = $('#view_tags');
    var last_val = "";
    var hierarchy_tags = "";

    if(localStorage.getItem("collection_custom_hierarchy_default")){
        var custom_hierarchy_default = JSON.parse(localStorage.getItem("collection_custom_hierarchy_default"));
        if (Object.keys(custom_hierarchy_default).includes(localStorage.getItem("current_collection_id"))){
            hierarchy_tags = custom_hierarchy_default[localStorage.getItem("current_collection_id")];
        }
    }   

    if (hierarchy_tags != ""){
        elt.tagsinput('removeAll');

        $.each(hierarchy_tags.split(","), function( key, val ) {
            elt.tagsinput('add', { "value": val});
            valid_tags_check = true;
            last_val = val;
        });

        $('#view_tag_select').val(last_val);
        //if tag exist as a key in the files under this collection, show the hierarchy built by the hierarchy tag combination
        if (valid_tags_check){
            $('#datasets-table').hide();
            $('#hierarchy_').show();
            $('#virtual_expand_all').show();
            $('#virtual_expand_all_label').show();
        }
    }
}

function collection_hierarchy_fill(data){
    var hierarchy = $('#view_tag_select')
    var hierarchy_list = {};
    collection_facets = data;
    var show_virtual_hierarchy_list = localStorage.getItem("collection_virtual_hierarchy_show").split(",");
    $.each(collection_facets.facet_counts.facet_fields, function(key, value) {
        if (!show_virtual_hierarchy_list.includes(key)){
                return;
        }
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
    var sorted_hierarchy_keys = Object.keys(hierarchy_list).sort();
    $.each(sorted_hierarchy_keys, function (i, item) {
        hierarchy.append($('<option>', {
            value: item,
            text : item
        }));

    });


    //Check if any tags were validly added, use to trigger hierarchy view
    var valid_tags_check = false;
    var elt = $('#view_tags');
    var last_val = "";
    var hierarchy_tags = "";
    //Make sure hierarchy default is populated #-tagged #defaulthierarchy
    if (localStorage.getItem("hierarchy_tags_"+localStorage.getItem("current_collection_id")) != "" && localStorage.getItem("hierarchy_tags_"+localStorage.getItem("current_collection_id"))){
        var hierarchy_tags = localStorage.getItem("hierarchy_tags_"+localStorage.getItem("current_collection_id"));
    }else if(localStorage.getItem("collection_custom_hierarchy_default")){
        var custom_hierarchy_default = JSON.parse(localStorage.getItem("collection_custom_hierarchy_default"));
        if (Object.keys(custom_hierarchy_default).includes(localStorage.getItem("current_collection_id"))){
            hierarchy_tags = custom_hierarchy_default[localStorage.getItem("current_collection_id")];
        }
    }

    if (hierarchy_tags != ""){
        $.each(hierarchy_tags.split(","), function( key, val ) {
            if (val in collection_facets.facet_counts.facet_fields){
                elt.tagsinput('add', { "value": val});
                valid_tags_check = true;
                last_val = val;
            }
        });

        $('#view_tag_select').val(last_val);
        //if tag exist as a key in the files under this collection, show the hierarchy built by the hierarchy tag combination
        if (valid_tags_check){
            $('#datasets-table').hide();
            $('#hierarchy_').show();
            $('#virtual_expand_all').show();
            $('#virtual_expand_all_label').show();
        }
    }
}

function collection_hierarchy_get(collection_id, obj_type){

    var show_virtual_hierarchy_list = localStorage.getItem("collection_virtual_hierarchy_show").split(",");
    var facets = "&facet.field="+show_virtual_hierarchy_list.join("&facet.field=");

    url = localStorage.getItem('environment')+"/data-access-api/files/select?q=CollectionId:"+collection_id+"&facet=true&facet.limit=-1&facet.mincount=1"+facets+"&wt=json&rows=0";
    if (obj_type == "dataset"){
        url = localStorage.getItem('environment')+"/data-access-api/files/select?q=DatasetId:"+collection_id+"*&facet=true&facet.limit=-1&facet.mincount=1"+facets+"&wt=json&rows=0";
    }
    
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
            collection_hierarchy_fill(filedata);           
        },error: function(e){
            if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                 localStorage.setItem("logout_alert","On");
                 alert(formatTimeOfDay($.now()) + ": Login expired, please login...");
            }
            redirect_to_login();
        }
    });
}


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
	    if($('#virtual_expand_all').is(":checked")){
            $('div[id^="hierarchy_'+idx+'_"]').show();
            
            $('span[id^="toggle_'+idx).each(function() {
                $(this).find('i').toggleClass("fa-minus",true)
                $(this).find('i').toggleClass("fa-plus",false)
                $(this).find('a').attr("onclick","toggle_child_elements(\""+$(this).attr('id').replace(/toggle_/g,"")+"\",\"false\")");
            });
        }else{
            $('#hierarchy_'+idx).children().show();
            $('span[id^="toggle_'+idx+'_"]').each(function() {
                $(this).find('i').toggleClass("fa-minus",false)
                $(this).find('i').toggleClass("fa-plus",true)
                $(this).find('a').attr("onclick","toggle_child_elements(\""+$(this).attr('id').replace(/toggle_/g,"")+"\",\"true\")");
            });
            $('#toggle_'+idx).html("<a onclick='toggle_child_elements(\""+idx+"\",\"false\")' href='#'><i class='fa fa-minus'></i></a>");
        }
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
        var pre_sorted_collection_file_facets = [];
        $.each(collection_file_facets[collection_file_f], function(k, v) {
            if (prev == 1){
                prev_v = v;
                prev = 0;
            }else{
                prev = 1;
                if (v != 0 && $.trim(prev_v) != ''){
                    pre_sorted_collection_file_facets.push(prev_v);
                }
            }
        });
        var sorted_collection_file_facets_vals = pre_sorted_collection_file_facets.sort();

        $.each(sorted_collection_file_facets_vals, function(k, v) {
                var unique_string = pathval+"_"+v
                if (unique_string in hierarchy_unique_check){
                    hierarchy_unique_check[unique_string] += 1;
                    if (hierarchy_unique_check[unique_string] > 1 && idx > 1){
                        return;
                    }
                }else{
                    hierarchy_unique_check[unique_string] = 1;
                }

                if (v != 0 && $.trim(v) != ''){
                    var pathval_child = pathval.slice();
                    var path_child = path.slice();
                    var pathval_parent = pathval.slice();
                    pathval_child.push(v);
                    path_child.push(collection_file_f);
                    var mapped_path = replaceRegExp(pathval.join("_"), "_");
                    var mapped_path_child = replaceRegExp(pathval_child.join("_"), "_");
                    var mapped_path_parent = replaceRegExp(pathval_parent.join("_"), "_");
                    collection_facets_alias[mapped_path_child] = [path_child, pathval_child];
                    var visibility = "";
                    var checkbox = "<a onclick='toggle_child_elements(\""+mapped_path_child+"\",\"true\")' href='#'><i class='fa fa-plus'></i></a>";
                    if (idx > 1){
                        visibility = "style='display:none'";
                        checkbox = "<a onclick='toggle_child_elements(\""+mapped_path_child+"\",\"true\")' href='#'><i class='fa fa-plus'></i></a>";
                    }
                    $('#toggle_'+mapped_path_parent+'_').css("visibility", "visible");
                    $('#toggle_'+mapped_path_parent).css("visibility", "visible");
                    $('#hierarchy_'+mapped_path).append("<div id='hierarchy_"+mapped_path_child+"' "+visibility+" class=''><hr style='margin-bottom:0;margin-top:0'>"+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".repeat(idx)+"<nobr><span id='toggle_"+mapped_path_child+"' style='visibility: hidden'>"+checkbox+"</span><a onclick='submit_hierarchy_link(\""+mapped_path_child+"\")' href='#'>"+v+"</a>"+"<div class='text-right' valign='middle' style='padding: 0px 8px; vertical-align: middle; height: 10px'><button type='button' rel='downloadbutton' title='Download' class='btn btn-danger btn-simple btn-link' onclick='generate_hierarchy_query(\""+mapped_path_child+"\"); download_dataset(\"hierarchy_query\");' style='left: 0px; top: 50%; transform: translateY(-50%); color: red;'><i class='fa fa-download'></i></button></div></nobr></div>");
                    collection_file_f_child = get_hierarchy_selected(idx);
                    if (collection_file_f_child == -1){
                        return;
                    }
                    //Start next child discovery
                    var filters = [];
                    var filter_field_tmp = {};
                    for (var i = 0; i < path_child.length; i++) {
                        filters.push("fq=("+path_child[i]+':"'+escapeRegExp(pathval_child[i]).replace(/\\&/g,"%5C%26").replace(/\\/g,"%5C").replace(/%5C%20/g,"%20").replace(/%20/g,"%5C%20").replace(/ /g,"%5C%20")+'")');
                        filter_field_tmp[path_child[i]] = escapeRegExp(pathval_child[i]).replace(/\\&/g,"%5C%26").replace(/\\/g,"%5C").replace(/%5C%20/g,"%20").replace(/%20/g,"%5C%20").replace(/ /g,"%5C%20");
                    }
                    facets = "&facet.field="+collection_file_f_child;
                    
                    filter_field = "";
                    if (filters.length > 0){
                        filter_field = "&"+filters.join("&");
                    }

                    url = localStorage.getItem('environment')+"/data-access-api/files/select?q=CollectionId:"+collection_id+filter_field+"&facet=true&facet.limit=-1&facet.mincount=1"+facets+"&wt=json&rows=0";
                    if (obj_type == "dataset"){
                        url = localStorage.getItem('environment')+"/data-access-api/files/select?q=DatasetId:"+collection_id+"*"+filter_field+"&facet=true&facet.limit=-1&facet.mincount=1"+facets+"&wt=json&rows=0";
                    }
                    
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
        });
    }
}

function generate_facets(data, collection_id, filters){
    response = {};
    $.each(data.response.docs, function(key, obj) {
        var pass_flag = true;
        $.each(filters, function(f, fv) {
            if (obj[f] != fv){
                pass_flag = false;
            }
        });
        if (obj.CollectionId == collection_id && pass_flag){
            $.each(obj, function(k, v) {
                if (response[k]){
                    if (response[k][v]){
                        response[k][v] +=1;
                    }else{
                        response[k][v] = 1;
                    }
                }else{
                    response[k] = {};
                    response[k][v] = 1;
                }
            });
        }
    });
    var formatted_response = {}
    $.each(response, function(key, obj) {
        formatted_response[key] = [];
        $.each(obj, function(k, v) {
            formatted_response[key].push(k);
            formatted_response[key].push(v);
        });
    });
    return formatted_response;
}

function submit_hierarchy_link(key){
    var link_path = collection_facets_alias[key];
    localStorage.setItem("hierarchy_dict_current",JSON.stringify(link_path));
    window.location.replace("/nist/cd/index.html");
}


function generate_hierarchy_query(key){
    var link_path = collection_facets_alias[key];
    localStorage.setItem("hierarchy_dict_current",JSON.stringify(link_path));

    var hierarchy = link_path;
    var file_query = "";
    for (var i = 0; i < hierarchy[0].length; i++) {
        file_query += "&fq=(" + encodeURI(escapeRegExp(hierarchy[0][i])).replace(/:/g, '%3A').replace(/%5C&/g, '%5C%26') + ":" + encodeURI(escapeRegExp(String(hierarchy[1][i]))).replace(/%5C&/g, '%5C%26').replace(/%5C%20/g,"%20").replace(/%20/g,"%5C%20").replace(/ /g,"%5C%20") + ")";
    }
    localStorage.setItem("hierarchy_file_query", file_query);
}

function fill_hierarchy_files_data(data, file_query){
    var size = data.response.numFound;
    var cpage = data.response.start;
    load_pagination("hierarchy_files",size,cpage);
    $("#files-table tbody").empty();
    var download_list = JSON.parse(localStorage.getItem("download_list"));
    var cart_list = JSON.parse(localStorage.getItem("cart_list"));

    //Toggle header code
    
    //find which collection's dataset header should be used
    var tableidx = 0;
    $.each(localStorage.getItem("collection_custom_dataset_toggles").split(","), function (i, item) {       
        if (item.includes(localStorage.getItem('last_collection_id'))){
            tableidx = i;
        }
    });
    var tableheaders = localStorage.getItem("collection_custom_dataset_headers").split(",")[tableidx].split("|");
    var tablehead = "<th style='width:5%'>Select</th>"+
                            "<th data-field='name' data-sortable='true'>Name</th>";
    $.each(tableheaders, function (i, item) {
        tablehead += "<th>"+item+"</th>";
    });
    tablehead += "<th>Thumbnail</th>"+
                "<th>Size</th>"+
                "<th>Action</th>";
    $('#files-table thead').html(tablehead);

    //end toggleheader code


    $.each(data.response.docs, function(key, value) {
        var html_safe_id = encodeURI(escapeRegExp(value.id));
        var id_safe_id = html_safe_id.replace(/\//g,"-labsep-");

        var pdfbutton = '';
        if (value.FileType == "PDF"){
            pdfbutton = '<button type="button" rel="pdfbutto" title="PDF" onclick=\'pdf_viewer("'+value.id+'")\' class="btn btn-danger btn-simple btn-link"><i class="fa fa-file-pdf-o"></i></button>';
        }
        else if (value.id.endsWith("fastq.gz") || value.id.endsWith("fq.gz")){
            pdfbutton = "<button id='view_"+id_safe_id+"' type=\"button\" rel=\"tooltip\" title=\"View\" onclick=\"Cookies.set('login_redirect', '/nist/d/index.html?dataset_id="+html_safe_id+"'); window.location.replace('/nist/fqc/index.html?version=5.1.0');\" class=\"btn btn-simple btn-link\" style='color: red'>"+
                "<i class=\"fa fa-image\"></i>"+
            "</button>";
        }

        var mlbutton = '';
        var ml_collections = localStorage.getItem("ml_enabled_collections");
        var ml_collections_split = ml_collections.split(",");
        for (i = 0; i < ml_collections_split.length; i++) {
            if (localStorage.getItem('last_collection_id').includes(ml_collections_split[i])){
                mlbutton = '<button type="button" rel="mlbutton" title="ML" onclick=\'submit_ml_file("'+html_safe_id+'","single")\' class="btn btn-success btn-simple btn-link"><i class="fa fa-gears"></i></button>';
                break;
            }
        }

        var color = "btn-info";
        if(user_data["FavoriteFiles"].includes(value.id)){
            color = "btn-success";
        }

        var thumb = "";
        var filetype = "";
        if (typeof value.FileType === 'string'){
            filetype = value.FileType;
        }else{
            filetype = value.FileType ? value.FileType.join(",") : "";
        }
        var filename = value.FileName ? value.FileName : "";
        var version = value.DatasetVersion ? value.DatasetVersion : "";
        var fileloc = value.FileLocation ? value.FileLocation : "";

        var site = "";
        if (typeof value.Institution === 'string'){
            site = value.Institution;
        }else{
            site = value.Institution ? value.Institution.join(",") : "";
        }

        var parID = value.participantID ? value.participantID.join(",") : "";
        var speID = value.specimen_id ? value.specimen_id.join(",") : "";

        var description = "";
        if (typeof value.Description === 'string'){
            description = value.Description;
        }else{
            description = value.Description? value.Description.join(",") : "";
        }

        if ('ThumbnailRelativePath' in value){
            thumb = "<img width='50' height='50' src='/nist/assets/"+value.ThumbnailRelativePath+"'/>";
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
        

        //Dataset value toggle by collection section

        //get dataset header and insert into html
        var tablevalues = localStorage.getItem("collection_custom_dataset_values").split(",")[tableidx].split("|");

        var tablevals = "<tr>"+
                "<td><center><input type='checkbox' class='form-check-input' data-loc='"+fileloc+"' data-name='"+filename+"' data-version='"+version+"' value='"+html_safe_id+"' "+checked+" data-valuesize='"+filesizenum+"'></center></td>"+
                "<td class='text-left' style='padding-right: 10px'>"+
                    "<a href=\"/nist/f/index.html?file_id="+
                        html_safe_id+"\">"+
                        value.FileName+
                    "</a>"+
                "</td>";

        $.each(tablevalues, function (i, item) {
            var tableitem = value[item] ? value[item] : "";
            tablevals += "<td class='text-left'>"+tableitem+"</td>";
        });

        tablevals  += "<td class='text-left'>"+
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
                    mlbutton+pdfbutton+
                "</td>"+
            "</tr>";

        $('#files-table tbody').append(tablevals);
        //end toggle


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
    var url = localStorage.getItem('environment')+'/data-access-api/files/select?q=*'+file_query+'&wt=json&indent=true&sort=FileName%20asc&start='+cpage*10;
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
            fill_hierarchy_files_data(data, file_query);
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
