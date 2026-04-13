import sequelize from '../config/database.js';
import Category from '../models/Category.js';

const categoryData = [
    // Catégories Principales (Groupes)
    { name: 'High-Tech & Info', slug: 'high-tech', description: 'Tout l\'univers technologique', icon: 'fas fa-laptop', parentSlug: null },
    { name: 'Maison & Brico', slug: 'maison', description: 'Équipement pour la maison et le jardin', icon: 'fas fa-home', parentSlug: null },
    { name: 'Mode & Beauté', slug: 'mode', description: 'Vêtements, accessoires et soins', icon: 'fas fa-tshirt', parentSlug: null },
    { name: 'Jeux & Jouets', slug: 'jeux-jouets', description: 'Divertissement pour tous les âges', icon: 'fas fa-gamepad', parentSlug: null },
    { name: 'Culture & Livres', slug: 'culture', description: 'Livres, musique et instruments', icon: 'fas fa-book', parentSlug: null },
    { name: 'Supermarché & +', slug: 'autres', description: 'Épicerie, loisirs et produits divers', icon: 'fas fa-shopping-basket', parentSlug: null },

    // High-Tech & Informatique
    { name: 'Ordinateurs', slug: 'laptop', description: 'Ordinateurs portables et de bureau', icon: 'fas fa-laptop', parentSlug: 'high-tech' },
    { name: 'Composants & RAM', slug: 'composants', description: 'Pièces détachées pour PC', icon: 'fas fa-memory', parentSlug: 'high-tech' },
    { name: 'Tablettes', slug: 'tablettes', description: 'Tablettes tactiles et liseuses', icon: 'fas fa-tablet-alt', parentSlug: 'high-tech' },
    { name: 'Smartphones', slug: 'smartphone', description: 'Téléphones mobiles et smartphones', icon: 'fas fa-mobile-alt', parentSlug: 'high-tech' },
    { name: 'Montres Connectées', slug: 'montres-connectées', description: 'Smartwatches et trackers fitness', icon: 'fas fa-clock', parentSlug: 'high-tech' },
    { name: 'Casques & Enceintes', slug: 'audio', description: 'Équipement audio et son', icon: 'fas fa-headphones', parentSlug: 'high-tech' },
    { name: 'Photo & Drones', slug: 'photo', description: 'Appareils photo et drones', icon: 'fas fa-camera', parentSlug: 'high-tech' },
    { name: 'Téléviseurs', slug: 'tv', description: 'Écrans TV et Smart TV', icon: 'fas fa-tv', parentSlug: 'high-tech' },
    { name: 'Vidéo-proj', slug: 'video', description: 'Vidéoprojecteurs et cinéma maison', icon: 'fas fa-video', parentSlug: 'high-tech' },

    // Maison & Bricolage
    { name: 'Cuisine & Repas', slug: 'cuisine', description: 'Articles de cuisine et art de la table', icon: 'fas fa-utensils', parentSlug: 'maison' },
    { name: 'Meubles & Déco', slug: 'meubles', description: 'Mobilier et décoration intérieure', icon: 'fas fa-couch', parentSlug: 'maison' },
    { name: 'Électroménager', slug: 'electromenager', description: 'Gros et petit électroménager', icon: 'fas fa-blender', parentSlug: 'maison' },
    { name: 'Outillage', slug: 'outillage', description: 'Outils et matériel de bricolage', icon: 'fas fa-tools', parentSlug: 'maison' },
    { name: 'Jardin & Extérieur', slug: 'jardin', description: 'Entretien jardin et mobilier extérieur', icon: 'fas fa-leaf', parentSlug: 'maison' },
    { name: 'Animalerie', slug: 'animalerie', description: 'Accessoires pour vos animaux', icon: 'fas fa-paw', parentSlug: 'maison' },

    // Mode & Beauté
    { name: 'Mode Femme', slug: 'mode-femme', description: 'Vêtements et accessoires pour femmes', icon: 'fas fa-female', parentSlug: 'mode' },
    { name: 'Mode Homme', slug: 'mode-homme', description: 'Vêtements et accessoires pour hommes', icon: 'fas fa-male', parentSlug: 'mode' },
    { name: 'Chaussures', slug: 'chaussures', description: 'Chaussures tout style', icon: 'fas fa-shoe-prints', parentSlug: 'mode' },
    { name: 'Maquillage & Parfum', slug: 'beaute', description: 'Produits de beauté et cosmétiques', icon: 'fas fa-magic', parentSlug: 'mode' },
    { name: 'Bijoux & Montres', slug: 'bijoux', description: 'Bijouterie et horlogerie de luxe', icon: 'fas fa-gem', parentSlug: 'mode' },
    { name: 'Santé & Bien-être', slug: 'sante', description: 'Produits de santé et relaxtion', icon: 'fas fa-heartbeat', parentSlug: 'mode' },
    { name: 'Cheveux', slug: 'cheveux', description: 'Soins capillaires et coiffure', icon: 'fas fa-spa', parentSlug: 'mode' },

    // Jeux & Jouets
    { name: 'Consoles & Jeux', slug: 'gaming', description: 'Jeux vidéo et consoles', icon: 'fas fa-gamepad', parentSlug: 'jeux-jouets' },
    { name: 'Jouets & LEGO', slug: 'jouets', description: 'Jouets pour enfants et LEGO', icon: 'fas fa-shapes', parentSlug: 'jeux-jouets' },
    { name: 'Jeux de société', slug: 'societe', description: 'Jeux de plateau et cartes', icon: 'fas fa-chess-board', parentSlug: 'jeux-jouets' },
    { name: 'Puériculture', slug: 'puericulture', description: 'Articles pour bébé et nourrisson', icon: 'fas fa-baby-carriage', parentSlug: 'jeux-jouets' },
    { name: 'Vêtements Bébé', slug: 'vetements-bebe', description: 'Habits pour bébés', icon: 'fas fa-baby', parentSlug: 'jeux-jouets' },

    // Culture & Livres
    { name: 'Livres', slug: 'livres', description: 'Livres papier et numériques', icon: 'fas fa-book', parentSlug: 'culture' },
    { name: 'Mangas & BD', slug: 'manga', description: 'Bandes dessinées et mangas japonnais', icon: 'fas fa-book-open', parentSlug: 'culture' },
    { name: 'Musique', slug: 'musique', description: 'CD, vinyles et instruments', icon: 'fas fa-music', parentSlug: 'culture' },
    { name: 'Instruments', slug: 'instruments', description: 'Instruments de musique', icon: 'fas fa-guitar', parentSlug: 'culture' },

    // Supermarché & Loisirs
    { name: 'Épicerie & Boissons', slug: 'epicerie', description: 'Produits alimentaires et boissons', icon: 'fas fa-shopping-basket', parentSlug: 'autres' },
    { name: 'Snacks & Café', slug: 'snacks', description: 'Café, snacks et confiseries', icon: 'fas fa-coffee', parentSlug: 'autres' },
    { name: 'Bureau & Papeterie', slug: 'bureau', description: 'Fournitures de bureau', icon: 'fas fa-pencil-alt', parentSlug: 'autres' },
    { name: 'Sports & Fitness', slug: 'sports', description: 'Matériel de sport et fitness', icon: 'fas fa-dumbbell', parentSlug: 'autres' },
    { name: 'Auto & Moto', slug: 'auto', description: 'Entretien auto et moto', icon: 'fas fa-car', parentSlug: 'autres' },
    { name: 'Camping & Outdoor', slug: 'camping', description: 'Équipement de camping', icon: 'fas fa-campground', parentSlug: 'autres' }
];

async function seed() {
    try {
        console.log('--- Restauration Hiérarchique des Catégories ---');

        await sequelize.authenticate();

        // 1. Créer/Mettre à jour toutes les catégories (sans le parentId d'abord)
        for (const data of categoryData) {
            const { parentSlug, ...cat } = data;
            const [record, created] = await Category.findOrCreate({
                where: { slug: cat.slug },
                defaults: cat
            });

            if (!created) {
                await record.update(cat);
            }
        }

        // 2. Mettre à jour les parentId
        console.log('--- Liaison des Catégories Parents ---');
        const allCategories = await Category.findAll();
        const catMap = new Map(allCategories.map(c => [c.slug, c.id]));

        for (const data of categoryData) {
            if (data.parentSlug) {
                const parentId = catMap.get(data.parentSlug);
                if (parentId) {
                    await Category.update(
                        { parentId: parentId },
                        { where: { slug: data.slug } }
                    );
                    console.log(`🔗 Lié : ${data.slug} -> ${data.parentSlug}`);
                }
            }
        }

        console.log('\n✨ Synchronisation hiérarchique terminée !');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Erreur lors de la synchronisation :', error);
        process.exit(1);
    }
}

seed();
