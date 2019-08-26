function search(){
    var search_text = $('#search_text').val();
    window.location.href = "/labcas-ui/application/labcas_search_table.html?search="+search_text;
}
