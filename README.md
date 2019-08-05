# README
# Even though It is a Redmine App, It can be Intergrate in any program or any app that require a file conversion and an awesome Aaron Design.

<sup>*How?*</sup> 
<sup>Because Modularization is awesome and because it is very simple at its core. ! Explain more at the end of the file !<sup>
#
## HOW IT WORK?
###  Front-End:

You drag and drop any amount of files in the drop&drop box. Each files will create a beautiful looking div selector with a .card class (Bootstrap class).

The card will contain the file name, an input to change the file name (just because), another drag and drop feature inside it so you can upload attachments to the file. The attachments can be images and other document files. 
#### *You will also get a PREVIEW of the attached images and the documents*

#### Note: This app ONLY ACCEPT  .docx files and .txt files. 
* If you want more file extension in can be easily implemented by going in TWO files.
    * Javascript file: Go to the Wiki.js file located in the *'app/assets/javascript'* and add the file type in the "allowedTypes array" (can be found on top of the JS file).

            let allowedTypes=["application/vnd.openxmlformats-officedocument.wordprocessingml.document","text/plain"]

    * Ruby file: Go to the wiki_controller.rb located in *'app/assets/controllers'* and go to the convertFile function and implement the functionality to convert that file type.

*The reason you need to change two files is because I added a two layer protection ( sort of ). One in the front-end and one in the back-end, because of a simple reason... I DON'T TRUST THE USER  :)*

###  Back-End:
* The controller expect an array of wikiPages.
* One wikiPage in the array is a class that have been created  in the front-end side.

        class WikiPage{
            id=0;
            title="";
            documents;
            attachments=[];
            error=false;
        }

* From there the program check for the file extension and convert the file to a string and proceed if everything goes fine.
* Then it goes to the uploadWiki function that upload the file to redmine using rest-client gem, the api key and the redmine url.
*  After the wiki Page has been created the program also update the start page of your redmine wiki.

* #### I made the start page a Table of Content, So It automatically create a link for you to the newly uploaded wiki page.

# Aaron ADDED GEMS
This is the Gems I added

    gem 'rest-client', '~> 2.1.0.rc1'
    gem 'pandoc-ruby', '~> 2.0', '>= 2.0.2'
    gem 'rubyzip', '~> 1.2', '>= 1.2.3'

# Front-end Dependencies
    Bootstrap cdn (current version-2019)
    JQuery cdn (current version-2019)

# Configuration
* You need a Redmine API Key and of course Redmine install somehwere in your server.
* You will also need your Redmine URL for the rest api.

#### The information should be included in the application_controller.rb which can be found in the *'app/assets/controllers'*

# Integration To Other Frameworks


Whatever framework you are using the code would be ALMOST the same as you would just need to change the ruby code to the language you are using (which is not hard at all) and the jQuery file would be the same as it is Javascript and as far as I know every framework support Javascript code. 

The only time we are using Ruby is in the controller. And the framework that you would be using have their own controller (MVC framework). 

So the controller is just getting the data from the front-end, in our case it would be the array of wikiPages. 

So just have to change from ruby to the desired coding language and change the rest api code to the specfification of the company you are posting data to. BOOM that's it, I think.... :)