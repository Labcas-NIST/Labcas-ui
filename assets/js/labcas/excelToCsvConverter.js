document.getElementById('excelFileInput').addEventListener('change', function(event) {
    const files = event.target.files;
    const workbook = XLSX.utils.book_new(); // Initialize a new workbook

    const processFile = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const fileWorkbook = XLSX.read(data, { type: 'array' });
                const sheetName = "Compiled"; // Specify the sheet name to read
                if (!fileWorkbook.SheetNames.includes(sheetName)) {
                    throw new Error(`Sheet "${sheetName}" not found in file ${file.name}`);
                }
                const worksheet = fileWorkbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                //const coreData = jsonData.filter(item => item['Core Microbial']);
                //const cfuData = jsonData.filter(item => item['CFU']);
                //const impedanceData = jsonData.filter(item => item['ImpedanceFC']);
                //const fluorescenceData = jsonData.filter(item => item['FlorescenceFC']);
                
                validateDataAgainstSchema(jsonData, microbialCoreValidationSchema, file.name, 'Core Microbial');
                validateDataAgainstSchema(jsonData, microbialCFUValidationSchema, file.name, 'CFU');
                validateDataAgainstSchema(jsonData, microbialImpedanceValidationSchema, file.name, 'ImpedanceFC');
                validateDataAgainstSchema(jsonData, microbialFlourescenceFCValidationSchema, file.name, 'FlorescenceFC');
                
                const aoa = jsonToSheetData(jsonData);
                const outputWorksheet = XLSX.utils.aoa_to_sheet(aoa);
                XLSX.utils.book_append_sheet(workbook, outputWorksheet, file.name.replace('.xlsx', ''));

                resolve();
            } catch (error) {
                console.error("Error processing file:", file.name, error);
                reject(error);
            }
        };
        reader.onerror = () => {
            console.error("Error reading file:", file.name, reader.error);
            reject(reader.error);
        };
        reader.readAsArrayBuffer(file);
    });

    Promise.all(Array.from(files).map(file => processFile(file)))
        .then(() => createDownloadButton(workbook))
        .catch(error => console.error("Error processing files:", error));
});

function jsonToSheetData(jsonData) {
    const headers = Object.keys(jsonData.reduce((result, obj) => ({...result, ...obj}), {}));
    const data = jsonData.map(row => headers.map(header => row[header] || ''));
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
    if(workbook.SheetNames.length === 0) {
        console.error("Workbook is empty. No sheets to download.");
        alert("Workbook is empty. No sheets to download.");
        return;
    }

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn-success m-2';
    downloadBtn.textContent = 'Download Excel';
    downloadBtn.onclick = () => XLSX.writeFile(workbook, 'Combined_Metadata.xlsx');
    document.getElementById('downloadButtonsContainer').appendChild(downloadBtn);
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
        }
        else {
            items[newKey.replace(/LabCAS-/g,"")] = d[k];
        }
    });
    return items;
}

function validateDataAgainstSchema(data, schema, filename, type) {
    let errorGroups = {};
    let warningGroups = {};

    data.forEach((row, rowIndex) => {
        Object.keys(schema).forEach((key) => {
            const value = row[key];
            const rules = schema[key];
            const lineNumber = rowIndex + 2;

            // Required field validation
            if (rules.required && (value === undefined || value === '')) {
                const errorMsg = `${key} is required.`;
                if (!errorGroups[errorMsg]) {
                    errorGroups[errorMsg] = { key, filename, type, lines: [] };
                }
                errorGroups[errorMsg].lines.push(lineNumber);
            }

            // Data type validation (simplified example)
            if (value !== undefined && rules.dataType === 'numeric' && isNaN(Number(value))) {
                const errorMsg = `${key} should be a number.`;
                if (!errorGroups[errorMsg]) {
                    errorGroups[errorMsg] = { key, filename, type, lines: [] };
                }
                errorGroups[errorMsg].lines.push(lineNumber);
            }

            // Permissible values validation
            if (value !== undefined && rules.permissibleValues.length > 0 && !rules.permissibleValues.includes(value)) {
                if (value.includes(";")) {
                    value.split(";").forEach(element => {
                        const ele = element.trim();
                        const warningMsg = `${key} value "${ele}" is not in the list of permissible values.`;
                        if (!warningGroups[warningMsg]) {
                            warningGroups[warningMsg] = { key, filename, type, lines: [] };
                        }
                        warningGroups[warningMsg].lines.push(lineNumber);
                    });
                } else {
                    const warningMsg = `${key} value "${value}" is not in the list of permissible values.`;
                    if (!warningGroups[warningMsg]) {
                        warningGroups[warningMsg] = { key, filename, type, lines: [] };
                    }
                    warningGroups[warningMsg].lines.push(lineNumber);
                }
            }
        });
    });

    const formatLines = (lines) => {
        let ranges = [];
        let start = null;
        for (let i = 0; i < lines.length; i++) {
            if (start === null) {
                start = lines[i];
            }
            if (lines[i + 1] !== lines[i] + 1) {
                if (start === lines[i]) {
                    ranges.push(start.toString());
                } else {
                    ranges.push(`${start}-${lines[i]}`);
                }
                start = null;
            }
        }
        return ranges.join(', ');
    };

    Object.keys(errorGroups).forEach(errorMsg => {
        const { key, filename, type, lines } = errorGroups[errorMsg];
        showValidationError(
            `<b>&bull; ${filename} (${type})</b>: ${key} error on lines ${formatLines(lines)} - ${errorMsg}`
        );
    });

    Object.keys(warningGroups).forEach(warningMsg => {
        const { key, filename, type, lines } = warningGroups[warningMsg];
        showValidationWarning(
            `<b>&bull; ${filename} (${type})</b>: ${key} warning on lines ${formatLines(lines)} - ${warningMsg}`
        );
    });
}

const microbialCoreValidationSchema = {
    MicrobialMaterialID: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Cell material used in experiment as named in the eLabFTW database (linked item)'
    },
    InstrumentID: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Instrument short name (linked item)'
    },
    OperatorID: {
        required: true,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Experiment operator name (linked item)'
    },
    ProjectID: {
        required: true,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Name of project that experiment supports. eLab linked item'
    },
    DataAcquisitionDate: {
        required: false,
        dataType: 'date',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Date on which data were acquired according to eLabFTW record'
    },
    eLabsProtocolID: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'A UID generated for an eLabs record'
    },
    SamplePurposeCodes: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Generic types of controls contained in the dataset'
    },
    IncubationDuration: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Time in hours that cells were incubated during an experiment'
    },
    IncubationTemperature: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Temperature (in oC) that cells were incubated in during an experiment'
    },
    IncubationAgitation: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Speed of agitation that cells were incubated during an experiment'
    },
    IncubationAtmosphere: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Atmosphere that cells were incubated during an experiment'
    },
    GrowthMediaName: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Name of media used to culture cells (linked item)'
    },
    KitLotNumber: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'A specific kit used in protocol. eLab linked item'
    },
    FluorescentProbe: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T', // This will show selectively based on your logic
        explanatoryNote: 'Fluorescent probe used in experiment. (linked item)'
    },
    FixationMethod: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Specific treatment applied to cells to prevent future changes'
    },
    CoreDataPath: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Portion of the data pathway that will not change as the template is used to generate experimental records'
    },
    SpecificDataPath: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Portion of the data pathway specific to data from a given experimental record'
    },
    TemplateName: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Read-only field used to indicate which template was used'
    }
};
const microbialCFUValidationSchema = {
    CFUMethod: {
        required: false,
        dataType: 'string',
        permissibleValues: ["Plate", "Drip", "Spiral Plater", "Other"],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Format of microbial CFU assay performed'
    }
};
const microbialImpedanceValidationSchema = {
    CoulterAperature: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Size (in um) of aperature used in Coulter counter experiment'
    }
};
const microbialFlourescenceFCValidationSchema = {
    FCFlowRateSetting: {
        required: false,
        dataType: 'string', // 'Free text' implies a string data type
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Set flow rate of sample acquisition on flow cytometer'
    },
    FCAcquisitionThresholdValue: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'Threshold value in arbitrary units that defines the lower limit of data acquisition in flow cytometry'
    },
    FCAcquisitionThresholdChannel: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: 'T',
        explanatoryNote: 'The channel (as named by the manufacturer) used to threshold the data acquisition'
    },
    FCInjectionMode: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Sample acquisition format in flow cytometer'
    },
    FCAcquisitionTime: {
        required: false,
        dataType: 'numeric',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Real time duration of file acquisition in seconds'
    },
    FCFluorescentChannels: {
        required: false,
        dataType: 'string',
        permissibleValues: [],
        fileLevelColumnDisplay: '',
        explanatoryNote: 'Channels of the flow cytometer used to record data'
    }
};
