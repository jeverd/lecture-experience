import { TOOL_CIRCLE, TOOL_LINE, 
    TOOL_BRUSH, TOOL_ERASER, 
    TOOL_PAINT_BUCKET, TOOL_PENCIL, 
    TOOL_SQUARE, TOOL_TRIANGLE } from './tools.js'; 
import Whiteboard from './whiteboard.class.js';


window.onload = () => {
    let peer = new Peer();
    let calls = [];
    const url = window.location.pathname;
    const last_slash = url.lastIndexOf('/');
    const manager_id = url.substr(last_slash + 1);
    const messageContainer = document.getElementById("message-container");
    const sendContainer = document.getElementById("send-container");
    const messageInput = document.getElementById("message-input");

    peer.on('open', () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(startLecture)
    })

    function startLecture(stream){
        let whiteboard = new Whiteboard("canvas");
        stream.addTrack(whiteboard.getStream(30).getTracks()[0])
        let socket = io('/', { query: `id=${manager_id}` });
        socket.on('call', remote_peer_id => {
            let call = peer.call(remote_peer_id, stream)
            calls.push(call)
        });

        socket.on('updateNumOfStudents', num => {
            document.getElementById('specs').innerHTML = num
        });

        socket.on('attemptToConnectMultipleManagers', () => {
            stream.getTracks().forEach(function (track) {
                track.stop();
            });
            alert('There is already a manager')
        });

        socket.on('send-to-manager', message => {
            console.log(message);
            appendMessage(`Student: ${message}`);
        })

        socket.on('ready', room => {
            whiteboard.initialize();
            let firstNonActiveBoard = $('#first-board')
            firstNonActiveBoard.click(onClickNonActiveBoardElem)

            const { boards, boardActive } = room.lecture_details
            if(boards.length > 0){
                boards.forEach((boardImg, i) => {
                    createNonActiveBoardElem(boardImg, i === boardActive)
                })
            }else{
                firstNonActiveBoard.addClass('active')
            }

            let sharable_url = window.location.href
            sharable_url = sharable_url.substr(0, sharable_url.lastIndexOf('/') + 1)
            sharable_url += room.lecture_details.id
            document.getElementById("copy-share-link").addEventListener('click', e=>{
                let tmp_input = document.createElement('input');
                tmp_input.value = sharable_url;
                document.body.appendChild(tmp_input);
                tmp_input.select()
                document.execCommand("copy");
                document.body.removeChild(tmp_input);
            })

            sendContainer.addEventListener("submit", (e) => {
                e.preventDefault();
            
                const message = messageInput.value;
                appendMessage(`You: ${message}`);
                socket.emit("send-to-guests", room.lecture_details.id, message);
                messageInput.value = "";
            });

            // On click for display messages button
            document.querySelector("button#toggle-messages").addEventListener('click', e => {
                e.preventDefault();
                // If we want to include multiple separate chat windows, this is an easy way of doing that
                const messagesChild = e.target.nextElementSibling;
                e.target.classList.toggle("active");
                if (messagesChild.style.maxHeight) {
                    messagesChild.style.maxHeight = null;
                } else {
                    if (messagesChild.scrollHeight >= 300) {
                        messagesChild.style.maxHeight = "300px";
                        messagesChild.style.overflow = "scroll";
                    } else {
                        messagesChild.style.maxHeight = messagesChild.scrollHeight + "px";
                    }
                }
            })

            // Refresh the chat window for the new message
            document.querySelector("button#toggle-messages").addEventListener('redraw', e => {
                e.preventDefault();

                const messagesChild = e.target.nextElementSibling;
                e.target.classList.add("active");
                if (messagesChild.scrollHeight >= 300) {
                    messagesChild.style.maxHeight = "300px";
                    messagesChild.style.overflow = "scroll";
                } else {
                    messagesChild.style.maxHeight = messagesChild.scrollHeight + "px";
                }
            })

            document.querySelector("button#end-lecture").addEventListener('click', e => {
                calls.forEach(call => {
                    call.close()
                })
                calls = []
                socket.emit('lectureEnd')
                window.location = '/';
            })

            document.querySelectorAll("[data-command]").forEach(item => {
                item.addEventListener("click", e => {
                    let command = item.getAttribute("data-command"); // not doing shit here still
                    switch(command){
                        case "undo":
                            whiteboard.undoPaint();
                            break;
                        case "download":
                            var link = document.createElement("a");
                            link.download = "my-image.png";
                            link.href = whiteboard.getImage();
                            link.click();
                            break;
                        case "add-page":
                            //update the image of the current page
                            let currImage = whiteboard.getImage()
                            document.querySelector("[data-page].active img").setAttribute("src", currImage);
                            const selectedDivIndex = $('[data-page].active').index()
                            if(whiteboard.boards.length-1 <= selectedDivIndex){
                                whiteboard.boards.push(currImage)
                            }else{
                                whiteboard.boards[selectedDivIndex] = currImage    
                            }
                            socket.emit('updateBoards', {
                                boards: whiteboard.boards,
                                activeBoardIndex: whiteboard.boards.length 
                            })

                            //remove the active class on the current page and make it the new page
                            document.querySelector("[data-page].active").classList.toggle("active"); 

                            //clear the current canvas
                            whiteboard.clearCanvas();

                            //create non-active board element of previously selected board on side menu
                            createNonActiveBoardElem(whiteboard.getImage(), true)
                            break;
                        case "remove-page":
                            if(document.querySelector("[data-page].active").classList.contains("homePage")){
                                alert("Cannot delete the first page, you can clear it");
                            }else{
                                //document.querySelector("[data-brush-size].active").classList.toggle("active"); // remove the previous active function from the active class
                                document.querySelector("#pagelist").removeChild(document.querySelector("[data-page].active"));
                                document.querySelector("[data-page].homePage").classList.add("active"); // we add the element we clicked on to the active class

                                let replaceImage = document.querySelector("[data-page].active img"); 

                                //make the canvass show the current active image

                                whiteboard.clearCanvas();
                                whiteboard.setCurrentBoard(replaceImage);
                            }
                            break;
                        case "clear-page":
                            whiteboard.clearCanvas();
                            break;
                    }
                })
            });
            document.querySelectorAll("[data-tool]").forEach(
                item => (
                    item.addEventListener("click", e => {
                        document.querySelector("[data-tool].active").classList.toggle("active"); // remove the previous active function from the active class
                        
                        item.classList.add("active"); // we add the element we clicked on to the active class
                        
                        //with the tool.class.js created:
                        let selectedTool = item.getAttribute("data-tool");
                        whiteboard.activeTool = selectedTool;

                        switch(selectedTool){
                            //activate shape or line widths group
                            case TOOL_CIRCLE:
                            case TOOL_LINE:
                            case TOOL_SQUARE:
                            case TOOL_TRIANGLE:
                        // case TOOL_PAINT_BUCKET:
                            case TOOL_PENCIL:
                                //make pencil shapes visible
                                document.querySelector(".group.for-shapes").style = "display: block;";
                                //make brush sizes invisible
                                document.querySelector(".group.for-brush").style = "display: none;";
                                break;

                            case TOOL_BRUSH:
                            case TOOL_ERASER:
                                //make pencil shapes invisible
                                document.querySelector(".group.for-shapes").style.display = "none";
                                //make brush selection visible
                                document.querySelector(".group.for-brush").style.display = "block";
                                break;
                            default:
                                //make both line groups invisible
                                document.querySelector(".group.for-shapes").style.display = "none";
                                document.querySelector(".group.for-brush").style.display = "none";
                        }

                    }
                ))
            );

            document.querySelectorAll("[data-line-width]").forEach(
                item => {
                    item.addEventListener("click", e => {
                        document.querySelector("[data-line-width].active").classList.toggle("active"); // remove the previous active function from the active class
                        item.classList.add("active"); // we add the element we clicked on to the active class

                        let lineWidth = item.getAttribute("data-line-width");
                        whiteboard.lineWidth = lineWidth;
                    });
                }
            );

            document.querySelectorAll("[data-brush-size]").forEach(
                item => {
                    item.addEventListener("click", e => {
                        document.querySelector("[data-brush-size].active").classList.toggle("active"); // remove the previous active function from the active class
                        item.classList.add("active"); // we add the element we clicked on to the active class

                        let brushSize = item.getAttribute("data-brush-size");
                        whiteboard.brushSize = brushSize;
                    });
                }
            );

            document.querySelectorAll("[data-color]").forEach(
                item => {
                    item.addEventListener("click", e => {
                        document.querySelector("[data-color].active").classList.toggle("active"); // remove the previous active function from the active class
                        item.classList.add("active"); // we add the element we clicked on to the active class

                        let color = item.getAttribute("data-color");

                        whiteboard.selectedColor = color;
                    });
                }
            );
            
            console.log(room)
        });



        function onClickNonActiveBoardElem(){
            if(!$(this).hasClass('active')){
                const currentBoardImage = whiteboard.getImage()
                document.querySelector("[data-page].active img").setAttribute("src", currentBoardImage);
                whiteboard.boards[$('[data-page].active').index()] = currentBoardImage

                document.querySelector("[data-page].active").classList.toggle("active"); 
                this.classList.add("active");

                //Update non-active boards to students
                socket.emit('updateBoards', {
                    boards: whiteboard.boards,
                    activeBoardIndex: $(this).index()
                })

                //make the canvass show the current active image
                const clickedBoardImage = document.querySelector("[data-page].active img"); 
                whiteboard.clearCanvas();
                whiteboard.setCurrentBoard(clickedBoardImage);
            }
        }
    
        function createNonActiveBoardElem(img, isActive){
            //making the new page image
            let newBoardImg = document.createElement("img");
            newBoardImg.setAttribute("src", img);
            //setting the class to item and active
            let outer = document.createElement("div");
            outer.classList.add('item');
            if(isActive){
               outer.classList.add('active');
               whiteboard.setCurrentBoard(newBoardImg)
            }
            outer.setAttribute("data-page", "page");
       
            let inner = document.createElement("div");
            inner.classList.add('swatch');
            inner.style.backgroundColor = "#ffffff";
            
            inner.appendChild(newBoardImg);
            outer.appendChild(inner);
            document.getElementById("pagelist").appendChild(outer);
            outer.addEventListener('click', onClickNonActiveBoardElem.bind(outer))
       }

       function appendMessage(message) {
            const messageElement = document.createElement("tr");
            const tableData = document.createElement("td");
            tableData.innerText = message;
      
            messageElement.append(tableData);
            messageContainer.append(messageElement);

            const messageToggle = document.getElementById("toggle-messages");
            const event = new Event("redraw")
            messageToggle.dispatchEvent(event);
        }
    }
}
