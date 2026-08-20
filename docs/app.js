// app.js
document.addEventListener('DOMContentLoaded', () => {
    const sectionsContainer = document.getElementById('sections-container');
    const navList = document.querySelector('.fr-nav__list');
    
    let years = [];
    let currentYearIndex = 0;
    let sections = [];
    let navButtons = [];

    // 1. Fonction Fetch pour récupérer les données JSON
    async function fetchInvestigationData() {
        try {
            const response = await fetch('investigation.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            buildDynamicUI(data.timeline);
        } catch (error) {
            console.error('Erreur lors du chargement des données JSON:', error);
            if (sectionsContainer) {
                sectionsContainer.innerHTML = `<div class="fr-alert fr-alert--error">
                    <h3 class="fr-alert__title">Erreur de chargement</h3>
                    <p>Impossible de charger les données de l'instruction (investigation.json).</p>
                </div>`;
            }
        }
    }

    // 2. Génération dynamique du DOM (Navbar et Sections)
    function buildDynamicUI(timeline) {
        if (sectionsContainer) sectionsContainer.innerHTML = '';
        if (navList) navList.innerHTML = '';

        timeline.forEach((item, index) => {
            years.push(item.year);

            // Création du bouton de navigation
            if (navList) {
                const li = document.createElement('li');
                li.className = 'fr-nav__item';
                li.innerHTML = `<button class="fr-nav__btn nav-year-btn" aria-expanded="false" data-target-year="${item.year}">${item.year}</button>`;
                navList.appendChild(li);
            }

            // Génération des listes HTML à partir du JSON
            const entitiesHtml = item.entities.map(e => `<span class="fr-badge fr-badge--info fr-mr-1v">${e}</span>`).join('');
            const mechanismsHtml = item.accounting_mechanisms.map(mech => `<li>${mech}</li>`).join('');
            const filesHtml = item.files.map(file => `<li><a class="fr-link fr-link--download" href="https://github.com/ia-local/1378/docs/data/${item.year.substring(0,4)}/${file}" download>${file}</a></li>`).join('');

            // Génération du tableau financier si les données existent
            let financialHtml = '';
            if (item.financial_data) {
                financialHtml = '<div class="fr-grid-row fr-grid-row--gutters fr-mb-3w">';
                for (const [entityCode, values] of Object.entries(item.financial_data)) {
                    financialHtml += `
                    <div class="fr-col-12 fr-col-md-6">
                        <div class="fr-tile fr-tile--sm">
                            <div class="fr-tile__body">
                                <h4 class="fr-tile__title">Entité ${entityCode}</h4>
                                <div class="fr-tile__desc">
                                    <ul class="fr-list fr-list--sm fr-mt-1w">
                                        ${Object.entries(values).map(([key, val]) => `<li><strong>${key.replace(/_/g, ' ')} :</strong> ${val}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }
                financialHtml += '</div>';
            }

            // Création de la section
            if (sectionsContainer) {
                const section = document.createElement('section');
                section.className = 'fr-mb-4w year-section';
                section.id = `year-${item.year}`;
                section.setAttribute('data-year', item.year);

                section.innerHTML = `
                    <span class="year-badge">Exercice ${item.year}</span>
                    <div class="fr-card fr-card--no-border">
                        <div class="fr-card__body">
                            <h3 class="fr-card__title">${item.title}</h3>
                            <div class="fr-mb-2w">${entitiesHtml}</div>
                            <p class="fr-card__desc">${item.description}</p>
                            
                            <h4 class="fr-h6 fr-mt-2w">Mécanismes comptables identifiés :</h4>
                            <ul class="fr-list">${mechanismsHtml}</ul>
                            
                            ${financialHtml}

                            <figure class="fr-content-media screenshot-placeholder trigger-modal" data-img-src="" data-img-alt="Capture Bilan ${item.year}" data-img-desc="Analyse du Bilan ${item.year} - ${item.title}">
                                <span class="fr-icon-search-line fr-icon--lg" aria-hidden="true"></span>
                                <br><em>[Cliquer pour prévisualiser l'extrait comptable ${item.year}]</em>
                            </figure>

                            <h4 class="fr-h6 fr-mt-3w">Pièces à conviction :</h4>
                            <ul class="fr-links-group">
                                ${filesHtml}
                            </ul>
                        </div>
                    </div>
                `;
                sectionsContainer.appendChild(section);
            }
        });

        // 3. Mise à jour des références DOM après la création
        sections = document.querySelectorAll('.year-section');
        navButtons = document.querySelectorAll('.nav-year-btn');

        // 4. Attachement des écouteurs sur la nouvelle navbar
        navButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => window.routeToYear(index));
        });

        // Ré-attacher la modale aux nouveaux éléments
        bindModalTriggers();

        // 5. Initialisation de l'affichage sur la première année
        window.routeToYear(0);
    }

    // Fonction de routage principal (inchangée dans sa logique)
    window.routeToYear = function(index) {
        if (index < 0 || index >= years.length) return;
        
        currentYearIndex = index;
        const targetYear = years[currentYearIndex];

        // Mettre à jour l'affichage des sections
        sections.forEach(section => {
            if (section.getAttribute('data-year') === targetYear) {
                section.classList.add('is-active');
            } else {
                section.classList.remove('is-active');
            }
        });

        // Mettre à jour la surbrillance dans la navbar
        navButtons.forEach(btn => {
            if (btn.getAttribute('data-target-year') === targetYear) {
                btn.setAttribute('aria-expanded', 'true');
            } else {
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Déclencher l'événement pour la pagination
        document.dispatchEvent(new CustomEvent('yearChanged', { detail: { currentIndex: currentYearIndex, total: years.length }}));
    };

    // Fonction pour lier les clics aux modales générées dynamiquement
    function bindModalTriggers() {
        const triggers = document.querySelectorAll('.trigger-modal');
        const modalImage = document.getElementById('modal-image');
        const modalCaption = document.getElementById('modal-caption');

        triggers.forEach(trigger => {
            trigger.addEventListener('click', function() {
                const imgSrc = this.getAttribute('data-img-src');
                const imgAlt = this.getAttribute('data-img-alt');
                const imgDesc = this.getAttribute('data-img-desc');

                if (modalImage) {
                    modalImage.src = imgSrc || '';
                    modalImage.alt = imgAlt || 'Document comptable';
                }
                if (modalCaption) {
                    modalCaption.textContent = imgDesc || '';
                }

                const modalElement = document.getElementById('preview-modal');
                if (modalElement && window.dsfr) {
                   window.dsfr(modalElement).modal.disclose();
                }
            });
        });
    }

    // Démarrage de l'application
    fetchInvestigationData();
});