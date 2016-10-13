var l_box = new Array();


function GenerateGenga(){
  for ( var i = 0; i < 1; i++ ) {
    for(var j = 0 ; j < 15 ; j++){
      for(var k = 0 ; k < 3 ; k++){
        var box = new Physijs.BoxMesh(new THREE.BoxGeometry( 6, 1.5, 2 ), box_material);

        if (j % 2 === 0) {
          box.rotation.set(0, Math.PI/2, 0);
          box.position.set((k*2)-2, (j*1.7)-8.2, (i*3*2)+2);
        }
        else{
          box.position.set(i*3*2, (j*1.7)-8.2, k*2);
        }

        box.castShadow = true;
        scene.add( box );
        l_box.unshift( box );


      }
    }
  }
}
