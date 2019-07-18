
require 'json'
require 'rest_client'
require 'uri' # for escaping page titles
require 'pandoc-ruby'
require 'docx/html'

# !!!!!Make sure to inlcude the Redmine API key and your own Redmine URL in the application_controller.rb file !!!!

class WikiController < ApplicationController
  @@table_of_content=""

  def index
    @@table_of_content.clear()
    @projects=["Testing","Absolute-Syteline-Migration","Vaction"]
  end

  def create
    file=params[:files]
    project_name=params[:projectName]
    file_url=file.tempfile.path
    file_extension=File.extname(file_url)
    file_content=""
    file_description = ""
    file_title = (params[:title]==""? File.basename(file.original_filename,file_extension): params[:title]).strip().tr('.','').tr(' ','-')

    # convert file and return the file content
    file_content=convertFile(file_extension,file_url);
    if file_content==false 
      render json: {:response=>"<small class='text-danger font-weight-bold'>#{file.original_filename} file should be either .txt or .docx format. If you need other file extension, contact IT Department</small>"}
      return
    end
   
    # The Complete Url
    wiki_url = "#{REDMINE_URL}/projects/#{project_name}/wiki/#{URI.escape(file_title)}.json?key=#{API_KEY}"
   
    # File Attachments
    file_Attachments=params[:attachments]
  
    # Sending different request to redmine rest api depending on file attachments
    if(file_Attachments!="undefined")
      uploadWiki_WithAttachment(wiki_url,project_name, file_content,file_title,file_Attachments,file_description)
    else
      uploadWiki(wiki_url,file_content,project_name,file_title)
    end

    # This is optional but it make the wiki page better in redmine, as it create a table to content with links to the other wiki pages.
    # That is good for better navigation. Also we calling this only once when all wiki pages are finished uploading.
    @@table_of_content+="\r\n\r\nh2. [[#{file_title}]]"
    params[:lastItem]&& UpdateWikiTableContent(project_name,@@table_of_content)

    render json: {:response=> "<small class='text-success font-weight-bold'>#{file.original_filename} Wiki Page was successfully created</small>"}
  end

  # Upload wiki with attacments
  def uploadWiki_WithAttachment(wiki_url,project_name, file_content,file_title, file_Attachments,file_description="no description")
    # Iterate through the file attachment array and open each file with 'rb' mode and sent the post request.
    file_Attachments.each do |file|
      file_name = File.basename(file.original_filename)
      begin
        # First we upload the image to get an attachment token
        response = RestClient.post(UPLOAD_URL, file.tempfile, {:multipart => true, :content_type => 'application/octet-stream' })
        
      rescue RestClient::UnprocessableEntity => ue
          p "The following exception typically means that the file size of '#{file_name}' exceeds the limit configured in Redmine."
          raise ue
      end
      token = JSON.parse(response)['upload']['token']
      begin
        response = RestClient.put(wiki_url, { :attachments => {
                                                :attachment1 => { # the hash key gets thrown away - name doesn't matter
                                                  :token => token,
                                                  :filename => file_name,
                                                  :description => file_description # optional
                                                }
                                              },
                                              :wiki_page => {
                                                :text => file_content # wiki_text # original wiki text
                                              }
                                            })
      rescue RestClient::BadGateway => bg
          p "The following exception typically means that the targeted wiki page is actually a redirection to another page."
          raise bg
      end
    
    end
    
  end
  # UPload a wiki page without attachment
  def uploadWiki(wiki_url,file_content,project_name,file_title)
    begin
      response = RestClient.put(wiki_url, { :wiki_page => {
                                              :text => file_content # wiki_text # original wiki text
                                            }
                                          })
    rescue RestClient::BadGateway => bg
        p "The following exception typically means that the targeted wiki page is actually a redirection to another page."
        raise bg

    end
  end
# Update the Table of content in the wiki 
  def UpdateWiki(wiki_url,file_content,version)
    response = RestClient.put(wiki_url, { :wiki_page => {
                                            :text => file_content, # wiki_text # original wiki text
                                            :version => version # wiki_text # original wiki text
                                          }
                                        })

    @@table_of_content.clear();
  end

  def convertFile(extension,file_url)
  
    # convert file differently depending on the file extension
    p file_url
    file_content=""
    if extension===".docx"
      # ---convert docx to html
      content = Docx::Document.open(file_url)
      # ---convert html to textile
      file_content=PandocRuby.convert(content.to_html, :from => :html, :to => :textile)
      file_content.gsub! '&#45;', '-'

    elsif extension===".txt"
      # Just read te plain text.. No conversion need to be done here. move along ...choo! choo!
      file_content=File.read(file_url)
    else
      return false
    end 
    return file_content

  end

  def UpdateWikiTableContent(projectName,wikiTitles)
    wiki_url = "#{REDMINE_URL}/projects/#{projectName}/wiki/Wiki.json?key=#{API_KEY}"

    RestClient.get(wiki_url){|response|
      case response.code
      when 200
        startPage=JSON.parse(response.body)
        wikiContent=startPage["wiki_page"]["text"]+ wikiTitles
        wikiVersion=startPage["wiki_page"]["version"]
        UpdateWiki(wiki_url,wikiContent,wikiVersion)
      when 404
        wikiContent="h1. Table of Content"+ wikiTitles
        UpdateWiki(wiki_url,wikiContent,1)
      when 409
        p "Error #{response.code}. Might be the version of the wiki you are trying to update."
      end
    }
  end

end
