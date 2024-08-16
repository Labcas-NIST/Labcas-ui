//ML code
function init_ml_wizard(dataset_id){

    var ml_collections = localStorage.getItem("ml_enabled_collections");
    var ml_collections_split = ml_collections.split(",");
    for (i = 0; i < ml_collections_split.length; i++) {
        if (dataset_id.includes(ml_collections_split[i])){
        console.log("WIZARD23");
            $( "#ml_wizard_template" ).load("/labcas-ui/templates.html #ml_wizard_template");
            break;
        }
    }
    
}

function submit_ml_file(file_id, batch_flag){
    //single submission
    if(batch_flag == "single"){
        console.log("OK");
        $('#ml_wizard_HTML').html(localStorage.getItem("ml_wizard_html"));
        var ml_wizard_options = localStorage.getItem("ml_wizard_options");
        var first_selected = "";
        $.each(ml_wizard_options.split(","), function (i, item) {
            var ml_option = item.split("|");
            $('#ml_pipeline_select').append($('<option>', { 
                value: ml_option[0],
                text : ml_option[1]
            }));
            if (i == 0){
                first_selected = ml_option[0];
            }
        });
        $('#wizard_options').html(localStorage.getItem(first_selected));
        $('#mlWizardModal').modal('show');

    }
    //multiple submission
    if(batch_flag == "multi"){


    }
}
