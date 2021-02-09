function search(){
    var search_text = $('#search_text').val();
    if (search_text && search_text != ""){
	    localStorage.setItem("search", search_text);
    }else{
	    var search_text_main = $('#search_text_main').val();
	    if (search_text_main && search_text_main != ""){
		localStorage.setItem("search", search_text_main);
		}
	search_text = search_text_main;
    }

    console.log(localStorage.getItem("search"));
    console.log("Set search");
    window.location.href = "/labcas-ui/s/index.html?search="+search_text;
}
