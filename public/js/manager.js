window.onload = () => {
    let peer = new Peer();
    let calls = [];
    const url = window.location.pathname;
    const last_slash = url.lastIndexOf('/');
    const manager_id = url.substr(last_slash + 1);

    peer.on('open', () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                let whiteboard = document.getElementById('canvas')
                let whiteboard_stream = whiteboard.captureStream(30);
                stream.addTrack(whiteboard_stream.getTracks()[0])
                let socket = io('/', { query: `id=${manager_id}` });
                socket.on('call', remote_peer_id => {
                    let call = peer.call(remote_peer_id, stream)
                    calls.push(call)
                });

                document.querySelector("button#end-lecture").addEventListener('click', e => {
                    console.log('ended call')
                    calls.forEach(call => {
                        call.close()
                    })
                    calls = []
                    socket.emit('lectureEnd')
                    window.location = '/';
                })

                socket.on('ready', room => {
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
                    console.log(room)
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
            })
    })
}
