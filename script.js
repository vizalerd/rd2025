import * as THREE from 'three';
        import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

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
                    },
                    undefined,
                    function(error) {
                        console.error('Ошибка загрузки текстуры:', texturePath, error);
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
                    },
                    undefined,
                    function(error) {
                        console.error('Ошибка загрузки нормальной карты:', texturePath, error);
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
            console.log('Игровое диалоговое окно инициализировано');
        });

        // Инициализация GSAP и ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);
        
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

        // Анимация таймлайна
        gsap.fromTo('.timeline-title', 
            { 
                opacity: 0, 
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.timeline-container',
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        gsap.fromTo('.timeline-item', 
            { 
                opacity: 0, 
                x: 100,
                scale: 0.8
            },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.8,
                ease: "power2.out",
                stagger: 0.15,
                scrollTrigger: {
                    trigger: '.timeline',
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
        
        ScrollTrigger.create({
            trigger: "body",
            start: "top top",
            end: "+=1700px", // Увеличиваем общую длину для двух этапов
            scrub: 1,
            onUpdate: (self) => {
                isScrolling = self.progress > 0.01;
                
                // Отладка прогресса скролла
                if (self.progress > 0.95) {
                    console.log('Прогресс скролла:', self.progress);
                }
                
                // Показываем диалог при достижении 100% прогресса
                if (self.progress >= 1.0) {
                    console.log('Достигнут 100% прогресс - показываем диалог');
                    showDialog();
                }
                
                // Скрываем диалог при скролле назад от точки появления
                if (dialogShown && self.progress < 1.0) {
                    console.log('Скролл назад от точки появления - скрываем диалог');
                    hideDialog();
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
                    
                    // Определяем этапы анимации
                    const firstStageEnd = 0.6; // 60% - конец первого этапа
                    const pauseStart = 0.6; // 60% - начало паузы
                    const pauseEnd = 0.7; // 70% - конец паузы (200px пауза)
                    const secondStageStart = 0.7; // 70% - начало второго этапа
                    
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
                        
                    } else if (currentProgress >= pauseStart && currentProgress <= pauseEnd) {
                        // Пауза: юрта остается в первой позиции, текст виден
                        yurtModel.position.x = targetPosition.x;
                        yurtModel.position.y = targetPosition.y;
                        yurtModel.position.z = targetPosition.z;
                        yurtModel.rotation.x = targetRotation.x;
                        yurtModel.rotation.y = targetRotation.y;
                        yurtModel.rotation.z = targetRotation.z;
                        
                        // Текст остается видимым во время паузы
                        const targetText = document.querySelector('.yurt-target-text');
                        if (targetText) {
                            gsap.to(targetText, {
                                opacity: 1,
                                x: 0,
                                duration: 0.3,
                                ease: "power2.out"
                            });
                        }
                        
                    } else if (currentProgress > secondStageStart) {
                        // Второй этап: движение ко второй цели
                        const stageProgress = (currentProgress - secondStageStart) / (1 - secondStageStart);
                        
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
                    }
                }
            },
            onComplete: () => {
                console.log('ScrollTrigger onComplete вызван');
                // При завершении скролла юрта остается во второй позиции
                if (yurtModel) {
                    yurtModel.position.x = targetPosition2.x;
                    yurtModel.position.y = targetPosition2.y;
                    yurtModel.position.z = targetPosition2.z;
                    yurtModel.rotation.x = targetRotation2.x;
                    yurtModel.rotation.y = targetRotation2.y;
                    yurtModel.rotation.z = targetRotation2.z;
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
                        this.style.fill = '#F34C19';
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
            }
        };

        window.openQuestion = function(regionId) {
            const modal = document.getElementById('questionModal');
            if (modal) {
                modal.style.display = 'block';
                
                // Восстанавливаем заголовок для обычных вопросов
                const modalHeader = modal.querySelector('.modal-header h3');
                if (modalHeader) {
                    modalHeader.textContent = 'Вопрос о регионе';
                }
                
                // Здесь можно добавить логику загрузки вопроса для конкретного региона
                // Пока что показываем заглушку
                const questionText = document.getElementById('questionText');
                const answers = document.getElementById('answers');
                
                if (questionText) {
                    questionText.textContent = `Вопрос о регионе ${regionId}`;
                }
                
                if (answers) {
                    answers.innerHTML = `
                        <button class="answer-btn" onclick="checkAnswer('${regionId}', 'A')">Вариант A</button>
                        <button class="answer-btn" onclick="checkAnswer('${regionId}', 'B')">Вариант B</button>
                        <button class="answer-btn" onclick="checkAnswer('${regionId}', 'C')">Вариант C</button>
                        <button class="answer-btn" onclick="checkAnswer('${regionId}', 'D')">Вариант D</button>
                    `;
                }
            }
        };

        window.checkAnswer = function(regionId, answer) {
            // Здесь можно добавить логику проверки правильности ответа
            // Пока что считаем ответ B правильным
            const isCorrect = answer === 'B';
            
            if (isCorrect) {
                // Отмечаем регион как выполненный
                gameState.completedRegions.add(regionId);
                
                // Обновляем визуальное состояние региона
                const region = document.querySelector(`#${regionId}`);
                if (region) {
                    region.style.fill = '#4CAF50';
                    region.style.opacity = '0.8';
                    region.style.cursor = 'default';
                }
                
                // Закрываем модальное окно
                closeQuestion();
                
                // Проверяем условия для дополнительных вопросов
                checkBonusQuestionConditions();
                
                // Проверяем, завершена ли игра
                checkGameCompletion();
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
                
                // Обновляем заголовок
                const modalHeader = modal.querySelector('.modal-header h3');
                if (modalHeader) {
                    modalHeader.textContent = 'Дополнительный вопрос';
                }
                
                // Обновляем текст вопроса
                const questionText = document.getElementById('questionText');
                if (questionText) {
                    questionText.textContent = bonusQuestion.text;
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
                    feedbackText.textContent = 'Правильно! Молодец!';
                    
                    // Через 2 секунды закрываем окно
                    setTimeout(() => {
                        closeQuestion();
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
            }
        };

        window.checkGameCompletion = function() {
            // Игра считается завершенной, когда все регионы пройдены
            const totalRegions = document.querySelectorAll('#kzmap path[id^="KZ"], #kzmap circle[id^="KZ"]').length;
            if (gameState.completedRegions.size >= totalRegions) {
                alert('Поздравляем! Вы помогли Серику добраться домой!');
            }
        };
