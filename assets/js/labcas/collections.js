function fill_collection_level_files(data){
        var size = data.response.numFound;

        var cpage = data.response.start;
        load_pagination("collectionfiles",size,cpage);
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
                var filename = value.FileName ? value.FileName : "";
                var version = value.DatasetVersion ? value.DatasetVersion : "";
                var fileloc = value.FileLocation ? value.FileLocation : "";
                var site = value.Institution ? value.Institution.join(",") : "";
                var description = value.Description? value.Description.join(",") : "";
                if ('ThumbnailRelativePath' in value){
                        thumb = "<img width='50' height='50' src='"+localStorage.getItem('environment')+"/labcas-ui/assets/"+value.ThumbnailRelativePath+"'/>";
                }
                var html_safe_id = encodeURI(escapeRegExp(value.id));
                var filesize = "";
                var filesizenum = 0;
                if (value.FileSize){
                        filesize = humanFileSize(value.FileSize, true);
                        filesizenum = value.FileSize;
                }
                var checked = "";
                if ( (download_list &&  html_safe_id in download_list) || (cart_list && html_safe_id in  cart_list)){
                        checked = "checked";
                }
                $("#files-table tbody").append(
                "<tr>"+
                        "<td><center><input type='checkbox' class='form-check-input' data-loc='"+fileloc+"' data-name='"+filename+"' data-version='"+version+"' value='"+html_safe_id+"' "+checked+" data-valuesize='"+filesizenum+"'></center></td>"+
                        "<td class='text-left'>"+
                                "<a href=\"/labcas-ui/f/index.html?file_id="+
                                        html_safe_id+"\">"+
                                        value.FileName+
                                "</a>"+
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
    if (size > 0){
    $("#children-files").show();
    }
    $('#loading_file').hide(500);
    init_file_checkboxes("files-table");
}

function fill_collection_metadata(data){

    var collapse_dict = {};
    var prev_dataset_id = "";
    var dataset_html = "";
    var collapse_button = "";
    var download_button = "";

    var get_var = get_url_vars();
    var collection_id = get_var["collection_id"];
    $.each(data.response.docs, function(key, value) {

        var collection_ids = [];
        if (value.CollectionId) {
            collection_ids = collection_ids.concat($.isArray(value.CollectionId) ? value.CollectionId : [value.CollectionId]);
        }
        if (value.CollectionName) {
            collection_ids = collection_ids.concat($.isArray(value.CollectionName) ? value.CollectionName : [value.CollectionName]);
        }
        if (!collection_id_matches(collection_id, collection_ids)) {
            return;
        }

        var html_safe_id = encodeURI(escapeRegExp(value.id));
        var color = "#0000FF";
        var image_div = "";
        var pdf_link = "";
        var file_link = "";
        if(user_data["FavoriteDatasets"].includes(value.id)){
            color = "#87CB16 !important";
        }
        if (value.contains_image){
            image_div = "<button id='view_"+id_safe_id+"' type=\"button\" rel=\"tooltip\" title=\"View\" onclick=\"Cookies.set('login_redirect', '/labcas-ui/d/index.html?dataset_id="+html_safe_id+"'); submitImage('files-table','"+html_safe_id+"')\" class=\"btn btn-simple btn-link\" style='position: absolute;left: -50px; top: 50%; transform: translateY(-50%); color: red'>"+
                "<i class=\"fa fa-image\"></i>"+
            "</button>";
        }

        if (value.FileName.endsWith(".pdf")){
            pdf_link = '<button type="button" rel="pdfbutto" title="PDF" onclick=\'pdf_viewer("'+html_safe_id+'")\' class="btn btn-danger btn-simple btn-link" style="position: absolute;left: -50px; top: 50%; transform: translateY(-50%); color: blue"><i class="fa fa-file-pdf-o"></i></button>'
        }

        if (value.id.split("/").length - 3 > 0){
            if (collapse_dict[prev_dataset_id] == 1){
                dataset_html += "<div id='"+prev_dataset_id+"' class='collapse'>";
                collapse_dict[prev_dataset_id] += 1;
            }
            value.FileName = "&nbsp;&nbsp;&nbsp;&nbsp;".repeat(value.id.split("/").length - 3)+"<span>&#8226;</span>"+value.FileName;
            collapse_button = "";
            file_link = "<a href='#' data-href=\"/labcas-ui/f/index.html?file_id="+
                html_safe_id+"\" onclick=\"localStorage.setItem('file_id', '"+value.id+"'); window.location.href = this.getAttribute('data-href');\">"+
                value.FileName+
            "</a>";
            if (value.FileType.includes("folder")){
                file_link = value.FileName;
            }
            download_button = "<button type=\"button\" rel=\"downloadbutton\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\" onclick=\"download_file('"+html_safe_id+"','single')\" style='position: absolute;left: 0px; top: 50%; transform: translateY(-50%); color: red;'>"+
                                        "<i class=\"fa fa-download\"></i>"+
                    "</button>";
        }else{
            if (prev_dataset_id != ""){
                dataset_html += "</div>";
            }
            prev_dataset_id = value.id.replace(/[\/,\.]/g,"_");
            collapse_button = '<button id="'+prev_dataset_id+'_button" style="height:25px; position: absolute; top: 30%; transform: translateY(-50%);" type="button" class="btn btn-link" data-toggle="collapse" data-target="#'+prev_dataset_id+'"><i class="fa fa-plus"></i></button>';
            collapse_dict[prev_dataset_id] = 1;
            file_link = value.FileName;
            download_button = "";
        }

        dataset_html += "<div class='row' style='border-bottom:1px solid #ccc; margin-left: 0px; margin-right: 0px;'>"+
                "<div class='col-md-1'>"+collapse_button+"</div>"+
                "<div class='text-left col-md-10' valign='middle' style='padding: 0px 8px; vertical-align: middle;'>"+
                file_link+
                "</div>"+
                "<div class=\"td-actions col-md-1 text-right\" valign='middle' style='padding: 0px 8px; vertical-align: middle; height: 25px'>"+
                    image_div +
                    download_button +
                    pdf_link +
                "</div>"+
            "</div>";

    });

    if ( dataset_html == "" ){
        $('#collection_level_files').hide();
    }
    if (prev_dataset_id != ""){
        dataset_html += "</div>";
    }
    $.each(collapse_dict, function(key, value) {
        if (value == 1){
            $('#'+key+'_button').hide();
        }
    });
    $('#loading_metadata').hide(500);
    $('#metadata_div').html(dataset_html);
}
function fill_collection_details_data(data){
    var get_var = get_url_vars();
    var collection_id = get_var["collection_id"];
    var matched = false;
    var missing_config = false;
    var rows_added = 0;
    var $tbody = $("#collectiondetails-table tbody");
    $tbody.empty();

    $.each(data.response.docs, function(index, obj) {
        var candidates = [];
        if (obj.id) {
            candidates.push(obj.id);
        }
        if (obj.CollectionId) {
            candidates = candidates.concat($.isArray(obj.CollectionId) ? obj.CollectionId : [obj.CollectionId]);
        }
        if (obj.labcasId) {
            candidates = candidates.concat($.isArray(obj.labcasId) ? obj.labcasId : [obj.labcasId]);
        }
        if (obj.labcasName) {
            candidates = candidates.concat($.isArray(obj.labcasName) ? obj.labcasName : [obj.labcasName]);
        }
        if (obj.name) {
            candidates = candidates.concat($.isArray(obj.name) ? obj.name : [obj.name]);
        }
        if (obj.CollectionName) {
            candidates = candidates.concat($.isArray(obj.CollectionName) ? obj.CollectionName : [obj.CollectionName]);
        }
        if (!collection_id_matches(collection_id, candidates)) {
            return;
        }
        matched = true;

        if(!obj){
            if(!Cookies.get("token") || Cookies.get("token") == "None"){
                localStorage.setItem("logout_alert","On");
                alert("You are currently logged out. Redirecting you to log in.");
                redirect_to_login();
            }
        }
        var collectioname = obj.CollectionName;
        if ($.isArray(collectioname)) {
            collectioname = collectioname[0];
        }
        if (!collectioname && obj.name) {
            collectioname = $.isArray(obj.name) ? obj.name[0] : obj.name;
        }
        if (!collectioname && obj.labcasName) {
            collectioname = $.isArray(obj.labcasName) ? obj.labcasName[0] : obj.labcasName;
        }
        if (!collectioname) {
            collectioname = collection_id;
        }

        if (collectioname.length > 35){
            collectioname = collectioname.slice(0,35);
        }
        $("#collection_name").html(collectioname);
        var institutions = obj.Institution? obj.Institution.join(", ") : "";
        var pis = obj.LeadPI? obj.LeadPI.join(", ") : "";
        var orgs = obj.Organ? obj.Organ.join(", ") : "";
        var protocols = "";

        obj.Institution = institutions;
        obj.LeadPI = pis;
        obj.Organ = orgs;
        obj.ProtocolName = protocols;
        if (obj.Consortium){
            var consortium_label = $.isArray(obj.Consortium) ? obj.Consortium.join(", ") : obj.Consortium;
            obj.Consortium = "<a href='"+localStorage.getItem('environment_url')+"'>"+consortium_label+"</a>";
        }else{
            obj.Consortium = "";
        }

        var extended_headers = [];
        if (localStorage.getItem('collection_header_extend_'+obj.id)){
            extended_headers = localStorage.getItem('collection_header_extend_'+obj.id).split(',');
        }
        var show_headers = get_config_list('collection_header_order', []);
        var header_labels = get_config_list('collection_header_label', []);
        var hide_headers = get_config_list('collection_header_hide', []);
        var collapse_headers = get_config_list('collapsible_headers', []);
        var collection_id_append = get_config_list('collection_id_append', []);

        if (!show_headers.length) {
            missing_config = true;
            console.warn("collection_header_order missing; collection details may be empty.");
        }

        $.each(show_headers, function(ind, head) {
            var value = obj[head];
            if (typeof value === "undefined" || value === "" || value === null) {
                return;
            }
            if ($.isArray(value)){
                value = value.join(",");
            }
            if (typeof value == "string"){
                value = value.replace(/% /g,'_labcasPercent_');
                value = safe_decode_uri_component(value);
                value = value.replace(/\+/g,"&nbsp;").replace(/_labcasPercent_/g,'% ');
            }
            if (collection_id_append.includes(head)){
                value += " ("+obj[head+"Id"]+")";
            }else if (collapse_headers.includes(head)){
                if (value && value.length > 20){
                    value = "<nobr>"+value.substring(0, 20) + "<a data-toggle='collapse' id='#"+head+"Less' href='#"+head+"Collapse' role='button' aria-expanded='false' onclick='document.getElementById(\"#"+head+"Less\").style.display = \"none\";'>... More</a></nobr><div class='collapse' id='"+head+"Collapse'>" + value.substring(20) + " <a data-toggle='collapse' href='#"+head+"Collapse' role='button' aria-expanded='false' onclick='document.getElementById(\"#"+head+"Less\").style.display = \"block\";'>Less</a></div>";
                }
            }
            var label = header_labels[ind] || head.replace( /([a-z])([A-Z])/g, "$1 $2" );
            $tbody.append(
                "<tr>"+
                    "<td class='text-right' valign='top' style='padding: 2px 8px;' width='30%'>"+label+":</td>"+
                    "<td class='text-left' valign='top' style='padding: 2px 8px;'>"+
                        value+
                    "</td>"+
                "</tr>");
            rows_added += 1;
        });
        // (cleanup) removed legacy commented-out block for hidden headers rendering

        $('#loading_collection').hide(500);
        $("#collectiontitle").html(collectioname);
    });

    if (!matched || rows_added === 0) {
        $('#loading_collection').hide(500);
        var message = "Collection metadata not found.";
        if (matched && missing_config) {
            message = "Collection metadata configuration missing.";
        }
        $tbody.append(
            "<tr>"+
                "<td class='text-center' colspan='2'>"+message+"</td>"+
            "</tr>"
        );
        if (matched && missing_config) {
            console.warn("Collection metadata configuration missing for:", collection_id);
        } else {
            console.warn("Collection metadata not found for:", collection_id);
        }
    }
}

function fill_collections_public_data(data){
    $.each(data.response.docs, function(index, obj) {
        if ((obj.OwnerPrincipal && obj.OwnerPrincipal[0].includes("All Users"))){
            var color = "btn-info";
            if(user_data["FavoriteCollections"].includes(obj.id)){
                color = "btn-success";
            }


            var institutions = obj.Institution? obj.Institution.join(", ") : "";
            var pis = obj.LeadPI? obj.LeadPI.join(", ") : "";
            var orgs = obj.Organ? obj.Organ.join(", ") : "";
            var protocols = obj.ProtocolName? obj.ProtocolName.join(", ") : "";

            if (!protocols){
                protocols = "";
            }

              $("#collection-table tbody").append(
                "<tr>"+
                    "<td></td><td>"+
        "<a href=\"/labcas-ui/c/index.html?collection_id="+
                        obj.id+"\">"+
                    obj.CollectionName+"</a></td>"+
                    "<td>"+orgs+"</td>"+
                    "<td>"+obj.Discipline+"</td>"+
                    "<td>"+institutions+"</td>"+
                    "<td>"+pis+"</td>"+
                    "<td class=\"td-actions\">"+
                            "<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteCollections', this)\" class=\"btn "+color+" btn-simple btn-link\">"+
                                "<i class=\"fa fa-star\"></i>"+
                            "</button>"+
                        "</td>"+
                "</tr>");
        }
    });
    $('#loading').hide(500);
    $table.bootstrapTable({
            toolbar: ".toolbar",
            clickToSelect: true,
            showRefresh: true,
            search: false,
            showToggle: true,
            showColumns: true,
            pagination: true,
            pageSize: 50,
            clickToSelect: false,
            pageList: [8, 10, 25, 50, 100],

            formatShowingRows: function(pageFrom, pageTo, totalRows) {
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

        var institutions = obj.InstitutionName? obj.InstitutionName.join(", ") : "";
        var pis = obj.LeadPoC? obj.LeadPoC.join(", ") : "";
        var orgs = obj.Organ? obj.Organ.join(", ") : "";
        var protocols = obj.ProtocolName? obj.ProtocolName.join(", ") : "";
        var disciplines = obj.Discipline? obj.Discipline.join(", ") : "";
        var description = obj.CollectionDescription? obj.CollectionDescription : "";
        var category = obj.StudyType? obj.StudyType : "";
        var capabilities = obj.CoreCapabilities? obj.CoreCapabilities.join(", "): "";
        var focus = obj.PrimaryFocusAreas? obj.PrimaryFocusAreas: "";

        if (!protocols){
            protocols = "";
        }   

          $("#collection-table tbody").append(
            "<tr>"+
                "<td></td><td>"+
                "<a href=\"/labcas-ui/c/index.html?collection_id="+
                    obj.id+"\">"+
                obj.CollectionName+"</a></td>"+
                "<td>"+description+"</td>"+
                "<td>"+category+"</td>"+
                "<td>"+capabilities+"</td>"+
                "<td>"+focus+"</td>"+
                "<td>"+pis+"</td>"+
                "<td class=\"td-actions\">"+
                        "<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+obj.id+"', 'FavoriteCollections', this)\" class=\"btn "+color+" btn-simple btn-link\">"+
                            "<i class=\"fa fa-star\"></i>"+
                        "</button>"+
                    "</td>"+
            "</tr>");
    });
    $('#loading').hide(500);
    $table.bootstrapTable({
            toolbar: ".toolbar",
            clickToSelect: true,
            showRefresh: true,
            search: false,
            showToggle: true,
            showColumns: true,
            pagination: true,
            pageSize: 50,
            clickToSelect: false,
            pageList: [8, 10, 25, 50, 100],

            formatShowingRows: function(pageFrom, pageTo, totalRows) {
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

function fill_datasets_data(data){

    data.response.docs.sort(dataset_compare_sort);
    var collapse_dict = {};
    var image_check_datasets = {};
    var prev_dataset_id = "";
    var dataset_html = "";
    var dataset_attr ="";
    var collapse_button = "";

        var get_var = get_url_vars();
        var metadata_exists = false;
        //var collection_file_exists = false;


    $.each(data.response.docs, function(key, value) {
        if (value.CollectionId != get_var["collection_id"]){
            return;
        }
        
        var html_safe_id = encodeURI(escapeRegExp(value.id));
        var id_safe_id = html_safe_id.replace(/\//g,"-labsep-");

        var color = "#0000FF";

        var image_div = "";
        /*if (value.contains_image){
            image_div = "<button id='view_"+id_safe_id+"' type=\"button\" rel=\"tooltip\" title=\"View\" onclick=\"Cookies.set('login_redirect', '/labcas-ui/d/index.html?dataset_id="+html_safe_id+"'); submitImage('files-table','"+html_safe_id+"')\" class=\"btn btn-simple btn-link\" style='position: absolute;left: -50px; top: 50%; transform: translateY(-50%); color: red'>"+
                "<i class=\"fa fa-image\"></i>"+
            "</button>";
        }*/

        if(user_data["FavoriteDatasets"].includes(value.id)){
            color = "#87CB16 !important";
        }
        if (value.id.split("/").length - 2 > 0){
            if (collapse_dict[prev_dataset_id] == 1){
                dataset_html += "<div id='"+prev_dataset_id+"' class='collapse'>";
                collapse_dict[prev_dataset_id] += 1;
            }
            value.DatasetName = "&nbsp;&nbsp;&nbsp;&nbsp;".repeat(value.id.split("/").length - 2)+"<span>&#8226;</span>"+value.DatasetName;
            collapse_button = "";
        }else{
            if (prev_dataset_id != ""){
                dataset_html += "</div>";
            }
            prev_dataset_id = value.id.replace(/[\/,\.]/g,"_");
            collapse_button = '<button id="'+prev_dataset_id+'_button" style="height:25px; position: absolute; top: 30%; transform: translateY(-50%);" type="button" class="btn btn-link" data-toggle="collapse" data-target="#'+prev_dataset_id+'"><i class="fa fa-plus"></i></button>';
            collapse_dict[prev_dataset_id] = 1;
        }

        dataset_html += "<div class='row' style='border-bottom:1px solid #ccc; margin-left: 0px; margin-right: 0px;'>"+
                "<div class='col-md-1'><!--<div class=\"form-check\">"+
                    "<label class=\"form-check-label\">"+
                        "<input class=\"form-check-input\" type=\"checkbox\" value=''>"+
                        "<span class=\"form-check-sign\"></span>"+
                    "</label>"+
                "</div>-->"+collapse_button+"</div>"+
                "<div class='text-left col-md-10' valign='middle' style='padding: 0px 8px; vertical-align: middle;'>"+
        "<a href=\"/labcas-ui/d/index.html?dataset_id="+
            value.id+"\">"+
            value.DatasetName+
        "</a>"+
                "</div>"+
                "<div class=\"td-actions col-md-1 text-right\" valign='middle' style='padding: 0px 8px; vertical-align: middle; height: 25px'>"+
                    
                    image_div +
                    "<button type=\"button\" rel=\"downloadbutton\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\" onclick=\"download_dataset('"+html_safe_id+"')\" style='position: absolute;left: 0px; top: 50%; transform: translateY(-50%); color: green;'>"+
                                        "<i class=\"fa fa-download\"></i>"+
                    "</button>"+
                "</div>"+
            "</div>";
    });
    
    if ( dataset_html == "" ){
        $('#datasets_in_collection').hide();
    }
    if (prev_dataset_id != ""){
        dataset_html += "</div>";
    }

    $("#datasets-table").append(dataset_html);
    $.each(collapse_dict, function(key, value) {
        if (value == 1){
            $('#'+key+'_button').hide();
        }
    });
        $("#collection_datasets_len").html(data.response.numFound);
        $("#collection_favorites_len").html(user_data['FavoriteFiles'].length+user_data['FavoriteDatasets'].length+user_data['FavoriteCollections'].length);
    $('#loading_dataset').hide(500);
    $('#loading_metadata').hide(500);
    // (cleanup) removed debug and commented-out hierarchy reset code
}
function setup_labcas_data(datatype, query, dataset_query){
    $.ajax({
        url: localStorage.getItem('environment')+"/data-access-api/collections/select?q="+query+"&wt=json&indent=true&rows=5000&sort=id%20asc",
        beforeSend: function(xhr) {
            if(Cookies.get('token') && Cookies.get('token') != "None"){
                xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
            }
        },
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if(data.response.numFound == 0){
                alert("No data found, you might be logged out. Redirecting you to log back in.");
                redirect_to_login();
            }
            if (datatype == "collections"){
                fill_collections_data(data);
            }else if (datatype == "collections_public"){
                fill_collections_public_data(data);
            }else if (datatype == "collectiondatasets"){
                fill_collection_details_data(data);
                $.ajax({
                    url: localStorage.getItem('environment')+"/data-access-api/files/select?q="+dataset_query+"&wt=json&sort=FileName%20asc&indent=true",
                    beforeSend: function(xhr) {
                        if(Cookies.get('token') && Cookies.get('token') != "None"){
                            xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
                        }
                    },
                    type: 'GET',
                    dataType: 'json',
                    processData: false,
                    success: function (data) {
                        $("#collection_files_len").html(data.response.numFound);
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
        },
        error: function(e){
            console.error(e);

            if (datatype == "collections" && e.responseText){
                fill_collections_data(JSON.parse(e.responseText));
            }else{

        if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                     localStorage.setItem("logout_alert","On");
             alert("You are currently logged out. Redirecting you to log in.");
        }
        redirect_to_login();
         }
     }
    });
    if (datatype == "collectiondatasets"){
	var url = localStorage.getItem('environment')+"/data-access-api/datasets/select?q="+dataset_query+"&wt=json&indent=true&rows=5000";
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
            	fill_datasets_data(data);
            },
            error: function(e){
            console.error(e);
            if (datatype == "collectiondatasets" && e.responseText){
                fill_datasets_data(JSON.parse(e.responseText));
            }else{
                if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                       localStorage.setItem("logout_alert","On");
                     alert("You are currently logged out. Redirecting you to log in.");
                }
                redirect_to_login();
            }
        }
    });
        var get_var = get_url_vars();
        var collection_id = get_var["collection_id"];
        var default_doc_collections = ["NIST_Flow_Cytometry_Standards_Consortium", "Genome_Editing_Consortium", "Microbial", "flow_cytometry_stage"];
        if (collection_has_feature(collection_id, "collection_file_documentation_collections", default_doc_collections)){
            query_labcas_api("/labcas-ui/assets/documentation/collection_file_documentation.json?version=5.1.1", fill_collection_metadata);
        }else{
            $('#collection_level_files').hide();
        }

    }
}
