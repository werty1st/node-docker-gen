// Nice to have

// https://github.com/nodejitsu/node-http-proxy
// https://github.com/apocas/dockerode


// Fast way
// static nginx config 
// static docker config

var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});

docker.getEvents({}, function (err, data) {
    if(err){
        console.log(err.message);
    } else {
        data.on('data', function (chunk) {

            let event = JSON.parse(chunk.toString('utf8'));
            if (event.Type && event.Type == "network"){
                
                switch (event.Action){
                    case "disconnect":
                        removeconfig(event.Actor.Attributes.container);
                        break;
                    case "connect":
                        addconfig(event.Actor.Attributes.container);
                        break;
                }
            }
        });
    } 
});




function removeconfig(containerID){
    console.log("Remove Config for Container:", containerID);
    
    let container = docker.getContainer(containerID);
    container.inspect(function (err, data) {
        
        let locations = data.Config.Env.map( envItem => {
            if ( envItem.indexOf("VIRTUAL_PATH")>-1){
                return envItem.split("=");
            }
            return false;
        }).filter(Boolean);

        if (locations.length>0){
            let path = locations;
            console.log("Remove Config for Container:", data.Name);
            console.log("Path:",path);
        }
        
    });
}

//todo
// read from running container identical locations and add them to upstream

function addconfig(containerID){
    console.log("Read Config of Container:",containerID);

    let container = docker.getContainer(containerID);
    container.inspect(function (err, data) {

        let locations = data.Config.Env.map( envItem => {
            if ( envItem.indexOf("VIRTUAL_PATH")>-1){
                return envItem.split("=");
            }
            return false;
        }).filter(Boolean);

        if (locations.length>0){
            let path = locations;
            console.log("Create Config for Container:", data.Name);
            console.log("Path:",path);
        }
        
    });

    // container.then( c => {
    //     console.log("Container:", c);
    // })
}

// let ID = "40832c4e360a8958ce68b4e0a92fb47ed676c4f301149126b3af733cb798334b";
// let container = docker.getContainer(ID);
// container.inspect(function (err, data) {
//   console.log(data.Config.Env);
// });
//console.log(docker.modem);

