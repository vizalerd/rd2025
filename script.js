import * as THREE from 'three';
        import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

        // Переменные для отслеживания загрузки
        let loadedResources = 0;
        let totalResources = 0;
        let isPreloaderHidden = false;

        // Функция для скрытия прелоадера
        function hidePreloader() {
            if (isPreloaderHidden) return;
            
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.classList.add('hidden');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
                isPreloaderHidden = true;
            }
        }

        // Функция для обновления прогресса загрузки
        function updateLoadingProgress(progress) {
            const progressBar = document.querySelector('.preloader-bar');
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        }

        // Функция для отслеживания загрузки ресурса
        function trackResourceLoading() {
            loadedResources++;
            const progress = Math.min((loadedResources / totalResources) * 100, 100);
            updateLoadingProgress(progress);
            
            if (loadedResources >= totalResources) {
                setTimeout(hidePreloader, 1000); // Задержка для завершения анимации
            }
        }

        // Функция для отслеживания загрузки изображений
        function trackImageLoading() {
            const images = document.querySelectorAll('img');
            totalResources += images.length;
            
            images.forEach(img => {
                if (img.complete) {
                    trackResourceLoading();
                } else {
                    img.addEventListener('load', trackResourceLoading);
                    img.addEventListener('error', trackResourceLoading);
                }
            });
        }

        // Создание сцены
        const scene = new THREE.Scene();
        scene.background = null; // Прозрачный фон

        // Создание камеры
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Создание рендерера
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true // Включаем поддержку прозрачности
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // Прозрачный фон рендерера
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('container').appendChild(renderer.domElement);

        // Функциональность бургер-меню
        const burgerBtn = document.getElementById('burgerBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');

        if (burgerBtn && dropdownMenu) {
            burgerBtn.addEventListener('click', function() {
                burgerBtn.classList.toggle('active');
                dropdownMenu.classList.toggle('active');
            });

            // Закрытие меню при клике вне его
            document.addEventListener('click', function(event) {
                if (!burgerBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
                    burgerBtn.classList.remove('active');
                    dropdownMenu.classList.remove('active');
                }
            });
        }

        // Настройка освещения
        // Окружающее освещение
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        // Направленный свет от пользователя на юрту
        const directionalLight = new THREE.DirectionalLight(0xF34C19, 1.2);
        directionalLight.position.set(0, 5, 15); // Позиция за камерой (со стороны пользователя)
        directionalLight.target.position.set(0, 0, 0); // Направлен на юрту
        directionalLight.castShadow = false;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);
        scene.add(directionalLight.target);

        // Визуализация света убрана - используется только ambient light

        // Загрузка FBX моделей
        const loader = new FBXLoader();
        const loadingElement = document.getElementById('loading');
        const errorElement = document.getElementById('error');
        
    // Переменные для хранения моделей
    let yurtModel = null;
    let ornamentModel = null;
    let mirrorOrnamentModel = null;
    let bottomOrnamentModel = null;
    let bottomMirrorOrnamentModel = null;
    let modelsLoaded = 0;
    const totalModels = 2;

    // Инициализация счетчика ресурсов для прелоадера
    totalResources = 2; // 2 модели FBX + текстуры будут добавлены динамически
    loadedResources = 0;

    // Переменные для эффекта перспективы
    let mouseX = 0;
    let mouseY = 0;
    const perspectiveStrength = 0.02; // Сила эффекта перспективы

        // Функция для применения текстур к материалам
        function applyTexturesToMaterial(material, meshName) {
            if (!material) return;
            
            console.log('Применяем текстуры к:', meshName, 'материал:', material.name);
            
            // Определяем тип текстуры по имени меша
            let baseColorTexture = null;
            let normalTexture = null;
            
            // Маппинг текстур по именам мешей
            const textureMapping = {
                'UrtaExterior': 'UrtaExterior_DefaultMaterial',
                'UrtaInterior': 'UrtaInterior_UrtaInterior', 
                'UrtaDoor': 'UrtaDoor_DefaultMaterial',
                'Floor': 'Floor_Floor',
                'Carpets': 'Carpets_DefaultMaterial',
                'Chests': 'Chests_Chests',
                'Sofa': 'Sofa_DefaultMaterial',
                'Eat': 'Eat_DefaultMaterial',
                'MainTable': 'urtatable_lp_MainTable',
                'Visulki': 'Visulki1mat_Visulki'
            };
            
            // Находим подходящую текстуру
            for (const [key, textureName] of Object.entries(textureMapping)) {
                if (meshName.includes(key) || material.name.includes(key)) {
                    baseColorTexture = textureName + '_BaseColor.png';
                    normalTexture = textureName + '_Normal.png';
                    console.log('Найдена текстура для', key, ':', baseColorTexture);
                    break;
                }
            }
            
            // Увеличиваем счетчик ресурсов для каждой текстуры
            if (baseColorTexture) totalResources++;
            if (normalTexture) totalResources++;
            
            // Применяем текстуры
            if (baseColorTexture) {
                const textureLoader = new THREE.TextureLoader();
                const texturePath = 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/' + baseColorTexture;
                console.log('Загружаем текстуру:', texturePath);
                
                material.map = textureLoader.load(
                    texturePath,
                    function(texture) {
                        console.log('Текстура загружена успешно:', texturePath);
                        material.needsUpdate = true;
                        trackResourceLoading();
                    },
                    undefined,
                    function(error) {
                        console.error('Ошибка загрузки текстуры:', texturePath, error);
                        trackResourceLoading(); // Считаем ошибку как завершенную загрузку
                    }
                );
            }
            
            if (normalTexture) {
                const textureLoader = new THREE.TextureLoader();
                const texturePath = 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/Textures/' + normalTexture;
                console.log('Загружаем нормальную карту:', texturePath);
                
                material.normalMap = textureLoader.load(
                    texturePath,
                    function(texture) {
                        console.log('Нормальная карта загружена успешно:', texturePath);
                        material.needsUpdate = true;
                        trackResourceLoading();
                    },
                    undefined,
                    function(error) {
                        console.error('Ошибка загрузки нормальной карты:', texturePath, error);
                        trackResourceLoading(); // Считаем ошибку как завершенную загрузку
                    }
                );
            }
            
            // Настройка материала для лучшего освещения
            material.needsUpdate = true;
            
            // Убеждаемся, что материал реагирует на свет
            if (material.isMeshStandardMaterial || material.isMeshPhongMaterial) {
                material.roughness = 0.8; // Для лучшего отражения света
                material.metalness = 0.1; // Немного металлического блеска
            }
            
            // Если материал не реагирует на свет, делаем его более ярким
            if (!material.map && !material.color) {
                material.color = new THREE.Color(0x888888); // Серый цвет по умолчанию
            }
        }

        // Функция для обработки загруженной модели
        function handleModelLoaded(object, modelType) {
            modelsLoaded++;
            console.log(`Загружена модель: ${modelType}`);
            console.log('Объект модели:', object);
            console.log('Количество детей:', object.children.length);
            
            // Отслеживаем загрузку для прелоадера
            trackResourceLoading();
            
            // Настройка модели и применение текстур
            let meshCount = 0;
            object.traverse(function (child) {
                console.log('Обрабатываем дочерний объект:', child.name, child.type);
                if (child.isMesh) {
                    meshCount++;
                    console.log(`Меш ${meshCount}:`, child.name);
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Применение текстур к материалам (только для юрты)
                    if (modelType === 'yurt' && child.material) {
                        // Если материал массив
                        if (Array.isArray(child.material)) {
                            child.material.forEach((material, index) => {
                                console.log(`Материал ${index} для ${child.name}:`, material.name);
                                applyTexturesToMaterial(material, child.name);
                            });
                        } else {
                            // Если материал одиночный
                            console.log('Одиночный материал для', child.name, ':', child.material.name);
                            applyTexturesToMaterial(child.material, child.name);
                        }
                    } else if (modelType === 'ornament' && child.material) {
                        console.log('Применяем цвет к орнаменту:', child.name);
                    } else {
                        console.log('Нет материалов для', child.name);
                    }
                }
            });
            console.log(`Всего мешей в ${modelType}: ${meshCount}`);
            
            if (modelType === 'yurt') {
                yurtModel = object;
                // Позиционирование юрты по центру экрана
                object.position.set(0, 0, 0);
                object.rotation.x = 0;
                object.rotation.y = 0;
                object.rotation.z = 0;
                
                // Масштабирование модели
                const box = new THREE.Box3().setFromObject(object);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 6 / maxDim;
                object.scale.setScalar(scale);
            } else if (modelType === 'ornament') {
                ornamentModel = object;
                console.log('Настраиваем орнамент...');
                
                // Позиционирование орнамента в верхнем левом углу
                object.position.set(-8, 2, -5); // Отступы 5rem от краев
                object.rotation.x = 0;
                object.rotation.y = 5.5;
                object.rotation.z = 0;
                console.log('Позиция орнамента:', object.position);
                
                // Масштабирование орнамента
                const box = new THREE.Box3().setFromObject(object);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim; // Меньший размер для орнамента
                object.scale.setScalar(scale);
                console.log('Размер орнамента:', size, 'Масштаб:', scale);
                
                // Применение цвета #FFFC62 к орнаменту
                let materialCount = 0;
                object.traverse(function (child) {
                    if (child.isMesh && child.material) {
                        materialCount++;
                        console.log(`Применяем цвет к мешу ${materialCount}:`, child.name);
                        // Если материал массив
                        if (Array.isArray(child.material)) {
                            child.material.forEach((material, index) => {
                                console.log(`Материал ${index}:`, material);
                                material.color = new THREE.Color(0xF34C19);
                                material.needsUpdate = true;
                            });
                        } else {
                            // Если материал одиночный
                            console.log('Одиночный материал:', child.material);
                            child.material.color = new THREE.Color(0xF34C19);
                            child.material.needsUpdate = true;
                        }
                    }
                });
                console.log(`Обработано материалов орнамента: ${materialCount}`);
                
                // Создание зеркальной копии орнамента
                if (modelType === 'ornament') {
                    console.log('Создаем зеркальную копию орнамента...');
                    mirrorOrnamentModel = object.clone();
                    
                    // Позиционирование зеркальной копии в правой стороне
                    mirrorOrnamentModel.position.set(9, 2, -3.75); // Зеркальная позиция справа
                    mirrorOrnamentModel.rotation.x = 0;
                    mirrorOrnamentModel.rotation.y = -2.5; // Зеркальный поворот
                    mirrorOrnamentModel.rotation.z = 0;
                    mirrorOrnamentModel.scale.setScalar(scale); // Тот же масштаб
                    
                    // Применение того же цвета к зеркальной копии
                    mirrorOrnamentModel.traverse(function (child) {
                        if (child.isMesh && child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(material => {
                                    material.color = new THREE.Color(0xFAEAB1);
                                    material.needsUpdate = true;
                                });
                            } else {
                                child.material.color = new THREE.Color(0xFAEAB1);
                                child.material.needsUpdate = true;
                            }
                        }
                    });
                    
                    scene.add(mirrorOrnamentModel);
                    console.log('Зеркальная копия орнамента создана и добавлена в сцену');
                    
                    // Создание нижних копий орнаментов
                    console.log('Создаем нижние копии орнаментов...');
                    
                    // Нижний левый орнамент
                    bottomOrnamentModel = object.clone();
                    bottomOrnamentModel.position.set(-8.75, 2, 3.5); // Зеркально вниз
                    bottomOrnamentModel.rotation.x = 0;
                    bottomOrnamentModel.rotation.y = 0.7; // Тот же поворот
                    bottomOrnamentModel.rotation.z = 0;
                    bottomOrnamentModel.scale.setScalar(scale);
                    
                    // Применение цвета к нижнему левому орнаменту
                    bottomOrnamentModel.traverse(function (child) {
                        if (child.isMesh && child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(material => {
                                    material.color = new THREE.Color(0xFAEAB1);
                                    material.needsUpdate = true;
                                });
                            } else {
                                child.material.color = new THREE.Color(0xFAEAB1);
                                child.material.needsUpdate = true;
                            }
                        }
                    });
                    
                    // Нижний правый орнамент
                    bottomMirrorOrnamentModel = object.clone();
                    bottomMirrorOrnamentModel.position.set(8, 2, 4.5); // Зеркально вниз справа
                    bottomMirrorOrnamentModel.rotation.x = 0;
                    bottomMirrorOrnamentModel.rotation.y = 2.5; // Зеркальный поворот
                    bottomMirrorOrnamentModel.rotation.z = 0;
                    bottomMirrorOrnamentModel.scale.setScalar(scale);
                    
                    // Применение цвета к нижнему правому орнаменту
                    bottomMirrorOrnamentModel.traverse(function (child) {
                        if (child.isMesh && child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(material => {
                                    material.color = new THREE.Color(0xFAEAB1);
                                    material.needsUpdate = true;
                                });
                            } else {
                                child.material.color = new THREE.Color(0xFAEAB1);
                                child.material.needsUpdate = true;
                            }
                        }
                    });
                    
                    scene.add(bottomOrnamentModel);
                    scene.add(bottomMirrorOrnamentModel);
                    console.log('Нижние копии орнаментов созданы и добавлены в сцену');
                }
            }
            
            scene.add(object);
            console.log(`Модель ${modelType} добавлена в сцену`);
            
            // Проверяем, загружены ли все модели
            if (modelsLoaded === totalModels) {
                loadingElement.style.display = 'none';
                console.log('Все модели загружены');
                
                
                // Дополнительная проверка видимости орнамента
                // if (ornamentModel) {
                //     console.log('Проверяем видимость орнамента...');
                //     console.log('Позиция орнамента:', ornamentModel.position);
                //     console.log('Масштаб орнамента:', ornamentModel.scale);
                //     console.log('Видимость орнамента:', ornamentModel.visible);
                    
                //     // Попробуем переместить орнамент ближе к камере
                //     ornamentModel.position.set(-3, 2, -3);
                //     console.log('Новая позиция орнамента:', ornamentModel.position);
                // }
            }
        }

        // Загрузка модели юрты
        loader.load(
            'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/Yurta.fbx',
            function (object) {
                handleModelLoaded(object, 'yurt');
            },
            function (progress) {
                // Прогресс загрузки с ограничением до 100%
                const percent = Math.min(100, Math.round((progress.loaded / progress.total) * 100));
                loadingElement.textContent = `Загрузка 3D модели... ${percent}%`;
            },
            function (error) {
                // Ошибка загрузки
                loadingElement.style.display = 'none';
                errorElement.style.display = 'block';
                errorElement.innerHTML = `
                    <div>Ошибка загрузки модели:</div>
                    <div style="font-size: 14px; margin-top: 10px;">${error.message}</div>
                    <div style="font-size: 12px; margin-top: 5px; color: #888;">
                        Убедитесь, что файл scene.fbx находится в той же папке
                    </div>
                `;
                console.error('Ошибка загрузки FBX:', error);
            }
        );

        // Загрузка модели орнамента
        loader.load(
            'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/Ornament.fbx',
            function (object) {
                handleModelLoaded(object, 'ornament');
            },
            function (progress) {
                // Прогресс загрузки орнамента
                const percent = Math.min(100, Math.round((progress.loaded / progress.total) * 100));
                loadingElement.textContent = `Загрузка орнамента... ${percent}%`;
            },
            function (error) {
                console.error('Ошибка загрузки орнамента:', error);
                // Продолжаем работу даже если орнамент не загрузился
                modelsLoaded++;
                if (modelsLoaded === totalModels) {
                    loadingElement.style.display = 'none';
                    // Прелоадер будет скрыт автоматически через trackResourceLoading
                }
            }
        );

        // Настройка камеры для вида сверху
        camera.position.set(0, 10, 0);
        camera.lookAt(0, 0, 0);

        


        // Анимация с вращением
        function animate() {
            requestAnimationFrame(animate);
            
            // Медленное вращение юрты против часовой стрелки (только если не скроллим)
            if (yurtModel && !isScrolling) {
                yurtModel.rotation.y -= 0.003;
            }
            
            
            renderer.render(scene, camera);
        }
        animate();

        // Обработка изменения размера окна
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });


    // Обработчик движения мыши для эффекта перспективы
    window.addEventListener('mousemove', function(event) {
        // Отключаем эффект перспективы при скролле
        if (isScrolling) return;
        
        // Нормализуем координаты мыши от -1 до 1
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Применяем transform к canvas
        const canvas = renderer.domElement;
        const translateX = mouseX * perspectiveStrength * 1000; // Умножаем на 10 для более заметного эффекта
        const translateY = mouseY * perspectiveStrength * 1000;
        
        canvas.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });

        // Дополнительные эффекты для технологичной сетки
        function createTechGridEffects() {
            const grid = document.getElementById('techGrid');
            
            // Создаем дополнительные элементы для techwear эффектов
            const scanLine = document.createElement('div');
            scanLine.style.cssText = `
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 2px;
                background: linear-gradient(90deg, transparent, rgba(100, 255, 100, 0.8), transparent);
                animation: scanMove 8s linear infinite;
                z-index: 2;
            `;
            grid.appendChild(scanLine);
            
            // Добавляем CSS для анимации сканирования
            const style = document.createElement('style');
            style.textContent = `
                @keyframes scanMove {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
            `;
            document.head.appendChild(style);
            
            // Создаем случайные точки подключения
            for (let i = 0; i < 20; i++) {
                const connectionPoint = document.createElement('div');
                connectionPoint.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: rgba(100, 100, 100, 0.8);
                    border-radius: 50%;
                    top: ${Math.random() * 100}%;
                    left: ${Math.random() * 100}%;
                    animation: pointPulse ${2 + Math.random() * 3}s ease-in-out infinite;
                    z-index: 2;
                `;
                grid.appendChild(connectionPoint);
            }
            
            // Добавляем CSS для пульсации точек
            const pointStyle = document.createElement('style');
            pointStyle.textContent = `
                @keyframes pointPulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `;
            document.head.appendChild(pointStyle);
        }
        
        // Инициализация эффектов сетки
        createTechGridEffects();

        // Функциональность карты Казахстана
        function initKazakhstanMap() {
            const mapSvg = document.getElementById('kzmap');
            if (!mapSvg) {
                return;
            }

            // Создаем тултип (если еще не создан)
            let tooltip = document.querySelector('.region-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'region-tooltip';
                document.body.appendChild(tooltip);
            }

            // Названия регионов Казахстана
            const regionNames = [
                'Акмолинская область',
                'Актюбинская область',
                'Алматинская область',
                'Алматы',
                'Атырауская область',
                'Абайская область',
                'Жамбылская область',
                'Улытауская область',
                'Костанайская область',
                'Кызылординская область',
                'Мангистауская область',
                'Северо-Казахстанская область',
                'Астана',
                'Павлодарская область',
                'Шымкент',
                'Туркестанская область',
                'Западно-Казахстанская область',
                'Карагандинская область',
                'Жетысуская область',
                'Восточно-Казахстанская область'
            ];

            // Получаем все path элементы (регионы)
            const regions = mapSvg.querySelectorAll('path');
            
            regions.forEach((region, index) => {
                // Добавляем обработчики событий для каждого региона
                region.addEventListener('mouseenter', function(e) {
                    // Показываем тултип
                    const regionName = regionNames[index] || `Регион ${index + 1}`;
                    tooltip.textContent = regionName;
                    tooltip.classList.add('show');
                    
                    // Позиционируем тултип относительно мыши
                    tooltip.style.left = (e.clientX + 10) + 'px';
                    tooltip.style.top = (e.clientY - 40) + 'px';
                });

                region.addEventListener('mouseleave', function(e) {
                    // Скрываем тултип
                    tooltip.classList.remove('show');
                });

                region.addEventListener('mousemove', function(e) {
                    // Обновляем позицию тултипа при движении мыши
                    tooltip.style.left = (e.clientX + 10) + 'px';
                    tooltip.style.top = (e.clientY - 40) + 'px';
                });
            });

            // Добавляем обработчик для скрытия тултипа при скролле
            window.addEventListener('scroll', function() {
                tooltip.classList.remove('show');
            });

            // Добавляем обработчик для скрытия тултипа при изменении размера окна
            window.addEventListener('resize', function() {
                tooltip.classList.remove('show');
            });

        }

        // Инициализируем карту после загрузки DOM
        document.addEventListener('DOMContentLoaded', function() {
            // Небольшая задержка для гарантии полной загрузки
            setTimeout(() => {
                initKazakhstanMap();
            }, 100);
            
            // Предотвращение выделения текста
            document.addEventListener('selectstart', function(e) {
                e.preventDefault();
            });
            
            document.addEventListener('dragstart', function(e) {
                e.preventDefault();
            });
            
            // Предотвращение контекстного меню
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });
        });

        // Альтернативная инициализация при полной загрузке страницы
        window.addEventListener('load', function() {
            setTimeout(() => {
                if (!document.querySelector('.region-tooltip')) {
                    initKazakhstanMap();
                }
            }, 500);
        });

        // Функции для управления игровым диалоговым окном
        let dialogShown = false; // Флаг для предотвращения множественного показа
        let dialogTriggerPoint = 0; // Точка, где диалог должен появиться
        let dialog2Shown = false; // Флаг для второго диалогового окна
        let dialog3Shown = false; // Флаг для третьего диалогового окна
        let dialog4Shown = false; // Флаг для четвертого диалогового окна
        
        function showDialog() {
            if (dialogShown) return; // Предотвращаем множественный показ
            
            console.log('showDialog вызвана');
            const dialogOverlay = document.getElementById('dialogOverlay');
            console.log('dialogOverlay найден:', dialogOverlay);
            if (dialogOverlay) {
                dialogOverlay.classList.add('show');
                dialogShown = true; // Устанавливаем флаг
                dialogTriggerPoint = window.scrollY; // Запоминаем точку появления
                console.log('Игровой диалог показан в точке:', dialogTriggerPoint);
            } else {
                console.log('Диалоговое окно не найдено!');
            }
        }

        function hideDialog() {
            const dialogOverlay = document.getElementById('dialogOverlay');
            if (dialogOverlay) {
                dialogOverlay.classList.remove('show');
                dialogShown = false; // Сбрасываем флаг
                console.log('Диалог скрыт');
            }
        }

        function showDialog2() {
            if (dialog2Shown) return; // Предотвращаем множественный показ
            
            console.log('showDialog2 вызвана');
            const dialogOverlay2 = document.getElementById('dialogOverlay2');
            console.log('dialogOverlay2 найден:', dialogOverlay2);
            if (dialogOverlay2) {
                dialogOverlay2.style.display = 'flex';
                setTimeout(() => {
                    dialogOverlay2.classList.add('show');
                }, 100);
                dialog2Shown = true; // Устанавливаем флаг
                console.log('Второе диалоговое окно показано');
            } else {
                console.log('Второе диалоговое окно не найдено!');
            }
        }

        function hideDialog2() {
            const dialogOverlay2 = document.getElementById('dialogOverlay2');
            if (dialogOverlay2) {
                dialogOverlay2.classList.remove('show');
                setTimeout(() => {
                    dialogOverlay2.style.display = 'none';
                }, 500);
                dialog2Shown = false; // Сбрасываем флаг
                console.log('Второе диалоговое окно скрыто');
            }
        }

        function showDialog3() {
            if (dialog3Shown) return; // Предотвращаем множественный показ
            
            console.log('showDialog3 вызвана');
            const dialogOverlay3 = document.getElementById('dialogOverlay3');
            console.log('dialogOverlay3 найден:', dialogOverlay3);
            if (dialogOverlay3) {
                dialogOverlay3.style.display = 'flex';
                setTimeout(() => {
                    dialogOverlay3.classList.add('show');
                }, 100);
                dialog3Shown = true; // Устанавливаем флаг
                console.log('Третье диалоговое окно показано');
            } else {
                console.log('Третье диалоговое окно не найдено!');
            }
        }

        function hideDialog3() {
            const dialogOverlay3 = document.getElementById('dialogOverlay3');
            if (dialogOverlay3) {
                dialogOverlay3.classList.remove('show');
                setTimeout(() => {
                    dialogOverlay3.style.display = 'none';
                }, 500);
                dialog3Shown = false; // Сбрасываем флаг
                console.log('Третье диалоговое окно скрыто');
            }
        }

        function showDialog4() {
            if (dialog4Shown) return; // Предотвращаем множественный показ
            
            console.log('showDialog4 вызвана');
            const dialogOverlay4 = document.getElementById('dialogOverlay4');
            console.log('dialogOverlay4 найден:', dialogOverlay4);
            if (dialogOverlay4) {
                dialogOverlay4.style.display = 'flex';
                setTimeout(() => {
                    dialogOverlay4.classList.add('show');
                }, 100);
                dialog4Shown = true; // Устанавливаем флаг
                console.log('Четвертое диалоговое окно показано');
            } else {
                console.log('Четвертое диалоговое окно не найдено!');
            }
        }

        function hideDialog4() {
            const dialogOverlay4 = document.getElementById('dialogOverlay4');
            if (dialogOverlay4) {
                dialogOverlay4.classList.remove('show');
                setTimeout(() => {
                    dialogOverlay4.style.display = 'none';
                }, 500);
                dialog4Shown = false; // Сбрасываем флаг
                console.log('Четвертое диалоговое окно скрыто');
            }
        }
        
        // Отслеживание скролла для скрытия диалога
        function handleScroll() {
            const currentScrollY = window.scrollY;
            
            // Скрываем диалог только если скроллим выше точки его появления
            if (dialogShown && currentScrollY < dialogTriggerPoint) {
                console.log('Прошли точку появления диалога - скрываем');
                hideDialog();
            }
        }

        // Инициализация обработчиков игрового диалогового окна
        document.addEventListener('DOMContentLoaded', function() {
            // Добавляем обработчик скролла для скрытия диалога при скролле вверх
            window.addEventListener('scroll', handleScroll);
            
            
            
            // Инициализация слайдера знаковых личностей
            initPersonalitiesSlider();
            
            // Обновляем высоту .free_space
            updateFreeSpaceHeight();
            
            // Дополнительная синхронизация после создания ScrollTrigger
            setTimeout(() => {
                syncHeightWithScrollTrigger();
            }, 100);
            
            console.log('Игровое диалоговое окно инициализировано');
        });

        // Функция инициализации слайдера знаковых личностей
        function initPersonalitiesSlider() {
            const sliderTrack = document.getElementById('sliderTrack');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const dots = document.querySelectorAll('.dot');
            const cards = document.querySelectorAll('.personality-card');
            
            if (!sliderTrack || !prevBtn || !nextBtn) return;
            
            let currentSlide = 0;
            const totalSlides = cards.length;
            
            function updateSlider() {
                const translateX = -currentSlide * 100;
                sliderTrack.style.transform = `translateX(${translateX}%)`;
                
                // Обновляем активные точки
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentSlide);
                });
                
                // Обновляем активные карточки
                cards.forEach((card, index) => {
                    card.classList.toggle('active', index === currentSlide);
                });
            }
            
            function nextSlide() {
                currentSlide = (currentSlide + 1) % totalSlides;
                updateSlider();
            }
            
            function prevSlide() {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                updateSlider();
            }
            
            // Обработчики кнопок
            nextBtn.addEventListener('click', nextSlide);
            prevBtn.addEventListener('click', prevSlide);
            
            // Обработчики точек
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    currentSlide = index;
                    updateSlider();
                });
            });
            
            // Автоматическое переключение каждые 5 секунд
            setInterval(nextSlide, 5000);
            
            // Инициализация
            updateSlider();
        }

        // Функция для динамического расчета высоты .free_space
        function updateFreeSpaceHeight() {
            const freeSpace = document.querySelector('.free_space');
            if (freeSpace) {
                // Получаем длину скролла из ScrollTrigger
                const scrollLength = 4100; // Длина скролла в пикселях (должна совпадать с end: "+=7100px")
                
                // Вычисляем 50svh в пикселях
                const svh50 = window.innerHeight * 0.5; // 50svh = 50% от высоты viewport
                
                // Устанавливаем высоту: длина пути юрты минус 50svh
                const finalHeight = Math.max(scrollLength - svh50, 0); // Не меньше 0
                freeSpace.style.height = finalHeight + 'px';
                console.log('Высота .free_space обновлена до:', finalHeight + 'px (путь юрты:', scrollLength + 'px, минус 50svh:', svh50 + 'px)');
            }
        }

        // Функция для синхронизации высоты с ScrollTrigger
        function syncHeightWithScrollTrigger() {
            // Получаем все ScrollTrigger инстансы
            const triggers = ScrollTrigger.getAll();
            let maxScrollLength = 0;
            
            triggers.forEach(trigger => {
                if (trigger.end && typeof trigger.end === 'string' && trigger.end.includes('px')) {
                    const length = parseInt(trigger.end.replace('+=', ''));
                    if (length > maxScrollLength) {
                        maxScrollLength = length;
                    }
                }
            });
            
            if (maxScrollLength > 0) {
                const freeSpace = document.querySelector('.free_space');
                if (freeSpace) {
                    // Вычисляем 50svh в пикселях
                    const svh50 = window.innerHeight * 0.5; // 50svh = 50% от высоты viewport
                    
                    // Устанавливаем высоту: длина пути юрты минус 50svh
                    const finalHeight = Math.max(maxScrollLength - svh50, 0); // Не меньше 0
                    freeSpace.style.height = finalHeight + 'px';
                    console.log('Высота .free_space синхронизирована с ScrollTrigger:', finalHeight + 'px (путь юрты:', maxScrollLength + 'px, минус 50svh:', svh50 + 'px)');
                }
            }
        }

        // Инициализация GSAP и ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Замедление скорости скролла с помощью GSAP
        let scrollTween = null;
        let isScrollingManually = false;

        // Функция для плавного скролла с замедлением
        function smoothScrollTo(targetY) {
            if (scrollTween) {
                scrollTween.kill();
            }
            
            // Ограничиваем скролл в пределах документа
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const clampedY = Math.max(0, Math.min(targetY, maxScroll));
            
            scrollTween = gsap.to(window, {
                scrollTo: { y: clampedY },
                duration: 1.2, // Увеличиваем длительность для более плавного скролла
                ease: "power2.out",
                onStart: () => {
                    isScrollingManually = true;
                },
                onComplete: () => {
                    isScrollingManually = false;
                }
            });
        }

        // Перехват событий колеса мыши с замедлением
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Вычисляем скорость скролла
            const delta = e.deltaY;
            const scrollSpeed = 1.1; // Уменьшаем коэффициент для более медленного скролла
            
            const currentScrollY = window.scrollY;
            const newScrollY = currentScrollY + (delta * scrollSpeed);
            
            smoothScrollTo(newScrollY);
        }, { passive: false });

        // Обработка событий клавиатуры с замедлением
        window.addEventListener('keydown', (e) => {
            const scrollAmount = 80; // Уменьшаем шаг скролла
            let newScrollY = window.scrollY;
            
            switch(e.key) {
                case 'ArrowDown':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    newScrollY += scrollAmount;
                    break;
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    newScrollY -= scrollAmount;
                    break;
                case 'Home':
                    e.preventDefault();
                    newScrollY = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    newScrollY = document.body.scrollHeight;
                    break;
                default:
                    return;
            }
            
            smoothScrollTo(newScrollY);
        });

        
        // Анимации по скроллу для заголовков
        gsap.fromTo('.title', 
            { 
                opacity: 0, 
                x: 100,
                rotation: 5
            },
            {
                opacity: 1,
                x: 0,
                rotation: 0,
                duration: 1.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.title',
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Анимация подзаголовка
        gsap.fromTo('.title-subtitle', 
            { 
                opacity: 0, 
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                delay: 0.5,
                scrollTrigger: {
                    trigger: '.title',
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        

        // Анимация появления меню
        gsap.fromTo('.menu', 
            { 
                opacity: 0, 
                y: -50
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                delay: 0.5
            }
        );

        // Анимация второго блока
        gsap.fromTo('.section-title', 
            { 
                opacity: 0, 
                y: 50,
                scale: 0.8
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.content-section',
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        gsap.fromTo('.content-card', 
            { 
                opacity: 0, 
                y: 80,
                rotationX: 15
            },
            {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 1,
                ease: "power2.out",
                stagger: 0.2,
                scrollTrigger: {
                    trigger: '.content-grid',
                    start: "top 85%",
                    end: "bottom 15%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        

        // Улучшенная поддержка касания для таймлайна
        const timelineWrapper = document.querySelector('.timeline-wrapper');
        if (timelineWrapper) {
            let isScrolling = false;
            let startX = 0;
            let scrollLeft = 0;

            // Обработчики касания
            timelineWrapper.addEventListener('touchstart', (e) => {
                isScrolling = true;
                startX = e.touches[0].pageX - timelineWrapper.offsetLeft;
                scrollLeft = timelineWrapper.scrollLeft;
            });

            timelineWrapper.addEventListener('touchmove', (e) => {
                if (!isScrolling) return;
                e.preventDefault();
                const x = e.touches[0].pageX - timelineWrapper.offsetLeft;
                const walk = (x - startX) * 2; // Увеличиваем чувствительность
                timelineWrapper.scrollLeft = scrollLeft - walk;
            });

            timelineWrapper.addEventListener('touchend', () => {
                isScrolling = false;
            });

            // Обработчики мыши для десктопа
            timelineWrapper.addEventListener('mousedown', (e) => {
                isScrolling = true;
                startX = e.pageX - timelineWrapper.offsetLeft;
                scrollLeft = timelineWrapper.scrollLeft;
                timelineWrapper.style.cursor = 'grabbing';
            });

            timelineWrapper.addEventListener('mousemove', (e) => {
                if (!isScrolling) return;
                e.preventDefault();
                const x = e.pageX - timelineWrapper.offsetLeft;
                const walk = (x - startX) * 2;
                timelineWrapper.scrollLeft = scrollLeft - walk;
            });

            timelineWrapper.addEventListener('mouseup', () => {
                isScrolling = false;
                timelineWrapper.style.cursor = 'grab';
            });

            timelineWrapper.addEventListener('mouseleave', () => {
                isScrolling = false;
                timelineWrapper.style.cursor = 'grab';
            });

            // Устанавливаем курсор по умолчанию
            timelineWrapper.style.cursor = 'grab';
        }

        // Анимация перемещения и поворота юрты по скроллу
        let isScrolling = false;
        let originalYurtPosition = { x: 0, y: 0, z: 0 };
        let originalYurtRotation = { x: 0, y: 0, z: 0 };
        
        // Целевые значения для юрты
        const targetPosition = { x: -1.5, y: 6, z: 0.3 };
        const targetRotation = { x: 4.8, y: 9.5, z: 0 };
        
        // Вторые целевые значения для юрты
        const targetPosition2 = { x: -0.5, y: 9, z: 0.6 };
        const targetRotation2 = { x: 4.7, y: 9.3, z: 0 };
        
        // Третьи целевые значения для юрты
        const targetPosition3 = { x: -0.5, y: 11, z: 0.6 };
        const targetRotation3 = { x: 4.7, y: 10.5, z: 0 };
        
        // Четвертые целевые значения для юрты
        const targetPosition4 = { x: -0.5, y: 11, z: 0.6 };
        const targetRotation4 = { x: 4.7, y: 9.5, z: 0 };
        
        // Пятые целевые значения для юрты
        const targetPosition5 = { x: -0.5, y: 11, z: 0.6 };
        const targetRotation5 = { x: 4.7, y: 7.5, z: 0 };
        
        // Шестые целевые значения для юрты
        const targetPosition6 = { x: -0.5, y: 11, z: 0.6 };
        const targetRotation6 = { x: 4.7, y: 5.8, z: 0 };
        
        // Седьмые целевые значения для юрты
        const targetPosition7 = { x: -0.5, y: 13, z: 0.6 };
        const targetRotation7 = { x: 4.7, y: 5.8, z: 0 };
        
        ScrollTrigger.create({
            trigger: "body",
            start: "top top",
            end: "+=4100px", // Увеличиваем общую длину для семи этапов + паузы
            scrub: 1,
            onUpdate: (self) => {
                isScrolling = self.progress > 0.01;
                
                // Отладка прогресса скролла
                if (self.progress > 0.95) {
                    console.log('Прогресс скролла:', self.progress);
                }
                
                // Управление первым диалоговым окном (показываем сразу при достижении второго чекпоинта)
                if (self.progress >= 0.2 && self.progress < 0.25) {
                    if (!dialogShown) {
                        console.log('Достигнут второй чекпоинт - показываем первое диалоговое окно');
                        showDialog();
                    }
                } else {
                    if (dialogShown) {
                        console.log('Скролл вне зоны первого диалога - скрываем');
                        hideDialog();
                    }
                }
                
                // Сбрасываем эффект перспективы при скролле
                if (isScrolling) {
                    const canvas = renderer.domElement;
                    canvas.style.transform = 'translate3d(0px, 0px, 0)';
                }
                
                if (yurtModel) {
                    // Сохраняем изначальные значения при первом скролле
                    if (self.progress === 0) {
                        originalYurtPosition.x = yurtModel.position.x;
                        originalYurtPosition.y = yurtModel.position.y;
                        originalYurtPosition.z = yurtModel.position.z;
                        originalYurtRotation.x = yurtModel.rotation.x;
                        originalYurtRotation.y = yurtModel.rotation.y;
                        originalYurtRotation.z = yurtModel.rotation.z;
                    }
                    
                    // Фиксированное позиционирование канваса
                    const yurtCanvas = document.getElementById('yurtCanvas');
                    yurtCanvas.style.position = 'fixed';
                    yurtCanvas.style.top = '0';
                    yurtCanvas.style.left = '0';
                    yurtCanvas.style.zIndex = '2';
                    
                    // Определяем этапы анимации с паузами
                    const firstStageEnd = 0.07; // 7% - конец первого этапа
                    const firstPauseStart = 0.07; // 7% - начало первой паузы
                    const firstPauseEnd = 0.08; // 8% - конец первой паузы (сокращено)
                    const secondStageStart = 0.1; // 10% - начало второго этапа
                    const secondPauseStart = 0.18; // 18% - начало второй паузы
                    const secondPauseEnd = 0.21; // 21% - конец второй паузы (100px)
                    const thirdStageStart = 0.45; // 45% - начало третьего этапа
                    const thirdPauseStart = 0.52; // 52% - начало третьей паузы
                    const thirdPauseEnd = 0.55; // 55% - конец третьей паузы (100px)
                    const fourthStageStart = 0.63; // 63% - начало четвертого этапа
                    const fourthPauseStart = 0.7; // 70% - начало четвертой паузы
                    const fourthPauseEnd = 0.73; // 73% - конец четвертой паузы (100px)
                    const fifthStageStart = 0.76; // 76% - начало пятого этапа
                    const fifthPauseStart = 0.83; // 83% - начало пятой паузы
                    const fifthPauseEnd = 0.86; // 86% - конец пятой паузы (100px)
                    const sixthStageStart = 0.89; // 89% - начало шестого этапа
                    const sixthPauseStart = 0.96; // 96% - начало шестой паузы
                    const sixthPauseEnd = 0.99; // 99% - конец шестой паузы (100px)
                    const seventhStageStart = 0.99; // 99% - начало седьмого этапа
                    
                    let currentProgress = self.progress;
                    
                    if (currentProgress <= firstStageEnd) {
                        // Первый этап: движение к первой цели
                        const stageProgress = currentProgress / firstStageEnd;
                        
                        yurtModel.position.x = originalYurtPosition.x + (targetPosition.x - originalYurtPosition.x) * stageProgress;
                        yurtModel.position.y = originalYurtPosition.y + (targetPosition.y - originalYurtPosition.y) * stageProgress;
                        yurtModel.position.z = originalYurtPosition.z + (targetPosition.z - originalYurtPosition.z) * stageProgress;
                        
                        yurtModel.rotation.x = originalYurtRotation.x + (targetRotation.x - originalYurtRotation.x) * stageProgress;
                        yurtModel.rotation.y = originalYurtRotation.y + (targetRotation.y - originalYurtRotation.y) * stageProgress;
                        yurtModel.rotation.z = originalYurtRotation.z + (targetRotation.z - originalYurtRotation.z) * stageProgress;
                        
                        // Показываем/скрываем текст в зависимости от прогресса
                        const targetText = document.querySelector('.yurt-target-text');
                        if (targetText) {
                            if (stageProgress >= 0.8) {
                                gsap.to(targetText, {
                                    opacity: 1,
                                    x: 0,
                                    duration: 0.5,
                                    ease: "power2.out"
                                });
                            } else {
                                gsap.to(targetText, {
                                    opacity: 0,
                                    x: 50,
                                    duration: 0.3,
                                    ease: "power2.out"
                                });
                            }
                        }
                        
                    } else if (currentProgress >= firstPauseStart && currentProgress <= firstPauseEnd) {
                        // Первая пауза: юрта остается в первой позиции
                        yurtModel.position.x = targetPosition.x;
                        yurtModel.position.y = targetPosition.y;
                        yurtModel.position.z = targetPosition.z;
                        yurtModel.rotation.x = targetRotation.x;
                        yurtModel.rotation.y = targetRotation.y;
                        yurtModel.rotation.z = targetRotation.z;
                        
                    } else if (currentProgress >= secondStageStart && currentProgress < secondPauseStart) {
                        // Второй этап: движение ко второй цели
                        const stageProgress = (currentProgress - secondStageStart) / (secondPauseStart - secondStageStart);
                        
                        yurtModel.position.x = targetPosition.x + (targetPosition2.x - targetPosition.x) * stageProgress;
                        yurtModel.position.y = targetPosition.y + (targetPosition2.y - targetPosition.y) * stageProgress;
                        yurtModel.position.z = targetPosition.z + (targetPosition2.z - targetPosition.z) * stageProgress;
                        
                        yurtModel.rotation.x = targetRotation.x + (targetRotation2.x - targetRotation.x) * stageProgress;
                        yurtModel.rotation.y = targetRotation.y + (targetRotation2.y - targetRotation.y) * stageProgress;
                        yurtModel.rotation.z = targetRotation.z + (targetRotation2.z - targetRotation.z) * stageProgress;
                        
                        // Скрываем текст в начале второго этапа
                        const targetText = document.querySelector('.yurt-target-text');
                        if (targetText) {
                            gsap.to(targetText, {
                                opacity: 0,
                                x: 50,
                                duration: 0.3,
                                ease: "power2.out"
                            });
                        }
                        
                    } else if (currentProgress >= secondPauseStart && currentProgress <= secondPauseEnd) {
                        // Вторая пауза: юрта остается во второй позиции
                        yurtModel.position.x = targetPosition2.x;
                        yurtModel.position.y = targetPosition2.y;
                        yurtModel.position.z = targetPosition2.z;
                        yurtModel.rotation.x = targetRotation2.x;
                        yurtModel.rotation.y = targetRotation2.y;
                        yurtModel.rotation.z = targetRotation2.z;
                        
                    } else if (currentProgress > thirdStageStart && currentProgress < thirdPauseStart) {
                        // Третий этап: движение к третьей цели
                        const stageProgress = (currentProgress - thirdStageStart) / (thirdPauseStart - thirdStageStart);
                        
                        yurtModel.position.x = targetPosition2.x + (targetPosition3.x - targetPosition2.x) * stageProgress;
                        yurtModel.position.y = targetPosition2.y + (targetPosition3.y - targetPosition2.y) * stageProgress;
                        yurtModel.position.z = targetPosition2.z + (targetPosition3.z - targetPosition2.z) * stageProgress;
                        
                        yurtModel.rotation.x = targetRotation2.x + (targetRotation3.x - targetRotation2.x) * stageProgress;
                        yurtModel.rotation.y = targetRotation2.y + (targetRotation3.y - targetRotation2.y) * stageProgress;
                        yurtModel.rotation.z = targetRotation2.z + (targetRotation3.z - targetRotation2.z) * stageProgress;
                        
                        // Скрываем первое диалоговое окно при переходе к третьему этапу
                        if (dialogShown) {
                            console.log('Скрываем первое диалоговое окно при переходе к третьему этапу');
                            hideDialog();
                        }
                        
                        // Скрываем второе диалоговое окно при движении
                        if (dialog2Shown) {
                            console.log('Скрываем второе диалоговое окно при движении');
                            hideDialog2();
                        }
                        
                    } else if (currentProgress >= thirdPauseStart && currentProgress <= thirdPauseEnd) {
                        // Третья пауза: юрта остается в третьей позиции
                        yurtModel.position.x = targetPosition3.x;
                        yurtModel.position.y = targetPosition3.y;
                        yurtModel.position.z = targetPosition3.z;
                        yurtModel.rotation.x = targetRotation3.x;
                        yurtModel.rotation.y = targetRotation3.y;
                        yurtModel.rotation.z = targetRotation3.z;
                        
                        // Показываем второе диалоговое окно на протяжении всей паузы
                        if (!dialog2Shown) {
                            console.log('Показываем второе диалоговое окно во время паузы');
                            showDialog2();
                        }
                        
                    } else if (currentProgress > fourthStageStart && currentProgress < fourthPauseStart) {
                        // Четвертый этап: движение к четвертой цели
                        const stageProgress = (currentProgress - fourthStageStart) / (fourthPauseStart - fourthStageStart);
                        
                        yurtModel.position.x = targetPosition3.x + (targetPosition4.x - targetPosition3.x) * stageProgress;
                        yurtModel.position.y = targetPosition3.y + (targetPosition4.y - targetPosition3.y) * stageProgress;
                        yurtModel.position.z = targetPosition3.z + (targetPosition4.z - targetPosition3.z) * stageProgress;
                        
                        yurtModel.rotation.x = targetRotation3.x + (targetRotation4.x - targetRotation3.x) * stageProgress;
                        yurtModel.rotation.y = targetRotation3.y + (targetRotation4.y - targetRotation3.y) * stageProgress;
                        yurtModel.rotation.z = targetRotation3.z + (targetRotation4.z - targetRotation3.z) * stageProgress;
                        
                        // Скрываем предыдущие диалоги при переходе к четвертому этапу
                        if (dialog2Shown) {
                            console.log('Скрываем второе диалоговое окно при переходе к четвертому этапу');
                            hideDialog2();
                        }
                        
                        // Скрываем третье диалоговое окно при движении
                        if (dialog3Shown) {
                            console.log('Скрываем третье диалоговое окно при движении');
                            hideDialog3();
                        }
                        
                    } else if (currentProgress >= fourthPauseStart && currentProgress <= fourthPauseEnd) {
                        // Четвертая пауза: юрта остается в четвертой позиции
                        yurtModel.position.x = targetPosition4.x;
                        yurtModel.position.y = targetPosition4.y;
                        yurtModel.position.z = targetPosition4.z;
                        yurtModel.rotation.x = targetRotation4.x;
                        yurtModel.rotation.y = targetRotation4.y;
                        yurtModel.rotation.z = targetRotation4.z;
                        
                        // Показываем третье диалоговое окно на протяжении всей паузы
                        if (!dialog3Shown) {
                            console.log('Показываем третье диалоговое окно во время паузы');
                            showDialog3();
                        }
                        
                    } else if (currentProgress > fifthStageStart && currentProgress < fifthPauseStart) {
                        // Пятый этап: движение к пятой цели
                        const stageProgress = (currentProgress - fifthStageStart) / (fifthPauseStart - fifthStageStart);
                        
                        yurtModel.position.x = targetPosition4.x + (targetPosition5.x - targetPosition4.x) * stageProgress;
                        yurtModel.position.y = targetPosition4.y + (targetPosition5.y - targetPosition4.y) * stageProgress;
                        yurtModel.position.z = targetPosition4.z + (targetPosition5.z - targetPosition4.z) * stageProgress;
                        
                        yurtModel.rotation.x = targetRotation4.x + (targetRotation5.x - targetRotation4.x) * stageProgress;
                        yurtModel.rotation.y = targetRotation4.y + (targetRotation5.y - targetRotation4.y) * stageProgress;
                        yurtModel.rotation.z = targetRotation4.z + (targetRotation5.z - targetRotation4.z) * stageProgress;
                        
                        // Скрываем предыдущие диалоги при переходе к пятому этапу
                        if (dialog3Shown) {
                            console.log('Скрываем третье диалоговое окно при переходе к пятому этапу');
                            hideDialog3();
                        }
                        
                        // Изменяем фон space_1 при достижении 5 чекпоинта
                        if (stageProgress >= 0.3) {
                            const space1 = document.getElementById('space_1');
                            if (space1) {
                                space1.style.background = 'linear-gradient(90deg, var(--primary-color) 0%, var(--rhino) 100%)';
                                space1.style.transition = 'background 1s ease-in-out';
                            }
                        } else {
                            // Возвращаем исходный фон space_1 при скролле обратно
                            const space1 = document.getElementById('space_1');
                            if (space1) {
                                space1.style.background = ''; // Возвращаем исходный фон
                                space1.style.transition = 'background 1s ease-in-out';
                            }
                        }
                        
                        // Скрываем четвертое диалоговое окно при движении
                        if (dialog4Shown) {
                            console.log('Скрываем четвертое диалоговое окно при движении');
                            hideDialog4();
                        }
                        
                    } else if (currentProgress >= fifthPauseStart && currentProgress <= fifthPauseEnd) {
                        // Пятая пауза: юрта остается в пятой позиции
                        yurtModel.position.x = targetPosition5.x;
                        yurtModel.position.y = targetPosition5.y;
                        yurtModel.position.z = targetPosition5.z;
                        yurtModel.rotation.x = targetRotation5.x;
                        yurtModel.rotation.y = targetRotation5.y;
                        yurtModel.rotation.z = targetRotation5.z;
                        
                        // Показываем четвертое диалоговое окно на протяжении всей паузы
                        if (!dialog4Shown) {
                            console.log('Показываем четвертое диалоговое окно во время паузы');
                            showDialog4();
                        }
                        
                    } else if (currentProgress > sixthStageStart && currentProgress < sixthPauseStart) {
                        // Шестой этап: движение к шестой цели
                        const stageProgress = (currentProgress - sixthStageStart) / (sixthPauseStart - sixthStageStart);
                        
                        yurtModel.position.x = targetPosition5.x + (targetPosition6.x - targetPosition5.x) * stageProgress;
                        yurtModel.position.y = targetPosition5.y + (targetPosition6.y - targetPosition5.y) * stageProgress;
                        yurtModel.position.z = targetPosition5.z + (targetPosition6.z - targetPosition5.z) * stageProgress;
                        
                        yurtModel.rotation.x = targetRotation5.x + (targetRotation6.x - targetRotation5.x) * stageProgress;
                        yurtModel.rotation.y = targetRotation5.y + (targetRotation6.y - targetRotation5.y) * stageProgress;
                        yurtModel.rotation.z = targetRotation5.z + (targetRotation6.z - targetRotation5.z) * stageProgress;
                        
                        // Скрываем предыдущие диалоги при переходе к шестому этапу
                        if (dialog4Shown) {
                            console.log('Скрываем четвертое диалоговое окно при переходе к шестому этапу');
                            hideDialog4();
                        }
                        
                    } else if (currentProgress >= sixthPauseStart && currentProgress <= sixthPauseEnd) {
                        // Шестая пауза: юрта остается в шестой позиции
                        yurtModel.position.x = targetPosition6.x;
                        yurtModel.position.y = targetPosition6.y;
                        yurtModel.position.z = targetPosition6.z;
                        yurtModel.rotation.x = targetRotation6.x;
                        yurtModel.rotation.y = targetRotation6.y;
                        yurtModel.rotation.z = targetRotation6.z;
                        
                    } else if (currentProgress > seventhStageStart) {
                        // Седьмой этап: движение к седьмой цели
                        const stageProgress = (currentProgress - seventhStageStart) / (1 - seventhStageStart);
                        
                        yurtModel.position.x = targetPosition6.x + (targetPosition7.x - targetPosition6.x) * stageProgress;
                        yurtModel.position.y = targetPosition6.y + (targetPosition7.y - targetPosition6.y) * stageProgress;
                        yurtModel.position.z = targetPosition6.z + (targetPosition7.z - targetPosition6.z) * stageProgress;
                        
                        yurtModel.rotation.x = targetRotation6.x + (targetRotation7.x - targetRotation6.x) * stageProgress;
                        yurtModel.rotation.y = targetRotation6.y + (targetRotation7.y - targetRotation6.y) * stageProgress;
                        yurtModel.rotation.z = targetRotation6.z + (targetRotation7.z - targetRotation6.z) * stageProgress;
                        
                        // Скрываем канвас и techGrid при достижении последнего чекпоинта
                        if (stageProgress >= 0.5) {
                            const canvas = document.querySelector('canvas');
                            const techGrid = document.getElementById('techGrid');
                            const gameSection = document.querySelector('.game-section');
                            
                            if (canvas) {
                                canvas.style.opacity = '0';
                                canvas.style.transition = 'opacity 1s ease-out';
                            }
                            
                            if (techGrid) {
                                techGrid.style.opacity = '0';
                                techGrid.style.transition = 'opacity 1s ease-out';
                            }
                            
                            if (gameSection) {
                                gameSection.style.zIndex = '5';
                                gameSection.style.transition = 'z-index 1s ease-out';
                            }
                        } else {
                            // Возвращаем канвас и techGrid в исходное состояние при скролле обратно
                            const canvas = document.querySelector('canvas');
                            const techGrid = document.getElementById('techGrid');
                            const gameSection = document.querySelector('.game-section');
                            
                            if (canvas) {
                                canvas.style.opacity = '1';
                                canvas.style.transition = 'opacity 1s ease-in';
                            }
                            
                            if (techGrid) {
                                techGrid.style.opacity = '1';
                                techGrid.style.transition = 'opacity 1s ease-in';
                            }
                            
                            if (gameSection) {
                                gameSection.style.zIndex = '';
                                gameSection.style.transition = 'z-index 1s ease-in';
                            }
                        }
                    }
                }
            },
            onComplete: () => {
                console.log('ScrollTrigger onComplete вызван');
                // При завершении скролла юрта остается в седьмой позиции
                if (yurtModel) {
                    yurtModel.position.x = targetPosition7.x;
                    yurtModel.position.y = targetPosition7.y;
                    yurtModel.position.z = targetPosition7.z;
                    yurtModel.rotation.x = targetRotation7.x;
                    yurtModel.rotation.y = targetRotation7.y;
                    yurtModel.rotation.z = targetRotation7.z;
                }
                
                // Скрываем текст при завершении
                const targetText = document.querySelector('.yurt-target-text');
                if (targetText) {
                    gsap.to(targetText, {
                        opacity: 0,
                        x: 50,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
                
                // Показываем диалоговое окно
                console.log('Вызываем showDialog из onComplete');
                showDialog();
            },
            onReverseComplete: () => {
                // При возврате к началу скролла возвращаем к изначальным значениям
                if (yurtModel) {
                    gsap.to(yurtModel.position, {
                        x: originalYurtPosition.x,
                        y: originalYurtPosition.y,
                        z: originalYurtPosition.z,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                    gsap.to(yurtModel.rotation, {
                        x: originalYurtRotation.x,
                        y: originalYurtRotation.y,
                        z: originalYurtRotation.z,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                }
                
                // Скрываем текст при возврате к началу
                const targetText = document.querySelector('.yurt-target-text');
                if (targetText) {
                    gsap.to(targetText, {
                        opacity: 0,
                        x: 50,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
                
                // Скрываем диалоговое окно при возврате к началу
                console.log('Возврат к началу - скрываем диалог');
                hideDialog();
            }
        });

        // Игровая логика
        let gameState = {
            currentRegion: null,
            completedRegions: new Set(),
            bonusQuestionsShown: new Set(),
            lives: 5,
            maxLives: 5
        };

        // Условия для дополнительных вопросов
        const bonusQuestionConditions = [1, 6, 13, 19];
        
        // Данные дополнительных вопросов
        const bonusQuestions = {
            1: {
                text: "Какой город является столицей Казахстана?",
                answers: ["Алматы", "Астана", "Шымкент", "Актобе"],
                correct: 1
            },
            6: {
                text: "Сколько областей в Казахстане?",
                answers: ["14", "17", "20", "12"],
                correct: 1
            },
            13: {
                text: "Какая река протекает через Алматы?",
                answers: ["Иртыш", "Сырдарья", "Большая Алматинка", "Урал"],
                correct: 2
            },
            19: {
                text: "В каком году Казахстан получил независимость?",
                answers: ["1990", "1991", "1992", "1989"],
                correct: 1
            }
        };

        // Названия регионов для тултипов
        const regionNames = {
            'KZ11': 'Акмолинская область',
            'KZ15': 'Актюбинская область', 
            'KZ19': 'Алматинская область',
            'KZ23': 'Атырауская область',
            'KZ31': 'Жамбылская область',
            'KZ39': 'Костанайская область',
            'KZ43': 'Кызылординская область',
            'KZ47': 'Мангистауская область',
            'KZ59': 'Северо-Казахстанская область',
            'KZ71': 'Астана',
            'KZ75': 'Алматы',
            'KZ10': 'Абайская область',
            'KZ33': 'Жетысуская область',
            'KZ63': 'Восточно-Казахстанская область',
            'KZ62': 'Улытауская область',
            'KZ55': 'Павлодарская область',
            'KZ79': 'Шымкент',
            'KZ61': 'Туркестанская область',
            'KZ27': 'Западно-Казахстанская область',
            'KZ35': 'Карагандинская область'
        };

        // Добавляем обработчики событий для регионов карты
        document.addEventListener('DOMContentLoaded', function() {
            // Отладочная информация
            console.log('Доступные регионы:', Object.keys(regionNames));
            // Добавляем обработчики кликов к SVG путям регионов
            const regionPaths = document.querySelectorAll('#kzmap path[id^="KZ"]');
            regionPaths.forEach(path => {
                // Делаем регион кликабельным
                path.style.cursor = 'pointer';
                path.style.transition = 'all 0.3s ease';
                
                // Добавляем тултип с правильным названием
                const regionId = path.id;
                const regionName = regionNames[regionId] || regionId;
                path.setAttribute('title', regionName);
                console.log(`Регион ${regionId}: ${regionName}`);
                
                // Добавляем эффект при наведении
                path.addEventListener('mouseenter', function() {
                    if (!gameState.completedRegions.has(this.id)) {
                        this.style.fill = '#343F71';
                        this.style.opacity = '0.8';
                    }
                });
                
                path.addEventListener('mouseleave', function() {
                    if (!gameState.completedRegions.has(this.id)) {
                        this.style.fill = '';
                        this.style.opacity = '';
                    }
                });
                
                // Обработчик клика
                path.addEventListener('click', function() {
                    const regionId = this.id;
                    if (regionId && !gameState.completedRegions.has(regionId)) {
                        openQuestion(regionId);
                    }
                });
            });
            
            // Добавляем обработчики кликов к кругам регионов
            const regionCircles = document.querySelectorAll('#kzmap circle[id^="KZ"]');
            regionCircles.forEach(circle => {
                // Делаем регион кликабельным
                circle.style.cursor = 'pointer';
                circle.style.transition = 'all 0.3s ease';
                
                // Добавляем тултип с правильным названием
                const regionId = circle.id;
                const regionName = regionNames[regionId] || regionId;
                circle.setAttribute('title', regionName);
                console.log(`Регион ${regionId}: ${regionName}`);
                
                // Добавляем эффект при наведении
                circle.addEventListener('mouseenter', function() {
                    if (!gameState.completedRegions.has(this.id)) {
                        this.style.fill = '#F34C19';
                        this.style.opacity = '0.8';
                    }
                });
                
                circle.addEventListener('mouseleave', function() {
                    if (!gameState.completedRegions.has(this.id)) {
                        this.style.fill = '';
                        this.style.opacity = '';
                    }
                });
                
                // Обработчик клика
                circle.addEventListener('click', function() {
                    const regionId = this.id;
                    if (regionId && !gameState.completedRegions.has(regionId)) {
                        openQuestion(regionId);
                    }
                });
            });
        });

        // Глобальные функции для игры
        window.startGame = function() {
            const gameIntro = document.getElementById('gameIntro');
            const gameMap = document.getElementById('gameMap');
            const rulesModal = document.getElementById('rulesModal');
            
            if (gameIntro && gameMap && rulesModal) {
                gameIntro.style.display = 'none';
                gameMap.style.display = 'block';
                rulesModal.style.display = 'flex';
                
                // Инициализируем отображение жизней
                updateLivesDisplay();
                
                // Центрируем карту на экране
                centerMapOnScreen();
            }
        };

        // Функция для центрирования карты на экране
        function centerMapOnScreen() {
            const gameMap = document.getElementById('gameMap');
            if (gameMap) {
                // Плавно прокручиваем к карте
                gameMap.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
                
                // Дополнительная задержка для плавности
                setTimeout(() => {
                    gameMap.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'center'
                    });
                }, 100);
            }
        }

        // Функция для случайного перемешивания массива (алгоритм Фишера-Йетса)
        function shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        // Функция для показа надписи "Правильно"
        function showCorrectAnswerFeedback() {
            const modal = document.getElementById('questionModal');
            if (modal) {
                const answers = modal.querySelector('#answers');
                if (answers) {
                    // Скрываем кнопки ответов
                    answers.style.display = 'none';
                    
                    // Создаем элемент с надписью "Правильно"
                    const feedbackDiv = document.createElement('div');
                    feedbackDiv.className = 'correct-feedback';
                    feedbackDiv.innerHTML = `
                        <div style="
                            text-align: center;
                            padding: 20px;
                            background: linear-gradient(135deg, #4CAF50, #45a049);
                            color: white;
                            border-radius: 10px;
                            font-size: 1.2rem;
                            font-weight: bold;
                            animation: correctPulse 0.6s ease-in-out;
                        ">
                            Правильно! 🎉
                        </div>
                    `;
                    
                    // Добавляем стили для анимации
                    if (!document.getElementById('correctFeedbackStyles')) {
                        const style = document.createElement('style');
                        style.id = 'correctFeedbackStyles';
                        style.textContent = `
                            @keyframes correctPulse {
                                0% { transform: scale(0.8); opacity: 0; }
                                50% { transform: scale(1.1); opacity: 1; }
                                100% { transform: scale(1); opacity: 1; }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                    
                    // Вставляем надпись
                    modal.querySelector('.modal-content').appendChild(feedbackDiv);
                }
            }
        }

        // База данных вопросов для регионов
        const regionQuestions = {
            'KZ43': { // Кызылординская область
                question: 'Кызылординская область занимает первое место в Казахстане по запасам…',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz43.webp', // URL изображения для вопроса
                answers: [
                    { text: 'Ванадия', value: 'A', correct: true },
                    { text: 'Полония', value: 'B', correct: false },
                    { text: 'Плутония', value: 'C', correct: false },
                    { text: 'Лития', value: 'D', correct: false }
                ]
            },
            'KZ31': { // Жамбылская область
                question: 'Если двигаться на машине по Жамбылской области в южном направлении, то можно попасть в…',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz31.webp', // URL изображения для вопроса
                answers: [
                    { text: 'В Кыргызстан', value: 'A', correct: true },
                    { text: 'В Узбекистан', value: 'B', correct: false },
                    { text: 'В Чудную долину', value: 'C', correct: false },
                    { text: 'В Туркменистан', value: 'D', correct: false }
                ]
            },
            'KZ62': { // Улытауская область
                question: 'В Улытауской области всего три города. Один из них – Жезказган. Назовите два других.',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz62.webp',
                answers: [
                    { text: 'Сатпаев и Каражал', value: 'A', correct: true },
                    { text: 'Каражал и Агадырь', value: 'B', correct: false },
                    { text: 'Сатпаев и Конаев', value: 'C', correct: false },
                    { text: 'Сатпаев и Актас', value: 'D', correct: false }
                ]
            },
            'KZ10': { // Абайская область
                question: 'В крупнейшем городе Абайской области Семее есть знаменитый подвесной мост. Какова его протяженность?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz10.webp',
                answers: [
                    { text: '1086 м', value: 'A', correct: true },
                    { text: '715 м', value: 'B', correct: false },
                    { text: '835 м', value: 'C', correct: false },
                    { text: '952 м', value: 'D', correct: false }
                ]
            },
            'KZ35': { // Карагандинская область
                question: 'Какой подарок обычно приносят гости на тои в Карагандинской области?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz35.webp',
                answers: [
                    { text: 'Конверт с деньгами', value: 'A', correct: true },
                    { text: 'Мешок угля', value: 'B', correct: false },
                    { text: 'Набор респираторных масок', value: 'C', correct: false },
                    { text: 'Кепки GGG', value: 'D', correct: false }
                ]
            },
            'KZ19': { // Алматинская область
                question: 'Кого можно встретить в горах Алматинской области?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz19.webp',
                answers: [
                    { text: 'Снежного барса', value: 'A', correct: true },
                    { text: 'Снежного человека', value: 'B', correct: false },
                    { text: 'Снежного единорога', value: 'C', correct: false },
                    { text: 'Снежную королеву', value: 'D', correct: false }
                ]
            },
            'KZ47': { // Мангистауская область
                question: 'Что предпринимают в Мангистауской области, чтобы догнать Турцию в сфере туризма?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz47.webp',
                answers: [
                    { text: 'Строят отели и улучшают инфраструктуру', value: 'A', correct: true },
                    { text: 'Заказывают песок с турецких пляжей', value: 'B', correct: false },
                    { text: 'Пытаются изменить климат', value: 'C', correct: false },
                    { text: 'Предлагают туристам безлимитное количество кумыса', value: 'D', correct: false }
                ]
            },
            'KZ79': { // Туркестанская область
                question: 'Шымкент называют "казахским Техасом", потому что…',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz79.webp',
                answers: [
                    { text: 'Там тоже жарко и есть свой неповторимый колорит', value: 'A', correct: true },
                    { text: 'Там тоже все ходят в шляпах и любят лошадей', value: 'B', correct: false },
                    { text: 'Там тоже котируется Республиканская партия', value: 'C', correct: false },
                    { text: 'Там тоже много мексиканцев', value: 'D', correct: false }
                ]
            },
            'KZ23': { // Атырауская область
                question: 'Что делает состоятельный житель Атырауской области, когда не знает, на что потратить деньги?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz23.webp',
                answers: [
                    { text: 'Откладывает на будущее', value: 'A', correct: true },
                    { text: 'Покупает небольшую нефтяную вышку', value: 'B', correct: false },
                    { text: 'Покупает полупрофессиональный футбольный клуб', value: 'C', correct: false },
                    { text: 'Приобретает очередную квартиру в Астане', value: 'D', correct: false }
                ]
            },
            'KZ63': { // Восточно-Казахстанская область
                question: 'Самая высокая точка Восточно-Казахстанской области – это гора …',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz63.webp',
                answers: [
                    { text: 'Белуха', value: 'A', correct: true },
                    { text: 'Синюха', value: 'B', correct: false },
                    { text: 'Краснуха', value: 'C', correct: false },
                    { text: 'Желтуха', value: 'D', correct: false }
                ]
            },
            'KZ33': { // Жетысуская область
                question: 'Название области Жетысу отсылает нас к семи рекам, причем их перечень, в зависимости от источника, разнится. Назовите реку, которая безоговорочно входит в любой из списков.',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz33.webp',
                answers: [
                    { text: 'Или', value: 'A', correct: true },
                    { text: 'Чу', value: 'B', correct: false },
                    { text: 'Чилик', value: 'C', correct: false },
                    { text: 'Иртыш', value: 'D', correct: false }
                ]
            },
            'KZ75': { // Алматы
                question: 'Чем обычно занимаются жители Алматы в будние дни с 9 утра до 6 вечера?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz75.webp',
                answers: [
                    { text: 'Работают', value: 'A', correct: true },
                    { text: 'Катаются на лыжах на Шымбулаке', value: 'B', correct: false },
                    { text: 'Сидят в кофейнях и болтают по телефону', value: 'C', correct: false },
                    { text: 'Ругают акима', value: 'D', correct: false }
                ]
            },
            'KZ71': { // Астана
                question: 'Какой из перечисленных объектов Астаны был построен самым последним?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz71.webp',
                answers: [
                    { text: 'Mega Silk Way', value: 'A', correct: true },
                    { text: '"Астана Арена"', value: 'B', correct: false },
                    { text: 'Дворец мира и согласия ("Пирамида")', value: 'C', correct: false },
                    { text: '"Астана Опера"', value: 'D', correct: false }
                ]
            },
            'KZ59': { // Северо-Казахстанская область
                question: 'В главном городе СКО Петропавловске есть суши-бар под названием …',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz59.webp',
                answers: [
                    { text: 'Шире Щёки', value: 'A', correct: true },
                    { text: 'Уже Талия', value: 'B', correct: false },
                    { text: 'Меньше Уши', value: 'C', correct: false },
                    { text: 'Реже Волосы', value: 'D', correct: false }
                ]
            },
            'KZ61': { // Туркестанская область (второй вопрос)
                question: 'Назовите европейскую страну, в которой живет больше человек, чем в Туркестанской области.',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz61-2.webp',
                answers: [
                    { text: 'Албания', value: 'A', correct: true },
                    { text: 'Эстония', value: 'B', correct: false },
                    { text: 'Латвия', value: 'C', correct: false },
                    { text: 'Черногория', value: 'D', correct: false }
                ]
            },
            'KZ11': { // Акмолинская область
                question: 'Как называется футбольный клуб, представляющий крупнейший город Акмолинской области?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz11.webp',
                answers: [
                    { text: '"Окжетпес"', value: 'A', correct: true },
                    { text: '"Кызыл-Жар"', value: 'B', correct: false },
                    { text: '"Иртыш"', value: 'C', correct: false },
                    { text: '"Астана"', value: 'D', correct: false }
                ]
            },
            'KZ55': { // Павлодарская область
                question: 'Где именно родился выходец из Павлодарской области диджей Imanbek?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz55.webp',
                answers: [
                    { text: 'В Аксу', value: 'A', correct: true },
                    { text: 'В Экибастузе', value: 'B', correct: false },
                    { text: 'В Баянауле', value: 'C', correct: false },
                    { text: 'В Шарбакты', value: 'D', correct: false }
                ]
            },
            'KZ15': { // Актюбинская область
                question: 'Чей памятник можно увидеть перед зданием областного акимата в Актобе?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz15.webp',
                answers: [
                    { text: 'Абулхаир хана', value: 'A', correct: true },
                    { text: 'Богенбай батыра', value: 'B', correct: false },
                    { text: 'Керей хана', value: 'C', correct: false },
                    { text: 'Кобланды батыра', value: 'D', correct: false }
                ]
            },
            'KZ27': { // Западно-Казахстанская область
                question: 'Какого музея нет в административном центре ЗКО Уральске?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz27.webp',
                answers: [
                    { text: 'Музея первого президента', value: 'A', correct: true },
                    { text: 'Музея Александра Пушкина', value: 'B', correct: false },
                    { text: 'Музея Маншук Маметовой', value: 'C', correct: false },
                    { text: 'Музея Сакена Гумарова', value: 'D', correct: false }
                ]
            },
            'KZ39': { // Костанайская область
                question: 'На гербе Костанайской области, принятом в 2004 году, изображен цветок. Как он называется?',
                url: 'https://cdn.jsdelivr.net/gh/vizalerd/rd2025@latest/kz39.webp',
                answers: [
                    { text: 'Тюльпан Шренка', value: 'A', correct: true },
                    { text: 'Тюльпан Швейка', value: 'B', correct: false },
                    { text: 'Тюльпан Шрека', value: 'C', correct: false },
                    { text: 'Тюльпан Штольца', value: 'D', correct: false }
                ]
            }
            // Здесь можно добавить вопросы для других регионов
        };

        window.openQuestion = function(regionId) {
            const modal = document.getElementById('questionModal');
            if (modal) {
                modal.style.display = 'block';
                
                // Сбрасываем флаг дополнительного вопроса
                modal.dataset.isBonus = 'false';
                
                // Восстанавливаем заголовок для обычных вопросов
                const modalHeader = modal.querySelector('.modal-header h3');
                if (modalHeader) {
                    modalHeader.textContent = 'Вопрос';
                }
                
                // Показываем крестик закрытия для обычных вопросов
                const closeBtn = modal.querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.style.display = 'block';
                }
                
                const questionText = document.getElementById('questionText');
                const answers = document.getElementById('answers');
                
                // Проверяем, есть ли вопрос для этого региона
                const questionData = regionQuestions[regionId];
                
                if (questionData) {
                    // Используем реальный вопрос
                    if (questionText) {
                        questionText.textContent = questionData.question;
                    }
                    
                    // Загружаем изображение если есть URL
                    const questionImage = document.getElementById('questionImage');
                    if (questionImage && questionData.url) {
                        questionImage.src = questionData.url;
                        questionImage.alt = 'Изображение региона';
                        questionImage.style.display = 'block';
                    } else if (questionImage) {
                        questionImage.style.display = 'none';
                    }
                    
                    if (answers) {
                        // Перемешиваем ответы в случайном порядке
                        const shuffledAnswers = shuffleArray(questionData.answers);
                        
                        // Создаем HTML с перемешанными ответами
                        answers.innerHTML = shuffledAnswers.map(option => 
                            `<button class="answer-btn" onclick="checkAnswer('${regionId}', '${option.value}', ${option.correct})">${option.text}</button>`
                        ).join('');
                    }
                } else {
                    // Показываем заглушку для регионов без вопросов
                    if (questionText) {
                        questionText.textContent = `Вопрос о регионе ${regionId}`;
                    }
                    
                    // Скрываем изображение для заглушек
                    const questionImage = document.getElementById('questionImage');
                    if (questionImage) {
                        questionImage.style.display = 'none';
                    }
                    
                    if (answers) {
                        // Создаем массив ответов-заглушек
                        const answerOptions = [
                            { text: 'Вариант A', value: 'A', correct: false },
                            { text: 'Вариант B', value: 'B', correct: true },
                            { text: 'Вариант C', value: 'C', correct: false },
                            { text: 'Вариант D', value: 'D', correct: false }
                        ];
                        
                        // Перемешиваем ответы в случайном порядке
                        const shuffledAnswers = shuffleArray(answerOptions);
                        
                        // Создаем HTML с перемешанными ответами
                        answers.innerHTML = shuffledAnswers.map(option => 
                            `<button class="answer-btn" onclick="checkAnswer('${regionId}', '${option.value}', ${option.correct})">${option.text}</button>`
                        ).join('');
                    }
                }
            }
        };

        window.checkAnswer = function(regionId, answer, isCorrect) {
            // isCorrect передается из базы данных вопросов
            
            if (isCorrect) {
                // Показываем надпись "Правильно"
                showCorrectAnswerFeedback();
                
                // Отмечаем регион как выполненный
                gameState.completedRegions.add(regionId);
                
                // Обновляем визуальное состояние региона
                const region = document.querySelector(`#${regionId}`);
                if (region) {
                    region.style.fill = '#34656D';
                    region.style.opacity = '0.8';
                    region.style.cursor = 'default';
                }
                
                // Закрываем модальное окно через небольшую задержку
                setTimeout(() => {
                    closeQuestion();
                    
                    // Проверяем условия для дополнительных вопросов
                    checkBonusQuestionConditions();
                    
                    // Проверяем, завершена ли игра
                    checkGameCompletion();
                }, 1500); // Задержка 1.5 секунды
            } else {
                // Показываем анимацию неправильного ответа
                showWrongAnswerAnimation();
                // Уменьшаем количество жизней
                loseLife();
            }
        };

        // Функция показа анимации неправильного ответа
        function showWrongAnswerAnimation() {
            const modal = document.getElementById('questionModal');
            if (modal) {
                // Добавляем класс для анимации
                modal.classList.add('wrong-answer');
                
                // Создаем элемент с сообщением "Неправильно"
                const wrongFeedback = document.createElement('div');
                wrongFeedback.className = 'wrong-feedback';
                wrongFeedback.textContent = 'Неправильно';
                modal.appendChild(wrongFeedback);
                
                // Убираем анимацию и сообщение через 1.5 секунды
                setTimeout(() => {
                    modal.classList.remove('wrong-answer');
                    if (wrongFeedback.parentNode) {
                        wrongFeedback.parentNode.removeChild(wrongFeedback);
                    }
                }, 1500);
            }
        }

        // Функция закрытия окна правил
        window.closeRules = function() {
            const rulesModal = document.getElementById('rulesModal');
            if (rulesModal) {
                rulesModal.style.display = 'none';
            }
        };


        // Функция потери жизни
        function loseLife() {
            gameState.lives--;
            updateLivesDisplay();
            
            if (gameState.lives <= 0) {
                // Игра окончена
                setTimeout(() => {
                    showGameOver();
                }, 1500);
            }
        }

        // Функция обновления отображения жизней
        function updateLivesDisplay() {
            const gears = document.querySelectorAll('.life-gear');
            gears.forEach((gear, index) => {
                if (index >= gameState.lives) {
                    gear.classList.add('lost');
                } else {
                    gear.classList.remove('lost');
                }
            });
        }

        // Функция показа экрана окончания игры
        function showGameOver() {
            const gameOverModal = document.getElementById('gameOverModal');
            if (gameOverModal) {
                gameOverModal.style.display = 'flex';
            }
        }

        // Функция перезапуска игры
        window.restartGame = function() {
            // Сбрасываем состояние игры
            gameState.completedRegions.clear();
            gameState.bonusQuestionsShown.clear();
            gameState.lives = gameState.maxLives;
            gameState.currentRegion = null;
            
            // Скрываем модальные окна
            const gameOverModal = document.getElementById('gameOverModal');
            const questionModal = document.getElementById('questionModal');
            if (gameOverModal) gameOverModal.style.display = 'none';
            if (questionModal) questionModal.style.display = 'none';
            
            // Сбрасываем отображение жизней
            updateLivesDisplay();
            
            // Сбрасываем состояние регионов на карте
            const regions = document.querySelectorAll('#kzmap path[id^="KZ"], #kzmap circle[id^="KZ"]');
            regions.forEach(region => {
                region.style.fill = '';
                region.style.opacity = '';
                region.style.cursor = 'pointer';
            });
            
            // Возвращаемся к начальному экрану
            const gameIntro = document.getElementById('gameIntro');
            const gameMap = document.getElementById('gameMap');
            if (gameIntro && gameMap) {
                gameIntro.style.display = 'flex';
                gameMap.style.display = 'none';
            }
        };

        // Функция проверки условий для дополнительных вопросов
        function checkBonusQuestionConditions() {
            const completedCount = gameState.completedRegions.size;
            
            // Проверяем каждое условие
            bonusQuestionConditions.forEach(condition => {
                if (completedCount === condition && !gameState.bonusQuestionsShown.has(condition)) {
                    // Показываем анимацию "Случайная встреча", затем дополнительный вопрос
                    showEncounterAnimation(condition);
                    gameState.bonusQuestionsShown.add(condition);
                }
            });
        }

        // Функция показа анимации "Случайная встреча"
        function showEncounterAnimation(condition) {
            const encounterModal = document.getElementById('encounterModal');
            if (encounterModal) {
                encounterModal.style.display = 'flex';
                
                // Добавляем обработчик клика для закрытия окна
                const closeEncounter = () => {
                    encounterModal.style.display = 'none';
                    showBonusQuestion(condition);
                    // Удаляем обработчик после использования
                    encounterModal.removeEventListener('click', closeEncounter);
                };
                
                encounterModal.addEventListener('click', closeEncounter);
            }
        }

        // Функция показа дополнительного вопроса
        function showBonusQuestion(condition) {
            const bonusQuestion = bonusQuestions[condition];
            if (!bonusQuestion) return;
            
            const modal = document.getElementById('questionModal');
            if (modal) {
                modal.style.display = 'block';
                
                // Устанавливаем флаг, что это дополнительный вопрос
                modal.dataset.isBonus = 'true';
                
                // Обновляем заголовок
                const modalHeader = modal.querySelector('.modal-header h3');
                if (modalHeader) {
                    modalHeader.textContent = 'Случайная встреча';
                }
                
                // Скрываем крестик закрытия
                const closeBtn = modal.querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.style.display = 'none';
                }
                
                // Обновляем текст вопроса
                const questionText = document.getElementById('questionText');
                if (questionText) {
                    questionText.textContent = bonusQuestion.text;
                }
                
                // Загружаем изображение если есть URL в дополнительном вопросе
                const questionImage = document.getElementById('questionImage');
                if (questionImage && bonusQuestion.url) {
                    questionImage.src = bonusQuestion.url;
                    questionImage.alt = 'Изображение для дополнительного вопроса';
                    questionImage.style.display = 'block';
                } else if (questionImage) {
                    questionImage.style.display = 'none';
                }
                
                // Обновляем варианты ответов
                const answers = document.getElementById('answers');
                if (answers) {
                    answers.innerHTML = '';
                    bonusQuestion.answers.forEach((answer, index) => {
                        const button = document.createElement('button');
                        button.className = 'answer-btn';
                        button.textContent = answer;
                        button.onclick = () => checkBonusAnswer(condition, index);
                        answers.appendChild(button);
                    });
                }
            }
        }

        // Функция проверки ответа на дополнительный вопрос
        function checkBonusAnswer(condition, answerIndex) {
            const bonusQuestion = bonusQuestions[condition];
            const isCorrect = answerIndex === bonusQuestion.correct;
            
            // Скрываем варианты ответов
            const answers = document.getElementById('answers');
            if (answers) {
                answers.style.display = 'none';
            }
            
            // Показываем обратную связь
            const feedback = document.getElementById('answerFeedback');
            const feedbackText = document.getElementById('feedbackText');
            
            if (feedback && feedbackText) {
                feedback.style.display = 'block';
                
                if (isCorrect) {
                    feedback.className = 'answer-feedback correct';
                    feedbackText.textContent = 'Правильно!';
                    
                    // Через 2 секунды закрываем окно
                    setTimeout(() => {
                        const modal = document.getElementById('questionModal');
                        if (modal) {
                            modal.style.display = 'none';
                            // Сбрасываем флаг дополнительного вопроса
                            modal.dataset.isBonus = 'false';
                            
                            // Восстанавливаем крестик закрытия
                            const closeBtn = modal.querySelector('.close-btn');
                            if (closeBtn) {
                                closeBtn.style.display = 'block';
                            }
                            
                            // Восстанавливаем заголовок
                            const modalHeader = modal.querySelector('.modal-header h3');
                            if (modalHeader) {
                                modalHeader.textContent = 'Вопрос о регионе';
                            }
                        }
                    }, 2000);
                } else {
                    feedback.className = 'answer-feedback incorrect';
                    feedbackText.textContent = 'Неправильный ответ! Попробуйте еще раз.';
                    
                    // Через 2 секунды показываем варианты ответов снова
                    setTimeout(() => {
                        feedback.style.display = 'none';
                        if (answers) {
                            answers.style.display = 'grid';
                        }
                    }, 2000);
                }
            }
        };

        window.closeQuestion = function() {
            const modal = document.getElementById('questionModal');
            if (modal) {
                // Проверяем, не является ли это дополнительным вопросом
                if (modal.dataset.isBonus === 'true') {
                    return; // Не закрываем дополнительные вопросы
                }
                
                modal.style.display = 'none';
                
                // Сбрасываем состояние модального окна
                const answers = document.getElementById('answers');
                const feedback = document.getElementById('answerFeedback');
                
                if (answers) {
                    answers.style.display = 'grid';
                }
                
                if (feedback) {
                    feedback.style.display = 'none';
                    feedback.className = 'answer-feedback';
                }
                
                // Удаляем надпись "Правильно" если она есть
                const correctFeedback = modal.querySelector('.correct-feedback');
                if (correctFeedback) {
                    correctFeedback.remove();
                }
            }
        };

        window.checkGameCompletion = function() {
            // Игра считается завершенной, когда все регионы пройдены
            const totalRegions = document.querySelectorAll('#kzmap path[id^="KZ"], #kzmap circle[id^="KZ"]').length;
            if (gameState.completedRegions.size >= totalRegions) {
                alert('Поздравляем! Вы помогли Серику добраться домой!');
            }
        };

        // Инициализация отслеживания загрузки изображений
        document.addEventListener('DOMContentLoaded', function() {
            trackImageLoading();
        });
