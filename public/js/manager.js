window.onload = () => {
    let peer = new Peer();
    const url = window.location.pathname;
    const last_slash = url.lastIndexOf('/');
    const manager_id = url.substr(last_slash + 1);

    let socket = io('/', { query: `id=${manager_id}` });

    socket.on('ready', room => {
        console.log(room)
    });

    socket.on('updateNumOfStudents', num => {
        console.log(num)
    });

    socket.on('call', peer_id => {
        console.log(peer_id)
    });

    socket.on('attemptToConnectMultipleManagers', () => {
        alert('There is already a manager')
    });
}
