
        var humans = [];
	GenerateHuman = function(){
		var head, leftArm, _leftArm, rightArm, _rightArm, leftLeg, _leftLeg, rightLeg, _rightLeg, leftFoot, rightFoot;
		var humanMaterial;
		
		humanMaterial = new Physijs.createMaterial(
					new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture( './images/lavatile.jpg' )}),
					.6,
					.4
				);
		
		human = new Physijs.BoxMesh(new THREE.BoxGeometry(2, 4, 1), humanMaterial);
		human.receiveShadow = true;
		human.castShadow = true;
		
		head = new Physijs.SphereMesh(new THREE.SphereGeometry(1, 16, 16), humanMaterial);
		head.castShadow = true;
		head.receiveShadow = true;
		head.position.y=3;
		human.add(head);
		
		leftArm = new Physijs.BoxMesh(new THREE.BoxGeometry(1.5, 0.5, 0.5), humanMaterial);
		leftArm.castShadow = true;
		leftArm.receiveShadow = true;
		leftArm.position.x = -1.6;
		leftArm.position.y = 1.5;
		leftArm.rotation.set(0, 0, Math.PI/4);
		
		_leftArm = new Physijs.BoxMesh(new THREE.BoxGeometry(1.5, 0.5, 0.5), humanMaterial);
		_leftArm.castShadow = true;
		_leftArm.receiveShadow = true;
		_leftArm.position.x = -1.5;
		
		leftArm.add(_leftArm);
		human.add(leftArm);
		
		rightArm = new Physijs.BoxMesh(new THREE.BoxGeometry(1.5, 0.5, 0.5), humanMaterial);
		rightArm.castShadow = true;
		rightArm.receiveShadow = true;
		rightArm.position.x = 1.5;
		rightArm.position.y = 1.5;
		rightArm.rotation.set(0, 0, -Math.PI/4);
		
		_rightArm = new Physijs.BoxMesh(new THREE.BoxGeometry(1.5, 0.5, 0.5), humanMaterial);
		_rightArm.castShadow = true;
		_rightArm.receiveShadow = true;
		_rightArm.position.x = 1.5;
		
		
		rightArm.add(_rightArm);
		human.add(rightArm);
		
		leftLeg = new Physijs.BoxMesh(new THREE.BoxGeometry(0.5, 2, 0.5), humanMaterial);
		leftLeg.castShadow = true;
		leftLeg.receiveShadow = true;
		leftLeg.position.y = -3.25;
		leftLeg.position.x = -1;
		
		_leftLeg = new Physijs.BoxMesh(new THREE.BoxGeometry(0.5, 2, 0.5), humanMaterial);
		_leftLeg.castShadow = true;
		_leftLeg.receiveShadow = true;
		_leftLeg.position.y = -2;

		
		leftFoot = new Physijs.BoxMesh(new THREE.BoxGeometry(1, 0.5, 1), humanMaterial);
		leftFoot.castShadow = true;
		leftFoot.receiveShadow = true;
		leftFoot.position.y = -1;
		_leftLeg.add(leftFoot);
		leftLeg.add(_leftLeg);
		
		human.add(leftLeg);
		
		rightLeg = new Physijs.BoxMesh(new THREE.BoxGeometry(0.5, 2, 0.5), humanMaterial);
		rightLeg.castShadow = true;
		rightLeg.receiveShadow = true;
		rightLeg.position.y = -3.25;
		rightLeg.position.x = 1;
		
		_rightLeg = new Physijs.BoxMesh(new THREE.BoxGeometry(0.5, 2, 0.5), humanMaterial);
		_rightLeg.castShadow = true;
		_rightLeg.receiveShadow = true;
		_rightLeg.position.y = -2;
		
		rightFoot = new Physijs.BoxMesh(new THREE.BoxGeometry(1, 0.5, 1), humanMaterial);
		rightFoot.castShadow = true;
		rightFoot.receiveShadow  = true;
		rightFoot.position.y = -1;
		
		_rightLeg.add(rightFoot);
		rightLeg.add(_rightLeg);
		
		human.add(rightLeg);
		
		
		human.position.set(Math.random() * 50 - 25,0,Math.random() * 50 - 25);
		

		humans.push(human);
		scene.add(human);
	}
	