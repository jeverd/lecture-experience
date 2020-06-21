/* eslint-disable no-undef */
let janus;
let handle;
Janus.init({
  debug: 'all',
  callback() {
    janus = new Janus(
      {
        server: 'http://localhost:8088/janus',
        success() {
        // Attach to VideoRoom plugin
          janus.attach(
            {
              plugin: 'janus.plugin.videoroom',
              success(pluginHandle) {
                console.log('success plugin');
                handle = pluginHandle;
                const body = { request: 'create' };
                const response = handle.send({
                  message: body,
                  success(result) {
                    console.log(result);
                  },
                });
                console.log(response);
              },
              error(error) {
                console.log('error plugin conenciton');
              },
              onmessage(msg, jsep) {
                console.log('message', msg, jsp);
              },
              onlocalstream(stream) {
                console.log(stream);
              },
              onremotestream(stream) {
              // The publisher stream is sendonly, we don't expect anything here
              },
              oncleanup() {

              },
            },
          );
        },
        error(error) {
          console.log(error);
        },
        destroyed() {
        // window.location.reload();
        },
      },
    );
  },
});
