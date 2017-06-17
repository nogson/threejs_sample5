(() => {

    window.addEventListener('load', () => {

        // 汎用変数の宣言
        let width = window.innerWidth; // ブラウザのクライアント領域の幅
        let height = window.innerHeight; // ブラウザのクライアント領域の高さ
        let targetDOM = document.getElementById('webgl'); // スクリーンとして使う DOM

        // three.js 定義されているオブジェクトに関連した変数を宣言
        let scene; // シーン
        let camera; // カメラ
        let renderer; // レンダラ
        let axis; //ガイド
        let grid; //ガイド
        let directional;
        let ambient;
        let controls;
        let point;
        let stars;
        let loader;

        // 各種パラメータを設定するために定数オブジェクトを定義
        let CAMERA_PARAMETER = { // カメラに関するパラメータ
            fovy: 90,
            aspect: width / height,
            near: 0.1,
            far: 100.0,
            x: 0.0, // + 右 , - 左
            y: 0, // + 上, - 下
            z: 0, // + 手前, - 奥
            lookAt: new THREE.Vector3(5.0, 5, 0.0) //x,y,z
        };
        let RENDERER_PARAMETER = { // レンダラに関するパラメータ
            clearColor: 0x000000, //背景のリセットに使う色
            width: width,
            height: height
        };

        let LIGHT_PARAMETER = {
            directional: {
                positionX: -0.5,
                positionY: 4,
                positionZ: 3
            },
            ambient: {
                positionY: 1
            }
        };

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x000000, 0.05, 13);

        camera = new THREE.PerspectiveCamera(
            CAMERA_PARAMETER.fovy,
            CAMERA_PARAMETER.aspect,
            CAMERA_PARAMETER.near,
            CAMERA_PARAMETER.far
        );

        camera.position.x = CAMERA_PARAMETER.x;
        camera.position.y = CAMERA_PARAMETER.y;
        camera.position.z = CAMERA_PARAMETER.z;
        camera.lookAt(CAMERA_PARAMETER.lookAt); //注視点（どこをみてるの？）

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(RENDERER_PARAMETER.clearColor));
        renderer.setSize(RENDERER_PARAMETER.width, RENDERER_PARAMETER.height);
        renderer.shadowMap.enabled = true;

        //renderer.shadowMap.enabled = true; //影を有効
        targetDOM.appendChild(renderer.domElement); //canvasを挿入する

        //controls = new THREE.OrbitControls(camera, render.domElement);

        //ライト
        directional = new THREE.DirectionalLight(0xffffff);
        ambient = new THREE.AmbientLight(0xffffff, 0.25);

        directional.castShadow = true;


        directional.position.y = LIGHT_PARAMETER.directional.positionY;
        directional.position.z = LIGHT_PARAMETER.directional.positionZ;
        directional.position.x = LIGHT_PARAMETER.directional.positionX;
        ambient.position.y = LIGHT_PARAMETER.ambient.positionY;

        //directional.castShadow = true;
        directional.shadow.mapSize.width = 800;
        directional.shadow.mapSize.height = 800;
        scene.add(directional);
        scene.add(ambient);

        axis = new THREE.AxisHelper(1000);
        axis.position.set(0, 0, 0);
        //scene.add(axis);

        //グリッドのインスタンス化
        grid = new THREE.GridHelper(100, 50);

        //グリッドオブジェクトをシーンに追加する
        scene.add(grid);

        loader = new THREE.TextureLoader();
        loader.load('images/tx1.jpg', function (starTexture) {
            loader.load('images/img.png', function (texture) {
                createPoints(starTexture,texture);
                render();
            });
        });




        function createPoints(starTexture,texture) {
            let geometry = new THREE.Geometry();
            let material = new THREE.PointsMaterial({
                //pointsを使用する場合はMaterialのサイズで調整する
                size: 0.2,
                color: 0xffffff,
                vertexColors: true,
                map: texture,
                transparent: true,
                //blending: THREE.NormalBlending
            });

            let starGeometry = new THREE.Geometry();

            let starMaterial = new THREE.PointsMaterial({
                //pointsを使用する場合はMaterialのサイズで調整する
                size: 0.07,
                color: 0xffffff,
                vertexColors: true,
                transparent: true,
                map:starTexture,
                blending: THREE.AdditiveBlending
            });


            let maxLength = 2000;

            for (let i = 0; i < maxLength; i++) {

                let pos = getPostion(
                    Math.random() * width,
                    Math.random() * height,
                    Math.random() * width
                );

                //頂点データを生成
                let particle = new THREE.Vector3(pos.x, pos.y, pos.z);
                let starParticle = new THREE.Vector3(pos.x, Math.random() * 5 + 3, pos.z);

                //頂点色を設定
                let color = new THREE.Color(0xffffff);

                //頂点データをジオメトリに追加
                geometry.vertices.push(particle);
                starGeometry.vertices.push(starParticle);

                //頂点色をジオメトリに追加
                geometry.colors.push(color);
                starGeometry.colors.push(color);
            }

            point = new THREE.Points(geometry, material);
            stars = new THREE.Points(starGeometry, starMaterial);
            scene.add(point);
            scene.add(stars);
        }


        //座標を-10~10の範囲にする
        function getPostion(x, y, z) {
            let maxW = width / 2;
            let maxH = height / 2;
            let coefficient = 10;

            return {
                x: (x - maxW) / maxW * coefficient,
                y: (y - maxH) / maxH * coefficient,
                z: (z - maxW) / maxW * coefficient
            }
        };

        //描画
        function render() {
            renderer.render(scene, camera);
            let vertices = point.geometry.vertices;

            point.geometry.verticesNeedUpdate = true;
            point.rotation.y += 0.001;
            stars.rotation.y += 0.0005;
            for (let i = 0, j = vertices.length; i < j; i++) {

                point.geometry.vertices[i].y += 0.005;
                if (point.geometry.vertices[i].y > 13) {
                    point.geometry.vertices[i].y = -10;
                }

            }

            // animation
            requestAnimationFrame(render);
        }

    }, false);
})();