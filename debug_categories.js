
import { Category, Product } from './src/backend/models/index.js';
import ProductRepository from './src/backend/repositories/ProductRepository.js';

async function testCategoryFilter() {
    const repo = new ProductRepository();

    // 1. Find all categories
    const categories = await Category.findAll({ raw: true });
    console.log(`Found ${categories.length} categories.`);

    // 2. Map parents and children
    const parentChildrenMap = {};
    categories.forEach(cat => {
        if (cat.parentId) {
            if (!parentChildrenMap[cat.parentId]) parentChildrenMap[cat.parentId] = [];
            parentChildrenMap[cat.parentId].push(cat.id);
        }
    });

    for (const parentId in parentChildrenMap) {
        const parentName = categories.find(c => c.id == parentId)?.name;
        if (categories.find(c => c.id == parentId)?.parentId) continue; // Skip if it's not a top-level parent for this summary

        console.log(`\nTesting Parent: ${parentName} (ID: ${parentId})`);

        // Recursive helper to get all descendant IDs
        const getAllDescendantIds = async (pId) => {
            const children = await Category.findAll({
                where: { parentId: pId },
                attributes: ['id', 'name'],
                raw: true
            });
            let descendants = children;
            for (const child of children) {
                const grandChildren = await getAllDescendantIds(child.id);
                descendants = descendants.concat(grandChildren);
            }
            return descendants;
        };

        const descendants = await getAllDescendantIds(parentId);
        const descendantIds = descendants.map(d => d.id);
        const descendantNames = descendants.map(d => d.name);

        console.log(`Descendant IDs: ${descendantIds.join(', ')}`);
        console.log(`Descendant Names: ${descendantNames.join(', ')}`);

        // Search with parent ID
        const result = await repo.search({ category: parentId });
        console.log(`Total products found (parent + descendants): ${result.count}`);

        const categoryIdsInResult = [...new Set(result.rows.map(p => p.category_id))];
        console.log(`Category IDs present in results: ${categoryIdsInResult.join(', ')}`);
    }
}

testCategoryFilter().catch(console.error).finally(() => process.exit());
