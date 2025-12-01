function fill_files_data(data){
    var size = data.response.numFound;
    var cpage = data.response.start;
    load_pagination("files",size,cpage);
    $("#files-table tbody").empty();
    var download_list = JSON.parse(localStorage.getItem("download_list"));
    var cart_list = JSON.parse(localStorage.getItem("cart_list"));
    var get_var = get_url_vars();

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
    

    var tableheader_flag = false;

    $.each(data.response.docs, function(key, value) {
        if (!value.id || value.DatasetId != get_var["dataset_id"]){
            return;
        }
        size += 1;

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
        var fileloc = value.RealFileLocation ? value.RealFileLocation : "";
        var version = value.DatasetVersion ? value.DatasetVersion : "";

        var description = "";
        if (typeof value.Description === 'string'){
            description = value.Description;
        }else{
            description = value.Description? value.Description.join(",") : "";
        }

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

        //Dataset value toggle by collection section
        var tablevals = "";


        if (get_var["dataset_id"].includes("GenomeEdit")){
            $("#files-title").html("Data in this Dataset");
            tableheader = "";
            tablevals = "<tr>";
            tableheader += "<th>FileName</th>";
            var filename = value["FileName"] ? value["FileName"] : "";
            tablevals += "<td class='text-left'>"+filename+"</td>";
            $.each(Object.keys(value), function (i, item) {
                if (item.includes("Collection") || item.includes("Dataset") || item.includes("id") || item.includes("labcas") || item.includes("version") || item.includes("md5") || item.includes("DateMod") || item.includes("name") || item.includes("PublishId") || item.includes("FileDownloadId") || item.includes("FileVersion") || item.includes("FileLocation") || item.includes("FileId") || item.includes("FileSize") || item.includes("FileType") || item.includes("FileName") || item.includes("LeadPoCID") || item.includes("LeadPoC") || item.includes("LeadPoCEmail") || item.includes("InstitutionID") || item.includes("DataCustodian") || item.includes("StudyName") || item.includes("StudyType") || item.includes("ReferenceURL") || item.includes("Consortium") || item.includes("OwnerPrincipal") || item.includes("DOI") || item.includes("Discipline") || item.includes("Organism")){
                    return;
                }
                var tableitem = value[item] ? value[item] : "";

                if (item == "ProteinSequence" || item == "TargetSequence" || item == "TargetSequencePlusPAM"){
                    tablevals += "<td class='text-left'>"+"<textarea style='width: 100%; height: 75px; overflow: auto;' readonly>"+
                        ">"+filename+"|"+item+"\n"+tableitem+
                        "</textarea>";
                }else{
                    tablevals += "<td class='text-left'>"+tableitem+"</td>";
                }
                tableheader += "<th>"+item+"</th>";
                
            });
            tableheader += "<th>Action</th>";
            if (!tableheader_flag){
                $('#file-thead').html(tableheader);
                tableheader_flag = true;
            }
        }else{
            //get dataset header and insert into html
            var tablevalues = localStorage.getItem("collection_custom_dataset_values").split(",")[tableidx].split("|");

            tablevals = "<tr>"+
                    "<td><center><input type='checkbox' class='form-check-input' data-loc='"+fileloc+"' data-name='"+filename+"' data-version='"+version+"' value='"+html_safe_id+"' "+checked+" data-valuesize='"+filesizenum+"'></center></td>"+
                    "<td class='text-left' style='padding-right: 10px'>"+
                        "<a href='#' data-href=\"/labcas-ui/f/index.html?file_id="+
                                html_safe_id+"\" onclick=\"localStorage.setItem('file_id', '"+html_safe_id+"'); window.location.href = this.getAttribute('data-href');\">"+
                                value.FileName+
                            "</a>"+
                    "</td>";

            $.each(tablevalues, function (i, item) {
                var tableitem = value[item] ? value[item] : "";
                //if InputFileLabCASID, generate a link instead with the filename as the link display
                if (item == "InputFileLabCASID" && tableitem && String(tableitem) != ""){
                    tableitem = "<a href='#' data-href='/labcas-ui/f/index.html?file_id="+tableitem+"' onclick=\"localStorage.setItem('file_id', '"+tableitem+"'); window.location.href = this.getAttribute('data-href');\" >"+String(tableitem).split('/').pop()+"</a>";
                }
                //temporarily here until we decide how to automatically populate SoftwareCode for Flow Cyt Derived files
                if (item == "SoftwareCode" && tableitem && String(tableitem) != ""){
                    tableitem = "<a href='https://github.com/whitews/FlowIO'>"+String(tableitem)+"</a>";
                }

                tablevals += "<td class='text-left'>"+tableitem+"</td>";
            });
            tablevals  += "<td class='text-left'>"+
                        thumb+
                "</td>"+
                "<td class='text-left'>"+
                        filesize+
                "</td>";
        }

        var pdfbutton = '';
        var reportbutton = '<div id="report_'+html_safe_id.replace("%20","_").replace(/\//g,"_")+'"></div>';

        if (html_safe_id.endsWith(".html")){
            var div = document.getElementById('report_'+html_safe_id.replace("%20","_").replace(/\//g,"_").replace(/.html/,".fcs"));
            if (div){
                div.innerHTML = "<button type=\"button\" rel=\"downloadbutton\" title=\"Download\" class=\"btn btn-success btn-simple btn-link\" onclick=\"localStorage.setItem('peaco_report', 'https://labcas.jpl.nasa.gov/nist/data-access-api/download?id="+html_safe_id+"'); window.location.href = '/labcas-ui/a/peaco.html'\">"+
                        "<i class=\"fa fa-file-image-o\"></i>"+
                    "</button>";
            }
        }
        if (value.FileType == "PDF"){
            pdfbutton = '<button type="button" rel="pdfbutto" title="PDF" onclick=\'pdf_viewer("'+value.id+'")\' class="btn btn-danger btn-simple btn-link"><i class="fa fa-file-pdf-o"></i></button>';
        }
        var mlbutton = '';
        var ml_collections = localStorage.getItem("ml_enabled_collections");
        var ml_collections_split = ml_collections.split(",");
        for (i = 0; i < ml_collections_split.length; i++) {
            if (dataset_id.includes(ml_collections_split[i])){
                mlbutton = '<button type="button" rel="mlbutton" title="ML" onclick=\'submit_ml_file("'+html_safe_id+'","single")\' class="btn btn-success btn-simple btn-link"><i class="fa fa-gears"></i></button>';
                break;
            }
        }
        tablevals  += "<td class=\"td-actions text-right\">"+
                    "<button type=\"button\" rel=\"favoritebutton\" title=\"Favorite\" onclick=\"save_favorite('"+value.id+"', 'FavoriteFiles', this)\" class=\"btn "+color+" btn-simple btn-link\">"+
                        "<i class=\"fa fa-star\"></i>"+
                    "</button>"+
                    "<button type=\"button\" rel=\"downloadbutton\" title=\"Download\" class=\"btn btn-danger btn-simple btn-link\" onclick=\"download_file('"+html_safe_id+"','single')\">"+
                        "<i class=\"fa fa-download\"></i>"+
                    "</button>"+
                    mlbutton+pdfbutton+reportbutton+
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

function fill_datasets_children(data){
    data.response.docs.sort(dataset_compare_sort);
    var dataset_html = "";
    var flag = "";
    var dataset_count = 0;
    var get_var = get_url_vars();
    $.each(data.response.docs, function(key, value) {
        if (!value.id || !value.id.includes(get_var["dataset_id"]) || value.id == get_var["dataset_id"]){
            return;
        }
        var color = "#0000FF";
        if(user_data["FavoriteDatasets"].includes(value.id)){
                color = "#87CB16 !important";
        }
        value.DatasetName = "&nbsp;&nbsp;&nbsp;&nbsp;".repeat(value.id.split("/").length - 2)+"<span>&#8226;</span>"+value.DatasetName;

        var html_safe_id = encodeURI(escapeRegExp(value.id));
        var id_safe_id = html_safe_id.replace(/\//g,"-labsep-");
        var image_div = "";
        //commenting out image viewer at dataset level for now since omero viewer has been decommed
        if (value.contains_image){
            image_div = "<button id='view_"+id_safe_id+"' type=\"button\" rel=\"tooltip\" title=\"View\" onclick=\"Cookies.set('login_redirect', '/labcas-ui/d/index.html?dataset_id="+html_safe_id+"'); submitImage('files-table','"+html_safe_id+"')\" class=\"btn btn-simple btn-link\" style='position: absolute;left: -50px; top: 50%; transform: translateY(-50%); color: red'>"+
                "<i class=\"fa fa-image\"></i>"+
            "</button>";
        }
        else if (value.id.endsWith("fastq.gz")){
            image_div = "<button id='view_"+id_safe_id+"' type=\"button\" rel=\"tooltip\" title=\"View\" onclick=\"Cookies.set('login_redirect', '/labcas-ui/d/index.html?dataset_id="+html_safe_id+"'); window.location.replace('/labcas-ui/fqc/index.html?version=5.1.0');\" class=\"btn btn-simple btn-link\" style='position: absolute;left: -50px; top: 50%; transform: translateY(-50%); color: red'>"+
                "<i class=\"fa fa-image\"></i>"+
            "</button>";
        }

        dataset_html += "<div class='row' style='border-bottom:1px solid #ccc; margin-left: 0px; margin-right: 0px;'>"+
            "<div class='col-md-1'></div>"+
            "<div class='text-left col-md-10' valign='middle' style='padding: 0px 8px; vertical-align: middle;'>"+
            "<a href=\"/labcas-ui/d/index.html?dataset_id="+
                value.id+"\">"+
                value.DatasetName+
            "</a>"+
            "</div>"+
            "<div class=\"td-actions col-md-1 text-right\" valign='middle' style='padding: 0px 8px; vertical-align: middle; height: 25px'>"+
                image_div+
                "<button type=\"button\" rel=\"tooltip\" title=\"Favorite\" onclick=\"save_favorite('"+value.id+"', 'FavoriteDatasets', this)\" class=\"btn btn-simple btn-link\" style='position: absolute;left: 5px; top: 50%; transform: translateY(-50%); color: "+color+"'>"+
                "<i class=\"fa fa-star\"></i>"+
                "</button>"+
            "</div>"+
        "</div>";
        dataset_count += 1;
    });
    if ( dataset_html != ""){
        $("#children-datasets").show();
        $( "#dataset_stat_template" ).load("/labcas-ui/templates.html #dataset_stat_template");
        setTimeout(function() {
            $("#collection_datasets_len").html(dataset_count);
        }, 2000);
    }else{
        $( "#dataset_stat_template" ).load("/labcas-ui/templates.html?version=5.1.0 #dataset_name_template");
    }
        $("#children-datasets-section").append(dataset_html);
}

function populate_dataset_children(query){
    query = query.replace(/id:/,'DatasetParentId')+"%5C%2A";
    $.ajax({
        url: localStorage.getItem('environment')+"/data-access-api/datasets/select?q="+query+"&wt=json&indent=true&rows=5000&sort=id%20asc",
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
            fill_datasets_children(data);

        },
        error: function(e){
            if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
               localStorage.setItem("logout_alert","On");
                alert("You are currently logged out. Redirecting you to log in.");
            }
            redirect_to_login();

         }
    });
    $('#loading_dataset').hide(500);
}

function fill_dataset_details_data(data){
    var get_var = get_url_vars();
    $.each(data.response.docs, function(index, obj) {
    if (obj.id == get_var["dataset_id"]){
        var datasetname = obj.DatasetName;
        $("#datasettitle").html(datasetname);
        if (datasetname.length > 25){
            datasetname = datasetname.slice(0,25);
        }
        setTimeout(function() {
            $("#collection_datasets_len").html(datasetname);
        }, 2000);
        
        var collectionid = obj.CollectionId;
        var collectionname = obj.CollectionName;

        if ( collectionid != "cell_line_provenance"){
            $("#collection_level_gantt").hide();
        }else{
            $("#collection_level_gantt").show();
        }

        $("#collection_name").html("<a href=\"/labcas-ui/c/index.html?collection_id="+collectionid+"\">"+collectionid+"</a>");
                
        var extended_headers = [];
        if (localStorage.getItem('dataset_header_extend_'+collectionid)){
                extended_headers = localStorage.getItem('dataset_header_extend_'+collectionid).split(',');
        }   

        var show_headers = localStorage.getItem('dataset_header_order').split(',');
        var collection_id_append = localStorage.getItem('dataset_id_append').split(',');
                
        $.each(show_headers, function(ind, head) {
            var value = obj[head];
            if (typeof  value === "undefined") {
                value = "";
            } 
            if (!value){
                return;
            }   
                    
            if ($.isArray(value)){
                if (get_var["dataset_id"].includes("GenomeEdit") && value.length > 1){
                    return;
                }
                value = value.join(",");
            }       
            if (typeof value == "string"){
                value = value.replace(/% /g,'_labcasPercent_');
                value = decodeURIComponent(value);
                value = value.replace(/\+/g,"&nbsp;").replace(/_labcasPercent_/g,'% ');
            }
            if (collection_id_append.includes(head)){
                value += " ("+obj[head+"Id"]+")";
            }
            $("#datasetdetails-table tbody").append(
                "<tr>"+     
                    "<td class='text-right'  valign='top' style='padding: 2px 8px;' width='20%'>"+head.replace( /([a-z])([A-Z])/g, "$1 $2" )+":</td>"+
                    "<td class='text-left'  valign='top' style='padding: 2px 8px;'>"+
                        value+
                    "</td>"+
                "</tr>");
                
        });     
                
        $.each(obj, function(key, value) {
            if (show_headers.includes(key) ){
                return;
            }   
            if (typeof  value === "undefined") {
                            value = "";
                    }
            if ($.isArray(value)){
                if (get_var["dataset_id"].includes("GenomeEdit") && value.length > 1){
                    return;
                }
                value = value.join(",");
            }       
            if (typeof value == "string"){
                value = value.replace(/% /g,'_labcasPercent_');
                try { 
                    value = decodeURIComponent(value);
                } catch(e) {
                  console.error(e);
                }
                value = value.replace(/\+/g,"&nbsp;").replace(/_labcasPercent_/g,'% ');
            }
            if (obj[key+"_link"]){
                value = "<a href='"+obj[key+"_link"]+"'>"+value+"</a>";
            }

            $("#datasetdetails-table tbody").append(
                "<tr>"+
                    "<td class='text-right'  valign='top' style='padding: 2px 8px;' width='20%'>"+key.replace( /([a-z:])([A-Z])/g, "$1 $2" )+":</td>"+
                    "<td class='text-left' valign='top' style='padding: 2px 8px;'>"+
                        value+
                    "</td>"+
                "</tr>");
        });

        }
   });
   $('#loading_dataset').hide(500);
}

function setup_labcas_dataset_data(datatype, query, file_query, cpage){
    if (cpage == 0){ //if this isn't a pagination request and a default load
    $.ajax({
        url: localStorage.getItem('environment')+"/data-access-api/datasets/select?q="+query+"&wt=json&indent=true",
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
            try{
                fill_dataset_details_data(data);
                populate_dataset_children(query);
            } catch (ex) {
                if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")){
                   localStorage.setItem("logout_alert","On");
                     alert("You are currently logged out. Redirecting you to log in.");
                }
                redirect_to_login();
            }

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
    //Set dataset size
    
    $.ajax({
        url: localStorage.getItem('environment')+"/data-access-api/files/select?q="+file_query+"&wt=json&indent=true&sort=FileName%20asc&start="+cpage*10,
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
            fill_files_data(data);
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
