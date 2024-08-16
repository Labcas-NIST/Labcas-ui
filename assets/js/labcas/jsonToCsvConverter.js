document.getElementById('jsonFileInput').addEventListener('change', function(event) {
    /*const files = event.target.files;
    Array.from(files).forEach(file => {
        const fileReader = new FileReader();
        fileReader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            const filteredData = filterRelevantInfo(data); // Assuming the JSON structure is an array
            const flattenedData = filteredData.map(item => flattenDict(item));
            const csvData = generateCsv(flattenedData);
            createDownloadButton(csvData, file.name.replace('.json', '.csv'));
        };
        fileReader.readAsText(file);
    });*/
    const files = event.target.files;
    const workbook = XLSX.utils.book_new(); // Initialize a new workbook

    // Modified to return a Promise that resolves once the file is processed
    const processFile = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
        const filteredData = filterRelevantInfo(data);
        const flattenedData = filteredData.map(item => flattenDict(item));
        console.log("flattenedData1");
        console.log(flattenedData);
        //check instrument type
        if (flattenedData.length > 0 && Object.keys(flattenedData[0]).includes("Instrument")){
                console.log("HEREHERE");
            if (flattenedData[0]["Instrument"].includes("CytoFLEX")){
                validateDataAgainstSchema(flattenedData, microbialFlourescenceFCValidationSchema, file.name);
            }else if(flattenedData[0]["Instrument"].includes("Manual")){
                validateDataAgainstSchema(flattenedData, microbialCFUValidationSchema, file.name);
            }else{
                validateDataAgainstSchema(flattenedData, microbialCoreValidationSchema, file.name);
            }
        }
        // Convert the flattened data directly to a worksheet format expected by SheetJS
        const aoa = jsonToSheetData(flattenedData);
        const worksheet = XLSX.utils.aoa_to_sheet(aoa);
        XLSX.utils.book_append_sheet(workbook, worksheet, file.name.replace('.json', '').replace('.csv', ''));

        resolve();
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });

    // Wait for all files to be processed, then create the download button
    Promise.all(Array.from(files).map(file => processFile(file)))
        .then(() => createDownloadButton(workbook))
        .catch(error => console.error("Error processing files:", error));
});
function jsonToSheetData(jsonData) {
    // Assuming jsonData is an array of objects
    const headers = Object.keys(jsonData.reduce((result, obj) => ({...result, ...obj}), {}));
    const data = jsonData.map(row => headers.map(header => row[header] || ''));

    // Prepend headers at the start of the data array
    return [headers, ...data];
}

function showValidationError(message) {
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert.innerHTML.length > 0) {
        errorAlert.innerHTML += "<br>" + message;
    } else {
        errorAlert.innerHTML = message;
    }
    errorAlert.style.display = 'block'; // Show the alert
}

function showValidationWarning(message) {
    const warningAlert = document.getElementById('warningAlert');
    if (warningAlert.innerHTML.length > 0) {
        warningAlert.innerHTML += "<br>" + message;
    } else {
        warningAlert.innerHTML = message;
    }
    warningAlert.style.display = 'block'; // Show the alert
}

function createDownloadButton(workbook) {
/*function createDownloadButton(csvData, fileName) {
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn-success btn-download m-2'; // Bootstrap classes with margin
    downloadBtn.textContent = `Download ${fileName}`;
    downloadBtn.addEventListener('click', () => {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    document.getElementById('downloadButtonsContainer').appendChild(downloadBtn);
    */
    if(workbook.SheetNames.includes('Sheet1')){
        delete workbook.Sheets['Sheet1'];
        workbook.SheetNames = workbook.SheetNames.filter(name => name !== 'Sheet1');
    }

    // Create a download button for the workbook
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn-success m-2';
    downloadBtn.textContent = 'Download Excel';
    downloadBtn.onclick = () => XLSX.writeFile(workbook, 'Metadata.xlsx');
    document.getElementById('downloadButtonsContainer').appendChild(downloadBtn);
}

function filterRelevantInfo(data) {
    const relevantKeys = [
        "title", "items_links", "fullname", "firstname", "lastname",
        "metadata", "uploads", "real_name",
        "LabCAS-Project", "LabCAS-Operator", "LabCAS-Instrument", "LabCAS-DataAcquisitionDate","LabCAS-ManufacturedMaterialID1","MicrobialMaterialID","FileName","DataCustodianName","DataCustodianEmail","Discipline","DataCategory","ManufacturedMaterialID","DataAcquisitionDate","ErrorFlag","SamplePurposeCodes","IncubationDuration","IncubationTemperature","IncubationAgitation","IncubationAtmosphere","GrowthDuration","BeadLotNumber","QCReagentLotNumber","BactoBoxDiluentName","BactoBoxDiluentVolume","BactoBoxCellVolume","CFUMethod","CellVolume","CoulterAcquisitionVolume","CoulterApertureSize","CoulterDiluentName","CoulterDiluentVolume","CoulterCellVolume","FCFlowRateSetting","FCAcquisitionTime","FCAcquisitionThresholdValue","FCAcquisitionThresholdChannel","FluorescentProbe","FCDiluentName","FCDiluentVolume","FCCellVolume","FCInjectionMode","FCFluorescentChannels","extra_fields"
    ];

    function deepFilter(data) {
        if (Array.isArray(data)) {
            return data.map(item => deepFilter(item));
        } else if (typeof data === 'object' && data !== null) {
            const filtered = {};
            Object.keys(data).forEach(key => {
                if (relevantKeys.includes(key) || key === 'metadata' || key === 'extra_fields') {
                    if (typeof data[key] === 'object' && key !== 'extra_fields') {
                        filtered[key] = deepFilter(data[key]);
                    } else if (key === 'extra_fields') {
                        // Special handling for extra_fields to capture all nested key-value pairs
                        filtered[key] = Object.keys(data[key]).reduce((acc, k) => {
                            const value = data[key][k].value;
                            // Check if the value is an array and convert it to a comma-separated string
                            acc[k] = Array.isArray(value) ? value.join("; ") : value;
                            return acc;
                        }, {});
                    } else {
                        filtered[key] = Array.isArray(data[key]) ? data[key].join("; ") : data[key];
                    }
                }
            });
            return filtered;
        } else {
            return data;
        }
    }

    return deepFilter(data);
}

function flattenDict(d, parentKey = '', sep = '_') {
    let items = {};
    Object.keys(d).forEach(k => {
        let newKey = k;
        if (typeof d[k] === 'object' && !Array.isArray(d[k]) && d[k] !== null) {
            Object.assign(items, flattenDict(d[k], newKey, sep));
        } else if (Array.isArray(d[k])) {
            d[k].forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                    Object.assign(items, flattenDict(item, `${index}`, sep));
                } else {
                    items[`${index}`] = item.toString();
                }
            });
        } else {
            items[newKey.replace(/LabCAS-/g,"")] = d[k];
        }
    });
    return items;
}


function generateCsv(data) {
    let csvContent = "";
    const headers = Object.keys(data.reduce((result, obj) => Object.assign(result, obj), {}));
    csvContent += headers.join(",") + "\r\n";

    data.forEach(row => {
        let rowData = headers.map(header => {
            if (row[header] !== undefined) {
                return `"${row[header].toString().replace(/"/g, '""')}"`; // Handle internal quotes
            }
            return "";
        }).join(",");
        csvContent += rowData + "\r\n";
    });

    return csvContent;
}


function enableDownloadButton(csvData) {
    const downloadBtn = document.getElementById('downloadCsvBtn');
    downloadBtn.style.display = 'block';
    downloadBtn.addEventListener('click', () => downloadCsv(csvData));
}

function downloadCsv(csvData) {
    // Create a Blob with the CSV data and trigger the download
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'filtered_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function validateDataAgainstSchema(data, schema, filename) {
    let errors = [];
    let warnings = [];

    // Iterate over each row of data
    data.forEach((row, rowIndex) => {
        // Iterate over each field in the schema
        Object.keys(schema).forEach((key) => {
            const value = row[key];
            const rules = schema[key];

            // Required field validation
            if (rules.required && (value === undefined || value === '')) {
                errors.push(`<b>&bull;${filename}</b>: ${key} is required.`);
            }

            // Data type validation (simplified example)
            if (value !== undefined && rules.dataType === 'numeric' && isNaN(Number(value))) {
                errors.push(`<b>&bull;${filename}</b>: ${key} should be a number.`);
            }

            // Permissible values validation
            if (value !== undefined && rules.permissibleValues.length > 0 && !rules.permissibleValues.includes(value)) {
                if (value.includes(";")){
                    value.split(";").forEach(element => {
                        var ele = element.trim();
                        if (!rules.permissibleValues.map(value => value.toLowerCase()).includes(ele.toLowerCase())){
                            warnings.push(`<b>&bull;${filename}</b>: ${key} value "${ele}" is not in the list of permissible values.`);
                        }
                    });
                }else{
                    warnings.push(`<b>&bull;${filename}</b>: ${key} value "${value}" is not in the list of permissible values.`);
                }
            }

            // Add more validations as needed...
        });
    });

    errors.forEach(errorMsg => {
        showValidationError(errorMsg);
    });
    warnings.forEach(warningMsg => {
        showValidationWarning(warningMsg);
    });
}

const microbialCoreValidationSchema = {
    MicrobialMaterialID: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLabs, "LabCAS-NISTStrainID" with appended numbers'
    },
    InstrumentID: {
        required: true,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLabs, "LabCAS-Instrument"'
    },
    OperatorID: {
        required: true,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLabs, "LabCAS-Operator"'
    },
    ProjectID: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLabs, "LabCAS-Project"'
    },
    DataAcquisitionDate: {
        required: false,
        dataType: 'date',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLabs, "LabCAS-DataAcquisitionDate"'
    },
    eLabsProtocolID: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'F',
        explanatoryNote: 'eLabs generated'
    },
    ErrorFlag: {
        required: false,
        dataType: 'string',
        permissibleValues: ["No Error Noted", "Potential Error Noted", "Error Noted"],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Manual entry, eLab "ErrorFlag"'
    },
    ErrorDescription: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'F',
        explanatoryNote: 'Manual entry'
    },
    SamplePurposeCodes: {
        required: true,
        dataType: 'string',
        permissibleValues: [
            "Positive Control", "Negative Control", "Reference Cell",
            "Reference Fluorescence", "Reference Scattering", "Reference Size",
            "Reference Concentration", "Buffer", "QC Bead", "Compensation Control",
            "Test", "Other"
        ],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Manual entry, eLab "SamplePurposeCodes"'
    },
    BiologicalReplicateNumber: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'File name or Manual entry'
    },
    SampleReplicateNumber: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'File name or Manual entry'
    },
    ObservationReplicateNumber: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'File name or Manual entry'
    },
    IncubationDuration: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLab, "IncubationDuration"'
    },
    IncubationTemperature: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLab, "IncubationTemperature"'
    },
    IncubationAgitation: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: '"IncubationAgitation"'
    },
    IncubationAtmosphere: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLab, "IncubationAtmosphere"'
    },
    GrowthMediaName: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLab, "GrowthMediaName"'
    },
    GrowthDuration: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLab, "GrowthDuration"'
    },
    KitLotNumber: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLab, "KitLotNumber"'
    },
    BeadLotNumber_FluorescenceQC: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLab, "BeadLotNumber_FluorescenceQC"'
    },
    BeadLotNumber_ConcentrationQC: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLab, "BeadLotNumber_ConcentrationQC"'
    },
    BeadLotNumber_SizeQC: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLab, "BeadLotNumber_SizeQC"'
    },
    QCReagentLotNumber: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLab, "QCReagentLotNumber"'
    },
    Remark: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Manual entry'
    },
    DiluentVolume: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLab, "DiluentVolume"'
    },
    CellVolume: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLab, "CellVolume"'
    },
    DiluentName: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLab, "DiluentName"'
    },
    FluorescentProbe: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLabs, "FluorescentProbe", may be multiple'
    }
};
const microbialCFUValidationSchema = {
    CFUMethod: {
        required: false,
        dataType: 'string',
        permissibleValues: ["Plate", "Drip", "Spiral Plater", "Other"],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLab, "CFUMethod"'
    }
};
const microbialImpedanceValidationSchema = {
    CoulterAcquisitionTime: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [], // Empty array indicates no specific permissible values
        fileLevelColumnDisplay: '', // Not specified, assuming not necessary to display at file level
        explanatoryNote: 'eLabs, "CoulterAcquisitionTime"'
    },
    CoulterAcquisitionVolume: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T', // Indicates this field should be displayed at the file level
        explanatoryNote: 'eLabs, "CoulterAcquisitionVolume"'
    },
    CoulterApertureSize: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T', // Indicates this field should be displayed at the file level
        explanatoryNote: 'eLabs, "CoulterApertureSize"'
    }
};
const microbialFlourescenceFCValidationSchema = {
    FCFlowRateSetting: {
        required: false,
        dataType: 'string', // 'Free text' implies a string data type
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLabs, "FCFlowRateSetting"'
    },
    FCAcquisitionTime: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLabs, "FCAcquisitionTime"'
    },
    FCAcquisitionCountTarget: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLabs, "FCAcquisitionCountTarget"'
    },
    FCAcquisitionThresholdValue: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLabs, "FCAcquisitionThresholdValue"'
    },
    FCAcquisitionThresholdChannel: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLabs, "FCAcquisitionThresholdChannel"'
    },
    FCInjectionMode: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLabs, "FCInjectionMode"'
    },
    FCFluorescentChannels: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'eLabs, "FCFluorescentChannels"'
    },
    MoFloNozzleSize: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLabs, "MoFloNozzleSize"'
    },
    MoFloDropDelay: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLabs, "MoFloDropDelay"'
    },
    MoFloDropFrequency: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'eLabs, "MoFloDropFrequency"'
    }
};


