const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight - 30);
document.body.appendChild(renderer.domElement);

// lights
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(50, 200, 100);
light.position.multiplyScalar(1.3);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
const d = 300;
light.shadow.camera.left = -d;
light.shadow.camera.right = d;
light.shadow.camera.top = d;
light.shadow.camera.bottom = -d;
light.shadow.camera.far = 1000;
scene.add(light);

const geometry = new THREE.BoxGeometry(
  4,
  1,
  3,
  (widthSegments = 3),
  (heightSegments = 3),
  (depthSegments = 3)
);
const material = new THREE.MeshPhongMaterial({ color: 0x00ffff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 15;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

var myCharacteristic;

async function onStartButtonClick() {
  let serviceUuid = "49535343-fe7d-4ae5-8fa9-9fafd205e455";

  let characteristicUuid = "49535343-1e4d-4bd9-ba61-23c647249611";

  try {
    console.log("Requesting Bluetooth Device...");
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [serviceUuid] }],
    });

    console.log("Connecting to GATT Server...");
    const server = await device.gatt.connect();

    console.log("Getting Service...");
    const service = await server.getPrimaryService(serviceUuid);

    console.log("Getting Characteristic...");
    myCharacteristic = await service.getCharacteristic(characteristicUuid);

    await myCharacteristic.startNotifications();

    console.log("> Notifications started");
    myCharacteristic.addEventListener(
      "characteristicvaluechanged",
      handleNotifications
    );
  } catch (error) {
    console.log("Argh! " + error);
  }
}

async function onStopButtonClick() {
  if (myCharacteristic) {
    try {
      await myCharacteristic.stopNotifications();
      console.log("> Notifications stopped");
      myCharacteristic.removeEventListener(
        "characteristicvaluechanged",
        handleNotifications
      );
    } catch (error) {
      console.log("Argh! " + error);
    }
  }
}

function handleNotifications(event) {
  let value = event.target.value;
  let decoder = new TextDecoder();
  let p = decoder
    .decode(value)
    .split("|")
    .map((e) => parseFloat(e));
  cube.quaternion.fromArray(p, 1);
}
