collections = [];
collection_disc = {};
collection_labels = [];
collection_dataset_count = [];
function get_acronym(str){
	var matches = str.match(/\b(\w)/g);
	return matches.join('');
}
function init_labcas_sunburst_distribution(collections, collection_dataset_count){
	
	var data = [{
	  colorscale: 'Blackbody',
	  x: collections,
	  y: collection_dataset_count,
	  marker: {color:  ['rgb(165,0,38)','rgb(69,117,180)', 'rgb(116,173,209)','rgb(253,174,97)','rgb(254,224,144)','rgb(244,109,67)','rgb(224,243,248)','rgb(171,217,233)','rgb(215,48,39)','rgb(49,54,149)']},
	  //marker: {color: data.color, size: data.size},
	  mode: "markers",
	  text: collection_labels,
	  type: 'bar',
	  colorscale: 'Jet'
	}];

	var layout = {
	  yaxis: {title: 'Dataset Count'},
	  xaxis: {title: 'Collection Name Acronym', tickangle: 45, showline: true},
	  margin: {t: 10, b: 150}
	};


	Plotly.newPlot('labcas_sunburst_distribution', data, layout,{displayModeBar: false, responsize: true});
}



function init_labcas_data_distribution(div, second_graph_organ){ //acronym, name, count, date
	var data = [{
	  values: second_graph_organ[1],
	  labels: second_graph_organ[0],
	  type: 'pie'
	}];

	var layout = {
	};
	Plotly.newPlot(div, data, layout,{displayModeBar: false, responsize: true});

}

function init_labcas_data_boxplot(div, second_graph){
	
	
	var data = [{
	  colorscale: 'Blackbody',
	  x: second_graph[0],
	  y: second_graph[1],
	  marker: {color:  ['rgb(165,0,38)','rgb(69,117,180)', 'rgb(116,173,209)','rgb(253,174,97)','rgb(254,224,144)','rgb(244,109,67)','rgb(224,243,248)','rgb(171,217,233)','rgb(215,48,39)','rgb(49,54,149)']},
	  //marker: {color: data.color, size: data.size},
	  mode: "markers",
	  text: second_graph[0],
	  type: 'bar',
	  colorscale: 'Jet'
	}];

	var layout = {
	  yaxis: {title: 'Dataset Count'},
	  xaxis: {title: 'Lead PI', tickangle: 45, showline: true},
	  margin: {t: 10, b: 150}
	};


	Plotly.newPlot(div, data, layout,{displayModeBar: false, responsize: true});
	
}

function fill_collections_analytics(data){
	var size = data.response.numFound;
	$("#collections_len").html(size);
	
	var second_graph_institution_dict = {};
	var second_graph_organ_dict = {};
	var second_graph_discipline_dict = {};
	var second_graph_collabgroup_dict = {};
	var second_graph_discipline_dict = {};
	var second_graph_leadpi_dict = {};
	var second_graph_species_dict = {};
	var second_graph_pubmed_dict = {};
	
	var second_graph_institution = [[],[]];
	var second_graph_organ = [[],[]];
	var second_graph_collabgroup = [[],[]];
	var second_graph_discipline = [[],[]];
	var second_graph_discipline = [[],[]];
	var second_graph_leadpi = [[],[]];
	var second_graph_pubmed = [[],[]];
	
	$.each(data.response.docs, function(key, obj) {
		collection_disc[obj.CollectionName] = [obj.Institution ? obj.Institution : [], obj.Organ ? obj.Organ : [], obj.CollaborativeGroup ? obj.CollaborativeGroup : [], obj.Discipline ? obj.Discipline : [], obj.LeadPI ? obj.LeadPI : [], obj.Species ? obj.Species : [], obj.PubMedID ? obj.PubMedID : []]; //institution, organ, collabgroup, discipline, leadpi, species, pubmed
		
		if (obj.Institution){
			$.each(obj.Institution, function(idx, y) { 
				y = y.trim();
				second_graph_institution_dict[y] = (second_graph_institution_dict[y] || 0) + 1;
			});
		}
		if (obj.Organ){
			$.each(obj.Organ, function(idx, y) { 
				y = y.trim();
				second_graph_organ_dict[y] = (second_graph_organ_dict[y] || 0) + 1;
			});
		}
		if (obj.Discipline){
			$.each(obj.Discipline, function(idx, y) { 
				y = y.trim();
				
				if (y == ""){
					y = "None";
				}
				second_graph_discipline_dict[y] = (second_graph_discipline_dict[y] || 0) + 1;
			});
		}
		if (obj.CollaborativeGroup){
			$.each(obj.CollaborativeGroup, function(idx, y) { 
				y = y.trim();
				second_graph_collabgroup_dict[y] = (second_graph_collabgroup_dict[y] || 0) + 1;
			});
		}
		if (obj.LeadPI){
			$.each(obj.LeadPI, function(idx, y) { 
				y = y.trim();
				second_graph_leadpi_dict[y] = (second_graph_leadpi_dict[y] || 0) + 1;
			});
		}
		if (obj.Species){
			$.each(obj.Species, function(idx, y) { 
				y = y.trim();
				second_graph_species_dict[y] = (second_graph_species_dict[y] || 0) + 1;
			});
		}
		if (obj.PubMedID){
			$.each(obj.PubMedID, function(idx, y) { 
				y = y.trim();
				second_graph_pubmed_dict[y] = (second_graph_pubmed_dict[y] || 0) + 1;
			});
		}
	});
	console.log("HERE");
	console.log(second_graph_discipline_dict);
	$.each(second_graph_organ_dict, function(key, val) { 
		second_graph_organ[0].push(key);
		second_graph_organ[1].push(val);
	});
	$.each(second_graph_collabgroup_dict, function(key, val) { 
		second_graph_collabgroup[0].push(key);
		second_graph_collabgroup[1].push(val);
	});
	$.each(second_graph_leadpi_dict, function(key, val) { 
		second_graph_leadpi[0].push(key);
		second_graph_leadpi[1].push(val);
	});
	$.each(second_graph_discipline_dict, function(key, val) { 
		second_graph_discipline[0].push(key);
		second_graph_discipline[1].push(val);
	});
	
	
	init_labcas_data_distribution("organ_distribution", second_graph_organ);
	init_labcas_data_distribution("collabgroup_distribution", second_graph_collabgroup);
	init_labcas_data_boxplot("labcas_boxplot_distribution",second_graph_leadpi);
	init_labcas_data_distribution("labcas_discipline_distribution", second_graph_discipline);
	
}
function fill_datasets_analytics(data){
	var size = data.response.numFound;
	$("#datasets_len").html(size);
	
	var datadict = {};
	$.each(data.response.docs, function(key, obj) {
	  var collection = obj.CollectionName;
	  datadict[collection] = (datadict[collection] || 0) + 1;
	});
	
	var parentName = Cookies.get('environment').replace("https://","").replace(".jpl.nasa.gov","").split("-").join(" ").trim();
	var cl = [];
	var cdc = [];
	var cla = [];
	
	 //institution, organ, collabgroup, discipline, leadpi, species, pubmed
	var second_graph_institution = [[],[]];
	var second_graph_organ = [[],[]];
	var second_graph_collabgroup = [[],[]];
	var second_graph_discipline = [[],[]];
	var second_graph_leadpi = [[],[]];
	var second_graph_pubmed = [[],[]];
	
	var second_graph_institution_dict = {};
	var second_graph_organ_dict = {};
	var second_graph_collabgroup_dict = {};
	var second_graph_discipline_dict = {};
	var second_graph_leadpi_dict = {};
	var second_graph_pubmed_dict = {};
	
	console.log(collection_disc);
	$.each(datadict, function(key, obj) {
		cl.push(key);
		cla.push(key);
		cdc.push(obj);
		
		if ( key in collection_disc){
			//Institution
			$.each(collection_disc[key][0], function(idx, y) { 
				
				y = y.trim();
				if (!second_graph_institution_dict[y]) {
					second_graph_institution_dict[y] = [];
				}
				second_graph_institution_dict[y].push(datadict[key]);
			});
			//Organ
			$.each(collection_disc[key][1], function(idx, y) { 
				if (!second_graph_organ_dict[datadict[key]]) {
					second_graph_organ_dict[datadict[key]] = 0;
				}
				second_graph_organ_dict[datadict[key]] += y;
			});
			//Collab
			$.each(collection_disc[key][2], function(idx, y) { 
				if (!second_graph_collabgroup_dict[datadict[key]]) {
					second_graph_collabgroup_dict[datadict[key]] = 0;
				}
				second_graph_collabgroup_dict[datadict[key]] += y;
			});
			//Discipline
			$.each(collection_disc[key][3], function(idx, y) { 
				if (!second_graph_discipline_dict[datadict[key]]) {
					second_graph_discipline_dict[datadict[key]] = 0;
				}
				second_graph_discipline_dict[datadict[key]] += y;
			});
			//Lead PI
			$.each(collection_disc[key][4], function(idx, y) { 
				y = y.trim();
				if (!second_graph_leadpi_dict[y]) {
					second_graph_leadpi_dict[y] = [];
				}
				second_graph_leadpi_dict[y].push(datadict[key]);
			});
			//Pubmed
			$.each(collection_disc[key][5], function(idx, y) { 
				if (!second_graph_pubmed_dict[datadict[key]]) {
					second_graph_pubmed_dict[datadict[key]] = 0;
				}
				second_graph_pubmed_dict[datadict[key]] += y;
			});
		}
		
	});
	console.log("Second Dict2");
	console.log(second_graph_institution_dict);
	
	var score = {};
	for( var i=0,n=cdc.length; i<n; i++){
		var datum = cdc[i];
		if (!score[datum]) {
			score[datum] = [];
		}
		score[datum].push([cl[i],cla[i]]);
	}
	
	for( var key in keys=Object.keys(score).sort(function(a, b){return b-a}) ){
	  var prop = keys[key];
	  if (prop < 2){
	  	break;
	  }
	  for (var i=0; i<score[prop].length;i++){
		  collections.push(score[prop][i][0]);
		  collection_dataset_count.push(prop);
		  collection_labels.push(score[prop][i][1]);
	  }
	  
	  
	  console.log(prop, score[prop]);
	}
	
	init_labcas_sunburst_distribution(collections, collection_dataset_count);
	//init_labcas_data_boxplot(second_graph_institution_dict);
}
function fill_files_analytics(data){
	var size = data.response.numFound;
	
	$("#files_len").html(size);
}
function fill_favorites_analytics(){
	$("#favorites_len").html(user_data['FavoriteFiles'].length+user_data['FavoriteDatasets'].length+user_data['FavoriteCollections'].length);
}
function setup_labcas_analytics(){
    console.log("Analyzing...");
    //collection data
    
        console.log(Cookies.get('environment')+"/data-access-api/collections/select?q=*&wt=json&indent=true");
		$.ajax({
			url: Cookies.get('environment')+"/data-access-api/collections/select?q=*&wt=json&indent=true&rows=2147483647",	
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
			},
			type: 'GET',
			dataType: 'json',
			success: function (data) {
				fill_collections_analytics(data);
			
    
        
        	},
			error: function(){
				 alert("Login expired, please login...");
				 window.location.replace("/labcas-ui/application/pages/login.html");
			 }
		});
		
	//dataset data
		$.ajax({
			url: Cookies.get('environment')+"/data-access-api/datasets/select?q=*&wt=json&indent=true&rows=2147483647",
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token'));
			},
			type: 'GET',
			dataType: 'json',
			processData: false,
			success: function (data) {
				fill_datasets_analytics(data);
			},
			error: function(){
				 alert("Login expired, please login...");
				 window.location.replace("/labcas-ui/application/pages/login.html");
			 }
		});
    //files data
		$.ajax({
			url: Cookies.get('environment')+"/data-access-api/files/select?q=*&wt=json&indent=true",
			beforeSend: function(xhr, settings) { 
				xhr.setRequestHeader("Authorization", "Bearer " + Cookies.get('token')); 
			},
			type: 'GET',
            dataType: 'json',
			success: function (data) {
				fill_files_analytics(data);
			},
			error: function(){
				 alert("Login expired, please login...");
				 window.location.replace("/labcas-ui/application/pages/login.html");
			 
			 }
		});
		fill_favorites_analytics();
}