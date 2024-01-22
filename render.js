var gl;
var canvas;
var program;

var vertices = [];
var indices = [];
var cow = [];
var normals = [];

var cube_vertices = [];
var cube_indices = [];
var cube = [];

var angleX = 0;
var angleY = 0;
var angleZ = 0;
var scale_val = 1;
var trans_x = 0;
var trans_y = 0;
var trans_z = 0;
var pos_x = 0; 
var pos_y = 0; 

var angle = 0;
var lightRadius = 10.0;
var rotationSpeed = -0.01;
var isRotating = true;
var lightPosition = vec4(8.0, 5.0, 5.0, 0.0 );
var isSmooth = sessionStorage.getItem("isSmooth") === "true" ? true : false;

var angularAttenuation = 1;
var spotlightPosition = vec4(0.0, 6.0, 6.0, 1.0);
var spotlightDirection = vec3(0.0, -1.0, -1.0);
var cutoffAngle = 30.0;
var isPanning = true; // Turn panning on by default
var currentAngle = 0.0;
var spotlightSpeed = 0.02;

var lightAmbient = vec4(0.5, 0.4, 0.3, 1.0 );
var lightDiffuse = vec4( 0.6, 0.5, 0.4, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.5, 0.4, 0.3, 1.0 );
var materialDiffuse = vec4( 0.5, 0.4, 0.3, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 50.0;

var cow_vBuffer, cube_vBuffer;
var modelView, projection;
var normalMatrix, normalMatrixLoc;
var eye, target, up;

const black = vec4(0.0, 0.0, 0.0, 1.0);

/*
    Input Events
*/
function setEventListeners(canvas) {
    let startX;
    let startY;
    let leftDrag = false;
    let rightDrag = false;
    window.addEventListener('mousedown', function (event) {
        if (event.button == 0 && rightDrag == false){ // left click
            leftDrag = true;
            startX = event.clientX;
            startY = event.clientY;
        } else if (event.button == 2 && leftDrag == false){ // right click
            rightDrag = true;
            startX = event.clientX;
            startY = event.clientY;
        }
    });
      
    canvas.addEventListener('mousemove', function (event) {
        if (leftDrag) { // get mouse position with respect to canvas and translate
            let currentX = event.clientX;
            let currentY = event.clientY;
            pos_x = (2 * currentX) / canvas.width - 1;
            pos_y = (2 * (canvas.height - currentY)) / canvas.height - 1;
            trans_x = pos_x*15;
            trans_y = pos_y*15;

        } else if (rightDrag){
            let currentX = event.clientX;
            let currentY = event.clientY;
            let distX = currentX - startX;
            let distY = currentY - startY;
            angleX = (distY*0.25);
            angleY = -(distX*0.25);
        }
    });

    window.addEventListener('mouseup', function (event) {
        if (event.button == 0){ // left click
            leftDrag = false;
        } else if (event.button == 2) { // right click
            rightDrag = false;
        }
    });

    var button = document.getElementById("shadingButton");
    button.addEventListener("click", function(){
        isSmooth = !isSmooth;
        sessionStorage.setItem("isSmooth",isSmooth); 
        location.reload();
    });
}

window.addEventListener("keydown", getKey, false);
function getKey(key) {
	if (key.key == "ArrowUp"){ 
        if (trans_z < 25) {
            trans_z += 2;
        }
    } else if (key.key == "ArrowDown"){
        if (trans_z > -50){
            trans_z -= 2.5;
        } 
	} else if (key.key == "ArrowLeft"){
        angleZ += 10; 
    } else if (key.key == "ArrowRight"){
        angleZ -= 10;
    } else if (key.key == "r" || key.key == "R" ){
        resetCow();
    } else if (key.key == "p" || key.key == "P" ){
        if (isRotating){
            rotationSpeed = 0;
            isRotating = false;
        } else {
            rotationSpeed = -0.01;
            isRotating = true;
        }
    }
}

function resetCow(){
    trans_x = 0;
    trans_y = 0;
    trans_z = 0;

    angleX = 0;
    angleY = 0;
    angleZ = 0;
}

// creates transformation matrix for cow
function transformCow(){
    const model = [
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    // scale matrix
    var scale_mat = model;
    scale_mat = scalem(scale_val, scale_val, scale_val);

    // creates rotation matrix
    // var angleXYZ rotates the matrix
    // rotation depends on axis which is the second parameter (the array)
    let rotateX = rotate(angleX, [1.0, 0.0, 0.0]);
    let rotateY = rotate(angleY, [0.0, 1.0, 0.0]);
    let rotateZ = rotate(angleZ, [0.0, 0.0, 1.0]);
    var rotate_mat = mult(rotateZ, mult(rotateY, rotateX)); 

    // creates translation matrix
    // moves cow x y z 
    var translate_mat = translate(trans_x, trans_y, trans_z); 

    // final transformation matrix 
    return mult(translate_mat, mult(scale_mat, rotate_mat));
}

// view matrix function to orient camera
function viewMatrix() {
    // eye is camera location
    // target is reference position (basically cow position)
    // up is direction of up
    eye = vec3(0, 0, 30);
    target = vec3(0, 0, 0);
    up = vec3(0, 1, 0);

    // create view matrix
    return lookAt(eye, target, up);
}

// rotates point light
function updateLightPosition() {
    // calculate new x and z coordinates for the light
    var lightX = lightRadius * Math.cos(angle);
    var lightZ = lightRadius * Math.sin(angle);
  
    // update light's position vector
    lightPosition[0] = lightX;
    lightPosition[2] = lightZ;
  
    // update angle for the next frame
    angle += rotationSpeed;
}

// self-explanatory
function setLightUniforms(){
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );

    updateLightPosition();
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    	if ( !gl ) { alert( "WebGL isn't available" ); }
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.4, 0.4, 0.4, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    setEventListeners(canvas);

    cube_indices = get_cube_faces();
    cube_vertices = get_cube_vertices();
    for (var l = 0; l < cube_indices.length; l++) {
      for (var m = 0; m < 2; m++) {
        cube.push(cube_vertices[cube_indices[l][m]]);
      }
    } 

    cube_vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube_vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cube), gl.STATIC_DRAW);

    indices = get_faces();
    vertices = get_vertices();
    for (var i = 0; i < indices.length; i++) {
      for (var j = 0; j < 3; j++) {
        cow.push(vertices[indices[i][j] - 1]);
      }
    }

    cow_vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cow_vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cow), gl.STATIC_DRAW);

    var nBuffer = gl.createBuffer();

    if (isSmooth){
        get_smooth_normals();
    } else {
        get_flat_normals(); 
    }

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW ); 

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    render();
}

function render (){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // final transformation matrix 
    var transform_mat = transformCow();
    // create view matrix
    var view = viewMatrix();
    var modelView_mat = mult(view, transform_mat);
    // projection matrix
    var aspect = canvas.width / canvas.height;
    var projection_mat = perspective(55.0, aspect, 0.1, 1000.0);

    // Drawing Cow
    gl.bindBuffer(gl.ARRAY_BUFFER, cow_vBuffer);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.uniformMatrix4fv(modelView, false, flatten(modelView_mat));
    gl.uniformMatrix4fv(projection, false, flatten(projection_mat) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    setLightUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, cow.length);

    // Drawing Cube
    gl.bindBuffer(gl.ARRAY_BUFFER, cube_vBuffer);

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cube_transform = mult(translate(lightPosition[0], 5, lightPosition[2]), transform_mat); // this attaches cube to cow
    cube_transform = mult(view, cube_transform);
    gl.uniformMatrix4fv(modelView, false, flatten(cube_transform));

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), mat4());
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), mat4());
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), mat4());
    gl.drawArrays(gl.LINES, 0, cube.length);

    window.requestAnimationFrame(render);
}