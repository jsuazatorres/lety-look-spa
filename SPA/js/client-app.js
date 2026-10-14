/**
 * LETY LOOK SPA - Mobile Client Application Controller
 * Features: Authentication, Personalized Experience, Appointment Privacy Isolation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Client App State
    const clientState = {
        currentTab: 'tab-explore',
        selectedCategory: 'all',
        
        // Wizard State
        wizardStep: 1,
        selectedService: null,
        selectedStaff: null,
        selectedDate: getTomorrowDateString(),
        selectedTime: null,
        confirmedAppointment: null
    };

    // =========================================================================
    // SMART PWA & DEVICE INSTALLATION CONTROLLER (iOS / iPhone & Android)
    // =========================================================================
    let deferredPrompt = null;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;

    const topInstallBanner = document.getElementById('client-install-banner');
    const topInstallBtn = document.getElementById('btn-trigger-client-install');
    const accountInstallPrompt = document.getElementById('account-unauth-install-prompt');
    const accountInstallBtn = document.getElementById('btn-trigger-account-install');
    const installModal = document.getElementById('modal-install-instructions');
    const closeInstallModalBtn = document.getElementById('btn-close-install-modal');

    function setupInstallUI() {
        const bannerIcon = document.getElementById('install-banner-icon');
        const bannerIconWrap = document.getElementById('install-banner-icon-wrap');
        const bannerTitle = document.getElementById('install-banner-title');
        const bannerDesc = document.getElementById('install-banner-desc');
        const bannerBtnText = document.getElementById('install-banner-btn-text');

        const accIcon = document.getElementById('account-install-icon');
        const accIconWrap = document.getElementById('account-install-icon-wrap');
        const accTitle = document.getElementById('account-install-title');
        const accSubtitle = document.getElementById('account-install-subtitle');
        const accBtnText = document.getElementById('account-install-btn-text');

        if (isIOS) {
            // iOS / iPhone Custom UI
            if (topInstallBanner) {
                topInstallBanner.style.background = 'linear-gradient(135deg, #18181b, #09090b)';
                topInstallBanner.style.border = '1px solid rgba(255,255,255,0.18)';
                topInstallBanner.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5)';
            }
            if (bannerIcon) bannerIcon.className = 'fa-brands fa-apple';
            if (bannerIconWrap) bannerIconWrap.style.background = 'rgba(255,255,255,0.15)';
            if (bannerTitle) bannerTitle.textContent = 'Instalar App en tu iPhone';
            if (bannerDesc) bannerDesc.textContent = 'Agrégala a tu pantalla de inicio en Safari';
            if (bannerBtnText) bannerBtnText.textContent = 'Ver Pasos';

            if (accIcon) accIcon.className = 'fa-brands fa-apple';
            if (accIconWrap) {
                accIconWrap.style.background = '#f4f4f5';
                accIconWrap.style.color = '#18181b';
            }
            if (accTitle) accTitle.textContent = 'Instala LETY LOOK en tu iPhone';
            if (accSubtitle) accSubtitle.textContent = 'Acceso directo a pantalla completa desde Safari';
            if (accBtnText) accBtnText.textContent = 'Ver Pasos';
        } else if (isAndroid) {
            // Android Custom UI
            if (topInstallBanner) {
                topInstallBanner.style.background = 'linear-gradient(135deg, #0d9488, #059669)';
                topInstallBanner.style.border = '1px solid #34d399';
            }
            if (bannerIcon) bannerIcon.className = 'fa-brands fa-android';
            if (bannerTitle) bannerTitle.textContent = 'Descargar App para Android';
            if (bannerDesc) bannerDesc.textContent = 'Instala LETY LOOK en tu celular';
            if (bannerBtnText) bannerBtnText.textContent = 'Instalar';

            if (accIcon) accIcon.className = 'fa-brands fa-android';
            if (accTitle) accTitle.textContent = 'Instala LETY LOOK en tu Android';
            if (accSubtitle) accSubtitle.textContent = 'Acceso directo en tu teléfono como App nativa';
            if (accBtnText) accBtnText.textContent = 'Instalar';
        } else {
            // Universal / Desktop UI
            if (bannerTitle) bannerTitle.textContent = 'Instalar App en tu Celular';
            if (bannerDesc) bannerDesc.textContent = 'Disponible para iPhone y Android';
            if (accTitle) accTitle.textContent = 'Instala la App en tu Celular';
        }
    }

    setupInstallUI();

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const currentClient = window.dataManager?.getCurrentClient?.();
        if (!currentClient && !isStandalone) {
            if (topInstallBanner) topInstallBanner.style.display = 'flex';
            if (accountInstallPrompt) accountInstallPrompt.style.display = 'flex';
        }
    });

    function openInstallGuideModal() {
        const modal = document.getElementById('modal-install-instructions');
        const modalIcon = document.getElementById('modal-install-icon');
        const modalIconWrap = document.getElementById('modal-install-icon-wrap');
        const modalTitle = document.getElementById('modal-install-title');
        const modalSubtitle = document.getElementById('modal-install-subtitle');
        const modalSteps = document.getElementById('modal-install-steps');

        if (!modal) return;

        if (isIOS) {
            if (modalIcon) modalIcon.className = 'fa-brands fa-apple';
            if (modalIconWrap) {
                modalIconWrap.style.background = '#18181b';
                modalIconWrap.style.color = '#fff';
            }
            if (modalTitle) modalTitle.textContent = 'Instalar en tu iPhone';
            if (modalSubtitle) modalSubtitle.innerHTML = 'Agrega <strong>LETY LOOK</strong> a tu pantalla de inicio en <strong>Safari</strong>:';
            if (modalSteps) {
                modalSteps.innerHTML = `
                    <div style="display:flex; align-items:flex-start; gap:0.65rem;">
                        <span style="background:var(--primary); color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; flex-shrink:0;">1</span>
                        <div>Abre esta página en el navegador <strong>Safari</strong> de tu iPhone.</div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.65rem;">
                        <span style="background:var(--primary); color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; flex-shrink:0;">2</span>
                        <div>Toca el botón <strong>Compartir</strong> <i class="fa-solid fa-arrow-up-from-bracket" style="color:var(--primary); margin:0 3px;"></i> en la barra de Safari.</div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.65rem;">
                        <span style="background:var(--primary); color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; flex-shrink:0;">3</span>
                        <div>Desliza hacia abajo y selecciona <strong>"Agregar a pantalla de inicio"</strong> <i class="fa-regular fa-square-plus" style="color:var(--primary); margin:0 3px;"></i>.</div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.65rem;">
                        <span style="background:var(--primary); color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; flex-shrink:0;">4</span>
                        <div>Toca <strong>"Agregar"</strong> arriba a la derecha. ¡Listo! Tendrás la app en tu iPhone.</div>
                    </div>
                `;
            }
        } else {
            if (modalIcon) modalIcon.className = 'fa-brands fa-android';
            if (modalIconWrap) {
                modalIconWrap.style.background = '#dcfce7';
                modalIconWrap.style.color = '#15803d';
            }
            if (modalTitle) modalTitle.textContent = 'Instalar App en Android';
            if (modalSubtitle) modalSubtitle.innerHTML = 'Para instalar la app de <strong>LETY LOOK</strong> directamente en tu celular:';
            if (modalSteps) {
                modalSteps.innerHTML = `
                    <div style="display:flex; align-items:flex-start; gap:0.65rem;">
                        <span style="background:#059669; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; flex-shrink:0;">1</span>
                        <div>Toca los <strong>3 puntos (⋮)</strong> en la esquina superior derecha de Google Chrome.</div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.65rem;">
                        <span style="background:#059669; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; flex-shrink:0;">2</span>
                        <div>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.</div>
                    </div>
                    <div style="display:flex; align-items:flex-start; gap:0.65rem;">
                        <span style="background:#059669; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; flex-shrink:0;">3</span>
                        <div>¡Listo! Se abrirá como App nativa en tu teléfono.</div>
                    </div>
                `;
            }
        }
        modal.style.display = 'flex';
    }

    async function triggerInstallFlow() {
        if (!isIOS && deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                if (topInstallBanner) topInstallBanner.style.display = 'none';
                if (accountInstallPrompt) accountInstallPrompt.style.display = 'none';
            }
            deferredPrompt = null;
        } else {
            openInstallGuideModal();
        }
    }

    topInstallBtn?.addEventListener('click', triggerInstallFlow);
    accountInstallBtn?.addEventListener('click', triggerInstallFlow);

    closeInstallModalBtn?.addEventListener('click', () => {
        if (installModal) installModal.style.display = 'none';
    });

    // Force App Refresh & Cache Clearer
    document.getElementById('btn-force-refresh-client-app')?.addEventListener('click', async () => {
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
        }
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let reg of registrations) {
                await reg.unregister();
            }
        }
        if (window.dataManager && typeof window.dataManager.init === 'function') {
            window.dataManager.init();
        }
        window.location.reload();
    });
    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function getTodayDateString() {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getTomorrowDateString() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDateDisplay(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('es-CO', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    function formatTime12h(time24) {
        if (!time24) return '';
        const [hourStr, minStr] = time24.split(':');
        let hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        return `${hour}:${minStr} ${ampm}`;
    }

    // =========================================================================
    // 1. AUTHENTICATION & HEADER UI CONTROLLER
    // =========================================================================
    function updateAuthUI() {
        if (!window.dataManager && window.SpaDataManager) {
            window.dataManager = new window.SpaDataManager();
        }
        if (!window.dataManager) return;
        const currentClient = window.dataManager.getCurrentClient();
        const headerBadge = document.getElementById('header-auth-badge');
        const navAccountLabel = document.getElementById('nav-account-label');
        const heroGreeting = document.getElementById('hero-greeting-title');

        if (currentClient) {
            const firstName = currentClient.name.split(' ')[0];
            headerBadge.innerHTML = `
                <div class="header-user-profile-btn" id="btn-header-profile" title="Mi Cuenta">
                    <img src="${currentClient.avatar}" alt="${currentClient.name}" class="header-user-avatar">
                    <span class="header-user-name">${firstName}</span>
                </div>
            `;
            document.getElementById('btn-header-profile')?.addEventListener('click', () => {
                switchTab('tab-account');
            });

            if (navAccountLabel) navAccountLabel.textContent = 'Mi Perfil';
            if (heroGreeting) heroGreeting.textContent = `¡Hola, ${firstName}! ✨ Resalta tu Belleza`;
        } else {
            headerBadge.innerHTML = `
                <button class="btn-book-service" id="btn-header-login" style="padding:0.35rem 0.75rem; font-size:0.75rem;">
                    <i class="fa-solid fa-user"></i> Ingresar
                </button>
            `;
            document.getElementById('btn-header-login')?.addEventListener('click', () => {
                switchTab('tab-account');
            });

            if (navAccountLabel) navAccountLabel.textContent = 'Cuenta';
            if (heroGreeting) heroGreeting.textContent = 'Resalta tu Belleza con los Mejores Expertos';
        }

        // Install banners visibility: HIDE when logged in, ONLY show when not logged in
        const bannerEl = document.getElementById('client-install-banner');
        const accPromptEl = document.getElementById('account-unauth-install-prompt');

        if (currentClient) {
            // Logged in: Hide all install prompts everywhere
            if (bannerEl) bannerEl.style.display = 'none';
            if (accPromptEl) accPromptEl.style.display = 'none';
        } else {
            // Unauthenticated (guest / about to log in): Show if not already installed as standalone
            if (!isStandalone) {
                if (bannerEl) bannerEl.style.display = 'flex';
                if (accPromptEl) accPromptEl.style.display = 'flex';
            } else {
                if (bannerEl) bannerEl.style.display = 'none';
                if (accPromptEl) accPromptEl.style.display = 'none';
            }
        }
    }

    // =========================================================================
    // 2. BOTTOM NAVIGATION TAB SWITCHER
    // =========================================================================
    function switchTab(tabId) {
        clientState.currentTab = tabId;

        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-target') === tabId);
        });

        document.querySelectorAll('.tab-content').forEach(tab => {
            if (tab.id === tabId) {
                tab.style.display = 'block';
            } else {
                tab.style.display = 'none';
            }
        });

        // Tab-specific renders
        if (tabId === 'tab-explore') renderExploreTab();
        if (tabId === 'tab-book') renderWizardStep(clientState.wizardStep);
        if (tabId === 'tab-shop') renderShopClientTab();
        if (tabId === 'tab-staff') renderStaffDirectory();
        if (tabId === 'tab-my-appointments') renderMyAppointments();
        if (tabId === 'tab-account') renderAccountTab();

        if (typeof updateCartBadgeAndFloatingBar === 'function') {
            updateCartBadgeAndFloatingBar();
        }
        updateAuthUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            if (target) switchTab(target);
        });
    });

    document.getElementById('btn-hero-start-booking')?.addEventListener('click', () => {
        clientState.wizardStep = 1;
        switchTab('tab-book');
    });

    // =========================================================================
    // 3. EXPLORE SERVICES TAB
    // =========================================================================
    function renderExploreTab() {
        const container = document.getElementById('client-services-list');
        container.innerHTML = '';

        let services = window.dataManager.getServices();
        if (clientState.selectedCategory !== 'all') {
            services = services.filter(s => s.category === clientState.selectedCategory);
        }

        const categoryLabels = {
            manicura: 'Manicura',
            pedicura: 'Pedicura',
            peluqueria: 'Peluquería',
            tintura: 'Tintura y Color'
        };

        services.forEach(srv => {
            const card = document.createElement('div');
            card.className = 'client-srv-card';

            const imgMarkup = srv.image
                ? `<img src="${srv.image}" alt="${srv.name}" onerror="this.outerHTML='<div style=\\'height:140px; background:linear-gradient(135deg, #fce7eb, #f9d3dc); display:flex; align-items:center; justify-content:center; color:var(--primary); font-size:2.5rem;\\'><i class=\\'fa-solid fa-spa\\'></i></div>'">`
                : `<div style="height:140px; background:linear-gradient(135deg, #fce7eb, #f9d3dc); display:flex; align-items:center; justify-content:center; color:var(--primary); font-size:2.5rem;"><i class="fa-solid fa-spa"></i></div>`;

            card.innerHTML = `
                <div class="client-srv-img-wrap">
                    ${imgMarkup}
                    <span class="client-srv-category-tag">${categoryLabels[srv.category] || srv.category}</span>
                    <span class="client-srv-duration-tag"><i class="fa-regular fa-clock"></i> ${srv.duration} min</span>
                </div>
                <div class="client-srv-content">
                    <h4 class="client-srv-title">${srv.name}</h4>
                    <p class="client-srv-desc">${srv.description}</p>
                    <div class="client-srv-footer">
                        <div class="client-srv-price">${formatCurrency(srv.price)}</div>
                        <button class="btn-book-service btn-start-srv-booking" data-id="${srv.id}">
                            <span>Reservar</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Fast book button listener
        container.querySelectorAll('.btn-start-srv-booking').forEach(btn => {
            btn.addEventListener('click', () => {
                const srvId = btn.getAttribute('data-id');
                const srv = window.dataManager.getServiceById(srvId);
                if (srv) {
                    clientState.selectedService = srv;
                    clientState.wizardStep = 2; // Jump straight to choosing specialist
                    switchTab('tab-book');
                }
            });
        });
    }

    // Category slider clicks
    document.querySelectorAll('#client-category-slider .cat-btn-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#client-category-slider .cat-btn-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            clientState.selectedCategory = pill.getAttribute('data-cat');
            renderExploreTab();
        });
    });

    // =========================================================================
    // 4. BOOKING WIZARD (STEP-BY-STEP)
    // =========================================================================
    function renderWizardStep(stepNumber) {
        clientState.wizardStep = stepNumber;

        // Update step circles
        [1, 2, 3, 4].forEach(n => {
            const circle = document.getElementById(`circle-step-${n}`);
            if (circle) {
                circle.classList.toggle('active', n === stepNumber);
                circle.classList.toggle('completed', n < stepNumber);
            }
        });

        // Show corresponding step card
        document.querySelectorAll('.step-card').forEach(card => card.classList.remove('active'));
        const activeCard = document.getElementById(`wizard-step-${stepNumber}`);
        if (activeCard) activeCard.classList.add('active');

        // Logic per step
        if (stepNumber === 1) {
            renderWizardStep1();
        } else if (stepNumber === 2) {
            renderWizardStep2();
        } else if (stepNumber === 3) {
            renderWizardStep3();
        } else if (stepNumber === 4) {
            renderWizardStep4();
        }
    }

    // Step 1: Select Service
    function renderWizardStep1() {
        const list = document.getElementById('wizard-services-list');
        list.innerHTML = '';
        const services = window.dataManager.getServices();

        services.forEach(srv => {
            const isSelected = clientState.selectedService && clientState.selectedService.id === srv.id;
            const opt = document.createElement('div');
            opt.className = `staff-select-card ${isSelected ? 'selected' : ''}`;
            opt.innerHTML = `
                <div style="flex:1;">
                    <div style="font-size:0.95rem; font-weight:700; color:var(--text-primary);">${srv.name}</div>
                    <div style="font-size:0.78rem; color:var(--text-secondary);"><i class="fa-regular fa-clock"></i> ${srv.duration} min &bull; <strong>${formatCurrency(srv.price)}</strong></div>
                </div>
                <div style="color:var(--primary); font-size:1.1rem;">
                    <i class="fa-solid ${isSelected ? 'fa-circle-check' : 'fa-circle-chevron-right'}"></i>
                </div>
            `;
            opt.addEventListener('click', () => {
                clientState.selectedService = srv;
                renderWizardStep(2);
            });
            list.appendChild(opt);
        });
    }

    // Step 2: Select Specialist
    function renderWizardStep2() {
        const list = document.getElementById('wizard-staff-list');
        list.innerHTML = '';

        if (!clientState.selectedService) {
            renderWizardStep(1);
            return;
        }

        let availableStaff = window.dataManager.getStaff().filter(st => 
            st.specialties.includes(clientState.selectedService.category) && st.status === 'active'
        );

        if (availableStaff.length === 0) {
            availableStaff = window.dataManager.getStaff().filter(st => st.status === 'active');
        }

        const anyOption = document.createElement('div');
        const isAnySelected = clientState.selectedStaff === null;
        anyOption.className = `staff-select-card ${isAnySelected ? 'selected' : ''}`;
        anyOption.innerHTML = `
            <div style="width:46px; height:46px; border-radius:50%; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div class="staff-select-info" style="flex:1;">
                <h4>Cualquier Especialista Disponible</h4>
                <p>Asignar automáticamente el profesional más idóneo</p>
            </div>
            <div style="color:var(--primary); font-size:1.1rem;">
                <i class="fa-solid fa-chevron-right"></i>
            </div>
        `;
        anyOption.addEventListener('click', () => {
            clientState.selectedStaff = availableStaff[0] || window.dataManager.getStaff()[0];
            renderWizardStep(3);
        });
        list.appendChild(anyOption);

        availableStaff.forEach(st => {
            const isSelected = clientState.selectedStaff && clientState.selectedStaff.id === st.id;
            const opt = document.createElement('div');
            opt.className = `staff-select-card ${isSelected ? 'selected' : ''}`;
            opt.innerHTML = `
                <img src="${st.avatar}" alt="${st.name}" class="staff-select-avatar" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60'">
                <div class="staff-select-info" style="flex:1;">
                    <h4>${st.name}</h4>
                    <p>${st.title}</p>
                </div>
                <div style="color:var(--primary); font-size:1.1rem;">
                    <i class="fa-solid fa-chevron-right"></i>
                </div>
            `;
            opt.addEventListener('click', () => {
                clientState.selectedStaff = st;
                renderWizardStep(3);
            });
            list.appendChild(opt);
        });
    }

    // Step 3: Date & Time
    function renderWizardStep3() {
        const dateInput = document.getElementById('wizard-date-input');
        const slotsGrid = document.getElementById('wizard-slots-grid');

        dateInput.min = getTodayDateString();
        if (!dateInput.value) {
            dateInput.value = clientState.selectedDate || getTomorrowDateString();
        }
        clientState.selectedDate = dateInput.value;

        dateInput.onchange = () => {
            clientState.selectedDate = dateInput.value;
            clientState.selectedTime = null;
            generateTimeSlots();
        };

        generateTimeSlots();

        function generateTimeSlots() {
            slotsGrid.innerHTML = '';
            
            // Validate working days of the selected specialist
            const dayOfWeek = new Date(clientState.selectedDate + 'T00:00:00').getDay();
            const workingDays = clientState.selectedStaff?.workingDays || [1, 2, 3, 4, 5, 6];

            if (!workingDays.includes(dayOfWeek)) {
                slotsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align:center; padding: 2rem 1rem; color: var(--text-secondary); background: var(--bg-subtle); border-radius: var(--radius-md);">
                        <i class="fa-solid fa-calendar-xmark" style="font-size: 2rem; color: var(--primary); margin-bottom: 0.5rem; display:block;"></i>
                        <strong>${clientState.selectedStaff.name} no labora este día</strong>
                        <p style="font-size: 0.78rem; margin-top: 0.25rem;">Por favor selecciona otra fecha o cambia de profesional para continuar.</p>
                    </div>
                `;
                return;
            }

            const allAppointments = window.dataManager.getAppointments();
            const bookedTimes = allAppointments
                .filter(a => a.date === clientState.selectedDate && a.staffId === clientState.selectedStaff?.id && a.status !== 'cancelled')
                .map(a => a.time);

            const possibleTimes = [
                '09:00', '09:45', '10:30', '11:15', '12:00', 
                '13:00', '14:00', '14:45', '15:30', '16:15', 
                '17:00', '17:45', '18:30', '19:15'
            ];

            possibleTimes.forEach(timeStr => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'client-slot-btn';
                btn.textContent = formatTime12h(timeStr);

                const isBooked = bookedTimes.includes(timeStr);
                if (isBooked) {
                    btn.disabled = true;
                    btn.title = 'Horario no disponible';
                } else {
                    if (clientState.selectedTime === timeStr) {
                        btn.classList.add('selected');
                    }
                    btn.addEventListener('click', () => {
                        clientState.selectedTime = timeStr;
                        document.querySelectorAll('.client-slot-btn').forEach(b => b.classList.remove('selected'));
                        btn.classList.add('selected');
                        setTimeout(() => renderWizardStep(4), 180);
                    });
                }
                slotsGrid.appendChild(btn);
            });
        }
    }

    // Step 4: Summary & Client Information (Autofilled if logged in)
    function renderWizardStep4() {
        if (!clientState.selectedService || !clientState.selectedStaff || !clientState.selectedDate || !clientState.selectedTime) {
            renderWizardStep(1);
            return;
        }

        document.getElementById('summary-service-name').textContent = clientState.selectedService.name;
        document.getElementById('summary-staff-name').textContent = clientState.selectedStaff.name;
        document.getElementById('summary-datetime').textContent = `${formatDateDisplay(clientState.selectedDate)} a las ${formatTime12h(clientState.selectedTime)}`;
        document.getElementById('summary-price').textContent = formatCurrency(clientState.selectedService.price);

        // Autofill if logged in
        const currentClient = window.dataManager.getCurrentClient();
        if (currentClient) {
            document.getElementById('wizard-client-name').value = currentClient.name;
            document.getElementById('wizard-client-phone').value = currentClient.phone;
            document.getElementById('wizard-client-email').value = currentClient.email;
        }
    }

    document.querySelectorAll('.btn-wizard-back').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.getAttribute('data-prev'), 10);
            renderWizardStep(prevStep);
        });
    });

    // Submit booking form
    document.getElementById('wizard-confirm-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const clientName = document.getElementById('wizard-client-name').value.trim();
        const clientPhone = document.getElementById('wizard-client-phone').value.trim();
        const clientEmail = document.getElementById('wizard-client-email').value.trim();
        const clientNotes = document.getElementById('wizard-client-notes').value.trim();

        if (!clientName || !clientPhone) {
            alert('Por favor ingresa tu nombre y número de WhatsApp');
            return;
        }

        const currentClient = window.dataManager.getCurrentClient();

        const newAppointment = {
            id: 'apt-cli-' + Date.now(),
            clientId: currentClient ? currentClient.id : undefined,
            clientName,
            clientPhone,
            clientEmail: clientEmail || (currentClient ? currentClient.email : ''),
            serviceId: clientState.selectedService.id,
            serviceName: clientState.selectedService.name,
            staffId: clientState.selectedStaff.id,
            staffName: clientState.selectedStaff.name,
            date: clientState.selectedDate,
            time: clientState.selectedTime,
            duration: clientState.selectedService.duration,
            price: clientState.selectedService.price,
            status: 'confirmed',
            notes: clientNotes ? `[App Móvil] ${clientNotes}` : '[App Móvil]'
        };

        // If user is not logged in but provided name/phone/email, register or link seamlessly
        if (!currentClient && clientEmail) {
            // Check if existing
            let client = window.dataManager.getClientByEmailOrPhone(clientEmail) || window.dataManager.getClientByEmailOrPhone(clientPhone);
            if (!client) {
                const regRes = window.dataManager.registerClient({
                    name: clientName,
                    phone: clientPhone,
                    email: clientEmail,
                    password: '123'
                });
                if (regRes.success) {
                    newAppointment.clientId = regRes.client.id;
                }
            } else {
                newAppointment.clientId = client.id;
                window.dataManager.setCurrentClient(client);
            }
            updateAuthUI();
        }

        // Save in global database
        window.dataManager.saveAppointment(newAppointment);
        clientState.confirmedAppointment = newAppointment;

        // Show Success Ticket
        showSuccessTicket(newAppointment);
    });

    function showSuccessTicket(apt) {
        document.querySelectorAll('.step-card').forEach(card => card.classList.remove('active'));
        const successCard = document.getElementById('wizard-step-success');
        successCard.classList.add('active');

        const detailsEl = document.getElementById('success-ticket-details');
        detailsEl.innerHTML = `
            <div class="ticket-row">
                <span class="ticket-label" style="color:#475569; font-weight:700;">Cliente:</span>
                <span class="ticket-val" style="color:#0f172a; font-weight:800;">${apt.clientName}</span>
            </div>
            <div class="ticket-row">
                <span class="ticket-label" style="color:#475569; font-weight:700;">Servicio:</span>
                <span class="ticket-val" style="color:var(--primary); font-weight:800;">${apt.serviceName}</span>
            </div>
            <div class="ticket-row">
                <span class="ticket-label" style="color:#475569; font-weight:700;">Especialista:</span>
                <span class="ticket-val" style="color:#b45309; font-weight:800;">${apt.staffName}</span>
            </div>
            <div class="ticket-row">
                <span class="ticket-label" style="color:#475569; font-weight:700;">Fecha y Hora:</span>
                <span class="ticket-val" style="color:#0f172a; font-weight:800;">${formatDateDisplay(apt.date)} &bull; ${formatTime12h(apt.time)}</span>
            </div>
            <div class="ticket-row">
                <span class="ticket-label" style="color:#475569; font-weight:700;">Duración:</span>
                <span class="ticket-val" style="color:#0f172a; font-weight:800;">${apt.duration} minutos</span>
            </div>
            <div class="ticket-row" style="border-bottom:none; padding-top:0.35rem;">
                <span class="ticket-label" style="color:#0f172a; font-weight:800; font-size:0.95rem;">Total a Pagar:</span>
                <span class="ticket-val" style="font-size:1.3rem; color:#0f172a; font-weight:900;">${formatCurrency(apt.price)}</span>
            </div>
        `;

        document.getElementById('btn-send-whatsapp-booking').onclick = () => {
            sendClientWhatsAppMessage(apt);
        };

        const staffBtn = document.getElementById('btn-send-whatsapp-staff');
        if (staffBtn) {
            const staffNameShort = apt.staffName.split(' ')[0];
            document.getElementById('label-notify-staff-btn').textContent = `Notificar a ${staffNameShort} por WhatsApp`;
            staffBtn.onclick = () => {
                sendSpecialistWhatsAppNotification(apt);
            };
        }

        document.getElementById('btn-view-my-appointments-after-booking').onclick = () => {
            switchTab('tab-my-appointments');
        };
    }

    function sendClientWhatsAppMessage(apt) {
        const settings = window.dataManager.getSettings();
        const spaWhatsApp = settings.whatsapp || '573138869676';

        const message = `✨ *NUEVA RESERVA DESDE LA APP - SPA LETY LOOK* ✨\n\n` +
            `¡Hola Lety Look! Acabo de agendar mi cita desde su App Móvil con los siguientes detalles:\n\n` +
            `👤 *Cliente:* ${apt.clientName}\n` +
            `📱 *WhatsApp:* ${apt.clientPhone}\n` +
            `💅 *Servicio:* ${apt.serviceName}\n` +
            `👩‍🎨 *Especialista:* ${apt.staffName}\n` +
            `📅 *Fecha:* ${formatDateDisplay(apt.date)}\n` +
            `⏰ *Hora:* ${formatTime12h(apt.time)}\n` +
            `💰 *Total:* ${formatCurrency(apt.price)}\n\n` +
            `¡Por favor confírmenme cuando reciban este mensaje! Gracias 💕`;

        const waUrl = `https://wa.me/${spaWhatsApp}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    }

    function sendSpecialistWhatsAppNotification(apt) {
        const staff = window.dataManager.getStaffById(apt.staffId);
        const cleanPhone = staff && staff.phone ? staff.phone.replace(/\D/g, '') : '573138869676';

        const message = `🌸 *NUEVA CITA ASIGNADA - LETY LOOK SPA* 🌸\n\n` +
            `¡Hola *${apt.staffName}*! Se te ha asignado una nueva cita desde la App de Clientes:\n\n` +
            `👤 *Cliente:* ${apt.clientName}\n` +
            `📱 *WhatsApp Cliente:* ${apt.clientPhone}\n` +
            `💅 *Tratamiento:* ${apt.serviceName}\n` +
            `📅 *Fecha:* ${formatDateDisplay(apt.date)}\n` +
            `⏰ *Hora:* ${formatTime12h(apt.time)} (${apt.duration} min)\n` +
            `💰 *Valor:* ${formatCurrency(apt.price)}\n\n` +
            `¡Prepárate para consentir a tu clienta! ✨`;

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    }

    // =========================================================================
    // 5. SPECIALISTS DIRECTORY TAB
    // =========================================================================
    function renderStaffDirectory() {
        const container = document.getElementById('client-staff-directory');
        container.innerHTML = '';

        const staffList = window.dataManager.getStaff().filter(s => s.status === 'active');
        const specLabels = { manicura: 'Manicura', pedicura: 'Pedicura', peluqueria: 'Peluquería', tintura: 'Tintura' };

        staffList.forEach(st => {
            const card = document.createElement('div');
            card.className = 'client-srv-card';
            card.style.padding = '1.25rem';

            const specialtiesBadges = st.specialties.map(spec => 
                `<span style="background:var(--bg-subtle); color:var(--text-secondary); font-size:0.72rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:var(--radius-full); margin-right:4px;">${specLabels[spec] || spec}</span>`
            ).join('');

            card.innerHTML = `
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.75rem;">
                    <img src="${st.avatar}" alt="${st.name}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--primary-light);">
                    <div>
                        <h4 style="font-size:1.05rem; font-weight:700;">${st.name}</h4>
                        <span style="font-size:0.78rem; color:var(--gold); font-weight:700;">${st.title}</span>
                    </div>
                </div>
                <div style="margin-bottom:0.6rem;">${specialtiesBadges}</div>
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:1rem; line-height:1.4;">${st.bio || ''}</p>
                <button class="btn-hero-book btn-book-with-staff" data-id="${st.id}" style="width:100%; justify-content:center; padding:0.55rem;">
                    <i class="fa-solid fa-calendar-check"></i> Agendar con ${st.name.split(' ')[0]}
                </button>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll('.btn-book-with-staff').forEach(btn => {
            btn.addEventListener('click', () => {
                const staffId = btn.getAttribute('data-id');
                const st = window.dataManager.getStaffById(staffId);
                if (st) {
                    clientState.selectedStaff = st;
                    clientState.wizardStep = 1;
                    switchTab('tab-book');
                }
            });
        });
    }

    // =========================================================================
    // 6. MIS CITAS (STRICT PRIVACY - ONLY CLIENT'S OWN APPOINTMENTS)
    // =========================================================================
    function renderMyAppointments() {
        const container = document.getElementById('client-my-appointments-list');
        container.innerHTML = '';

        const currentClient = window.dataManager.getCurrentClient();

        // If not logged in, prompt to login/register to protect privacy
        if (!currentClient) {
            container.innerHTML = `
                <div style="text-align:center; padding:2.5rem 1rem; background:#fff; border-radius:var(--radius-lg); border:1px solid var(--border-color); box-shadow:var(--shadow-card);">
                    <i class="fa-solid fa-lock" style="font-size:2.5rem; margin-bottom:1rem; color:var(--primary); display:block;"></i>
                    <h4 style="font-family:'Playfair Display', serif; font-size:1.25rem; margin-bottom:0.4rem;">Acceso Privado a tus Citas</h4>
                    <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:1.5rem; line-height:1.4;">
                        Para proteger tu privacidad y mostrar únicamente tus citas agendadas, por favor inicia sesión o crea tu cuenta.
                    </p>
                    <button class="btn-hero-book" id="btn-login-to-view-apts" style="margin:0 auto; padding:0.75rem 1.5rem;">
                        <i class="fa-solid fa-arrow-right-to-bracket"></i> Iniciar Sesión / Registrarme
                    </button>
                </div>
            `;
            container.querySelector('#btn-login-to-view-apts')?.addEventListener('click', () => {
                switchTab('tab-account');
            });
            return;
        }

        // Get strictly this client's appointments
        const myAppointments = window.dataManager.getClientAppointments(currentClient.id, currentClient.email, currentClient.phone);

        if (myAppointments.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:3rem 1rem; color:var(--text-light); background:#fff; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
                    <i class="fa-solid fa-calendar-xmark" style="font-size:2.5rem; margin-bottom:0.75rem; display:block; color:var(--primary);"></i>
                    <h4 style="font-family:'Playfair Display', serif; font-size:1.2rem; color:var(--text-primary); margin-bottom:0.4rem;">No tienes citas activas</h4>
                    <p style="font-size:0.82rem; margin-bottom:1.25rem;">¡Consiéntete hoy agendando tu primer servicio en LETY LOOK!</p>
                    <button class="btn-hero-book" id="btn-empty-book-now" style="margin:0 auto;">Agendar Cita Ahora</button>
                </div>
            `;
            container.querySelector('#btn-empty-book-now')?.addEventListener('click', () => {
                clientState.wizardStep = 1;
                switchTab('tab-book');
            });
            return;
        }

        const statusBadges = {
            confirmed: '<span class="history-status-badge" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0;">Confirmada</span>',
            pending: '<span class="history-status-badge" style="background:#fffbeb; color:#92400e; border:1px solid #fde68a;">Pendiente</span>',
            completed: '<span class="history-status-badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe;">Completada</span>',
            cancelled: '<span class="history-status-badge" style="background:#fef2f2; color:#991b1b; border:1px solid #fecaca;">Cancelada</span>'
        };

        myAppointments.forEach(apt => {
            const card = document.createElement('div');
            card.className = 'client-history-card';
            card.innerHTML = `
                <div class="history-card-header">
                    <span style="font-size:0.8rem; font-weight:700; color:var(--text-secondary);"><i class="fa-regular fa-calendar"></i> ${formatDateDisplay(apt.date)}</span>
                    ${statusBadges[apt.status] || ''}
                </div>
                <h4 style="font-size:1rem; font-weight:700; color:var(--primary);">${apt.serviceName}</h4>
                <div style="font-size:0.82rem; color:var(--text-secondary);">
                    <div><i class="fa-regular fa-clock"></i> Hora: <strong>${formatTime12h(apt.time)}</strong> (${apt.duration} min)</div>
                    <div><i class="fa-solid fa-user"></i> Especialista: <strong>${apt.staffName}</strong></div>
                    <div><i class="fa-solid fa-tag"></i> Total: <strong>${formatCurrency(apt.price)}</strong></div>
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                    <button class="btn-client-wa btn-my-apt-wa" data-id="${apt.id}" style="flex:1; padding:0.55rem; font-size:0.82rem;">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp Spa
                    </button>
                    ${apt.status !== 'cancelled' ? `
                        <button class="btn-book-service btn-my-apt-cancel" data-id="${apt.id}" style="color:#ef4444; border-color:#fca5a5; background:#fff;">
                            Cancelar
                        </button>
                    ` : ''}
                </div>
            `;
            container.appendChild(card);
        });

        // WhatsApp button listener
        container.querySelectorAll('.btn-my-apt-wa').forEach(btn => {
            btn.addEventListener('click', () => {
                const aptId = btn.getAttribute('data-id');
                const apt = window.dataManager.getAppointmentById(aptId);
                if (apt) sendClientWhatsAppMessage(apt);
            });
        });

        // Cancel button listener
        container.querySelectorAll('.btn-my-apt-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                const aptId = btn.getAttribute('data-id');
                if (confirm('¿Deseas cancelar esta cita?')) {
                    window.dataManager.updateAppointmentStatus(aptId, 'cancelled');
                    renderMyAppointments();
                }
            });
        });
    }

    // =========================================================================
    // 7. ACCOUNT TAB (LOGIN, REGISTER, PROFILE)
    // =========================================================================
    function renderAccountTab() {
        if (!window.dataManager && window.SpaDataManager) {
            window.dataManager = new window.SpaDataManager();
        }
        if (!window.dataManager) return;
        const currentClient = window.dataManager.getCurrentClient();
        const unauthView = document.getElementById('auth-unauthenticated-view');
        const authView = document.getElementById('auth-authenticated-view');
        const errorBox = document.getElementById('auth-error-box');
        errorBox.style.display = 'none';

        if (currentClient) {
            unauthView.style.display = 'none';
            authView.style.display = 'block';

            document.getElementById('profile-name-display').textContent = currentClient.name;
            document.getElementById('profile-email-display').textContent = currentClient.email;
            document.getElementById('profile-phone-display').textContent = currentClient.phone;
            document.getElementById('profile-avatar-display').src = currentClient.avatar;

            const myApts = window.dataManager.getClientAppointments(currentClient.id, currentClient.email, currentClient.phone);
            document.getElementById('profile-total-appointments').textContent = `${myApts.length} cita(s)`;
        } else {
            unauthView.style.display = 'block';
            authView.style.display = 'none';
        }
    }

    // Segmented tab switch between Login and Register
    function showLoginForm() {
        document.getElementById('btn-tab-login')?.classList.add('active');
        document.getElementById('btn-tab-register')?.classList.remove('active');
        document.getElementById('form-login-container').style.display = 'block';
        document.getElementById('form-register-container').style.display = 'none';
        const forgotEl = document.getElementById('form-forgot-container');
        if (forgotEl) forgotEl.style.display = 'none';
        document.getElementById('auth-error-box').style.display = 'none';
    }

    function showRegisterForm() {
        document.getElementById('btn-tab-register')?.classList.add('active');
        document.getElementById('btn-tab-login')?.classList.remove('active');
        document.getElementById('form-login-container').style.display = 'none';
        document.getElementById('form-register-container').style.display = 'block';
        const forgotEl = document.getElementById('form-forgot-container');
        if (forgotEl) forgotEl.style.display = 'none';
        document.getElementById('auth-error-box').style.display = 'none';
    }

    function showForgotForm() {
        document.getElementById('btn-tab-login')?.classList.remove('active');
        document.getElementById('btn-tab-register')?.classList.remove('active');
        document.getElementById('form-login-container').style.display = 'none';
        document.getElementById('form-register-container').style.display = 'none';
        const forgotEl = document.getElementById('form-forgot-container');
        if (forgotEl) forgotEl.style.display = 'block';
        document.getElementById('auth-error-box').style.display = 'none';
    }

    document.getElementById('btn-tab-login')?.addEventListener('click', showLoginForm);
    document.getElementById('btn-tab-register')?.addEventListener('click', showRegisterForm);
    document.getElementById('btn-forgot-password-link')?.addEventListener('click', showForgotForm);
    document.getElementById('btn-back-to-login')?.addEventListener('click', showLoginForm);
    document.getElementById('btn-cancel-forgot')?.addEventListener('click', showLoginForm);

    // Image compression utility
    function compressImageFile(file, maxWidth = 250, maxHeight = 250, quality = 0.85) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // Avatar upload on Profile
    document.getElementById('client-avatar-file-input')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const currentClient = window.dataManager.getCurrentClient();
        if (!currentClient) return;

        try {
            const compressedBase64 = await compressImageFile(file);
            const res = window.dataManager.updateClientAvatar(currentClient.id, compressedBase64);
            if (res.success) {
                updateAuthUI();
                alert('¡Foto de perfil actualizada con éxito!');
            }
        } catch (err) {
            alert('Error al procesar la imagen seleccionada.');
        }
    });

    // Edit Client Profile Data Modal Handlers
    document.getElementById('btn-open-edit-client-profile')?.addEventListener('click', () => {
        const currentClient = window.dataManager.getCurrentClient();
        if (!currentClient) return;

        document.getElementById('edit-profile-name').value = currentClient.name || '';
        document.getElementById('edit-profile-phone').value = currentClient.phone || '';
        document.getElementById('edit-profile-email').value = currentClient.email || '';
        document.getElementById('edit-profile-password').value = '';

        const modal = document.getElementById('modal-client-edit-profile');
        if (modal) modal.style.display = 'flex';
    });

    function closeClientEditProfileModal() {
        const modal = document.getElementById('modal-client-edit-profile');
        if (modal) modal.style.display = 'none';
    }

    document.getElementById('btn-close-edit-profile-modal')?.addEventListener('click', closeClientEditProfileModal);
    document.getElementById('btn-cancel-edit-profile')?.addEventListener('click', closeClientEditProfileModal);

    document.getElementById('form-client-edit-profile')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentClient = window.dataManager.getCurrentClient();
        if (!currentClient) return;

        const name = document.getElementById('edit-profile-name').value.trim();
        const phone = document.getElementById('edit-profile-phone').value.trim();
        const email = document.getElementById('edit-profile-email').value.trim();
        const newPassword = document.getElementById('edit-profile-password').value;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Guardando...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
        }

        const payload = { name, phone, email };
        if (newPassword && newPassword.length >= 4) {
            payload.password = newPassword;
        }

        const res = await window.dataManager.updateClient(currentClient.id, payload);
        if (res.success) {
            closeClientEditProfileModal();
            updateAuthUI();
            alert('¡Tus datos personales fueron actualizados y respaldados de forma segura!');
        } else {
            alert(res.message || 'Error al actualizar tus datos');
        }

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Guardar Cambios</span> <i class="fa-solid fa-floppy-disk"></i>';
        }
    });

    // Register avatar preview
    let regAvatarDataUrl = null;
    document.getElementById('reg-avatar-file')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            regAvatarDataUrl = await compressImageFile(file);
            const previewEl = document.getElementById('reg-avatar-preview');
            if (previewEl) previewEl.src = regAvatarDataUrl;
        } catch (err) {
            console.error('Avatar preview error:', err);
        }
    });

    // Login Form Submit
    document.getElementById('client-login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value.trim();
        const password = document.getElementById('login-password').value;
        const errorBox = document.getElementById('auth-error-box');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        const originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Verificando...</span>';
        }

        try {
            const result = await window.dataManager.loginClient(identifier, password);
            if (result.success) {
                errorBox.style.display = 'none';
                document.getElementById('client-login-form').reset();
                updateAuthUI();
                switchTab('tab-my-appointments');
            } else {
                errorBox.textContent = result.message;
                errorBox.style.display = 'block';
            }
        } catch (err) {
            errorBox.textContent = 'Error al conectar con el servidor. Intenta de nuevo.';
            errorBox.style.display = 'block';
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });

    // Register Form Submit
    document.getElementById('client-register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const errorBox = document.getElementById('auth-error-box');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        if (!name || !phone || !email || !password) {
            errorBox.textContent = 'Por favor completa todos los campos requeridos.';
            errorBox.style.display = 'block';
            return;
        }

        const originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Creando cuenta...</span>';
        }

        try {
            if (!window.dataManager && window.SpaDataManager) {
                window.dataManager = new window.SpaDataManager();
            }
            if (!window.dataManager) {
                throw new Error('El gestor de datos no está listo. Recarga la página.');
            }

            const result = await window.dataManager.registerClient({ 
                name, 
                phone, 
                email, 
                password,
                avatar: regAvatarDataUrl || undefined 
            });

            if (result.success) {
                errorBox.style.display = 'none';
                document.getElementById('client-register-form').reset();
                regAvatarDataUrl = null;
                updateAuthUI();
                alert(`¡Bienvenida a LETY LOOK, ${name.split(' ')[0]}! Tu cuenta ha sido creada con éxito.`);
                switchTab('tab-explore');
            } else {
                errorBox.textContent = result.message || 'No se pudo crear la cuenta.';
                errorBox.style.display = 'block';
            }
        } catch (err) {
            console.error('Register submit error:', err);
            errorBox.textContent = (err && err.message) ? err.message : 'Error al registrar la cuenta. Intenta de nuevo.';
            errorBox.style.display = 'block';
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });

    // Forgot Password Form Submit
    document.getElementById('client-forgot-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('forgot-identifier').value.trim();
        const newPassword = document.getElementById('forgot-new-password').value;
        const confirmPassword = document.getElementById('forgot-confirm-password').value;
        const errorBox = document.getElementById('auth-error-box');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        if (!identifier || !newPassword || !confirmPassword) {
            errorBox.textContent = 'Por favor completa todos los campos requeridos.';
            errorBox.style.display = 'block';
            return;
        }

        if (newPassword.length < 4) {
            errorBox.textContent = 'La nueva contraseña debe tener mínimo 4 caracteres.';
            errorBox.style.display = 'block';
            return;
        }

        if (newPassword !== confirmPassword) {
            errorBox.textContent = 'Las contraseñas no coinciden. Por favor verifícalas.';
            errorBox.style.display = 'block';
            return;
        }

        const originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Buscando cuenta...</span>';
        }

        try {
            if (!window.dataManager && window.SpaDataManager) {
                window.dataManager = new window.SpaDataManager();
            }
            if (!window.dataManager) {
                throw new Error('El gestor de datos no está listo aún. Intenta nuevamente.');
            }
            const result = await window.dataManager.resetClientPassword(identifier, newPassword);
            if (result.success) {
                errorBox.style.display = 'none';
                document.getElementById('client-forgot-form')?.reset();
                updateAuthUI();
                const clientName = (result.client && (result.client.name || result.client.clientName)) || 'Cliente';
                const firstName = clientName.split(' ')[0] || 'Cliente';
                alert(`¡Contraseña restablecida con éxito! Bienvenida de nuevo, ${firstName}.`);
                switchTab('tab-my-appointments');
            } else {
                errorBox.textContent = result.message || 'No se pudo actualizar la contraseña.';
                errorBox.style.display = 'block';
            }
        } catch (err) {
            console.error('Password reset submit error:', err);
            errorBox.textContent = (err && err.message) ? `Error: ${err.message}` : 'Error al conectar con la base de datos. Intenta de nuevo.';
            errorBox.style.display = 'block';
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });

    // Profile buttons
    document.getElementById('btn-profile-go-to-appointments')?.addEventListener('click', () => {
        switchTab('tab-my-appointments');
    });

    document.getElementById('btn-client-logout')?.addEventListener('click', () => {
        if (confirm('¿Deseas cerrar tu sesión?')) {
            window.dataManager.logoutClient();
            updateAuthUI();
            switchTab('tab-explore');
        }
    });

    // Theme controlled exclusively by Admin Panel Settings
    const savedTheme = localStorage.getItem('lety_look_theme') || 'default';
    applyClientTheme(savedTheme);

    function applyClientTheme(themeName) {
        if (!themeName || themeName === 'default') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', themeName);
        }
    }

    // Live sync when Firestore updates in real time
    if (window.cloudService) {
        window.cloudService.onSync((collectionName) => {
            if (collectionName === 'settings') {
                try {
                    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
                    if (settings.activeTheme) {
                        applyClientTheme(settings.activeTheme);
                        localStorage.setItem('lety_look_theme', settings.activeTheme);
                    }
                } catch (e) {
                    console.log('Error updating live theme:', e);
                }
            } else if (collectionName === 'clients') {
                updateAuthUI();
                if (clientState.currentTab === 'tab-account') {
                    renderAccountTab();
                }
            } else if (collectionName === 'appointments') {
                if (clientState.currentTab === 'tab-my-appointments') {
                    renderMyAppointments();
                }
            }
        });
    }

    // =========================================================================
    // BOUTIQUE & TIENDA DE PRODUCTOS - PERSISTENT CART & LIVE INVENTORY
    // =========================================================================
    let clientShopSelectedCategory = 'all';

    function getStoredCart() {
        try {
            return JSON.parse(localStorage.getItem('lety_look_client_cart')) || [];
        } catch (e) {
            return [];
        }
    }

    function saveStoredCart(cart) {
        localStorage.setItem('lety_look_client_cart', JSON.stringify(cart));
        updateCartBadgeAndFloatingBar();
    }

    function updateCartBadgeAndFloatingBar() {
        const cart = getStoredCart();
        const totalItems = cart.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
        const totalPrice = cart.reduce((acc, it) => acc + ((Number(it.price) || 0) * (Number(it.qty) || 0)), 0);

        // Header cart badge
        const badge = document.getElementById('header-cart-badge');
        if (badge) {
            if (totalItems > 0) {
                badge.textContent = totalItems > 99 ? '99+' : totalItems;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }

        // Shop banner button text
        const bannerBtnText = document.getElementById('banner-cart-btn-text');
        if (bannerBtnText) {
            bannerBtnText.textContent = `Ver Mi Canasta (${totalItems})`;
        }

        // Top nav shop pill
        const navPill = document.getElementById('nav-shop-cart-pill');
        if (navPill) {
            navPill.textContent = totalItems > 0 ? `${totalItems}` : 'Tienda';
        }

        // Floating bar in shop tab
        const floatingBar = document.getElementById('client-cart-floating-bar');
        const floatingTotal = document.getElementById('client-cart-floating-total');
        if (floatingBar && floatingTotal) {
            if (totalItems > 0 && clientState.currentTab === 'tab-shop') {
                floatingTotal.textContent = `${formatCurrency(totalPrice)} (${totalItems} ${totalItems === 1 ? 'producto' : 'productos'})`;
                floatingBar.style.display = 'flex';
            } else {
                floatingBar.style.display = 'none';
            }
        }
    }

    function getShopCatalog() {
        if (window.dataManager && typeof window.dataManager.getShopProducts === 'function') {
            return window.dataManager.getShopProducts();
        }
        return window.DEFAULT_SHOP_PRODUCTS || [];
    }

    function renderShopClientTab() {
        const grid = document.getElementById('client-shop-products-grid');
        if (!grid) return;
        grid.innerHTML = '';

        let items = getShopCatalog();
        if (clientShopSelectedCategory !== 'all') {
            items = items.filter(p => p.category === clientShopSelectedCategory);
        }

        const cart = getStoredCart();

        items.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'shop-product-card';
            const price = prod.salePrice || prod.price || 0;
            const stock = Number(prod.stock !== undefined ? prod.stock : 10);
            const isOutOfStock = stock <= 0;

            const inCartItem = cart.find(c => c.id === prod.id);
            const inCartQty = inCartItem ? inCartItem.qty : 0;

            card.innerHTML = `
                <div style="display:flex; gap:0.85rem; align-items:flex-start;">
                    <img src="${prod.img}" alt="${prod.name}" style="width:75px; height:75px; border-radius:var(--radius-md); object-fit:cover; border:1px solid var(--border-color); flex-shrink:0;" onerror="this.src='https://ui-avatars.com/api/?name=Prod&background=d45979&color=fff'">
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:0.68rem; font-weight:800; color:var(--gold); text-transform:uppercase; letter-spacing:0.5px;">${prod.category}</span>
                            ${isOutOfStock 
                                ? `<span style="font-size:0.68rem; font-weight:800; color:#ef4444; background:#fee2e2; padding:0.1rem 0.45rem; border-radius:10px;"><i class="fa-solid fa-circle-xmark"></i> Agotado</span>`
                                : `<span style="font-size:0.68rem; font-weight:700; color:#15803d; background:#dcfce7; padding:0.1rem 0.45rem; border-radius:10px;"><i class="fa-solid fa-boxes-stacked"></i> ${stock} disponibles</span>`
                            }
                        </div>
                        <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-main); margin:0.2rem 0 0.25rem; line-height:1.25;">${prod.name}</h4>
                        <div style="display:flex; align-items:baseline; gap:0.5rem;">
                            <span style="font-size:1.05rem; font-weight:800; color:var(--primary);">${formatCurrency(price)}</span>
                            ${inCartQty > 0 ? `<span style="font-size:0.72rem; color:var(--text-secondary); font-weight:700;">(${inCartQty} en canasta)</span>` : ''}
                        </div>
                    </div>
                </div>
                <p style="font-size:0.78rem; color:var(--text-secondary); line-height:1.35; margin:0;">${prod.desc || 'Producto cosmético profesional garantizado de Lety Look Spa.'}</p>
                <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; border-top:1px solid var(--border-color); padding-top:0.75rem; margin-top:0.25rem;">
                    <div class="shop-qty-control" style="${isOutOfStock ? 'opacity:0.4; pointer-events:none;' : ''}">
                        <button class="shop-qty-btn btn-client-qty-minus" data-id="${prod.id}" type="button">-</button>
                        <input type="text" class="shop-qty-input" id="qty-input-${prod.id}" value="1" readonly>
                        <button class="shop-qty-btn btn-client-qty-plus" data-id="${prod.id}" data-max="${stock}" type="button">+</button>
                    </div>
                    <div style="display:flex; gap:0.4rem;">
                        <button class="btn-book-service btn-client-ask-wa" data-id="${prod.id}" type="button" style="padding:0.45rem 0.65rem; font-size:0.75rem; background:#25d366; border-color:#25d366; color:#fff;" title="Consultar por WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                        </button>
                        <button class="btn-hero-book btn-client-add-cart" data-id="${prod.id}" type="button" style="padding:0.45rem 0.85rem; font-size:0.75rem; ${isOutOfStock ? 'opacity:0.5; cursor:not-allowed;' : ''}" ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fa-solid fa-basket-shopping"></i>
                            <span>${isOutOfStock ? 'Agotado' : 'Agregar'}</span>
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Quantity Plus/Minus listeners in catalog
        grid.querySelectorAll('.btn-client-qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const max = Number(btn.getAttribute('data-max')) || 99;
                const input = document.getElementById(`qty-input-${id}`);
                let val = parseInt(input.value) || 1;
                if (val < max) {
                    val += 1;
                    input.value = val;
                } else {
                    alert(`Solo hay ${max} unidades disponibles de este producto.`);
                }
            });
        });

        grid.querySelectorAll('.btn-client-qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const input = document.getElementById(`qty-input-${id}`);
                let val = parseInt(input.value) || 1;
                if (val > 1) {
                    val -= 1;
                    input.value = val;
                }
            });
        });

        // Add to persistent basket
        grid.querySelectorAll('.btn-client-add-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const products = getShopCatalog();
                const prod = products.find(p => p.id === id);
                if (!prod) return;

                const stock = Number(prod.stock !== undefined ? prod.stock : 10);
                if (stock <= 0) {
                    alert('Este producto se encuentra agotado temporalmente.');
                    return;
                }

                const input = document.getElementById(`qty-input-${id}`);
                const addQty = parseInt(input ? input.value : 1) || 1;

                const cart = getStoredCart();
                const existing = cart.find(it => it.id === prod.id);

                if (existing) {
                    const newTotal = (existing.qty || 0) + addQty;
                    if (newTotal > stock) {
                        alert(`No puedes agregar más de ${stock} unidades (ya tienes ${existing.qty} en tu canasta).`);
                        return;
                    }
                    existing.qty = newTotal;
                } else {
                    if (addQty > stock) {
                        alert(`Solo hay ${stock} unidades disponibles.`);
                        return;
                    }
                    cart.push({
                        id: prod.id,
                        name: prod.name,
                        category: prod.category,
                        price: prod.salePrice || prod.price || 0,
                        img: prod.img,
                        qty: addQty
                    });
                }

                saveStoredCart(cart);
                renderShopClientTab();
                
                // Friendly confirmation banner
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>¡Agregado!</span>';
                btn.style.background = '#10b981';
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.style.background = '';
                }, 1400);
            });
        });

        // Quick WhatsApp inquiry per single item
        grid.querySelectorAll('.btn-client-ask-wa').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const products = getShopCatalog();
                const prod = products.find(p => p.id === id);
                if (!prod) return;
                const qty = parseInt(document.getElementById(`qty-input-${id}`)?.value) || 1;
                const price = prod.salePrice || prod.price || 0;
                const total = price * qty;
                const msg = `¡Hola LETY LOOK! ✨ Vi este producto en la tienda de la App y me interesa consultar disponibilidad:\n\n*${prod.name}*\nCantidad: ${qty} unidad(es)\nValor: ${formatCurrency(total)}\n\n¿Tienen entrega o cómo puedo coordinar la compra? ¡Gracias!`;
                window.open(`https://wa.me/573138869676?text=${encodeURIComponent(msg)}`, '_blank');
            });
        });

        updateCartBadgeAndFloatingBar();
    }

    // =========================================================================
    // CANASTA DE COMPRAS MODAL CONTROLLER (VIEW, EDIT, CHECKOUT)
    // =========================================================================
    function openCartModal() {
        const modal = document.getElementById('modal-client-cart');
        if (!modal) return;

        renderCartModalContent();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeCartModal() {
        const modal = document.getElementById('modal-client-cart');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function renderCartModalContent() {
        const container = document.getElementById('cart-items-container');
        const countLabel = document.getElementById('cart-modal-items-count');
        const checkoutSec = document.getElementById('cart-checkout-section');
        const clearBtn = document.getElementById('btn-clear-cart');

        if (!container) return;
        container.innerHTML = '';

        const cart = getStoredCart();
        const catalog = getShopCatalog();
        const totalItems = cart.reduce((acc, it) => acc + (it.qty || 0), 0);

        if (countLabel) {
            countLabel.textContent = `${totalItems} ${totalItems === 1 ? 'producto guardado' : 'productos guardados'} en canasta`;
        }

        if (cart.length === 0) {
            if (checkoutSec) checkoutSec.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'none';
            container.innerHTML = `
                <div style="text-align:center; padding:2.5rem 1rem;">
                    <div style="width:68px; height:68px; border-radius:50%; background:var(--bg-subtle); color:var(--text-muted); display:flex; align-items:center; justify-content:center; font-size:1.8rem; margin:0 auto 1rem;">
                        <i class="fa-solid fa-basket-shopping"></i>
                    </div>
                    <h4 style="font-family:'Playfair Display', serif; font-size:1.15rem; margin-bottom:0.4rem; color:var(--text-main);">Tu canasta está vacía</h4>
                    <p style="font-size:0.8rem; color:var(--text-secondary); max-width:280px; margin:0 auto 1.25rem;">
                        Agrega los aceites capilares, kits de kapping y productos favoritos para hacer tu pedido cuando gustes.
                    </p>
                    <button type="button" id="btn-empty-cart-go-shop" class="btn-hero-book" style="margin:0 auto; padding:0.65rem 1.25rem; font-size:0.85rem;">
                        <i class="fa-solid fa-store"></i> Ver Productos de la Tienda
                    </button>
                </div>
            `;
            document.getElementById('btn-empty-cart-go-shop')?.addEventListener('click', () => {
                closeCartModal();
                switchTab('tab-shop');
            });
            return;
        }

        // Has items in cart
        if (checkoutSec) checkoutSec.style.display = 'block';
        if (clearBtn) clearBtn.style.display = 'inline-block';

        let subtotal = 0;

        cart.forEach(item => {
            const prod = catalog.find(p => p.id === item.id);
            const stock = prod ? Number(prod.stock !== undefined ? prod.stock : 10) : 99;
            const lineTotal = (item.price || 0) * (item.qty || 1);
            subtotal += lineTotal;

            const row = document.createElement('div');
            row.className = 'cart-item-card';
            row.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://ui-avatars.com/api/?name=Prod&background=d45979&color=fff'">
                <div class="cart-item-info">
                    <h5 class="cart-item-title">${item.name}</h5>
                    <div class="cart-item-price">${formatCurrency(item.price)} <span style="font-size:0.7rem; color:var(--text-muted); font-weight:normal;">/ ud</span></div>
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-main); margin-top:0.15rem;">Subtotal: ${formatCurrency(lineTotal)}</div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.4rem;">
                    <button type="button" class="btn-cart-remove-item" data-id="${item.id}" style="background:none; border:none; color:#ef4444; font-size:0.85rem; cursor:pointer; padding:2px;" title="Eliminar de la canasta">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    <div class="shop-qty-control" style="transform:scale(0.85); transform-origin:right center;">
                        <button class="shop-qty-btn btn-cart-item-minus" data-id="${item.id}" type="button">-</button>
                        <input type="text" class="shop-qty-input" value="${item.qty}" readonly>
                        <button class="shop-qty-btn btn-cart-item-plus" data-id="${item.id}" data-max="${stock}" type="button">+</button>
                    </div>
                </div>
            `;
            container.appendChild(row);
        });

        // Event listeners for cart item quantity modifications
        container.querySelectorAll('.btn-cart-item-plus').forEach(b => {
            b.addEventListener('click', () => {
                const id = b.getAttribute('data-id');
                const max = Number(b.getAttribute('data-max')) || 99;
                const cart = getStoredCart();
                const item = cart.find(it => it.id === id);
                if (item) {
                    if (item.qty < max) {
                        item.qty += 1;
                        saveStoredCart(cart);
                        renderCartModalContent();
                        renderShopClientTab();
                    } else {
                        alert(`Solo hay ${max} unidades disponibles de este producto.`);
                    }
                }
            });
        });

        container.querySelectorAll('.btn-cart-item-minus').forEach(b => {
            b.addEventListener('click', () => {
                const id = b.getAttribute('data-id');
                const cart = getStoredCart();
                const item = cart.find(it => it.id === id);
                if (item) {
                    if (item.qty > 1) {
                        item.qty -= 1;
                        saveStoredCart(cart);
                    } else {
                        if (confirm(`¿Deseas quitar "${item.name}" de tu canasta?`)) {
                            const filtered = cart.filter(it => it.id !== id);
                            saveStoredCart(filtered);
                        }
                    }
                    renderCartModalContent();
                    renderShopClientTab();
                }
            });
        });

        container.querySelectorAll('.btn-cart-remove-item').forEach(b => {
            b.addEventListener('click', () => {
                const id = b.getAttribute('data-id');
                const cart = getStoredCart();
                const filtered = cart.filter(it => it.id !== id);
                saveStoredCart(filtered);
                renderCartModalContent();
                renderShopClientTab();
            });
        });

        // Update summary values
        const subtotalEl = document.getElementById('cart-summary-subtotal');
        const totalEl = document.getElementById('cart-summary-total');
        if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
        if (totalEl) totalEl.textContent = formatCurrency(subtotal);

        // Autofill client contact info if logged in
        const currentClient = window.dataManager ? window.dataManager.getCurrentClient() : null;
        const nameInput = document.getElementById('cart-client-name');
        const phoneInput = document.getElementById('cart-client-phone');
        if (currentClient) {
            if (nameInput && !nameInput.value) nameInput.value = currentClient.name || '';
            if (phoneInput && !phoneInput.value) phoneInput.value = currentClient.phone || '';
        }
    }

    // Toggle delivery option radio styling
    document.querySelectorAll('input[name="cart_delivery"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            const pickupCard = document.getElementById('delivery-opt-pickup');
            const shippingCard = document.getElementById('delivery-opt-shipping');
            const addrGroup = document.getElementById('group-delivery-address');
            const shippingSummary = document.getElementById('cart-summary-shipping');

            if (val === 'pickup') {
                pickupCard?.classList.add('active');
                shippingCard?.classList.remove('active');
                if (addrGroup) addrGroup.style.display = 'none';
                if (shippingSummary) shippingSummary.textContent = 'Gratis';
            } else {
                shippingCard?.classList.add('active');
                pickupCard?.classList.remove('active');
                if (addrGroup) addrGroup.style.display = 'block';
                if (shippingSummary) shippingSummary.textContent = 'A coordinar';
            }
        });
    });

    // Toggle payment option radio styling
    document.querySelectorAll('input[name="cart_payment"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            const transferCard = document.getElementById('pay-opt-transfer');
            const cashCard = document.getElementById('pay-opt-cash');

            if (val === 'transfer') {
                transferCard?.classList.add('active');
                cashCard?.classList.remove('active');
            } else {
                cashCard?.classList.add('active');
                transferCard?.classList.remove('active');
            }
        });
    });

    // Empty entire cart button
    document.getElementById('btn-clear-cart')?.addEventListener('click', () => {
        if (confirm('¿Estás segura de vaciar toda tu canasta de productos?')) {
            saveStoredCart([]);
            renderCartModalContent();
            renderShopClientTab();
        }
    });

    // Open/Close cart modal listeners
    document.getElementById('btn-header-cart')?.addEventListener('click', openCartModal);
    document.getElementById('btn-open-cart-floating')?.addEventListener('click', openCartModal);
    document.getElementById('btn-banner-open-cart')?.addEventListener('click', openCartModal);
    document.getElementById('btn-close-cart-modal')?.addEventListener('click', closeCartModal);

    // Modal background close
    document.getElementById('modal-client-cart')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-client-cart') closeCartModal();
    });

    // =========================================================================
    // CONFIRM ORDER & EFFECT PAYMENT (AUTOMATIC INVENTORY DEDUCTION)
    // =========================================================================
    document.getElementById('btn-confirm-cart-order')?.addEventListener('click', () => {
        const cart = getStoredCart();
        if (cart.length === 0) {
            alert('Tu canasta está vacía.');
            return;
        }

        const nameInput = document.getElementById('cart-client-name');
        const phoneInput = document.getElementById('cart-client-phone');
        const addressInput = document.getElementById('cart-client-address');
        const notesInput = document.getElementById('cart-client-notes');

        const clientName = nameInput ? nameInput.value.trim() : '';
        const clientPhone = phoneInput ? phoneInput.value.trim() : '';
        const deliveryType = document.querySelector('input[name="cart_delivery"]:checked')?.value || 'pickup';
        const paymentMethod = document.querySelector('input[name="cart_payment"]:checked')?.value || 'transfer';

        if (!clientName) {
            alert('Por favor escribe tu nombre completo para el pedido.');
            nameInput?.focus();
            return;
        }

        if (!clientPhone) {
            alert('Por favor escribe tu número de WhatsApp para coordinar la entrega.');
            phoneInput?.focus();
            return;
        }

        const total = cart.reduce((acc, it) => acc + ((it.price || 0) * (it.qty || 1)), 0);

        // PROCESS ORDER & REDUCE INVENTORY AUTOMATICALLY
        if (!window.dataManager) {
            window.dataManager = new window.SpaDataManager();
        }

        const result = window.dataManager.createShopOrder({
            clientName,
            clientPhone,
            deliveryType,
            deliveryAddress: addressInput ? addressInput.value.trim() : '',
            paymentMethod,
            paymentStatus: 'Pagado',
            items: cart,
            total,
            notes: notesInput ? notesInput.value.trim() : ''
        });

        if (result && result.success) {
            const order = result.order;

            // Empty the client's shopping basket
            saveStoredCart([]);
            closeCartModal();

            // Display order success modal
            showOrderSuccessModal(order);

            // Re-render shop view with updated inventory stock
            renderShopClientTab();
        } else {
            alert('Ocurrió un error al procesar el pedido. Por favor intenta nuevamente.');
        }
    });

    function showOrderSuccessModal(order) {
        const modal = document.getElementById('modal-order-success');
        const codeEl = document.getElementById('order-success-code');
        const receiptEl = document.getElementById('order-success-receipt');
        if (!modal) return;

        if (codeEl) codeEl.textContent = `${order.orderNumber} - Pagado`;

        let itemsHtml = order.items.map(it => `
            <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                <span><strong>${it.qty}x</strong> ${it.name}</span>
                <span style="font-weight:700;">${formatCurrency(it.price * it.qty)}</span>
            </div>
        `).join('');

        if (receiptEl) {
            receiptEl.innerHTML = `
                <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.5px;">Resumen del Pedido:</div>
                ${itemsHtml}
                <div style="border-top:1px dashed var(--border-color); margin-top:0.4rem; padding-top:0.4rem; display:flex; justify-content:space-between; font-weight:800; font-size:0.9rem; color:var(--primary);">
                    <span>Total Pagado:</span>
                    <span>${formatCurrency(order.total)}</span>
                </div>
                <div style="margin-top:0.5rem; font-size:0.72rem; color:var(--text-secondary);">
                    <div><strong>Cliente:</strong> ${order.clientName} (${order.clientPhone})</div>
                    <div><strong>Entrega:</strong> ${order.deliveryType === 'pickup' ? 'Recoger en Spa (Calle 139 Sur #49-42)' : `A Domicilio (${order.deliveryAddress || 'A coordinar'})`}</div>
                    <div><strong>Método de Pago:</strong> ${order.paymentMethod === 'transfer' ? 'Transferencia (Bancolombia / Nequi)' : 'Efectivo en Spa'}</div>
                </div>
            `;
        }

        // WhatsApp Share Handler
        const shareBtn = document.getElementById('btn-share-order-whatsapp');
        if (shareBtn) {
            shareBtn.onclick = () => {
                let itemsListText = order.items.map(it => `• ${it.qty}x ${it.name} (${formatCurrency(it.price * it.qty)})`).join('\n');
                const deliveryText = order.deliveryType === 'pickup' ? 'Recoger en el Spa (Calle 139 Sur #49-42, Caldas)' : `Domicilio a: ${order.deliveryAddress || 'Dirección a coordinar'}`;
                const payText = order.paymentMethod === 'transfer' ? 'Transferencia Bancolombia / Nequi' : 'Efectivo en Spa';

                const msg = `¡Hola LETY LOOK! ✨ Acabo de realizar el pedido *${order.orderNumber}* desde la App:\n\n*Cliente:* ${order.clientName}\n*WhatsApp:* ${order.clientPhone}\n*Entrega:* ${deliveryText}\n*Medio de Pago:* ${payText}\n\n*PRODUCTOS:* \n${itemsListText}\n\n*TOTAL EFECTUADO:* ${formatCurrency(order.total)}\n\n¿Me confirman recibido para coordinar la entrega? ¡Muchas gracias!`;
                window.open(`https://wa.me/573138869676?text=${encodeURIComponent(msg)}`, '_blank');
            };
        }

        modal.style.display = 'flex';
    }

    document.getElementById('btn-close-order-success')?.addEventListener('click', () => {
        const modal = document.getElementById('modal-order-success');
        if (modal) modal.style.display = 'none';
    });

    // Direct WhatsApp button in cart modal
    document.getElementById('btn-cart-whatsapp-order')?.addEventListener('click', () => {
        const cart = getStoredCart();
        if (cart.length === 0) return;

        let total = 0;
        let textList = '';
        cart.forEach(it => {
            const sub = (it.price || 0) * (it.qty || 1);
            total += sub;
            textList += `• ${it.qty}x ${it.name} (${formatCurrency(sub)})\n`;
        });

        const currentClient = window.dataManager ? window.dataManager.getCurrentClient() : null;
        const clientName = currentClient ? currentClient.name : (document.getElementById('cart-client-name')?.value || 'Cliente');

        const msg = `¡Hola LETY LOOK! ✨ Te saluda *${clientName}*. Deseo consultar y realizar el siguiente pedido de productos desde la tienda de la App:\n\n${textList}\n*Total Estimado: ${formatCurrency(total)}*\n\n¿Me confirman disponibilidad y forma de entrega? ¡Muchas gracias!`;
        window.open(`https://wa.me/573138869676?text=${encodeURIComponent(msg)}`, '_blank');
    });

    // Category filter click
    document.querySelectorAll('#client-shop-category-slider .cat-btn-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#client-shop-category-slider .cat-btn-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            clientShopSelectedCategory = btn.getAttribute('data-shop-cat') || 'all';
            renderShopClientTab();
        });
    });

    // Listen to inventory update events
    window.addEventListener('lety_shop_updated', () => {
        renderShopClientTab();
        updateCartBadgeAndFloatingBar();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'lety_look_shop_products') {
            renderShopClientTab();
            updateCartBadgeAndFloatingBar();
        }
    });

    // Banner from Explore tab to shop
    document.getElementById('btn-banner-go-to-shop')?.addEventListener('click', () => {
        switchTab('tab-shop');
    });

    // Copy Spa Address Action
    document.getElementById('btn-copy-address')?.addEventListener('click', () => {
        const address = 'Calle 139 Sur #49-42, Caldas, Antioquia';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(address).then(() => {
                const btn = document.getElementById('btn-copy-address');
                if (btn) {
                    const originalHtml = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-check" style="color:#10b981;"></i> <span>¡Copiada!</span>';
                    setTimeout(() => { btn.innerHTML = originalHtml; }, 2000);
                }
            }).catch(() => {
                prompt('Dirección del Spa:', address);
            });
        } else {
            prompt('Dirección del Spa:', address);
        }
    });

    // Initial load: Clean guest state unless client specifically logs in
    updateAuthUI();
    switchTab('tab-explore');
});
