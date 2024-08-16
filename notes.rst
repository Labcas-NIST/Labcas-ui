# Architectural notes coming soon

*******
 Notes
*******

## 📀 Software Environment

Since this software is purely a client UI built to interface with a Solr backend, it's written in HTML, CSS, and Jquery hosted in a apache server.



Architectural notes
===============================

Architecture
------------

Labcas-ui front end: Front end reaches out to labcas-backend in order to authenticate,
query solr, CRUD operations on user profile data (favorites, saved searches, KSDB data), 
and build statistical analytics. Labcas-ui is hosted on apache2 webserver separate from
the labcas-backend in order to ensure decoupled scalability between the two concurrent
services. Finally, labcas-ui utilizes localStorage sessions primarily to store
user session data, only syncing with labcas-backend as needed.

Labcas-backend: manages JWT token for front end session management, solr database for 
metadata interoperation, and filemgr for hosting/downloading/exposing files.
Labcas-backend is built in java and utilizes tomcat to deploy filemgr, data-access-api, and solr allowing
api-based front-end interactions.

KSDB: Knowledge System Database is utilized to capture collection, dataset, and file
level metadata in a structured and ontology driven way. Metadata from KSDB is then
associated with data in Labcas to provide additional semantically linked annotations.
KSDB is built in python/django and is hosted using wsgi+gunicorn with exposed APIs.

Assets
------
assets/conf contains json configuration files specific for each environment the 
labcas-ui 2.1 portal is deployed in. EDRN, MCL, and Labcas-dev are the three versions 
currently deployed which displays each consortium's relevant data within the portal. 
Configurations include base url links, sort/show/hide fields for each of the three 
hierarchical detail pages (collection, dataset, file), search filter fields, and 
collection specific filter fields.

assets/js/labcas contains labcas specific custom scripts that facilitates login, 
search, dashboarding, utils, and page generations.

## What do the page folders represent

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
