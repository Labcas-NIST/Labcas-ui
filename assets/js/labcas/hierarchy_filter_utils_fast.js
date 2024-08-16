var collection_facets = {};
var collection_facets_alias = {};
var hierarchy_unique_check = {};
var hierarchy_path_traversed = {};
var obj_type = "collection";
var hierarchy_started = false;
var hierarchy_initial_loading = true;
let childlock = false;
let parentLock = false;

function collection_hierarchy_default() {
    let validTagsCheck = false;
    const elt = $('#view_tags');

    const customHierarchyDefault = JSON.parse(localStorage.getItem("collection_custom_hierarchy_default") || '{}');
    const hierarchyTags = customHierarchyDefault[localStorage.getItem("current_collection_id")] || '';

    if (hierarchyTags) {
        elt.tagsinput('removeAll');
        hierarchyTags.split(",").forEach(val => {
            console.log("Adding tag:", val);
            elt.tagsinput('add', { "value": val });
            validTagsCheck = true;
        });

        generate_hierarchy_based_on_tags();
        console.log("Tags added based on default settings");
        $('#view_tag_select').val(hierarchyTags.split(",").pop());

        if (validTagsCheck) {
            $('#datasets-table').hide();
            $('#hierarchy_, #virtual_expand_all, #virtual_expand_all_label').show();
        }
    }
}


function collection_hierarchy_fill(data) {
    const hierarchy = $('#view_tag_select');
    const hierarchyList = {};
    collection_facets = data;
    const showVirtualHierarchyList = localStorage.getItem("collection_virtual_hierarchy_show").split(",");

    $.each(collection_facets.facet_counts.facet_fields, (key, value) => {
        if (showVirtualHierarchyList.includes(key)) {
            for (let i = 0; i < value.length; i += 2) {
                if (value[i + 1] !== 0) {
                    hierarchyList[key] = true;
                    break;
                }
            }
        }
    });

    const sortedHierarchyKeys = Object.keys(hierarchyList).sort();
    sortedHierarchyKeys.forEach(item => {
        hierarchy.append($('<option>', { value: item, text: item }));
    });

    const currentHierarchyTags = localStorage.getItem(`hierarchy_tags_${localStorage.getItem("current_collection_id")}`) || 
        (customHierarchyDefault[localStorage.getItem("current_collection_id")] || '');

    if (currentHierarchyTags) {
        currentHierarchyTags.split(",").forEach(val => {
            if (val in collection_facets.facet_counts.facet_fields) {
                $('#view_tags').tagsinput('add', { "value": val });
                validTagsCheck = true;
            }
        });

        generate_hierarchy_based_on_tags();
        console.log("Hierarchy tags have been added");
        $('#view_tag_select').val(currentHierarchyTags.split(",").pop());

        if (validTagsCheck) {
            $('#datasets-table').hide();
            $('#hierarchy_, #virtual_expand_all, #virtual_expand_all_label').show();
        }
    }
}


function collection_hierarchy_get(collection_id, obj_type) {
    const showVirtualHierarchyList = localStorage.getItem("collection_virtual_hierarchy_show").split(",");
    const facets = showVirtualHierarchyList.map(f => `&facet.field=${f}`).join('');
    const baseQuery = `CollectionId:${collection_id}`;
    const filters = localStorage.getItem("hierarchy_file_query_collection") === localStorage.getItem("last_collection_id") && !get_var["collection_id"] ? localStorage.getItem("hierarchy_file_query") : '';

    const url = `${localStorage.getItem('environment')}/data-access-api/files/select?q=${baseQuery}${filters}&facet=true&facet.limit=-1&facet.mincount=1${facets}&wt=json&rows=0`;

    console.log("Fetching data from:", url);
    $.ajax({
        url: url,
        beforeSend(xhr) {
            const token = Cookies.get('token');
            if (token && token !== "None") {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
        },
        type: 'GET',
        dataType: 'json',
        processData: false,
        success: function (filedata) {
            console.log("Data received:", filedata);
            collection_hierarchy_fill(filedata);
        },
        error: function (e) {
            if (!localStorage.getItem("logout_alert")) {
                localStorage.setItem("logout_alert", "On");
                alert(formatTimeOfDay($.now()) + ": Login expired, please log in again.");
                redirect_to_login();
            }
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
        //console.log("toggling2"+k+":"+v);
        toggle_child_elements(k, v, false);
    });
}

function toggle_child_elements(idx, show, post_initial_flag) {
    let virtual_state = post_initial_flag ? load_hierarchy_state() : {};

    const isExpanded = show === "true";
    const elements = $(`div[id^="hierarchy_${idx}_"]`);
    const toggles = $(`span[id^="toggle_${idx}"]`);

    if (isExpanded) {
        elements.show();
        toggles.each(function () {
            const id = $(this).attr('id').replace(/toggle_/g, "");
            $(this).find('i').addClass("fa-minus").removeClass("fa-plus");
            $(this).find('a').attr("onclick", `event.preventDefault(); toggle_child_elements("${id}", "false", true)`);
            virtual_state[id] = show;
        });
        if ($('#virtual_expand_all').is(":checked")) {
            $('#toggle_' + idx).html(`<a onclick="event.preventDefault(); toggle_child_elements('${idx}', 'false', true)" href='#'><i class='fa fa-minus'></i></a>`);
        }
    } else {
        elements.hide();
        $('#toggle_' + idx).html(`<a onclick="event.preventDefault(); toggle_child_elements('${idx}', 'true', true)" href='#'><i class='fa fa-plus'></i></a>`);
    }

    if (post_initial_flag) {
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
    console.log("Processing fast hierarchy data");
    return new Promise((resolve, reject) => {
        if (childlock) {
            return reject('Content generation in progress');
        }
        childlock = true;

        const collectionFileFacets = data.response.docs;
        if (!collectionFileFacets.length) {
            console.log("No data to process");
            childlock = false;
            return resolve();
        }

        collectionFileFacets.forEach(v => {
            if ($.isEmptyObject(v)) return;

            let tree_path = "";
            for (let idx = 0; idx < 10; idx++) {
                const facetKey = get_hierarchy_selected(idx);
                if (facetKey === -1) break;
                tree_path += `${v[facetKey]}-labsep-`;
            }

            if (!tree_path) return;
            hierarchy_unique_check[tree_path] = (hierarchy_unique_check[tree_path] || 0) + 1;
            if (hierarchy_unique_check[tree_path] > 1) return;
        });

        if (!Object.keys(hierarchy_unique_check).length) {
            console.log("No unique paths identified");
            childlock = false;
            return resolve();
        }

        console.log("Unique paths:", hierarchy_unique_check);
        Object.keys(hierarchy_unique_check).sort().forEach(v => {
            if ($.trim(v) != ''){
                var pathval = [];
                $.each(v.split("-labsep-"), function(idx, branch) {
                    if (branch == ""){
                        return true;
                    }
                    if (branch == "undefined"){
                        branch = "None";
                        if (!localStorage.getItem("none_hierarchy_collections").includes(localStorage.getItem("current_collection_id"))){
                            return true;
                        }
                    }
                    var pathval_child = pathval.slice();
                    var path_child = get_hierarchy_selected_upto(idx+1)
                    var pathval_parent = pathval.slice();
                    pathval_child.push(branch);

                    var mapped_path = replaceRegExp(pathval.join("_"), "_");
                    var mapped_path_child = replaceRegExp(pathval_child.join("_"), "_");
                    var mapped_path_parent = replaceRegExp(pathval_parent.join("_"), "_");
                    pathval.push(branch); //move pathval down tree branch

                    if (hierarchy_path_traversed[mapped_path_child]){
                        return true;
                    }
                    hierarchy_path_traversed[mapped_path_child] = true;
                    collection_facets_alias[mapped_path_child] = [path_child, pathval_child]; 
                    var visibility = "";
 
                    var checkbox = "<a onclick='event.preventDefault(); toggle_child_elements(\""+mapped_path_child+"\",\"true\",true)' href='#'><i class='fa fa-plus'></i></a>";
                    if (idx > 0){
                        visibility = "style='display:none'";
                        checkbox = "<a onclick='event.preventDefault(); toggle_child_elements(\""+mapped_path_child+"\",\"true\",true)' href='#'><i class='fa fa-plus'></i></a>";

                        $('#toggle_'+mapped_path_parent+'_').css("visibility", "visible");
                        $('#toggle_'+mapped_path_parent).css("visibility", "visible");
                    }

                    image_div = "";
                    multiqc_hierarchy_mapping = JSON.parse(localStorage.getItem("multiqc_custom_hierarchy_mapping"));


                    if (Object.keys(multiqc_hierarchy_mapping).includes(branch)){
                        image_div = "<button id='view_"+branch+"' type=\"button\" rel=\"tooltip\" title=\"View\" onclick=\"window.open('/labcas-ui/fqc/index_multiqc.html?multiqc_id="+multiqc_hierarchy_mapping[branch]+"','_blank')\" class=\"btn btn-simple btn-link\" style='transform: translateY(-50%); color: blue'>"+
                            "<i class=\"fa fa-image\"></i>"+
                            "</button>";
                    }

                    var download_metadata_button = "<button type='button' rel='downloadmetadatabutton' title='Download Metadata' class='btn btn-success btn-simple btn-link' style='left: 0px; top: 50%; transform: translateY(-50%); color: blue;' onclick='generate_hierarchy_query(\""+mapped_path_child+"\"); download_metadatas(\"hierarchy_query\");'><i class='nc-icon nc-bullet-list-67 icon-bold'></i></button>";

                    var branch_display_label = branch;
                    var hierarchy_selected_upto = get_hierarchy_selected_upto(idx+1);
                    console.log(hierarchy_selected_upto);
                    if (hierarchy_selected_upto.length > 0 && hierarchy_selected_upto[hierarchy_selected_upto.length-1].includes("Date")){
                        // Convert to a JavaScript Date object
                        let date = new Date(Number(branch));

                        // Convert to a readable UTC date string
                        branch_display_label = date.toISOString().slice(0,10);  // Output will be YYYY-MM-DD
                        console.log(branch_display_label);
                    }

                    $('#hierarchy_'+mapped_path).append("<div id='hierarchy_"+mapped_path_child+"' "+visibility+" class=''><hr style='margin-bottom:0;margin-top:0'>"+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".repeat(idx)+"<nobr><span id='toggle_"+mapped_path_child+"' style='visibility: hidden'>"+checkbox+"</span><a data-mapped-path='"+mapped_path_child+"' href='#'>"+branch_display_label+"</a>"+"<div class='text-right' valign='middle' style='padding: 0px 8px; vertical-align: middle; height: 10px'>"+image_div+"<button type='button' rel='downloadbutton' title='Download' class='btn btn-danger btn-simple btn-link' onclick='generate_hierarchy_query(\""+mapped_path_child+"\"); download_dataset(\"hierarchy_query\");' style='left: 0px; top: 50%; transform: translateY(-50%); color: red;'><i class='fa fa-download'></i></button>"+download_metadata_button+"</div></nobr></div>");
                });
            }
        });

        hierarchy_unique_check = {};
        childlock = false;
        resolve();
    });
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
            window.open("/labcas-ui/cd/index.html","_blank");
        }  else{
            window.open("/labcas-ui/cd/index.html","_self");
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

function generate_hierarchy_query(key){
    var link_path = collection_facets_alias[key];
    localStorage.setItem("hierarchy_dict_current",JSON.stringify(link_path));

    var hierarchy = link_path;
    var file_query = "";
    for (var i = 0; i < hierarchy[0].length; i++) {
        file_query += "&fq=(" + encodeURI(escapeRegExp(hierarchy[0][i])).replace(/:/g, '%3A').replace(/%5C&/g, '%5C%26') + ":" + encodeURI(escapeRegExp(String(hierarchy[1][i]))).replace(/%5C&/g, '%5C%26').replace(/%5C%20/g,"%20").replace(/%20/g,"%5C%20").replace(/ /g,"%5C%20") + ")";
    }
    localStorage.setItem("hierarchy_file_query", file_query);
    localStorage.setItem("hierarchy_file_query_collection", localStorage.getItem("last_collection_id"));
}

function fill_hierarchy_files_data(data, file_query) {
    const size = data.response.numFound;
    const cpage = data.response.start;
    load_pagination("hierarchy_files", size, cpage);
    $("#files-table tbody").empty();

    const download_list = JSON.parse(localStorage.getItem("download_list") || '{}');
    const cart_list = JSON.parse(localStorage.getItem("cart_list") || '{}');

    // Determine the appropriate table headers
    const tableIndex = (localStorage.getItem("collection_custom_dataset_toggles") || '').split(",").indexOf(localStorage.getItem('last_collection_id'));
    const tableHeaders = (localStorage.getItem("collection_custom_dataset_headers").split(",")[tableIndex] || "").split("|");
    let tableHeadHtml = "<th style='width:5%'>Select</th><th data-field='name' data-sortable='true'>Name</th>";

    tableHeaders.forEach(header => {
        tableHeadHtml += `<th>${header}</th>`;
    });
    tableHeadHtml += "<th>Thumbnail</th><th>Size</th><th>Action</th>";
    $('#files-table thead').html(tableHeadHtml);

    data.response.docs.forEach(doc => {
        const htmlSafeId = encodeURI(escapeRegExp(doc.id)).replace(/&/g, "%26");
        const idSafeId = htmlSafeId.replace(/\//g, "-labsep-");
        const filename = doc.FileName || "";
        const fileLoc = doc.FileLocation || "";
        const version = doc.DatasetVersion || "";

        const thumb = doc.ThumbnailRelativePath ? `<img width='50' height='50' src='/labcas-ui/assets/${doc.ThumbnailRelativePath}'/>` : "";
        const filesize = doc.FileSize ? humanFileSize(doc.FileSize, true) : "";
        const checked = download_list[htmlSafeId] || cart_list[htmlSafeId] ? "checked" : "";

        const fileDownloadButton = generateFileDownloadButton(doc, htmlSafeId, download_list);
        const pdfButton = generatePDFButton(doc, idSafeId);
        const mlButton = generateMLButton(doc, htmlSafeId, localStorage.getItem("ml_enabled_collections").split(","));

        let rowHtml = `<tr ${filename.endsWith(".xlsx") ? 'style="background-color:lightgreen"' : ""}>
            <td><center><input type='checkbox' class='form-check-input' data-loc='${fileLoc}' data-name='${filename}' data-version='${version}' value='${htmlSafeId}' ${checked} data-valuesize='${doc.FileSize || 0}'></center></td>
            <td class='text-left' style='padding-right: 10px'><a href='/labcas-ui/f/index.html?file_id=${htmlSafeId}'>${filename}</a></td>`;

        tableHeaders.forEach(header => {
            const itemValue = doc[header] || "";
            rowHtml += `<td class='text-left'>${itemValue}</td>`;
        });

        rowHtml += `<td class='text-left'>${thumb}</td><td class='text-left'>${filesize}</td><td class="td-actions text-right">${fileDownloadButton}${pdfButton}${mlButton}</td></tr>`;

        $('#files-table tbody').append(rowHtml);
    });

    $("#collection_favorites_len").html(user_data['FavoriteFiles'].length + user_data['FavoriteDatasets'].length + user_data['FavoriteCollections'].length);
    $('#loading_file').hide(500);
    if (size > 0) {
        $("#children-files").show();
    }
    init_file_checkboxes("files-table");
    setTimeout(() => $("#collection_files_len").html(size), 1000);
}

function generatePDFButton(doc, idSafeId) {
    if (doc.FileType === "PDF") {
        return `<button type="button" rel="pdfbutton" title="PDF" onclick='pdf_viewer("${doc.id}")' class="btn btn-danger btn-simple btn-link"><i class="fa fa-file-pdf-o"></i></button>`;
    } else if (doc.id.endsWith("fastq.gz") || doc.id.endsWith("fq.gz")) {
        return `<button id='view_${idSafeId}' type="button" rel="tooltip" title="View" onclick="Cookies.set('login_redirect', '/labcas-ui/d/index.html?dataset_id=${doc.id}'); window.location.replace('/labcas-ui/fqc/index_multiqc.html?version=3.0.0');" class="btn btn-simple btn-link" style='color: red'><i class="fa fa-image"></i></button>`;
    }
    return '';
}

function generateMLButton(doc, htmlSafeId, mlEnabledCollections) {
    if (mlEnabledCollections.some(colId => localStorage.getItem('last_collection_id').includes(colId))) {
        return `<button type="button" rel="mlbutton" title="ML" onclick='submit_ml_file("${htmlSafeId}", "single")' class="btn btn-success btn-simple btn-link"><i class="fa fa-gears"></i></button>`;
    }
    return '';
}

function generateFileDownloadButton(doc, htmlSafeId, download_list) {
    const color = user_data["FavoriteFiles"].includes(doc.id) ? "btn-success" : "btn-info";
    const downloadColor = user_data["DownloadFiles"] && user_data["DownloadFiles"].includes(doc.id) ? "btn-success" : "btn-danger";
    return `<button type="button" rel="favoritebutton" title="Favorite" onclick="save_favorite('${doc.id}', 'FavoriteFiles', this)" class="btn ${color} btn-simple btn-link"><i class="fa fa-star"></i></button>
            <button type="button" rel="downloadbutton" title="Download" class="btn ${downloadColor} btn-simple btn-link" onclick="save_downloaded('${doc.id}', 'DownloadFiles', this); download_file('${htmlSafeId}', 'single');"><i class="fa fa-download"></i></button>
            <button type="button" rel="downloadmetadatabutton" title="Download Metadata" class="btn ${downloadColor} btn-simple btn-link" onclick="download_metadata_file('${htmlSafeId}', 'single');"><i class="nc-icon nc-bullet-list-67 icon-bold"></i></button>`;
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
    console.log("url1");
    console.log(url1);
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
        console.log("url2")
        console.log(url2)
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
      console.log("shared_queries3");
      console.log(data);
      

      var displayFields = localStorage.getItem("virtual_hierarchy_dataset_displayfields");  // Change this to your actual list
      var displayFieldsArray = displayFields.split(',');
      var facetFields = data.facet_counts.facet_fields;
      $("#datasetdetails-table tbody").empty();
      sharedFields.forEach(function(fieldName) {
        if (facetFields[fieldName][0]){
                if (displayFieldsArray.includes(fieldName)) {
                    // If fieldName is in the displayFields list, add the row as usual.
                    $("#datasetdetails-table tbody").append(
                        "<tr>"+
                            "<td class='text-right'  valign='top' style='padding: 2px 8px;' width='20%'>"+fieldName.replace( /([a-z])([A-Z])/g, "$1 $2" )+":</td>"+
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
    console.log("url_origin");
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

            console.log("itemadd3");
            var collection_id = get_var["collection_id"] ? get_var["collection_id"] : localStorage.getItem('last_collection_id');
            var filters = localStorage.getItem("hierarchy_file_query") && !get_var["collection_id"] && localStorage.getItem("hierarchy_file_query_collection") == localStorage.getItem("last_collection_id") ? localStorage.getItem("hierarchy_file_query") : "";

            console.log(localStorage.getItem('environment')+"/data-access-api/files/select?q=CollectionId:"+collection_id+"%20AND%20-FolderType:%5B*%20TO%20*%5D"+filters+"&wt=json&indent=true&rows=10000&fl="+hierarchy_tags.join(","));
            $('#hierarchy_').empty();
            
            query_labcas_api(localStorage.getItem('environment')+"/data-access-api/files/select?q=CollectionId:"+collection_id+"%20AND%20-FolderType:%5B*%20TO%20*%5D"+filters+"&wt=json&indent=true&rows=10000&fl="+hierarchy_tags.join(","), fill_hierarchy_data_fast, false).then(() => {
                // After executing the code, unlock and resolve the promise
        parentLock = false;
        resolve();
      }).catch((error) => {
        console.log(error);
        parentLock = false;
        reject('Child function execution was not successful');
      });
    }
    });
}
