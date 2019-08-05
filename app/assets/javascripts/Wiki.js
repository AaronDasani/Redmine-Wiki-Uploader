
$(document).ready(function(){
    class WikiPage{
        id=0;
        title="";
        documents;
        attachments=[];
        error=false;
    }
    let projectName= "";
    let WikiPagesList=[]
    let allowedTypes=["application/vnd.openxmlformats-officedocument.wordprocessingml.document","text/plain"]

    $("section").hide().fadeIn(1000);

    $("#wikipages").on("click",".badge",function(e){
        e.preventDefault();
        $(this).next('div').slideToggle("slow");
    })

    // close note Modal
    $(".container").on("click",".ApiResponse a",(e)=>{
        $(".ApiResponse").children('div')[0].innerText=""
        $(e.target).parent().hide();
    })

    // Get the current value of the project name
    projectName=$("#projectName").val();

    // Get the DOM Elements of the drop area and put it in a variable for future use.
    let documentsDropArea = document.getElementById('documents-drop-area')
    // Add event listeners ["dragenter", "dragover", "dragleave", "drop"] and call certain function depending on the event listener.
    let events=  ["dragenter", "dragleave", "dragover", "drop"]
    events.forEach(function(eventName){
        // only one wiki drop area
        documentsDropArea.addEventListener(eventName, preventDefaults, false)
        // mulitple attachment dop area
        $("#wikipages").on(eventName,'.attachments-drop-area',function(event){
            event.preventDefault();
            event.stopPropagation();
            eventName==="dragenter"||eventName==="dragover"? highlight(event):unhighlight(event)
        })
        // Use Tenary Operators for the highlight and unhighlight functions
        documentsDropArea.addEventListener(eventName,(eventName==="dragenter"||eventName==="dragover"? highlight:unhighlight), false)
  
    })

    // What happen when a file is drop in file drop and attachment drop

    $('#documents-drop-area').on('drop',(e)=>{
        handleDocumentsDrop(e)
    })
    $(".container").on('change','.file-upload input',(e)=>{
        handleDocumentsDrop(e)
    })
    $("#wikipages").on('drop','.attachments-drop-area',(e)=>{
        handleAttachmentDrop(e,$(e.target).data('wiki_id'))
    })
    $("#wikipages").on('change','.attachments-drop-area input',(e)=>{
        handleAttachmentDrop(e,$(e.target).data('wiki_id'))
    })

    // EVENT FOR Changing the title of the wiki pages
    $("#wikipages").on("submit",".card-body form",(e)=>{
        handleTitleChange(e,$(e.target).data('wiki_id'));
        preventDefaults(e);
    })
    // Delete Wiki
    $("#wikipages").on('click','.card a',(e)=>{
        deleteWikiPage($(e.target).data('wiki_id'))
    })
    // Changing project name
    $("#projectName").change((e)=>{
        console.log(e.target.value)
        projectName=e.target.value;
    })
    // Submitting the Wiki Pages to the Server
    $(".submitBTN").click(()=>{handleSubmit()})
    // -------------------------END OF EVENT LISTENERS--------------------


    // Prevent page from reloading
    function preventDefaults (e) {
        e.preventDefault()
        e.stopPropagation()
    }

    // Highlight and UnHighlight functions are for front-end styling
    function highlight(e) {
        e.target.classList.add('highlight')

    }
    function unhighlight(e) {
        e.target.classList.remove('highlight')
    }


    function createWikiPagePreview(newWikiPages,updateWikiPreview=false){
  
        if(updateWikiPreview===true){$("#wikipages")[0].innerHTML=""}

        newWikiPages.forEach(wiki=>{
            let wikiContainer=""
            if(allowedTypes.indexOf(wiki.documents.type)<0)
            {
                wiki.error=true;
            }
            if (wiki.documents.type==="image/png" || wiki.documents.type==="image/jpeg") {
                let reader = new FileReader()
                reader.readAsDataURL(wiki.documents)
                reader.onloadend = function() {
                    // create image element
                    const img = document.createElement('img')
                    img.src = reader.result
                    img.classList.add('image','card-img')
                    wikiContainer=createWikiContainer(img,"imageContainer",wiki.id,wiki.documents.name,error=wiki.error)
                    $("#wikipages").append(wikiContainer)
                }
            }
            else{
                const paragraph=document.createElement('p')
                paragraph.innerText=wiki.documents.name
                paragraph.classList.add('filename','font-weight-light','card-img')
                wikiContainer=createWikiContainer(paragraph,"fileContainer",wiki.id,wiki.documents.name,error=wiki.error)
                $("#wikipages").append(wikiContainer)
            }
     
            if(wiki.attachments.length>0)
            {
                const AttachmentContainer= $("#wikipages").children().last().children().children().last().children().children(".AttachmentsContainer");
                createAttachmentPreview(wiki.attachments,AttachmentContainer,wiki.id)
            }
    
        })
        
    }

    function createAttachmentPreview(new_files,attachmentContainer,wikiID,attachmentUpdate=false){
        if(attachmentUpdate===true) {attachmentContainer[0].innerHTML="";}
        new_files.forEach(file=>{
            if (file.type==="image/png" || file.type==="image/jpeg") {
                let reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onloadend = function() {
                    // create image element
                    const img = document.createElement('img')
                    img.src = reader.result
                    img.classList.add('AttachmentImage')
                   
                    const FileContainer=createFileContainerElement(img,file.name,attachmentContainer,wikiID)
                    attachmentContainer.append(FileContainer)
                }
            }
            else{
                const paragraph=document.createElement('p')
                paragraph.innerText=file.name
                paragraph.classList.add('AttachmentFileName','font-weight-light','card-img')
                const FileContainer=createFileContainerElement(paragraph,file.name,attachmentContainer,wikiID)
                attachmentContainer.append(FileContainer)
            }
        })
        attachmentContainer.is(":hidden")&& attachmentContainer.slideToggle('slow');
    }

    // Handling Drop Filessss
    function handleDrop(event) {
        let previewFiles=[];
        try {
            let dt = event.originalEvent.dataTransfer
            let the_files = dt.files
            previewFiles = [...the_files]
        }  
        catch (TypeError) {
            try {
                previewFiles = [...event]  
            } catch (error) {
                previewFiles=[...event.originalEvent.target.files]
            }
        }
        
        return previewFiles
    }

        function handleAttachmentDrop(event,wikiID){
            let new_files=handleDrop(event)

            // This map function will go through the wiki page list,
            // and check which wikiPage to update with the new attahcments using the WikiId porvided in the parameter
            WikiPagesList.map(file=>{
                if(file.id===wikiID){
                    file.attachments=[...file.attachments,...new_files]
                }
            })
            // This is use for the front end side, meaning it displays the attachments in the respective wiki page container.
            const AttachmentContainer= $(event.target).parentsUntil('.row').next('div').children().children('.AttachmentsContainer');
            createAttachmentPreview(new_files,AttachmentContainer,wikiID)
        }
        function handleDocumentsDrop(event){
            let new_files=handleDrop(event)
            let newWikiPages=[]
            new_files.forEach(file=>{
                let wiki_page=new WikiPage();
                wiki_page.id=WikiPagesList.length+1;
                wiki_page.documents=file
                WikiPagesList.push(wiki_page);
                newWikiPages.push(wiki_page);

            })
            createWikiPagePreview(newWikiPages)
        }
        
    // If user wants to chnage the title of the Wiki Page
    function handleTitleChange(event,wikiID){
        for (let index = 0; index < WikiPagesList.length; index++) {
        if (WikiPagesList[index].id===wikiID){
                WikiPagesList[index].title=event.target.title.value
                break;
            }
            
        }
    }

    // Create an container element for the preview of the file
    function createFileContainerElement(childElement,fileName,attachementContainer,wikiID){
        // create file container element
        let fileContainer=document.createElement('div')
        fileContainer.classList.add('col-6')
        // Create  the delete button
        let deleteButton=document.createElement('a')
        deleteButton.innerText="x"
        deleteButton.classList.add('deleteBtn','attachmentDeleteBTN')
        deleteButton.addEventListener("click",()=>deleteFileAttachment(fileName,attachementContainer,wikiID),false)
    
        // put the delete element inside the file container
        fileContainer.appendChild(deleteButton)
        fileContainer.appendChild(childElement)
        return fileContainer;
    }

    // Delete a Wiki Page 
    function deleteWikiPage(wikiID){
        for (let i = 0; i < WikiPagesList.length; i++) {
            if( WikiPagesList[i].id===wikiID)
            {
                WikiPagesList.splice(i, 1);
                break;
            }
        }

        createWikiPagePreview(WikiPagesList,true)
        
    }
    // Delete an Attachment file 
    function deleteFileAttachment(fileName,attachementContainer,wikiID){

        for (let i = 0; i < WikiPagesList.length; i++) {
            if( WikiPagesList[i].id===wikiID)
            {
                for (let j = 0; j < WikiPagesList[i].attachments.length; j++) {
                    if( WikiPagesList[i].attachments[j].name===fileName)
                    {
                        WikiPagesList[i].attachments.splice(j, 1);
                        createAttachmentPreview(WikiPagesList[i].attachments,attachementContainer,wikiID,true)
                        break;
                    }
                }
                break;
            }
        }

        
    }

    function createWikiContainer(element, elementClassName, wikiID,title,error){
        const errorDiv= `
            <div class="extError"><div class="alert alert-danger" role="alert">
                Incorrect file extension.
            </div></div>`
        let container=`
            <div class="card mb-4 col-sm-12 col-md-8 col-lg-5 ml-4 p-0" >
                <a class="deleteBtn" data-wiki_id="${wikiID}">x</a>
                ${error?errorDiv:''}
                <div class="row no-gutters">
                    <div class=" col-sm-4 col-md-4">
                        <div class="${elementClassName}">
                            <div>
                                ${element.outerHTML}
                            </div>
                        </div>
                        <div>
                            <div class="drop-area p-1 pt-3 text-center font-weight-light attachments-drop-area" data-wiki_id="${wikiID}">
                                <p class="font-weight-light mb-5">Drag and drop attachment files</p>
                                <hr>
                                <small>
                                    <form class="my-form text-left">
                                        <div class="custom-file">
                                            <input type="file" multiple accept="*" data-wiki_id="${wikiID}" class="custom-file-input">
                                            <label class="custom-file-label font-weight-bold" for="customFile">Files..</label>
                                        </div>                            
                                    </form>
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-8 col-md-8 col-lg-8">
                        <div class="card-body">
                            <form class="form-row" data-wiki_id="${wikiID}"> 
                                <div class="col-9">
                                    <h5 class="card-title"><input type="text" name="title" class="form-control font-weight-bold" value=${title.replace(/ /g,'-').replace(/.docx/g,'')}></h5>
                                </div>
                                <div class="col-2">
                                    <button type="submit" class="btn btn-outline-info btn-sm">Change</button>
                                </div>
                            </form>
                            <span class="card-text font-weight-bold">Attachments</span>
                            <span class="badge badge-dark ml-2">Show</span>
                            <div class="AttachmentsContainer bg-dark row rounded" style="display:none;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return container;
    }



    //--------------------- Handle Submit of Wiki Pages--------------------------

    function handleSubmit()
    {
        let error=false;
        WikiPagesList.forEach(file=>{
          if(file.error){
            error=true;
            const errorResponse= `<p class='text-danger m-0'>${file.documents.name} is an invalid file extension</p>`
            $(".ApiResponse").children('div').append(errorResponse)
            $(".ApiResponse").show()
          }    
        })
        error!==true&& SubmitWiki()
        
    }

    function SubmitWiki(index=0){
        if (WikiPagesList.length===index) {
            return
        }
 
        wikiPage=WikiPagesList[index]
        let FilesFormData= new FormData();

        FilesFormData.append("files", wikiPage.documents)
        FilesFormData.append("title",wikiPage.title) 
        FilesFormData.append("projectName",projectName) 
        if (wikiPage.attachments.length > 0) {
            wikiPage.attachments.forEach(attachment=>{
                FilesFormData.append("attachments[]",attachment)
            })
        }else{
            FilesFormData.append("attachments",undefined) 
        }

        (WikiPagesList.length===index+1) && FilesFormData.append("lastItem",true)
        
        $.ajax({
            url: "/create",
            type: "post",
            enctype: 'multipart/form-data',
            processData: false,  // Important!
            contentType: false,
            cache: false,
            data: FilesFormData,
            success: function(response) {
                $(".ApiResponse").children('div').append(response.response)
                $(".ApiResponse").show()
                SubmitWiki(index+1);
            },
            error:function(error) {
                console.log(error)
            }
        })
    }
});