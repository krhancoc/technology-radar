# Dynamic Technology Radar API 
## An HTTP API Using Neo4J to drive the ThoughtWorks build-your-own-radar

Contributor & Maintainer: [Kenneth R Hancock](https://github.com/krhancoc)  
Contributor: [Mark Miller](https://github.com/momiller121)  


The project was created to be extend the technology radar and to facilitate participation, transparency and communication. Mark Miller acted as my Product Owner and was an incredible mentor to have during the process of learning of Node and HapiJS.

The purpose of this project is to create an API that interacts with the Neo4J graph database in relation to creating and building technology radars.  It increases the abilities of the Thoughtworks open source project [build-your-own-radar](https://github.com/thoughtworks/build-your-own-radar) by wrapping the project in its own API, this allows for a more fluid interaction with the radars.  The goal being to create a fully transparent Radar with one interface.


## Feature Toggling

When starting the server you can easily turn features on and off using the /radar/features path.

Feature toggling is apart of this project, features are tracked on requests by attaching cookies.  Current features that are toggleable are:
* **Login** - By turning off will use a default authentication method.
* **Profile** -- Turning on will allow for creation of blips, meetings, and publications through users profile screen.

## Note Before Running:
Please note that the application uses a .env file located on the server to pull things like the SALT used for creation of user hashes, the secret key use for decryption, and company name etc.  Your .env should look something like this:
```
NEO4J_INFO=http://[user]:[password]@[server]:7687
company='Sample Company'
salt=xXyOuRsWeEtSaLtXx
secretKey=secret
```

You can generate a salt by going into the Node REPL in the project root:

```js
const bcrypt = require('bcryptjs');

bcrypt.genSaltSync(10);

```

You can then just copy and paste that into your .env file

**Also please note that an admin user is not created when started**.  Just create a user using the create user functionality (this will create the hash and such for you) and then use NEOJ Interface to change the group properties of that user to group = "admin"  

`MATCH (n:PERSON) WHERE n.name = "SOME_USER" SET n.group = 'admin'`

## To Add Scraped Data

You will need to have the [APOC plugin](https://guides.neo4j.com/apoc) added to your plugins folder in NEO4J to load scraped data.

Because of the nature of NEO4J, it allows you to pull in data through csv but only from a server.  I did this by starting up a server in the test_resources folder using the http-server library.  Do not use the local host ip 127.0.0.1 as an argument to the restart.js function.  The data was the initial scrape of the Thoughtworks website, so if you'd like to fill it with their data you can just use the following

```sh

cd path/to/test_resources

http-server . 

# In seperate terminal

node restart.js <ip_address>:<port>
```
**NOTE**: Please note that this will delete all data on the server as well if the restart.js file is unchanged.

## Develop:

```sh
sudo npm install -g code mocha nodemon istanbul

git clone {REPO_LINK_HERE} ; cd technology-radar

npm install

npm test

nodemon -e js,pug,css app.js

```

## Run:

For the Neo4J database itself I just ran a Neo4J docker container. Using volumes to keep plugins and data persistent through different containers.

```sh
npm run dev
```

---

**Features:**

* Ability to create and store all components for the Thoughtworks Technology Radar, this includes objects such as blips, contributors, meetings, and publcations
* Feature toggling and an ability to add these toggles effectively
* JWT Authentication as a default
* Neo4J Backend Database 
* Blip view allows for a quick overlook on all the relationships that are attached to a blip.

---

## Outline of the Structure of the Database

Below I will outline the structure of the database that was created to fit the radar.  I wanted to explore graph databases which was the reason for choosing Neo4J.  Nodes will have some label, and also properties.  If you need more info on these definitions.  Please looks [here](https://neo4j.com/developer/guide-data-modeling/)

## Types of Nodes

### Blips
* **Label:** BLIP
* **Properties:**
    * name => Name of blip.
    * slug => Created upon creation of the blip, used for more url friendly names
    * ring => Ring this blip was proposed to have fallen into
    * quadrant => Quadrant this blip was proposed to have fallen into
    * support => Support level this blip received - calculated once published
    * description => HTML description of the blip. 
    * id => Assigned by the Neo4J Database.
    
### Contributors
* **Label:** PERSON 
* **Properties:**
    * displayName => First name concatenated with last name. (Ex. Kenneth Hancock)
    * name => Username used upon creation of user.
    * hash => Created upon user creation, used for authentication
    * group => Group that the user falls into.  Currently only empty or 'admin'. Please look at Groups section for more info.
    * id => Assigned by the Neo4J Database.
    
### Meetings
* **Label:** MEETING
* **Properties:**
    * date => Date the meeting was held.  Format - (YYYY-MM-DD)
    * id => Assigned by the Neo4J Database.
    
### Publications
* **Label:** PUBLICATION
* **Properties:**
    * date => Publication year and month of this publication. Format - (YYYY-MM)
    * publisher => Publishing company
    * id => Assigned by the Neo4J Database.
    
---    
    
## Types of Relationships

### Attended
* **Label:** Attended 
* **Description:** Used between a PERSON node to a MEETING node, to show that a person attended a meeting.
* **Properties:**
    * id => Assigned by the Neo4J Database.
    
### Contributed_to
* **Label:** Contributed_to
* **Description:**   Used between a MEETING node to a PUBLICATION node, to show which meetings contributed to a publication.
* **Properties:**
    * id => Assigned by the Neo4J Database.
    
### Proposed
* **Label:** Proposed 
* **Description:**  Used between a PERSON node to a BLIP node, to show who proposed which blip.
* **Properties**:
    * id => Assigned by the Neo4J Database.
    
### Proposed_at
* **Label:** Proposed_at
* **Description:** Used between a BLIP node to a MEETING node, to show which blip was proposed at which meeting.
* **Properties:** 
    * id => Assigned by the Neo4J Database.
    
### Published_to
* **Label:** Published_to
* **Description:** Used between a BLIP and a PUBLICATION node, to show which blip was published to a publication. 
* **Properties:**
    * id => Assigned by the Neo4J Database.
    
### Supports
* **Label:** Supports
* **Description:** Used between a PERSON node to a BLIP node, to show how much support a person has given a blip.
* **Properties:**
    * weight => weight of their support, between 0 and 5
    * id => Assigned by the Neo4J Database.
    
---

### Groups

Currently only one group available, when a user is created they are allowed to propose a blip at any point, give to support to any blip that currently is unassigned to a meeting. Standard users are not allowed to create meetings, and publications.
Currently the only way of setting an admin is through the Neo4J console.  Through some command like

`MATCH (n:PERSON) WHERE n.name = "SOME_USER" SET n.group = 'admin'`

**Admin**: Able to create publications, and meetings

---

### Feature Toggling

Featuring toggling is a something that was added to allow for quick integration of features into production.  To add a feature all that is needed is for the developer to add the feature to the bin/features.js file by appending to the static list within it.
Features are automatically collected into each route that is added.  
To test if a feature is active for example:  
```javascript
  if (request.pre.features['feature-name-here']) {
    ... 
  }
  ```

---

### Thoughts so far...

This being my first attempt at a project with HapiJS, I am happy with the outcome so far.  But want I to point out some things that I think I can improve over time.  

1. Testing, testing, testing.  I believe my testing is weaker, this is something I am actively trying to get better at.  Any contribution to this would be amazing. UNIT TESTS!
2. PreController.js restructuring - due to my vision on how this application should be structured changing I feel that a restructuring of the precontrollers file is needed, I feel some of the functions are confusing and erratic.
3. Better logging
4. Better error handling and error system. 

---

Still lots of stuff I want to add.  But hopefully by open sourcing it I can get suggestions of features others would like to see!  I'm really enjoying this project and hopefully there are others that can find value in a tool like this.

**Resources Used:** This project uses, [Materialize](http://materializecss.com/) for css structure, and the [HapiJS](https://hapijs.com/) framework. And base project inspired by [build-your-own-radar](https://github.com/thoughtworks/build-your-own-radar)!

