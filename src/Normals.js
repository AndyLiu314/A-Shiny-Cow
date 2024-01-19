/* 
    Functions for vertex normals calculations
*/


// stores individual vertex normals for each vertex
// does not consider vertices that are used in multiple triangles
// flat shading
function get_flat_normals() { 
    var temp = [];
    for (var j = 0; j < cow.length; j++){
        temp[j] = vec3(0,0,0);
    }

    for (var i = 0; i < cow.length-2; i+=3){ // goes through each triangle of the cow
        var u = subtract(cow[i+1], cow[i]);
        var v = subtract(cow[i+2], cow[i]);
        var faceNormal = cross(u,v); // finds face normal of each triangle

        temp[i] = add(temp[i], normalize(faceNormal));
        temp[i+1] = add(temp[i+1], normalize(faceNormal));
        temp[i+2] = add(temp[i+2], normalize(faceNormal));

        normals.push(temp[i]);
        normals.push(temp[i+1]);
        normals.push(temp[i+2]);
    } 
}

// stores weighted sums of vertex normals for each vertex
// essentially averages these weighted sums to apply a smoothing effect
// smooth phong shading
function get_smooth_normals() {
    var vertices_temp = get_vertices();
    var indices_temp = get_faces();
    var temp = [];

    for (var j = 0; j < vertices_temp.length; j++){
        temp[j] = vec3(0,0,0);
    }

    for (var i = 0; i < indices_temp.length; i++){ // goes through each triangle of the cow
        var u = subtract(vertices_temp[indices_temp[i][1] - 1], vertices_temp[indices_temp[i][0] - 1]);
        var v = subtract(vertices_temp[indices_temp[i][2] - 1], vertices_temp[indices_temp[i][0] - 1]);
        var faceNormal = cross(u,v); // finds face normal of each triangle

        temp[indices_temp[i][0]- 1] = add(temp[indices_temp[i][0]- 1], faceNormal); // adds face normal to each vertex of the triangle
        temp[indices_temp[i][1]- 1] = add(temp[indices_temp[i][1]- 1], faceNormal); // will continue to add face normals to vertices used in multiple triangles
        temp[indices_temp[i][2]- 1] = add(temp[indices_temp[i][2]- 1], faceNormal); // this acts as a way to find the weighted sums of vertex normals for each vertex
    }

    for (var k = 0; k < temp.length; k++){
        temp[k] = normalize(temp[k]); // normalize the vertex normal sums of each vertex 
    }

    for (var m = 0; m < indices_temp.length; m++){
        for (var n = 0; n < 3; n++) {
            normals.push(temp[indices_temp[m][n] - 1]) // adds smooth shading normals to the normals array
        }
    }
}