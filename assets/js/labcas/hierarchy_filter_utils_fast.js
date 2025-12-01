var collection_facets = {};
var collection_facets_alias = {};
var hierarchy_unique_check = {};
var hierarchy_path_traversed = {};
var obj_type = "collection";
var hierarchy_started = false;
var hierarchy_initial_loading = true;
let childlock = false;
let parentLock = false;

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
        //hierarchy_initial_loading = true;
        elt.tagsinput('removeAll');

        $.each(hierarchy_tags.split(","), function( key, val ) {
            
            /*
            if (key == hierarchy_tags.split(",").length -1 ){
                hierarchy_initial_loading = false;
                
            }*/
            elt.tagsinput('add', { "value": val});
            valid_tags_check = true;
            last_val = val;
        });
        generate_hierarchy_based_on_tags();
        
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

        generate_hierarchy_based_on_tags();
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
    var filters = localStorage.getItem("hierarchy_file_query") && !get_var["collection_id"] && localStorage.getItem("hierarchy_file_query_collection") == localStorage.getItem("last_collection_id") ? localStorage.getItem("hierarchy_file_query") : "";

    url = localStorage.getItem('environment')+"/data-access-api/files/select?q=CollectionId:"+collection_id+"&facet=true&facet.limit=-1&facet.mincount=1"+facets+"&wt=json&rows=0";
    if (obj_type == "dataset"){
        url = localStorage.getItem('environment')+"/data-access-api/files/select?q=CollectionId:"+collection_id+filters+"*&facet=true&facet.limit=-1&facet.mincount=1"+facets+"&wt=json&rows=0";
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
function get_hierarchy_selected_upto(idx){
    var hierarchy = $('#view_tags');
    if (idx < hierarchy.val().split(",").length){
        return hierarchy.val().split(",").slice(0,idx);
    }else{
        return hierarchy.val().split(",");
    }
}

function initiate_virtual_state(){
    var hierarchy_state = load_hierarchy_state();

    $.each(hierarchy_state, function(k, v) {
        
        toggle_child_elements(k, v, false);
    });
}

function toggle_child_elements(idx, show, post_initial_flag){
    //load virtual state
    if (post_initial_flag){
        var virtual_state = load_hierarchy_state();
    }

    if (show == "true"){
	    if($('#virtual_expand_all').is(":checked")){
            $('div[id^="hierarchy_'+idx+'_"]').show();
            
            $('span[id^="toggle_'+idx).each(function() {
                $(this).find('i').toggleClass("fa-minus",true)
                $(this).find('i').toggleClass("fa-plus",false)
                $(this).find('a').attr("onclick","event.preventDefault(); toggle_child_elements(\""+$(this).attr('id').replace(/toggle_/g,"")+"\",\"false\",true)");

                //save virtual state
                if (post_initial_flag){
                    virtual_state[$(this).attr('id').replace(/toggle_/g,"")] = show;
                }
            });
        }else{
            $('#hierarchy_'+idx).children().show();

            $('span[id^="toggle_'+idx+'_"]').each(function() {
                $(this).find('i').toggleClass("fa-minus",false)
                $(this).find('i').toggleClass("fa-plus",true)
                $(this).find('a').attr("onclick","event.preventDefault(); toggle_child_elements(\""+$(this).attr('id').replace(/toggle_/g,"")+"\",\"true\",true)");
            });
            $('#toggle_'+idx).html("<a onclick='event.preventDefault(); toggle_child_elements(\""+idx+"\",\"false\",true)' href='#'><i class='fa fa-minus'></i></a>");
        }
    }else{
        $('div[id^="hierarchy_'+idx+'_"]').hide();
        $('#toggle_'+idx).html("<a onclick='event.preventDefault(); toggle_child_elements(\""+idx+"\",\"true\",true)' href='#'><i class='fa fa-plus'></i></a>");
    }

    //save virtual state
    if (post_initial_flag){
        virtual_state[idx] = show;
        save_hierarchy_state(virtual_state);
    }
}

function save_hierarchy_state(virtual_state){
    localStorage.setItem("hierarchy_state", JSON.stringify(virtual_state));
}
function load_hierarchy_state(){
    var hierarchy_state = localStorage.getItem("hierarchy_state") ?  JSON.parse(localStorage.getItem("hierarchy_state")) : {};
    return hierarchy_state;
}

function fill_hierarchy_data_fast(data, initial_load_flag) {

    function generate_combinations(doc) {
        let keys = Object.keys(doc);
        let values = keys.map(key => doc[key]);
        let combinations = values.reduce((acc, val, index) => {
            let temp = [];
            if (Array.isArray(val)) {
                val.forEach(v => {
                    acc.forEach(a => {
                        let newEntry = Object.assign({}, a);
                        newEntry[keys[index]] = v;
                        temp.push(newEntry);
                    });
                });
            } else {
                acc.forEach(a => {
                    let newEntry = Object.assign({}, a);
                    newEntry[keys[index]] = val;
                    temp.push(newEntry);
                });
            }
            return temp;
        }, [{}]);
        return combinations;
    }


    return new Promise((resolve, reject) => {
        if (childlock) {
            reject('Content generation in progress');
        } else {
            childlock = true;
            
            var collection_file_facets = data.response.docs;

            let expanded_docs = [];
            collection_file_facets.forEach(doc => {
                if (!Object.keys(doc).length) { // check if empty dictionary
                    return true;
                }
                let combinations = generate_combinations(doc);
                expanded_docs = expanded_docs.concat(combinations);
            });

            

            $.each(expanded_docs, function(k, v) {
                var tree_path = "";
                for (var idx = 0; idx < 10; idx++) {
                    collection_file_f = get_hierarchy_selected(idx);
                    if (collection_file_f == -1 || !v.hasOwnProperty(collection_file_f) || v[collection_file_f] === undefined) {
                        break;
                    }
                    tree_path += v[collection_file_f] + "-labsep-";
                }
                if (tree_path === "" || tree_path.includes("undefined")) {
                    return true;
                }
                if (tree_path in hierarchy_unique_check) {
                    hierarchy_unique_check[tree_path] += 1;
                    if (hierarchy_unique_check[tree_path] > 1 && idx > 1) {
                        return true;
                    }
                } else {
                    hierarchy_unique_check[tree_path] = 1;
                }
            });

            if (!Object.keys(hierarchy_unique_check).length) {
                return;
            }

            $.each(Object.keys(hierarchy_unique_check).sort(), function(k, v) {
                if ($.trim(v) != '') {
                    var pathval = [];
                    $.each(v.split("-labsep-"), function(idx, branch) {
                        if (branch == "" || branch === "undefined") {
                            return true;
                        }
                        if (branch == "undefined") {
                            branch = "None";
                            if (!localStorage.getItem("none_hierarchy_collections").includes(localStorage.getItem("current_collection_id"))) {
                                return true;
                            }
                        }
                        var pathval_child = pathval.slice();
                        var path_child = get_hierarchy_selected_upto(idx + 1);
                        var pathval_parent = pathval.slice();
                        pathval_child.push(branch);

                        var mapped_path = replaceRegExp(pathval.join("_"), "_");
                        var mapped_path_child = replaceRegExp(pathval_child.join("_"), "_");
                        var mapped_path_parent = replaceRegExp(pathval_parent.join("_"), "_");
                        pathval.push(branch); // move pathval down tree branch

                        if (hierarchy_path_traversed[mapped_path_child]) {
                            return true;
                        }
                        hierarchy_path_traversed[mapped_path_child] = true;
                        collection_facets_alias[mapped_path_child] = [path_child, pathval_child]; // [["WorkingGroup","InstrumentCode"],["WG1-001","Aria"]]
                        var visibility = "";
                        var checkbox = "<a onclick='event.preventDefault(); toggle_child_elements(\"" + mapped_path_child + "\",\"true\",true)' href='#'><i class='fa fa-plus'></i></a>";
                        if (idx > 0) {
                            visibility = "style='display:none'";
                            checkbox = "<a onclick='event.preventDefault(); toggle_child_elements(\"" + mapped_path_child + "\",\"true\",true)' href='#'><i class='fa fa-plus'></i></a>";
                            $('#toggle_' + mapped_path_parent + '_').css("visibility", "visible");
                            $('#toggle_' + mapped_path_parent).css("visibility", "visible");
                        }

                        var image_div = "";
                        var multiqc_hierarchy_mapping = JSON.parse(localStorage.getItem("multiqc_custom_hierarchy_mapping"));

                        if (Object.keys(multiqc_hierarchy_mapping).includes(branch)) {
                            image_div = "<button id='view_" + branch + "' type=\"button\" rel=\"tooltip\" title=\"View\" onclick=\"window.open('/nist/fqc/index_multiqc.html?multiqc_id=" + multiqc_hierarchy_mapping[branch] + "','_blank')\" class=\"btn btn-simple btn-link\" style='transform: translateY(-50%); color: blue'>"+
                                "<i class=\"fa fa-image\"></i>"+
                                "</button>";
                        }

                        var download_metadata_button = "<button type='button' rel='downloadmetadatabutton' title='Download Metadata' class='btn btn-success btn-simple btn-link' style='left: 0px; top: 50%; transform: translateY(-50%); color: blue;' onclick='generate_hierarchy_query(\"" + mapped_path_child + "\"); download_metadatas(\"hierarchy_query\");'><i class='nc-icon nc-bullet-list-67 icon-bold'></i></button>";

                        var branch_display_label = branch;
                        var hierarchy_selected_upto = get_hierarchy_selected_upto(idx + 1);
                        $('#hierarchy_' + mapped_path).append("<div id='hierarchy_" + mapped_path_child + "' " + visibility + " class=''><hr style='margin-bottom:0;margin-top:0'>" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".repeat(idx) + "<nobr><span id='toggle_" + mapped_path_child + "' style='visibility: hidden'>" + checkbox + "</span><a data-mapped-path='" + mapped_path_child + "' href='#'>" + branch_display_label + "</a>" + "<div class='text-right' valign='middle' style='padding: 0px 8px; vertical-align: middle; height: 10px'>" + image_div + "<button type='button' rel='downloadbutton' title='Download' class='btn btn-danger btn-simple btn-link' onclick='generate_hierarchy_query(\"" + mapped_path_child + "\"); download_dataset(\"hierarchy_query\");' style='left: 0px; top: 50%; transform: translateY(-50%); color: red;'><i class='fa fa-download'></i></button>" + download_metadata_button + "</div></nobr></div>");
                    });
                }
            });

            hierarchy_unique_check = {};
            hierarchy_path_traversed = {};
            hierarchy_started = false;
            if (hierarchy_initial_loading) {
                hierarchy_initial_loading = false;
                initiate_virtual_state();
                if (localStorage.getItem('collection_scrollPosition') !== null) {
                    window.scrollTo(0, localStorage.getItem('collection_scrollPosition'));
                }

                //Initiate links
                document.getElementById('hierarchy_').addEventListener('click', handle_hierarchy_link);
                document.getElementById('hierarchy_').addEventListener('contextmenu', handle_hierarchy_link);
            }
            $('#view_tag_select').removeAttr("disabled");

            //Resolving childlock
            childlock = false;
            resolve();
        }
    });
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}
function handle_hierarchy_link(event) {
    // Check if the clicked element is a link
    if (event.target.tagName === 'A') {
        event.preventDefault(); // Prevent the default link behavior

        var mappedPath = event.target.getAttribute('data-mapped-path');

        var link_path = collection_facets_alias[mappedPath];

        localStorage.setItem("hierarchy_dict_current",JSON.stringify(link_path));
        generate_hierarchy_query(mappedPath);

        if (event.type === 'contextmenu' || event.which === 2) {
            window.open("/nist/cd/index.html","_blank");
        }  else{
            window.open("/nist/cd/index.html","_self");
        }
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

/*function submit_hierarchy_link(key){
    var link_path = collection_facets_alias[key];
    localStorage.setItem("hierarchy_dict_current",JSON.stringify(link_path));
    window.open("/nist/cd/index.html","_self");
}*/


function generate_hierarchy_query(key){
    var link_path = [[]];
    if (key != ""){
        link_path = collection_facets_alias[key];
        localStorage.setItem("hierarchy_dict_current",JSON.stringify(link_path));
    }

    var hierarchy = link_path;
    //Add collectionid first
    var file_query = "&fq=(CollectionId:" + localStorage.getItem("last_collection_id") + ")";
    for (var i = 0; i < hierarchy[0].length; i++) {
        file_query += "&fq=(" + encodeURI(escapeRegExp(hierarchy[0][i])).replace(/:/g, '%3A').replace(/%5C&/g, '%5C%26') + ":" + encodeURI(escapeRegExp(String(hierarchy[1][i]))).replace(/%5C&/g, '%5C%26').replace(/%5C%20/g,"%20").replace(/%20/g,"%5C%20").replace(/ /g,"%5C%20") + ")";
    }
    localStorage.setItem("hierarchy_file_query", file_query);
    localStorage.setItem("hierarchy_file_query_collection", localStorage.getItem("last_collection_id"));
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

    //Check if any custom dataset configurations have columns matching the key/values in these file metadata
    var virtual_dataset_custom_column_headers = JSON.parse(localStorage.getItem("virtual_dataset_custom_column_headers"));

    var cols_to_add = new Set();
    var last_collection_id = localStorage.getItem('last_collection_id');

    if (virtual_dataset_custom_column_headers.hasOwnProperty(last_collection_id)) {
        let dataset_headers = virtual_dataset_custom_column_headers[last_collection_id];

        $.each(data.response.docs, function(_, value_obj) {
            $.each(value_obj, function(value_obj_key, value_obj_val) {
                if (dataset_headers.hasOwnProperty(value_obj_key) && dataset_headers[value_obj_key].hasOwnProperty(value_obj_val)) {
                    dataset_headers[value_obj_key][value_obj_val].split(",").forEach(col => cols_to_add.add(col));
                }
            });
        });
    }

    

    var tableheaders = localStorage.getItem("collection_custom_dataset_headers").split(",")[tableidx].split("|");
    var tablehead = "<th style='width:5%'>Select</th>"+
                            "<th data-field='name' data-sortable='true'>Name</th>";
    $.each([...tableheaders, ...cols_to_add], function (i, item) {
        tablehead += "<th>"+item+"</th>";
    });
    tablehead += "<th>Size</th>"+
                "<th>Action</th>";
    $('#files-table thead').html(tablehead);

    var header_exists = {};

    $.each(data.response.docs, function(key, value) {
        var html_safe_id = encodeURI(escapeRegExp(value.id));
        var id_safe_id = html_safe_id.replace(/\//g,"-labsep-");

        var pdfbutton = '';
        if (value.FileType == "PDF"){
            pdfbutton = '<button type="button" rel="pdfbutto" title="PDF" onclick=\'pdf_viewer("'+value.id+'")\' class="btn btn-danger btn-simple btn-link"><i class="fa fa-file-pdf-o"></i></button>';
        }
        else if (value.id.endsWith("fastq.gz") || value.id.endsWith("fq.gz")){
            pdfbutton = "<button id='view_"+id_safe_id+"' type=\"button\" rel=\"tooltip\" title=\"View\" onclick=\"Cookies.set('login_redirect', '/nist/d/index.html?dataset_id="+html_safe_id+"'); window.location.replace('/nist/fqc/index_multiqc.html?version=5.1.0');\" class=\"btn btn-simple btn-link\" style='color: red'>"+
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
        var downloadcolor = "btn-danger";
        if(user_data["DownloadFiles"] && user_data["DownloadFiles"].includes(value.id)){
            downloadcolor = "btn-success";
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
        
        //get dataset header and insert into html
        var tablevalues = localStorage.getItem("collection_custom_dataset_values").split(",")[tableidx].split("|");

        var val_to_add  = new Set();
        if (virtual_dataset_custom_column_headers.hasOwnProperty(last_collection_id)) {
            let dataset_headers = virtual_dataset_custom_column_headers[last_collection_id];

            $.each(value, function(value_obj_key, value_obj_val) {
                if (dataset_headers.hasOwnProperty(value_obj_key) && dataset_headers[value_obj_key].hasOwnProperty(value_obj_val)) {
                    dataset_headers[value_obj_key][value_obj_val].split(",").forEach(col => val_to_add.add(col));
                }
            });
        }

        var descriptive_files = "";

        if (filename.endsWith(".xlsx")){
            descriptive_files = 'style="background-color:lightgreen"';
        }

        //If fcs file, then add PeacoQCValue
        var reportbutton = ""
        if (html_safe_id.endsWith(".fcs") && value.PeacoQCValue){
            reportbutton = '<div id="report_'+html_safe_id.replace("%20","_").replace(/\//g,"_")+'"><button type=\"button\" rel=\"downloadbutton\" title=\"Download\" class=\"btn btn-success btn-simple btn-link\" onclick=\"submitSingleImageData(\''+html_safe_id.replace(/\/(?!.*\/)/,"/PeacoQC_").replace(/.fcs/,".png")+'\',\''+fileloc+'\',\''+filename+'\',\''+version+'\');\">'+
                        "<i class=\"fa fa-file-image-o\"></i>"+
                    "</button></div>";
        }

        var tablevals = "<tr "+descriptive_files+">"+
                "<td><center><input type='checkbox' class='form-check-input' data-loc='"+fileloc+"' data-name='"+filename+"' data-version='"+version+"' value='"+html_safe_id+"' "+checked+" data-valuesize='"+filesizenum+"'></center></td>"+
                "<td class='text-left' style='padding-right: 10px'>"+
                    "<a href='#' data-href=\"/nist/f/index.html?file_id="+
                        html_safe_id+"\" onclick=\"localStorage.setItem('file_id', '"+html_safe_id+"'); window.location.href = this.getAttribute('data-href');\">"+
                        value.FileName+
                    "</a>"+
                "</td>";

        $.each([...tablevalues,...val_to_add], function (i, item) {
            var tableitem = value[item] ? value[item] : "";

            //if InputFileLabCASID, generate a link instead with the filename as the link display
            if (item == "InputFileLabCASID" && tableitem && String(tableitem) != ""){
                tableitem = "<a href='#' data-href='/nist/f/index.html?file_id="+tableitem+"' onclick=\"localStorage.setItem('file_id', '"+tableitem+"'); window.location.href = this.getAttribute('data-href');\" >"+String(tableitem).split('/').pop()+"</a>";
            }

            tablevals += "<td class='text-left'>"+tableitem+"</td>";
        });

        tablevals  += "<td class='text-right'>"+
                        filesize+
                "</td>"+
                "<td class=\"td-actions text-right\">"+
                    "<button type=\"button\" rel=\"favoritebutton\" title=\"Favorite\" onclick=\"save_favorite('"+value.id+"', 'FavoriteFiles', this)\" class=\"btn "+color+" btn-simple btn-link\">"+
                        "<i class=\"fa fa-star\"></i>"+
                    "</button>"+
                    "<button type=\"button\" rel=\"downloadbutton\" title=\"Download\" class=\"btn "+downloadcolor+" btn-simple btn-link\" onclick=\"save_downloaded('"+value.id+"', 'DownloadFiles', this); download_file('"+html_safe_id+"','single');\">"+
                        "<i class=\"fa fa-download\"></i>"+
                    "</button>"+
                    "<button type=\"button\" rel=\"downloadmetadatabutton\" title=\"Download Metadata\" class=\"btn "+downloadcolor+" btn-simple btn-link\" onclick=\"download_metadata_file('"+html_safe_id+"','single');\">"+
                        "<i class=\"nc-icon nc-bullet-list-67 icon-bold\"></i>"+
                    "</button>"+
                    pdfbutton+reportbutton
                "</td>"+
            "</tr>";

        $('#files-table tbody').append(tablevals);
        //end toggle


    });
    $("#collection_favorites_len").html(user_data['FavoriteFiles'].length+user_data['FavoriteDatasets'].length+user_data['FavoriteCollections'].length);
    $('#loading_file').hide(500);
    if (size > 0){
    $("#children-files").show();
    }
    init_file_checkboxes("files-table");
    calculate_unique_files("collection_files_len");

}
var fieldsToCheck = [
    "CollectionName",
    "CollectionDescription",
    "LeadPoCID",
    "LeadPoC",
    "LeadPoCEmail",
    "InstitutionID",
    "InstitutionName",
    "DataCustodian",
    "DataCustodianEmail",
    "StudyID",
    "StudyType",
    "Discipline",
    "ReferenceURL",
    "Consortium",
    "Organism",
    "MaterialType",
    "CollectionDate",
    "OwnerPrincipal",
    "DOI",
    "DOI URL",
    "CollectionId",
    "PublishId",
    "DatasetName",
    "DatasetVersion",
    "DatasetId",
    "WorkingGroupDesignation",
    "ProtocolID",
    "ProtocolTitle",
    "PoCID",
    "PoCName",
    "PublicInstitutionName",
    "StudyName",
    "BlindedDataset",
    "ProcessingSoftware",
    "CollectionMaterialSource",
    "AssayType",
    "MethodDetails",
    "id",
    "labcasId",
    "name",
    "labcasName",
    "FileType",
    "FileSize",
    "FileDownloadId",
    "FileId",
    "DateMod",
    "ICmd5sum",
    "labcas_node_type",
    "FileName",
    "FileVersion",
    "FileLocation",
    "RealFileLocation",
    "_version_",
    "SampleID",
    "ProcessingLevel",
    "SampleType",
    "Instrument",
    "UMI length",
    "SourceMaterial",
    "DataUploadType",
    "Sequencing Reagents or Kit",
    "Read Depth per panel",
    "Number of Libraries Pooled onto Flowcell",
    "Institution",
    "Re-quantify",
    "FileSubmissionDate",
    "DateExperimentInitiated",
    "DNA Concentration per reaction (ng)",
    "SubmissionVersion",
    "Flowcell Kit or Capillary Type",
    "SubmittingPersonID",
    "ReplicateNumber",
    "UMI_index_inline",
    "FileDescription",
    "LocalFileName",
    "Sequencing Platform",
    "Additional Library/Sequencing Prep Notes",
    "ContentType",
    "Sequencing Assay Type",
    "DateFileGenerated",
    "Was Multiplex PCR Used?",
    "Sequencing Reagents or Kit Manufacturer",
    "Additional sequencing notes",
    "UMI_used",
    "Processing software",
    "Processing software version",
    "Dataset",
    "Instrument.1",
    "DNA labeling Kit",
    "Bionano Access Version",
    "Assay Notes",
    "Cells/DNA",
    "DNA labeling Protocol",
    "DNA Isolation Kit",
    "Sample",
    "Date experiment was initiated",
    "md5sum",
    "DNA Isolation Protocol",
    "Instrument control software version",
    "Bionano Solve Version",
    "PrincipalContactID",
    "Mean Duplex Depth per sample",
    "DNA Concentration per final library (ng/ul)",
    "Re-Quantification Concentration (ng/uL)",
    "Is the UMI part of index or in-line?",
    "Description",
    "Number of Libraries Pooled per Lane of Flowcell",
    "Did you Re-quantify the genomic DNA Sample?",
    "Were UMIs used?",
    "Library replicates sequenced on the same flowcell?",
    "StudyProtocolID",
    "Sample_Name",
    "Re-Quantification Instrument/Kit",
    "SiteID",
    "SubmittingInvestigatorID",
    "SubmittingInstitutuionID",
    "Study",
    "WorkingGroup",
    "InstrumentCode",
    "SampleName",
    "DataProcessingLevel",
    "MaterialCode",
    "ExperimentID",
    "file_id",
    "DataFormat",
    "PrincipleContactID",
    "SiteCode",
    "ExperimentType"
];

function fetchTotalRecordsAndSharedFields(file_query) {
    var environment = localStorage.getItem('environment');

    var statsFieldsParam = fieldsToCheck.map(function(field) {
        return '&stats.field=' + encodeURIComponent(field);
      }).join('');

    var url1 = environment + '/data-access-api/files/select?q=*' + file_query + '&wt=json&indent=true&rows=0&stats=true' + statsFieldsParam;
    
    function createSecondQueryUrl(totalRecords, sharedFields) {
      var facetFieldsParam = sharedFields.map(function(field) {
        return '&facet.field=' + encodeURIComponent(field);
      }).join('');

      var url2 = environment + '/data-access-api/files/select?q=*' + file_query + '&wt=json&indent=true&rows=0&facet=true' + facetFieldsParam + '&facet.mincount=' + totalRecords + '&facet.limit=-1';
      return url2;
    }
    
  $.ajax({
    url: url1,
    xhrFields: {
      withCredentials: true
    },
    beforeSend: function(xhr, settings) {
      setAuthorizationHeader(xhr);
    },
    dataType: 'json',
    success: function(data) {

      var totalRecords = data.response.numFound;
      var sharedFields = [];
      var statsFields = data.stats.stats_fields;

      for (var field in statsFields) {
        if (statsFields.hasOwnProperty(field)) {
          var fieldStats = statsFields[field];
          if (fieldStats && fieldStats.count === totalRecords) {
            sharedFields.push(field);
          }
        }
      }

      var url2 = createSecondQueryUrl(totalRecords, sharedFields);
      fetchSharedValues(url2, sharedFields);
      //hide loading bar
      $('#loading_dataset').hide(500);
    },
    error: handleAjaxError
  });
}

function fetchSharedValues(url, sharedFields) {
  $.ajax({
    url: url,
    xhrFields: {
      withCredentials: true
    },
    beforeSend: function(xhr, settings) {
      setAuthorizationHeader(xhr);
    },
    dataType: 'json',
    success: function(data) {
      

      var displayFields = localStorage.getItem("virtual_hierarchy_dataset_displayfields");  
      var displayFieldKeys = localStorage.getItem("virtual_hierarchy_dataset_displayfields_keys");  
      var displayFieldLabels = localStorage.getItem("virtual_hierarchy_dataset_displayfields_labels");  
      var displayFieldsArray = displayFields.split(',');
      var displayFieldsKeysArray = displayFieldKeys.split(',');
      var displayFieldsLabelsArray = displayFieldLabels.split(',');
      var facetFields = data.facet_counts.facet_fields;
      $("#datasetdetails-table tbody").empty();
      sharedFields.forEach(function(fieldName) {
        if (facetFields[fieldName][0]){
                if (displayFieldsArray.includes(fieldName)) {
                    
                    // If fieldName is in the displayFields list, add the row as usual.
                    var fieldNameLabel = fieldName.replace( /([a-z])([A-Z])/g, "$1 $2" );
                    if (displayFieldsKeysArray.includes(fieldName)){
                        
                        fieldNameLabel = displayFieldsLabelsArray[displayFieldsKeysArray.indexOf(fieldName)];
                    }
                    $("#datasetdetails-table tbody").append(
                        "<tr>"+
                            "<td class='text-right'  valign='top' style='padding: 2px 8px;' width='20%'>"+fieldNameLabel+":</td>"+
                            "<td class='text-left'  valign='top' style='padding: 2px 8px;'>"+
                                facetFields[fieldName][0]+
                            "</td>"+
                        "</tr>");
                } else {
                    // If fieldName is not in the displayFields list, add the row with class 'extra-row'.
                    $("#datasetdetails-table tbody").append(
                        "<tr class='extra-row' style='display: none;'>"+
                            "<td class='text-right'  valign='top' style='padding: 2px 8px;' width='20%'>"+fieldName.replace( /([a-z])([A-Z])/g, "$1 $2" )+":</td>"+
                            "<td class='text-left'  valign='top' style='padding: 2px 8px;'>"+
                                facetFields[fieldName][0]+
                            "</td>"+
                        "</tr>");
                }
            }
        });

        // Add an event listener to your button to toggle 'extra-row' visibility
        $('#virtual_dataset_collapse').on('click', function() {
            // If there are hidden rows, show them
          if ($(".extra-row:hidden").length > 0) {
            $(".extra-row").show();
            $(this).text("Collapse");  // Change button text to "Collapse"
          } 
          // Else, hide them
          else {
            $(".extra-row").hide();
            $(this).text("Expand");  // Change button text to "Expand"
          }
        });

    },
    error: handleAjaxError
  });
}

function setAuthorizationHeader(xhr) {
  if (Cookies.get('token') && Cookies.get('token') != "None") {
    xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
  }
}

function handleAjaxError(e) {
  if (!(localStorage.getItem("logout_alert") && localStorage.getItem("logout_alert") == "On")) {
    localStorage.setItem("logout_alert", "On");
    alert("You are currently logged out. Redirecting you to log in.");
  }
}

function setup_labcas_hierarchy_data(file_query, extraFilters, cpage){

    var sortval = localStorage.getItem("virtual_dataset_file_sort") && localStorage.getItem("virtual_dataset_file_sort") != "" ? localStorage.getItem("virtual_dataset_file_sort") : "FileName";
    var url = localStorage.getItem('environment')+'/data-access-api/files/select?q=*'+file_query+'&wt=json&indent=true&sort='+sortval+'%20asc&start='+cpage*10;
    if (extraFilters && extraFilters.length > 0) {
        var filterQueries = [];

        extraFilters.forEach(function(filter) {
            var individualFilters = [];

            for (var key in filter) {
                if (filter.hasOwnProperty(key)) {
                    individualFilters.push(key + ':' + encodeURIComponent(filter[key]));
                }
            }

            if (individualFilters.length > 0) {
                filterQueries.push('(' + individualFilters.join(' AND ') + ')');
            }
        });

        if (filterQueries.length > 0) {
            url += '&fq=' + filterQueries.join(' OR ');
        }
    }

    fetchTotalRecordsAndSharedFields(file_query);
    
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

function generate_hierarchy_based_on_tags(){

    return new Promise((resolve, reject) => {
    if (parentLock) {
      reject('Parent function execution in progress');
    } else {
        parentLock = true;
            $('#view_tag_select').attr("disabled", true);
            hierarchy_unique_check = {};
            var hierarchy_tags = get_hierarchy_selected_upto(1000);

            var collection_id = get_var["collection_id"] ? get_var["collection_id"] : localStorage.getItem('last_collection_id');
            var filters = localStorage.getItem("hierarchy_file_query") && !get_var["collection_id"] && localStorage.getItem("hierarchy_file_query_collection") == localStorage.getItem("last_collection_id") ? localStorage.getItem("hierarchy_file_query") : "";

            
            $('#hierarchy_').empty();
            
            query_labcas_api(localStorage.getItem('environment')+"/data-access-api/files/select?q=CollectionId:"+collection_id+"%20AND%20-FolderType:%5B*%20TO%20*%5D"+filters+"&wt=json&indent=true&rows=5000&fl="+hierarchy_tags.join(","), fill_hierarchy_data_fast, false).then(() => {
                // After executing the code, unlock and resolve the promise
        parentLock = false;
        resolve();
      }).catch((error) => {
        console.error(error);
        parentLock = false;
        reject('Child function execution was not successful');
      });
    }
    });
}
