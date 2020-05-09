window.onload = () => {
    let peer = new Peer();
    const url = window.location.pathname;
    const last_slash = url.lastIndexOf('/');
    const room_id = url.substr(last_slash + 1);

    peer.on('open', peer_id => {
        let socket = io('/', {
            query: `id=${room_id}&peer_id=${peer_id}`
        });

        socket.on('ready', room => {
            console.log(room)
        });

        socket.on('updateNumOfStudents', num => {
            console.log(num)
        });

        socket.on('notifyPeerIdToManager', perform_call_on => {
            perform_call_on(peer.id)
        })
    });
}
