import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as faceapi from 'face-api.js'
import * as e from 'express'

let peerConnection = new RTCPeerConnection()
let localStream;
let remoteStream;

const webcam = document.getElementById("webcam") as HTMLVideoElement
const canvasOutput = document.getElementById("canvasOutput") as HTMLVideoElement
const modelCanvas = document.getElementById("modelCanvas") as HTMLCanvasElement

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models')
]).then(startVideo)
  
function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => webcam.srcObject = stream,
        err => console.error(err)
    )
}

const modelCanvasStream = modelCanvas.captureStream()
let animationAction: THREE.AnimationAction

webcam.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(webcam)
    document.body.append(canvas)
    const displaySize = { width: webcam.width, height: webcam.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(webcam, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        if(detections[0] !== undefined && detections[0]["expressions"] !== undefined){
            const sortable = Object.entries(detections[0]["expressions"])
            .sort(([,a],[,b]) => b-a)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
            const emotion = Object.keys(sortable)[0]
            if(emotion == "happy"){
                if(animationAction == mixer.clipAction((gltff as any).animations[0])){
                    if(!animationAction.isRunning()){
                        animationAction.stop()
                        animationAction = mixer.clipAction((gltff as any).animations[0])
                        animationAction.repetitions = 1
                        animationAction.play()
                    }
                }else{
                    animationAction.stop()
                    animationAction = mixer.clipAction((gltff as any).animations[0])
                    animationAction.repetitions = 1
                    animationAction.play()
                }
            }else if(emotion == "sad"){
                if(animationAction == mixer.clipAction((gltff as any).animations[1])){
                    if(!animationAction.isRunning()){
                        animationAction.stop()
                        animationAction = mixer.clipAction((gltff as any).animations[1])
                        animationAction.repetitions = 1
                        animationAction.play()
                    }
                }else{
                    animationAction.stop()
                    animationAction = mixer.clipAction((gltff as any).animations[1])
                    animationAction.repetitions = 1
                    animationAction.play()
                }
            }else if(emotion == "surprised"){
                if(animationAction == mixer.clipAction((gltff as any).animations[2])){
                    if(!animationAction.isRunning()){
                        animationAction.stop()
                        animationAction = mixer.clipAction((gltff as any).animations[2])
                        animationAction.repetitions = 1
                        animationAction.play()
                    }
                }else{
                    animationAction.stop()
                    animationAction = mixer.clipAction((gltff as any).animations[2])
                    animationAction.repetitions = 1
                    animationAction.play()
                }
            }else if(emotion == "surprised"){
                if(animationAction == mixer.clipAction((gltff as any).animations[3])){
                    if(!animationAction.isRunning()){
                        animationAction.stop()
                        animationAction = mixer.clipAction((gltff as any).animations[3])
                        animationAction.repetitions = 1
                        animationAction.play()
                    }
                }else{
                    animationAction.stop()
                    animationAction = mixer.clipAction((gltff as any).animations[3])
                    animationAction.repetitions = 1
                    animationAction.play()
                }
            }else{
                animationAction = mixer.clipAction((gltff as any).animations[4])
                animationAction.repetitions = Infinity
                animationAction.play()
            }
        }
    }, 500)
  })

canvasOutput.onload = function(){
    canvasOutput.srcObject = modelCanvasStream
}

let init = async () => {
    // localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    // remoteStream = new MediaStream()
    // document.getElementById('user-1').srcObject = localStream
    // document.getElementById('user-2').srcObject = remoteStream

    // localStream.getTracks().forEach((track) => {
    //     peerConnection.addTrack(track, localStream);
    // });

    // peerConnection.ontrack = (event) => {
    //     event.streams[0].getTracks().forEach((track) => {
    //     remoteStream.addTrack(track);
    //     });
    // };
    // navigator.getUserMedia({video:true, audio:false}, 
    //     stream => webcam.srcObject = stream,
    //     err => console.error(err))
    canvasOutput.srcObject = modelCanvasStream
}

init()


const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(4, 4, 4)

const renderer = new THREE.WebGLRenderer({canvas: modelCanvas})
renderer.setSize(modelCanvas.width, modelCanvas.height)
// document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

let mixer: THREE.AnimationMixer
let modelReady = false

const gltfLoader = new GLTFLoader()

const dropzone = document.getElementById('dropzone') as HTMLDivElement
dropzone.ondragover = dropzone.ondragenter = function (evt) {
    evt.preventDefault()
}

let animations: THREE.AnimationClip[]
let gltff: GLTF

dropzone.ondrop = function (evt: DragEvent) {
    evt.stopPropagation()
    evt.preventDefault()

    //clear the scene
    for (let i = scene.children.length - 1; i >= 0; i--) {
        scene.remove(scene.children[i])
    }
    //clear the checkboxes
    const myNode = document.getElementById('animationsPanel') as HTMLDivElement
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild as any)
    }

    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)

    const light1 = new THREE.DirectionalLight(new THREE.Color(0xffcccc))
    light1.position.set(-1, 1, 1)
    scene.add(light1)

    const light2 = new THREE.DirectionalLight(new THREE.Color(0xccffcc))
    light2.position.set(1, 1, 1)
    scene.add(light2)

    const light3 = new THREE.DirectionalLight(new THREE.Color(0xccccff))
    light3.position.set(0, -1, 0)
    scene.add(light3)

    const files = (evt.dataTransfer as DataTransfer).files
    const reader = new FileReader()
    reader.onload = function () {
        gltfLoader.parse(
            reader.result as string,
            '/',
            (gltf: GLTF) => {
                gltff = gltf
                console.log(gltf.scene)

                mixer = new THREE.AnimationMixer(gltf.scene)

                console.log(gltf.animations)
                animations = gltf.animations

                if (animations.length > 0) {
                    const animationsPanel = document.getElementById(
                        'animationsPanel'
                    ) as HTMLDivElement
                    const ul = document.createElement('UL') as HTMLUListElement
                    const ulElem = animationsPanel.appendChild(ul)

                    gltf.animations.forEach((a: THREE.AnimationClip, i) => {
                        const li = document.createElement('UL') as HTMLLIElement
                        const liElem = ulElem.appendChild(li)

                        const checkBox = document.createElement(
                            'INPUT'
                        ) as HTMLInputElement
                        checkBox.id = 'checkbox_' + i
                        checkBox.type = 'checkbox'
                        checkBox.addEventListener('change', (e: Event) => {
                            if ((e.target as HTMLInputElement).checked) {
                                mixer
                                    .clipAction((gltf as any).animations[i])
                                    .play()
                            } else {
                                mixer
                                    .clipAction((gltf as any).animations[i])
                                    .stop()
                            }
                        })
                        liElem.appendChild(checkBox)

                        const label = document.createElement(
                            'LABEL'
                        ) as HTMLLabelElement
                        label.htmlFor = 'checkbox_' + i
                        label.innerHTML = a.name
                        liElem.appendChild(label)
                    })

                    if (gltf.animations.length > 1) {
                        const btnPlayAll = document.getElementById(
                            'btnPlayAll'
                        ) as HTMLButtonElement
                        btnPlayAll.addEventListener('click', (e: Event) => {
                            mixer.stopAllAction()
                            gltf.animations.forEach(
                                (a: THREE.AnimationClip) => {
                                    mixer.clipAction(a).play()
                                }
                            )
                        })

                        // btnPlayAll.style.display = 'block'
                    }
                } else {
                    const animationsPanel = document.getElementById(
                        'animationsPanel'
                    ) as HTMLDivElement
                    animationsPanel.innerHTML = 'No animations found in model'
                }

                scene.add(gltf.scene)

                const bbox = new THREE.Box3().setFromObject(gltf.scene)
                controls.target.x = (bbox.min.x + bbox.max.x) / 2
                controls.target.y = (bbox.min.y + bbox.max.y) / 2
                controls.target.z = (bbox.min.z + bbox.max.z) / 2

                modelReady = true
            },
            (error) => {
                console.log(error)
            }
        )
    }
    reader.readAsArrayBuffer(files[0])
}

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = modelCanvas.width / modelCanvas.height
    camera.updateProjectionMatrix()
    renderer.setSize(modelCanvas.width, modelCanvas.height)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    if (modelReady) mixer.update(clock.getDelta())

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()