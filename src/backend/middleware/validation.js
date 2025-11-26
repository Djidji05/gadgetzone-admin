/**
 * Middleware de validation des données
 */

/**
 * Valide les données d'inscription
 */
export const validateRegister = (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;
  const errors = [];

  // Validation du prénom
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
    errors.push('Le prénom doit contenir au moins 2 caractères');
  }

  // Validation du nom
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('L\'email n\'est pas valide');
  }

  // Validation du mot de passe
  if (!password || typeof password !== 'string') {
    errors.push('Le mot de passe est requis');
  } else if (password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }

  // Validation du rôle
  if (role && !['user', 'admin'].includes(role)) {
    errors.push('Le rôle doit être "user" ou "admin"');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Les données fournies ne sont pas valides',
      errors
    });
  }

  next();
};

/**
 * Valide les données de connexion
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('L\'email n\'est pas valide');
  }

  // Validation du mot de passe
  if (!password || typeof password !== 'string') {
    errors.push('Le mot de passe est requis');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Les données fournies ne sont pas valides',
      errors
    });
  }

  next();
};

/**
 * Valide les données de produit
 */
export const validateProduct = (req, res, next) => {
  const { name, description, price, stock, category_id } = req.body;
  const errors = [];

  // Validation du nom
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Le nom du produit doit contenir au moins 2 caractères');
  }

  // Validation de la description
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('La description doit contenir au moins 10 caractères');
  }

  // Validation du prix
  if (price === undefined || price === null) {
    errors.push('Le prix est requis');
  } else if (isNaN(price) || parseFloat(price) < 0) {
    errors.push('Le prix doit être un nombre positif');
  }

  // Validation du stock
  if (stock !== undefined && stock !== null) {
    if (isNaN(stock) || parseInt(stock) < 0) {
      errors.push('Le stock doit être un nombre entier positif');
    }
  }

  // Validation de la catégorie
  if (category_id !== undefined && category_id !== null) {
    if (isNaN(category_id) || parseInt(category_id) < 1) {
      errors.push('L\'ID de la catégorie doit être un nombre entier positif');
    }
  }

  // Validation de l'URL de l'image si présente
  if (req.body.image_url) {
    try {
      new URL(req.body.image_url);
    } catch {
      errors.push('L\'URL de l\'image n\'est pas valide');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Les données du produit ne sont pas valides',
      errors
    });
  }

  next();
};

/**
 * Valide les données de client
 */
export const validateClient = (req, res, next) => {
  const { name, email, phone, address } = req.body;
  const errors = [];

  // Validation du nom
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Le nom du client doit contenir au moins 2 caractères');
  }

  // Validation de l'adresse
  if (address && (typeof address !== 'string' || address.trim().length < 5)) {
    errors.push('L\'adresse doit contenir au moins 5 caractères');
  }

  // Validation de l'email (optionnel mais doit être valide si fourni)
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('L\'email n\'est pas valide');
    }
  }

  // Validation du téléphone (optionnel mais doit être valide si fourni)
  if (phone) {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      errors.push('Le numéro de téléphone n\'est pas valide');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Les données du client ne sont pas valides',
      errors
    });
  }

  next();
};

/**
 * Valide les données de commande
 */
export const validateOrder = (req, res, next) => {
  const { client_id, items, status } = req.body;
  const errors = [];

  // Validation du client
  if (!client_id || isNaN(client_id) || parseInt(client_id) < 1) {
    errors.push('L\'ID du client est requis et doit être valide');
  }

  // Validation des items
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('La commande doit contenir au moins un article');
  } else {
    items.forEach((item, index) => {
      if (!item.product_id || isNaN(item.product_id) || parseInt(item.product_id) < 1) {
        errors.push(`L'item ${index + 1}: l'ID du produit est requis et doit être valide`);
      }

      if (!item.quantity || isNaN(item.quantity) || parseInt(item.quantity) < 1) {
        errors.push(`L'item ${index + 1}: la quantité doit être un nombre entier positif`);
      }

      if (!item.price || isNaN(item.price) || parseFloat(item.price) < 0) {
        errors.push(`L'item ${index + 1}: le prix doit être un nombre positif`);
      }
    });
  }

  // Validation du statut
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    errors.push(`Le statut doit être l'un des suivants: ${validStatuses.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Les données de la commande ne sont pas valides',
      errors
    });
  }

  next();
};

/**
 * Valide le changement de mot de passe
 */
export const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  // Validation du mot de passe actuel
  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push('Le mot de passe actuel est requis');
  }

  // Validation du nouveau mot de passe
  if (!newPassword || typeof newPassword !== 'string') {
    errors.push('Le nouveau mot de passe est requis');
  } else if (newPassword.length < 8) {
    errors.push('Le nouveau mot de passe doit contenir au moins 8 caractères');
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    errors.push('Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Les données de changement de mot de passe ne sont pas valides',
      errors
    });
  }

  next();
};

/**
 * Valide les données de mise à jour du profil
 */
export const validateProfileUpdate = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  // Validation du nom
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('L\'email n\'est pas valide');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Les données du profil ne sont pas valides',
      errors
    });
  }

  next();
};
