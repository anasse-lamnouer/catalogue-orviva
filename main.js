window.produitsData = window.produitsData || [];

const defaultData = [
];

if (window.produitsData.length === 0) {
    window.produitsData = defaultData;
}
const tableBody = document.getElementById("table-body");
const searchBar = document.getElementById("search-bar");
const categoryFilter = document.getElementById("category-filter");
const subcategoryFilter = document.getElementById("subcategory-filter");
const paginationControls = document.getElementById("pagination-controls");
const productCount = document.getElementById("product-count");
const categoryCount = document.getElementById("category-count");
const pageInfo = document.getElementById("page-info");
const clearFiltersBtn = document.getElementById("clear-filters");

const modal = document.getElementById("product-modal");
const closeModalBtn = document.getElementById("close-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");

let donneesActuelles = [];
let pageActuelle = 1;
const articlesParPage = 50;

function afficherTableau(donnees, page = 1) {
    tableBody.innerHTML = "";
    donneesActuelles = donnees;
    pageActuelle = page;

    const total = donnees.length;
    productCount.textContent = total;

    // Mise à jour du nombre de catégories
    const cats = new Set(donnees.map(d => d.categorie));
    categoryCount.textContent = cats.size;

    if (total === 0) {
        tableBody.innerHTML = `
                    <tr>
                        <td colspan="6">
                            <div class="empty-state">
                                <div class="empty-icon">🔍</div>
                                <h3>Aucun produit trouvé</h3>
                                <p>Essayez de modifier vos critères de recherche</p>
                            </div>
                        </td>
                    </tr>
                `;
        paginationControls.innerHTML = "";
        pageInfo.textContent = "Page 0";
        return;
    }

    const indexDebut = (page - 1) * articlesParPage;
    const indexFin = Math.min(indexDebut + articlesParPage, total);
    const donneesPage = donnees.slice(indexDebut, indexFin);

    donneesPage.forEach((ligne, index) => {
        const indexReel = indexDebut + index;
        const numeroLigne = indexReel + 1;

        const titreA = ligne.itemA?.titre || "Article A";
        const titreB = ligne.itemB?.titre || "Article B";
        const titreC = ligne.itemC?.titre || "Article C";

        const tr = document.createElement("tr");
        tr.style.animationDelay = `${(index % 10) * 0.03}s`;
        tr.className = "fade-in";

        tr.innerHTML = `
                    <td class="row-number" data-label="# ">${numeroLigne}</td>
                    <td class="category-cell" data-label="Catégorie ">${ligne.categorie}</td>
                    <td class="subcategory-cell" data-label="Sous-Catégorie ">${ligne.sousCategorie}</td>
                    <td data-label="Orviva ">
                        <div class="product-card" onclick="preparerModale(${indexReel}, 'itemA', 'Orviva')">
                            <div class="product-image-wrapper">
                                <img class="product-image" src="${ligne.itemA.img || 'https://via.placeholder.com/52/e9edf2/aaa?text=A'}" alt="${titreA}" loading="lazy">
                            </div>
                            <div class="product-info">
                                <span class="product-label">Orviva</span>
                                <span class="product-title">${titreA}</span>
                                <span class="product-price">${ligne.itemA.prix || '—'}</span>
                                ${ligne.itemA.lien ? `<a href="${ligne.itemA.lien}" target="_blank" class="product-details-link" onclick="event.stopPropagation();"><i class="fas fa-arrow-right"></i> Détails</a>` : ''}
                            </div>
                        </div>
                    </td>
                    <td data-label="Locamed ">
                        <div class="product-card" onclick="preparerModale(${indexReel}, 'itemB', 'Locamed')">
                            <div class="product-image-wrapper">
                                <img class="product-image" src="${ligne.itemB.img || 'https://via.placeholder.com/52/e9edf2/aaa?text=B'}" alt="${titreB}" loading="lazy">
                            </div>
                            <div class="product-info">
                                <span class="product-label">Locamed</span>
                                <span class="product-title">${titreB}</span>
                                <span class="product-price">${ligne.itemB.prix || '—'}</span>
                                ${ligne.itemB.lien ? `<a href="${ligne.itemB.lien}" target="_blank" class="product-details-link" onclick="event.stopPropagation();"><i class="fas fa-arrow-right"></i> Détails</a>` : ''}
                            </div>
                        </div>
                    </td>
                    <td data-label="Autres ">
                        <div class="product-card" onclick="preparerModale(${indexReel}, 'itemC', 'Autre Ste')">
                            <div class="product-image-wrapper">
                                <img class="product-image" src="${ligne.itemC.img || 'https://via.placeholder.com/52/e9edf2/aaa?text=C'}" alt="${titreC}" loading="lazy">
                            </div>
                            <div class="product-info">
                                <span class="product-label">Autres</span>
                                <span class="product-title">${titreC}</span>
                                <span class="product-price">${ligne.itemC.prix || '—'}</span>
                                ${ligne.itemC.lien ? `<a href="${ligne.itemC.lien}" target="_blank" class="product-details-link" onclick="event.stopPropagation();"><i class="fas fa-arrow-right"></i> Détails</a>` : ''}
                            </div>
                        </div>
                    </td>
                `;
        tableBody.appendChild(tr);
    });

    genererBoutonsPagination(total);
    pageInfo.textContent = `Page ${page} / ${Math.ceil(total / articlesParPage) || 1}`;
}

function genererBoutonsPagination(totalArticles) {
    paginationControls.innerHTML = "";
    const nombreDePages = Math.ceil(totalArticles / articlesParPage);

    if (nombreDePages <= 1) return;
    if (pageActuelle > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.classList.add("pagination-btn", "pagination-arrow");
        prevBtn.addEventListener("click", () => {
            afficherTableau(donneesActuelles, pageActuelle - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationControls.appendChild(prevBtn);
    }

    const maxVisible = 7;
    let startPage = Math.max(1, pageActuelle - Math.floor(maxVisible / 2));
    let endPage = Math.min(nombreDePages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        const firstBtn = document.createElement("button");
        firstBtn.textContent = "1";
        firstBtn.classList.add("pagination-btn");
        firstBtn.addEventListener("click", () => {
            afficherTableau(donneesActuelles, 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationControls.appendChild(firstBtn);
        if (startPage > 2) {
            const dots = document.createElement("span");
            dots.textContent = "…";
            dots.style.cssText = "padding: 0 4px; color: var(--text-muted); font-weight: 600;";
            paginationControls.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("pagination-btn");
        if (i === pageActuelle) btn.classList.add("active");
        btn.addEventListener("click", () => {
            afficherTableau(donneesActuelles, i);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationControls.appendChild(btn);
    }

    if (endPage < nombreDePages) {
        if (endPage < nombreDePages - 1) {
            const dots = document.createElement("span");
            dots.textContent = "…";
            dots.style.cssText = "padding: 0 4px; color: var(--text-muted); font-weight: 600;";
            paginationControls.appendChild(dots);
        }
        const lastBtn = document.createElement("button");
        lastBtn.textContent = nombreDePages;
        lastBtn.classList.add("pagination-btn");
        lastBtn.addEventListener("click", () => {
            afficherTableau(donneesActuelles, nombreDePages);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationControls.appendChild(lastBtn);
    }

    if (pageActuelle < nombreDePages) {
        const nextBtn = document.createElement("button");
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.classList.add("pagination-btn", "pagination-arrow");
        nextBtn.addEventListener("click", () => {
            afficherTableau(donneesActuelles, pageActuelle + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationControls.appendChild(nextBtn);
    }
}

function preparerModale(index, itemKey, source) {
    const ligne = donneesActuelles[index];
    if (!ligne) return;
    const item = ligne[itemKey];
    if (!item) return;

    const categorieComplete = `${ligne.categorie} / ${ligne.sousCategorie}`;
    ouvrirModale(
        source, 
        categorieComplete, 
        item.titre || "Produit", 
        item.prix || "—", 
        item.img || "", 
        item.ref || "",
        item.lien || ""
    );
}

function ouvrirModale(source, categorie, titre, prix, imageSrc, reference, lien) {
    document.getElementById("modal-source").textContent = source;
    document.getElementById("modal-cat").textContent = categorie;
    document.getElementById("modal-title").textContent = titre;
    document.getElementById("modal-price").innerHTML = `${prix}`;
    
    const modalImg = document.getElementById("modal-img");
    modalImg.src = imageSrc || "https://via.placeholder.com/160/e9edf2/aaa?text=Image";
    modalImg.alt = titre || "Image du produit";

    const badge = document.getElementById("modal-badge");
    const sourceMap = { "Orviva": "★", "Locamed": "◆", "Autre Ste": "●" };
    badge.textContent = sourceMap[source] || "★";

    const modalRefElement = document.getElementById("modal-ref");
    if (reference && reference.trim() !== "") {
        modalRefElement.innerHTML = `<i class="fas fa-barcode"></i> ${reference}`;
        modalRefElement.style.display = "flex";
    } else {
        modalRefElement.style.display = "none";
    }

    const modalLinkContainer = document.getElementById("modal-link-container");
    const modalLink = document.getElementById("modal-link");
    
    if (lien && lien.trim() !== "") {
        modalLink.href = lien;
        modalLinkContainer.style.display = "block";
    } else {
        modalLinkContainer.style.display = "none";
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function fermerModale() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
}

closeModalBtn.addEventListener("click", fermerModale);
modalCloseBtn.addEventListener("click", fermerModale);
modal.addEventListener("click", (e) => {
    if (e.target === modal) fermerModale();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermerModale();
});

function initialiserFiltreCategories() {
    categoryFilter.innerHTML = '<option value="all">Toutes les catégories</option>';
    const categories = [...new Set(window.produitsData.map(item => item.categorie))].sort();
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

function actualiserFiltreSousCategories() {
    const categorieSelectionnee = categoryFilter.value;
    subcategoryFilter.innerHTML = '<option value="all">Toutes les sous-catégories</option>';

    let sousCategories = [];
    if (categorieSelectionnee === "all") {
        sousCategories = [...new Set(window.produitsData.map(item => item.sousCategorie))];
    } else {
        sousCategories = [...new Set(
            window.produitsData
                .filter(item => item.categorie === categorieSelectionnee)
                .map(item => item.sousCategorie)
        )];
    }

    sousCategories.sort().forEach(subCat => {
        const option = document.createElement("option");
        option.value = subCat;
        option.textContent = subCat;
        subcategoryFilter.appendChild(option);
    });
}

function filtrerProduits() {
    const texteRecherche = searchBar.value.toLowerCase().trim();
    const categorieSelectionnee = categoryFilter.value;
    const sousCategorieSelectionnee = subcategoryFilter.value;

    const resultatsFiltres = window.produitsData.filter(produit => {
        const correspondCategorie = (categorieSelectionnee === "all" || produit.categorie === categorieSelectionnee);
        const correspondSousCategorie = (sousCategorieSelectionnee === "all" || produit.sousCategorie === sousCategorieSelectionnee);

        const titreA = (produit.itemA?.titre || "").toLowerCase();
        const titreB = (produit.itemB?.titre || "").toLowerCase();
        const titreC = (produit.itemC?.titre || "").toLowerCase();
        const refA = (produit.itemA?.ref || "").toLowerCase();
        const refB = (produit.itemB?.ref || "").toLowerCase();
        const refC = (produit.itemC?.ref || "").toLowerCase();

        const correspondTexte =
            produit.categorie.toLowerCase().includes(texteRecherche) ||
            produit.sousCategorie.toLowerCase().includes(texteRecherche) ||
            titreA.includes(texteRecherche) ||
            titreB.includes(texteRecherche) ||
            titreC.includes(texteRecherche) ||
            refA.includes(texteRecherche) ||
            refB.includes(texteRecherche) ||
            refC.includes(texteRecherche);

        return correspondCategorie && correspondSousCategorie && correspondTexte;
    });

    afficherTableau(resultatsFiltres, 1);
}

function resetFilters() {
    searchBar.value = "";
    categoryFilter.value = "all";
    actualiserFiltreSousCategories();
    subcategoryFilter.value = "all";
    filtrerProduits();
}

categoryFilter.addEventListener("change", () => {
    actualiserFiltreSousCategories();
    filtrerProduits();
});

searchBar.addEventListener("input", filtrerProduits);
subcategoryFilter.addEventListener("change", filtrerProduits);
clearFiltersBtn.addEventListener("click", resetFilters);

document.addEventListener("DOMContentLoaded", () => {
    // Vérification des liens dans les données (optionnel - pour déboguer)
    console.log("Données chargées :", window.produitsData.length, "produits");
    
    let produitsAvecLiens = 0;
    window.produitsData.forEach((produit, index) => {
        if (produit.itemA?.lien) produitsAvecLiens++;
        if (produit.itemB?.lien) produitsAvecLiens++;
        if (produit.itemC?.lien) produitsAvecLiens++;
    });
    console.log("Produits avec liens :", produitsAvecLiens);
    
    initialiserFiltreCategories();
    actualiserFiltreSousCategories();
    afficherTableau(window.produitsData, 1);
});

window.preparerModale = preparerModale;


document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-bar');
    const clearSearchBtn = document.getElementById('clear-search');

    if (searchInput && clearSearchBtn) {
        // Afficher ou masquer la croix selon si l'input contient du texte
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() !== '') {
                clearSearchBtn.style.display = 'flex';
            } else {
                clearSearchBtn.style.display = 'none';
            }
        });

        // Vider la barre de recherche lors du clic sur la croix
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            searchInput.focus(); // Redonne le focus à la barre de recherche

            // Déclenche l'événement 'input' pour mettre à jour votre tableau de filtres
            searchInput.dispatchEvent(new Event('input'));
        });
    }
});