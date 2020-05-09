window.onload = () => {
    let peer = new Peer();
    let calls = [];
    const url = window.location.pathname;
    const last_slash = url.lastIndexOf('/');
    const manager_id = url.substr(last_slash + 1);

    peer.on('open', () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                let socket = io('/', { query: `id=${manager_id}` });
                socket.on('call', remote_peer_id => {
                    let call = peer.call(remote_peer_id, stream)
                    calls.push(call)
                });

                socket.on('ready', room => {
                    let sharable_url = window.location.href
                    sharable_url = sharable_url.substr(0, sharable_url.lastIndexOf('/') + 1)
                    sharable_url += room.lecture_details.id
                    document.getElementById('sharable-link').innerHTML = sharable_url
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
