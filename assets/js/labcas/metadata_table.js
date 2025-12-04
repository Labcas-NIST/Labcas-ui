$(document).ready(function() {
    const jsonUrl = '/labcas-ui/assets/documentation/excel_data.json'; // replace with your JSON URL

    // Retrieve the JSON mapping from localStorage
    const mappingStr = localStorage.getItem("metadata_table_collection_mapping");
    const mapping = JSON.parse(mappingStr);

    // Function to get query parameter by name
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Fetch the JSON data
    $.getJSON(jsonUrl)
        .done(function(data) {
            

            // Replace NaN with null in the data
            function replaceNaN(obj) {
                for (const key in obj) {
                    if (obj[key] !== obj[key]) { // NaN is the only value in JS that is not equal to itself
                        obj[key] = null;
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        replaceNaN(obj[key]);
                    }
                }
            }

            replaceNaN(data);

            function displayTabsForKey(key) {
                const tabNames = mapping[key];
                if (!tabNames) {
                    console.error(`No tabs found for key: ${key}`);
                    return;
                }

                $('#tabs ul').empty();
                $('#tabs').children('div').remove();

                let tabsHtml = '';
                let tabContentHtml = '';

                tabNames.forEach(tabName => {
                    if (data[tabName]) {
                        const sanitizedTabName = tabName.replace(/[^\w]/g, '_'); // Sanitize tab names by replacing non-word characters
                        tabsHtml += `<li><a href="#${sanitizedTabName}">${tabName}</a></li>`;
                        tabContentHtml += `<div id="${sanitizedTabName}"><table id="table_${sanitizedTabName}" class="display" width="100%"></table></div>`;
                    } else {
                        console.error(`Data not found for tab: ${tabName}`);
                    }
                });

                $('#tabs ul').html(tabsHtml);
                $('#tabs').append(tabContentHtml);
                $('#tabs').tabs();

                tabNames.forEach(tabName => {
                    const sanitizedTabName = tabName.replace(/[^\w]/g, '_');
                    if (data[tabName] && data[tabName].length > 0) {
                        const columns = Object.keys(data[tabName][0]).map(key => ({
                            title: key,
                            data: key
                        }));

                        

                        $(`#table_${sanitizedTabName}`).DataTable({
                            data: data[tabName],
                            columns: columns,
                            order: [], // Disable initial ordering to maintain the order in the JSON
                            dom: 'Bfrtip', // Include the buttons extension in the DataTable
                            buttons: [
                                'copy', 'csv', 'excel', 'pdf', 'print'
                            ],
                            paging: true, // Enable pagination
                            searching: true, // Enable search functionality
                            info: true // Show table information
                        });
                    } else {
                        console.error(`No valid data for tab: ${tabName}`);
                    }
                });
            }

            // Get the collection_id from the query parameters
            const collectionId = getQueryParam('collection_id');
            if (collectionId) {
                // Call the wrapper function with the collection_id
                displayTabsForKey(collectionId);
            } else {
                console.error("No collection_id found in query parameters.");
            }
        })
        .fail(function(jqxhr, textStatus, error) {
            console.error("Request Failed: " + textStatus + ", " + error);
        });
});
