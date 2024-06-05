var submitted_before = false;
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

	localStorage.setItem("ml_wizard_selected_id",file_id);

        if (!submitted_before){
            $('#ml_submit').click(function() {
                alert("Nuclei Detection Submitted");
                const username = 'dliu';
                const password = 'asteroid-MINECRAFT-silk';
                const url = 'https://edrn-labcas.jpl.nasa.gov/mlserve/alphan/predict';
                const modelName = 'unet_default';
                const isExtractRegionprops = $('#csv_flag').is(':checked') ? 'True' : 'False';
                const window_size = $('input[name="winsize"]:checked').val();
                //const labcasId = 'MLOutputs/Outputs/test_image_with_cells.png';
                //const labcasId = file_id;
                const labcasId = localStorage.getItem("ml_wizard_selected_id");
                const formData = new FormData();
                const emptyBlob = new Blob([''], { type: 'image/png' });
                formData.append('input_image', emptyBlob, 'empty_image.png');

                // Set up the Fetch API call
                fetch(`${url}?model_name=${modelName}&is_extract_regionprops=${isExtractRegionprops}&window=${window_size}&labcas_id=${labcasId}`, {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Basic ' + btoa(username + ':' + password)
                  },
                  body: formData
                })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                  })
                  .then(data => {
                    var closeButton = document.createElement('button');
                    closeButton.textContent = 'Close';
                    closeButton.onclick = function () {
                      popupContainer.style.display = 'none';
                    };

                    // Add content to the popup container
                    popupContainer.innerHTML = '<b>Nuclei Detection results:</b> <br><hr>Get results at: ' + data["get results at"] + '<br><br>Check status at: ' + data["check status at"] + '<br><br>';

                    // Create a redirect button and add a click event listener
                    var redirectButton = document.createElement('input');
                    redirectButton.type = 'button';
                    redirectButton.value = 'Redirect';
                    redirectButton.onclick = function () {
                      window.location.replace(data["get results at"]);
                    };

                    // Append the redirect button and close button to the popup container
                    popupContainer.appendChild(redirectButton);
                    popupContainer.appendChild(closeButton);

                    // Display the popup container
                    popupContainer.style.display = 'block';


                  })
                  .catch(error => {
                    console.log(error);
                    popupContainer.innerHTML = "<B>Nuclei Detection results:</B> <br><hr>"+error+"<input style=input-group type=button value=Close>";
                    popupContainer.style.display = "block";

                  });
            });
            submitted_before = true;
        }
    }
    //multiple submission
    if(batch_flag == "multi"){


    }
}
