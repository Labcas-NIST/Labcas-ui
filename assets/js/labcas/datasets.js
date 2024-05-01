function fill_files_data(data) {
    let size = 0;
    const cpage = data.response.start;
    load_pagination("files", size, cpage);
    $("#files-table tbody").empty();
    const download_list = JSON.parse(localStorage.getItem("download_list") || '{}');
    const cart_list = JSON.parse(localStorage.getItem("cart_list") || '{}');
    const get_var = get_url_vars();

    const collection_toggles = (localStorage.getItem("collection_custom_dataset_toggles") || '').split(",");
    const last_collection_id = localStorage.getItem('last_collection_id');
    let tableidx = collection_toggles.findIndex(item => item.includes(last_collection_id));
    tableidx = tableidx === -1 ? 0 : tableidx;

    const tableheaders = (localStorage.getItem("collection_custom_dataset_headers") || '').split(",")[tableidx].split("|");
    let tablehead = `<th style='width:5%'>Select</th><th data-field='name' data-sortable='true'>Name</th>`;
    tableheaders.forEach(item => {
        tablehead += `<th>${item}</th>`;
    });
    tablehead += "<th>Thumbnail</th><th>Size</th><th>Action</th>";
    $('#files-table thead').html(tablehead);

    let tableheader_flag = false;

    data.response.docs.forEach(value => {
        if (!value.id || value.DatasetId !== get_var["dataset_id"]) {
            return;
        }
        size += 1;

        const color = user_data["FavoriteFiles"].includes(value.id) ? "btn-success" : "btn-info";
        const filetype = Array.isArray(value.FileType) ? value.FileType.join(",") : value.FileType || "";
        const filename = value.FileName || "";
        const fileloc = value.RealFileLocation || "";
        const version = value.DatasetVersion || "";
        const description = Array.isArray(value.Description) ? value.Description.join(",") : value.Description || "";
        const thumb = value.ThumbnailRelativePath ? `<img width='50' height='50' src='${localStorage.getItem('environment')}/labcas-ui/assets/${value.ThumbnailRelativePath}'/>` : "";
        const html_safe_id = encodeURIComponent(escapeRegExp(value.id)).replace("&", "%26");
        const filesize = value.FileSize ? humanFileSize(value.FileSize, true) : "";
        const filesizenum = value.FileSize || 0;
        const checked = ((download_list && download_list[html_safe_id]) || (cart_list && cart_list[html_safe_id])) ? "checked" : "";

        let tablevals = `<tr>
            <td><center><input type='checkbox' class='form-check-input' data-loc='${fileloc}' data-name='${filename}' data-version='${version}' value='${html_safe_id}' ${checked} data-valuesize='${filesizenum}'></center></td>
            <td class='text-left' style='padding-right: 10px'><a href="/labcas-ui/f/index.html?file_id=${html_safe_id}">${value.FileName}</a></td>
        `;

        tableheaders.forEach(item => {
            const tableitem = value[item] || "";
            tablevals += `<td class='text-left'>${tableitem}</td>`;
        });
        tablevals += `<td class='text-left'>${thumb}</td><td class='text-left'>${filesize}</td>`;

        // Construct action buttons
        const pdfbutton = value.FileType === "PDF" ? `<button type="button" rel="pdfbutton" title="PDF" onclick='pdf_viewer("${value.id}")' class="btn btn-danger btn-simple btn-link"><i class="fa fa-file-pdf-o"></i></button>` : "";
        const mlbutton = localStorage.getItem("ml_enabled_collections").split(",").includes(get_var["dataset_id"]) ? `<button type="button" rel="mlbutton" title="ML" onclick='submit_ml_file("${html_safe_id}", "single")' class="btn btn-success btn-simple btn-link"><i class="fa fa-gears"></i></button>` : "";

        tablevals += `<td class="td-actions text-right">
            <button type="button" rel="favoritebutton" title="Favorite" onclick="save_favorite('${value.id}', 'FavoriteFiles', this)" class="btn ${color} btn-simple btn-link"><i class="fa fa-star"></i></button>
            ${pdfbutton}${mlbutton}
            <button type="button" rel="downloadbutton" title="Download" class="btn btn-danger btn-simple btn-link" onclick="download_file('${html_safe_id}', 'single')"><i class="fa fa-download"></i></button>
        </td></tr>`;

        $('#files-table tbody').append(tablevals);
    });

    $("#collection_files_len").html(size);
    $("#collection_favorites_len").html(user_data['FavoriteFiles'].length + user_data['FavoriteDatasets'].length + user_data['FavoriteCollections'].length);
    $('#loading_file').hide(500);
    if (size > 0) {
        $("#children-files").show();
    }
    init_file_checkboxes("files-table");
}


function fill_datasets_children(data) {
    data.response.docs.sort(dataset_compare_sort);
    let dataset_html = "";
    const get_var = get_url_vars();
    let dataset_count = 0;

    data.response.docs.forEach(value => {
        if (!value.id || !value.id.includes(get_var["dataset_id"]) || value.id === get_var["dataset_id"]) {
            return;
        }
        const color = user_data["FavoriteDatasets"].includes(value.id) ? "#87CB16 !important" : "#0000FF";
        const indentedName = "&nbsp;&nbsp;&nbsp;&nbsp;".repeat(value.id.split("/").length - 2) + "<span>&#8226;</span>" + value.DatasetName;
        const html_safe_id = encodeURIComponent(escapeRegExp(value.id));
        const id_safe_id = html_safe_id.replace(/\//g, "-labsep-");
        const view_button_title = value.contains_image ? "View" : "Analyze";
        const view_button_icon = value.contains_image ? "fa-image" : "fa-bar-chart-o";
        const view_button_onclick = value.contains_image ? `Cookies.set('login_redirect', '/labcas-ui/d/index.html?dataset_id=${html_safe_id}'); submitImage('files-table', '${html_safe_id}')` : `Cookies.set('login_redirect', '/labcas-ui/d/index.html?dataset_id=${html_safe_id}'); window.location.replace('/labcas-ui/fqc/index.html?version=3.0.0');`;

        dataset_html += `<div class='row' style='border-bottom:1px solid #ccc; margin-left: 0px; margin-right: 0px;'>
            <div class='col-md-1'></div>
            <div class='text-left col-md-10' valign='middle' style='padding: 0px 8px; vertical-align: middle;'>
                <a href="/labcas-ui/d/index.html?dataset_id=${value.id}">${indentedName}</a>
            </div>
            <div class="td-actions col-md-1 text-right" valign='middle' style='padding: 0px 8px; vertical-align: middle; height: 25px'>
                <button id='view_${id_safe_id}' type="button" rel="tooltip" title="${view_button_title}" onclick="${view_button_onclick}" class="btn btn-simple btn-link" style='position: absolute; left: -50px; top: 50%; transform: translateY(-50%); color: red'>
                    <i class="fa ${view_button_icon}"></i>
                </button>
                <button type="button" rel="tooltip" title="Favorite" onclick="save_favorite('${value.id}', 'FavoriteDatasets', this)" class="btn btn-simple btn-link" style='position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: ${color}'>
                    <i class="fa fa-star"></i>
                </button>
            </div>
        </div>`;
        dataset_count++;
    });

    if (dataset_html !== "") {
        $("#children-datasets").show();
        $("#children-datasets-section").append(dataset_html);
        $("#collection_datasets_len").html(dataset_count);
    } else {
        $("#children-datasets-section").append("<p>No datasets found.</p>");
    }
}


function populate_dataset_children(query) {
    const formattedQuery = query.replace(/id:/, 'DatasetParentId') + "%5C%2A";
    const apiUrl = `${localStorage.getItem('environment')}/data-access-api/datasets/select?q=${formattedQuery}&wt=json&indent=true&rows=20000&sort=id asc`;

    $.ajax({
        url: apiUrl,
        xhrFields: { withCredentials: true },
        beforeSend(xhr) {
            const token = Cookies.get('token');
            if (token && token !== "None") {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
        },
        dataType: 'json',
        success: fill_datasets_children,
        error() {
            if (!localStorage.getItem("logout_alert")) {
                localStorage.setItem("logout_alert", "On");
                alert("You are currently logged out. Redirecting you to log in.");
                redirect_to_login();
            }
        }
    }).always(() => $('#loading_dataset').hide(500));
}

function fill_dataset_details_data(data) {
    const get_var = get_url_vars();
    data.response.docs.forEach(obj => {
        if (obj.id !== get_var["dataset_id"]) return;

        let datasetname = obj.DatasetName || '';
        $("#datasettitle").text(datasetname);

        if (datasetname.length > 25) {
            datasetname = datasetname.slice(0, 25);
        }

        setTimeout(() => $("#collection_datasets_len").text(datasetname), 2000);

        $("#collection_name").html(`<a href="/labcas-ui/c/index.html?collection_id=${obj.CollectionId}">${obj.CollectionId}</a>`);

        if (obj.CollectionId !== "cell_line_provenance") {
            $("#collection_level_gantt").hide();
        } else {
            $("#collection_level_gantt").show();
        }

        const extendedHeaders = localStorage.getItem(`dataset_header_extend_${obj.CollectionId}`) ? localStorage.getItem(`dataset_header_extend_${obj.CollectionId}`).split(',') : [];
        const showHeaders = localStorage.getItem('dataset_header_order').split(',');
        const collectionIdAppend = localStorage.getItem('dataset_id_append').split(',');

        const tbody = $("#datasetdetails-table tbody");
        showHeaders.forEach(head => {
            if (!obj[head]) return;
            let value = Array.isArray(obj[head]) ? obj[head].join(",") : obj[head];
            value = decodeValue(value);
            if (collectionIdAppend.includes(head)) {
                value += ` (${obj[`${head}Id`]})`;
            }
            tbody.append(`<tr><td class='text-right' valign='top' style='padding: 2px 8px;' width='20%'>${head.replace(/([a-z])([A-Z])/g, "$1 $2")}:</td><td class='text-left' valign='top' style='padding: 2px 8px;'>${value}</td></tr>`);
        });

        $.each(obj, (key, value) => {
            if (showHeaders.includes(key) || typeof value === "undefined") return;
            value = Array.isArray(value) ? value.join(",") : decodeValue(value);
            if (obj[key + "_link"]) {
                value = `<a href='${obj[key + "_link"]}'>${value}</a>`;
            }
            tbody.append(`<tr><td class='text-right' valign='top' style='padding: 2px 8px;' width='20%'>${key.replace(/([a-z:])([A-Z])/g, "$1 $2")}:</td><td class='text-left' valign='top' style='padding: 2px 8px;'>${value}</td></tr>`);
        });

        $('#loading_dataset').hide(500);
    });
}

function decodeValue(value) {
    value = value.replace(/% /g, '_labcasPercent_');
    try {
        value = decodeURIComponent(value);
    } catch (e) {
        console.error(e);
    }
    return value.replace(/\+/g, "&nbsp;").replace(/_labcasPercent_/g, '% ');
}


function setup_labcas_dataset_data(datatype, query, file_query, cpage) {
    if (cpage === 0) {
        const datasetUrl = `${localStorage.getItem('environment')}/data-access-api/datasets/select?q=${query}&wt=json&indent=true`;
        $.ajax({
            url: datasetUrl,
            xhrFields: { withCredentials: true },
            beforeSend(xhr) {
                const token = Cookies.get('token');
                if (token && token !== "None") {
                    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                }
            },
            dataType: 'json',
            success: function (data) {
                fill_dataset_details_data(data);
                populate_dataset_children(query);
            },
            error: standardErrorHandling
        });
    }

    const filesUrl = `${localStorage.getItem('environment')}/data-access-api/files/select?q=${file_query}&wt=json&indent=true&sort=FileName asc&start=${cpage * 10}`;
    $.ajax({
        url: filesUrl,
        xhrFields: { withCredentials: true },
        beforeSend(xhr) {
            const token = Cookies.get('token');
            if (token && token !== "None") {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
        },
        dataType: 'json',
        success: fill_files_data,
        error: standardErrorHandling
    });
}

function standardErrorHandling() {
    if (!localStorage.getItem("logout_alert")) {
        localStorage.setItem("logout_alert", "On");
        alert("You are currently logged out. Redirecting you to log in.");
        redirect_to_login();
    }
}

