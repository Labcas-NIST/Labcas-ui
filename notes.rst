*******
 Notes
*******


Architectural notes coming soon
===============================

Assets
------
assets/conf contains json configuration files specific for each environment the 
labcas-ui 2.0 portal is deployed in. EDRN, MCL, and Labcas-dev are the three versions 
currently deployed which displays each consortium's relevant data within the portal. 
Configurations include base url links, sort/show/hide fields for each of the three 
hierarchical detail pages (collection, dataset, file), search filter fields, and 
collection specific filter fields.

assets/js/labcas contains labcas specific custom scripts that facilitates login, 
search, dashboarding, utils, and page generations.

App Folders
-----------

m: main page (list of collections)
c: collection detail page
d: dataset detail page
f: file detail page
s: search page
a: dashboard page
x: favorites/starred page
p: public collections page

Template
--------

templates.html contains divs with different ids that are pulled separately into different 
labcas pages. Pages use jquery load function to add div related content into functional
pages. Example is $('#{{id}}').load("{{file}} {{divid}}"); where id is div located where
content destination should go, file is the template html that contains template content,
and divid is subsection in template we want to pull content into destination.
