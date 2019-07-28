function pull_labcas_collections() {
    $.ajax({
        //url: "https://mcl-labcas.jpl.nasa.gov/solr/collections/select?q=*:*",
        url: "https://mcl-labcas.jpl.nasa.gov/data-access-api/collections/select?q=*:*&wt=json&indent=true",
        beforeSend: function(xhr) { 
            xhr.setRequestHeader("Authorization", "bearer " + "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJMYWJDQVMiLCJzdWIiOiJ1aWQ9ZGxpdSxvdT11c2VycyxvPU1DTCIsIm5iZiI6MTU2Mzc0NjU1MywiaXNzIjoiTGFiQ0FTIiwiZXhwIjoxNTYzNzUwMTUzLCJpYXQiOjE1NjM3NDY1NTN9.P6WGZMk_ibhJX9x7tPJqwYwCwOpXWae83dhObJhQov0"); 
        },
        jsonp: 'json.wrf',
        type: 'GET',
        dataType: 'jsonp',
        //contentType: 'application/json',
        processData: false,
        //data: '{"foo":"bar"}',
        success: function (data) {
            $.each(data.response.docs, function(index, obj) {
                  $("#collection-table tbody").append(
                    "<tr>"+
                        "<td></td>"+
                        "<td>"+obj.CollectionName+"</td>"+
                        "<td>"+obj.LeadPI+"</td>"+
                        "<td>"+obj.Institution+"</td>"+
                        "<td>"+obj.Discipline+"</td>"+
                        "<td>"+obj.DataCustodian+"</td>"+
                        "<td>"+obj.Organ+"</td>"+
                        "<td></td>"+
                    "</tr>");
                  //console.log(obj.DataCustodian);
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
        },
        error: function(){
                 alert("Cannot get data");
         }
    });
}
