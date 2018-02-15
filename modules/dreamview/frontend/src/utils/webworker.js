const protobuf = require("protobufjs/light");
const simWorldRoot = protobuf.Root.fromJSON(
    require("proto_bundle/sim_world_proto_bundle.json")
);
const SimWorldMessage = simWorldRoot.lookupType("apollo.dreamview.SimulationWorld");
const mapRoot = protobuf.Root.fromJSON(require("proto_bundle/map_proto_bundle.json"));
const mapMessage = mapRoot.lookupType("apollo.hdmap.Map");
const pointCloudRoot = protobuf.Root.fromJSON(
    require("proto_bundle/point_cloud_proto_bundle.json")
);
const pointCloudMessage = pointCloudRoot.lookupType("apollo.dreamview.PointCloud");

self.addEventListener("message", event => {
    let message = null;
    const data = event.data.data;
    switch (event.data.source) {
        case "realtime":
            if (typeof data === "string") {
                message = JSON.parse(data);
            } else {
                message = SimWorldMessage.toObject(
                    SimWorldMessage.decode(new Uint8Array(data)),
                    { enums: String });
                message.type = "SimWorldUpdate";
            }
            break;
        case "map":
            message = mapMessage.toObject(
                mapMessage.decode(new Uint8Array(data)),
                {enums: String});
            message.type = "MapData";
            break;
        case "point_cloud":
            if (typeof data === "string") {
                message = JSON.parse(data);
            } else {
                message = pointCloudMessage.toObject(
                    pointCloudMessage.decode(new Uint8Array(data)), {arrays: true});
            }
            break;
    }

    if (message) {
        self.postMessage(message);
    }
});
