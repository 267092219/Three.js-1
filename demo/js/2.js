var container, stats;
var camera, scene, renderer,controls;
var INTERSECTED;
var raycaster;/*����*/
var mouse;
var intersects = [];
var mouseX = 0,
    mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {
    width = document.getElementById('webgl').clientWidth;
    height = document.getElementById('webgl').clientHeight;
    /*��Ⱦ��*/
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor( 0x333333, 1 );
    /*���*/
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.x = -150;
    camera.position.y = 100;
    camera.position.z = 200;
    /*�����ƶ�*/
    controls = new THREE.OrbitControls( camera );
    // ����
    scene = new THREE.Scene();
    /*�ƹ�AmbientLight������*/
    var ambient = new THREE.AmbientLight(0x444444);
    /*�ƹ�׷�ӵ�������*/
    scene.add(ambient);
    /*directionalLight�����*/
    var directionalLight = new THREE.DirectionalLight( 0xffeedd );
    directionalLight.position.set( 0, 0, 1 ).normalize();
    scene.add(directionalLight);
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.getElementById('webgl').appendChild( stats.domElement );
    clock = new THREE.Clock();
    // model
    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            //console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };
    var onError = function(xhr) {};

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( 'objModle/' );
    mtlLoader.load('798dlds.mtl', function(materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath( 'objModle/' );
        objLoader.load('798dlds.obj', function(object) {
            //console.log(object);
            scene.add( object );
            //create a blue LineBasicMaterial
            var materialTemp = new THREE.LineBasicMaterial({
                color: 0x00ffff,
                linecap: 'round', //ignored by WebGLRenderer
                linejoin:  'round' //ignored by WebGLRenderer
            });
            var geometry = new THREE.Geometry();
            for(var i = 0 ; i < object.children.length ; i++){
                if(object.children[i].name.indexOf("Sphere") != -1){
                    /*����߽缸�����壬����.boundingSphere���ԡ�
                     Ĭ������²�����߽���������Ҫ��ȷ�ļ��㣬�����������㡣*/
                    object.children[i].geometry.computeBoundingSphere();
                    /*���Ƶ����ɫ�仯*/
                    object.children[i].material.color.setRGB(255,0,0);
                    /*���Ƶ����ʾ����*/
                    object.children[i].visible = true;
                    //console.log(object.children[i].name  + "x y z " + " " + object.children[i].geometry.boundingSphere.center.x + object.children[i].geometry.boundingSphere.center.y + object.children[i].geometry.boundingSphere.center.z)
                    geometry.vertices.push(object.children[i].geometry.boundingSphere.center);


                }
                /*Mark*/
                /*  if(object.children[i].name.indexOf("Object") != -1){
                 /!*����*!/
                 var setP=object.children[i].geometry.center ();
                 console.log(setP);
                 /!*����*!/
                 var spritey = makeTextSprite( i,
                 { fontsize: 10, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
                 spritey.position.set(setP.x,setP.y,setP.z);
                 scene.add( spritey );
                 }*/
            }
            var line = new THREE.Line(geometry, materialTemp);
            scene.add(line);
        }, onProgress, onError);
        controls.update();

    });

    raycaster = new THREE.Raycaster();/*1.�½�һ��Raycasting����*/
    mouse = new THREE.Vector2();/*2.�½�һ��Vector2���󱣴����λ����Ϣ*/
    document.getElementById('webgl').appendChild(renderer.domElement);
    document.addEventListener('click', onDocumentClick, false);
    /*window.addEventListener('resize', onWindowResize, false);*//*,����������¼�*/
    render()

}

function makeTextSprite( message, parameters )
{
    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

    /*var spriteAlignment = THREE.SpriteAlignment.topLeft;*/

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;

    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
        + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
        + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial(
        { map: texture, useScreenCoordinates: false} );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(100,50,1.0);
    return sprite;
}
function roundRect(ctx, x, y, w, h, r)
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function onDocumentClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    requestAnimationFrame(animate);
    render();
    controls.update();

}
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    raycaster.setFromCamera(mouse, camera);
    camera.lookAt(scene.position);
    //3.��������ʰȡ������(���ߴ�͸����)
    var intersects = raycaster.intersectObjects(scene.children);/*��ȡͶ�����ߺʹ�����֮��Ľ���㡣 Raycaster.intersectObject�����ô˷�����*/
    /*/ʰȡ����������0ʱ */
    if (intersects.length > 0) {
        //��ȡ��һ������
        if (INTERSECTED != intersects[0].object) {
            if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
             INTERSECTED = intersects[0].object;
             INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            //�ı��������ɫ(��ɫ)
            INTERSECTED.material.color.set( 0xff0000 );
        }
    } else {
        if (INTERSECTED) INTERSECTED.material.color.set(INTERSECTED.currentHex);
        INTERSECTED = null;
    }


    controls.update();

}
