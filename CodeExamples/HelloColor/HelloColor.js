/**
 * @file A simple WebGL example drawing a triangle with colors
 * @author Eric Shaffer <shaffer1@illinois.edu>
 * 
 * Updated Spring 2021 by Ian Rudnick <itr2@illinois.edu>
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL vertex array object holding a list of attributes */
var vertexArrayObject;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;


/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var context = null;
  context = canvas.getContext("webgl2");
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}


/**
 * Loads a shader.
 * Retrieves the source code from the HTML document and compiles it.
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id we do an early exit
  if (!shaderScript) {
    return null;
  }
    
  var shaderSource = shaderScript.text;
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  } 
  return shader;
}


/**
 * Set up the fragment and vertex shaders.
 */
function setupShaders() {
  // Compile the shaders' source code.
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  // Link the shaders together into a program.
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  // We only use one shader program for this example, so we can just bind
  // it as the current program here.
  gl.useProgram(shaderProgram);

  // Create the vertex array object, which holds a list of attributes.
  // Attributes contain data that applies to a specific vertex.
  vertexArrayObject = gl.createVertexArray();
  gl.bindVertexArray(vertexArrayObject);

  // Query the index of each attribute in the list of attributes maintained
  // by the GPU.
  shaderProgram.vertexPositionLoc =
    gl.getAttribLocation(shaderProgram, "aVertexPosition");
  shaderProgram.vertexColorLoc =
    gl.getAttribLocation(shaderProgram, "aVertexColor");  
  
  // Enable each individual attribute we are using.
  gl.enableVertexAttribArray(shaderProgram.vertexPositionLoc);
  gl.enableVertexAttribArray(shaderProgram.vertexColorLoc);
}


/**
 * Set up the buffers to hold the triangle's vertex positions and colors.
 */
function setupBuffers() {
  // Create a buffer for positions, and bind it to the vertex array object.
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

  // Define a triangle in clip coordinates.
  var triangleVertices = [
         0.0,  0.5,  0.0,
        -0.5, -0.5,  0.0,
         0.5, -0.5,  0.0
  ];
  // Populate the buffer with the position data.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices),
                gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 3;

  // Binds the buffer that we just made to the vertex position attribute.
  gl.vertexAttribPointer(shaderProgram.vertexPositionLoc, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  // Do the same thing for the color buffer.
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

  var colors = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 3;
  
  gl.vertexAttribPointer(shaderProgram.vertexColorLoc, 
                         vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
}


/**
 * Draw model...render a frame
 */
function draw() {
  // Transform the clip coordinates so the render fills the canvas dimensions.
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  // Clear the screen.
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Use the vertex array object that we set up.
  gl.bindVertexArray(vertexArrayObject);

  // Render the triangles.
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);

  // Unbind the vertex array object to be safe.
  gl.bindVertexArray(null);
}

/**
 * Startup function called from the HTML code to start the program.
 */
function startup() {
  console.log("Drawing a triangle...");
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  draw();  
}
