import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Interface pour les attributs du modèle
interface ProductAttributes {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  category?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// Interface pour les attributs optionnels lors de la création
interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'description' | 'imageUrl' | 'category' | 'deletedAt'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public price!: number;
  public stock!: number;
  public imageUrl!: string | null;
  public category!: string | null;
  
  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Le nom du produit est requis',
        },
        len: {
          args: [2, 100],
          msg: 'Le nom doit contenir entre 2 et 100 caractères',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'Le prix doit être un nombre décimal',
        },
        min: {
          args: [0],
          msg: 'Le prix ne peut pas être négatif',
        },
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Le stock doit être un nombre entier',
        },
        min: {
          args: [0],
          msg: 'Le stock ne peut pas être négatif',
        },
      },
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'URL de l\'image invalide',
        },
      },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    paranoid: true, // Active le soft delete
    indexes: [
      {
        name: 'products_name_index',
        fields: ['name'],
      },
      {
        name: 'products_category_index',
        fields: ['category'],
      },
    ],
  }
);

export default Product;
