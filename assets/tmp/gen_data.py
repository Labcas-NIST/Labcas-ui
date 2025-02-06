import json
import random
from datetime import datetime, timedelta

# Function to shift date
def shift_date(date_str, shift_days):
    date_format = "%m/%d/%y %H:%M %p"
    date = datetime.strptime(date_str, date_format)
    shifted_date = date + timedelta(days=shift_days)
    return shifted_date.strftime(date_format)

# Load data from the json file
with open('test-cell-line.json', 'r') as f:
    data = json.load(f)

cell_types = ["Jurkat","CHO-K1","293T"]


for cell in cell_types:
    # Add 5 more copies of the entire series
    new_data = []
    for i in range(1, 4):
        # Generate one random shift for each series
        shift_days = random.randint(5, 20)
        for entry in data:
            new_entry = entry.copy()
            
            # Shift the "EventDate" by the same random amount for each entry in the series
            new_entry['EventDate'] = shift_date(entry['EventDate'], shift_days)

            # Change the "MammalianCellCode" to append -1 to -5
            new_entry['MammalianCellCode'] = f"{entry['MammalianCellCode']}-{i}"
            new_entry['MammalianCellCode'] = new_entry['MammalianCellCode'].replace("Jurkat", cell)
            new_entry['ParentCellCode'] = cell

            new_data.append(new_entry)

    # Write the new data to a new json file
    with open(cell+'_new_data.json', 'w') as f:
        json.dump(new_data, f, indent=4)
